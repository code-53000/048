import { createSignal } from 'solid-js'
import NavBar from './components/NavBar'
import TimerPage from './components/TimerPage'
import FormulaPage from './components/FormulaPage'
import StatsPage from './components/StatsPage'
import { createTimerStore } from './stores/timerStore'
import { createFormulaStore } from './stores/formulaStore'

export default function App() {
  const [activeTab, setActiveTab] = createSignal('timer')
  const timerStore = createTimerStore()
  const formulaStore = createFormulaStore()

  return (
    <div class="app-container">
      <NavBar activeTab={activeTab()} onTabChange={setActiveTab} />
      <main class="main-content">
        {activeTab() === 'timer' && <TimerPage timerStore={timerStore} />}
        {activeTab() === 'formulas' && <FormulaPage formulaStore={formulaStore} />}
        {activeTab() === 'stats' && (
          <StatsPage timerStore={timerStore} formulaStore={formulaStore} />
        )}
      </main>
    </div>
  )
}
