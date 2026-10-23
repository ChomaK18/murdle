import { PUZZLE_COUNT, type CategoryId, type PuzzleStatus, type SavedBoard } from '../types/board'
import Brand from './Brand'
import LogicBoard from './LogicBoard'

type BoardScreenProps = {
  puzzleId: number
  status: PuzzleStatus
  board: SavedBoard
  onSelectSuspect: (index: number | null) => void
  onBack: () => void
  onNextPuzzle: () => void
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
  onSelectSuspect,
  onBack,
  onNextPuzzle,
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
          <label className="suspect-scenario">
            <span>Zakładam, że mordercą jest</span>
            <select
              value={board.activeSuspectIndex ?? ''}
              onChange={(event) =>
                onSelectSuspect(event.target.value === '' ? null : Number(event.target.value))
              }
              aria-label="Wybierz podejrzanego w testowanym scenariuszu"
            >
              <option value="">Wybierz podejrzanego</option>
              {board.names.person.map((name, index) => (
                <option value={index} key={`${index}-${name}`}>{name}</option>
              ))}
            </select>
            <small>Ta osoba kłamie, pozostali mówią prawdę.</small>
          </label>
          <div className="mark-legend" aria-label="Znaczenie stanów pól">
            <span><i className="legend-empty" /> Puste</span>
            <span><i className="legend-selected">✓</i> Pasuje</span>
            <span><i className="legend-crossed">×</i> Wykluczone</span>
            <span><i className="legend-accusation" /> Podejrzenie</span>
          </div>
          <button className="clear-button" onClick={onClearMarks}>Wyczyść planszę</button>
          <div className="solved-actions">
            <button
              className={`solved-action${status === 'solved' ? ' is-solved' : ''}`}
              onClick={onToggleSolved}
              aria-pressed={status === 'solved'}
            >
              {status === 'solved' ? '✓ ZAGADKA ROZWIĄZANA' : 'OZNACZ JAKO ROZWIĄZANĄ'}
            </button>
            {status === 'solved' && puzzleId < PUZZLE_COUNT && (
              <button className="outline-button" onClick={onNextPuzzle}>
                Następna zagadka →
              </button>
            )}
          </div>
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
