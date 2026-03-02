---
title: 'DataStore 디버깅'
sidebar_label: '개요'
slug: /chdb/debugging
description: 'explain(), 프로파일링, 로깅을 사용하여 DataStore 작업을 디버깅합니다'
keywords: ['chdb', 'datastore', 'debug', 'explain', 'profiling', 'logging']
doc_type: 'guide'
---

# DataStore 디버깅 \{#datastore-debugging\}

DataStore는 데이터 파이프라인을 이해하고 최적화할 수 있도록 종합적인 디버깅 도구를 제공합니다.

## 디버깅 도구 개요 \{#overview\}

| 도구 | 목적 | 사용 시점 |
|------|---------|-------------|
| `explain()` | 실행 계획 보기 | 어떤 SQL이 실행되는지 파악할 때 |
| Profiler | 성능 측정 | 느린 작업을 찾을 때 |
| Logging | 실행 세부 정보 보기 | 예상치 못한 동작을 디버깅할 때 |

## 빠른 결정 매트릭스 \{#decision-matrix\}

| 목적 | 도구 | 명령 |
|------|------|---------|
| 실행 계획 확인 | `explain()` | `ds.explain()` |
| 성능 측정 | Profiler | `config.enable_profiling()` |
| SQL 쿼리 디버깅 | Logging | `config.enable_debug()` |
| 위 모든 기능 수행 | 조합 사용 | 아래 내용 참조 |

## 빠른 시작 \{#quick-setup\}

### 전체 디버깅 활성화 \{#enable-all\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable all debugging
config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})

# View execution plan
result.explain()

# Get profiler report
from chdb.datastore.config import get_profiler
profiler = get_profiler()
profiler.report()
```

***


## explain() 메서드 \{#explain\}

쿼리를 실행하기 전에 실행 계획을 미리 확인합니다.

```python
ds = pd.read_csv("data.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View plan
query.explain()
```

출력 결과:

```text
Pipeline:
  Source: file('data.csv', 'CSVWithNames')
  Filter: amount > 1000
  GroupBy: region
  Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

자세한 내용은 [explain() 문서](explain.md)를 참조하십시오.

***


## 프로파일링 \{#profiling\}

각 작업별 실행 시간을 측정합니다.

```python
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run operations
ds = pd.read_csv("large_data.csv")
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('category')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# View report
profiler = get_profiler()
profiler.report(min_duration_ms=0.1)
```

출력:

```text
Performance Report
==================
Step                          Duration    Calls
----                          --------    -----
read_csv                      1.234s      1
filter                        0.002s      1
groupby                       0.001s      1
agg                           0.089s      1
sort                          0.045s      1
head                          0.001s      1
to_df (SQL execution)         0.567s      1
----                          --------    -----
Total                         1.939s      7
```

자세한 내용은 [프로파일링 가이드](profiling.md)를 참조하십시오.

***


## 로깅 \{#logging\}

자세한 실행 로그를 확인하십시오.

```python
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Run operations - logs will show:
# - SQL queries generated
# - Execution engine used
# - Cache hits/misses
# - Timing information
```

로그 출력 예:

```text
DEBUG - DataStore: Creating from file 'data.csv'
DEBUG - Query: SELECT region, SUM(amount) FROM ... WHERE amount > 1000 GROUP BY region
DEBUG - Engine: Using chdb for aggregation
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```

자세한 내용은 [Logging Configuration](logging.md)을 참고하십시오.

***


## 일반적인 디버깅 시나리오 \{#scenarios\}

### 1. 쿼리 결과가 예상과 다름 \{#scenario-wrong-results\}

```python
# Step 1: View the execution plan
query = ds.filter(ds['age'] > 25).groupby('city').sum()
query.explain(verbose=True)

# Step 2: Enable logging to see SQL
config.enable_debug()

# Step 3: Run and check logs
result = query.to_df()
```


### 2. 쿼리 실행 속도가 느림 \{#scenario-slow\}

```python
# Step 1: Enable profiling
config.enable_profiling()

# Step 2: Run your query
result = process_data()

# Step 3: Check profiler report
profiler = get_profiler()
profiler.report()

# Step 4: Identify slow operations and optimize
```


### 3. 엔진 선택 방식 이해하기 \{#scenario-engine\}

```python
# Enable verbose logging
config.enable_debug()

# Run operations
result = ds.filter(ds['x'] > 10).apply(custom_func)

# Logs will show which engine was used for each operation:
# DEBUG - filter: Using chdb engine
# DEBUG - apply: Using pandas engine (custom function)
```


### 4. 캐시 문제 디버깅 \{#scenario-cache\}

```python
# Enable debug to see cache operations
config.enable_debug()

# First run
result1 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache miss, executing query

# Second run (should use cache)
result2 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache hit, returning cached result

# If not caching when expected, check:
# - Are operations identical?
# - Is cache enabled? config.cache_enabled
```

***


## 모범 사례 \{#best-practices\}

### 1. 개발 환경에서 디버깅하고, 프로덕션에서는 하지 않기 \{#best-practice-1\}

```python
# Development
config.enable_debug()
config.enable_profiling()

# Production
config.set_log_level(logging.WARNING)
config.set_profiling_enabled(False)
```


### 2. 대규모 쿼리를 실행하기 전에 explain()을 사용하십시오 \{#best-practice-2\}

```python
# Build query
query = ds.filter(...).groupby(...).agg(...)

# Check plan first
query.explain()

# If plan looks good, execute
result = query.to_df()
```


### 3. 최적화 전에 먼저 프로파일링하기 \{#best-practice-3\}

```python
# Don't guess what's slow - measure it
config.enable_profiling()
result = your_pipeline()
get_profiler().report()
```


### 4. 결과가 예상과 다를 때 SQL 점검 \{#best-practice-4\}

```python
# View generated SQL
print(query.to_sql())

# Compare with expected SQL
# Run SQL directly in ClickHouse to verify
```

***


## 디버깅 도구 요약 \{#summary\}

| 도구 | 명령어 | 출력 |
|------|---------|--------|
| 실행 계획 확인 | `ds.explain()` | 실행 단계 + SQL |
| 상세 실행 계획 확인 | `ds.explain(verbose=True)` | + 메타데이터 |
| SQL 보기 | `ds.to_sql()` | SQL 쿼리 문자열 |
| 디버그 활성화 | `config.enable_debug()` | 자세한 로그 |
| 프로파일링 활성화 | `config.enable_profiling()` | 시간 측정 데이터 |
| 프로파일러 보고서 | `get_profiler().report()` | 성능 요약 |
| 프로파일러 초기화 | `get_profiler().reset()` | 시간 측정 데이터 초기화 |

---

## 다음 단계 \{#next-steps\}

- [explain() Method](explain.md) - 실행 계획에 대한 자세한 문서
- [Profiling Guide](profiling.md) - 성능 측정 가이드
- [Logging Configuration](logging.md) - 로그 레벨 및 형식 설정