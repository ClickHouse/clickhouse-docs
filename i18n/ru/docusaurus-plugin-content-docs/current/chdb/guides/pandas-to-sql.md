---
title: 'SQL для пользователей pandas'
sidebar_label: 'Сопоставление с SQL'
slug: /chdb/guides/pandas-to-sql
description: 'Понимание того, как операции pandas сопоставляются с SQL в DataStore'
keywords: ['chdb', 'datastore', 'pandas', 'sql', 'сопоставление', 'запрос']
doc_type: 'guide'
---

# SQL для пользователей pandas \{#sql-for-pandas-users\}

DataStore компилирует операции в стиле pandas в оптимизированные SQL-запросы. Это руководство помогает пользователям pandas понять SQL, лежащий в основе их операций.

## Просмотр сгенерированного SQL-кода \{#viewing-sql\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
    .sort('sum', ascending=False)
    .head(10)
)

# View the SQL
print(query.to_sql())
```

Результат:

```sql
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
ORDER BY sum DESC
LIMIT 10
```

***


## Соответствие базовых операций \{#basic\}

### Фильтрация (WHERE) \{#filtering-where\}

| pandas | SQL |
|--------|-----|
| `df[df['age'] > 25]` | `WHERE age > 25` |
| `df[df['city'] == 'NYC']` | `WHERE city = 'NYC'` |
| `df[(df['x'] > 10) & (df['y'] < 20)]` | `WHERE x > 10 AND y < 20` |
| `df[(df['a'] == 1) \| (df['b'] == 2)]` | `WHERE a = 1 OR b = 2` |
| `df[~(df['status'] == 'inactive')]` | `WHERE NOT status = 'inactive'` |
| `df[df['col'].isin([1, 2, 3])]` | `WHERE col IN (1, 2, 3)` |
| `df[df['val'].between(10, 20)]` | `WHERE val BETWEEN 10 AND 20` |
| `df[df['name'].str.contains('John')]` | `WHERE position('John' IN name) > 0` |

### Выборка (SELECT) \{#selection-select\}

| pandas | SQL |
|--------|-----|
| `df['col']` | `SELECT col` |
| `df[['a', 'b', 'c']]` | `SELECT a, b, c` |
| `df.head(10)` | `LIMIT 10` |
| `df.tail(10)` | Сложнее (ORDER BY ... DESC LIMIT 10) |
| `df.drop_duplicates()` | `SELECT DISTINCT *` |

### Сортировка (ORDER BY) \{#sorting-order-by\}

| pandas | SQL |
|--------|-----|
| `df.sort_values('col')` | `ORDER BY col ASC` |
| `df.sort_values('col', ascending=False)` | `ORDER BY col DESC` |
| `df.sort_values(['a', 'b'])` | `ORDER BY a ASC, b ASC` |
| `df.sort_values(['a', 'b'], ascending=[True, False])` | `ORDER BY a ASC, b DESC` |
| `df.nlargest(10, 'col')` | `ORDER BY col DESC LIMIT 10` |
| `df.nsmallest(5, 'col')` | `ORDER BY col ASC LIMIT 5` |

---

## GroupBy и агрегация \{#groupby\}

### Базовые операции GroupBy \{#basic-groupby\}

| pandas | SQL |
|--------|-----|
| `df.groupby('city')['sales'].sum()` | `SELECT city, SUM(sales) FROM ... GROUP BY city` |
| `df.groupby('city')['sales'].mean()` | `SELECT city, AVG(sales) FROM ... GROUP BY city` |
| `df.groupby('city').size()` | `SELECT city, COUNT(*) FROM ... GROUP BY city` |
| `df.groupby(['a', 'b'])['c'].sum()` | `SELECT a, b, SUM(c) FROM ... GROUP BY a, b` |

### Агрегатные функции \{#aggregation-functions\}

| pandas | SQL |
|--------|-----|
| `sum()` | `SUM()` |
| `mean()` | `AVG()` |
| `count()` | `COUNT()` |
| `min()` | `MIN()` |
| `max()` | `MAX()` |
| `std()` | `stddevPop()` |
| `var()` | `varPop()` |
| `median()` | `MEDIAN()` |
| `nunique()` | `COUNT(DISTINCT col)` |
| `first()` | `any()` |
| `last()` | `anyLast()` |

### Несколько агрегаций \{#multiple-aggregations\}

```python
# pandas
df.groupby('city').agg({
    'sales': ['sum', 'mean'],
    'quantity': 'sum'
})

# SQL
SELECT city, 
       SUM(sales) AS sales_sum, 
       AVG(sales) AS sales_mean,
       SUM(quantity) AS quantity_sum
FROM data
GROUP BY city
```


### Оператор HAVING \{#having-clause\}

```python
# pandas style
df.groupby('city')['sales'].sum().query('sales > 10000')

# DataStore style
ds.groupby('city').agg({'sales': 'sum'}).having(ds['sum'] > 10000)

# SQL
SELECT city, SUM(sales) AS sum
FROM data
GROUP BY city
HAVING sum > 10000
```

***


## Операции соединения \{#joins\}

| pandas | SQL |
|--------|-----|
| `pd.merge(df1, df2, on='id')` | `JOIN df2 ON df1.id = df2.id` |
| `pd.merge(df1, df2, on='id', how='left')` | `LEFT JOIN df2 ON ...` |
| `pd.merge(df1, df2, on='id', how='right')` | `RIGHT JOIN df2 ON ...` |
| `pd.merge(df1, df2, on='id', how='outer')` | `FULL OUTER JOIN df2 ON ...` |
| `pd.merge(df1, df2, left_on='a', right_on='b')` | `JOIN df2 ON df1.a = df2.b` |

### Пример объединения строк \{#join-example\}

```python
# pandas
result = pd.merge(employees, departments, on='dept_id', how='left')

# SQL equivalent
SELECT *
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id
```

***


## Операции со строками \{#string\}

| pandas | SQL |
|--------|-----|
| `df['col'].str.upper()` | `upper(col)` |
| `df['col'].str.lower()` | `lower(col)` |
| `df['col'].str.len()` | `length(col)` |
| `df['col'].str.strip()` | `trim(col)` |
| `df['col'].str.contains('x')` | `position('x' IN col) > 0` |
| `df['col'].str.startswith('x')` | `startsWith(col, 'x')` |
| `df['col'].str.endswith('x')` | `endsWith(col, 'x')` |
| `df['col'].str.replace('a', 'b')` | `replace(col, 'a', 'b')` |
| `df['col'].str[:5]` | `substring(col, 1, 5)` |

---

## Операции с датой и временем \{#datetime\}

| pandas | SQL |
|--------|-----|
| `df['date'].dt.year` | `toYear(date)` |
| `df['date'].dt.month` | `toMonth(date)` |
| `df['date'].dt.day` | `toDayOfMonth(date)` |
| `df['date'].dt.hour` | `toHour(date)` |
| `df['date'].dt.dayofweek` | `toDayOfWeek(date)` |
| `df['date'].dt.quarter` | `toQuarter(date)` |

---

## Арифметические операции \{#arithmetic\}

| pandas | SQL |
|--------|-----|
| `df['a'] + df['b']` | `a + b` |
| `df['a'] - df['b']` | `a - b` |
| `df['a'] * df['b']` | `a * b` |
| `df['a'] / df['b']` | `a / b` |
| `df['a'] // df['b']` | `intDiv(a, b)` |
| `df['a'] % df['b']` | `a % b` |
| `df['a'] ** 2` | `pow(a, 2)` |
| `df['a'].abs()` | `abs(a)` |
| `df['a'].round(2)` | `round(a, 2)` |

---

## Обработка значений NULL \{#null\}

| pandas | SQL |
|--------|-----|
| `df['col'].isna()` | `isNull(col)` |
| `df['col'].notna()` | `isNotNull(col)` |
| `df.dropna()` | `WHERE col IS NOT NULL` (для каждого столбца) |
| `df.fillna(0)` | `ifNull(col, 0)` |
| `df.fillna({'a': 0, 'b': 'x'})` | `ifNull(a, 0), ifNull(b, 'x')` |

---

## Полный пример \{#example\}

### Код на pandas \{#pandas-code\}

```python
import pandas as pd

df = pd.read_csv("sales.csv")

result = (df
    [df['date'] >= '2024-01-01']              # Filter
    [df['amount'] > 100]                      # Filter
    [['region', 'category', 'amount']]        # Select columns
    .groupby(['region', 'category'])          # Group
    .agg({
        'amount': ['sum', 'mean', 'count']
    })
    .reset_index()                            # Flatten
    .query('amount_sum > 10000')              # Having
    .sort_values('amount_sum', ascending=False)  # Sort
    .head(20)                                 # Limit
)
```


### Эквивалентный SQL‑запрос \{#equivalent-sql\}

```sql
SELECT 
    region,
    category,
    SUM(amount) AS amount_sum,
    AVG(amount) AS amount_mean,
    COUNT(amount) AS amount_count
FROM file('sales.csv', 'CSVWithNames')
WHERE date >= '2024-01-01'
  AND amount > 100
GROUP BY region, category
HAVING amount_sum > 10000
ORDER BY amount_sum DESC
LIMIT 20
```


### Код DataStore \{#datastore-code\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .select('region', 'category', 'amount')
    .groupby('region', 'category')
    .agg({'amount': ['sum', 'mean', 'count']})
    .having(ds['sum'] > 10000)
    .sort('sum', ascending=False)
    .head(20)
)

# View the generated SQL
print(result.to_sql())
```

***


## Краткий обзор ключевых слов SQL \{#summary\}

| Операция pandas | Оператор SQL |
|------------------|------------|
| `df[condition]` | `WHERE` |
| `df[['a', 'b']]` | `SELECT a, b` |
| `df.groupby('x')` | `GROUP BY x` |
| `.agg({'col': 'sum'})` | `SUM(col)` |
| `.sort_values('x')` | `ORDER BY x` |
| `.head(n)` | `LIMIT n` |
| `pd.merge()` | `JOIN` |
| `.drop_duplicates()` | `DISTINCT` |
| `.having()` | `HAVING` |

---

## Советы пользователям pandas \{#tips\}

### 1. Думайте в терминах SQL-операций \{#think-in-sql\}

Когда пишете код DataStore, задумайтесь, какой SQL-запрос вы хотели бы получить:

```python
# If you want: SELECT ... WHERE ... GROUP BY ... ORDER BY ... LIMIT
# Write:
ds.filter(...).groupby(...).agg(...).sort(...).head(...)
```


### 2. Используйте to_sql() для изучения SQL \{#use-to-sql\}

```python
# See how your pandas code becomes SQL
query = ds.filter(ds['x'] > 10).groupby('y').sum()
print(query.to_sql())
```


### 3. Используйте возможности SQL \{#leverage-sql-features\}

DataStore предоставляет вам возможности SQL с синтаксисом pandas:

```python
# Window functions
ds['rank'] = F.row_number().over(partition_by='category', order_by='score')

# Conditional aggregation
ds.groupby('region').agg({
    'high_value': ('amount', F.sum_if(Field('amount') > 1000))
})
```
