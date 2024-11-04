package app

import (
	"fmt"
	"github.com/disintegration/imaging"
	"image"
	"image/color"
	"image/png"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type App struct {
	Port string
}

func NewApp(port string) *App {
	return &App{
		Port: port,
	}
}

func (a *App) Run() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/index.html")
	})
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/upload", a.uploadHandler)

	fmt.Printf("Server started at :%s\n", a.Port)
	err := http.ListenAndServe(fmt.Sprintf(":%s", a.Port), nil)
	if err != nil {
		log.Println(err)
		return
	}
}

func (a *App) uploadHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Received a request to upload an image")
	if r.Method != "POST" {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		http.Error(w, "Error decoding the image", http.StatusInternalServerError)
		return
	}

	// Process the image to remove the background
	processedImg := a.removeBackground(img)

	// Save the processed image
	outputPath := filepath.Join("uploads", "processed.png")
	outFile, err := os.Create(outputPath)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error saving the image", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	png.Encode(outFile, processedImg)

	// Serve the processed image
	http.ServeFile(w, r, outputPath)
}
func (a *App) removeBackground(img image.Image) image.Image {
	// Define the white color to be replaced with transparency
	whiteColor := color.NRGBA{255, 255, 255, 255}

	// Create a new image with a transparent background
	bounds := img.Bounds()
	newImg := imaging.New(bounds.Dx(), bounds.Dy(), color.NRGBA{0, 0, 0, 0})

	// Replace the white background color with transparency
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			pixel := img.At(x, y)
			if a.isSimilarColor(pixel, whiteColor) {
				newImg.Set(x, y, color.NRGBA{0, 0, 0, 0})
			} else {
				newImg.Set(x, y, pixel)
			}
		}
	}

	return newImg
}

// Helper function to check if two colors are similar
func (a *App) isSimilarColor(c1, c2 color.Color) bool {
	r1, g1, b1, _ := c1.RGBA()
	r2, g2, b2, _ := c2.RGBA()
	threshold := uint32(30 * 256) // Adjust the threshold as needed
	return a.absDiff(r1, r2) < threshold && a.absDiff(g1, g2) < threshold && a.absDiff(b1, b2) < threshold
}

// Helper function to calculate the absolute difference between two values
func (a *App) absDiff(x, y uint32) uint32 {
	if x > y {
		return x - y
	}
	return y - x
}
