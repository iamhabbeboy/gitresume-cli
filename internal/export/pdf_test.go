package export

import "testing"

func TestNewPDFAndClose(t *testing.T) {
	exp, err := NewPDF()
	if err != nil {
		t.Fatalf("failed to create PDF exporter: %v", err)
	}
	if err := exp.Close(); err != nil {
		t.Errorf("close fail: %v", err)
	}
}

// PDF Export test could be added with chromedp/mock later.
