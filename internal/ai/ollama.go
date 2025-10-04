package ai

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"
)

type LlamaConfig struct {
}

type Request struct {
	Model       string  `json:"model"`
	Prompt      string  `json:"prompt"`
	Stream      bool    `json:"stream"`
	Format      string  `json:"format"`
	Raw         bool    `json:"raw"`
	Temperature float64 `json:"temperature"`
	N           int     `json:"n"`
	TopP        int     `json:"top_p"`
}

type Response struct {
	Response string `json:"response"`
}

type Role string

const (
	User      Role = "user"
	System    Role = "system"
	Assistant Role = "assistant"
)

type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

type ChatMessage struct {
	Role    Role   `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Message ChatMessage `json:"message"`
}

var (
	aiHost             = "http://localhost:11434"
	aiGenerateEndpoint = "/api/generate"
	aiChatEndpoint     = "/api/chat"
	AIModel            = "llama3.2"
)

func NewLlama() *LlamaConfig {
	return &LlamaConfig{}
}

func (l *LlamaConfig) Generate(message string) (string, error) {
	data := Request{
		Model:       AIModel,
		Prompt:      message,
		Stream:      false,
		Raw:         true,
		N:           1,
		Temperature: 0.0,
		TopP:        1,
	}

	msg, err := json.Marshal(data)

	if err != nil {
		return "", err
	}

	res, err := http.Post(aiHost+aiGenerateEndpoint, "application/json", bytes.NewBuffer(msg))

	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	var resp Response
	err = json.Unmarshal(body, &resp)
	return resp.Response, nil
}

func (l *LlamaConfig) Chat(messages []string) ([]string, error) {
	if len(messages) == 0 {
		return nil, errors.New("no messages")
	}

	msgs := []ChatMessage{{
		Role:    System,
		Content: messages[0],
	}}

	if len(messages) > 1 {
		msgs = append(msgs, ChatMessage{
			Role:    User,
			Content: messages[1],
		})
	}

	data := ChatRequest{
		Model:    AIModel,
		Messages: msgs,
		Stream:   false,
	}

	msg, _ := json.Marshal(data)

	res, err := http.Post(aiHost+aiChatEndpoint, "application/json", bytes.NewBuffer(msg))

	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var resp ChatResponse
	err = json.Unmarshal(body, &resp)
	output := cleanOutput(resp.Message.Content)
	return output, nil
}

func cleanOutput(output string) []string {
	ignorePhrases := []string{
		"Note: i've kept the bullet points concise, using action verbs and focusing on impact.",
		"here's the transformed bullet point:",
		"here is the transformed bullet point:",
		"here’s the transformed bullet point:", // with typographic apostrophe
		"transformed bullet point:",
		"bullet point:",
		"here are two possible bullet points:",
		"here are some possible bullet points:",
		"possible bullet points:",
		"the transformed version is:",
		"here are the transformed bullet points:",
		"here's the improved bullet point:",
		"here is the improved bullet point:",
		"improved bullet point:",
		"Here are the transformed resume bullet points:",
		"Here is the transformed resume",
		"Here is the transformed commit message into a resume",
		"Here is a polished resume",
		"Here's a possible transformation:",
	}

	// Normalize to lowercase for easier matching
	lowered := strings.ToLower(output)
	for _, phrase := range ignorePhrases {
		lowered = strings.ReplaceAll(lowered, phrase, "")
	}

	// Split into lines
	lines := strings.Split(lowered, "\n")
	re := regexp.MustCompile(`^\s*[-*•]\s*`)

	var cleaned []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Remove leading bullet markers (-, *, •)
		line = re.ReplaceAllString(line, "")

		// Capitalize first letter if present
		if len(line) > 0 {
			line = strings.ToUpper(line[:1]) + line[1:]
			cleaned = append(cleaned, line)
		}
	}

	return cleaned
}
