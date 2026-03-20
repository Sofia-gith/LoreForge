package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/Sofia-gith/LoreForge/internal/claude"
	"github.com/Sofia-gith/LoreForge/internal/storage"

)

type Handler struct {
	client *claude.Client
}

func NewHandler(client *claude.Client) *Handler {
	return &Handler{client: client}
}

func (h *Handler) CreateWorld(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		http.Error(w, "nome do mundo é obrigatório", http.StatusBadRequest)
		return
	}

	world := &storage.World{
		ID:        strings.ToLower(strings.ReplaceAll(body.Name, " ", "-")),
		Name:      body.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Lore:      storage.Lore{},
	}

	if err := storage.Save(world); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(world)
}

func (h *Handler) ListWorlds(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	worlds, err := storage.Lists()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(worlds)
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/worlds/")
	id = strings.TrimSuffix(id, "/chat")

	world, err := storage.Load(id)
	if err != nil {
		http.Error(w, "mundo não encontrado", http.StatusNotFound)
		return
	}

	var body struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Message == "" {
		http.Error(w, "mensagem é obrigatória", http.StatusBadRequest)
		return
	}

	systemPrompt := buildSystemPrompt(world)

	response, err := h.client.Chat(context.Background(), systemPrompt, nil, body.Message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	updateLore(world, body.Message, response)
	storage.Save(world)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"response": response,
		"world_id": world.ID,
	})
}

func buildSystemPrompt(world *storage.World) string {
	prompt := `Você é um assistente criativo de worldbuilding chamado LoreForge.
		Você ajuda escritores a construir mundos fictícios ricos e coerentes.
		Quando o usuário descrever elementos do mundo, incorpore-os de forma criativa e coerente.

		Mundo atual: ` + world.Name + `

		Lore existente:`

	if len(world.Lore.Cultures) > 0 {
		prompt += "\nCulturas: " + strings.Join(world.Lore.Cultures, ", ")
	}
	if len(world.Lore.Geography) > 0 {
		prompt += "\nGeografia: " + strings.Join(world.Lore.Geography, ", ")
	}
	if len(world.Lore.History) > 0 {
		prompt += "\nHistória: " + strings.Join(world.Lore.History, ", ")
	}
	if len(world.Lore.Magic) > 0 {
		prompt += "\nMagia: " + strings.Join(world.Lore.Magic, ", ")
	}

	prompt += "\n\nSeja criativo, detalhado e mantenha a coerência com o lore existente."
	return prompt
}

func updateLore(world *storage.World, message, response string) {
	msg := strings.ToLower(message)

	if strings.Contains(msg, "cultura") || strings.Contains(msg, "povo") {
		world.Lore.Cultures = append(world.Lore.Cultures, response[:min(100, len(response))])
		
	} else 
	if strings.Contains(msg, "geografia") || strings.Contains(msg, "mapa") || strings.Contains(msg, "montanha") || strings.Contains(msg, "floresta") {
		world.Lore.Geography = append(world.Lore.Geography, response[:min(100, len(response))])
	} else 
	if strings.Contains(msg, "história") || strings.Contains(msg, "guerra") || strings.Contains(msg, "reino") {
		world.Lore.History = append(world.Lore.History, response[:min(100, len(response))])
	} else 
	if strings.Contains(msg, "magia") || strings.Contains(msg, "feitiço") || strings.Contains(msg, "poder") {
		world.Lore.Magic = append(world.Lore.Magic, response[:min(100, len(response))])
	} else {
		world.Lore.Notes = append(world.Lore.Notes, response[:min(100, len(response))])
	}
}
