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

func (md *MarkdownExporter) Export(content string) ([]byte, error) {
	markdown, err := htmltomarkdown.ConvertString(content)
	if err != nil {
		return nil, err
	}
	return []byte(markdown), nil
	// if md.OutputPath == "" {
	// 	return errors.New("no output path provided")
	// }
	// file, err := os.Create(md.OutputPath + "/resume.md")
	// file.WriteString(markdown)
	// if err != nil {
	// 	return err
	// }
	// defer file.Close()
}
