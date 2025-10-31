package server

import (
	"net/http"
	"net/http/httptest"

	// "strings"
	"testing"

	"github.com/iamhabbeboy/gitresume/internal/database"
)

type mockDB struct{ database.IDatabase }

func TestIndexHandler(t *testing.T) {
	r := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	InitReactHandler() // to set tmpl variable
	IndexHandler(w, r)
	if w.Code != http.StatusOK {
		t.Errorf("wanted status 200, got %d", w.Code)
	}
}

func TestProjectsHandler_BasicResponse(t *testing.T) {
	db := &mockDB{}
	r := httptest.NewRequest("GET", "/api/projects", nil)
	w := httptest.NewRecorder()
	h := ProjectsHandler(db)
	h(w, r)
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}

// TODO: Write similar test stubs for ProjectHandler, AIConfigHandler, CreateResumeHandler, etc. (mock DB as needed)
