package config

import (
	"fmt"
	"net/url"
	"os"
	"strings"
)

type Config struct {
	Port           string
	AllowedOrigins []string
	DB             struct {
		Host, Port, User, Password, Name, Encrypt string
	}
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "8080"),
		AllowedOrigins: splitCSV(getEnv("ALLOWED_ORIGINS", "http://localhost:5173")),
		DB: struct{ Host, Port, User, Password, Name, Encrypt string }{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "1433"),
			User:     getEnv("DB_USER", "sa"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "STILY_SHOP"),
			Encrypt:  getEnv("DB_ENCRYPT", "disable"),
		},
	}
}

func (c *Config) ConnString() string {
	if os.Getenv("DB_AUTH") == "windows" {
		return fmt.Sprintf(
			"server=%s;port=%s;database=%s;integrated security=true;encrypt=%s;TrustServerCertificate=%s",
			c.DB.Host, c.DB.Port, c.DB.Name, c.DB.Encrypt, getEnv("TRUST_SERVER_CERT", "true"),
		)
	}
	u := url.URL{
		Scheme: "sqlserver",
		User:   url.UserPassword(c.DB.User, c.DB.Password),
		Host:   fmt.Sprintf("%s:%s", c.DB.Host, c.DB.Port),
	}
	q := url.Values{}
	q.Set("database", c.DB.Name)
	q.Set("encrypt", c.DB.Encrypt)
	u.RawQuery = q.Encode()
	return u.String()
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if x := strings.TrimSpace(p); x != "" {
			out = append(out, x)
		}
	}
	return out
}
