import BoardScreen from './components/BoardScreen'
import SetupScreen from './components/SetupScreen'
import { useBoard } from './hooks/useBoard'

function App() {
  const boardState = useBoard()

  if (boardState.isEditing || !boardState.savedBoard) {
    return (
      <SetupScreen
        config={boardState.config}
        savedBoard={boardState.savedBoard}
        setConfig={boardState.setConfig}
        updateCategoryCount={boardState.updateCategoryCount}
        updateName={boardState.updateName}
        createBoard={boardState.createBoard}
        onCancel={() => {
          if (boardState.savedBoard) {
            boardState.setConfig(boardState.savedBoard)
            boardState.setIsEditing(false)
          }
        }}
      />
    )
  }

  const board = boardState.savedBoard

  return (
    <BoardScreen
      board={board}
      onOpenSettings={() => {
        boardState.setConfig(board)
        boardState.setIsEditing(true)
      }}
      onToggleMark={boardState.toggleMark}
      onClearMarks={boardState.clearMarks}
    />
  )
}

export default App
