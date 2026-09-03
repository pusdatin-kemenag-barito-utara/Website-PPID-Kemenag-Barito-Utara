package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
)

// UserRepository persists admin_users.
type UserRepository struct {
	pool *pgxpool.Pool
}

// NewUserRepository creates a UserRepository.
func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

const userColumns = `"id", "email", "password_hash", "full_name", "role", "active"`

func scanUser(row pgx.Row) (*model.AdminUser, error) {
	var u model.AdminUser
	if err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.Active); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, platform.ErrNotFound
		}
		return nil, err
	}
	return &u, nil
}

// FindByEmail returns the user matching email.
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*model.AdminUser, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM "kemenag_ppid"."admin_users" WHERE "email" = $1`, email))
}

// FindByID returns the user matching id.
func (r *UserRepository) FindByID(ctx context.Context, id string) (*model.AdminUser, error) {
	return scanUser(r.pool.QueryRow(ctx,
		`SELECT `+userColumns+` FROM "kemenag_ppid"."admin_users" WHERE "id" = $1`, id))
}

// Count returns the total number of admin users.
func (r *UserRepository) Count(ctx context.Context) (int64, error) {
	var n int64
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM "kemenag_ppid"."admin_users"`).Scan(&n)
	return n, err
}

// Create inserts a new admin user.
func (r *UserRepository) Create(ctx context.Context, u *model.AdminUser) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx,
		`INSERT INTO "kemenag_ppid"."admin_users"
			("email", "password_hash", "full_name", "role", "active")
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING "id"`,
		u.Email, u.PasswordHash, u.FullName, u.Role, u.Active).Scan(&id)
	return id, err
}
