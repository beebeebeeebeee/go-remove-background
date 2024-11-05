package app

import (
	"fmt"
	"github.com/disintegration/imaging"
	"image"
	"image/color"
	"image/png"
	"log"
	"net"
	"net/http"
	"remove-background/app/helper"
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

	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Server started at:\n")
	fmt.Printf("  - http://localhost:%s\n", a.Port)
	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				fmt.Printf("  - http://%s:%s\n", ipnet.IP.String(), a.Port)
			}
		}
	}
	err = http.ListenAndServe(fmt.Sprintf(":%s", a.Port), nil)
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

	processedImg := a.removeBackground(img)

	w.Header().Set("Content-Type", "image/png")
	err = png.Encode(w, processedImg)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error encoding the image", http.StatusInternalServerError)
		return
	}
}

func (a *App) removeBackground(img image.Image) image.Image {
	whiteColor := color.NRGBA{255, 255, 255, 255}

	bounds := img.Bounds()
	newImg := imaging.New(bounds.Dx(), bounds.Dy(), color.NRGBA{0, 0, 0, 0})

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			pixel := img.At(x, y)
			if helper.IsSimilarColor(pixel, whiteColor) {
				newImg.Set(x, y, color.NRGBA{0, 0, 0, 0})
			} else {
				newImg.Set(x, y, pixel)
			}
		}
	}

	return newImg
}
