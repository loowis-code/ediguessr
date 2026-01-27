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

    it('should award nearly full points for very close guesses', () => {
      const points = calculatePoints(100) // 100 meters
      expect(points).toBeGreaterThan(4980)
      expect(points).toBeLessThanOrEqual(5000)
    })

    it('should award decreasing points for increasing distance', () => {
      const points1km = calculatePoints(1000)
      const points5km = calculatePoints(5000)
      const points10km = calculatePoints(10000)

      expect(points1km).toBeGreaterThan(points5km)
      expect(points5km).toBeGreaterThan(points10km)
    })

    it('should never award negative points', () => {
      const pointsVeryFar = calculatePoints(1000000) // 1000km
      expect(pointsVeryFar).toBeGreaterThanOrEqual(0)
    })

    it('should award high points for short distances', () => {
      const points = calculatePoints(1000)
      // Should be close to max points for 1km
      expect(points).toBeGreaterThan(4900)
      expect(points).toBeLessThanOrEqual(5000)
    })
  })
})
