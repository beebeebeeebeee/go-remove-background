package helper

import (
	"image/color"
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
