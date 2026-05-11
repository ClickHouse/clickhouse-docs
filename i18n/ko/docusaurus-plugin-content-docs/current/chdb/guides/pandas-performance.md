---
title: '성능 가이드'
sidebar_label: '성능 가이드'
slug: /chdb/guides/pandas-performance
description: 'DataStore와 pandas의 성능 최적화를 위한 팁'
keywords: ['chdb', 'datastore', 'pandas', 'performance', 'benchmark', 'optimization']
doc_type: 'guide'
---

# 성능 가이드 \{#performance-guide\}

DataStore는 다양한 연산에서 pandas보다 훨씬 뛰어난 성능을 제공합니다. 이 가이드에서는 DataStore가 더 빠른 이유와 워크로드를 최적화하는 방법을 설명합니다.

## DataStore가 더 빠른 이유 \{#why-faster\}

### 1. SQL 푸시다운 \{#sql-pushdown\}

연산을 데이터 소스로 푸시다운합니다:

```python
# pandas: Loads ALL data, then filters in memory
df = pd.read_csv("huge.csv")       # Load 10GB
df = df[df['year'] == 2024]        # Filter in Python

# DataStore: Filter at source
ds = pd.read_csv("huge.csv")       # Just metadata
ds = ds[ds['year'] == 2024]        # Filter in SQL
df = ds.to_df()                    # Only load filtered data
```


### 2. 컬럼 프루닝 \{#column-pruning\}

필요한 컬럼만 조회합니다:

```python
# DataStore: Only reads name, age columns
ds = pd.read_parquet("wide_table.parquet")
result = ds.select('name', 'age').to_df()

# vs pandas: Reads all 100 columns, then selects
```


### 3. 지연 평가(Lazy Evaluation) \{#lazy-evaluation\}

여러 연산이 하나의 쿼리로 합쳐져 컴파일됩니다:

```python
# DataStore: One optimized SQL query
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# Becomes:
# SELECT region, SUM(amount) FROM data
# WHERE amount > 100
# GROUP BY region ORDER BY sum DESC LIMIT 10
```

***


## 벤치마크: DataStore와 pandas 비교 \{#benchmark\}

### 테스트 환경 \{#test-environment\}

- 데이터: 1,000만 행
- 하드웨어: 표준 사양 노트북
- 파일 형식: CSV

### 결과 \{#results\}

| 연산 | pandas (ms) | DataStore (ms) | 우위 |
|-----------|-------------|----------------|--------|
| GroupBy count | 347 | 17 | **DataStore (19.93x)** |
| 복합 연산 | 1,535 | 234 | **DataStore (6.56x)** |
| 복잡한 파이프라인 | 2,047 | 380 | **DataStore (5.39x)** |
| MultiFilter+Sort+Head | 1,963 | 366 | **DataStore (5.36x)** |
| Filter+Sort+Head | 1,537 | 350 | **DataStore (4.40x)** |
| Head/Limit | 166 | 45 | **DataStore (3.69x)** |
| 매우 복잡(10개 이상 연산) | 1,070 | 338 | **DataStore (3.17x)** |
| GroupBy agg | 406 | 141 | **DataStore (2.88x)** |
| Select+Filter+Sort | 1,217 | 443 | **DataStore (2.75x)** |
| Filter+GroupBy+Sort | 466 | 184 | **DataStore (2.53x)** |
| Filter+Select+Sort | 1,285 | 533 | **DataStore (2.41x)** |
| Sort (단일) | 1,742 | 1,197 | **DataStore (1.45x)** |
| Filter (단일) | 276 | 526 | 유사 |
| Sort (다중) | 947 | 1,477 | 유사 |

### 핵심 인사이트 \{#insights\}

1. **GroupBy 연산**: DataStore가 최대 **19.93배 더 빠릅니다**
2. **복잡한 파이프라인**: DataStore가 **5~6배 더 빠릅니다** (SQL 푸시다운 효과)
3. **단순 슬라이스 연산**: 성능은 유사하며 차이는 미미합니다
4. **최적 활용 사례**: groupby/집계를 포함한 다단계 연산입니다
5. **Zero-copy**: `to_df()`는 데이터 변환으로 인한 오버헤드가 없습니다

---

## DataStore가 더 유리한 경우 \{#when-datastore-wins\}

### 무거운 집계 연산 \{#heavy-aggregations\}

```python
# DataStore excels: 19.93x faster
result = ds.groupby('category')['amount'].sum()
```


### 복잡한 파이프라인 \{#complex-pipelines\}

```python
# DataStore excels: 5-6x faster
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': ['sum', 'mean', 'count']})
    .sort('sum', ascending=False)
    .head(20)
)
```


### 대용량 파일 처리 \{#large-file-processing\}

```python
# DataStore: Only loads what you need
ds = pd.read_parquet("huge_file.parquet")
result = ds.filter(ds['id'] == 12345).to_df()  # Fast!
```


### 여러 컬럼 연산 \{#multiple-column-operations\}

```python
# DataStore: Combines into single SQL
ds['total'] = ds['price'] * ds['quantity']
ds['is_large'] = ds['total'] > 1000
ds = ds.filter(ds['is_large'])
```

***


## pandas와 성능이 비슷해지는 경우 \{#when-pandas-wins\}

대부분의 상황에서 DataStore는 pandas와 동등하거나 더 나은 성능을 제공합니다. 그러나 다음과 같은 특정 경우에는 pandas가 약간 더 빠를 수 있습니다.

### 소규모 데이터 세트 (&lt;1,000 행) \{#small-datasets\}

```python
# For very small datasets, overhead is minimal for both
# Performance difference is negligible
small_df = pd.DataFrame({'x': range(100)})
```


### 간단한 슬라이스 연산 \{#simple-slice-operations\}

```python
# Single slice operations without aggregation
df = df[df['x'] > 10]  # pandas slightly faster
ds = ds[ds['x'] > 10]  # DataStore comparable
```


### 사용자 정의 Python 람다 함수 \{#custom-python-functions\}

```python
# pandas required for custom Python code
def complex_function(row):
    return custom_logic(row)

df['result'] = df.apply(complex_function, axis=1)
```

:::note 중요
DataStore가 「더 느린」 것으로 보이는 시나리오에서도 성능은 일반적으로 **pandas와 비슷한 수준**이며, 실제 사용에서는 차이가 거의 없습니다. 복잡한 연산에서 DataStore가 제공하는 이점은 이러한 예외적인 경우를 훨씬 상회합니다.

실행에 대한 세밀한 제어가 필요하면 [Execution Engine Configuration](../configuration/execution-engine.md)을 참고하십시오.
:::

***


## 제로 카피 DataFrame 통합 \{#zero-copy\}

DataStore는 pandas DataFrame을 읽고 쓸 때 **제로 카피(zero-copy)** 방식을 사용합니다. 이는 다음과 같은 의미입니다.

```python
# to_df() does NOT copy data - it's a zero-copy operation
result = ds.filter(ds['x'] > 10).to_df()  # No data conversion overhead

# Same for creating DataStore from DataFrame
ds = DataStore(existing_df)  # No data copy
```

**핵심 요점:**

* `to_df()`는 직렬화나 메모리 복사가 없어 사실상 오버헤드가 없습니다
* pandas DataFrame에서 DataStore를 생성하는 작업은 즉시 완료됩니다
* DataStore와 pandas의 VIEW 간에 메모리가 공유됩니다

***


## 최적화 팁 \{#tips\}

### 1. 대규모 워크로드에서 Performance Mode 활성화 \{#use-performance-mode\}

집계 중심 워크로드에서 정확한 pandas 출력 형식(행 순서, MultiIndex 컬럼, dtype 보정)이 반드시 필요하지 않은 경우, 최대 처리량을 위해 Performance Mode를 활성화하십시오:

```python
from chdb.datastore.config import config

config.use_performance_mode()

# Now all operations use SQL-first execution with no pandas overhead:
# - Parallel Parquet reading (no preserve_order)
# - Single-SQL aggregation (filter+groupby in one query)
# - No row-order preservation overhead
# - No MultiIndex, no dtype corrections
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': ['sum', 'mean', 'count']})
)
```

**예상 성능 향상**: filter+groupby 워크로드에서 최대 2~8배까지 속도 향상, 대용량 Parquet 파일 처리 시 메모리 사용량 감소.

자세한 내용은 [Performance Mode](../configuration/performance-mode.md)를 참고하십시오.


### 2. CSV 대신 Parquet 사용하기 \{#use-parquet\}

```python
# CSV: Slower, reads entire file
ds = pd.read_csv("data.csv")

# Parquet: Faster, columnar, compressed
ds = pd.read_parquet("data.parquet")

# Convert once, benefit forever
df = pd.read_csv("data.csv")
df.to_parquet("data.parquet")
```

**예상 성능 향상**: 읽기 속도 3~10배 향상


### 3. 필터를 먼저 적용하기 \{#filter-early\}

```python
# Good: Filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduce data early
    .groupby('category')['amount'].sum()
)

# Less optimal: Process all data
result = (ds
    .groupby('category')['amount'].sum()
    .filter(ds['sum'] > 1000)  # Filter too late
)
```


### 4. 필요한 컬럼만 선택 \{#select-only-needed-columns\}

```python
# Good: Column pruning
result = ds.select('name', 'amount').filter(ds['amount'] > 100)

# Less optimal: All columns loaded
result = ds.filter(ds['amount'] > 100)  # Loads all columns
```


### 5. SQL 집계 함수를 활용하십시오 \{#leverage-sql-aggregations\}

```python
# GroupBy is where DataStore shines
# Up to 20x speedup!
result = ds.groupby('category').agg({
    'amount': ['sum', 'mean', 'count', 'max'],
    'quantity': 'sum'
})
```


### 6. 전체 쿼리 실행 대신 head() 사용 \{#use-head\}

```python
# Don't load entire result if you only need a sample
result = ds.filter(ds['type'] == 'A').head(100)  # LIMIT 100

# Avoid this for large results
# result = ds.filter(ds['type'] == 'A').to_df()  # Loads everything
```


### 7. 배치 작업 \{#batch-operations\}

```python
# Good: Single execution
result = ds.filter(ds['x'] > 10).filter(ds['y'] < 100).to_df()

# Bad: Multiple executions
result1 = ds.filter(ds['x'] > 10).to_df()  # Execute
result2 = result1[result1['y'] < 100]       # Execute again
```


### 8. explain()을 사용하여 최적화하기 \{#use-explain\}

```python
# View the query plan before executing
query = ds.filter(...).groupby(...).agg(...)
query.explain()  # Check if operations are pushed down

# Then execute
result = query.to_df()
```

***


## 워크로드 프로파일링 \{#profiling\}

### 프로파일링 활성화 \{#enable-profiling\}

```python
from chdb.datastore.config import config, get_profiler

config.enable_profiling()

# Run your workload
result = your_pipeline()

# View report
profiler = get_profiler()
profiler.report()
```


### 병목 지점 식별 \{#identify-bottlenecks\}

```text
Performance Report
==================
Step                    Duration    % Total
----                    --------    -------
SQL execution           2.5s        62.5%     <- Bottleneck!
read_csv                1.2s        30.0%
Other                   0.3s        7.5%
```


### 접근 방법 비교 \{#compare-approaches\}

```python
# Test approach 1
profiler.reset()
result1 = approach1()
time1 = profiler.get_steps()[-1]['duration_ms']

# Test approach 2
profiler.reset()
result2 = approach2()
time2 = profiler.get_steps()[-1]['duration_ms']

print(f"Approach 1: {time1:.0f}ms")
print(f"Approach 2: {time2:.0f}ms")
```

***


## 모범 사례 요약 \{#summary\}

| 모범 사례 | 효과 |
|----------|--------|
| 성능 모드 활성화 | 집계 워크로드에서 2~8배 더 빠름 |
| Parquet 파일 사용 | 읽기가 3~10배 더 빠름 |
| 초기 단계에서 필터링 | 데이터 처리량 감소 |
| 필요한 컬럼만 선택 | I/O 및 메모리 사용량 감소 |
| GROUP BY/집계 함수 사용 | 최대 20배 더 빠름 |
| 배치 작업 사용 | 반복 실행 방지 |
| 최적화 전 프로파일링 수행 | 실제 병목 구간 파악 |
| explain() 사용 | 쿼리 최적화 여부 검증 |
| 샘플 확인에는 head() 사용 | 전체 테이블 스캔 방지 |

---

## 빠른 결정 가이드 \{#decision\}

| 워크로드 유형 | 권장 사항 |
|---------------|----------------|
| GroupBy/집계 작업 | DataStore 사용 |
| 복잡한 다단계 파이프라인 | DataStore 사용 |
| 필터가 있는 대용량 파일 | DataStore 사용 |
| 단순 슬라이스 연산 | 둘 다 사용 가능(성능 유사) |
| 사용자 정의 Python lambda 함수 | pandas를 사용하거나 나중에 변환 |
| 매우 작은 데이터 (&lt;1,000 행) | 둘 다 사용 가능(차이 미미) |

:::tip
엔진을 자동으로 최적으로 선택하려면 `config.set_execution_engine('auto')`(기본값)를 사용하십시오.
집계 워크로드에서 최대 처리량을 확보하려면 `config.use_performance_mode()`를 사용하십시오.
자세한 내용은 [Execution Engine](../configuration/execution-engine.md) 및 [Performance Mode](../configuration/performance-mode.md)를 참고하십시오.
:::