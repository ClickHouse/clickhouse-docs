---
title: '실행 엔진 구성'
sidebar_label: '실행 엔진'
slug: /chdb/configuration/execution-engine
description: 'DataStore 실행 엔진(auto, chdb, pandas) 구성'
keywords: ['chdb', 'datastore', 'execution', 'engine', 'chdb', 'pandas', 'auto']
doc_type: 'guide'
---

# 실행 엔진 구성 \{#execution-engine-configuration\}

DataStore는 다양한 백엔드를 사용하여 연산을 실행할 수 있습니다. 이 가이드는 엔진 선택을 설정하고 최적화하는 방법을 설명합니다.

## 사용 가능한 엔진 \{#engines\}

| Engine | 설명 | 권장 사용 사례 |
|--------|-------------|----------|
| `auto` | 연산별로 최적의 엔진을 자동으로 선택 | 일반적인 용도(기본값) |
| `chdb` | 모든 연산을 ClickHouse SQL을 통해 강제로 실행 | 대규모 데이터셋, 집계 작업 |
| `pandas` | 모든 연산을 pandas를 통해 강제로 실행 | 호환성 테스트, pandas 전용 기능 |

## 엔진 설정 \{#setting\}

### 전역 설정 \{#global\}

```python
from chdb.datastore.config import config

# Option 1: Using set method
config.set_execution_engine('auto')    # Default
config.set_execution_engine('chdb')    # Force ClickHouse
config.set_execution_engine('pandas')  # Force pandas

# Option 2: Using shortcuts
config.use_auto()     # Auto-select
config.use_chdb()     # Force ClickHouse
config.use_pandas()   # Force pandas
```


### 현재 사용 중인 엔진 확인 \{#checking\}

```python
print(config.execution_engine)  # 'auto', 'chdb', or 'pandas'
```

***


## Auto 모드 \{#auto-mode\}

`auto` 모드(기본 모드)에서는 DataStore가 각 작업마다 최적의 엔진을 선택합니다.

### chDB에서 실행되는 연산 \{#auto-chdb\}

- SQL과 호환되는 필터링 (`filter()`, `where()`)
- 컬럼 선택 (`select()`)
- 정렬 (`sort()`, `orderby()`)
- 그룹화 및 집계 (`groupby().agg()`)
- 조인 (`join()`, `merge()`)
- 중복 제거 (`distinct()`, `drop_duplicates()`)
- 결과 제한 (`limit()`, `head()`, `tail()`)

### pandas에서 수행되는 연산 \{#auto-pandas\}

- 사용자 정의 apply 함수 (`apply(custom_func)`)
- 커스텀 집계를 포함한 복잡한 피벗 테이블
- SQL로 표현할 수 없는 연산
- 입력 데이터가 이미 pandas DataFrame인 경우

### 예제 \{#auto-example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

config.use_auto()  # Default

ds = pd.read_csv("data.csv")

# This uses chDB (SQL)
result = (ds
    .filter(ds['amount'] > 100)   # SQL: WHERE
    .groupby('region')            # SQL: GROUP BY
    .agg({'amount': 'sum'})       # SQL: SUM()
)

# This uses pandas (custom function)
result = ds.apply(lambda row: complex_calculation(row), axis=1)
```

***


## chDB 모드 \{#chdb-mode\}

모든 작업이 ClickHouse SQL을 통해서만 수행되도록 강제합니다:

```python
config.use_chdb()
```


### 언제 사용해야 하는가 \{#chdb-when\}

- 대규모 데이터 세트(수백만 행)를 처리할 때
- 대규모 집계 워크로드를 처리할 때
- 최대 수준의 SQL 최적화를 원할 때
- 모든 연산에서 일관된 동작이 필요할 때

### 성능 특성 \{#chdb-performance\}

| 작업 유형 | 성능 |
|----------------|-------------|
| GroupBy/Aggregation | 매우 우수함 (최대 20배 더 빠름) |
| 복잡한 필터링 | 매우 우수함 |
| 정렬 | 우수함 |
| 단순 단일 필터 | 양호함 (약간의 오버헤드가 있음) |

### 제한 사항 \{#chdb-limitations\}

- 사용자 정의 Python 함수는 지원되지 않을 수 있습니다.
- 일부 pandas 전용 기능은 변환이 필요합니다.

---

## pandas 모드 \{#pandas-mode\}

모든 연산을 pandas를 통해서만 수행하도록 강제합니다:

```python
config.use_pandas()
```


### 사용해야 하는 경우 \{#pandas-when\}

- pandas와의 호환성을 테스트해야 할 때
- pandas 전용 기능을 사용해야 할 때
- pandas 관련 문제를 디버깅해야 할 때
- 데이터가 이미 pandas 형식으로 준비되어 있을 때

### 성능 특성 \{#pandas-performance\}

| 작업 유형 | 성능 |
|----------------|-------------|
| 간단한 단일 연산 | 좋음 |
| 사용자 정의 함수 | 우수함 |
| 복잡한 집계 | chDB보다 느림 |
| 대규모 데이터 세트 | 메모리 사용량이 많음 |

---

## Cross-DataStore Engine \{#cross-datastore\}

서로 다른 DataStore의 컬럼을 조합하는 연산을 위해 엔진을 설정합니다:

```python
# Set cross-DataStore engine
config.set_cross_datastore_engine('auto')
config.set_cross_datastore_engine('chdb')
config.set_cross_datastore_engine('pandas')
```


### 예제 \{#cross-example\}

```python
ds1 = pd.read_csv("sales.csv")
ds2 = pd.read_csv("inventory.csv")

# This operation involves two DataStores
result = ds1.join(ds2, on='product_id')
# Uses cross_datastore_engine setting
```

***


## 엔진 선택 로직 \{#selection-logic\}

### 자동 모드 결정 트리 \{#decision-tree\}

```text
Operation requested
    │
    ├─ Can be expressed in SQL?
    │      │
    │      ├─ Yes → Use chDB
    │      │
    │      └─ No → Use pandas
    │
    └─ Cross-DataStore operation?
           │
           └─ Use cross_datastore_engine setting
```


### 함수 수준 재정의(Function-Level Override) \{#function-override\}

일부 함수는 해당 함수에 대해 엔진을 명시적으로 구성할 수 있습니다.

```python
from chdb.datastore.config import function_config

# Force specific functions to use specific engine
function_config.use_chdb('length', 'substring')
function_config.use_pandas('upper', 'lower')
```

자세한 내용은 [Function Config](function-config.md)를 참조하십시오.

***


## 성능 비교 \{#performance-comparison\}

1,000만 행 기준 벤치마크 결과:

| Operation | pandas (ms) | chdb (ms) | Speedup |
|-----------|-------------|-----------|---------|
| GroupBy count | 347 | 17 | 19.93배 |
| Combined ops | 1,535 | 234 | 6.56배 |
| Complex pipeline | 2,047 | 380 | 5.39배 |
| Filter+Sort+Head | 1,537 | 350 | 4.40배 |
| GroupBy agg | 406 | 141 | 2.88배 |
| Single filter | 276 | 526 | 0.52배 |

**핵심 인사이트:**

- chDB는 집계 및 복잡한 파이프라인에서 특히 뛰어난 성능을 보입니다.
- pandas는 단일 연산과 같은 단순한 작업에서는 약간 더 빠릅니다.
- `auto` 모드를 사용하면 두 엔진의 장점을 모두 활용할 수 있습니다.

---

## 모범 사례 \{#best-practices\}

### 1. 자동 모드로 시작하기 \{#start-with-auto-mode\}

```python
config.use_auto()  # Let DataStore decide
```


### 2. 강제 적용 전 프로파일링 \{#profile-before-forcing\}

```python
config.enable_profiling()
# Run your workload
# Check profiler report to see where time is spent
```


### 3. 특정 워크로드에 엔진을 강제로 사용하기 \{#force-engine-for-specific-workloads\}

```python
# For heavy aggregation workloads
config.use_chdb()

# For pandas compatibility testing
config.use_pandas()
```


### 4. explain()으로 실행 방식 이해하기 \{#use-explain-to-understand-execution\}

```python
ds = pd.read_csv("data.csv")
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'sum'})

# See what SQL will be generated
query.explain()
```

***


## 문제 해결 \{#troubleshooting\}

### 문제: 작업이 예상보다 느리게 수행됨 \{#issue-operation-slower\}

```python
# Check current engine
print(config.execution_engine)

# Enable debug to see what's happening
config.enable_debug()

# Try forcing specific engine
config.use_chdb()  # or config.use_pandas()
```


### 문제: chdb 모드에서 지원되지 않는 작업 \{#issue-unsupported-operation\}

```python
# Some pandas operations aren't supported in SQL
# Solution: use auto mode
config.use_auto()

# Or explicitly convert to pandas first
df = ds.to_df()
result = df.some_pandas_specific_operation()
```


### 문제: 대용량 데이터 처리 시 메모리 문제 \{#issue-memory-issues\}

```python
# Use chdb engine to avoid loading all data into memory
config.use_chdb()

# Filter early to reduce data size
result = ds.filter(ds['date'] >= '2024-01-01').to_df()

# For maximum throughput on large datasets, use performance mode
# which enables parallel Parquet reading and single-SQL aggregation
config.use_performance_mode()
```

:::tip Performance Mode
대규모 집계 워크로드를 실행하면서 행 순서, MultiIndex, dtype 보정과 같은 pandas 출력 결과와의 완전한 호환성이 필요하지 않은 경우 [Performance Mode](performance-mode.md) 사용을 고려하십시오. 이 모드는 엔진을 자동으로 `chdb`로 설정하고 pandas 호환성을 위한 모든 오버헤드를 제거합니다.
:::
