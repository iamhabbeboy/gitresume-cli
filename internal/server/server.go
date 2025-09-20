package server

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/fatih/color"
	"net"
	"net/http"
)

var startPort = 4000
var listener net.Listener
var err error

type Middleware func(http.Handler) http.Handler

func Serve() {
	mux := http.NewServeMux()

	handlePort()
	if listener == nil {
		fmt.Println("No available ports found between 4000 and 4100")
		os.Exit(1)
	}

	InitReactHandler()
	mux.HandleFunc("/", IndexHandler)

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(assetsFS))))
	mux.Handle("/favicon.ico", http.FileServer(http.FS(dist)))
	mux.Handle("/vite.svg", http.FileServer(http.FS(dist)))
	mux.Handle("/manifest.json", http.FileServer(http.FS(dist)))
	mux.Handle("/loading.svg", http.FileServer(http.FS(dist)))

	mux.HandleFunc("/api/projects", ProjectHandler)

	mux.HandleFunc("/api/ai", AiHandler)

	middlewares := []Middleware{
		corsSecurityMiddleware,
		loggingMiddleware,
	}
	handler := ApplyMiddleware(mux, middlewares...)

	srv := &http.Server{
		Handler: handler,
	}

	go func() {
		if err := srv.Serve(listener); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Server error: %v \n", err)
		}
	}()

	// Keep command running until interrupted
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	fmt.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		fmt.Printf("Shutdown error: %v\n", err)
	} else {
		fmt.Println("Server stopped gracefully")
	}
}

func corsSecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)

		methodColor := color.New(color.FgGreen).SprintFunc()
		addrColor := color.New(color.FgCyan).SprintFunc()
		otherColor := color.New(color.FgWhite).SprintFunc()
		yellowColor := color.New(color.FgYellow).SprintFunc()

		fmt.Printf("%s %s %s %s %s\n",
			methodColor(r.Method),                          // e.g. GET in green
			otherColor(r.URL.Path),                         // path in white
			addrColor(r.RemoteAddr),                        // remote addr in cyan
			otherColor("["+time.Since(start).String()+"]"), // duration in white
			yellowColor(r.UserAgent()),                     // user agent in white
		)
	})
}

func handlePort() {
	// Try ports starting from 4000 up to 4100
	for port := startPort; port <= 4100; port++ {
		address := fmt.Sprintf(":%d", port)
		listener, err = net.Listen("tcp", address)
		if err == nil {
			fmt.Printf("Server is running on http://localhost:%d\n", port)
			break
		}
	}
}
