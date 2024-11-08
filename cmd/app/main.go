package main

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"remove-background/app"
	"remove-background/app/service"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	port := os.Getenv("APP_PORT")
	if port == "" {
		log.Fatalf("BASE_URL not set in .env file")
	}

	i := service.NewImageService()

	a := app.NewApp(port, i)
	a.Run()
}
