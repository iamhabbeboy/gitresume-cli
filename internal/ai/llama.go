package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/iamhabbeboy/gitresume/config"
)

type LlamaConfig struct {
	Model  string              `json:"model"`
	Prompt config.CustomPrompt `json:"prompt"`
}

type Response struct {
	Response string `json:"response"`
}

type ChatResponse struct {
	Message config.Prompt `json:"message"`
}

var (
	aiHost             = "http://localhost:11434"
	aiGenerateEndpoint = "/api/generate"
	aiChatEndpoint     = "/api/chat"
	AIModel            = "llama3.2"
)

func NewLlama(cfg ModelConfig) *LlamaConfig {
	return &LlamaConfig{
		Model: cfg.Model,
		Prompt: config.CustomPrompt{
			MaxTokens:   cfg.MaxToken,
			Temperature: cfg.Temperature,
		},
	}
}

func (l *LlamaConfig) Generate(ctx context.Context, message string) (string, error) {
	return "", nil
}

func (l *LlamaConfig) Chat(ctx context.Context, prompts []config.Prompt) ([]string, error) {
	if len(prompts) == 0 {
		return nil, errors.New("no prompt supplied")
	}

	data := ChatRequest{
		Stream:      false,
		Messages:    prompts,
		Model:       l.Model,
		NumPredict:  l.Prompt.MaxTokens,
		Temperature: l.Prompt.Temperature,
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
