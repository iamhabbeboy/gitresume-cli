package export

import "testing"

func TestNewDocAndClose(t *testing.T) {
	exp, err := NewDoc()
	if err != nil {
		t.Fatalf("failed to create Doc exporter: %v", err)
	}
	if err := exp.Close(); err != nil {
		t.Errorf("close fail: %v", err)
	}
}
