package database

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

const migrationsDir = "migrations"

// Migrate applies all SQL files under backend/migrations in lexical order,
// tracking applied versions in kemenag_ppid.schema_migrations.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	entries, err := fs.ReadDir(migrationsFS, migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		if err := ensureMigrationTable(ctx, pool); err != nil {
			return err
		}

		applied, err := isApplied(ctx, pool, name)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		sqlBytes, err := fs.ReadFile(migrationsFS, migrationsDir+"/"+name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}

		if err := applyMigration(ctx, pool, name, string(sqlBytes)); err != nil {
			return err
		}
	}
	return nil
}

func ensureMigrationTable(ctx context.Context, pool *pgxpool.Pool) error {
	sql := `
		CREATE SCHEMA IF NOT EXISTS "kemenag_ppid";
		CREATE TABLE IF NOT EXISTS "kemenag_ppid"."schema_migrations" (
			"version" varchar(255) PRIMARY KEY,
			"applied_at" timestamp DEFAULT now()
		);`
	return execSimple(ctx, pool, sql)
}

func isApplied(ctx context.Context, pool *pgxpool.Pool, name string) (bool, error) {
	var existing string
	err := pool.QueryRow(ctx,
		`SELECT "version" FROM "kemenag_ppid"."schema_migrations" WHERE "version" = $1`, name).Scan(&existing)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(strings.ToLower(err.Error()), "no rows") {
			return false, nil
		}
		return false, fmt.Errorf("query migration %s: %w", name, err)
	}
	return true, nil
}

// applyMigration runs a migration file atomically using the simple query
// protocol so multi-statement SQL files are supported.
func applyMigration(ctx context.Context, pool *pgxpool.Pool, name, sql string) error {
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire conn for %s: %w", name, err)
	}
	defer conn.Release()

	record := fmt.Sprintf(
		`INSERT INTO "kemenag_ppid"."schema_migrations"("version") VALUES ('%s') ON CONFLICT ("version") DO NOTHING;`,
		escapeSingle(name))

	statements := "BEGIN;\n" + sql + "\n" + record + "\nCOMMIT;"
	if _, err := conn.Conn().PgConn().Exec(ctx, statements).ReadAll(); err != nil {
		return fmt.Errorf("apply migration %s: %w", name, err)
	}
	return nil
}

func execSimple(ctx context.Context, pool *pgxpool.Pool, sql string) error {
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()
	_, err = conn.Conn().PgConn().Exec(ctx, sql).ReadAll()
	return err
}

func escapeSingle(s string) string {
	out := make([]byte, 0, len(s))
	for i := 0; i < len(s); i++ {
		if s[i] == '\'' {
			out = append(out, '\'', '\'')
		} else {
			out = append(out, s[i])
		}
	}
	return string(out)
}
