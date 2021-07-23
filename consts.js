export const MULTITENANT = process.env.MULTITENANT || true

export const TABLE_NAMES = {
  TASKS: 'taskman_tasks',
  COMMENTS: 'taskman_comments',
  SOLV_EVENTS: 'taskman_solver_events'
}

export const PRIORITY = {
  LOW: 'low',
  NORMAL: 'nor',
  HIGH: 'hi',
  CRITICAL: 'cri'
}

export const STATE = {
  NEW: 'new',
  INPROGRESS: 'prog',
  WAIT3PARTY: '3rdP',
  DONE: 'done',
  CLOSED: 'closd'
}

export const SOLVING_STATE = {
  PENDING: 'p',
  WORKING: 'w',
  DONE: 'd'
}

export const SOLVEREVENT_TYPE = {
  PRIO: 'prio',
  SOLVER: 'solvr',
  DUE: 'due',
  STATE: 'state'
}