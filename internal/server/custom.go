package server

import (
	"fmt"
	"os"
	// "log"
	"net"
	"net/http"
	// "os"
)

/*
 * Custom server
 * Show list of projects added
 *  + List all the commit messages for each project
 */

var startPort = 4000
var listener net.Listener
var err error

func Serve() {

	mux := http.NewServeMux()
	cors := corsMiddleware(mux)

	handlePort()
	if listener == nil {
		fmt.Println("No available ports found between 4000 and 4100")
		os.Exit(1)
	}

	mux.HandleFunc("/", IndexHandler)

	mux.HandleFunc("/api/projects", ProjectHandler)

	// log.Fatal(http.ListenAndServe(":4000", cors))
	if err := http.Serve(listener, cors); err != nil {
		fmt.Println("Server error:", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
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
