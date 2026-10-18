import { Fragment } from 'react'
import { CATEGORY_DETAILS } from '../data/categories'
import { pairCellKey, pairKey } from '../lib/board'
import type { CategoryId, SavedBoard } from '../types/board'

type LogicBoardProps = {
  board: SavedBoard
  onToggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
}

function LogicBoard({ board, onToggleMark }: LogicBoardProps) {
  const hasMotive = board.categoryIds.includes('motive')
  const columnCategories: CategoryId[] = hasMotive
    ? ['person', 'motive', 'place']
    : ['person', 'place']
  const rowCategories: CategoryId[] = hasMotive
    ? ['tool', 'place', 'motive']
    : ['tool', 'place']
  const columnStarts = columnCategories.map(
    (_, index) => 3 + index * (board.itemCount + 1),
  )
  const categoryTracks = columnCategories.flatMap((_, index) => [
    ...Array.from({ length: board.itemCount }, () => 'minmax(40px, 1fr)'),
    ...(index < columnCategories.length - 1 ? ['7px'] : []),
  ])
  const gridColumns = ['22px', 'minmax(54px, 0.8fr)', ...categoryTracks].join(' ')

  return (
    <section className={`logic-board categories-${board.categoryIds.length}`} aria-label="Plansza logiczna">
      {rowCategories.map((rowCategory, rowCategoryIndex) => {
        const rowColumnCategories = columnCategories.slice(
          0,
          columnCategories.length - rowCategoryIndex,
        )
        const visibleHeaderCategories = rowColumnCategories
          .map((categoryId, categoryIndex) => ({ categoryId, categoryIndex }))
          .filter(({ categoryId }) =>
            (categoryId !== 'person' || rowCategoryIndex === 0) &&
            (categoryId !== 'motive' || !hasMotive || rowCategoryIndex !== 1),
          )

        return (
          <div className="matrix-band" key={rowCategory}>
            {visibleHeaderCategories.length > 0 && (
              <div className="shared-header" style={{ gridTemplateColumns: gridColumns }}>
                <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
                <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 1 }} />
                {visibleHeaderCategories.map(({ categoryId, categoryIndex }) => (
                  <div
                    className="shared-category-heading"
                    key={categoryId}
                    style={{
                      gridColumn: `${columnStarts[categoryIndex]} / span ${board.itemCount}`,
                      gridRow: 1,
                    }}
                  >
                    {categoryId === 'person' ? 'Podejrzani' : CATEGORY_DETAILS[categoryId].title}
                  </div>
                ))}
                <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 2 }} />
                <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 2 }} />
                {visibleHeaderCategories.flatMap(({ categoryId, categoryIndex }) =>
                  board.names[categoryId].map((name, index) => (
                    <div
                      className="shared-column-label"
                      key={`${categoryId}-${index}`}
                      title={name}
                      style={{
                        gridColumn: columnStarts[categoryIndex] + index,
                        gridRow: 2,
                      }}
                    >
                      {name}
                    </div>
                  )),
                )}
              </div>
            )}
            <div
              className="shared-row"
              style={{
                gridTemplateColumns: gridColumns,
                gridTemplateRows: `repeat(${board.itemCount}, minmax(var(--matrix-row-min-height), auto))`,
              }}
            >
              <div
                className="shared-axis-label"
                style={{
                  gridColumn: 1,
                  gridRow: `1 / span ${board.itemCount}`,
                  minHeight: `calc(var(--matrix-row-min-height) * ${board.itemCount})`,
                }}
              >
                <span>{CATEGORY_DETAILS[rowCategory].title}</span>
              </div>
              {board.names[rowCategory].map((rowName, row) => (
                <Fragment key={`${rowCategory}-${row}`}>
                  <div
                    className="shared-row-label"
                    title={rowName}
                    style={{ gridColumn: 2, gridRow: row + 1 }}
                  >
                    {rowName}
                  </div>
                  {rowColumnCategories.flatMap((columnCategory, categoryIndex) => {
                    const columnStart = columnStarts[categoryIndex]
                    const cells = board.marks[pairKey(rowCategory, columnCategory)] ?? {}
                    return board.names[columnCategory].map((columnName, column) => {
                      const mark = cells[pairCellKey(rowCategory, columnCategory, row, column)] ?? 'empty'
                      const description =
                        mark === 'selected' ? 'zaznaczone, pasuje' :
                          mark === 'crossed' ? 'skreślone, wykluczone' : 'puste'
                      return (
                        <button
                          className={`matrix-cell ${mark}`}
                          key={`${rowCategory}-${columnCategory}-${row}-${column}`}
                          style={{ gridColumn: columnStart + column, gridRow: row + 1 }}
                          onClick={() => onToggleMark(rowCategory, columnCategory, row, column)}
                          aria-label={`${rowName} — ${columnName}: ${description}`}
                          title={`${rowName} × ${columnName}: ${description}. Kliknij, aby zmienić.`}
                        >
                          {mark === 'selected' ? '✓' : mark === 'crossed' ? '×' : ''}
                        </button>
                      )
                    })
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export default LogicBoard
