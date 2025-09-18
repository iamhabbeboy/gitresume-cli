package ai

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

func NewChatModel(model Model) AiModel {
	if model == "" {
		model = Llama
	}

	conf := map[Model]AiModel{
		Llama:  NewLlama(),
		OpenAI: NewOpenAI(),
	}

	return conf[model]
}
