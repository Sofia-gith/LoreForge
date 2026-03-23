package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Sofia-gith/LoreForge/internal/api"
	"github.com/Sofia-gith/LoreForge/internal/claude"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load() 

	client := claude.NewClient(os.Getenv("GEMINI_API_KEY"))
	handler := api.NewHandler(client)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	http.HandleFunc("/worlds", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handler.ListWorlds(w, r)
		} else if r.Method == http.MethodPost {
			handler.CreateWorld(w, r)
		}
	})

	http.HandleFunc("/worlds/", handler.Chat)

	log.Println("LoreForge API rodando em :8080")
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}