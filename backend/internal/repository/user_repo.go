package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/pocketbase"
)

// UserRepository persists admin_users in PocketBase.
type UserRepository struct {
	pb *pocketbase.Client
}

// NewUserRepository creates a UserRepository backed by PocketBase.
func NewUserRepository(pb *pocketbase.Client) *UserRepository {
	return &UserRepository{pb: pb}
}

func mapToAdminUser(m map[string]interface{}) *model.AdminUser {
	if m == nil {
		return nil
	}
	id, _ := m["id"].(string)
	email, _ := m["email"].(string)
	pwdHash, _ := m["password_hash"].(string)
	fullName, _ := m["full_name"].(string)
	if fullName == "" {
		fullName, _ = m["name"].(string)
	}
	role, _ := m["role"].(string)
	if role == "" {
		role = "admin"
	}
	active := true
	if a, ok := m["active"].(bool); ok {
		active = a
	}

	createdAt := pocketbase.ParsePBTime(m["created_at"])
	if m["created_at"] == nil {
		createdAt = pocketbase.ParsePBTime(m["created"])
	}
	updatedAt := pocketbase.ParsePBTime(m["updated_at"])
	if m["updated_at"] == nil {
		updatedAt = pocketbase.ParsePBTime(m["updated"])
	}

	return &model.AdminUser{
		ID:           id,
		Email:        email,
		PasswordHash: pwdHash,
		FullName:     fullName,
		Role:         role,
		Active:       active,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// FindByEmail returns the user matching email from admin_users.
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*model.AdminUser, error) {
	cleanEmail := strings.TrimSpace(email)
	filter := fmt.Sprintf("email='%s'", cleanEmail)
	items, _, err := r.pb.ListRecords("admin_users", filter, "", 1, 1)
	if err == nil && len(items) > 0 {
		return mapToAdminUser(items[0]), nil
	}

	// Fallback to PocketBase auth collection 'users'
	uItems, _, uErr := r.pb.ListRecords("users", filter, "", 1, 1)
	if uErr == nil && len(uItems) > 0 {
		return mapToAdminUser(uItems[0]), nil
	}

	return nil, platform.ErrNotFound
}

// FindByID returns the user matching id.
func (r *UserRepository) FindByID(ctx context.Context, id string) (*model.AdminUser, error) {
	rec, err := r.pb.GetRecord("admin_users", id)
	if err == nil {
		return mapToAdminUser(rec), nil
	}

	// Fallback to 'users'
	rec, err = r.pb.GetRecord("users", id)
	if err == nil {
		return mapToAdminUser(rec), nil
	}

	return nil, platform.ErrNotFound
}

// Count returns the total number of admin users.
func (r *UserRepository) Count(ctx context.Context) (int64, error) {
	_, total, err := r.pb.ListRecords("admin_users", "", "", 1, 1)
	if err != nil {
		return 0, err
	}
	return int64(total), nil
}

// Create inserts a new admin user into PocketBase.
func (r *UserRepository) Create(ctx context.Context, u *model.AdminUser) (string, error) {
	data := map[string]interface{}{
		"email":         u.Email,
		"password_hash": u.PasswordHash,
		"full_name":     u.FullName,
		"role":          u.Role,
		"active":        u.Active,
	}
	if u.ID != "" {
		data["id"] = u.ID
	}

	rec, err := r.pb.CreateRecord("admin_users", data)
	if err != nil {
		return "", err
	}
	newID, _ := rec["id"].(string)
	return newID, nil
}
