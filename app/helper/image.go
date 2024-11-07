package helper

import (
	"fmt"
	"image/color"
	"strconv"
)

func IsSimilarColor(c1, c2 color.Color, similarColorThreshold uint32) bool {
	r1, g1, b1, _ := c1.RGBA()
	r2, g2, b2, _ := c2.RGBA()
	return AbsDiff(r1, r2) < similarColorThreshold &&
		AbsDiff(g1, g2) < similarColorThreshold &&
		AbsDiff(b1, b2) < similarColorThreshold
}

func AbsDiff(x, y uint32) uint32 {
	if x > y {
		return x - y
	}
	return y - x
}

func ConvertHexToNRGBA(hex string) (color.NRGBA, error) {
	if len(hex) != 7 || hex[0] != '#' {
		return color.NRGBA{}, fmt.Errorf("invalid hex color format")
	}

	r, err := strconv.ParseUint(hex[1:3], 16, 8)
	if err != nil {
		return color.NRGBA{}, err
	}

	g, err := strconv.ParseUint(hex[3:5], 16, 8)
	if err != nil {
		return color.NRGBA{}, err
	}

	b, err := strconv.ParseUint(hex[5:7], 16, 8)
	if err != nil {
		return color.NRGBA{}, err
	}

	return color.NRGBA{R: uint8(r), G: uint8(g), B: uint8(b), A: 255}, nil
}
