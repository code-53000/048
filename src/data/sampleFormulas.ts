import type { Formula, FormulaGroup } from '../types'

export const sampleFormulas: Formula[] = [
  {
    id: 'f-001',
    name: '白色十字',
    notation: 'D\' R\' D R',
    description: '基础的底面十字还原方法',
    createdAt: 1700000000000,
  },
  {
    id: 'f-002',
    name: '第一层角块',
    notation: 'R U R\'',
    description: '角块还原基础公式',
    createdAt: 1700000001000,
  },
  {
    id: 'f-003',
    name: '第二层右棱',
    notation: 'U R U\' R\' U\' F\' U F',
    description: '右侧棱块还原',
    createdAt: 1700000002000,
  },
  {
    id: 'f-004',
    name: '第二层左棱',
    notation: 'U\' L\' U L U F U\' F\'',
    description: '左侧棱块还原',
    createdAt: 1700000003000,
  },
  {
    id: 'f-005',
    name: '顶层十字',
    notation: 'F R U R\' U\' F\'',
    description: 'OLL 基础公式，做出黄色十字',
    createdAt: 1700000004000,
  },
  {
    id: 'f-006',
    name: '顶层全色',
    notation: 'R U R\' U R U2 R\'',
    description: 'OLL 小鱼公式，顶面还原',
    createdAt: 1700000005000,
  },
  {
    id: 'f-007',
    name: '顶层角块',
    notation: 'R\' F R\' B2 R F\' R\' B2 R2',
    description: 'PLL 角块位置还原',
    createdAt: 1700000006000,
  },
  {
    id: 'f-008',
    name: '顶层棱块',
    notation: 'R U\' R U R U R U\' R\' U\' R2',
    description: 'PLL 三棱换公式',
    createdAt: 1700000007000,
  },
  {
    id: 'f-009',
    name: 'F2L 标准插入',
    notation: 'U R U\' R\'',
    description: '标准 F2L 插入手法',
    createdAt: 1700000008000,
  },
  {
    id: 'f-010',
    name: 'F2L 镜像插入',
    notation: 'U\' L\' U L',
    description: '镜像 F2L 插入手法',
    createdAt: 1700000009000,
  },
  {
    id: 'f-011',
    name: 'OLL21',
    notation: 'R U2 R2 U\' R2 U\' R2 U2 R',
    description: 'OLL 第21个状态',
    createdAt: 1700000010000,
  },
  {
    id: 'f-012',
    name: 'PLL Ua perm',
    notation: 'R U\' R U R U R U\' R\' U\' R2',
    description: 'PLL Ua 三棱顺时针换',
    createdAt: 1700000011000,
  },
]

export const sampleGroups: FormulaGroup[] = [
  {
    id: 'g-001',
    name: '层先法',
    description: '初学者入门的层先法公式',
    formulaIds: ['f-001', 'f-002', 'f-003', 'f-004', 'f-005', 'f-006', 'f-007', 'f-008'],
    createdAt: 1700000000000,
  },
  {
    id: 'g-002',
    name: 'CFOP 基础',
    description: 'CFOP 速拧法基础公式',
    formulaIds: ['f-005', 'f-006', 'f-007', 'f-008', 'f-009', 'f-010'],
    createdAt: 1700000010000,
  },
  {
    id: 'g-003',
    name: 'OLL 精选',
    description: '常用的 OLL 公式',
    formulaIds: ['f-005', 'f-006', 'f-011'],
    createdAt: 1700000020000,
  },
  {
    id: 'g-004',
    name: 'PLL 精选',
    description: '常用的 PLL 公式',
    formulaIds: ['f-007', 'f-008', 'f-012'],
    createdAt: 1700000030000,
  },
]
