import { createSignal } from 'solid-js'
import type { Formula, FormulaGroup } from '../types'
import { generateId } from '../utils/timer'
import {
  getAllFormulas,
  getAllFormulaGroups,
  addFormula,
  updateFormula,
  deleteFormula,
  addFormulaGroup,
  updateFormulaGroup,
  deleteFormulaGroup,
  importFormulas as dbImportFormulas,
  exportFormulas as dbExportFormulas,
} from '../db'

export function createFormulaStore() {
  const [formulas, setFormulas] = createSignal<Formula[]>([])
  const [groups, setGroups] = createSignal<FormulaGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = createSignal<string | null>(null)

  const loadAll = async () => {
    const [allFormulas, allGroups] = await Promise.all([
      getAllFormulas(),
      getAllFormulaGroups(),
    ])
    setFormulas(allFormulas.sort((a, b) => a.createdAt - b.createdAt))
    setGroups(allGroups.sort((a, b) => a.createdAt - b.createdAt))
  }

  loadAll()

  const createFormula = async (data: {
    name: string
    notation: string
    description?: string
  }): Promise<Formula> => {
    const formula: Formula = {
      id: generateId(),
      name: data.name,
      notation: data.notation,
      description: data.description,
      createdAt: Date.now(),
    }
    await addFormula(formula)
    setFormulas(prev => [...prev, formula])
    return formula
  }

  const updateFormulaById = async (id: string, data: Partial<Formula>) => {
    const formula = formulas().find(f => f.id === id)
    if (!formula) return

    const updated = { ...formula, ...data }
    await updateFormula(updated)
    setFormulas(prev => prev.map(f => (f.id === id ? updated : f)))
  }

  const deleteFormulaById = async (id: string) => {
    await deleteFormula(id)
    setFormulas(prev => prev.filter(f => f.id !== id))

    setGroups(prev =>
      prev.map(g => ({
        ...g,
        formulaIds: g.formulaIds.filter(fid => fid !== id),
      }))
    )

    for (const group of groups()) {
      if (group.formulaIds.includes(id)) {
        await updateFormulaGroup({
          ...group,
          formulaIds: group.formulaIds.filter(fid => fid !== id),
        })
      }
    }
  }

  const createGroup = async (data: {
    name: string
    description?: string
  }): Promise<FormulaGroup> => {
    const group: FormulaGroup = {
      id: generateId(),
      name: data.name,
      description: data.description,
      formulaIds: [],
      createdAt: Date.now(),
    }
    await addFormulaGroup(group)
    setGroups(prev => [...prev, group])
    return group
  }

  const updateGroupById = async (id: string, data: Partial<FormulaGroup>) => {
    const group = groups().find(g => g.id === id)
    if (!group) return

    const updated = { ...group, ...data }
    await updateFormulaGroup(updated)
    setGroups(prev => prev.map(g => (g.id === id ? updated : g)))
  }

  const deleteGroupById = async (id: string) => {
    await deleteFormulaGroup(id)
    setGroups(prev => prev.filter(g => g.id !== id))
    if (selectedGroupId() === id) {
      setSelectedGroupId(null)
    }
  }

  const addFormulaToGroup = async (groupId: string, formulaId: string) => {
    const group = groups().find(g => g.id === groupId)
    if (!group || group.formulaIds.includes(formulaId)) return

    const updated = { ...group, formulaIds: [...group.formulaIds, formulaId] }
    await updateFormulaGroup(updated)
    setGroups(prev => prev.map(g => (g.id === groupId ? updated : g)))
  }

  const removeFormulaFromGroup = async (groupId: string, formulaId: string) => {
    const group = groups().find(g => g.id === groupId)
    if (!group) return

    const updated = { ...group, formulaIds: group.formulaIds.filter(id => id !== formulaId) }
    await updateFormulaGroup(updated)
    setGroups(prev => prev.map(g => (g.id === groupId ? updated : g)))
  }

  const getFormulasInGroup = (groupId: string): Formula[] => {
    const group = groups().find(g => g.id === groupId)
    if (!group) return []
    const formulaMap = new Map(formulas().map(f => [f.id, f]))
    return group.formulaIds
      .map(id => formulaMap.get(id))
      .filter((f): f is Formula => f !== undefined)
  }

  const getFormulasNotInGroup = (groupId: string): Formula[] => {
    const group = groups().find(g => g.id === groupId)
    if (!group) return formulas()
    const groupSet = new Set(group.formulaIds)
    return formulas().filter(f => !groupSet.has(f.id))
  }

  const importFormulas = async (data: {
    formulas: Formula[]
    groups: FormulaGroup[]
  }) => {
    await dbImportFormulas(data)
    await loadAll()
  }

  const exportFormulas = async () => {
    return await dbExportFormulas()
  }

  return {
    formulas,
    groups,
    selectedGroupId,
    setSelectedGroupId,
    loadAll,
    createFormula,
    updateFormulaById,
    deleteFormulaById,
    createGroup,
    updateGroupById,
    deleteGroupById,
    addFormulaToGroup,
    removeFormulaFromGroup,
    getFormulasInGroup,
    getFormulasNotInGroup,
    importFormulas,
    exportFormulas,
  }
}

export type FormulaStore = ReturnType<typeof createFormulaStore>
