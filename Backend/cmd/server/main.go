package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/anthropics/anthropic-sdk-go"
	"github.com/Sofia-gith/LoreForge/internal/claude"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Erro ao carregar .env")
	}

	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	client := claude.NewClient(apiKey)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		messages := []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock("Olá! Você é um assistente de worldbuilding. Me dê um exemplo de cultura fictícia em 2 frases.")),
		}

		response, err := client.Chat(context.Background(), "Você é um assistente criativo de worldbuilding.", messages)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"response": response})
	})

	log.Println("Server starting on :8080...")
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}