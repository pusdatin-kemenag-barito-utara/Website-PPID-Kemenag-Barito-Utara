package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"

	"github.com/kemenag/ppid-kemenag/backend/internal/config"
)

// Storage persists and retrieves uploaded berkas (dokumen/regulasi/infografis).
type Storage interface {
	Save(ctx context.Context, folder string, filename string, contentType string, data []byte) (url string, err error)
	Get(ctx context.Context, key string) (data []byte, contentType string, err error)
}

// LocalStorage writes files to a directory served by the Astro/Fiber server.
type LocalStorage struct {
	dir  string
	base string // public url prefix, e.g. /uploads
}

// NewLocalStorage builds a LocalStorage rooted at dir.
func NewLocalStorage(dir, base string) *LocalStorage {
	return &LocalStorage{dir: dir, base: base}
}

func (s *LocalStorage) Save(_ context.Context, folder string, filename, contentType string, data []byte) (string, error) {
	folder = cleanFolder(folder)
	key := fmt.Sprintf("%s/%s/%s", folder, uuid.NewString(), sanitizeName(filename))
	path := filepath.Join(s.dir, key)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return "", fmt.Errorf("storage mkdir: %w", err)
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", fmt.Errorf("storage write: %w", err)
	}
	return "/api/v1/storage/" + key, nil
}

func (s *LocalStorage) Get(_ context.Context, key string) ([]byte, string, error) {
	cleanKey := strings.TrimPrefix(key, "/")
	path := filepath.Join(s.dir, filepath.FromSlash(cleanKey))
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, "", err
	}
	ext := strings.ToLower(filepath.Ext(cleanKey))
	ct := "application/octet-stream"
	switch ext {
	case ".pdf":
		ct = "application/pdf"
	case ".jpg", ".jpeg":
		ct = "image/jpeg"
	case ".png":
		ct = "image/png"
	case ".webp":
		ct = "image/webp"
	}
	return data, ct, nil
}

// R2Storage uploads files to a Cloudflare R2 bucket (S3-compatible).
type R2Storage struct {
	client     *s3.Client
	bucket     string
	publicBase string
}

// NewR2Storage builds an R2-backed storage, or nil when not configured.
func NewR2Storage(cfg *config.Config) *R2Storage {
	if cfg.R2AccountID == "" || cfg.R2AccessKeyID == "" || cfg.R2SecretKey == "" || cfg.R2BucketName == "" {
		return nil
	}
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID)
	client := s3.New(s3.Options{
		Region:       "auto",
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretKey, ""),
		BaseEndpoint: aws.String(endpoint),
		UsePathStyle: true,
	})
	public := cfg.R2PublicBaseURL
	if public == "" {
		public = fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s", cfg.R2AccountID, cfg.R2BucketName)
	}
	return &R2Storage{client: client, bucket: cfg.R2BucketName, publicBase: strings.TrimSuffix(public, "/")}
}

func (s *R2Storage) Save(ctx context.Context, folder string, filename, contentType string, data []byte) (string, error) {
	folder = cleanFolder(folder)
	key := fmt.Sprintf("%s/%s/%d_%s", folder, time.Now().UTC().Format("2006/01"), time.Now().Unix(), sanitizeName(filename))
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("storage r2 upload: %w", err)
	}

	// If a custom domain publicBase is set (not r2.dev), use it; otherwise use same-origin stream endpoint
	if s.publicBase != "" && !strings.Contains(s.publicBase, "r2.dev") {
		return s.publicBase + "/" + key, nil
	}
	return "/api/v1/storage/" + key, nil
}

func (s *R2Storage) Get(ctx context.Context, key string) ([]byte, string, error) {
	cleanKey := strings.TrimPrefix(key, "/")
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(cleanKey),
	})
	if err != nil {
		return nil, "", err
	}
	defer out.Body.Close()
	data, err := io.ReadAll(out.Body)
	if err != nil {
		return nil, "", err
	}
	ct := "application/pdf"
	if out.ContentType != nil && *out.ContentType != "" {
		ct = *out.ContentType
	}
	return data, ct, nil
}

// HybridStorage attempts to upload to Cloudflare R2 first. If R2 credentials or
// bucket fail, it seamlessly falls back to LocalStorage with full folder structure.
type HybridStorage struct {
	r2    *R2Storage
	local *LocalStorage
}

func (s *HybridStorage) Save(ctx context.Context, folder string, filename, contentType string, data []byte) (string, error) {
	if s.r2 != nil {
		url, err := s.r2.Save(ctx, folder, filename, contentType, data)
		if err == nil {
			return url, nil
		}
		log.Printf("[STORAGE WARNING] Cloudflare R2 upload failed (%v). Falling back to local storage.", err)
	}
	return s.local.Save(ctx, folder, filename, contentType, data)
}

func (s *HybridStorage) Get(ctx context.Context, key string) ([]byte, string, error) {
	if s.r2 != nil {
		data, ct, err := s.r2.Get(ctx, key)
		if err == nil {
			return data, ct, nil
		}
	}
	return s.local.Get(ctx, key)
}

// New returns a resilient HybridStorage that uploads to Cloudflare R2 when
// available and falls back smoothly to local storage if R2 fails.
func New(cfg *config.Config) Storage {
	r2 := NewR2Storage(cfg)
	local := NewLocalStorage("./uploads", "/uploads")
	return &HybridStorage{
		r2:    r2,
		local: local,
	}
}

func cleanFolder(f string) string {
	f = strings.Trim(f, "/\\ ")
	if f == "" {
		return "dokumen-ppid"
	}
	return strings.ReplaceAll(f, "\\", "/")
}

func sanitizeName(name string) string {
	name = filepath.Base(strings.ReplaceAll(name, "\\", "/"))
	var b strings.Builder
	for _, r := range name {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '.', r == '-', r == '_':
			b.WriteRune(r)
		default:
			b.WriteRune('_')
		}
	}
	out := b.String()
	if out == "" {
		out = "berkas"
	}
	return out
}
