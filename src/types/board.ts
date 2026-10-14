export type CategoryId = 'person' | 'tool' | 'place' | 'motive'
export type Mark = 'empty' | 'selected' | 'crossed'
export type ItemCount = 3 | 4
export type Marks = Record<string, Mark>

export type BoardConfig = {
  categoryIds: CategoryId[]
  itemCount: ItemCount
  names: Record<CategoryId, string[]>
}

export type SavedBoard = BoardConfig & {
  marks: Record<string, Marks>
}
