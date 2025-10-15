import '@testing-library/jest-dom'

// Optional: freeze time so date-based validation is stable
const fixed = new Date('2025-10-15T09:00:00.000Z')
vi.setSystemTime(fixed)
