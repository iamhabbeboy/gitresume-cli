package ai

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	// "github.com/openai/openai-go/option"
)

type OpenAIConfig struct {
	client   *openai.Client
	messages []openai.ChatCompletionMessageParamUnion
	model    openai.ChatModel
}

func NewOpenAI() *OpenAIConfig {
	client := openai.NewClient()
	return &OpenAIConfig{
		client:   &client,
		messages: make([]openai.ChatCompletionMessageParamUnion, 0),
	}
}

func (o *OpenAIConfig) Generate(message string) (string, error) {
	return "", nil
}

func (o *OpenAIConfig) Chat(messages []string) ([]string, error) {
	ctx := context.Background()

	payload := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(""),
		openai.UserMessage("content"),
		openai.AssistantMessage("content"),
	}

	completion, err := o.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: payload,
		Model:    openai.ChatModelGPT3_5Turbo,
		// Temperature: param.Opt[float64]{Value: 0},
		// TopP:        0,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get completion: %w", err)
	}

	if len(completion.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned")
	}

	responseContent := completion.Choices[0].Message.Content

	fmt.Println(responseContent)
	// var output []string
	// for _, v := range chatCompletion.Choices {
	// 	output = append(output, v.Message.Content)
	// }

	return nil, nil
}
