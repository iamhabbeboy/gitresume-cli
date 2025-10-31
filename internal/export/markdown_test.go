package export

import "testing"

func TestMarkdownExport(t *testing.T) {
	exp, err := NewMarkdown()
	if err != nil {
		t.Fatalf("failed to make exporter: %v", err)
	}
	defer exp.Close()
	res, err := exp.Export([]byte("<h1>Hello</h1>"))
	if err != nil {
		t.Errorf("export markdown failed: %v", err)
	}
	if string(res) != "# Hello\n" {
		t.Errorf("bad markdown result, got: %q", res)
	}
}
