package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/iamhabbeboy/gitresume/config"
)

/*
*
AIzaSyAvZ1c98GWYrh2cuQy05FDRbb_KLkg1v4Q
*/
type GeminiCfg struct {
	APIKey string
	Model  string
	Prompt config.CustomPrompt
}

type GeminiGenerationCfg struct {
	Temperature     float64 `json:"temperature,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type GeminiChatRequest struct {
	Contents         []GeminiMessage     `json:"contents"`
	GenerationConfig GeminiGenerationCfg `json:"generationConfig"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type Part struct {
	Text string `json:"text"`
}

type GeminiMessage struct {
	Role  string `json:"role"`
	Parts []Part `json:"parts"`
}

func NewGemini(cfg ModelConfig) *GeminiCfg {
	return &GeminiCfg{
		APIKey: cfg.APIKey,
		Model:  cfg.Model,
		Prompt: config.CustomPrompt{
			MaxTokens:   cfg.MaxToken,
			Temperature: cfg.Temperature,
		},
	}
}

// Chat implements AiModel.
func (g *GeminiCfg) Chat(ctx context.Context, prompts []config.Prompt) ([]string, error) {
	if len(prompts) == 0 {
		return nil, errors.New("no prompt supplied")
	}

	if g.APIKey == "" {
		return nil, errors.New("Gemini API key is missing")
	}
	var systemText, userText string

	for _, p := range prompts {
		switch Role(p.Role) {
		case System:
			systemText += p.Content + "\n"
		case User:
			userText += p.Content + "\n"
		}
	}
	// merged := strings.TrimSpace(userText)

	data := GeminiChatRequest{
		Contents: []GeminiMessage{
			{
				Role: string(User),
				Parts: []Part{
					{Text: systemText},
					{Text: userText},
				},
			},
		},
		GenerationConfig: GeminiGenerationCfg{
			Temperature:     float64(g.Prompt.Temperature),
			MaxOutputTokens: g.Prompt.MaxTokens,
		},
	}

	msg, _ := json.Marshal(data)

	host := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.Model, g.APIKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, host, bytes.NewBuffer(msg))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	fmt.Println(string(body))

	var result GeminiResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse gemini response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("gemini api error: %s", result.Error.Message)
	}

	if len(result.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates returned from gemini")
	}

	var responses []string
	for _, candidate := range result.Candidates {
		for _, part := range candidate.Content.Parts {
			responses = append(responses, part.Text)
		}
	}

	return responses, nil
}

// Generate implements AiModel.
func (g *GeminiCfg) Generate(ctx context.Context, message string) (string, error) {
	return "", nil
}
