import { useEffect, useState } from 'react'
import { CATEGORY_DETAILS, EMPTY_NAMES, INITIAL_CONFIG } from '../data/categories'
import { pairCellKey, pairKey, readSavedBoard, saveBoard } from '../lib/board'
import type { BoardConfig, CategoryId, ItemCount, Mark, SavedBoard } from '../types/board'

type BoardState = {
  savedBoard: SavedBoard | null
  config: BoardConfig
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  setConfig: (config: BoardConfig | ((current: BoardConfig) => BoardConfig)) => void
  updateCategoryCount: (itemCount: ItemCount) => void
  updateName: (categoryId: CategoryId, index: number, name: string) => void
  createBoard: () => void
  toggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
  clearMarks: () => void
}

export function useBoard(): BoardState {
  const [initial] = useState(() => {
    const savedBoard = readSavedBoard()
    return {
      savedBoard,
      config: savedBoard ?? INITIAL_CONFIG,
      isEditing: savedBoard === null,
    }
  })
  const [savedBoard, setSavedBoard] = useState<SavedBoard | null>(initial.savedBoard)
  const [config, setConfig] = useState<BoardConfig>(initial.config)
  const [isEditing, setIsEditing] = useState(initial.isEditing)

  useEffect(() => {
    if (savedBoard) saveBoard(savedBoard)
  }, [savedBoard])

  function updateCategoryCount(itemCount: ItemCount) {
    setConfig((current) => ({
      ...current,
      itemCount,
      names: Object.fromEntries(
        (['person', 'tool', 'place', 'motive'] as CategoryId[]).map((categoryId) => [
          categoryId,
          Array.from(
            { length: itemCount },
            (_, index) => current.names[categoryId]?.[index] ?? '',
          ),
        ]),
      ) as Record<CategoryId, string[]>,
    }))
  }

  function updateName(categoryId: CategoryId, index: number, name: string) {
    setConfig((current) => {
      const names = [...(current.names[categoryId] ?? [])]
      names[index] = name
      return { ...current, names: { ...current.names, [categoryId]: names } }
    })
  }

  function createBoard() {
    const names = { ...EMPTY_NAMES }
    for (const categoryId of config.categoryIds) {
      names[categoryId] = Array.from({ length: config.itemCount }, (_, index) =>
        config.names[categoryId]?.[index]?.trim() ||
        `${CATEGORY_DETAILS[categoryId].singular} ${index + 1}`,
      )
    }
    setSavedBoard({
      categoryIds: [...config.categoryIds],
      itemCount: config.itemCount,
      names,
      marks: {},
    })
    setIsEditing(false)
  }

  function toggleMark(first: CategoryId, second: CategoryId, row: number, column: number) {
    setSavedBoard((current) => {
      if (!current) return current
      const key = pairKey(first, second)
      const markKey = pairCellKey(first, second, row, column)
      const currentMark = current.marks[key]?.[markKey] ?? 'empty'
      const nextMark: Mark =
        currentMark === 'empty' ? 'selected' : currentMark === 'selected' ? 'crossed' : 'empty'
      const pairMarks = { ...current.marks[key] }
      if (nextMark === 'empty') delete pairMarks[markKey]
      else pairMarks[markKey] = nextMark
      return { ...current, marks: { ...current.marks, [key]: pairMarks } }
    })
  }

  function clearMarks() {
    setSavedBoard((current) => current ? { ...current, marks: {} } : current)
  }

  return {
    savedBoard,
    config,
    isEditing,
    setIsEditing,
    setConfig,
    updateCategoryCount,
    updateName,
    createBoard,
    toggleMark,
    clearMarks,
  }
}
