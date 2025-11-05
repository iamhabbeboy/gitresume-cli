package server

import (
	// "context"
	"fmt"
	"log"
	"strings"

	// "os"
	// "os/signal"
	// "time"

	"net"
	"net/http"

	"github.com/iamhabbeboy/gitresume/internal/database"
)

var startPort = 4000
var listener net.Listener
var err error

type Middleware func(http.Handler) http.Handler

func Serve(db database.IDatabase) {
	mux := http.NewServeMux()

	InitReactHandler()
	mux.HandleFunc("/", IndexHandler)

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(assetsFS))))
	mux.Handle("/favicon.ico", http.FileServer(http.FS(dist)))
	// mux.Handle("/vite.svg", http.FileServer(http.FS(dist)))
	mux.Handle("/manifest.json", http.FileServer(http.FS(dist)))
	mux.Handle("/loading.svg", http.FileServer(http.FS(dist)))

	// ---- API endpoints ----
	//Config
	mux.HandleFunc("/api/ai", AiHandler)
	mux.HandleFunc("/api/config", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			AIConfigHandler(db)(w, r)
		case http.MethodGet:
			GetAIConfigHandler(db)(w, r)
		// case http.MethodDelete:
		// 	DeleteResumesHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/export", ExportResumeHandler)

	// User
	mux.HandleFunc("/api/users", UserHandler)
	mux.HandleFunc("/api/users/{id}", GetUserHandler(db))

	// Project
	mux.HandleFunc("/api/projects", ProjectsHandler(db))
	mux.HandleFunc("/api/projects/{id}", ProjectHandler(db))

	// Resumes
	mux.HandleFunc("/api/resumes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			CreateResumeHandler(db)(w, r)
		case http.MethodGet:
			GetAllResumesHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/resumes/{id}/duplicate", ResumeCopyHandler(db))

	mux.HandleFunc("/api/resumes/{id}", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			UpdateResumeHandler(db)(w, r)
		case http.MethodGet:
			GetResumeHandler(db)(w, r)
		case http.MethodDelete:
			DeleteResumesHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/commits/bulk-update", BulkUpdateCommitMessageHandler(db))

	// Work Experience
	mux.HandleFunc("/api/work-experiences/{id}", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			CreateOrUpdateWorkExperiencesHandler(db)(w, r)
		case http.MethodDelete:
			DeleteWorkExperienceHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Education
	mux.HandleFunc("/api/educations/{id}", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			CreateOrUpdateEducationHandler(db)(w, r)
		case http.MethodDelete:
			DeleteEducationHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Volunteer
	mux.HandleFunc("/api/resumes/{id}/volunteers", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			CreateOrUpdateVolunteerHandler(db)(w, r)
		case http.MethodDelete:
			DeleteVolunteerHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Project
	mux.HandleFunc("/api/resumes/{id}/projects", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			CreateOrUpdateProjectHandler(db)(w, r)
		case http.MethodDelete:
			DeleteProjectHandler(db)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	middlewares := []Middleware{
		CORSSecurityMiddleware,
		LoggingMiddleware,
	}
	handler := ApplyMiddleware(mux, middlewares...)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", startPort),
		Handler: handler,
	}

	fmt.Printf("🚀 Starting dashboard on http://localhost:%d\n", startPort)
	fmt.Println("✨ Build your resume visually...")

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v \n", err)
	}
	// Keep command running until interrupted
	// quit := make(chan os.Signal, 1)
	// signal.Notify(quit, os.Interrupt)
	// <-quit
	//
	// fmt.Println("Shutting down server...")
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()
	//
	// if err := srv.Shutdown(ctx); err != nil {
	// 	fmt.Printf("Shutdown error: %v\n", err)
	// } else {
	// 	fmt.Println("Server stopped gracefully")
	// }
}

// func handlePort() {
// 	// Try ports starting from 4000 up to 4100
// 	for port := startPort; port <= 4100; port++ {
// 		address := fmt.Sprintf(":%d", port)
// 		listener, err = net.Listen("tcp", address)
// 		if err == nil {
// 			fmt.Printf("Server is running on http://localhost:%d\n", port)
// 			break
// 		}
// 	}
// }

func GetID(w http.ResponseWriter, path string) string {
	pathParts := strings.Split(path, "/")
	if len(pathParts) < 4 || pathParts[1] != "api" {
		http.Error(w, "invalid URL", http.StatusBadRequest)
		return ""
	}

	idStr := pathParts[3]
	return idStr
}

func GetCenterID(w http.ResponseWriter, path string) string {
	parts := strings.Split(path, "/")
	if len(parts) >= 4 {
		id := parts[3]
		return id
	}
	return ""
}
