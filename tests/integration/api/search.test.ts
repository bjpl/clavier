/**
 * Integration Tests: Search API
 * Tests search endpoint query parsing, filters, pagination, and response format
 * Note: These tests mock the database layer to focus on API logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module before importing the route
vi.mock('@/lib/db', () => ({
  db: {
    featureInstance: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock Prisma enums
vi.mock('@prisma/client', () => ({
  FeatureCategory: {
    HARMONY: 'HARMONY',
    COUNTERPOINT: 'COUNTERPOINT',
    FORM: 'FORM',
    TEXTURE: 'TEXTURE',
    RHYTHM: 'RHYTHM',
    MELODY: 'MELODY',
    ORNAMENTATION: 'ORNAMENTATION',
    ARTICULATION: 'ARTICULATION',
    DYNAMICS: 'DYNAMICS',
  },
  PieceType: {
    PRELUDE: 'PRELUDE',
    FUGUE: 'FUGUE',
  },
  KeyMode: {
    MAJOR: 'MAJOR',
    MINOR: 'MINOR',
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string
      constructor(message: string, { code }: { code: string }) {
        super(message)
        this.code = code
      }
    },
    PrismaClientValidationError: class PrismaClientValidationError extends Error {},
  },
}))

// Import after mocking
import { GET, POST } from '@/app/api/search/route'
import { db } from '@/lib/db'

describe('Search API', () => {
  const mockDb = db as unknown as {
    featureInstance: {
      findMany: ReturnType<typeof vi.fn>
      count: ReturnType<typeof vi.fn>
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock responses
    mockDb.featureInstance.count.mockResolvedValue(0)
    mockDb.featureInstance.findMany.mockResolvedValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/search', () => {
    function createRequest(searchParams: Record<string, string>): NextRequest {
      const url = new URL('http://localhost:3000/api/search')
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
      return new NextRequest(url)
    }

    describe('Query Validation', () => {
      it('should return empty results when no query or filters provided', async () => {
        const request = createRequest({})
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.instances).toEqual([])
        expect(data.totalCount).toBe(0)
        expect(data.message).toContain('Please provide')
      })

      it('should reject query shorter than 2 characters', async () => {
        const request = createRequest({ q: 'a' })
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('validation_error')
        expect(data.message).toContain('at least 2 characters')
      })

      it('should accept query with exactly 2 characters', async () => {
        const request = createRequest({ q: 'C#' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })

      it('should handle query with special characters', async () => {
        const request = createRequest({ q: 'C# major' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })
    })

    describe('Category Filter', () => {
      it('should filter by single category', async () => {
        const request = createRequest({ categories: 'HARMONY' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by multiple categories', async () => {
        const request = createRequest({ categories: 'HARMONY,COUNTERPOINT' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should ignore invalid categories', async () => {
        const request = createRequest({ categories: 'INVALID,HARMONY' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })

      it('should handle uppercase and lowercase categories', async () => {
        const request = createRequest({ categories: 'harmony' })
        await GET(request)

        // Should normalize to uppercase internally
        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })

    describe('Key Filter', () => {
      it('should filter by key tonic', async () => {
        const request = createRequest({ key: 'C' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by sharp key', async () => {
        const request = createRequest({ key: 'F#' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by flat key', async () => {
        const request = createRequest({ key: 'Bb' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })

    describe('Mode Filter', () => {
      it('should filter by MAJOR mode', async () => {
        const request = createRequest({ mode: 'MAJOR' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by MINOR mode', async () => {
        const request = createRequest({ mode: 'MINOR' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should handle lowercase mode', async () => {
        const request = createRequest({ mode: 'major' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should ignore invalid mode', async () => {
        const request = createRequest({ mode: 'INVALID', q: 'test' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })
    })

    describe('Book Filter', () => {
      it('should filter by book 1', async () => {
        const request = createRequest({ book: '1' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by book 2', async () => {
        const request = createRequest({ book: '2' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should ignore invalid book number', async () => {
        const request = createRequest({ book: '3', q: 'test' })
        const response = await GET(request)

        // Should proceed without book filter
        expect(response.status).toBe(200)
      })
    })

    describe('Type Filter', () => {
      it('should filter by PRELUDE type', async () => {
        const request = createRequest({ type: 'PRELUDE' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by FUGUE type', async () => {
        const request = createRequest({ type: 'FUGUE' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should handle lowercase type', async () => {
        const request = createRequest({ type: 'prelude' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })

    describe('Difficulty Filter', () => {
      it('should filter by minimum difficulty', async () => {
        const request = createRequest({ difficultyMin: '3' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by maximum difficulty', async () => {
        const request = createRequest({ difficultyMax: '4' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by difficulty range', async () => {
        const request = createRequest({ difficultyMin: '2', difficultyMax: '4' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should clamp difficulty to valid range (1-5)', async () => {
        const request = createRequest({ difficultyMin: '0', difficultyMax: '10' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })
    })

    describe('Specific ID Filters', () => {
      it('should filter by feature ID', async () => {
        const request = createRequest({ featureId: 'feature-123' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should filter by piece ID', async () => {
        const request = createRequest({ pieceId: 'piece-456' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })

    describe('Sorting', () => {
      it('should sort by relevance (default)', async () => {
        const request = createRequest({ q: 'cadence' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by piece ascending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'piece-asc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by piece descending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'piece-desc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by measure ascending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'measure-asc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by measure descending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'measure-desc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by complexity ascending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'complexity-asc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should sort by complexity descending', async () => {
        const request = createRequest({ q: 'cadence', sort: 'complexity-desc' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })

      it('should default to relevance for invalid sort option', async () => {
        const request = createRequest({ q: 'cadence', sort: 'invalid' })
        const response = await GET(request)

        expect(response.status).toBe(200)
      })
    })

    describe('Pagination', () => {
      it('should apply default limit (20)', async () => {
        const request = createRequest({ q: 'test' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 20,
            skip: 0,
          })
        )
      })

      it('should apply custom limit', async () => {
        const request = createRequest({ q: 'test', limit: '50' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 50,
          })
        )
      })

      it('should cap limit at maximum (100)', async () => {
        const request = createRequest({ q: 'test', limit: '200' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 100,
          })
        )
      })

      it('should apply offset', async () => {
        const request = createRequest({ q: 'test', offset: '20' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 20,
          })
        )
      })

      it('should handle negative offset as 0', async () => {
        const request = createRequest({ q: 'test', offset: '-10' })
        await GET(request)

        expect(mockDb.featureInstance.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 0,
          })
        )
      })
    })

    describe('Response Format', () => {
      it('should return expected structure', async () => {
        mockDb.featureInstance.count.mockResolvedValue(5)
        mockDb.featureInstance.findMany.mockResolvedValue([
          {
            id: 'instance-1',
            featureId: 'feature-1',
            pieceId: 'piece-1',
            feature: { category: 'HARMONY' },
            piece: { keyTonic: 'C', keyMode: 'MAJOR', book: 1, type: 'PRELUDE' },
          },
        ])

        const request = createRequest({ q: 'test' })
        const response = await GET(request)
        const data = await response.json()

        expect(data).toHaveProperty('instances')
        expect(data).toHaveProperty('totalCount')
        expect(data).toHaveProperty('facets')
        expect(Array.isArray(data.instances)).toBe(true)
        expect(typeof data.totalCount).toBe('number')
      })

      it('should include facets in response', async () => {
        mockDb.featureInstance.count.mockResolvedValue(1)
        mockDb.featureInstance.findMany.mockResolvedValue([
          {
            id: 'instance-1',
            feature: { category: 'HARMONY' },
            piece: { keyTonic: 'C', keyMode: 'MAJOR', book: 1, type: 'PRELUDE' },
          },
        ])

        const request = createRequest({ q: 'test' })
        const response = await GET(request)
        const data = await response.json()

        expect(data.facets).toHaveProperty('categories')
        expect(data.facets).toHaveProperty('keys')
        expect(data.facets).toHaveProperty('books')
        expect(data.facets).toHaveProperty('types')
      })
    })

    describe('Numeric Query (BWV Search)', () => {
      it('should search by BWV number when query is numeric', async () => {
        const request = createRequest({ q: '846' })
        await GET(request)

        // Should include BWV number in search
        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })

    describe('Combined Filters', () => {
      it('should handle multiple filters together', async () => {
        const request = createRequest({
          q: 'cadence',
          categories: 'HARMONY',
          key: 'C',
          mode: 'MAJOR',
          book: '1',
          type: 'PRELUDE',
          difficultyMin: '2',
          difficultyMax: '4',
          sort: 'measure-asc',
          limit: '10',
          offset: '0',
        })

        const response = await GET(request)

        expect(response.status).toBe(200)
        expect(mockDb.featureInstance.findMany).toHaveBeenCalled()
      })
    })
  })

  describe('POST /api/search', () => {
    function createPostRequest(body: Record<string, unknown>): NextRequest {
      const url = new URL('http://localhost:3000/api/search')
      return new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    it('should accept JSON body with query', async () => {
      const request = createPostRequest({ query: 'cadence' })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept JSON body with categories array', async () => {
      const request = createPostRequest({
        categories: ['HARMONY', 'COUNTERPOINT'],
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept full filter object', async () => {
      const request = createPostRequest({
        query: 'cadence',
        categories: ['HARMONY'],
        key: 'C',
        mode: 'MAJOR',
        book: 1,
        type: 'PRELUDE',
        difficultyMin: 2,
        difficultyMax: 4,
        sort: 'relevance',
        limit: 20,
        offset: 0,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should reject invalid JSON', async () => {
      const url = new URL('http://localhost:3000/api/search')
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('parse_error')
    })

    it('should validate query length in POST', async () => {
      const request = createPostRequest({ query: 'a' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('validation_error')
    })

    it('should return empty when no filters provided via POST', async () => {
      const request = createPostRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.instances).toEqual([])
      expect(data.message).toContain('Please provide')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { Prisma } = await import('@prisma/client')
      mockDb.featureInstance.findMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Database error', { code: 'P2002', clientVersion: '5.0.0' })
      )

      const url = new URL('http://localhost:3000/api/search')
      url.searchParams.set('q', 'test')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('database_error')
    })

    it('should handle validation errors', async () => {
      const { Prisma } = await import('@prisma/client')
      mockDb.featureInstance.findMany.mockRejectedValue(
        new Prisma.PrismaClientValidationError('Validation error', { clientVersion: '5.0.0' })
      )

      const url = new URL('http://localhost:3000/api/search')
      url.searchParams.set('q', 'test')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('validation_error')
    })

    it('should handle unexpected errors', async () => {
      mockDb.featureInstance.findMany.mockRejectedValue(new Error('Unexpected error'))

      const url = new URL('http://localhost:3000/api/search')
      url.searchParams.set('q', 'test')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('internal_error')
    })
  })
})
