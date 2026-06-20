import { createSignal, For, Show } from 'solid-js'
import type { FormulaStore } from '../../stores/formulaStore'
import { sampleFormulas, sampleGroups } from '../../data/sampleFormulas'

interface FormulaPageProps {
  formulaStore: FormulaStore
}

export default function FormulaPage(props: FormulaPageProps) {
  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [showFormulaModal, setShowFormulaModal] = createSignal(false)
  const [editingGroup, setEditingGroup] = createSignal<string | null>(null)
  const [editingFormula, setEditingFormula] = createSignal<string | null>(null)

  const [groupName, setGroupName] = createSignal('')
  const [groupDesc, setGroupDesc] = createSignal('')
  const [formulaName, setFormulaName] = createSignal('')
  const [formulaNotation, setFormulaNotation] = createSignal('')
  const [formulaDesc, setFormulaDesc] = createSignal('')

  const openCreateGroup = () => {
    setEditingGroup(null)
    setGroupName('')
    setGroupDesc('')
    setShowGroupModal(true)
  }

  const openEditGroup = (groupId: string) => {
    const group = props.formulaStore.groups().find(g => g.id === groupId)
    if (!group) return
    setEditingGroup(groupId)
    setGroupName(group.name)
    setGroupDesc(group.description || '')
    setShowGroupModal(true)
  }

  const handleSaveGroup = async () => {
    if (!groupName().trim()) return

    if (editingGroup()) {
      await props.formulaStore.updateGroupById(editingGroup()!, {
        name: groupName().trim(),
        description: groupDesc().trim() || undefined,
      })
    } else {
      await props.formulaStore.createGroup({
        name: groupName().trim(),
        description: groupDesc().trim() || undefined,
      })
    }
    setShowGroupModal(false)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定要删除这个分组吗？分组内的公式不会被删除。')) return
    await props.formulaStore.deleteGroupById(groupId)
  }

  const openCreateFormula = () => {
    setEditingFormula(null)
    setFormulaName('')
    setFormulaNotation('')
    setFormulaDesc('')
    setShowFormulaModal(true)
  }

  const openEditFormula = (formulaId: string) => {
    const formula = props.formulaStore.formulas().find(f => f.id === formulaId)
    if (!formula) return
    setEditingFormula(formulaId)
    setFormulaName(formula.name)
    setFormulaNotation(formula.notation)
    setFormulaDesc(formula.description || '')
    setShowFormulaModal(true)
  }

  const handleSaveFormula = async () => {
    if (!formulaName().trim() || !formulaNotation().trim()) return

    if (editingFormula()) {
      await props.formulaStore.updateFormulaById(editingFormula()!, {
        name: formulaName().trim(),
        notation: formulaNotation().trim(),
        description: formulaDesc().trim() || undefined,
      })
    } else {
      const formula = await props.formulaStore.createFormula({
        name: formulaName().trim(),
        notation: formulaNotation().trim(),
        description: formulaDesc().trim() || undefined,
      })
      if (props.formulaStore.selectedGroupId()) {
        await props.formulaStore.addFormulaToGroup(props.formulaStore.selectedGroupId()!, formula.id)
      }
    }
    setShowFormulaModal(false)
  }

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('确定要删除这个公式吗？')) return
    await props.formulaStore.deleteFormulaById(formulaId)
  }

  const handleImportSample = async () => {
    if (!confirm('确定要导入示例公式吗？已有相同 ID 的数据会被覆盖。')) return
    await props.formulaStore.importFormulas({
      formulas: sampleFormulas,
      groups: sampleGroups,
    })
  }

  const handleExport = async () => {
    const data = await props.formulaStore.exportFormulas()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formulas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.formulas && data.groups) {
          await props.formulaStore.importFormulas(data)
          alert('导入成功！')
        } else {
          alert('文件格式不正确')
        }
      } catch {
        alert('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const currentFormulas = () => {
    if (props.formulaStore.selectedGroupId()) {
      return props.formulaStore.getFormulasInGroup(props.formulaStore.selectedGroupId()!)
    }
    return props.formulaStore.formulas()
  }

  return (
    <div class="page-layout">
      <div class="page-header">
        <h1 class="page-title">公式库</h1>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm" onClick={handleImportSample}>
            导入示例
          </button>
          <button class="btn btn-sm" onClick={handleImport}>
            导入
          </button>
          <button class="btn btn-sm" onClick={handleExport}>
            导出
          </button>
        </div>
      </div>

      <div class="two-column">
        <div class="sidebar">
          <div class="sidebar-section">
            <div class="sidebar-section-title">
              <span>分组</span>
              <button class="btn btn-sm" onClick={openCreateGroup}>
                + 新建
              </button>
            </div>
            <div class="group-list">
              <div
                class={`group-item ${!props.formulaStore.selectedGroupId() ? 'active' : ''}`}
                onClick={() => props.formulaStore.setSelectedGroupId(null)}
              >
                全部公式 ({props.formulaStore.formulas().length})
              </div>
              <For each={props.formulaStore.groups()}>
                {(group) => (
                  <div
                    class={`group-item ${props.formulaStore.selectedGroupId() === group.id ? 'active' : ''}`}
                    style="display: flex; justify-content: space-between; align-items: center;"
                  >
                    <span onClick={() => props.formulaStore.setSelectedGroupId(group.id)} style="flex: 1;">
                      {group.name} ({group.formulaIds.length})
                    </span>
                    <span style="display: flex; gap: 4px;">
                      <button class="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEditGroup(group.id); }}>
                        ✎
                      </button>
                      <button class="btn btn-sm" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}>
                        🗑
                      </button>
                    </span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="content-area">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 18px; font-weight: 600;">
              {props.formulaStore.selectedGroupId()
                ? props.formulaStore.groups().find(g => g.id === props.formulaStore.selectedGroupId())?.name
                : '全部公式'}
            </h2>
            <button class="btn btn-primary" onClick={openCreateFormula}>
              + 添加公式
            </button>
          </div>

          <For each={currentFormulas()}>
            {(formula) => (
              <div class="formula-card">
                <div class="formula-card-header">
                  <div class="formula-name">{formula.name}</div>
                  <div class="formula-actions">
                    <button class="btn btn-sm" onClick={() => openEditFormula(formula.id)}>
                      编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onClick={() => handleDeleteFormula(formula.id)}>
                      删除
                    </button>
                  </div>
                </div>
                <div class="formula-notation">{formula.notation}</div>
                {formula.description && (
                  <div class="formula-desc">{formula.description}</div>
                )}
              </div>
            )}
          </For>

          <Show when={currentFormulas().length === 0}>
            <div class="empty-state">
              <div class="empty-state-icon">📝</div>
              <div class="empty-state-text">还没有公式，点击"添加公式"开始创建</div>
            </div>
          </Show>
        </div>
      </div>

      <Show when={showGroupModal()}>
        <div class="modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              {editingGroup() ? '编辑分组' : '新建分组'}
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">分组名称</label>
                <input
                  class="form-input"
                  type="text"
                  value={groupName()}
                  onInput={(e) => setGroupName(e.target.value)}
                  placeholder="例如：CFOP"
                  autofocus
                />
              </div>
              <div class="form-group">
                <label class="form-label">描述（可选）</label>
                <textarea
                  class="form-textarea"
                  value={groupDesc()}
                  onInput={(e) => setGroupDesc(e.target.value)}
                  placeholder="简单描述一下这个分组"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn" onClick={() => setShowGroupModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={handleSaveGroup}>保存</button>
            </div>
          </div>
        </div>
      </Show>

      <Show when={showFormulaModal()}>
        <div class="modal-overlay" onClick={() => setShowFormulaModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              {editingFormula() ? '编辑公式' : '添加公式'}
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">公式名称</label>
                <input
                  class="form-input"
                  type="text"
                  value={formulaName()}
                  onInput={(e) => setFormulaName(e.target.value)}
                  placeholder="例如：OLL 小鱼"
                  autofocus
                />
              </div>
              <div class="form-group">
                <label class="form-label">公式写法</label>
                <input
                  class="form-input"
                  type="text"
                  value={formulaNotation()}
                  onInput={(e) => setFormulaNotation(e.target.value)}
                  placeholder="例如：R U R' U R U2 R'"
                />
              </div>
              <div class="form-group">
                <label class="form-label">备注（可选）</label>
                <textarea
                  class="form-textarea"
                  value={formulaDesc()}
                  onInput={(e) => setFormulaDesc(e.target.value)}
                  placeholder="公式的注意事项或技巧"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn" onClick={() => setShowFormulaModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={handleSaveFormula}>保存</button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
