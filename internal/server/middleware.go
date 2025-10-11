package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/fatih/color"
)

type statusResponseWriter struct {
	http.ResponseWriter
	status int
}

func CORSSecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func ApplyMiddleware(h http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		sw := &statusResponseWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(w, r)

		methodColor := color.New(color.FgGreen).SprintFunc()
		addrColor := color.New(color.FgCyan).SprintFunc()
		otherColor := color.New(color.FgWhite).SprintFunc()
		yellowColor := color.New(color.FgYellow).SprintFunc()
		fmt.Printf("%s %s %s in %s %s\n",
			methodColor(r.Method), // e.g. GET in green
			otherColor(r.URL.Path),
			addrColor(sw.status),                           // remote addr in cyan
			otherColor("["+time.Since(start).String()+"]"), // duration in white
			yellowColor(r.UserAgent()),                     // user agent in white
		)
	})
}
