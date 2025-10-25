package ai

import (
	"context"
	"errors"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

type OpenAIConfig struct {
	client openai.Client
}

func NewOpenAI() *OpenAIConfig {
	client := openai.NewClient(
		option.WithAPIKey("My API Key"),
	)
	return &OpenAIConfig{client: client}
}

func (o *OpenAIConfig) Generate(message string) (string, error) {
	return "", nil
}

func (o *OpenAIConfig) Chat(messages []string) ([]string, error) {
	// chatCompletion, err := o.client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
	// 	Messages: []openai.ChatCompletionMessageParamUnion{
	// 		openai.UserMessage("Say this is a test"),
	// 	},
	// 	Model: openai.ChatModelGPT4o,
	// })

	cfg := openai.ChatCompletionNewParams{
		Model: openai.ChatModelGPT4o,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage("Say this is a test"),
		},
		ResponseFormat: openai.ChatCompletionNewParamsResponseFormatUnion{},
	}
	chatCompletion, err := o.client.Chat.Completions.New(context.TODO(), cfg)

	if err != nil {
		return nil, err
	}

	if len(chatCompletion.Choices) == 0 {
		return nil, errors.New("no data generated: output is empty")
	}

	var output []string
	for _, v := range chatCompletion.Choices {
		output = append(output, v.Message.Content)
	}

	return output, nil
}
