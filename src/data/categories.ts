import type { BoardConfig, CategoryId } from '../types/board'

export const REQUIRED_CATEGORIES: CategoryId[] = ['person', 'tool', 'place']

export const CATEGORY_DETAILS: Record<
  CategoryId,
  { title: string; singular: string; examples: string }
> = {
  person: { title: 'Osoby', singular: 'Osoba', examples: 'np. Pani Biała' },
  tool: { title: 'Narzędzia', singular: 'Narzędzie', examples: 'np. Świecznik' },
  place: { title: 'Miejsca', singular: 'Miejsce', examples: 'np. Biblioteka' },
  motive: { title: 'Motywy', singular: 'Motyw', examples: 'np. Zemsta' },
}

export const EMPTY_NAMES: Record<CategoryId, string[]> = {
  person: [],
  tool: [],
  place: [],
  motive: [],
}

export const INITIAL_CONFIG: BoardConfig = {
  categoryIds: [...REQUIRED_CATEGORIES],
  itemCount: 3,
  names: EMPTY_NAMES,
}
