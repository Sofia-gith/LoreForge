package api

import(
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Sofia-gith/LoreForge/internal/storage"
)


func (h *Handler) Coach(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodPost{
		http.Error(w, "Metodo não permitido", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/worlds/")
	id = strings.TrimSuffix(id, "/coach")

	world, err := storage.Load(id)
	if err != nil{
		http.Error(w, "Mundo não encontrado", http.StatusNotFound)
		return
	}

	var body struct{
		Text string `json:"text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Text == ""{
		http.Error(w, "texto é obrigatorio", http.StatusBadRequest)
		return
	}

	systemPrompt := buildCoachPrompt(world)
		
	response, err := h.client.Chat(context.Background(), systemPrompt, nil, body.Text)
	if err != nil{
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"feedback": response,
		"world_id": world.ID,
	})
} 


func buildCoachPrompt(world *storage.World) string {
	prompt := `Você é um editor literário especializado em ficção científica e fantasia.
Analise o trecho de texto enviado pelo usuário e forneça feedback em três áreas:

1. **Consistência com o mundo** — verifique se o texto contradiz o lore existente
2. **Qualidade narrativa** — aponte frases longas, advérbios em excesso, diálogos travados
3. **Sugestões de melhoria** — dê sugestões concretas e construtivas

Mundo: ` + world.Name + `

Lore do mundo:`

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
	if len(world.Lore.Notes) > 0 {
		prompt += "\nNotas: " + strings.Join(world.Lore.Notes, ", ")
	}

	prompt += `

Seja direto, construtivo e específico. Cite trechos do texto quando necessário.
Responda em português.`

	return prompt
}