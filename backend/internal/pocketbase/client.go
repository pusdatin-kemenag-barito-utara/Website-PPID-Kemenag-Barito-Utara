package pocketbase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

// ParsePBTime safely parses PocketBase date strings (e.g. "2006-01-02 15:04:05.000Z").
func ParsePBTime(raw interface{}) time.Time {
	if raw == nil {
		return time.Now()
	}
	switch v := raw.(type) {
	case string:
		if v == "" {
			return time.Now()
		}
		formats := []string{
			"2006-01-02 15:04:05.000Z",
			"2006-01-02 15:04:05.000",
			"2006-01-02 15:04:05Z",
			"2006-01-02 15:04:05",
			time.RFC3339,
			time.RFC3339Nano,
		}
		for _, f := range formats {
			if t, err := time.Parse(f, v); err == nil {
				return t
			}
		}
	case time.Time:
		return v
	}
	return time.Now()
}

// Client provides access to the PocketBase REST API.
type Client struct {
	BaseURL       string
	AdminEmail    string
	AdminPassword string
	httpClient    *http.Client

	adminTokenMu sync.RWMutex
	adminToken   string
	adminExpires time.Time
}

// NewClient initializes a Client with pooled HTTP transport.
func NewClient(baseURL, adminEmail, adminPassword string) *Client {
	cleanURL := strings.TrimRight(baseURL, "/")
	if cleanURL == "" {
		cleanURL = "https://db-ppid.kemenag-baritoutara.com"
	}

	tr := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   50,
		MaxConnsPerHost:       100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		ForceAttemptHTTP2:     true,
	}

	return &Client{
		BaseURL:       cleanURL,
		AdminEmail:    adminEmail,
		AdminPassword: adminPassword,
		httpClient: &http.Client{
			Timeout:   15 * time.Second,
			Transport: tr,
		},
	}
}

// GetAdminToken obtains or returns a cached PocketBase superuser/admin token.
func (c *Client) GetAdminToken() (string, error) {
	c.adminTokenMu.RLock()
	if c.adminToken != "" && time.Now().Before(c.adminExpires) {
		token := c.adminToken
		c.adminTokenMu.RUnlock()
		return token, nil
	}
	c.adminTokenMu.RUnlock()

	c.adminTokenMu.Lock()
	defer c.adminTokenMu.Unlock()

	if c.adminToken != "" && time.Now().Before(c.adminExpires) {
		return c.adminToken, nil
	}

	if c.AdminEmail == "" || c.AdminPassword == "" {
		return "", fmt.Errorf("pocketbase admin credentials not configured")
	}

	authBody, _ := json.Marshal(map[string]string{
		"identity": c.AdminEmail,
		"password": c.AdminPassword,
	})

	authURL := c.BaseURL + "/api/collections/_superusers/auth-with-password"
	resp, err := c.httpClient.Post(authURL, "application/json", bytes.NewReader(authBody))
	if err != nil {
		return "", fmt.Errorf("pocketbase admin auth request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("pocketbase admin auth failed (%d): %s", resp.StatusCode, string(respBytes))
	}

	var authRes struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&authRes); err != nil {
		return "", fmt.Errorf("decode admin token response: %w", err)
	}

	c.adminToken = authRes.Token
	c.adminExpires = time.Now().Add(2 * time.Hour)
	return c.adminToken, nil
}

// Request performs an HTTP request to PocketBase with admin auth by default.
func (c *Client) Request(method, path string, query url.Values, body interface{}) (*http.Response, error) {
	fullURL := c.BaseURL + path
	if len(query) > 0 {
		fullURL += "?" + query.Encode()
	}

	var bodyReader io.Reader
	if body != nil {
		bodyBytes, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	req, err := http.NewRequest(method, fullURL, bodyReader)
	if err != nil {
		return nil, err
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	token, err := c.GetAdminToken()
	if err == nil && token != "" {
		req.Header.Set("Authorization", token)
	}

	return c.httpClient.Do(req)
}

// HealthCheck verifies PocketBase is healthy.
func (c *Client) HealthCheck() error {
	resp, err := c.httpClient.Get(c.BaseURL + "/api/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("pocketbase health returned status %d", resp.StatusCode)
	}
	return nil
}

// GetRecord fetches a single record by collection name and ID.
func (c *Client) GetRecord(collection, id string) (map[string]interface{}, error) {
	resp, err := c.Request(http.MethodGet, fmt.Sprintf("/api/collections/%s/records/%s", collection, url.PathEscape(id)), nil, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("not found")
	}
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase get record (%d): %s", resp.StatusCode, string(b))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// ListRecords queries records in a collection with filtering, sorting, and pagination.
func (c *Client) ListRecords(collection string, filter string, sort string, page, perPage int) ([]map[string]interface{}, int, error) {
	q := url.Values{}
	if filter != "" {
		q.Set("filter", filter)
	}
	if sort != "" {
		q.Set("sort", sort)
	}
	if page > 0 {
		q.Set("page", strconv.Itoa(page))
	}
	if perPage > 0 {
		q.Set("perPage", strconv.Itoa(perPage))
	} else {
		q.Set("perPage", "500")
	}

	resp, err := c.Request(http.MethodGet, fmt.Sprintf("/api/collections/%s/records", collection), q, nil)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, 0, fmt.Errorf("pocketbase list records (%d): %s", resp.StatusCode, string(b))
	}

	var listRes struct {
		TotalItems int                      `json:"totalItems"`
		Items      []map[string]interface{} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&listRes); err != nil {
		return nil, 0, err
	}
	return listRes.Items, listRes.TotalItems, nil
}

// CreateRecord inserts a new record into a collection.
func (c *Client) CreateRecord(collection string, data interface{}) (map[string]interface{}, error) {
	resp, err := c.Request(http.MethodPost, fmt.Sprintf("/api/collections/%s/records", collection), nil, data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase create record (%d): %s", resp.StatusCode, string(b))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// UpdateRecord patches an existing record in a collection.
func (c *Client) UpdateRecord(collection, id string, data interface{}) (map[string]interface{}, error) {
	resp, err := c.Request(http.MethodPatch, fmt.Sprintf("/api/collections/%s/records/%s", collection, url.PathEscape(id)), nil, data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("not found")
	}
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("pocketbase update record (%d): %s", resp.StatusCode, string(b))
	}

	var rec map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// DeleteRecord deletes a record by ID from a collection.
func (c *Client) DeleteRecord(collection, id string) error {
	resp, err := c.Request(http.MethodDelete, fmt.Sprintf("/api/collections/%s/records/%s", collection, url.PathEscape(id)), nil, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("not found")
	}
	if resp.StatusCode >= 300 && resp.StatusCode != http.StatusNoContent {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("pocketbase delete record (%d): %s", resp.StatusCode, string(b))
	}
	return nil
}
