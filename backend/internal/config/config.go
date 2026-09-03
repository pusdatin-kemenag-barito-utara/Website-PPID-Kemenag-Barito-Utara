package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration for the PPID API.
type Config struct {
	Port    string
	Env     string
	AppName string

	DatabaseURL string

	JWTSecret        string
	JWTExpiresMinute int

	TurnstileSiteKey   string
	TurnstileSecretKey string

	R2AccountID     string
	R2AccessKeyID   string
	R2SecretKey     string
	R2BucketName    string
	R2PublicBaseURL string

	PusdatinURL   string
	PusdatinAppID string

	WABotWebhookURL string

	AdminEmail    string
	AdminPassword string
	AdminFullName string
}

// Load builds a Config from environment variables, applying sane defaults.
func Load() *Config {
	_ = godotenv.Load("../.env.local", ".env.local", "../../.env.local", "../.env", ".env")
	return &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                getEnv("APP_ENV", "development"),
		AppName:            getEnv("APP_NAME", "ppid-kemenag-api"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		JWTSecret:          getEnv("JWT_SECRET", "dev-only-insecure-secret"),
		JWTExpiresMinute:   getEnvInt("JWT_EXPIRES_MINUTES", 480),
		TurnstileSiteKey:   getEnv("PUBLIC_TURNSTILE_SITE_KEY", os.Getenv("TURNSTILE_SITE_KEY")),
		TurnstileSecretKey: os.Getenv("TURNSTILE_SECRET_KEY"),
		R2AccountID:        os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:      os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretKey:        os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2BucketName:       os.Getenv("R2_BUCKET_NAME"),
		R2PublicBaseURL:    os.Getenv("R2_PUBLIC_BASE_URL"),
		PusdatinURL:        getEnv("PUSDATIN_URL", "https://pusdatin.kemenag-baritoutara.com"),
		PusdatinAppID:      getEnv("PUSDATIN_APP_ID", "ppid_kemenag_barito_utara"),
		WABotWebhookURL:    os.Getenv("WA_BOT_WEBHOOK_URL"),
		AdminEmail:         os.Getenv("ADMIN_EMAIL"),
		AdminPassword:      os.Getenv("ADMIN_PASSWORD"),
		AdminFullName:      getEnv("ADMIN_FULL_NAME", "Administrator PPID"),
	}
}

// IsProduction reports whether the app runs in production mode.
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
