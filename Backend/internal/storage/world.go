package storage

//persistencia

import (
	"time" 
	"encoding/json"
	"fmt"
	"os"
)

type World struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Lore      Lore      `json:"lore"`
}


type Lore struct{
	Geography 	[]string `json: "geography"`
	Cultures 	[]string `json: "cultures"`
	History 	[]string `json: "history"`
	Magic 		[]string `json: "magic"`
	Politics 	[]string `json: "politics"`
	Notes 		[]string `json: "notes"`
}

func Save(world *World) error{
	world.UpdatedAt = time.Now()

	data, err := json.MarshalIndent(world, "", " ")
	if err != nil {
		return fmt.Errorf("erro ao serializar mundo: %w", err)
	}

	path := fmt.Sprintf("data/%s.json", world.ID)
	return os.WriteFile(path, data, 0644)
}

func Load(id string) (*World, error) {
	path := fmt.Sprintf("data/%s.json", id)

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("mundo não encontrado: %w", err)
	}

	var world World
	if err := json.Unmarshal(data, &world); err != nil {
		return nil, fmt.Errorf("erro ao ler mundo: %w", err)
	}

	return &world, nil
}

func Lists() ([]*World, error){
	entries, err := os.ReadDir("data")
	if err != nil{
		return nil, fmt.Errorf("Erro ao listar mundo", err)
	}

	var worlds []*World
	for _, entry := range entries {
		if entry.IsDir(){
			continue
		}

		id := entry.Name()[:len(entry.Name())-5]
		world, err := Load(id)
		if err != nil{
			continue
		}
		worlds = append(worlds, world)
	}
	return worlds, nil
}
