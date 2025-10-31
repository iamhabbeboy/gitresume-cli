package ai

import "log"

type AiModel interface {
	Generate(message string) (string, error)
	Chat(messages []string) ([]string, error)
}

type Model string

const (
	OpenAI      Model = "openai"
	HuggingFace Model = "huggingface"
	Llama       Model = "llama"
)

type Role string

const (
	User      Role = "user"
	System    Role = "system"
	Assistant Role = "assistant"
)

func NewChatModel(model Model) AiModel {
	switch model {
	case Llama:
		return NewLlama()
	case OpenAI:
		return NewOpenAI()
	default:
		log.Fatal("invalid model")
	}

	return nil
}
