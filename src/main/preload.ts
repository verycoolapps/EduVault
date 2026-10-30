import { contextBridge, ipcRenderer } from 'electron';

const api = {
  auth: {
    login: (data: any) => ipcRenderer.invoke('auth:login', data),
    changePassword: (data: any) => ipcRenderer.invoke('auth:changePassword', data),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (data: any) => ipcRenderer.invoke('settings:set', data),
  },
  students: {
    getAll: () => ipcRenderer.invoke('students:getAll'),
    add: (data: any) => ipcRenderer.invoke('students:add', data),
    update: (data: any) => ipcRenderer.invoke('students:update', data),
    delete: (id: number) => ipcRenderer.invoke('students:delete', id),
  },
  employees: {
    getAll: () => ipcRenderer.invoke('employees:getAll'),
    add: (data: any) => ipcRenderer.invoke('employees:add', data),
    update: (data: any) => ipcRenderer.invoke('employees:update', data),
  },
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    add: (data: any) => ipcRenderer.invoke('accounts:add', data),
    update: (data: any) => ipcRenderer.invoke('accounts:update', data),
  },
  spp: {
    getAll: (filters?: any) => ipcRenderer.invoke('spp:getAll', filters),
    getByStudent: (id: number) => ipcRenderer.invoke('spp:getByStudent', id),
    add: (data: any) => ipcRenderer.invoke('spp:add', data),
  },
  buildingFee: {
    getAll: () => ipcRenderer.invoke('buildingFee:getAll'),
    add: (data: any) => ipcRenderer.invoke('buildingFee:add', data),
    pay: (data: any) => ipcRenderer.invoke('buildingFee:pay', data),
  },
  otherIncome: {
    getAll: () => ipcRenderer.invoke('otherIncome:getAll'),
    add: (data: any) => ipcRenderer.invoke('otherIncome:add', data),
  },
  salary: {
    calculate: (data: any) => ipcRenderer.invoke('salary:calculate', data),
    save: (data: any) => ipcRenderer.invoke('salary:save', data),
    getHistory: (filters?: any) => ipcRenderer.invoke('salary:getHistory', filters),
  },
  discount: {
    getAll: () => ipcRenderer.invoke('discount:getAll'),
    add: (data: any) => ipcRenderer.invoke('discount:add', data),
  },
  procurement: {
    getAll: () => ipcRenderer.invoke('procurement:getAll'),
    add: (data: any) => ipcRenderer.invoke('procurement:add', data),
  },
  routineExpense: {
    getAll: () => ipcRenderer.invoke('routineExpense:getAll'),
    add: (data: any) => ipcRenderer.invoke('routineExpense:add', data),
  },
  reports: {
    income: (filters: any) => ipcRenderer.invoke('reports:income', filters),
    expense: (filters: any) => ipcRenderer.invoke('reports:expense', filters),
    generalLedger: (filters: any) => ipcRenderer.invoke('reports:generalLedger', filters),
    trialBalance: (filters: any) => ipcRenderer.invoke('reports:trialBalance', filters),
    profitLoss: (filters: any) => ipcRenderer.invoke('reports:profitLoss', filters),
    balanceSheet: (filters: any) => ipcRenderer.invoke('reports:balanceSheet', filters),
    cashFlow: (filters: any) => ipcRenderer.invoke('reports:cashFlow', filters),
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  },
  dashboard: {
    getSummary: () => ipcRenderer.invoke('dashboard:getSummary'),
  },
};

contextBridge.exposeInMainWorld('api', api);
