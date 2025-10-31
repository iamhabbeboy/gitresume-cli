package drivers

import (
	// "os"
	"testing"
	// "github.com/iamhabbeboy/gitresume/internal/git"
)

func TestNewSqliteAndClose(t *testing.T) {
	db, err := NewSqlite()
	if err != nil {
		t.Fatalf("failed to create sqlite db: %v", err)
	}
	if db == nil {
		t.Fatal("expected db to be non-nil")
	}
	err = db.Close()
	if err != nil {
		t.Errorf("close failed: %v", err)
	}
}

func TestGetUser_NotFound(t *testing.T) {
	db, err := NewSqlite()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	user, err := db.GetUser("nonexistent@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if user.ID != 0 {
		t.Errorf("expected user to be not found, got %+v", user)
	}
}

// TODO: Add tests for CreateUser, Store, GetProjectByName, UpsertCommit, etc. with setup/teardown using a temp database file.
