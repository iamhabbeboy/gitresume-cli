package export

import (
	"context"
	"fmt"
	"log"
	"time"

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

func (p *IPDFExporter) Export(content []byte) ([]byte, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("ignore-certificate-errors", true),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	chromedp.ListenTarget(ctx, func(ev interface{}) {
		switch e := ev.(type) {
		case *page.EventJavascriptDialogOpening:
			log.Println("⚠️ js Dialog: %s", e.Message)
		}
	})

	var buf []byte
	var err error

	navigateURL := "data:text/html," + string(content)

	tasks := chromedp.Tasks{
		chromedp.Navigate(navigateURL),
		chromedp.WaitReady("body", chromedp.ByQuery),
		chromedp.Evaluate(fmt.Sprintf(`document.title = "%s"`, "gitresume"), nil),
		chromedp.Sleep(2 * time.Second),
		chromedp.EmulateViewport(1200, 1600, chromedp.EmulateScale(1.35)),
		chromedp.ActionFunc(func(ctx context.Context) error {
			buf, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(8.27).   // A4 width in inches
				WithPaperHeight(11.69). // A4 height in inches
				WithMarginTop(0).
				WithMarginBottom(0).
				WithMarginLeft(0).
				WithMarginRight(0).
				WithScale(1.0).
				Do(ctx)
			return err
		}),
	}

	if err := chromedp.Run(ctx, tasks); err != nil {
		return nil, fmt.Errorf("failed to render page: %w", err)
	}
	return buf, nil
}
