package export

import (
	"bytes"
	"errors"
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

func (*IDocExporter) Export(htmlBytes []byte) ([]byte, error) {
	cmd := exec.Command("pandoc", "-f", "html", "-t", "docx", "-o", "-")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdout := &bytes.Buffer{}
	cmd.Stdout = stdout
	cmd.Stderr = &bytes.Buffer{}

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	_, _ = stdin.Write(htmlBytes)
	stdin.Close()

	if err := cmd.Wait(); err != nil {
		return nil, errors.New("pandoc error: " + cmd.Stderr.(*bytes.Buffer).String())
	}

	docxBytes := stdout.Bytes()
	return docxBytes, nil
}
