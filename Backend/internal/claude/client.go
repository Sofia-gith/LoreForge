package claude

import(
	"context"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

type Client struct{
	api *anthropic.Client
}

func NewClient(apiKey string) *Client{
	api := anthropic.NewClient(option.WithAPIKey(apiKey))
	return &Client{api: &api}
}


func (c *Client) Chat(ctx context.Context, systemPrompt string, messages []anthropic.MessageParam) (string, error){
	response, err := c.api.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.ModelClaudeHaiku4_5,
		MaxTokens: 1024,
		System: []anthropic.TextBlockParam{
			{Text: systemPrompt},
		},
		Messages: messages,
	})
	if err != nil{
		return "", err
	}
	return response.Content[0].AsText().Text, nil
}
