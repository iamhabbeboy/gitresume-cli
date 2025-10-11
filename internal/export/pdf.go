package export

import (
	"context"
	"encoding/base64"
	"strings"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

type IPDFExporter struct {
	OutputPath string
	ctx        context.Context
}

func NewPDF() (*IPDFExporter, error) {
	return &IPDFExporter{}, nil
}

func (*IPDFExporter) Close() error {
	return nil
}

func (p *IPDFExporter) Export(content string) ([]byte, error) {
	// ctx, cancel := chromedp.NewContext(context.Background())
	// defer cancel()

	// ctx, cancel = context.WithTimeout(ctx, 15*time.Second)
	// defer cancel()

	// buf := new(bytes.Buffer)
	// buf.WriteString(content)
	// html := buf.String()

	// fmt.Println(html)

	// opts := append(chromedp.DefaultExecAllocatorOptions[:],
	// 	chromedp.Headless,
	// 	chromedp.NoSandbox,
	// 	chromedp.DisableGPU,
	// )

	// allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	// defer cancel()

	// _, cancel := chromedp.NewContext(allocCtx)
	// defer cancel()

	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	dataURL := "data:text/html;base64," + base64.StdEncoding.EncodeToString([]byte(content))

	var pdfBuf *[]byte
	task := chromedp.Tasks{
		chromedp.Navigate(dataURL),
		chromedp.ActionFunc(func(ctx context.Context) error {
			buf, _, err := page.PrintToPDF().WithPrintBackground(false).Do(ctx)
			if err != nil {
				return err
			}
			*pdfBuf = buf
			return nil
		}),
	}

	if err := chromedp.Run(ctx, task); err != nil {
		return nil, err
	}

	return *pdfBuf, nil
}

func htmlEncode(s string) string {
	replacer := strings.NewReplacer(
		"#", "%23",
		"%", "%25",
		"\"", "%22",
		"<", "%3C",
		">", "%3E",
	)
	return replacer.Replace(s)
}
