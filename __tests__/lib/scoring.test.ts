import { calculateDistance, calculatePoints } from '@/lib/scoring'

describe('Scoring System', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Edinburgh Castle to Holyrood Palace (approx 1.6km)
      const distance = calculateDistance(
        55.9486, -3.1999, // Edinburgh Castle
        55.9524, -3.1719  // Holyrood Palace
      )

      // Should be approximately 1600 meters (allow 15% margin)
      expect(distance).toBeGreaterThan(1400)
      expect(distance).toBeLessThan(1850)
    })

    it('should return 0 for identical locations', () => {
      const distance = calculateDistance(
        55.9533, -3.1883,
        55.9533, -3.1883
      )

      expect(distance).toBe(0)
    })

    it('should handle coordinates across the globe', () => {
      // Edinburgh to New York (approx 5200km)
      const distance = calculateDistance(
        55.9533, -3.1883,  // Edinburgh
        40.7128, -74.0060  // New York
      )

      // Should be approximately 5200km (allow margin)
      expect(distance).toBeGreaterThan(5000000)
      expect(distance).toBeLessThan(5500000)
    })
  })

  describe('calculatePoints', () => {
    it('should award 5000 points for perfect guess (0m)', () => {
      const points = calculatePoints(0)
      expect(points).toBe(5000)
    })

    it('should award significantly fewer points for close guesses in Edinburgh', () => {
      const points100m = calculatePoints(100) // ~4678 points
      const points250m = calculatePoints(250) // ~4325 points

      expect(points100m).toBeLessThan(4800)
      expect(points100m).toBeGreaterThan(4600)

      expect(points250m).toBeLessThan(4500)
      expect(points250m).toBeGreaterThan(4200)
    })

    it('should award decreasing points for increasing distance', () => {
      const points500m = calculatePoints(500)
      const points1km = calculatePoints(1000)
      const points2km = calculatePoints(2000)

      expect(points500m).toBeGreaterThan(points1km)
      expect(points1km).toBeGreaterThan(points2km)
    })

    it('should never award negative points', () => {
      const pointsVeryFar = calculatePoints(100000) // 100km
      expect(pointsVeryFar).toBeGreaterThanOrEqual(0)
    })

    it('should award approximately 2500 points for 1km distance (stricter)', () => {
      const points = calculatePoints(1000)
      // Stricter scoring for Edinburgh's compact size
      expect(points).toBeGreaterThan(2400)
      expect(points).toBeLessThan(2700)
    })

    it('should award very low points for 5km+ distances', () => {
      const points5km = calculatePoints(5000)
      // Should be less than 500 points for being 5km off in Edinburgh
      expect(points5km).toBeLessThan(500)
    })
  })
})
