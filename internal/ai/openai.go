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
	// "github.com/openai/openai-go/option"
)

type OpenAIConfig struct {
	APIKey string
	Model  string              `json:"model"`
	Prompt config.CustomPrompt `json:"prompt"`
}

type openAIResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func NewOpenAI(cfg ModelConfig) *OpenAIConfig {
	return &OpenAIConfig{
		APIKey: cfg.APIKey,
		Model:  cfg.Model,
		Prompt: config.CustomPrompt{
			MaxTokens:   cfg.MaxToken,
			Temperature: cfg.Temperature,
		},
	}
}

func (o *OpenAIConfig) Generate(ctx context.Context, message string) (string, error) {
	return "", nil
}

func (o *OpenAIConfig) Chat(ctx context.Context, prompts []config.Prompt) ([]string, error) {
	if len(prompts) == 0 {
		return nil, errors.New("no prompt supplied")
	}

	if o.APIKey == "" {
		return nil, errors.New("openAI Api Key is missing")
	}

	data := ChatRequest{
		Stream:      false,
		Messages:    prompts,
		Model:       o.Model,
		MaxTokens:   o.Prompt.MaxTokens,
		Temperature: o.Prompt.Temperature,
	}

	msg, _ := json.Marshal(data)

	host := "https://api.openai.com/v1/chat/completions"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, host, bytes.NewBuffer(msg))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+o.APIKey)

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

	// 🟡 Handle non-200 responses first
	if resp.StatusCode != http.StatusOK {
		var apiErr struct {
			Error struct {
				Message string `json:"message"`
				Type    string `json:"type"`
				Param   string `json:"param"`
				Code    string `json:"code"`
			} `json:"error"`
		}
		_ = json.Unmarshal(body, &apiErr)
		if apiErr.Error.Message != "" {
			return nil, fmt.Errorf("openai error: %s (type: %s, code: %s)", apiErr.Error.Message, apiErr.Error.Type, apiErr.Error.Code)
		}
		return nil, fmt.Errorf("openai returned status %d: %s", resp.StatusCode, string(body))
	}

	var result openAIResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to decode openai response: %w", err)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("no response from openAI")
	}

	var responses []string
	for _, choice := range result.Choices {
		responses = append(responses, choice.Message.Content)
	}

	return responses, nil
}
