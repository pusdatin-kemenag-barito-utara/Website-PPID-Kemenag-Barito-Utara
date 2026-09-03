package service

import (
	"context"

	"github.com/kemenag/ppid-kemenag/backend/internal/auth"
	"github.com/kemenag/ppid-kemenag/backend/internal/config"
	"github.com/kemenag/ppid-kemenag/backend/internal/model"
	"github.com/kemenag/ppid-kemenag/backend/internal/platform"
	"github.com/kemenag/ppid-kemenag/backend/internal/repository"
)

// AuthToken bundles a JWT with its metadata for cookie emission.
type AuthToken struct {
	Token     string
	ExpiresAt int64 // unix seconds
	MaxAge    int   // cookie lifetime in seconds
}

// AuthService handles admin authentication (go-native).
type AuthService struct {
	users *repository.UserRepository
	cfg   *config.Config
}

// NewAuthService creates an AuthService.
func NewAuthService(users *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{users: users, cfg: cfg}
}

// LoginInput is accepted from the login form.
type LoginInput struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	TurnstileToken string `json:"turnstile_token"`
}

// Login verifies credentials + turnstile and issues a JWT.
func (s *AuthService) Login(ctx context.Context, in LoginInput, remoteIP string) (*model.AdminUserDTO, *AuthToken, error) {
	if in.Email == "" || in.Password == "" {
		return nil, nil, platform.Validationf("Email dan password wajib diisi.")
	}

	ok, err := platform.VerifyTurnstile(ctx, s.cfg.TurnstileSecretKey, in.TurnstileToken, remoteIP)
	if err != nil {
		return nil, nil, platform.NewError(platform.ErrInternal, "Gagal memverifikasi captcha.")
	}
	if !ok {
		return nil, nil, platform.Validationf("Verifikasi captcha gagal, silakan ulangi.")
	}

	user, err := s.users.FindByEmail(ctx, in.Email)
	if err != nil {
		if platform.Is(err, platform.ErrNotFound) {
			return nil, nil, platform.NewError(platform.ErrUnauthorized, "Email atau password salah.")
		}
		return nil, nil, platform.NewError(platform.ErrInternal, err.Error())
	}

	if !user.Active {
		return nil, nil, platform.NewError(platform.ErrForbidden, "Akun dinonaktifkan.")
	}
	if !auth.VerifyPassword(user.PasswordHash, in.Password) {
		return nil, nil, platform.NewError(platform.ErrUnauthorized, "Email atau password salah.")
	}

	dto := user.ToDTO()
	token, exp, err := auth.IssueToken(&dto, s.cfg.JWTSecret, s.cfg.JWTExpiresMinute)
	if err != nil {
		return nil, nil, platform.NewError(platform.ErrInternal, "Gagal membuat sesi.")
	}

	authToken := &AuthToken{
		Token:     token,
		ExpiresAt: exp.Unix(),
		MaxAge:    s.cfg.JWTExpiresMinute * 60,
	}
	return &dto, authToken, nil
}

// Me returns the current admin principal by id.
func (s *AuthService) Me(ctx context.Context, userID string) (*model.AdminUserDTO, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		if platform.Is(err, platform.ErrNotFound) {
			return nil, platform.ErrUnauthorized
		}
		return nil, err
	}
	if !user.Active {
		return nil, platform.ErrForbidden
	}
	dto := user.ToDTO()
	return &dto, nil
}
