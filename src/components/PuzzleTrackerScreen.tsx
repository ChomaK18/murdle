import type { PuzzleCollection, PuzzleStatus } from '../types/board'
import Brand from './Brand'

const PUZZLE_COUNT = 100

type PuzzleTrackerScreenProps = {
  puzzles: PuzzleCollection
  onOpenPuzzle: (puzzleId: number) => void
  onToggleSolved: (puzzleId: number) => void
}

const STATUS_LABELS: Record<PuzzleStatus, string> = {
  'not-started': 'Nierozpoczęta',
  'in-progress': 'W trakcie',
  solved: 'Rozwiązana',
}

function PuzzleTrackerScreen({
  puzzles,
  onOpenPuzzle,
  onToggleSolved,
}: PuzzleTrackerScreenProps) {
  const solvedCount = Object.values(puzzles).filter((puzzle) => puzzle.status === 'solved').length
  const inProgressCount = Object.values(puzzles).filter(
    (puzzle) => puzzle.status === 'in-progress',
  ).length

  return (
    <main className="tracker-page">
      <header className="tracker-topbar">
        <Brand />
        <span className="tracker-kicker">TOM PIERWSZY · 100 ZAGADEK</span>
      </header>

      <section className="tracker-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> TWOJE ŚLEDZTWA</div>
          <h1>Jedna sprawa<br /><em>po drugiej.</em></h1>
          <p>Wybierz zagadkę, aby otworzyć jej planszę. Postęp zapisuje się automatycznie.</p>
        </div>
        <div className="tracker-summary" aria-label="Podsumowanie zagadek">
          <div><strong>{inProgressCount.toString().padStart(2, '0')}</strong><span>W TRAKCIE</span></div>
          <div><strong>{solvedCount.toString().padStart(2, '0')}</strong><span>ROZWIĄZANE</span></div>
          <div><strong>{(PUZZLE_COUNT - solvedCount - inProgressCount).toString().padStart(2, '0')}</strong><span>DO ODKRYCIA</span></div>
        </div>
      </section>

      <section className="puzzle-library" aria-labelledby="puzzle-library-title">
        <div className="puzzle-library-heading">
          <div>
            <span className="library-kicker">AKTA · TOM 01</span>
            <h2 id="puzzle-library-title">Spis zagadek <span>01—100</span></h2>
          </div>
          <div className="tracker-legend" aria-label="Statusy zagadek">
            <span><i className="status-dot status-not-started" /> Nierozpoczęta</span>
            <span><i className="status-dot status-in-progress" /> W trakcie</span>
            <span><i className="status-dot status-solved" /> Rozwiązana</span>
          </div>
        </div>

        <div className="puzzle-list">
          {Array.from({ length: PUZZLE_COUNT }, (_, index) => index + 1).map((puzzleId) => {
            const progress = puzzles[puzzleId]
            const status = progress?.status ?? 'not-started'
            return (
              <article className={`puzzle-entry ${status}`} key={puzzleId}>
                <button
                  className="puzzle-open"
                  onClick={() => onOpenPuzzle(puzzleId)}
                  aria-label={`Otwórz zagadkę ${puzzleId}, status: ${STATUS_LABELS[status]}`}
                >
                  <span className="puzzle-entry-number">{puzzleId.toString().padStart(2, '0')}</span>
                  <span className="puzzle-entry-state">
                    <i className={`status-dot status-${status}`} />
                    {STATUS_LABELS[status]}
                  </span>
                </button>
                <button
                  className="puzzle-solved-toggle"
                  onClick={() => onToggleSolved(puzzleId)}
                  aria-label={status === 'solved'
                    ? `Oznacz zagadkę ${puzzleId} jako nierozwiązaną`
                    : `Oznacz zagadkę ${puzzleId} jako rozwiązaną`}
                  aria-pressed={status === 'solved'}
                  title={status === 'solved' ? 'Cofnij oznaczenie rozwiązania' : 'Oznacz jako rozwiązaną'}
                >
                  {status === 'solved' ? '✓' : ''}
                </button>
              </article>
            )
          })}
        </div>
        <p className="puzzle-list-hint">Wybierz numer, aby otworzyć planszę. Pole wyboru oznacza zagadkę jako rozwiązaną.</p>
      </section>

      <footer className="board-footer">
        <span>PRACUJ POWOLI. MYŚL DOKŁADNIE.</span>
        <span>NOTATNIK DETEKTYWA <i>·</i> POSTĘPY ZAPISUJĄ SIĘ AUTOMATYCZNIE</span>
      </footer>
    </main>
  )
}

export default PuzzleTrackerScreen
