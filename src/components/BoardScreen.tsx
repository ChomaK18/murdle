import type { CategoryId, SavedBoard } from '../types/board'
import Brand from './Brand'
import LogicBoard from './LogicBoard'

type BoardScreenProps = {
  board: SavedBoard
  onOpenSettings: () => void
  onToggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
  onClearMarks: () => void
}

function BoardScreen({ board, onOpenSettings, onToggleMark, onClearMarks }: BoardScreenProps) {
  return (
    <main className="board-page">
      <header className="board-topbar">
        <Brand />
        <div className="board-topbar-actions">
          <span className="save-status"><span /> ZAPISANO NA TYM URZĄDZENIU</span>
          <button className="outline-button" onClick={onOpenSettings}>Ustawienia planszy</button>
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
          <button className="clear-button" onClick={onClearMarks}>Wyczyść planszę</button>
        </div>
      </section>

      <LogicBoard board={board} onToggleMark={onToggleMark} />

      <footer className="board-footer">
        <span>PRACUJ POWOLI. MYŚL DOKŁADNIE.</span>
        <span>NOTATNIK DETEKTYWA <i>·</i> POSTĘPY ZAPISUJĄ SIĘ AUTOMATYCZNIE</span>
      </footer>
    </main>
  )
}

export default BoardScreen
