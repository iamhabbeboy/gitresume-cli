package drivers

import (
	"testing"
)

func TestNewBoltAndClose(t *testing.T) {
	db, err := NewBolt()
	if err != nil {
		t.Fatalf("failed to create bolt db: %v", err)
	}
	if db == nil {
		t.Fatal("expected db to be non-nil")
	}
	err = db.Close()
	if err != nil {
		t.Errorf("close failed: %v", err)
	}
}

// TODO: Add more complete tests for CRUD and error handling with temp files or mocks.
