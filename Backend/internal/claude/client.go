package claude

import (
	"context"

	"google.golang.org/genai"
)

type Client struct {
	api    *genai.Client
	model  string
}

func NewClient(apiKey string) *Client {
	ctx := context.Background()
	api, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		panic(err)
	}

	return &Client{
		api:   api,
		model: "gemini-2.5-flash",
	}
}

func (c *Client) Chat(ctx context.Context, systemPrompt string, history []*genai.Content, userMessage string) (string, error) {
	chat, err := c.api.Chats.Create(ctx, c.model, &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(systemPrompt, genai.RoleUser),
	}, history)
	if err != nil {
		return "", err
	}

	response, err := chat.SendMessage(ctx, genai.Part{Text: userMessage})
	if err != nil {
		return "", err
	}

	return response.Text(), nil
}