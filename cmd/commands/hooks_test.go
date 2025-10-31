package commands

import (
	"testing"

	"github.com/iamhabbeboy/gitresume/internal/database"
)

type mockDB struct{ database.IDatabase }

func (m *mockDB) Migrate() error                             { return nil }
func (m *mockDB) GetUser(email string) (interface{}, error)  { return struct{ ID int }{0}, nil }
func (m *mockDB) CreateUser(data interface{}) (int64, error) { return 1, nil }
func (m *mockDB) GetProjectByName(name string) (interface{}, error) {
	return struct{ Path string }{""}, nil
}
func (m *mockDB) Store(data interface{}) error { return nil }

func TestSetupHookBasic(t *testing.T) {
	db := &mockDB{}
	if err := SetupHook(db); err != nil {
		t.Errorf("SetupHook failed: %v", err)
	}
}

func TestSeedHookConfigNotInitialized(t *testing.T) {
	old := IsConfigInitialized
	IsConfigInitialized = func() bool { return false }
	defer func() { IsConfigInitialized = old }()
	db := &mockDB{}
	err := SeedHook(db)
	if err == nil {
		t.Error("SeedHook should fail if config not initialized")
	}
}
