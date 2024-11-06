package service

import (
	"github.com/disintegration/imaging"
	"image"
	"image/color"
	"remove-background/app/helper"
)

var WhiteColor = color.NRGBA{R: 255, G: 255, B: 255, A: 255}
var BlackColor = color.NRGBA{A: 255}
var EmptyColor = color.NRGBA{}

type ImageService struct {
}

func NewImageService() *ImageService {
	return &ImageService{}
}

func (i *ImageService) RemoveBackground(
	img image.Image,
	similarColorThreshold uint32,
	backgroundColor string,
) image.Image {
	var filterColor color.NRGBA
	switch backgroundColor {
	case "black":
		filterColor = BlackColor
		break
	case "white":
		filterColor = WhiteColor
		break
	default:
		filterColor = WhiteColor
		break
	}

	bounds := img.Bounds()
	newImg := imaging.New(bounds.Dx(), bounds.Dy(), EmptyColor)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			pixel := img.At(x, y)
			if helper.IsSimilarColor(pixel, filterColor, similarColorThreshold) {
				newImg.Set(x, y, EmptyColor)
			} else {
				newImg.Set(x, y, pixel)
			}
		}
	}

	return newImg
}

func (i *ImageService) InvertColor(
	img image.Image,
	similarColorThreshold uint32,
) image.Image {
	bounds := img.Bounds()
	newImg := imaging.New(bounds.Dx(), bounds.Dy(), EmptyColor)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			pixel := img.At(x, y)
			_, _, _, a := pixel.RGBA()
			if a == 0 {
				newImg.Set(x, y, EmptyColor)
			} else if helper.IsSimilarColor(pixel, WhiteColor, similarColorThreshold) {
				newImg.Set(x, y, BlackColor)
			} else if helper.IsSimilarColor(pixel, BlackColor, similarColorThreshold) {
				newImg.Set(x, y, WhiteColor)
			} else {
				newImg.Set(x, y, pixel)
			}
		}
	}

	return newImg
}
