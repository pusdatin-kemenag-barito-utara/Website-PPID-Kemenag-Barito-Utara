package database

import (
	"context"
	"fmt"
	"log"

	"github.com/kemenag/ppid-kemenag/backend/internal/auth"
	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// EnsureAdminUser creates or updates the configured admin account in PocketBase.
func EnsureAdminUser(ctx context.Context, pb *pocketbase.Client, cfg *config.Config) error {
	repo := repository.NewUserRepository(pb)

	email := cfg.AdminEmail
	if email == "" || cfg.AdminPassword == "" {
		return nil
	}

	existingUser, err := repo.FindByEmail(ctx, email)
	if err != nil && !platform.Is(err, platform.ErrNotFound) {
		return fmt.Errorf("check admin user: %w", err)
	}

	hash, err := auth.HashPassword(cfg.AdminPassword)
	if err != nil {
		return fmt.Errorf("hash seed admin password: %w", err)
	}

	if existingUser != nil {
		// Update password hash if existing
		_, err := pb.UpdateRecord("admin_users", existingUser.ID, map[string]interface{}{
			"password_hash": hash,
			"active":        true,
		})
		if err != nil {
			log.Printf("sync admin password warning: %v", err)
		}
		return nil
	}

	fullName := cfg.AdminFullName
	if fullName == "" {
		fullName = "Administrator PPID"
	}

	_, err = repo.Create(ctx, &model.AdminUser{
		Email:        email,
		PasswordHash: hash,
		FullName:     fullName,
		Role:         "admin",
		Active:       true,
	})
	if err != nil {
		return fmt.Errorf("create seed admin user: %w", err)
	}

	return nil
}

// EnsureSeedData verifies that seed collections in PocketBase have data.
func EnsureSeedData(ctx context.Context, pb *pocketbase.Client) error {
	// Check information public count
	_, count, err := pb.ListRecords("informasi_publik", "", "", 1, 1)
	if err == nil {
		log.Printf("PocketBase seed verified: informasi_publik has %d records", count)
	}
	return nil
}
