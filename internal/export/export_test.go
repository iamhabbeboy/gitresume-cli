package export

import "testing"

func TestNewExportSwitch(t *testing.T) {
	if _, err := NewExport(Markdown); err != nil {
		t.Errorf("markdown case failed: %v", err)
	}
	if _, err := NewExport(PDF); err != nil {
		t.Errorf("pdf case failed: %v", err)
	}
	if _, err := NewExport(Docx); err != nil {
		t.Errorf("docx case failed: %v", err)
	}
	if exp, _ := NewExport("unknown"); exp != nil {
		t.Errorf("expected nil for unknown export type")
	}
}
