package export

import (
	htmltomarkdown "github.com/JohannesKaufmann/html-to-markdown/v2"
)

type MarkdownExporter struct {
	OutputPath string
}

func NewMarkdown() (*MarkdownExporter, error) {
	return &MarkdownExporter{}, nil
}

func (*MarkdownExporter) Close() error {
	return nil
}

func (md *MarkdownExporter) Export(content []byte) ([]byte, error) {
	c := string(content)
	markdown, err := htmltomarkdown.ConvertString(c)
	if err != nil {
		return nil, err
	}
	return []byte(markdown), nil
}
