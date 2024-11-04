package main

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"remove-background/app"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		log.Fatalf("BASE_URL not set in .env file")
	}

	a := app.NewApp(baseURL)
	a.Run()
}
