import { useEffect, useState } from 'react'
import { CATEGORY_DETAILS, EMPTY_NAMES, INITIAL_CONFIG } from '../data/categories'
import { pairCellKey, pairKey, readPuzzleCollection, savePuzzleCollection } from '../lib/board'
import type {
  BoardConfig,
  BoardAnnotations,
  CategoryId,
  ItemCount,
  Mark,
  PuzzleCollection,
  SavedBoard,
} from '../types/board'

type BoardState = {
  puzzles: PuzzleCollection
  activePuzzleId: number | null
  activeBoard: SavedBoard | null
  suspectSuggestions: string[]
  config: BoardConfig
  isEditing: boolean
  openPuzzle: (puzzleId: number) => void
  closePuzzle: () => void
  openSettings: () => void
  cancelEditing: () => void
  setConfig: (config: BoardConfig | ((current: BoardConfig) => BoardConfig)) => void
  updateCategoryCount: (itemCount: ItemCount) => void
  updateName: (categoryId: CategoryId, index: number, name: string) => void
  createBoard: () => void
  toggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
  toggleAccusation: (categoryId: CategoryId, index: number) => void
  selectSuspect: (index: number | null) => void
  clearMarks: () => void
  toggleSolved: (puzzleId: number) => void
}

export function useBoard(): BoardState {
  const [puzzles, setPuzzles] = useState<PuzzleCollection>(readPuzzleCollection)
  const [activePuzzleId, setActivePuzzleId] = useState<number | null>(null)
  const [config, setConfig] = useState<BoardConfig>(INITIAL_CONFIG)
  const [isEditing, setIsEditing] = useState(false)
  const savedBoard = activePuzzleId === null ? null : puzzles[activePuzzleId]?.board ?? null
  const activeScenario = savedBoard?.activeSuspectIndex == null
    ? undefined
    : savedBoard.suspectScenarios?.[savedBoard.activeSuspectIndex]
  const activeBoard = savedBoard && activeScenario
    ? { ...savedBoard, ...activeScenario }
    : savedBoard
  const suspectSuggestions = [...new Map(
    Object.values(puzzles)
      .flatMap((progress) => progress.board?.names.person ?? [])
      .map((name) => name.trim())
      .filter((name) => name && !/^osoba \d+$/i.test(name))
      .map((name) => [name.toLocaleLowerCase('pl'), name]),
  ).values()]

  useEffect(() => {
    savePuzzleCollection(puzzles)
  }, [puzzles])

  function openPuzzle(puzzleId: number) {
    const progress = puzzles[puzzleId]
    setActivePuzzleId(puzzleId)
    setConfig(progress?.board ?? INITIAL_CONFIG)
    setIsEditing(!progress?.board)
  }

  function closePuzzle() {
    setActivePuzzleId(null)
    setIsEditing(false)
  }

  function openSettings() {
    if (activeBoard) setConfig(activeBoard)
    setIsEditing(true)
  }

  function cancelEditing() {
    if (activeBoard) {
      setConfig(activeBoard)
      setIsEditing(false)
    } else {
      closePuzzle()
    }
  }

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
    if (activePuzzleId === null) return
    const names = { ...EMPTY_NAMES }
    for (const categoryId of config.categoryIds) {
      names[categoryId] = Array.from({ length: config.itemCount }, (_, index) =>
        config.names[categoryId]?.[index]?.trim() ||
        `${CATEGORY_DETAILS[categoryId].singular} ${index + 1}`,
      )
    }

    const board: SavedBoard = {
      categoryIds: [...config.categoryIds],
      itemCount: config.itemCount,
      names,
      marks: {},
      accusations: {},
    }
    setPuzzles((current) => ({
      ...current,
      [activePuzzleId]: {
        status: current[activePuzzleId]?.status === 'solved' ? 'solved' : 'in-progress',
        board,
      },
    }))
    setIsEditing(false)
  }

  function getActiveAnnotations(board: SavedBoard): BoardAnnotations {
    const activeIndex = board.activeSuspectIndex
    return activeIndex == null
      ? { marks: board.marks, accusations: board.accusations }
      : board.suspectScenarios?.[activeIndex] ?? {
        marks: board.marks,
        accusations: board.accusations,
      }
  }

  function withActiveAnnotations(
    board: SavedBoard,
    annotations: BoardAnnotations,
  ): SavedBoard {
    const activeIndex = board.activeSuspectIndex
    if (activeIndex == null) return { ...board, ...annotations }
    return {
      ...board,
      suspectScenarios: {
        ...board.suspectScenarios,
        [activeIndex]: annotations,
      },
    }
  }

  function toggleMark(first: CategoryId, second: CategoryId, row: number, column: number) {
    if (activePuzzleId === null) return
    setPuzzles((current) => {
      const progress = current[activePuzzleId]
      const board = progress?.board
      if (!progress || !board) return current
      const annotations = getActiveAnnotations(board)
      const key = pairKey(first, second)
      const markKey = pairCellKey(first, second, row, column)
      const currentMark = annotations.marks[key]?.[markKey] ?? 'empty'
      const nextMark: Mark =
        currentMark === 'empty' ? 'selected' : currentMark === 'selected' ? 'crossed' : 'empty'
      const pairMarks = { ...annotations.marks[key] }
      if (nextMark === 'empty') delete pairMarks[markKey]
      else pairMarks[markKey] = nextMark
      const updatedMarks = { ...annotations.marks, [key]: pairMarks }
      if (nextMark === 'empty' && Object.keys(pairMarks).length === 0) delete updatedMarks[key]
      const updatedBoard = withActiveAnnotations(board, {
        ...annotations,
        marks: updatedMarks,
      })
      return {
        ...current,
        [activePuzzleId]: {
          ...progress,
          board: updatedBoard,
        },
      }
    })
  }

  function selectSuspect(index: number | null) {
    if (activePuzzleId === null) return
    setPuzzles((current) => {
      const progress = current[activePuzzleId]
      const board = progress?.board
      if (!progress || !board) return current
      if (
        index !== null &&
        (!Number.isInteger(index) || index < 0 || index >= board.itemCount)
      ) return current
      if (index === board.activeSuspectIndex) return current

      const annotations = getActiveAnnotations(board)
      const suspectScenarios = index !== null && !board.suspectScenarios?.[index]
        ? { ...board.suspectScenarios, [index]: annotations }
        : board.suspectScenarios
      return {
        ...current,
        [activePuzzleId]: {
          ...progress,
          board: {
            ...board,
            activeSuspectIndex: index,
            ...(suspectScenarios ? { suspectScenarios } : {}),
          },
        },
      }
    })
  }

  function toggleAccusation(categoryId: CategoryId, index: number) {
    if (activePuzzleId === null) return
    setPuzzles((current) => {
      const progress = current[activePuzzleId]
      const board = progress?.board
      if (
        !progress ||
        !board ||
        !board.categoryIds.includes(categoryId) ||
        index < 0 ||
        index >= board.itemCount
      ) return current
      const annotations = getActiveAnnotations(board)
      const accusations = { ...annotations.accusations }
      if (accusations[categoryId] === index) delete accusations[categoryId]
      else accusations[categoryId] = index
      const updatedBoard = withActiveAnnotations(board, { ...annotations, accusations })
      return {
        ...current,
        [activePuzzleId]: {
          ...progress,
          board: updatedBoard,
        },
      }
    })
  }

  function clearMarks() {
    if (activePuzzleId === null) return
    setPuzzles((current) => {
      const progress = current[activePuzzleId]
      if (!progress?.board) return current
      return {
        ...current,
        [activePuzzleId]: {
          ...progress,
          board: withActiveAnnotations(progress.board, { marks: {}, accusations: {} }),
        },
      }
    })
  }

  function toggleSolved(puzzleId: number) {
    setPuzzles((current) => {
      const progress = current[puzzleId]
      const status =
        progress?.status === 'solved'
          ? progress.board ? 'in-progress' : 'not-started'
          : 'solved'
      return { ...current, [puzzleId]: { ...progress, status } }
    })
  }

  return {
    puzzles,
    activePuzzleId,
    activeBoard,
    suspectSuggestions,
    config,
    isEditing,
    openPuzzle,
    closePuzzle,
    openSettings,
    cancelEditing,
    setConfig,
    updateCategoryCount,
    updateName,
    createBoard,
    toggleMark,
    toggleAccusation,
    selectSuspect,
    clearMarks,
    toggleSolved,
  }
}
