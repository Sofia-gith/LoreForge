package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Sofia-gith/LoreForge/internal/api"
	"github.com/Sofia-gith/LoreForge/internal/claude"
	"github.com/joho/godotenv"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:3000",
			"https://loreforgee.vercel.app",
		}
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	godotenv.Load()

	client := claude.NewClient(os.Getenv("GEMINI_API_KEY"))
	handler := api.NewHandler(client)

	http.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}))

	http.HandleFunc("/worlds", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handler.ListWorlds(w, r)
		} else if r.Method == http.MethodPost {
			handler.CreateWorld(w, r)
		}
	}))

	http.HandleFunc("/worlds/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/coach") {
			handler.Coach(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/chat") {
			handler.Chat(w, r)
		} else {
			http.NotFound(w, r)
		}
	}))

	log.Println("LoreForge API rodando em :8080")
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}