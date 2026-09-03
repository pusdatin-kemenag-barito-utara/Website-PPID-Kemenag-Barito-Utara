package model

import "time"

// AdminUser is the go-native auth principal (replaces Supabase/pusdatin auth).
type AdminUser struct {
	ID           string
	Email        string
	PasswordHash string
	FullName     string
	Role         string
	Active       bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// AdminUserDTO is the safe, client-facing representation.
type AdminUserDTO struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

func (u *AdminUser) ToDTO() AdminUserDTO {
	return AdminUserDTO{
		ID:       u.ID,
		Email:    u.Email,
		FullName: u.FullName,
		Role:     u.Role,
	}
}
