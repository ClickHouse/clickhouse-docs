---
title: 'Построение запросов в DataStore'
sidebar_label: 'Построение запросов'
slug: /chdb/datastore/query-building
description: 'Построение SQL-подобных запросов в DataStore с использованием флюентного интерфейса и цепочек вызовов методов'
keywords: ['chdb', 'datastore', 'запрос', 'select', 'filter', 'where', 'join', 'groupby']
doc_type: 'reference'
---

# Построение запросов в DataStore \{#datastore-query-building\}

DataStore предоставляет методы построения запросов в стиле SQL, которые транслируются в оптимизированные SQL-запросы. Все операции остаются ленивыми до тех пор, пока не понадобятся результаты.

## Обзор методов построения запросов \{#overview\}

| Метод | SQL-эквивалент | Описание |
|--------|---------------|-------------|
| `select(*cols)` | `SELECT cols` | Выбор столбцов |
| `filter(cond)` | `WHERE cond` | Фильтрация строк |
| `where(cond)` | `WHERE cond` | Синоним метода filter |
| `sort(*cols)` | `ORDER BY cols` | Сортировка строк |
| `orderby(*cols)` | `ORDER BY cols` | Синоним метода sort |
| `limit(n)` | `LIMIT n` | Ограничение числа строк |
| `offset(n)` | `OFFSET n` | Пропуск строк |
| `distinct()` | `DISTINCT` | Удаление дубликатов |
| `groupby(*cols)` | `GROUP BY cols` | Группировка строк |
| `having(cond)` | `HAVING cond` | Фильтрация групп |
| `join(right, ...)` | `JOIN` | Соединение DataStore'ов |
| `union(other)` | `UNION` | Объединение результатов |

---

## Выборка \{#selection\}

### `select` \{#select\}

Выберите конкретные столбцы из DataStore.

```python
select(*fields: Union[str, Expression]) -> DataStore
```

**Примеры:**

```python
from chdb.datastore import DataStore

ds = DataStore.from_file("employees.csv")

# Select by column names
result = ds.select('name', 'age', 'salary')

# Select all columns
result = ds.select('*')

# Select with expressions
result = ds.select(
    'name',
    (ds['salary'] * 12).as_('annual_salary'),
    ds['age'].as_('employee_age')
)

# Equivalent pandas style
result = ds[['name', 'age', 'salary']]
```

***


## Фильтрация \{#filtering\}

### `filter` / `where` \{#filter\}

Фильтруйте строки по условиям. Оба метода равнозначны.

```python
filter(condition) -> DataStore
where(condition) -> DataStore  # alias
```

**Примеры:**

```python
ds = DataStore.from_file("employees.csv")

# Single condition
result = ds.filter(ds['age'] > 30)
result = ds.where(ds['salary'] >= 50000)

# Multiple conditions (AND)
result = ds.filter((ds['age'] > 30) & (ds['department'] == 'Engineering'))

# Multiple conditions (OR)
result = ds.filter((ds['city'] == 'NYC') | (ds['city'] == 'LA'))

# NOT condition
result = ds.filter(~(ds['status'] == 'inactive'))

# String conditions
result = ds.filter(ds['name'].str.contains('John'))
result = ds.filter(ds['email'].str.endswith('@company.com'))

# NULL checks
result = ds.filter(ds['manager_id'].notnull())
result = ds.filter(ds['bonus'].isnull())

# IN condition
result = ds.filter(ds['department'].isin(['Engineering', 'Product', 'Design']))

# BETWEEN condition
result = ds.filter(ds['salary'].between(50000, 100000))

# Chained filters (AND)
result = (ds
    .filter(ds['age'] > 25)
    .filter(ds['salary'] > 50000)
    .filter(ds['city'] == 'NYC')
)
```


### Фильтрация в стиле Pandas \{#pandas-filtering\}

```python
# Boolean indexing (equivalent to filter)
result = ds[ds['age'] > 30]
result = ds[(ds['age'] > 30) & (ds['salary'] > 50000)]

# Query method
result = ds.query('age > 30 and salary > 50000')
```

***


## Сортировка \{#sorting\}

### `sort` / `orderby` \{#sort\}

Сортировать строки по одному или нескольким столбцам.

```python
sort(*fields, ascending=True) -> DataStore
orderby(*fields, ascending=True) -> DataStore  # alias
```

**Примеры:**

```python
ds = DataStore.from_file("employees.csv")

# Single column ascending
result = ds.sort('name')

# Single column descending
result = ds.sort('salary', ascending=False)

# Multiple columns
result = ds.sort('department', 'salary')

# Mixed order (use list for ascending parameter)
result = ds.sort('department', 'salary', ascending=[True, False])

# Pandas style
result = ds.sort_values('salary', ascending=False)
result = ds.sort_values(['department', 'salary'], ascending=[True, False])
```

***


## Ограничения и пагинация \{#limiting\}

### `limit` \{#limit\}

Ограничивает количество возвращаемых строк.

```python
limit(n: int) -> DataStore
```


### `offset` \{#offset\}

Пропустить первые n строк.

```python
offset(n: int) -> DataStore
```

**Примеры:**

```python
ds = DataStore.from_file("employees.csv")

# First 10 rows
result = ds.limit(10)

# Skip first 100, take next 50
result = ds.offset(100).limit(50)

# Pandas style
result = ds.head(10)
result = ds.tail(10)
result = ds.iloc[100:150]
```

***


## Уникальные значения \{#distinct\}

### `distinct` \{#distinct-method\}

Удаляет дубликаты строк.

```python
distinct(subset=None, keep='first') -> DataStore
```

**Примеры:**

```python
ds = DataStore.from_file("events.csv")

# Remove all duplicate rows
result = ds.distinct()

# Remove duplicates based on specific columns
result = ds.distinct(subset=['user_id', 'event_type'])

# Pandas style
result = ds.drop_duplicates()
result = ds.drop_duplicates(subset=['user_id'])
```

***


## Группировка \{#grouping\}

### `groupby` \{#groupby\}

Группировать строки по одному или нескольким столбцам. Возвращает объект `LazyGroupBy`.

```python
groupby(*fields, sort=True, as_index=True, dropna=True) -> LazyGroupBy
```

**Примеры:**

```python
ds = DataStore.from_file("sales.csv")

# Group by single column
by_region = ds.groupby('region')

# Group by multiple columns
by_region_product = ds.groupby('region', 'product')

# Aggregation after groupby
result = ds.groupby('region')['amount'].sum()
result = ds.groupby('region').agg({'amount': 'sum', 'quantity': 'mean'})

# Multiple aggregations
result = ds.groupby('category').agg({
    'price': ['min', 'max', 'mean'],
    'quantity': 'sum'
})

# Named aggregation
result = ds.groupby('region').agg(
    total_amount=('amount', 'sum'),
    avg_quantity=('quantity', 'mean'),
    order_count=('order_id', 'count')
)
```


### `having` \{#having\}

Фильтрация групп после агрегации.

```python
having(condition: Union[Condition, str]) -> DataStore
```

**Примеры:**

```python
# Filter groups with total > 10000
result = (ds
    .groupby('region')
    .agg({'amount': 'sum'})
    .having(ds['sum'] > 10000)
)

# Using SQL-style having
result = (ds
    .select('region', 'SUM(amount) as total')
    .groupby('region')
    .having('total > 10000')
)
```

***


## Соединения \{#joining\}

### `join` \{#join\}

Объединяет два хранилища данных (DataStore).

```python
join(right, on=None, how='inner', left_on=None, right_on=None) -> DataStore
```

**Параметры:**

| Параметр   | Тип       | Значение по умолчанию | Описание                                                                                  |
| ---------- | --------- | --------------------- | ----------------------------------------------------------------------------------------- |
| `right`    | DataStore | *обязательный*        | Правый DataStore для объединения                                                          |
| `on`       | str/list  | `None`                | Столбец(ы), по которому выполняется объединение                                           |
| `how`      | str       | `'inner'`             | Тип объединения (join): &#39;inner&#39;, &#39;left&#39;, &#39;right&#39;, &#39;outer&#39; |
| `left_on`  | str/list  | `None`                | Столбец(ы) для левого объединения (join)                                                  |
| `right_on` | str/list  | `None`                | Столбец(ы) для правого объединения (join)                                                 |

**Примеры:**

```python
employees = DataStore.from_file("employees.csv")
departments = DataStore.from_file("departments.csv")

# Inner join on single column
result = employees.join(departments, on='dept_id')

# Left join
result = employees.join(departments, on='dept_id', how='left')

# Join on different column names
result = employees.join(
    departments,
    left_on='department_id',
    right_on='id',
    how='inner'
)

# Pandas style merge
from chdb import datastore as pd
result = pd.merge(employees, departments, on='dept_id')
result = pd.merge(employees, departments, left_on='department_id', right_on='id')
```


### `union` \{#union\}

Объединяет результаты двух DataStore.

```python
union(other, all=False) -> DataStore
```

**Примеры:**

```python
ds1 = DataStore.from_file("sales_2023.csv")
ds2 = DataStore.from_file("sales_2024.csv")

# UNION (removes duplicates)
result = ds1.union(ds2)

# UNION ALL (keeps duplicates)
result = ds1.union(ds2, all=True)

# Pandas style
from chdb import datastore as pd
result = pd.concat([ds1, ds2])
```

***


## Условные выражения \{#conditional\}

### `when` \{#when\}

Создаёт выражения CASE WHEN.

```python
when(condition, value) -> CaseWhenBuilder
```

**Примеры:**

```python
ds = DataStore.from_file("employees.csv")

# Simple case-when
result = ds.select(
    'name',
    ds.when(ds['salary'] > 100000, 'High')
      .when(ds['salary'] > 50000, 'Medium')
      .otherwise('Low')
      .as_('salary_tier')
)

# With column assignment
ds['salary_tier'] = (
    ds.when(ds['salary'] > 100000, 'High')
      .when(ds['salary'] > 50000, 'Medium')
      .otherwise('Low')
)
```

***


## Сырой SQL \{#raw-sql\}

### `run_sql` / `sql` \{#run-sql\}

Выполняйте произвольные SQL-запросы.

```python
run_sql(query: str) -> DataStore
sql(query: str) -> DataStore  # alias
```

**Примеры:**

```python
from chdb.datastore import DataStore

# Execute raw SQL
result = DataStore().sql("""
    SELECT 
        department,
        COUNT(*) as count,
        AVG(salary) as avg_salary
    FROM file('employees.csv', 'CSVWithNames')
    WHERE status = 'active'
    GROUP BY department
    HAVING count > 5
    ORDER BY avg_salary DESC
    LIMIT 10
""")

# SQL on existing DataStore
ds = DataStore.from_file("employees.csv")
result = ds.sql("SELECT * FROM __table__ WHERE age > 30")
```


### `to_sql` \{#to-sql\}

Позволяет просмотреть сгенерированный SQL без выполнения.

```python
to_sql(**kwargs) -> str
```

**Примеры:**

```python
ds = DataStore.from_file("employees.csv")

query = (ds
    .filter(ds['age'] > 30)
    .groupby('department')
    .agg({'salary': 'mean'})
    .sort('mean', ascending=False)
)

print(query.to_sql())
# Output:
# SELECT department, AVG(salary) AS mean
# FROM file('employees.csv', 'CSVWithNames')
# WHERE age > 30
# GROUP BY department
# ORDER BY mean DESC
```

***


## Цепочки вызовов методов \{#chaining\}

Все методы построения запроса поддерживают флюентный интерфейс и могут вызываться цепочкой:

```python
from chdb.datastore import DataStore

ds = DataStore.from_file("sales.csv")

result = (ds
    .select('region', 'product', 'amount', 'date')
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .groupby('region', 'product')
    .agg({
        'amount': ['sum', 'mean'],
        'date': 'count'
    })
    .having(ds['sum'] > 10000)
    .sort('sum', ascending=False)
    .limit(20)
)

# View SQL
print(result.to_sql())

# Execute
df = result.to_df()
```

***


## Псевдонимы \{#aliasing\}

### `as_` \{#as\}

Устанавливает псевдоним для столбца или подзапроса.

```python
as_(alias: str) -> DataStore
```

**Примеры:**

```python
# Column alias
result = ds.select(
    ds['name'].as_('employee_name'),
    (ds['salary'] * 12).as_('annual_salary')
)

# Subquery alias
subquery = ds.filter(ds['age'] > 30).as_('senior_employees')
```
