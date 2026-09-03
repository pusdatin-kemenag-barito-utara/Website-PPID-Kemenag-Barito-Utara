package auth

import "golang.org/x/crypto/bcrypt"

const bcryptCost = 12

// HashPassword returns a bcrypt hash for the given plain-text password.
func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// VerifyPassword reports whether the plain-text password matches the hash.
func VerifyPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
