import type { CategoryId, PuzzleStatus, SavedBoard } from '../types/board'
import Brand from './Brand'
import LogicBoard from './LogicBoard'

type BoardScreenProps = {
  puzzleId: number
  status: PuzzleStatus
  board: SavedBoard
  onBack: () => void
  onOpenSettings: () => void
  onToggleMark: (first: CategoryId, second: CategoryId, row: number, column: number) => void
  onToggleAccusation: (categoryId: CategoryId, index: number) => void
  onClearMarks: () => void
  onToggleSolved: () => void
}

function BoardScreen({
  puzzleId,
  status,
  board,
  onBack,
  onOpenSettings,
  onToggleMark,
  onToggleAccusation,
  onClearMarks,
  onToggleSolved,
}: BoardScreenProps) {
  return (
    <main className="board-page">
      <header className="board-topbar">
        <Brand />
        <div className="board-topbar-actions">
          <span className="save-status"><span /> ZAPISANO NA TYM URZĄDZENIU</span>
          <button className="outline-button" onClick={onBack}>Lista zagadek</button>
          <button className="outline-button" onClick={onOpenSettings}>Ustawienia planszy</button>
        </div>
      </header>

      <section className="board-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> ZAGADKA {puzzleId.toString().padStart(2, '0')} · AKTA SPRAWY</div>
          <h1>Wszystko się <em>łączy.</em></h1>
          <p>Kliknij pole, aby zmienić jego stan. Przytrzymaj nazwę, aby oznaczyć podejrzenie.</p>
        </div>
        <div className="board-tools">
          <div className="mark-legend" aria-label="Znaczenie stanów pól">
            <span><i className="legend-empty" /> Puste</span>
            <span><i className="legend-selected">✓</i> Pasuje</span>
            <span><i className="legend-crossed">×</i> Wykluczone</span>
            <span><i className="legend-accusation" /> Podejrzenie</span>
          </div>
          <button className="clear-button" onClick={onClearMarks}>Wyczyść planszę</button>
          <button
            className={`solved-action${status === 'solved' ? ' is-solved' : ''}`}
            onClick={onToggleSolved}
            aria-pressed={status === 'solved'}
          >
            {status === 'solved' ? '✓ ZAGADKA ROZWIĄZANA' : 'OZNACZ JAKO ROZWIĄZANĄ'}
          </button>
        </div>
      </section>

      <LogicBoard
        board={board}
        onToggleMark={onToggleMark}
        onToggleAccusation={onToggleAccusation}
      />

      <footer className="board-footer">
        <span>PRACUJ POWOLI. MYŚL DOKŁADNIE.</span>
        <span>NOTATNIK DETEKTYWA <i>·</i> POSTĘPY ZAPISUJĄ SIĘ AUTOMATYCZNIE</span>
      </footer>
    </main>
  )
}

export default BoardScreen
