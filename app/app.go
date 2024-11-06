package app

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"net"
	"net/http"
	"remove-background/app/service"
	"strconv"
)

type App struct {
	Port         string
	ImageService *service.ImageService
}

func NewApp(
	port string,
	imageService *service.ImageService,
) *App {
	return &App{
		Port:         port,
		ImageService: imageService,
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
	log.Printf("Request Method: %s, URL: %s, RemoteAddr: %s", r.Method, r.URL, r.RemoteAddr)

	if r.Method != "POST" {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusInternalServerError)
		return
	}
	defer file.Close()
	log.Printf("Uploaded File: %s, Size: %d", header.Filename, header.Size)

	thresholdStr := r.FormValue("threshold")
	threshold, err := strconv.Atoi(thresholdStr)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid threshold value", http.StatusBadRequest)
		return
	}
	log.Printf("Threshold: %d", threshold)
	similarColorThreshold := uint32(threshold)

	backgroundColor := r.FormValue("backgroundColor")
	log.Printf("Background Color: %s", backgroundColor)
	invertColors := r.FormValue("invertColors") == "true"
	log.Printf("Invert Colors: %t", invertColors)

	img, _, err := image.Decode(file)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error decoding the image", http.StatusInternalServerError)
		return
	}

	processedImg := a.ImageService.RemoveBackground(
		img,
		similarColorThreshold,
		backgroundColor,
	)
	if invertColors {
		processedImg = a.ImageService.InvertColor(
			processedImg,
			similarColorThreshold,
		)
	}

	w.Header().Set("Content-Type", "image/png")
	err = png.Encode(w, processedImg)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error encoding the image", http.StatusInternalServerError)
		return
	}
	log.Println("Image processed and response sent successfully")
}
