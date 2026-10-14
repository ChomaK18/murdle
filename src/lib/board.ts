import type { CategoryId, Mark, SavedBoard } from '../types/board'
import { EMPTY_NAMES } from '../data/categories'

const STORAGE_KEY = 'murdle-logic-board'
const CATEGORY_ORDER: CategoryId[] = ['person', 'tool', 'place', 'motive']

function isCategoryId(value: unknown): value is CategoryId {
  return value === 'person' || value === 'tool' || value === 'place' || value === 'motive'
}

export function readSavedBoard(): SavedBoard | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Partial<SavedBoard>
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
  } catch (error) {
    console.error('Nie udało się odczytać planszy z pamięci przeglądarki.', error)
    return null
  }
}

export function saveBoard(board: SavedBoard) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  } catch (error) {
    console.error('Nie udało się zapisać planszy w pamięci przeglądarki.', error)
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
