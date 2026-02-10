---
title: 'DataStore 查询构建'
sidebar_label: '查询构建'
slug: /chdb/datastore/query-building
description: '通过流式接口的链式调用在 DataStore 中构建类 SQL 查询'
keywords: ['chdb', 'datastore', '查询', 'select', 'filter', 'where', 'join', 'groupby']
doc_type: 'reference'
---

# DataStore 查询构建 \{#datastore-query-building\}

DataStore 提供 SQL 风格的查询构建方法，这些方法会编译为优化后的 SQL 查询。所有操作在实际需要结果之前都会延迟执行。

## 查询方法概览 \{#overview\}

| 方法 | 对应 SQL | 描述 |
|--------|---------------|-------------|
| `select(*cols)` | `SELECT cols` | 选择列 |
| `filter(cond)` | `WHERE cond` | 过滤行 |
| `where(cond)` | `WHERE cond` | `filter` 的别名 |
| `sort(*cols)` | `ORDER BY cols` | 对行排序 |
| `orderby(*cols)` | `ORDER BY cols` | `sort` 的别名 |
| `limit(n)` | `LIMIT n` | 限制行数 |
| `offset(n)` | `OFFSET n` | 跳过行 |
| `distinct()` | `DISTINCT` | 去重 |
| `groupby(*cols)` | `GROUP BY cols` | 对行分组 |
| `having(cond)` | `HAVING cond` | 过滤分组 |
| `join(right, ...)` | `JOIN` | 连接多个 DataStore |
| `union(other)` | `UNION` | 合并结果 |

---

## 选择 \{#selection\}

### `select` \{#select\}

从 DataStore 中选取特定的列。

```python
select(*fields: Union[str, Expression]) -> DataStore
```

**示例：**

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


## 筛选 \{#filtering\}

### `filter` / `where` \{#filter\}

根据条件过滤行。两者是等价的写法。

```python
filter(condition) -> DataStore
where(condition) -> DataStore  # alias
```

**示例：**

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


### Pandas 风格筛选 \{#pandas-filtering\}

```python
# Boolean indexing (equivalent to filter)
result = ds[ds['age'] > 30]
result = ds[(ds['age'] > 30) & (ds['salary'] > 50000)]

# Query method
result = ds.query('age > 30 and salary > 50000')
```

***


## 排序 \{#sorting\}

### `sort` / `orderby` \{#sort\}

根据一个或多个列对行进行排序。

```python
sort(*fields, ascending=True) -> DataStore
orderby(*fields, ascending=True) -> DataStore  # alias
```

**示例：**

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


## 限制和分页 \{#limiting\}

### `limit` \{#limit\}

限制返回的行数上限。

```python
limit(n: int) -> DataStore
```


### `offset` \{#offset\}

跳过前 n 行。

```python
offset(n: int) -> DataStore
```

**示例：**

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


## 去重 \{#distinct\}

### `distinct` \{#distinct-method\}

去除重复行。

```python
distinct(subset=None, keep='first') -> DataStore
```

**示例：**

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


## 分组 \{#grouping\}

### `groupby` \{#groupby\}

根据一个或多个列对行进行分组。返回一个 `LazyGroupBy` 对象。

```python
groupby(*fields, sort=True, as_index=True, dropna=True) -> LazyGroupBy
```

**示例：**

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

用于在聚合之后过滤分组结果。

```python
having(condition: Union[Condition, str]) -> DataStore
```

**示例：**

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


## 连接 \{#joining\}

### `join` \{#join\}

对两个 DataStore 执行 join 操作。

```python
join(right, on=None, how='inner', left_on=None, right_on=None) -> DataStore
```

**参数：**

| 参数         | 类型        | 默认值       | 描述                                                                  |
| ---------- | --------- | --------- | ------------------------------------------------------------------- |
| `right`    | DataStore | *必填*      | 要进行连接的右侧 DataStore                                                  |
| `on`       | str/list  | `None`    | 用于连接的列                                                              |
| `how`      | str       | `'inner'` | 连接类型：&#39;inner&#39;、&#39;left&#39;、&#39;right&#39;、&#39;outer&#39; |
| `left_on`  | str/list  | `None`    | 左侧用于连接的列                                                            |
| `right_on` | str/list  | `None`    | 右侧用于连接的列                                                            |

**示例：**

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

合并两个 DataStore 的结果。

```python
union(other, all=False) -> DataStore
```

**示例：**

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


## 条件表达式 \{#conditional\}

### `when` \{#when\}

用于创建 CASE WHEN 表达式。

```python
when(condition, value) -> CaseWhenBuilder
```

**示例：**

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


## 原生 SQL \{#raw-sql\}

### `run_sql` / `sql` \{#run-sql\}

执行原生 SQL 查询。

```python
run_sql(query: str) -> DataStore
sql(query: str) -> DataStore  # alias
```

**示例：**

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

在不执行的情况下查看生成的 SQL。

```python
to_sql(**kwargs) -> str
```

**示例：**

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


## 方法链式调用 \{#chaining\}

所有查询方法都支持链式（fluent）调用：

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


## 使用别名 \{#aliasing\}

### `as_` \{#as\}

为列或子查询指定别名。

```python
as_(alias: str) -> DataStore
```

**示例：**

```python
# Column alias
result = ds.select(
    ds['name'].as_('employee_name'),
    (ds['salary'] * 12).as_('annual_salary')
)

# Subquery alias
subquery = ds.filter(ds['age'] > 30).as_('senior_employees')
```
