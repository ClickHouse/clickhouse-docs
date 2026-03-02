---
title: 'DataStore 실행 모델'
sidebar_label: '실행 모델'
slug: /chdb/datastore/execution-model
description: 'DataStore에서 지연 평가, 실행 트리거, 캐싱을 이해하기'
keywords: ['chdb', 'datastore', 'lazy', 'evaluation', 'execution', 'caching']
doc_type: 'guide'
---

# DataStore 실행 모델 \{#datastore-execution-model\}

DataStore의 지연 평가(lazy evaluation) 모델을 이해하는 것은 이를 효과적으로 사용하고 최적의 성능을 얻는 데 핵심입니다.

## 지연 평가 \{#lazy-evaluation\}

DataStore는 **지연 평가**를 사용합니다. 연산은 즉시 실행되지 않고 기록된 다음, 최적화된 SQL 쿼리로 컴파일됩니다. 실제로 결과가 필요할 때에만 실행됩니다.

### 예시: 지연 평가 vs 즉시 평가 \{#lazy-vs-eager\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# These operations are NOT executed yet
result = (ds
    .filter(ds['amount'] > 1000)    # Recorded, not executed
    .select('region', 'amount')      # Recorded, not executed
    .groupby('region')               # Recorded, not executed
    .agg({'amount': 'sum'})          # Recorded, not executed
    .sort('sum', ascending=False)    # Recorded, not executed
)

# Still no execution - just building the query plan
print(result.to_sql())
# SELECT region, SUM(amount) AS sum
# FROM file('sales.csv', 'CSVWithNames')
# WHERE amount > 1000
# GROUP BY region
# ORDER BY sum DESC

# NOW execution happens
df = result.to_df()  # <-- Triggers execution
```


### 지연 평가의 이점 \{#benefits\}

1. **쿼리 최적화**: 여러 연산이 하나의 최적화된 SQL 쿼리로 컴파일됩니다.
2. **필터 푸시다운(Filter Pushdown)**: 필터가 데이터 소스 수준에서 적용됩니다.
3. **컬럼 프루닝(Column Pruning)**: 필요한 컬럼만 읽습니다.
4. **지연된 결정**: 실행 엔진을 런타임에 선택할 수 있습니다.
5. **실행 계획 확인**: 실행 전에 쿼리를 미리 확인하거나 디버깅할 수 있습니다.

---

## 실행 트리거 \{#triggers\}

실제 값이 필요할 때 실행이 자동으로 수행됩니다.

### 자동 트리거 \{#automatic-triggers\}

| Trigger              | Example            | Description              |
| -------------------- | ------------------ | ------------------------ |
| `print()` / `repr()` | `print(ds)`        | 결과를 출력합니다                |
| `len()`              | `len(ds)`          | 행 개수를 가져옵니다              |
| `.columns`           | `ds.columns`       | 컬럼 이름을 가져옵니다             |
| `.dtypes`            | `ds.dtypes`        | 컬럼 타입을 가져옵니다             |
| `.shape`             | `ds.shape`         | 행과 컬럼 수를 가져옵니다           |
| `.index`             | `ds.index`         | 행 인덱스를 가져옵니다             |
| `.values`            | `ds.values`        | NumPy 배열을 반환합니다          |
| Iteration            | `for row in ds`    | 각 행을 순회합니다               |
| `to_df()`            | `ds.to_df()`       | pandas DataFrame으로 변환합니다 |
| `to_pandas()`        | `ds.to_pandas()`   | `to_df()`의 별칭입니다         |
| `to_dict()`          | `ds.to_dict()`     | dict로 변환합니다              |
| `to_numpy()`         | `ds.to_numpy()`    | 배열로 변환합니다                |
| `.equals()`          | `ds.equals(other)` | DataStore를 서로 비교합니다      |

**예시:**

```python
# All these trigger execution
print(ds)              # Display
len(ds)                # 1000
ds.columns             # Index(['name', 'age', 'city'])
ds.shape               # (1000, 3)
list(ds)               # List of values
ds.to_df()             # pandas DataFrame
```


### 지연된 상태로 남는 연산 \{#stay-lazy\}

| Operation              | Returns     | Description     |
| ---------------------- | ----------- | --------------- |
| `filter()`             | DataStore   | WHERE 절을 추가합니다  |
| `select()`             | DataStore   | 선택할 컬럼을 지정합니다   |
| `sort()`               | DataStore   | ORDER BY를 추가합니다 |
| `groupby()`            | LazyGroupBy | GROUP BY를 준비합니다 |
| `join()`               | DataStore   | JOIN을 추가합니다     |
| `ds['col']`            | ColumnExpr  | 컬럼 참조           |
| `ds[['col1', 'col2']]` | DataStore   | 컬럼 선택           |

**예시:**

```python
# These do NOT trigger execution - they stay lazy
result = ds.filter(ds['age'] > 25)      # Returns DataStore
result = ds.select('name', 'age')        # Returns DataStore
result = ds['name']                      # Returns ColumnExpr
result = ds.groupby('city')              # Returns LazyGroupBy
```

***


## 3단계 실행 \{#three-phase\}

DataStore 연산은 3단계 실행 모델을 따릅니다.

### 단계 1: SQL 쿼리 구성(지연) \{#phase-1\}

SQL로 표현할 수 있는 연산이 누적됩니다:

```python
result = (ds
    .filter(ds['status'] == 'active')   # WHERE
    .select('user_id', 'amount')         # SELECT
    .groupby('user_id')                  # GROUP BY
    .agg({'amount': 'sum'})              # SUM()
    .sort('sum', ascending=False)        # ORDER BY
    .limit(10)                           # LIMIT
)
# All compiled into one SQL query
```


### 2단계: 실행 시점 \{#phase-2\}

트리거가 발생하면 누적된 SQL이 실행됩니다.

```python
# Execution triggered here
df = result.to_df()  
# The single optimized SQL query runs now
```


### Phase 3: DataFrame 연산(해당되는 경우) \{#phase-3\}

실행 이후에 pandas 전용 연산을 계속 체이닝하는 경우:

```python
# Mixed operations
result = (ds
    .filter(ds['amount'] > 100)          # Phase 1: SQL
    .to_df()                             # Phase 2: Execute
    .pivot_table(...)                    # Phase 3: pandas
)
```

***


## 실행 계획 보기 \{#explain\}

`explain()`을 사용하여 어떤 것이 실행될지 확인하십시오:

```python
ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View execution plan
query.explain()
```

출력 결과:

```text
Pipeline:
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000
  3. GroupBy: region
  4. Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

자세한 정보를 확인하려면 `verbose=True`를 사용하십시오:

```python
query.explain(verbose=True)
```

자세한 내용은 [Debugging: explain()](../debugging/explain.md)를 참고하십시오.

***


## 캐싱 \{#caching\}

DataStore는 동일한 쿼리의 반복 실행을 방지하기 위해 실행 결과를 캐시합니다.

### 캐싱이 동작하는 방식 \{#how-caching\}

```python
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25)

# First access - executes query
print(result.shape)  # Executes and caches

# Second access - uses cache
print(result.columns)  # Uses cached result

# Third access - uses cache
df = result.to_df()  # Uses cached result
```


### 캐시 무효화 \{#cache-invalidation\}

다음 작업으로 DataStore가 변경되면 캐시가 무효화됩니다:

```python
result = ds.filter(ds['age'] > 25)
print(result.shape)  # Executes, caches

# New operation invalidates cache
result2 = result.filter(result['city'] == 'NYC')
print(result2.shape)  # Re-executes (different query)
```


### 수동 캐시 제어 \{#cache-control\}

```python
# Clear cache
ds.clear_cache()

# Disable caching
from chdb.datastore.config import config
config.set_cache_enabled(False)
```

***


## SQL과 Pandas 연산 혼용 \{#mixing\}

DataStore는 SQL과 pandas 연산이 함께 사용되는 작업을 지능적으로 처리합니다:

### SQL-호환 연산 \{#sql-ops\}

다음 연산은 SQL로 컴파일됩니다.

- `filter()`, `where()`
- `select()`
- `groupby()`, `agg()`
- `sort()`, `orderby()`
- `limit()`, `offset()`
- `join()`, `union()`
- `distinct()`
- 컬럼 연산(산술, 비교, 문자열 메서드)

### Pandas 전용 연산 \{#pandas-ops\}

다음 연산은 실행을 유발하고 pandas를 사용합니다:

- 사용자 정의 FUNCTION과 함께 사용하는 `apply()`
- 복잡한 집계를 수행하는 `pivot_table()`
- `stack()`, `unstack()`
- 실행이 완료된 DataFrame에 대한 연산

### 하이브리드 파이프라인 \{#hybrid\}

```python
# SQL phase
result = (ds
    .filter(ds['amount'] > 100)      # SQL
    .groupby('category')              # SQL
    .agg({'amount': 'sum'})           # SQL
)

# Execution + pandas phase
result = (result
    .to_df()                          # Execute SQL
    .pivot_table(...)                 # pandas operation
)
```

***


## 실행 엔진 선택 \{#engine-selection\}

DataStore는 여러 엔진을 사용하여 연산을 수행할 수 있습니다:

### 자동 모드(기본값) \{#auto-mode\}

```python
from chdb.datastore.config import config

config.set_execution_engine('auto')  # Default
# Automatically selects best engine per operation
```


### chDB 엔진 강제 지정 \{#chdb-engine\}

```python
config.set_execution_engine('chdb')
# All operations use ClickHouse SQL
```


### pandas 엔진 사용 강제 \{#pandas-engine\}

```python
config.set_execution_engine('pandas')
# All operations use pandas
```

자세한 내용은 [구성: Execution Engine](../configuration/execution-engine.md)을 참조하십시오.

***


## 성능에 미치는 영향 \{#performance\}

### 좋은 예: 먼저 필터링 \{#filter-early\}

```python
# Good: Filter in SQL, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduces data early
    .groupby('category')
    .agg({'amount': 'sum'})
)
```


### 나쁨: 필터를 늦게 수행 \{#filter-late\}

```python
# Bad: Aggregate all, then filter
result = (ds
    .groupby('category')
    .agg({'amount': 'sum'})
    .to_df()
    .query('sum > 1000')  # Pandas filter after aggregation
)
```


### 좋은 예: 컬럼을 미리 선택하기 \{#select-early\}

```python
# Good: Select columns in SQL
result = (ds
    .select('user_id', 'amount', 'date')
    .filter(ds['date'] >= '2024-01-01')
    .groupby('user_id')
    .agg({'amount': 'sum'})
)
```


### 좋은 예: SQL이 작업을 수행하도록 합니다 \{#sql-work\}

```python
# Good: Complex aggregation in SQL
result = (ds
    .groupby('category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .limit(10)
)
# One SQL query does everything

# Bad: Multiple separate queries
sums = ds.groupby('category')['amount'].sum().to_df()
means = ds.groupby('category')['amount'].mean().to_df()
# Two queries instead of one
```

***


## 모범 사례 요약 \{#best-practices\}

1. **실행 전에 연산을 체인으로 구성하기** - 전체 쿼리를 구성한 뒤 한 번만 트리거합니다
2. **가능한 한 이른 단계에서 필터링하기** - 소스에서 데이터를 줄입니다
3. **필요한 컬럼만 선택하기** - 컬럼 프루닝은 성능을 향상시킵니다
4. **실행 계획을 이해하기 위해 `explain()` 사용하기** - 실행 전에 디버깅합니다
5. **집계는 SQL에 맡기기** - ClickHouse는 이런 작업에 최적화되어 있습니다
6. **실행을 트리거하는 조건을 인지하기** - 의도치 않은 조기 실행을 피합니다
7. **캐시를 현명하게 사용하기** - 캐시가 언제 무효화되는지 이해합니다