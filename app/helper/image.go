package helper

import "image/color"

var SimilarColorThreshold = uint32(30 * 256)

func IsSimilarColor(c1, c2 color.Color) bool {
	r1, g1, b1, _ := c1.RGBA()
	r2, g2, b2, _ := c2.RGBA()
	return AbsDiff(r1, r2) < SimilarColorThreshold && AbsDiff(g1, g2) < SimilarColorThreshold && AbsDiff(b1, b2) < SimilarColorThreshold
}

func AbsDiff(x, y uint32) uint32 {
	if x > y {
		return x - y
	}
	return y - x
}
