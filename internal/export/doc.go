package export

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

type IDocExporter struct {
}

func NewDoc() (*IDocExporter, error) {
	return &IDocExporter{}, nil
}

func (*IDocExporter) Close() error {
	return nil
}

func (*IDocExporter) Export(c string) ([]byte, error) {
	doc, err := HTMLToDocx(c)
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func HTMLToDocx(html string) ([]byte, error) {
	cmd := exec.Command("pandoc", "-f", "html", "-t", "docx", "-o", "-")

	cmd.Stdin = bytes.NewBufferString(html)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("pandoc failed: %w", err)
	}

	if err := os.WriteFile("output.docx", out.Bytes(), 0644); err != nil {
		fmt.Println("Error writing file:", err)
		return nil, err
	}
	return out.Bytes(), nil
}
