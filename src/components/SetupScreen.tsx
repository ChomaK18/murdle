import { CATEGORY_DETAILS, REQUIRED_CATEGORIES } from '../data/categories'
import type { BoardConfig, CategoryId, ItemCount, SavedBoard } from '../types/board'
import Brand from './Brand'

type SetupScreenProps = {
  puzzleId: number
  config: BoardConfig
  savedBoard: SavedBoard | null
  setConfig: (config: BoardConfig | ((current: BoardConfig) => BoardConfig)) => void
  updateCategoryCount: (itemCount: ItemCount) => void
  updateName: (categoryId: CategoryId, index: number, name: string) => void
  createBoard: () => void
  onCancel: () => void
}

function SetupScreen({
  puzzleId,
  config,
  savedBoard,
  setConfig,
  updateCategoryCount,
  updateName,
  createBoard,
  onCancel,
}: SetupScreenProps) {
  const includesMotive = config.categoryIds.includes('motive')

  return (
    <main className="setup-page">
      <header className="setup-topbar">
        <Brand />
        <span className="setup-kicker">ZAGADKA {puzzleId.toString().padStart(2, '0')} · NOTATNIK DETEKTYWA</span>
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
              onClick={() => setConfig((current) => ({
                ...current,
                categoryIds: [...REQUIRED_CATEGORIES],
              }))}
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
                <span>elementy</span>
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
            <button className="text-button" onClick={onCancel}>Wróć do planszy</button>
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

export default SetupScreen
