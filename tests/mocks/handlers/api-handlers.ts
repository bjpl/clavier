/**
 * MSW (Mock Service Worker) API Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw'

// Mock data
const mockPieces = [
  {
    id: '1',
    bwv: 'BWV 846',
    title: 'Prelude No. 1 in C Major',
    composer: 'J.S. Bach',
    difficulty: 3,
    measures: 35,
  },
  {
    id: '2',
    bwv: 'BWV 847',
    title: 'Prelude No. 2 in C Minor',
    composer: 'J.S. Bach',
    difficulty: 4,
    measures: 42,
  },
]

const mockMeasures = [
  {
    id: '1',
    pieceId: '1',
    measureNumber: 1,
    timeSignature: '4/4',
    keySignature: 'C',
  },
]

const mockAnnotations = [
  {
    id: '1',
    pieceId: '1',
    measureNumber: 1,
    type: 'cadence',
    text: 'Perfect cadence in C major',
  },
]

export const apiHandlers = [
  // GET /api/pieces
  http.get('/api/pieces', () => {
    return HttpResponse.json(mockPieces)
  }),

  // GET /api/pieces/:id
  http.get('/api/pieces/:id', ({ params }) => {
    const piece = mockPieces.find(p => p.id === params.id)
    if (!piece) {
      return HttpResponse.json({ error: 'Piece not found' }, { status: 404 })
    }
    return HttpResponse.json(piece)
  }),

  // GET /api/pieces/:id/measures
  http.get('/api/pieces/:id/measures', ({ params }) => {
    return HttpResponse.json(mockMeasures.filter(m => m.pieceId === params.id))
  }),

  // GET /api/pieces/:id/annotations
  http.get('/api/pieces/:id/annotations', ({ params }) => {
    return HttpResponse.json(mockAnnotations.filter(a => a.pieceId === params.id))
  }),

  // GET /api/curriculum
  http.get('/api/curriculum', () => {
    return HttpResponse.json({
      domains: [
        {
          id: '1',
          title: 'Harmony',
          description: 'Learn about chords and progressions',
          lessons: [],
        },
      ],
    })
  }),

  // GET /api/features
  http.get('/api/features', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Cadence',
        category: 'harmony',
        description: 'A chord progression that ends a phrase',
      },
    ])
  }),

  // POST /api/progress
  http.post('/api/progress', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, ...body }, { status: 201 })
  }),
]
