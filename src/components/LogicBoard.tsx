import { CATEGORY_DETAILS } from '../data/categories'
import { pairCellKey, pairKey } from '../lib/board'
import type { CategoryId, SavedBoard } from '../types/board'

type LogicBoardProps = {
  board: SavedBoard
  onToggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
}

function LogicBoard({ board, onToggleMark }: LogicBoardProps) {
  const columnCategories = [board.categoryIds[0], ...board.categoryIds.slice(2)]
  const rowCategories = board.categoryIds.slice(1)
  const columnStarts = columnCategories.map(
    (_, index) => 3 + index * (board.itemCount + 1),
  )
  const categoryTracks = columnCategories.flatMap((_, index) => [
    ...Array.from({ length: board.itemCount }, () => 'minmax(0, 1fr)'),
    ...(index < columnCategories.length - 1 ? ['7px'] : []),
  ])
  const gridColumns = ['22px', 'minmax(74px, 1.25fr)', ...categoryTracks].join(' ')

  return (
    <section className={`logic-board categories-${board.categoryIds.length}`} aria-label="Plansza logiczna">
      <div className="shared-header" style={{ gridTemplateColumns: gridColumns }}>
        <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }} />
        <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 1 }} />
        {columnCategories.map((categoryId, categoryIndex) => (
          <div
            className="shared-category-heading"
            key={categoryId}
            style={{
              gridColumn: `${columnStarts[categoryIndex]} / span ${board.itemCount}`,
              gridRow: 1,
            }}
          >
            {CATEGORY_DETAILS[categoryId].title}
          </div>
        ))}
        <div className="shared-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 2 }} />
        <div className="shared-row-heading" style={{ gridColumn: 2, gridRow: 2 }} />
        {columnCategories.flatMap((categoryId, categoryIndex) =>
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
      {rowCategories.map((rowCategory) => (
        <div className="shared-row" key={rowCategory} style={{ gridTemplateColumns: gridColumns }}>
          <div className="shared-axis-label" style={{ gridRow: `1 / span ${board.itemCount}` }}>
            {CATEGORY_DETAILS[rowCategory].title}
          </div>
          {board.names[rowCategory].map((rowName, row) => (
            <div className="shared-data-row" key={`${rowCategory}-${row}`} style={{ display: 'contents' }}>
              <div className="shared-row-label" title={rowName}>{rowName}</div>
              {columnCategories.flatMap((columnCategory, categoryIndex) => {
                const columnStart = columnStarts[categoryIndex]
                if (columnCategory === rowCategory) {
                  return board.names[columnCategory].map((_, column) => (
                    <div
                      className="shared-empty-cell"
                      key={`empty-${rowCategory}-${row}-${column}`}
                      style={{ gridColumn: columnStart + column }}
                      aria-hidden="true"
                    />
                  ))
                }

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
                      style={{ gridColumn: columnStart + column }}
                      onClick={() => onToggleMark(rowCategory, columnCategory, row, column)}
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
  )
}

export default LogicBoard
