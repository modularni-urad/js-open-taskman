export const TABLE_NAMES = {
  TASKS: 'taskman_tasks',
  COMMENTS: 'taskman_comments'
}

export const PRIORITY = {
  LOW: 'low',
  NORMAL: 'nor',
  HIGH: 'hi',
  CRITICAL: 'cri'
}

export const STATE = {
  NEW: 'new',
  DELEG_REQ: 'dlgt',
  DELEG_REFUSED: 'refd',
  INPROGRESS: 'prog',
  FINISHED: 'fini',
  DONE: 'done',
  ERROR: 'err',
  CLOSED: 'clsd'
}

export function getQB (knex, tablename, schema) {
  return schema
    ? knex(knex.ref(tablename).withSchema(schema))
    : knex(tablename)
}