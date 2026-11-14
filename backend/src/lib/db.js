// Table names below are constants from our own code, never user input.

/** Picks the provided (non-undefined) fields of `body` and maps them to column names. */
export function pickColumns(body, columnMap) {
  const columns = [];
  const values = [];
  for (const [field, column] of Object.entries(columnMap)) {
    if (body[field] !== undefined) {
      columns.push(column);
      values.push(body[field]);
    }
  }
  return { columns, values };
}

export async function nextSortOrder(db, table, scope) {
  const where = scope ? ` WHERE ${scope.column} = ?` : '';
  const stmt = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ${table}${where}`);
  return (await (scope ? stmt.bind(scope.value) : stmt).first('n')) ?? 0;
}

/** Rewrites sort_order so that ids[0] comes first. Fails if any id is unknown / out of scope. */
export async function reorder(db, table, ids, scope) {
  const where = scope ? ` AND ${scope.column} = ?` : '';
  const statements = ids.map((id, index) => {
    const stmt = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?${where}`);
    return scope ? stmt.bind(index, id, scope.value) : stmt.bind(index, id);
  });
  const results = await db.batch(statements);
  return results.every((r) => r.meta.changes === 1);
}
