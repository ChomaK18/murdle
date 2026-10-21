import BoardScreen from './components/BoardScreen'
import PuzzleTrackerScreen from './components/PuzzleTrackerScreen'
import SetupScreen from './components/SetupScreen'
import { useBoard } from './hooks/useBoard'

function App() {
  const boardState = useBoard()

  if (boardState.activePuzzleId === null) {
    return (
      <PuzzleTrackerScreen
        puzzles={boardState.puzzles}
        onOpenPuzzle={boardState.openPuzzle}
        onToggleSolved={boardState.toggleSolved}
      />
    )
  }

  if (boardState.isEditing || !boardState.activeBoard) {
    return (
      <SetupScreen
        puzzleId={boardState.activePuzzleId}
        config={boardState.config}
        savedBoard={boardState.activeBoard}
        suspectSuggestions={boardState.suspectSuggestions}
        setConfig={boardState.setConfig}
        updateCategoryCount={boardState.updateCategoryCount}
        updateName={boardState.updateName}
        createBoard={boardState.createBoard}
        onCancel={boardState.cancelEditing}
      />
    )
  }

  const board = boardState.activeBoard
  const puzzleId = boardState.activePuzzleId
  const status = boardState.puzzles[puzzleId]?.status ?? 'in-progress'

  return (
    <BoardScreen
      puzzleId={puzzleId}
      status={status}
      board={board}
      onBack={boardState.closePuzzle}
      onNextPuzzle={() => boardState.openPuzzle(puzzleId + 1)}
      onOpenSettings={boardState.openSettings}
      onToggleMark={boardState.toggleMark}
      onToggleAccusation={boardState.toggleAccusation}
      onClearMarks={boardState.clearMarks}
      onToggleSolved={() => boardState.toggleSolved(puzzleId)}
    />
  )
}

export default App
