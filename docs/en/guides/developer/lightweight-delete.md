---
slug: /en/guides/developer/lightweght-delete
sidebar_label: Lightweight Delete
keywords: [lightweight delete]
---

# Lightweight Delete Internals

The idea behind Lightweight Delete is that when `DELETE FROM table ...` query is executed ClickHouse only saves a mask where each row is marked as either “existing” or as “deleted”. Those “deleted” rows become invisible for subsequent queries, but physically the rows are removed only later by subsequent merges. Writing this mask is usually much more lightweight than what is done by `ALTER table DELETE ...` query.

# How it is implemented
The mask is implemented as a hidden `_row_exists` system column that stores True for all visible rows and False for deleted ones. This column is only present in a part if some rows in this part were deleted. In other words the column is not persisted when it has all values equal to True.

## SELECT query
When the column is present `SELECT ... FROM table WHERE condition` query internally is extended by an additional predicate on `_row_exists` and becomes similar to 
```sql
    SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
At execution time it first reads `_row_exists` column and figures out which rows are not visible and if there are many deleted rows it can figure out which granules can be fully skipped when reading the rest of the columns.

## DELETE query
`DELETE FROM table WHERE condition` is translated into `ALTER table UPDATE _row_exists = 0 WHERE condition` mutation. Internally this mutation is executed in 2 steps:
1. `SELECT count() FROM table WHERE condition` for each individual part to figure out if the part is affected.
2. Mutate affected parts, and make hardlinks for unaffected parts. Mutating a part in fact only writes `_row_exists` column and just hardlinks all other columns’ files in case of Wide parts. But for Compact parts all columns are rewritten because they all are stored together in one file.

So if we compare Lightweight Delete to `ALTER DELETE` in the first step they both do the same thing to figure out which parts are affected, but in the second step `ALTER DELETE` does much more work because it reads and rewrites all columns’ files for the affected parts.

With the described implementation now we can see what can negatively affect 'DELETE FROM' execution time:
- Heavy WHERE condition in DELETE query
- Mutations queue filled with other mutations, because all mutations on a table are executed sequentially
- Table having very large number of data parts
- A lot of data in Compact parts, because in Compact part all columns are stored in one file.

:::note This implementation might change in the future. :::
