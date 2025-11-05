package ai

import (
	"context"
	"fmt"

	"github.com/iamhabbeboy/gitresume/config"
)

type AiModel interface {
	Generate(ctx context.Context, message string) (string, error)
	Chat(ctx context.Context, prompt []config.Prompt) ([]string, error)
}

type ChatRequest struct {
	Model       string          `json:"model"`
	Messages    []config.Prompt `json:"messages"`
	Stream      bool            `json:"stream"`
	Temperature float32         `json:"temperature"`
	NumPredict  int             `json:"num_predict"`
	MaxTokens   int             `json:"max_tokens"`
}

type ModelType string

const (
	OpenAI      ModelType = "openai"
	HuggingFace ModelType = "huggingface"
	Llama       ModelType = "llama"
	Gemini      ModelType = "gemini"
)

type Role string

const (
	User      Role = "user"
	System    Role = "system"
	Assistant Role = "assistant"
)

type ModelConfig struct {
	Type        ModelType
	Model       string
	APIKey      string
	Temperature float32
	MaxToken    int
}

func NewChatModel(cfg ModelConfig) AiModel {
	switch cfg.Type {
	case Llama:
		return NewLlama(cfg)
	case OpenAI:
		return NewOpenAI(cfg)
	case Gemini:
		return NewGemini(cfg)
	default:
		fmt.Errorf("unsupported AI model type: %s", cfg.Type)
	}
	return nil
}
