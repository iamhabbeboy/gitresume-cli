package ai

import (
	"encoding/json"
	// "fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestGetStream_Success tests when the server returns a valid JSON response
func TestGetStream_Success(t *testing.T) {
	// Mock server
	expectedResp := Response{Response: "Hello World"}
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST method, got %s", r.Method)
		}
		if r.URL.Path != aiChatEndpoint {
			t.Errorf("expected path %s, got %s", aiChatEndpoint, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(expectedResp)
	}))
	defer mockServer.Close()

	// Override aiHost to point to mock server
	aiHost = mockServer.URL

	// Call function
	llama := NewLlama()
	resp, err := llama.GetStream("test message")

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Response != expectedResp.Response {
		t.Errorf("expected %q, got %q", expectedResp.Response, resp.Response)
	}
}

// TestGetStream_InvalidJSON tests when the server returns invalid JSON
// func TestGetStream_InvalidJSON(t *testing.T) {
// 	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		w.Write([]byte("invalid json"))
// 	}))
// 	defer mockServer.Close()
//
// 	aiHost = mockServer.URL
//
// 	llama := NewLlama()
// 	_, err := llama.GetStream("bad message")
// 	if err == nil {
// 		t.Errorf("expected error for invalid JSON, got nil")
// 	}
// }

// TestGetStream_HTTPError tests when server is unreachable
func TestGetStream_HTTPError(t *testing.T) {
	// Set aiHost to invalid URL to simulate error
	aiHost = "http://127.0.0.1:0"

	llama := NewLlama()
	_, err := llama.GetStream("any message")
	if err == nil {
		t.Errorf("expected error when server is unreachable, got nil")
	}
}
