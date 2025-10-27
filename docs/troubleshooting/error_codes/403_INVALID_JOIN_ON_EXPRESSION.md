---
slug: /troubleshooting/error-codes/403_INVALID_JOIN_ON_EXPRESSION
sidebar_label: '403 INVALID_JOIN_ON_EXPRESSION'
doc_type: 'reference'
keywords: ['error codes', 'INVALID_JOIN_ON_EXPRESSION', '403']
title: '403 INVALID_JOIN_ON_EXPRESSION'
description: 'ClickHouse error code - 403 INVALID_JOIN_ON_EXPRESSION'
---

# Error Code 403: INVALID_JOIN_ON_EXPRESSION

:::tip
This error occurs when ClickHouse cannot parse or process the JOIN ON conditions in your query.
The error indicates that the JOIN expression violates ClickHouse's rules for join conditions, particularly when dealing with complex expressions, OR clauses, NULL conditions, or non-equi joins.
:::

**Error Message Format:**

```text
Code: 403. DB::Exception: Cannot get JOIN keys from JOIN ON section: '<condition>'. (INVALID_JOIN_ON_EXPRESSION)
```

or

```text
Code: 403. DB::Exception: Invalid expression for JOIN ON. Expected equals expression, got <expression>. (INVALID_JOIN_ON_EXPRESSION)
```

### When you'll see it {#when-youll-see-it}

1. **OR conditions not in disjunctive normal form (DNF):**
   - `t1.a = t2.a AND (t1.b = t2.b OR t1.c = t2.c)` - OR not at top level
   - `(t1.a = t2.a AND t1.b = t2.b) OR (t1.a = t2.a AND t1.c = t2.c)` ✅ - Proper DNF

2. **JOIN conditions with only NULL checks:**
   - `(t1.id IS NULL) AND (t2.id IS NULL)` - No equality condition
   - Missing join keys between tables

3. **Non-equi joins without experimental setting:**
   - `t1.a > t2.b` without `allow_experimental_join_condition = 1`

4. **Incompatible settings combination:**
   - Using `allow_experimental_join_condition = 1` with `join_use_nulls = 1` (fixed in recent versions)

5. **Complex OR conditions with filters:**
   - `t1.id = t2.id OR t1.val = 'constant'` - Second part has no join key

### Potential causes {#potential-causes}

1. **OR conditions nested within AND** - ClickHouse requires OR at the top level (disjunctive normal form)

2. **Missing join keys in OR branches** - Each OR branch must contain at least one equality condition between tables:

   ```sql
   -- Wrong: second branch has no join key
   ON t1.id = t2.id OR (t1.val IS NULL AND t2.val IS NULL)
   
   -- Correct: both branches have join keys (implicit equality via NULL matching)
   ON t1.id = t2.id OR (isNull(t1.val) = isNull(t2.val) AND t1.val IS NULL)
   ```

3. **Non-equi join conditions without proper setup** - Inequality conditions (`<`, `>`, `!=`) require:

   - `allow_experimental_join_condition = 1` setting
   - `hash` or `grace_hash` join algorithm
   - Cannot be used with `join_use_nulls = 1`

4. **Power BI/Tableau generated queries** - BI tools often generate JOIN conditions with NULL handling that ClickHouse doesn't support in the old query analyzer

5. **Multiple JOIN with column ambiguity** - In multi-table JOINs, columns may be referenced with wrong table qualifiers

### Quick fixes {#quick-fixes}

**1. Rewrite OR conditions to disjunctive normal form (DNF):**

```sql
-- Wrong: AND at top level
SELECT * FROM t1 JOIN t2
ON t1.key = t2.key AND (t1.a = t2.a OR t1.b = t2.b);

-- Correct: OR at top level, repeat common conditions
SELECT * FROM t1 JOIN t2
ON (t1.key = t2.key AND t1.a = t2.a)
   OR (t1.key = t2.key AND t1.b = t2.b);
```

**2. For NULL-safe joins, use `isNotDistinctFrom` or `COALESCE`:**

```sql
-- Instead of: t1.id = t2.id OR (t1.id IS NULL AND t2.id IS NULL)

-- Option 1: isNotDistinctFrom (matches NULLs)
SELECT * FROM t1 LEFT JOIN t2
ON isNotDistinctFrom(t1.id, t2.id);

-- Option 2: COALESCE with equality check (most efficient)
SELECT * FROM t1 LEFT JOIN t2
ON COALESCE(t1.id, 0) = COALESCE(t2.id, 0)
   AND isNull(t1.id) = isNull(t2.id);

-- Option 3: Using isNull equality
SELECT * FROM t1 LEFT JOIN t2
ON t1.id = t2.id
   OR (isNull(t1.id) = isNull(t2.id) AND t1.id IS NULL);
```

**3. Enable experimental analyzer for better OR/NULL support:**

```sql
SET allow_experimental_analyzer = 1;

-- Now this works:
SELECT * FROM t1 LEFT JOIN t2
ON t1.id = t2.id OR (t1.id IS NULL AND t2.id IS NULL);
```

**4. For non-equi joins (inequality conditions):**

```sql
-- Enable experimental support
SET allow_experimental_join_condition = 1;

-- Now you can use inequality joins
SELECT * FROM t1 INNER JOIN t2
ON t1.key = t2.key AND t1.a > t2.b;
```

**Important:** Do NOT use `join_use_nulls = 1` with non-equi joins - these settings are incompatible.

**5. Simplify complex filter conditions:**

```sql
-- Wrong: constant filter in OR without join key
SELECT * FROM t1 JOIN t2
ON t1.id = t2.id OR t1.val = 'constant';

-- Correct: move filter to WHERE clause
SELECT * FROM t1 JOIN t2
ON t1.id = t2.id
WHERE t1.val = 'constant' OR t1.id IS NOT NULL;
```

### Important notes {#important-notes}

- **Disjunctive Normal Form (DNF) requirement:** OR operators must be at the top level of the JOIN condition. Each OR branch should contain complete join conditions.

- **Join key requirement:** Each branch of an OR condition must include at least one equality condition between the joined tables.

- **Experimental analyzer:** The new query analyzer (`allow_experimental_analyzer = 1`) has better support for complex JOIN conditions, including NULL handling. It may become default in future versions.

- **Performance considerations:**
  - Each OR branch creates a separate hash table, increasing memory usage linearly
  - Using `COALESCE` for NULL matching is ~5x faster than OR with NULL checks
  - Power BI bidirectional filters generate complex OR conditions that may not work

- **BI tool compatibility:** Tools like Power BI, Tableau, and Looker may generate incompatible JOIN syntax. Solutions:
  - Use import mode instead of DirectQuery
  - Enable `allow_experimental_analyzer = 1` at cluster level
  - Use ODBC direct queries with custom SQL
  - Create views with compatible JOIN syntax

### Related documentation {#related-documentation}

- [JOIN clause documentation](/sql-reference/statements/select/join)
- [JOIN with inequality conditions](/sql-reference/statements/select/join#join-with-inequality-conditions-for-columns-from-different-tables)
- [NULL values in JOIN keys](/sql-reference/statements/select/join#null-values-in-join-keys)
- [`join_algorithm` setting](/operations/settings/settings#join_algorithm)
- [`allow_experimental_join_condition` setting](/operations/settings/settings#allow_experimental_join_condition)
