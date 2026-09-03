package platform

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	turnstileVerifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
	turnstileTimeout   = 3 * time.Second
)

var turnstileClient = &http.Client{
	Timeout: turnstileTimeout,
	Transport: &http.Transport{
		MaxIdleConns:        50,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,
		DisableKeepAlives:   false,
	},
}

type turnstileResponse struct {
	Success     bool     `json:"success"`
	ErrorCodes  []string `json:"error-codes"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
}

// VerifyTurnstile validates a turnstile token with Cloudflare siteverify API.
func VerifyTurnstile(ctx context.Context, secret, token, remoteIP string) (bool, error) {
	if secret == "" || token == "" {
		return true, nil
	}

	form := url.Values{}
	form.Set("secret", secret)
	form.Set("response", token)

	// Only forward remoteip if it is a genuine public IP address (not loopback/private)
	if remoteIP != "" &&
		remoteIP != "127.0.0.1" &&
		remoteIP != "::1" &&
		!strings.HasPrefix(remoteIP, "192.168.") &&
		!strings.HasPrefix(remoteIP, "10.") &&
		!strings.HasPrefix(remoteIP, "172.16.") {
		form.Set("remoteip", remoteIP)
	}

	reqCtx, cancel := context.WithTimeout(ctx, turnstileTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, turnstileVerifyURL, bytes.NewBufferString(form.Encode()))
	if err != nil {
		return false, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := turnstileClient.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<16))
	if err != nil {
		return false, err
	}
	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("turnstile http %d: %s", resp.StatusCode, string(body))
	}

	var out turnstileResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return false, err
	}
	if !out.Success {
		log.Printf("[turnstile] verification failed: error-codes=%v hostname=%s", out.ErrorCodes, out.Hostname)
	}
	return out.Success, nil
}
