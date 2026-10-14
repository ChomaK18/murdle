import { EMPTY_NAMES } from '../data/categories'
import type {
  CategoryId,
  Mark,
  PuzzleCollection,
  PuzzleProgress,
  SavedBoard,
} from '../types/board'

const STORAGE_KEY = 'murdle-logic-board'
const CATEGORY_ORDER: CategoryId[] = ['person', 'tool', 'place', 'motive']

function isCategoryId(value: unknown): value is CategoryId {
  return value === 'person' || value === 'tool' || value === 'place' || value === 'motive'
}

function parseSavedBoard(value: unknown): SavedBoard | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<SavedBoard>
  if (
    !Array.isArray(candidate.categoryIds) ||
    !candidate.categoryIds.every(isCategoryId) ||
    !candidate.categoryIds.includes('person') ||
    !candidate.categoryIds.includes('tool') ||
    !candidate.categoryIds.includes('place') ||
    (candidate.itemCount !== 3 && candidate.itemCount !== 4) ||
    !candidate.names ||
    typeof candidate.names !== 'object' ||
    !candidate.marks ||
    typeof candidate.marks !== 'object'
  ) return null

  const names = { ...EMPTY_NAMES }
  for (const categoryId of candidate.categoryIds) {
    const list = candidate.names[categoryId]
    if (!Array.isArray(list)) return null
    names[categoryId] = list.slice(0, candidate.itemCount).map((name) =>
      typeof name === 'string' ? name : '',
    )
  }

  const marks: Record<string, Record<string, Mark>> = {}
  for (const [pairId, pairMarks] of Object.entries(candidate.marks)) {
    if (!pairMarks || typeof pairMarks !== 'object') continue
    marks[pairId] = Object.fromEntries(
      Object.entries(pairMarks).filter(
        (entry): entry is [string, Mark] =>
          entry[1] === 'selected' || entry[1] === 'crossed',
      ),
    )
  }

  return {
    categoryIds: candidate.categoryIds,
    itemCount: candidate.itemCount,
    names,
    marks,
  }
}

function parsePuzzleProgress(value: unknown): PuzzleProgress | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<PuzzleProgress>
  if (
    candidate.status !== 'not-started' &&
    candidate.status !== 'in-progress' &&
    candidate.status !== 'solved'
  ) return null

  const board = candidate.board === undefined ? undefined : parseSavedBoard(candidate.board)
  if (candidate.board !== undefined && !board) return null
  if (board && candidate.status === 'not-started') {
    return { status: 'in-progress', board }
  }
  return board ? { status: candidate.status, board } : { status: candidate.status }
}

export function readPuzzleCollection(): PuzzleCollection {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const candidate = parsed as Record<string, unknown>

    if ('puzzles' in candidate && candidate.puzzles && typeof candidate.puzzles === 'object') {
      return Object.fromEntries(
        Object.entries(candidate.puzzles).flatMap(([id, value]) => {
          const puzzleId = Number(id)
          const puzzle = parsePuzzleProgress(value)
          return Number.isInteger(puzzleId) && puzzleId >= 1 && puzzleId <= 100 && puzzle
            ? [[puzzleId, puzzle]]
            : []
        }),
      )
    }

    const legacyBoard = parseSavedBoard(parsed)
    return legacyBoard ? { 1: { status: 'in-progress', board: legacyBoard } } : {}
  } catch (error) {
    console.error('Nie udało się odczytać postępów z pamięci przeglądarki.', error)
    return {}
  }
}

export function savePuzzleCollection(puzzles: PuzzleCollection) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ puzzles }))
  } catch (error) {
    console.error('Nie udało się zapisać postępów w pamięci przeglądarki.', error)
  }
}

export function pairKey(first: CategoryId, second: CategoryId) {
  const [earlier, later] = [first, second].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  )
  return `${earlier}-${later}`
}

export function cellKey(row: number, column: number) {
  return `${row}-${column}`
}

export function pairCellKey(
  first: CategoryId,
  second: CategoryId,
  row: number,
  column: number,
) {
  return CATEGORY_ORDER.indexOf(first) < CATEGORY_ORDER.indexOf(second)
    ? cellKey(row, column)
    : cellKey(column, row)
}
