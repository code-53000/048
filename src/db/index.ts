import type { SolveRecord, Formula, FormulaGroup, PracticeSession } from '../types'

const DB_NAME = 'cube-timer-db'
const DB_VERSION = 1

const STORES = {
  records: 'solveRecords',
  formulas: 'formulas',
  formulaGroups: 'formulaGroups',
  sessions: 'practiceSessions',
} as const

let dbInstance: IDBDatabase | null = null

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORES.records)) {
        const store = db.createObjectStore(STORES.records, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('formulaGroupId', 'formulaGroupId')
        store.createIndex('formulaId', 'formulaId')
      }

      if (!db.objectStoreNames.contains(STORES.formulas)) {
        const store = db.createObjectStore(STORES.formulas, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains(STORES.formulaGroups)) {
        const store = db.createObjectStore(STORES.formulaGroups, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains(STORES.sessions)) {
        const store = db.createObjectStore(STORES.sessions, { keyPath: 'id' })
        store.createIndex('startTime', 'startTime')
      }
    }
  })
}

export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function transactionPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

export async function getAllRecords(): Promise<SolveRecord[]> {
  const db = await openDB()
  const transaction = db.transaction(STORES.records, 'readonly')
  const store = transaction.objectStore(STORES.records)
  const index = store.index('createdAt')
  const records = await promisifyRequest(index.getAll())
  return records as SolveRecord[]
}

export async function addRecord(record: SolveRecord): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.records, 'readwrite')
  const store = transaction.objectStore(STORES.records)
  store.add(record)
  await transactionPromise(transaction)
}

export async function updateRecord(record: SolveRecord): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.records, 'readwrite')
  const store = transaction.objectStore(STORES.records)
  store.put(record)
  await transactionPromise(transaction)
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.records, 'readwrite')
  const store = transaction.objectStore(STORES.records)
  store.delete(id)
  await transactionPromise(transaction)
}

export async function clearAllRecords(): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.records, 'readwrite')
  const store = transaction.objectStore(STORES.records)
  store.clear()
  await transactionPromise(transaction)
}

export async function getAllFormulas(): Promise<Formula[]> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulas, 'readonly')
  const store = transaction.objectStore(STORES.formulas)
  const index = store.index('createdAt')
  const formulas = await promisifyRequest(index.getAll())
  return formulas as Formula[]
}

export async function addFormula(formula: Formula): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulas, 'readwrite')
  const store = transaction.objectStore(STORES.formulas)
  store.add(formula)
  await transactionPromise(transaction)
}

export async function updateFormula(formula: Formula): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulas, 'readwrite')
  const store = transaction.objectStore(STORES.formulas)
  store.put(formula)
  await transactionPromise(transaction)
}

export async function deleteFormula(id: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulas, 'readwrite')
  const store = transaction.objectStore(STORES.formulas)
  store.delete(id)
  await transactionPromise(transaction)
}

export async function getAllFormulaGroups(): Promise<FormulaGroup[]> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulaGroups, 'readonly')
  const store = transaction.objectStore(STORES.formulaGroups)
  const index = store.index('createdAt')
  const groups = await promisifyRequest(index.getAll())
  return groups as FormulaGroup[]
}

export async function addFormulaGroup(group: FormulaGroup): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulaGroups, 'readwrite')
  const store = transaction.objectStore(STORES.formulaGroups)
  store.add(group)
  await transactionPromise(transaction)
}

export async function updateFormulaGroup(group: FormulaGroup): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulaGroups, 'readwrite')
  const store = transaction.objectStore(STORES.formulaGroups)
  store.put(group)
  await transactionPromise(transaction)
}

export async function deleteFormulaGroup(id: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.formulaGroups, 'readwrite')
  const store = transaction.objectStore(STORES.formulaGroups)
  store.delete(id)
  await transactionPromise(transaction)
}

export async function getAllSessions(): Promise<PracticeSession[]> {
  const db = await openDB()
  const transaction = db.transaction(STORES.sessions, 'readonly')
  const store = transaction.objectStore(STORES.sessions)
  const index = store.index('startTime')
  const sessions = await promisifyRequest(index.getAll())
  return sessions as PracticeSession[]
}

export async function addSession(session: PracticeSession): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.sessions, 'readwrite')
  const store = transaction.objectStore(STORES.sessions)
  store.add(session)
  await transactionPromise(transaction)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORES.sessions, 'readwrite')
  const store = transaction.objectStore(STORES.sessions)
  store.delete(id)
  await transactionPromise(transaction)
}

export async function importFormulas(data: {
  formulas: Formula[]
  groups: FormulaGroup[]
}): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(
    [STORES.formulas, STORES.formulaGroups],
    'readwrite'
  )

  const formulaStore = transaction.objectStore(STORES.formulas)
  const groupStore = transaction.objectStore(STORES.formulaGroups)

  for (const formula of data.formulas) {
    formulaStore.put(formula)
  }
  for (const group of data.groups) {
    groupStore.put(group)
  }

  await transactionPromise(transaction)
}

export async function exportFormulas(): Promise<{
  formulas: Formula[]
  groups: FormulaGroup[]
}> {
  const [formulas, groups] = await Promise.all([
    getAllFormulas(),
    getAllFormulaGroups(),
  ])
  return { formulas, groups }
}
