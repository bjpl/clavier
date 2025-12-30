/**
 * MSW Server Setup for Node Environment (Testing)
 */

import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { apiHandlers } from './handlers/api-handlers'

export const server = setupServer(...apiHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
