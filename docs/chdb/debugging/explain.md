---
title: 'explain() Method'
sidebar_label: 'explain()'
slug: /chdb/debugging/explain
description: 'View DataStore execution plans with the explain() method'
keywords: ['chdb', 'datastore', 'explain', 'execution', 'plan', 'sql']
doc_type: 'reference'
---

# explain() Method

The `explain()` method shows the execution plan for a DataStore query, helping you understand what operations will be performed and what SQL will be generated.

## Basic Usage {#basic}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
    .sort('sum', ascending=False)
)

# View execution plan
query.explain()
```

## Syntax {#syntax}

```python
explain(verbose=False) -> None
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `verbose` | bool | `False` | Show additional metadata |

## Output Format {#output-format}

### Standard Output {#standard}

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('sales.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-5
    ️  Note: SQL operations after Pandas ops use Python() table function

 [2] 🚀 [chDB] WHERE: "amount" > 1000
 [3] 🚀 [chDB] GROUP BY: region
 [4] 🚀 [chDB] AGGREGATE: sum(amount), avg(amount)
 [5] 🚀 [chDB] ORDER BY: sum DESC

────────────────────────────────────────────────────────────────────────────────
Final State: 📊 Pending (lazy, not yet executed)
             └─> Will execute when print(), .to_df(), .execute() is called

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'csv')
WHERE "amount" > 1000
GROUP BY region
ORDER BY sum DESC

================================================================================
```

### Icons Legend {#icons}

| Icon | Meaning |
|------|---------|
| 📊 | Data source |
| 🚀 | chDB (SQL) operation |
| 🐼 | pandas operation |

### Verbose Output {#verbose}

```python
query.explain(verbose=True)
```

Verbose mode shows additional details for each operation, including the full SQL query with internal row-order tracking mechanisms.

---

## Three Execution Phases {#phases}

The explain output shows operations in three phases:

### Phase 1: SQL Query Building (Lazy) {#phase-1}

Operations that compile to SQL:

```text
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000      
  3. GroupBy: region
  4. Aggregate: sum(amount)
```

### Phase 2: Execution Point {#phase-2}

When a trigger occurs:

```text
  5. Execute SQL -> DataFrame
     Trigger: to_df() called
```

### Phase 3: DataFrame Operations {#phase-3}

Operations after execution:

```text
  6. [pandas] pivot_table(...)
  7. [pandas] apply(custom_func)
```

---

## Understanding the Plan {#understanding}

### Source Information {#source}

```text
Source: file('sales.csv', 'CSVWithNames')
```

- `file()` - ClickHouse file() table function
- `'CSVWithNames'` - File format with header

Other source types:
```text
Source: s3('bucket/data.parquet', ...)
Source: mysql('host', 'db', 'table', ...)
Source: __dataframe__  (pandas DataFrame input)
```

### Filter Operations {#filter}

```text
Filter: amount > 1000 AND status = 'active'
```

Shows the WHERE clause that will be applied.

### GroupBy and Aggregate {#groupby}

```text
GroupBy: region, category
Aggregate: sum(amount), avg(amount), count(id)
```

Shows GROUP BY columns and aggregation functions.

### Sort Operations {#sort}

```text
Sort: sum DESC, region ASC
```

Shows ORDER BY clause.

### Limit Operations {#limit}

```text
Limit: 10
Offset: 100
```

Shows LIMIT and OFFSET.

---

## Engine Information {#engine}

When using verbose mode, you can see which engine will be used:

```text
Filter: amount > 1000
  - Engine: chdb
  - Pushdown: Yes

Apply: custom_function
  - Engine: pandas
  - Pushdown: No
```

### Pushdown {#pushdown}

- **Yes**: Operation will be executed at the data source (SQL)
- **No**: Operation requires pandas execution

---

## Examples {#examples}

### Simple Query {#example-simple}

```python
ds = pd.read_csv("data.csv")
ds.filter(ds['age'] > 25).explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('data.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-2

 [2] 🚀 [chDB] WHERE: "age" > 25

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT * FROM file('data.csv', 'csv') WHERE "age" > 25

================================================================================
```

### Complex Aggregation {#example-complex}

```python
query = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .select('region', 'category', 'amount')
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count']
    })
    .sort('sum', ascending=False)
    .limit(20)
)
query.explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('sales.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-8

 [2] 🚀 [chDB] WHERE: "date" >= '2024-01-01'
 [3] 🚀 [chDB] WHERE: "amount" > 100
 [4] 🚀 [chDB] SELECT: region, category, amount
 [5] 🚀 [chDB] GROUP BY: region, category
 [6] 🚀 [chDB] AGGREGATE: sum(amount), avg(amount), count(amount)
 [7] 🚀 [chDB] ORDER BY: sum DESC
 [8] 🚀 [chDB] LIMIT: 20

────────────────────────────────────────────────────────────────────────────────
Generated SQL Query:
────────────────────────────────────────────────────────────────────────────────

SELECT region, category, 
       SUM(amount) AS sum, 
       AVG(amount) AS mean, 
       COUNT(amount) AS count
FROM file('sales.csv', 'csv')
WHERE "date" >= '2024-01-01' AND "amount" > 100
GROUP BY region, category
ORDER BY sum DESC
LIMIT 20

================================================================================
```

### Mixed SQL and pandas {#example-mixed}

When operations cannot be fully pushed to SQL, the plan shows multiple segments:

```python
query = (ds
    .filter(ds['age'] > 25)           # SQL
    .groupby('city')                   # SQL
    .agg({'salary': 'mean'})           # SQL
    .apply(lambda x: x * 1.1)          # pandas (triggers segment split)
    .filter(ds['mean'] > 50000)        # SQL (new segment)
)
query.explain()
```

```text
================================================================================
Execution Plan (in execution order)
================================================================================

 [1] 📊 Data Source: file('data.csv', 'csv')

Operations:
────────────────────────────────────────────────────────────────────────────────
    ️  Segment 1 [chDB] (from source): Operations 2-4
    ️  Segment 2 [Pandas] (on DataFrame): Operation 5
    ️  Segment 3 [chDB] (on DataFrame): Operation 6
    ️  Note: SQL operations after Pandas ops use Python() table function

 [2] 🚀 [chDB] WHERE: "age" > 25
 [3] 🚀 [chDB] GROUP BY: city
 [4] 🚀 [chDB] AGGREGATE: avg(salary)
 [5] 🐼 [Pandas] APPLY: lambda
 [6] 🚀 [chDB] WHERE: "mean" > 50000

================================================================================
```

---

## Debugging with explain() {#debugging}

### Check Filter Logic {#debug-filter}

```python
# Verify your filter is correct
query = ds.filter((ds['age'] > 25) & (ds['city'] == 'NYC'))
query.explain()
# Output shows: Filter: age > 25 AND city = 'NYC'
```

### Verify Column Selection {#debug-select}

```python
# Check column pruning
query = ds.select('name', 'age').filter(ds['age'] > 25)
query.explain()
# Output shows: SELECT name, age FROM ... WHERE age > 25
```

### Understand Aggregation {#debug-agg}

```python
# Check aggregation functions
query = ds.groupby('dept').agg({'salary': ['sum', 'mean', 'std']})
query.explain()
# Output shows: SELECT dept, SUM(salary), AVG(salary), stddevPop(salary)
```

---

## Best Practices {#best-practices}

### 1. Check Before Executing Large Queries {#best-practice-1}

```python
# Always explain first for large data
query = ds.complex_pipeline()
query.explain()  # Check plan

# If plan looks correct
result = query.to_df()  # Execute
```

### 2. Use Verbose for Debugging {#best-practice-2}

```python
# When something seems wrong
query.explain(verbose=True)
# Shows engine selection and pushdown info
```

### 3. Compare with to_sql() {#best-practice-3}

```python
# explain() shows the plan
query.explain()

# to_sql() shows just the SQL
print(query.to_sql())

# Both useful for different purposes
```

### 4. Check Pushdown Status {#best-practice-4}

```python
# Verbose mode shows if operations are pushed down
query.explain(verbose=True)

# If Pushdown: No, operation runs in pandas
# Consider restructuring query for better performance
```
