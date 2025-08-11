package server

import (
	"fmt"
	"net"
	"net/http"
	"os"
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

	handlePort()
	if listener == nil {
		fmt.Println("No available ports found between 4000 and 4100")
		os.Exit(1)
	}

	http.HandleFunc("/", IndexHandler)

	http.HandleFunc("/api/projects", ProjectHandler)

	if err := http.Serve(listener, nil); err != nil {
		fmt.Println("Server error:", err)
	}
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
