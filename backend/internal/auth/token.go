package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/kemenag/ppid-kemenag/backend/internal/model"
)

// Claims is the JWT payload for admin users.
type Claims struct {
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// IssueToken signs a JWT for the given user.
func IssueToken(u *model.AdminUserDTO, secret string, expiresMinutes int) (string, time.Time, error) {
	now := time.Now()
	exp := now.Add(time.Duration(expiresMinutes) * time.Minute)

	claims := Claims{
		Email: u.Email,
		Role:  u.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   u.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
			Issuer:    "ppid-kemenag-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", time.Time{}, err
	}
	return signed, exp, nil
}

// ParseToken validates the JWT signature and returns its claims.
func ParseToken(tokenString, secret string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
