---
title: 'DataStore クエリ構築'
sidebar_label: 'クエリ構築'
slug: /chdb/datastore/query-building
description: 'fluent なメソッドチェーンを使用して DataStore で SQL スタイルのクエリを構築します'
keywords: ['chdb', 'datastore', 'query', 'select', 'filter', 'where', 'join', 'groupby']
doc_type: 'reference'
---

# DataStore クエリ構築 \{#datastore-query-building\}

DataStore は、最適化された SQL クエリに変換される SQL ライクなクエリ構築メソッドを提供します。すべての操作は、結果が必要になるまで実行されません。

## クエリメソッドの概要 \{#overview\}

| Method | SQL Equivalent | Description |
|--------|---------------|-------------|
| `select(*cols)` | `SELECT cols` | カラムを選択 |
| `filter(cond)` | `WHERE cond` | 行をフィルター |
| `where(cond)` | `WHERE cond` | filter のエイリアス |
| `sort(*cols)` | `ORDER BY cols` | 行をソート |
| `orderby(*cols)` | `ORDER BY cols` | sort のエイリアス |
| `limit(n)` | `LIMIT n` | 行数を制限 |
| `offset(n)` | `OFFSET n` | 行をスキップ |
| `distinct()` | `DISTINCT` | 重複を除去 |
| `groupby(*cols)` | `GROUP BY cols` | 行をグループ化 |
| `having(cond)` | `HAVING cond` | グループをフィルター |
| `join(right, ...)` | `JOIN` | DataStore 同士を結合 |
| `union(other)` | `UNION` | 結果を結合 |

---

## 選択 \{#selection\}

### `select` \{#select\}

DataStore から特定のカラムのみを選択します。

```python
select(*fields: Union[str, Expression]) -> DataStore
```

**例：**

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


## フィルタリング \{#filtering\}

### `filter` / `where` \{#filter\}

条件に基づいて行を絞り込みます。どちらのメソッドも同等です。

```python
filter(condition) -> DataStore
where(condition) -> DataStore  # alias
```

**使用例:**

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


### Pandas 風のフィルタリング \{#pandas-filtering\}

```python
# Boolean indexing (equivalent to filter)
result = ds[ds['age'] > 30]
result = ds[(ds['age'] > 30) & (ds['salary'] > 50000)]

# Query method
result = ds.query('age > 30 and salary > 50000')
```

***


## ソート \{#sorting\}

### `sort` / `orderby` \{#sort\}

1 つ以上のカラムで行を並べ替えます。

```python
sort(*fields, ascending=True) -> DataStore
orderby(*fields, ascending=True) -> DataStore  # alias
```

**例:**

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


## 制限とページング \{#limiting\}

### `limit` \{#limit\}

返される行の数を制限します。

```python
limit(n: int) -> DataStore
```


### `offset` \{#offset\}

先頭の n 行をスキップします。

```python
offset(n: int) -> DataStore
```

**例：**

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


## Distinct（重複の排除） \{#distinct\}

### `distinct` \{#distinct-method\}

重複した行を削除します。

```python
distinct(subset=None, keep='first') -> DataStore
```

**例：**

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


## グルーピング \{#grouping\}

### `groupby` \{#groupby\}

1 つ以上のカラムを指定して行をグループ化します。`LazyGroupBy` オブジェクトを返します。

```python
groupby(*fields, sort=True, as_index=True, dropna=True) -> LazyGroupBy
```

**例：**

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

集計後にグループをフィルタリングします。

```python
having(condition: Union[Condition, str]) -> DataStore
```

**例：**

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


## 結合（JOIN） \{#joining\}

### `join` \{#join\}

2つのDataStore間で結合を行います。

```python
join(right, on=None, how='inner', left_on=None, right_on=None) -> DataStore
```

**パラメーター:**

| Parameter  | Type      | Default   | Description                                                             |
| ---------- | --------- | --------- | ----------------------------------------------------------------------- |
| `right`    | DataStore | *必須*      | 結合する右側の DataStore                                                       |
| `on`       | str/list  | `None`    | 結合に使用するカラム（複数可）                                                         |
| `how`      | str       | `'inner'` | 結合方法: &#39;inner&#39;, &#39;left&#39;, &#39;right&#39;, &#39;outer&#39; |
| `left_on`  | str/list  | `None`    | 左側の結合に使用するカラム（複数可）                                                      |
| `right_on` | str/list  | `None`    | 右側の結合に使用するカラム（複数可）                                                      |

**例:**

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

2つの DataStore の結果を結合します。

```python
union(other, all=False) -> DataStore
```

**使用例:**

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


## 条件式 \{#conditional\}

### `when` \{#when\}

CASE WHEN 式を生成します。

```python
when(condition, value) -> CaseWhenBuilder
```

**例:**

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


## 生のSQL \{#raw-sql\}

### `run_sql` / `sql` \{#run-sql\}

生の SQL クエリを実行します。

```python
run_sql(query: str) -> DataStore
sql(query: str) -> DataStore  # alias
```

**使用例:**

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

生成される SQL を、実行せずに確認します。

```python
to_sql(**kwargs) -> str
```

**使用例:**

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


## メソッドチェーン \{#chaining\}

すべてのクエリメソッドは、メソッドチェーン（fluent chaining）をサポートしています。

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


## エイリアス \{#aliasing\}

### `as_` \{#as\}

カラムまたはサブクエリに対してエイリアスを設定します。

```python
as_(alias: str) -> DataStore
```

**使用例:**

```python
# Column alias
result = ds.select(
    ds['name'].as_('employee_name'),
    (ds['salary'] * 12).as_('annual_salary')
)

# Subquery alias
subquery = ds.filter(ds['age'] > 30).as_('senior_employees')
```
