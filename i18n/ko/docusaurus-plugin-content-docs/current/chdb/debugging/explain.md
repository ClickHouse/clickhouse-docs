---
title: 'explain() 메서드'
sidebar_label: 'explain()'
slug: /chdb/debugging/explain
description: 'explain() 메서드로 DataStore 실행 계획을 조회합니다'
keywords: ['chdb', 'datastore', 'explain', 'execution', 'plan', 'sql']
doc_type: 'reference'
---

# explain() 메서드 \{#explain-method\}

`explain()` 메서드는 DataStore 쿼리의 실행 계획을 표시하여 어떤 작업이 수행되고 어떤 SQL이 생성되는지 이해하는 데 도움이 됩니다.

## 기본 사용법 \{#basic\}

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


## 구문 \{#syntax\}

```python
explain(verbose=False) -> None
```

**매개변수:**

| 매개변수(Parameter) | 유형(Type) | 기본값(Default) | 설명(Description) |
| --------------- | -------- | ------------ | --------------- |
| `verbose`       | bool     | `False`      | 추가 메타데이터를 표시합니다 |


## 출력 형식 \{#output-format\}

### 표준 출력 \{#standard\}

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


### 아이콘 범례 \{#icons\}

| 아이콘 | 의미 |
|-------|------|
| 📊 | 데이터 소스 |
| 🚀 | chDB (SQL) 연산 |
| 🐼 | pandas 연산 |

### 자세한 출력 \{#verbose\}

```python
query.explain(verbose=True)
```

Verbose 모드에서는 각 작업에 대해 내부 행 순서 추적 메커니즘이 포함된 전체 SQL 쿼리를 비롯한 추가 세부 정보를 표시합니다.

***


## 세 가지 실행 단계 \{#phases\}

`explain` 출력은 연산을 세 단계로 나누어 보여줍니다:

### 1단계: SQL 쿼리 작성(지연 실행) \{#phase-1\}

SQL로 컴파일되는 연산:

```text
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000      
  3. GroupBy: region
  4. Aggregate: sum(amount)
```


### 2단계: 실행 시점 \{#phase-2\}

트리거가 발생하면:

```text
  5. Execute SQL -> DataFrame
     Trigger: to_df() called
```


### 3단계: DataFrame 연산 \{#phase-3\}

실행 후 수행되는 연산:

```text
  6. [pandas] pivot_table(...)
  7. [pandas] apply(custom_func)
```

***


## 실행 플랜 이해하기 \{#understanding\}

### 소스 정보 \{#source\}

```text
Source: file('sales.csv', 'CSVWithNames')
```

* `file()` - ClickHouse file() 테이블 함수
* `'CSVWithNames'` - 헤더가 있는 파일 포맷

기타 소스 유형:

```text
Source: s3('bucket/data.parquet', ...)
Source: mysql('host', 'db', 'table', ...)
Source: __dataframe__  (pandas DataFrame input)
```


### 필터링 연산 \{#filter\}

```text
Filter: amount > 1000 AND status = 'active'
```

적용되는 WHERE 절을 보여줍니다.


### GroupBy 및 집계 연산 \{#groupby\}

```text
GroupBy: region, category
Aggregate: sum(amount), avg(amount), count(id)
```

GROUP BY에 사용된 컬럼과 집계 함수를 표시합니다.


### 정렬 연산 \{#sort\}

```text
Sort: sum DESC, region ASC
```

ORDER BY 절을 보여 줍니다.


### LIMIT 연산 \{#limit\}

```text
Limit: 10
Offset: 100
```

LIMIT 및 OFFSET을 보여 줍니다.

***


## 엔진 정보 \{#engine\}

verbose 모드를 사용하면 어떤 엔진이 사용되는지 확인할 수 있습니다:

```text
Filter: amount > 1000
  - Engine: chdb
  - Pushdown: Yes

Apply: custom_function
  - Engine: pandas
  - Pushdown: No
```


### 푸시다운 \{#pushdown\}

- **예**: 연산은 데이터 소스(SQL)에서 실행됩니다.
- **아니요**: 연산은 pandas에서 실행해야 합니다.

---

## 예제 \{#examples\}

### 단순 쿼리 \{#example-simple\}

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


### 복합 집계 \{#example-complex\}

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


### SQL과 pandas 혼합 사용 \{#example-mixed\}

연산을 모두 SQL로 푸시할 수 없을 때는 실행 계획에 여러 세그먼트가 표시됩니다:

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

***


## explain()을 사용한 디버깅 \{#debugging\}

### 필터 로직 검증 \{#debug-filter\}

```python
# Verify your filter is correct
query = ds.filter((ds['age'] > 25) & (ds['city'] == 'NYC'))
query.explain()
# Output shows: Filter: age > 25 AND city = 'NYC'
```


### 컬럼 선택 확인 \{#debug-select\}

```python
# Check column pruning
query = ds.select('name', 'age').filter(ds['age'] > 25)
query.explain()
# Output shows: SELECT name, age FROM ... WHERE age > 25
```


### 집계 이해 \{#debug-agg\}

```python
# Check aggregation functions
query = ds.groupby('dept').agg({'salary': ['sum', 'mean', 'std']})
query.explain()
# Output shows: SELECT dept, SUM(salary), AVG(salary), stddevPop(salary)
```

***


## 모범 사례 \{#best-practices\}

### 1. 대규모 쿼리를 실행하기 전에 확인하기 \{#best-practice-1\}

```python
# Always explain first for large data
query = ds.complex_pipeline()
query.explain()  # Check plan

# If plan looks correct
result = query.to_df()  # Execute
```


### 2. 디버깅에는 VERBOSE 모드를 사용하십시오 \{#best-practice-2\}

```python
# When something seems wrong
query.explain(verbose=True)
# Shows engine selection and pushdown info
```


### 3. to_sql()와 비교하기 \{#best-practice-3\}

```python
# explain() shows the plan
query.explain()

# to_sql() shows just the SQL
print(query.to_sql())

# Both useful for different purposes
```


### 4. 푸시다운 적용 상태 확인 \{#best-practice-4\}

```python
# Verbose mode shows if operations are pushed down
query.explain(verbose=True)

# If Pushdown: No, operation runs in pandas
# Consider restructuring query for better performance
```
