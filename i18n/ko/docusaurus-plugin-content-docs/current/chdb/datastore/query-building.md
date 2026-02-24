---
title: 'DataStore 쿼리 구성'
sidebar_label: '쿼리 구성'
slug: /chdb/datastore/query-building
description: 'DataStore에서 fluent 방식의 메서드 체이닝을 사용해 SQL 스타일의 쿼리를 구성합니다'
keywords: ['chdb', 'datastore', '쿼리', 'select', 'filter', 'where', 'join', 'groupby']
doc_type: 'reference'
---

# DataStore 쿼리 작성 \{#datastore-query-building\}

DataStore는 최적화된 SQL 쿼리로 컴파일되는 SQL 스타일의 쿼리 작성 메서드를 제공합니다. 결과가 실제로 필요해질 때까지 모든 연산은 지연 평가됩니다.

## 쿼리 메서드 개요 \{#overview\}

| Method | SQL Equivalent | 설명 |
|--------|---------------|-------------|
| `select(*cols)` | `SELECT cols` | 컬럼 선택 |
| `filter(cond)` | `WHERE cond` | 행 필터링 |
| `where(cond)` | `WHERE cond` | filter의 별칭 |
| `sort(*cols)` | `ORDER BY cols` | 행 정렬 |
| `orderby(*cols)` | `ORDER BY cols` | sort의 별칭 |
| `limit(n)` | `LIMIT n` | 행 수 제한 |
| `offset(n)` | `OFFSET n` | 행 건너뛰기 |
| `distinct()` | `DISTINCT` | 중복 제거 |
| `groupby(*cols)` | `GROUP BY cols` | 행 그룹화 |
| `having(cond)` | `HAVING cond` | 그룹 필터링 |
| `join(right, ...)` | `JOIN` | DataStore 간 조인 |
| `union(other)` | `UNION` | 결과 결합 |

---

## 선택 \{#selection\}

### `select` \{#select\}

DataStore에서 특정 컬럼만 조회합니다.

```python
select(*fields: Union[str, Expression]) -> DataStore
```

**예제:**

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


## 필터링 \{#filtering\}

### `filter` / `where` \{#filter\}

조건에 따라 행을 필터링합니다. 두 메서드는 동일하게 동작합니다.

```python
filter(condition) -> DataStore
where(condition) -> DataStore  # alias
```

**예시:**

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


### Pandas 스타일 필터링 \{#pandas-filtering\}

```python
# Boolean indexing (equivalent to filter)
result = ds[ds['age'] > 30]
result = ds[(ds['age'] > 30) & (ds['salary'] > 50000)]

# Query method
result = ds.query('age > 30 and salary > 50000')
```

***


## 정렬 \{#sorting\}

### `sort` / `orderby` \{#sort\}

행을 하나 이상의 컬럼 기준으로 정렬합니다.

```python
sort(*fields, ascending=True) -> DataStore
orderby(*fields, ascending=True) -> DataStore  # alias
```

**예제:**

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


## 결과 제한 및 페이지네이션 \{#limiting\}

### `limit` \{#limit\}

결과로 반환되는 행 수를 제한합니다.

```python
limit(n: int) -> DataStore
```


### `offset` \{#offset\}

처음 n개 행을 건너뜁니다.

```python
offset(n: int) -> DataStore
```

**예제:**

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


## DISTINCT \{#distinct\}

### `distinct` \{#distinct-method\}

중복 행을 제거합니다.

```python
distinct(subset=None, keep='first') -> DataStore
```

**예제:**

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


## 그룹화 \{#grouping\}

### `groupby` \{#groupby\}

하나 이상의 컬럼을 기준으로 행을 그룹화합니다. `LazyGroupBy` 객체를 반환합니다.

```python
groupby(*fields, sort=True, as_index=True, dropna=True) -> LazyGroupBy
```

**예제:**

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

집계가 완료된 후 그룹을 필터링합니다.

```python
having(condition: Union[Condition, str]) -> DataStore
```

**예제:**

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


## 조인 \{#joining\}

### `join` \{#join\}

두 DataStore를 조인합니다.

```python
join(right, on=None, how='inner', left_on=None, right_on=None) -> DataStore
```

**매개변수:**

| Parameter  | Type      | Default    | Description                                                              |
| ---------- | --------- | ---------- | ------------------------------------------------------------------------ |
| `right`    | DataStore | *required* | 조인할 오른쪽 DataStore                                                        |
| `on`       | str/list  | `None`     | 조인에 사용할 컬럼(들)                                                            |
| `how`      | str       | `'inner'`  | 조인 유형: &#39;inner&#39;, &#39;left&#39;, &#39;right&#39;, &#39;outer&#39; |
| `left_on`  | str/list  | `None`     | 왼쪽 조인에서 사용할 컬럼(들)                                                        |
| `right_on` | str/list  | `None`     | 오른쪽 조인에서 사용할 컬럼(들)                                                       |

**예시:**

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

두 개의 DataStore 결과를 합칩니다.

```python
union(other, all=False) -> DataStore
```

**예시:**

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


## 조건식 \{#conditional\}

### `when` \{#when\}

CASE WHEN 표현식을 생성합니다.

```python
when(condition, value) -> CaseWhenBuilder
```

**예시:**

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


## 원시 SQL \{#raw-sql\}

### `run_sql` / `sql` \{#run-sql\}

원시 SQL 쿼리를 실행합니다.

```python
run_sql(query: str) -> DataStore
sql(query: str) -> DataStore  # alias
```

**예시:**

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

생성된 SQL을 실행하지 않고 확인할 수 있습니다.

```python
to_sql(**kwargs) -> str
```

**예제:**

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


## 메서드 체이닝 \{#chaining\}

모든 쿼리 메서드는 메서드 체이닝 방식으로 연속 호출을 지원합니다:

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


## 별칭 지정 \{#aliasing\}

### `as_` \{#as\}

컬럼이나 서브쿼리에 대한 별칭을 설정합니다.

```python
as_(alias: str) -> DataStore
```

**예제:**

```python
# Column alias
result = ds.select(
    ds['name'].as_('employee_name'),
    (ds['salary'] * 12).as_('annual_salary')
)

# Subquery alias
subquery = ds.filter(ds['age'] > 30).as_('senior_employees')
```
