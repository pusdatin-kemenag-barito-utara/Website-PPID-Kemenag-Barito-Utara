package cache

import (
	"strings"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

type item struct {
	value     interface{}
	expiresAt time.Time
}

// MemoryCache is a high-performance in-memory cache with TTL and SingleFlight protection.
type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]item
	sf    singleflight.Group
}

var (
	defaultCache *MemoryCache
	once         sync.Once
)

// Default is the global singleton in-memory cache.
var Default = GetDefault()

// GetDefault returns the global singleton cache.
func GetDefault() *MemoryCache {
	once.Do(func() {
		defaultCache = New()
	})
	return defaultCache
}

// New creates an isolated MemoryCache instance.
func New() *MemoryCache {
	mc := &MemoryCache{
		items: make(map[string]item),
	}
	// Background cleanup of expired keys every 2 minutes
	go mc.startJanitor(2 * time.Minute)
	return mc
}

func (c *MemoryCache) startJanitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, it := range c.items {
			if !it.expiresAt.IsZero() && now.After(it.expiresAt) {
				delete(c.items, k)
			}
		}
		c.mu.Unlock()
	}
}

// Get retrieves an item by key. Returns (value, true) if found and not expired.
func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	it, found := c.items[key]
	c.mu.RUnlock()

	if !found {
		return nil, false
	}

	if !it.expiresAt.IsZero() && time.Now().After(it.expiresAt) {
		return nil, false
	}

	return it.value, true
}

// Set stores a value with the specified TTL. If ttl <= 0, item never expires until invalidated.
func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	var expiresAt time.Time
	if ttl > 0 {
		expiresAt = time.Now().Add(ttl)
	}

	c.mu.Lock()
	c.items[key] = item{
		value:     value,
		expiresAt: expiresAt,
	}
	c.mu.Unlock()
}

// Delete removes a specific key.
func (c *MemoryCache) Delete(key string) {
	c.mu.Lock()
	delete(c.items, key)
	c.mu.Unlock()
}

// InvalidatePrefix deletes all keys matching the given prefix.
// E.g., InvalidatePrefix("informasi_publik") clears all related queries.
func (c *MemoryCache) InvalidatePrefix(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for k := range c.items {
		if strings.HasPrefix(k, prefix) {
			delete(c.items, k)
		}
	}
}

// Flush removes all items.
func (c *MemoryCache) Flush() {
	c.mu.Lock()
	c.items = make(map[string]item)
	c.mu.Unlock()
}

// FetchWithSingleFlight gets the value from cache, or executes fn exactly once for concurrent callers.
func FetchWithSingleFlight[T any](c *MemoryCache, key string, ttl time.Duration, fn func() (T, error)) (T, error) {
	if val, found := c.Get(key); found {
		if typed, ok := val.(T); ok {
			return typed, nil
		}
	}

	// Protect against cache stampede: only 1 goroutine executes fn for this key
	res, err, _ := c.sf.Do(key, func() (interface{}, error) {
		// Double-check cache inside singleflight
		if val, found := c.Get(key); found {
			if typed, ok := val.(T); ok {
				return typed, nil
			}
		}

		freshVal, err := fn()
		if err != nil {
			return nil, err
		}

		c.Set(key, freshVal, ttl)
		return freshVal, nil
	})

	if err != nil {
		var zero T
		return zero, err
	}

	return res.(T), nil
}
