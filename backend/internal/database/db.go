package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// New opens a pgx connection pool to PostgreSQL.
func New(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is empty")
	}

	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse database url: %w", err)
	}

	// Disable prepared statement cache for compatibility with PgBouncer / Supabase transaction poolers (port 6543)
	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Sensible pool defaults for a web API.
	cfg.MaxConns = 20
	cfg.MinConns = 2
	cfg.MaxConnLifetime = time.Hour
	cfg.MaxConnIdleTime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create connection pool: %w", err)
	}

	// Verify connectivity with retry and adequate timeout for remote DB.
	var lastErr error
	for attempt := 1; attempt <= 3; attempt++ {
		pingCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
		err = pool.Ping(pingCtx)
		cancel()
		if err == nil {
			return pool, nil
		}
		lastErr = err
		time.Sleep(1 * time.Second)
	}

	pool.Close()
	return nil, fmt.Errorf("ping database (attempted 3 times): %w", lastErr)
}
