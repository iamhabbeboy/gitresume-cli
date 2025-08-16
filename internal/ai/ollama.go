package ai

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type LlamaConfig struct {
}

type Request struct {
	Model  string
	Prompt string
	Stream bool
	Format string
	Raw    bool
}

type Response struct {
	Response string `json:"response"`
}

var (
	aiHost         = "http://localhost:11434"
	aiChatEndpoint = "/api/generate"
)

func NewLlama() *LlamaConfig {
	return &LlamaConfig{}
}

func (l *LlamaConfig) GetStream(message string) (Response, error) {
	data := Request{
		Model:  "llama3.2",
		Prompt: message,
		Stream: false,
		Raw:    true,
	}

	msg, _ := json.Marshal(data)

	res, err := http.Post(aiHost+aiChatEndpoint, "application/json", bytes.NewBuffer(msg))

	if err != nil {
		return Response{}, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Response{}, err
	}

	var resp Response
	err = json.Unmarshal(body, &resp)
	return resp, nil
}
