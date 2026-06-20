interface NavBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function NavBar(props: NavBarProps) {
  const tabs = [
    { id: 'timer', label: '计时器' },
    { id: 'formulas', label: '公式库' },
    { id: 'stats', label: '成绩统计' },
  ]

  return (
    <nav class="nav-bar">
      <div class="nav-brand">
        <span class="nav-brand-icon">🧊</span>
        <span>魔方速拧训练器</span>
      </div>
      <div class="nav-tabs">
        {tabs.map((tab) => (
          <button
            class={`nav-tab ${props.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => props.onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
