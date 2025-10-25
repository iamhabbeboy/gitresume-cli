package export

type IExporter interface {
	Export(content []byte) ([]byte, error)
	Close() error
}

type ExportType string

const (
	Markdown ExportType = "markdown"
	PDF      ExportType = "pdf"
	Docx     ExportType = "docx"
)

func NewExport(exportType ExportType) (IExporter, error) {
	switch exportType {
	case Markdown:
		return NewMarkdown()
	case PDF:
		return NewPDF()
	case Docx:
		return NewDoc()
	default:
		return nil, nil
	}
}
