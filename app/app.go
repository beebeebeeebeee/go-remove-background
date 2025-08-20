package app

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"net"
	"net/http"
	"remove-background/app/frontend"
	"remove-background/app/helper"
	"remove-background/app/service"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type App struct {
	Port         string
	ImageService *service.ImageService
	Echo         *echo.Echo
}

func NewApp(
	port string,
	imageService *service.ImageService,
) *App {
	e := echo.New()

	// Add middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	return &App{
		Port:         port,
		ImageService: imageService,
		Echo:         e,
	}
}

func (a *App) Run() {
	// Register frontend handlers
	frontend.RegisterHandlers(a.Echo)

	// Register API routes
	a.Echo.POST("/api/upload", a.uploadHandler)

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

	err = a.Echo.Start(fmt.Sprintf(":%s", a.Port))
	if err != nil {
		log.Println(err)
		return
	}
}

func (a *App) uploadHandler(c echo.Context) error {
	log.Println("Received a request to upload an image")
	log.Printf("Request Method: %s, URL: %s, RemoteAddr: %s", c.Request().Method, c.Request().URL, c.Request().RemoteAddr)

	// Get the uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Error retrieving the file")
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Error opening the file")
	}
	defer src.Close()

	log.Printf("Uploaded File: %s, Size: %d", file.Filename, file.Size)

	// Get form values
	thresholdStr := c.FormValue("threshold")
	threshold, err := strconv.Atoi(thresholdStr)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid threshold value")
	}
	log.Printf("Threshold: %d", threshold)
	similarColorThreshold := uint32(threshold)

	backgroundColor := c.FormValue("backgroundColor")
	backgroundNRGBA, err := helper.ConvertHexToNRGBA(backgroundColor)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid background color")
	}

	log.Printf("Background Color: %s, %v", backgroundColor, backgroundNRGBA)
	invertBW := c.FormValue("invertBW") == "true"
	log.Printf("Invert BW: %t", invertBW)

	// Decode the image
	img, _, err := image.Decode(src)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Error decoding the image")
	}

	// Process the image
	processedImg := a.ImageService.RemoveBackground(
		img,
		similarColorThreshold,
		backgroundNRGBA,
	)
	if invertBW {
		processedImg = a.ImageService.InvertBW(
			processedImg,
			similarColorThreshold,
		)
	}

	// Set response headers
	c.Response().Header().Set("Content-Type", "image/png")

	// Encode and send the response
	err = png.Encode(c.Response().Writer, processedImg)
	if err != nil {
		log.Println(err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Error encoding the image")
	}

	log.Println("Image processed and response sent successfully")
	return nil
}
