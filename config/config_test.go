package config

import (
	"os"
	// "path/filepath"
	"testing"
)

func TestLoadAndSaveConfig(t *testing.T) {
	dir := t.TempDir()
	// configFile := filepath.Join(dir, "config.yaml")
	os.Setenv("HOME", dir) // override user home for testing

	c := &AppConfig{
		AuthToken: "abc",
		User:      User{Name: "Bob", Email: "bob@example.com"},
	}
	err := SaveConfig(c)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}
	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}
	if cfg.User.Email != "bob@example.com" {
		t.Errorf("user email mismatch")
	}
}
