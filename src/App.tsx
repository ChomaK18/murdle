import { useEffect, useState } from 'react'

type CategoryId = 'person' | 'tool' | 'place' | 'motive'
type Mark = 'empty' | 'selected' | 'crossed'
type ItemCount = 3 | 4
type Marks = Record<string, Mark>

type BoardConfig = {
  categoryIds: CategoryId[]
  itemCount: ItemCount
  names: Record<CategoryId, string[]>
}

type SavedBoard = BoardConfig & { marks: Record<string, Marks> }

const STORAGE_KEY = 'murdle-logic-board'
const REQUIRED_CATEGORIES: CategoryId[] = ['person', 'tool', 'place']
const CATEGORY_DETAILS: Record<CategoryId, { title: string; singular: string; examples: string }> = {
  person: { title: 'Osoby', singular: 'Osoba', examples: 'np. Pani Biała' },
  tool: { title: 'Narzędzia', singular: 'Narzędzie', examples: 'np. Świecznik' },
  place: { title: 'Miejsca', singular: 'Miejsce', examples: 'np. Biblioteka' },
  motive: { title: 'Motywy', singular: 'Motyw', examples: 'np. Zemsta' },
}

const EMPTY_NAMES: Record<CategoryId, string[]> = {
  person: [],
  tool: [],
  place: [],
  motive: [],
}

const INITIAL_CONFIG: BoardConfig = {
  categoryIds: [...REQUIRED_CATEGORIES],
  itemCount: 3,
  names: EMPTY_NAMES,
}

function isCategoryId(value: unknown): value is CategoryId {
  return value === 'person' || value === 'tool' || value === 'place' || value === 'motive'
}

function readSavedBoard(): SavedBoard | null {
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

    const marks: Record<string, Marks> = {}
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

function pairKey(first: CategoryId, second: CategoryId) {
  const order: CategoryId[] = ['person', 'tool', 'place', 'motive']
  const [earlier, later] = [first, second].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b),
  )
  return `${earlier}-${later}`
}

function pairCellKey(
  first: CategoryId,
  second: CategoryId,
  row: number,
  column: number,
) {
  const order: CategoryId[] = ['person', 'tool', 'place', 'motive']
  return order.indexOf(first) < order.indexOf(second)
    ? cellKey(row, column)
    : cellKey(column, row)
}

function cellKey(row: number, column: number) {
  return `${row}-${column}`
}

function App() {
  const [savedBoard, setSavedBoard] = useState<SavedBoard | null>(readSavedBoard)
  const [config, setConfig] = useState<BoardConfig>(() => readSavedBoard() ?? INITIAL_CONFIG)
  const [isEditing, setIsEditing] = useState(() => readSavedBoard() === null)

  useEffect(() => {
    if (!savedBoard) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBoard))
    } catch (error) {
      console.error('Nie udało się zapisać planszy w pamięci przeglądarki.', error)
    }
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
        config.names[categoryId]?.[index]?.trim() || `${CATEGORY_DETAILS[categoryId].singular} ${index + 1}`,
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
    if (!savedBoard) return
    const key = pairKey(first, second)
    const markKey = pairCellKey(first, second, row, column)
    const currentMark = savedBoard.marks[key]?.[markKey] ?? 'empty'
    const nextMark: Mark =
      currentMark === 'empty' ? 'selected' : currentMark === 'selected' ? 'crossed' : 'empty'
    const pairMarks = { ...savedBoard.marks[key] }
    if (nextMark === 'empty') delete pairMarks[markKey]
    else pairMarks[markKey] = nextMark
    setSavedBoard({
      ...savedBoard,
      marks: { ...savedBoard.marks, [key]: pairMarks },
    })
  }

  function clearMarks() {
    if (!savedBoard) return
    setSavedBoard({ ...savedBoard, marks: {} })
  }

  if (isEditing || !savedBoard) {
    const includesMotive = config.categoryIds.includes('motive')
    return (
      <main className="setup-page">
        <header className="setup-topbar">
          <a className="brand" href="#" aria-label="Murdle — plansza detektywa">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span className="brand-name">murdle<span>.</span></span>
          </a>
          <span className="setup-kicker">NOTATNIK DETEKTYWA</span>
        </header>

        <section className="setup-card">
          <div className="eyebrow"><span className="eyebrow-line" /> PRZYGOTUJ SWOJĄ PLANSZĘ</div>
          <h1>Najpierw poznajmy<br /><em>szczegóły sprawy.</em></h1>
          <p className="setup-intro">Dopasuj planszę do zagadki z książki. Wpisane nazwy zostaną tylko u Ciebie.</p>

          <div className="setup-section">
            <div className="setup-section-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Wybierz kategorie</h2>
                <p>Czy w zagadce pojawia się również motyw?</p>
              </div>
            </div>
            <div className="choice-row">
              <button
                className={`choice-card${!includesMotive ? ' chosen' : ''}`}
                onClick={() => setConfig((current) => ({ ...current, categoryIds: [...REQUIRED_CATEGORIES] }))}
                aria-pressed={!includesMotive}
              >
                <span className="choice-check">{!includesMotive ? '✓' : ''}</span>
                <span className="choice-title">3 kategorie</span>
                <span className="choice-description">Osoba · Narzędzie · Miejsce</span>
              </button>
              <button
                className={`choice-card${includesMotive ? ' chosen' : ''}`}
                onClick={() => setConfig((current) => ({
                  ...current,
                  categoryIds: [...REQUIRED_CATEGORIES, 'motive'],
                }))}
                aria-pressed={includesMotive}
              >
                <span className="choice-check">{includesMotive ? '✓' : ''}</span>
                <span className="choice-title">4 kategorie</span>
                <span className="choice-description">+ Motyw</span>
              </button>
            </div>
          </div>

          <div className="setup-section">
            <div className="setup-section-heading">
              <span className="step-number">02</span>
              <div>
                <h2>Ile elementów w każdej kategorii?</h2>
                <p>Wybierz liczbę osób, narzędzi, miejsc{includesMotive ? ' i motywów' : ''}.</p>
              </div>
            </div>
            <div className="count-selector" role="group" aria-label="Liczba elementów w kategorii">
              {([3, 4] as const).map((itemCount) => (
                <button
                  className={`count-option${config.itemCount === itemCount ? ' chosen' : ''}`}
                  key={itemCount}
                  onClick={() => updateCategoryCount(itemCount)}
                  aria-pressed={config.itemCount === itemCount}
                >
                  <strong>{itemCount}</strong>
                  <span>{itemCount === 3 ? 'elementy' : 'elementy'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section names-section">
            <div className="setup-section-heading">
              <span className="step-number">03</span>
              <div>
                <h2>Wpisz nazwy z książki</h2>
                <p>Uzupełnij elementy, aby plansza pasowała do Twojej sprawy.</p>
              </div>
            </div>
            <div className={`name-groups${includesMotive ? ' four-groups' : ''}`}>
              {config.categoryIds.map((categoryId) => (
                <fieldset className="name-group" key={categoryId}>
                  <legend>{CATEGORY_DETAILS[categoryId].title}</legend>
                  {Array.from({ length: config.itemCount }, (_, index) => (
                    <label className="name-input-wrap" key={index}>
                      <span className="name-index">{String(index + 1).padStart(2, '0')}</span>
                      <input
                        value={config.names[categoryId]?.[index] ?? ''}
                        onChange={(event) => updateName(categoryId, index, event.target.value)}
                        placeholder={`${CATEGORY_DETAILS[categoryId].examples} (${index + 1})`}
                        aria-label={`${CATEGORY_DETAILS[categoryId].singular} ${index + 1}`}
                        maxLength={36}
                      />
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </div>

          <div className="setup-actions">
            {savedBoard && (
              <button className="text-button" onClick={() => {
                setConfig(savedBoard)
                setIsEditing(false)
              }}>
                Wróć do planszy
              </button>
            )}
            <button className="primary-button" onClick={createBoard}>
              {savedBoard ? 'Zastosuj i otwórz planszę' : 'Otwórz planszę'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {savedBoard && (
            <p className="reset-note">Zastosowanie nowych ustawień wyczyści dotychczasowe zaznaczenia.</p>
          )}
        </section>
        <footer className="setup-footer">TWOJE ŚLEDZTWO · TWOJE NOTATKI · TWOJA PLANSZA</footer>
      </main>
    )
  }

  const columnCategories = [
    savedBoard.categoryIds[0],
    ...savedBoard.categoryIds.slice(2),
  ]
  const rowCategories = savedBoard.categoryIds.slice(1)
  const columnStarts = columnCategories.map(
    (_, index) => 3 + index * (savedBoard.itemCount + 1),
  )
  const categoryTracks = columnCategories.flatMap((_, index) => [
    ...Array.from({ length: savedBoard.itemCount }, () => 'minmax(0, 1fr)'),
    ...(index < columnCategories.length - 1 ? ['7px'] : []),
  ])
  const gridColumns = ['22px', 'minmax(74px, 1.25fr)', ...categoryTracks].join(' ')

  return (
    <main className="board-page">
      <header className="board-topbar">
        <a className="brand" href="#" aria-label="Murdle — plansza detektywa">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span className="brand-name">murdle<span>.</span></span>
        </a>
        <div className="board-topbar-actions">
          <span className="save-status"><span /> ZAPISANO NA TYM URZĄDZENIU</span>
          <button className="outline-button" onClick={() => {
            setConfig(savedBoard)
            setIsEditing(true)
          }}>Ustawienia planszy</button>
        </div>
      </header>

      <section className="board-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> AKTA SPRAWY</div>
          <h1>Wszystko się <em>łączy.</em></h1>
          <p>Kliknij pole, aby zmienić jego stan: puste, zaznaczone, skreślone.</p>
        </div>
        <div className="board-tools">
          <div className="mark-legend" aria-label="Znaczenie stanów pól">
            <span><i className="legend-empty" /> Puste</span>
            <span><i className="legend-selected">✓</i> Pasuje</span>
            <span><i className="legend-crossed">×</i> Wykluczone</span>
          </div>
          <button className="clear-button" onClick={clearMarks}>Wyczyść planszę</button>
        </div>
      </section>

      <section className={`logic-board categories-${savedBoard.categoryIds.length}`} aria-label="Plansza logiczna">
        <div className="shared-header" style={{ gridTemplateColumns: gridColumns }}>
          <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
          <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 1 }} />
          {columnCategories.map((categoryId, categoryIndex) => {
            const columnStart = columnStarts[categoryIndex]
            return (
              <div
                className="shared-category-heading"
                key={categoryId}
                style={{
                  gridColumn: `${columnStart} / span ${savedBoard.itemCount}`,
                  gridRow: 1,
                }}
              >
                {CATEGORY_DETAILS[categoryId].title}
              </div>
            )
          })}
          <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 2 }} />
          <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 2 }} />
          {columnCategories.flatMap((categoryId) =>
            savedBoard.names[categoryId].map((name, index) => (
              <div
                className="shared-column-label"
                key={`${categoryId}-${index}`}
                title={name}
                style={{
                  gridColumn: columnStarts[columnCategories.indexOf(categoryId)] + index,
                  gridRow: 2,
                }}
              >
                {name}
              </div>
            )),
          )}
        </div>
        {rowCategories.map((rowCategory) => (
          <div className="shared-row" key={rowCategory} style={{ gridTemplateColumns: gridColumns }}>
            <div className="shared-axis-label" style={{ gridRow: `1 / span ${savedBoard.itemCount}` }}>
              {CATEGORY_DETAILS[rowCategory].title}
            </div>
            {savedBoard.names[rowCategory].map((rowName, row) => (
              <div className="shared-data-row" key={`${rowCategory}-${row}`} style={{ display: 'contents' }}>
                <div className="shared-row-label" title={rowName}>{rowName}</div>
                {columnCategories.flatMap((columnCategory, categoryIndex) => {
                  const columnStart = columnStarts[categoryIndex]
                  if (columnCategory === rowCategory) {
                    return savedBoard.names[columnCategory].map((_, column) => (
                      <div
                        className="shared-empty-cell"
                        key={`empty-${rowCategory}-${row}-${column}`}
                        style={{ gridColumn: columnStart + column }}
                        aria-hidden="true"
                      />
                    ))
                  }
                  const cells = savedBoard.marks[pairKey(rowCategory, columnCategory)] ?? {}
                  return savedBoard.names[columnCategory].map((columnName, column) => {
                    const mark = cells[pairCellKey(rowCategory, columnCategory, row, column)] ?? 'empty'
                    const description =
                      mark === 'selected' ? 'zaznaczone, pasuje' :
                        mark === 'crossed' ? 'skreślone, wykluczone' : 'puste'
                    return (
                      <button
                        className={`matrix-cell ${mark}`}
                        key={`${rowCategory}-${columnCategory}-${row}-${column}`}
                        style={{ gridColumn: columnStart + column }}
                        onClick={() => toggleMark(rowCategory, columnCategory, row, column)}
                        aria-label={`${rowName} — ${columnName}: ${description}`}
                        title={`${rowName} × ${columnName}: ${description}. Kliknij, aby zmienić.`}
                      >
                        {mark === 'selected' ? '✓' : mark === 'crossed' ? '×' : ''}
                      </button>
                    )
                  })
                })}
              </div>
            ))}
          </div>
        ))}
      </section>

      <footer className="board-footer">
        <span>PRACUJ POWOLI. MYŚL DOKŁADNIE.</span>
        <span>NOTATNIK DETEKTYWA <i>·</i> POSTĘPY ZAPISUJĄ SIĘ AUTOMATYCZNIE</span>
      </footer>
    </main>
  )
}

export default App
