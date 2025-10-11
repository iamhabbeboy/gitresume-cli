package export

type IExporter interface {
	Export(content string) ([]byte, error)
	Close() error
}

type ExportType string

const (
	Markdown ExportType = "markdown"
	PDF      ExportType = "pdf"
	Doc      ExportType = "doc"
)

// var folder = "./resume_exports"

func NewExport(exportType ExportType) (IExporter, error) {
	switch exportType {
	case Markdown:
		return NewMarkdown()
	case PDF:
		return NewPDF()
	case Doc:
		return NewDoc()
	default:
		return nil, nil
	}
}
