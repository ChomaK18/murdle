export type CategoryId = 'person' | 'tool' | 'place' | 'motive'
export type Mark = 'empty' | 'selected' | 'crossed'
export type ItemCount = 3 | 4
export type Marks = Record<string, Mark>

export const PUZZLE_COUNT = 100

export type BoardConfig = {
  categoryIds: CategoryId[]
  itemCount: ItemCount
  names: Record<CategoryId, string[]>
}

export type BoardAnnotations = {
  marks: Record<string, Marks>
  accusations: Partial<Record<CategoryId, number>>
}

export type SavedBoard = BoardConfig & {
  marks: Record<string, Marks>
  accusations: Partial<Record<CategoryId, number>>
  suspectScenarios?: Partial<Record<number, BoardAnnotations>>
  activeSuspectIndex?: number | null
}

export type PuzzleStatus = 'not-started' | 'in-progress' | 'solved'

export type PuzzleProgress = {
  status: PuzzleStatus
  board?: SavedBoard
}

export type PuzzleCollection = Record<number, PuzzleProgress>
