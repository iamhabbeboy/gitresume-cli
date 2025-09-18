package ai

type OpenAIConfig struct{}

func NewOpenAI() *OpenAIConfig {
	return &OpenAIConfig{}
}

func (o *OpenAIConfig) Generate(message string) (string, error) {
	return "", nil
}

func (o *OpenAIConfig) Chat(messages []string) ([]string, error) {
	return nil, nil
}
