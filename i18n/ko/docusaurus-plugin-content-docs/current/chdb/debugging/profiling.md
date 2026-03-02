---
title: 'DataStore 프로파일링'
sidebar_label: '프로파일링'
slug: /chdb/debugging/profiling
description: '내장 프로파일러를 사용하여 DataStore 성능을 측정합니다'
keywords: ['chdb', 'datastore', '프로파일링', '성능', '타이밍', '벤치마크']
doc_type: 'guide'
---

# DataStore 프로파일링 \{#datastore-profiling\}

DataStore 프로파일러는 실행 시간을 측정하고 성능 병목 현상을 파악하는 데 도움이 됩니다.

## 빠르게 시작하기 \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run your operations
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
print(profiler.report())
```


## 프로파일링 사용 설정 \{#enabling\}

```python
from chdb.datastore.config import config

# Enable profiling
config.enable_profiling()

# Disable profiling
config.disable_profiling()

# Check if profiling is enabled
print(config.profiling_enabled)  # True or False
```

***


## 프로파일러 API \{#api\}

### Profiler 가져오기 \{#get-profiler\}

```python
from chdb.datastore.config import get_profiler

profiler = get_profiler()
```


### report() \{#report\}

성능 보고서를 출력합니다.

```python
profiler.report(min_duration_ms=0.1)
```

**매개변수:**

| Parameter         | Type  | Default | Description                  |
| ----------------- | ----- | ------- | ---------------------------- |
| `min_duration_ms` | float | `0.1`   | 이 지속 시간 이상(&gt;=)인 단계만 표시합니다 |

**예시 출력:**

```text
======================================================================
EXECUTION PROFILE
======================================================================
   45.79ms (100.0%) Total Execution
     23.25ms ( 50.8%) Query Planning [ops_count=2]
     22.29ms ( 48.7%) SQL Segment 1 [ops=2]
       20.48ms ( 91.9%) SQL Execution
        1.74ms (  7.8%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:    45.79ms
======================================================================
```

보고서에는 다음 내용이 표시됩니다.

* 각 단계의 소요 시간(밀리초 단위)
* 상위 단계/전체 시간 대비 비율(%)
* 연산의 계층적 중첩 구조
* 각 단계의 메타데이터(예: `ops_count`, `ops`)


### step() \{#step\}

코드 블록의 실행 시간을 수동으로 측정합니다.

```python
with profiler.step("custom_operation"):
    # Your code here
    expensive_operation()
```


### clear() \{#clear\}

모든 프로파일링 데이터를 삭제합니다.

```python
profiler.clear()
```


### summary() \{#summary\}

스텝 이름을 지속 시간(ms)에 매핑한 딕셔너리를 반환합니다.

```python
summary = profiler.summary()
for name, duration in summary.items():
    print(f"{name}: {duration:.2f}ms")
```

예시 출력:

```text
Total Execution: 45.79ms
Total Execution.Cache Check: 0.00ms
Total Execution.Query Planning: 23.25ms
Total Execution.SQL Segment 1: 22.29ms
Total Execution.SQL Segment 1.SQL Execution: 20.48ms
Total Execution.SQL Segment 1.Result to DataFrame: 1.74ms
```

***


## 보고서 이해하기 \{#understanding\}

### 단계 이름 \{#step-names\}

| 단계 이름 | 설명 |
|-----------|-------------|
| `Total Execution` | 전체 실행 시간 |
| `Query Planning` | 쿼리 계획 수립에 소요된 시간 |
| `SQL Segment N` | SQL 세그먼트 N 실행 |
| `SQL Execution` | 실제 SQL 쿼리 실행 |
| `Result to DataFrame` | 결과를 pandas DataFrame으로 변환 |
| `Cache Check` | 쿼리 캐시 확인 |
| `Cache Write` | 결과를 캐시에 저장 |

### Duration \{#duration\}

- **Planning steps** (Query Planning): 보통 빠르게 진행됩니다
- **Execution steps** (SQL Execution): 실제 작업이 수행되는 단계입니다
- **Transfer steps** (Result to DataFrame): 데이터를 pandas DataFrame으로 변환하는 단계입니다

### 병목 현상 식별 \{#bottlenecks\}

```text
======================================================================
EXECUTION PROFILE
======================================================================
  200.50ms (100.0%) Total Execution
    10.25ms (  5.1%) Query Planning [ops_count=4]
   190.00ms ( 94.8%) SQL Segment 1 [ops=4]
     185.00ms ( 97.4%) SQL Execution    <- Main bottleneck
       5.00ms (  2.6%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:   200.50ms
======================================================================
```

***


## 프로파일링 패턴 \{#patterns\}

### 단일 쿼리 프로파일링 \{#single-query\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()  # Clear previous data

# Run query
result = ds.filter(...).groupby(...).agg(...).to_df()

# View this query's profile
print(profiler.report())
```


### 여러 쿼리 프로파일링하기 \{#multiple-queries\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()

# Query 1
with profiler.step("Query 1"):
    result1 = query1.to_df()

# Query 2
with profiler.step("Query 2"):
    result2 = query2.to_df()

print(profiler.report())
```


### 접근 방법 비교 \{#compare\}

```python
profiler = get_profiler()

# Approach 1: Filter then groupby
profiler.clear()
with profiler.step("filter_then_groupby"):
    result1 = ds.filter(ds['x'] > 10).groupby('y').sum().to_df()
summary1 = profiler.summary()
time1 = summary1.get('filter_then_groupby', 0)

# Approach 2: Groupby then filter
profiler.clear()
with profiler.step("groupby_then_filter"):
    result2 = ds.groupby('y').sum().filter(ds['x'] > 10).to_df()
summary2 = profiler.summary()
time2 = summary2.get('groupby_then_filter', 0)

print(f"Approach 1: {time1:.2f}ms")
print(f"Approach 2: {time2:.2f}ms")
print(f"Winner: {'Approach 1' if time1 < time2 else 'Approach 2'}")
```

***


## 최적화 지침 \{#optimization\}

### 1. SQL 실행 시간 확인 \{#check-sql\}

`SQL execution`이 병목 현상인 경우:

- 데이터를 줄이기 위해 더 많은 필터를 추가하십시오
- CSV 대신 Parquet을 사용하십시오
- 데이터베이스 소스인 경우 적절한 인덱스가 있는지 확인하십시오

### 2. I/O 시간 확인 \{#check-io\}

`read_csv` 또는 `read_parquet`가 병목이 되는 경우:

- Parquet(열 지향, 압축됨)을 사용합니다
- 필요한 컬럼만 읽습니다
- 가능하다면 데이터 소스에서 필터링합니다

### 3. 데이터 전송 확인 \{#check-transfer\}

`to_df` 실행이 느린 경우:

- 결과 집합이 너무 클 수 있습니다
- 추가 필터를 적용하거나 `LIMIT`를 사용합니다
- 미리보려면 `head()`를 사용합니다

### 4. 엔진 비교 \{#compare-engines\}

```python
from chdb.datastore.config import config

# Profile with chdb
config.use_chdb()
profiler.clear()
result_chdb = query.to_df()
time_chdb = profiler.total_duration_ms

# Profile with pandas
config.use_pandas()
profiler.clear()
result_pandas = query.to_df()
time_pandas = profiler.total_duration_ms

print(f"chdb: {time_chdb:.2f}ms")
print(f"pandas: {time_pandas:.2f}ms")
```

***


## 모범 사례 \{#best-practices\}

### 1. 최적화 전에 먼저 프로파일링하기 \{#best-practice-1\}

```python
# Don't guess - measure!
config.enable_profiling()
result = your_query.to_df()
print(get_profiler().report())
```


### 2. 테스트 간 상태 초기화 \{#best-practice-2\}

```python
profiler.clear()  # Clear previous data
# Run test
print(profiler.report())
```


### 3. 집중 분석을 위한 min_duration_ms 사용 \{#best-practice-3\}

```python
# Only show operations >= 100ms
profiler.report(min_duration_ms=100)
```


### 4. 대표 데이터에 대한 프로파일링 \{#best-practice-4\}

```python
# Profile with real-world data sizes
# Small test data may not show real bottlenecks
```


### 5. 운영 환경에서 비활성화 \{#best-practice-5\}

```python
# Development
config.enable_profiling()

# Production
config.set_profiling_enabled(False)  # Avoid overhead
```

***


## 예시: 전체 프로파일링 세션 \{#example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Setup
config.enable_profiling()
config.enable_debug()  # Also see what's happening
profiler = get_profiler()

# Load data
profiler.clear()
print("=== Loading Data ===")
ds = pd.read_csv("sales_2024.csv")  # 10M rows
print(profiler.report())

# Query 1: Simple filter
profiler.clear()
print("\n=== Query 1: Simple Filter ===")
result1 = ds.filter(ds['amount'] > 1000).to_df()
print(profiler.report())

# Query 2: Complex aggregation
profiler.clear()
print("\n=== Query 2: Complex Aggregation ===")
result2 = (ds
    .filter(ds['amount'] > 100)
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .head(20)
    .to_df()
)
print(profiler.report())

# Summary
print("\n=== Summary ===")
print(f"Query 1: {len(result1)} rows")
print(f"Query 2: {len(result2)} rows")
```
