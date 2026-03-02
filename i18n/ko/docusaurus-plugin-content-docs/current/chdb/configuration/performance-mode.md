---
title: "성능 모드 (compat_mode)"
sidebar_label: "성능 모드"
slug: /chdb/configuration/performance-mode
description: "pandas 호환성 오버헤드를 비활성화하여 최대 처리량을 달성하는 SQL 우선 성능 모드"
keywords: ['chdb', 'datastore', 'performance', 'mode', 'compat', 'sql-first', 'optimization']
doc_type: 'guide'
---

# 성능 모드 \{#performance-mode\}

DataStore에는 출력 형식을 pandas와의 호환성에 맞출지, 원시 SQL 성능에 맞춰 최적화할지를 제어하는 두 가지 호환 모드가 있습니다.

## 개요 \{#overview\}

| 모드 | `compat_mode` 값 | 설명 |
|------|------------------|------|
| **Pandas** (기본값) | `"pandas"` | pandas 동작과의 완전한 호환성을 제공합니다. 행 순서 보존, MultiIndex, set_index, dtype 보정, 안정 정렬 시 동률 처리, `-If`/`isNaN` 래퍼 함수 등을 지원합니다. |
| **Performance** | `"performance"` | SQL 우선 실행 모드입니다. 모든 pandas 호환성 오버헤드가 제거됩니다. 최대 처리량을 제공하지만, 결과의 구조가 pandas와 달라질 수 있습니다. |

### 성능 모드에서 비활성화되는 항목 \{#what-it-disables\}

| 오버헤드 | Pandas 모드 동작 | 성능 모드 동작 |
|----------|------------------|----------------|
| **행 순서 보존** | `_row_id` 삽입, `rowNumberInAllBlocks()`, `__orig_row_num__` 서브쿼리 | 비활성화 — 행 순서가 보장되지 않습니다 |
| **안정 정렬에서 동률(tie) 처리 기준** | `rowNumberInAllBlocks() ASC`가 ORDER BY 뒤에 추가됨 | 비활성화 — 동률은 임의 순서를 가질 수 있습니다 |
| **Parquet preserve_order** | `input_format_parquet_preserve_order=1` | 비활성화 — 병렬 Parquet 읽기가 허용됩니다 |
| **GroupBy 자동 ORDER BY** | `ORDER BY group_key`가 추가됨 (pandas 기본값 `sort=True`) | 비활성화 — 그룹이 임의 순서로 반환됩니다 |
| **GroupBy dropna WHERE** | `WHERE key IS NOT NULL`이 추가됨 (pandas 기본값 `dropna=True`) | 비활성화 — NULL 그룹이 포함됩니다 |
| **GroupBy set_index** | 그룹 키가 인덱스로 설정됨 | 비활성화 — 그룹 키가 컬럼으로 유지됩니다 |
| **MultiIndex 컬럼** | `agg({'col': ['sum','mean']})`이 MultiIndex 컬럼을 반환 | 비활성화 — 평면 컬럼 이름(`col_sum`, `col_mean`) 사용 |
| **`-If`/`isNaN` 래퍼** | skipna를 위해 `sumIf(col, NOT isNaN(col))` 사용 | 비활성화 — 일반 `sum(col)` 사용 (ClickHouse는 기본적으로 NULL을 건너뜁니다) |
| **`count`에 대한 `toInt64`** | pandas int64에 맞추기 위해 `toInt64(count())` 사용 | 비활성화 — 기본 SQL dtype이 반환됩니다 |
| **모두 NaN인 합계에 대한 `fillna(0)`** | 모두 NaN인 합계가 0을 반환함 (pandas 동작) | 비활성화 — NULL을 반환합니다 |
| **Dtype 보정** | `abs()`가 unsigned→signed로 변환 등 | 비활성화 — 기본 SQL dtype 사용 |
| **인덱스 보존** | SQL 실행 후 원래 인덱스를 복원 | 비활성화 |
| **`first()`/`last()`** | `argMin/argMax(col, rowNumberInAllBlocks())` | `any(col)` / `anyLast(col)` — 더 빠르지만 비결정적입니다 |
| **단일 SQL 집계** | ColumnExpr groupby가 중간 DataFrame을 머티리얼라이즈(구체화) | lazy 연산 체인에 `LazyGroupByAgg`를 주입 — 단일 SQL 쿼리 사용 |

---

## 성능 모드 활성화 \{#enabling\}

### config 객체 사용 \{#using-config\}

```python
from chdb.datastore.config import config

# Enable performance mode
config.use_performance_mode()

# Back to pandas compatibility
config.use_pandas_compat()

# Check current mode
print(config.compat_mode)  # 'pandas' or 'performance'
```


### 모듈 수준 함수 사용 \{#using-functions\}

```python
from chdb.datastore.config import set_compat_mode, CompatMode, is_performance_mode

# Enable performance mode
set_compat_mode(CompatMode.PERFORMANCE)

# Check
print(is_performance_mode())  # True

# Back to default
set_compat_mode(CompatMode.PANDAS)
```


### 편의용 import 사용하기 \{#using-imports\}

```python
from chdb import use_performance_mode, use_pandas_compat

use_performance_mode()
# ... high-performance operations ...
use_pandas_compat()
```

:::note
성능 모드를 설정하면 실행 엔진이 자동으로 `chdb`로 전환됩니다. 별도로 `config.use_chdb()`를 호출할 필요가 없습니다.
:::

***


## Performance Mode를 사용할 때 \{#when-to-use\}

**다음과 같은 경우 Performance Mode를 사용하십시오.**

- 대규모 데이터셋(수십만~수백만 개 행)을 처리할 때
- groupby, sum, mean, count와 같은 집계 중심 워크로드를 실행할 때
- 행 순서가 중요하지 않을 때(예: 집계 결과, 리포트, 대시보드)
- SQL 처리량을 최대화하고 오버헤드를 최소화하고자 할 때
- 메모리 사용량이 중요할 때(병렬 Parquet 읽기, 중간 DataFrame을 생성하지 않음)

**다음과 같은 경우 pandas 모드를 유지하십시오.**

- pandas의 동작(행 순서, MultiIndex, dtypes)을 정확히 동일하게 재현해야 할 때
- `first()`/`last()`가 실제 첫 번째/마지막 행을 반환하는 것에 의존할 때
- 행 순서에 따라 결과가 달라지는 `shift()`, `diff()`, `cumsum()`을 사용할 때
- DataStore 출력과 pandas 결과를 비교하는 테스트를 작성할 때

---

## 동작상의 차이 \{#behavior-differences\}

### 행 순서 \{#row-order\}

성능 모드에서는 어떤 연산에서도 행 순서가 **보장되지 않습니다**. 여기에는 다음이 포함됩니다.

* 필터 결과
* GroupBy 집계 결과
* 명시적인 `sort_values()` 없이 사용하는 `head()` / `tail()`
* `first()` / `last()` 집계

정렬된 결과가 필요하다면 명시적으로 `sort_values()`를 추가하십시오.

```python
config.use_performance_mode()

ds = pd.read_csv("data.csv")

# Unordered (fast)
result = ds.groupby("region")["revenue"].sum()

# Ordered (still fast, just adds ORDER BY)
result = ds.groupby("region")["revenue"].sum().sort_values()
```


### GroupBy 결과 \{#groupby-results\}

| 항목 | Pandas 모드 | Performance 모드 |
|--------|------------|-----------------|
| 그룹 키 위치 | Index (`set_index` 사용) | 일반 컬럼 |
| 그룹 순서 | 키 기준 정렬(기본값) | 임의 순서 |
| NULL 그룹 | 제외(기본값 `dropna=True`) | 포함 |
| 컬럼 형식 | 다중 집계 시 MultiIndex | 단일 레벨 이름(`col_func`) |
| `first()`/`last()` | 결정적(행 순서 기준) | 비결정적(`any()`/`anyLast()`) |

### 집계 \{#aggregation\}

```python
config.use_performance_mode()

# Sum of all-NaN group returns NULL (not 0)
# Count returns native uint64 (not forced int64)
# No -If wrappers: sum() instead of sumIf()
result = ds.groupby("cat")["val"].sum()
```


### 단일 SQL 실행 \{#single-sql\}

성능 모드에서는 `ColumnExpr` groupby 집계(예: `ds[condition].groupby('col')['val'].sum()`)가 pandas 모드에서 사용되는 2단계 처리 대신 **단일 SQL 쿼리**로 실행됩니다.

```python
config.use_performance_mode()

# Pandas mode: two SQL queries (filter → materialize → groupby)
# Performance mode: one SQL query (WHERE + GROUP BY in same query)
result = ds[ds["rating"] > 3.5].groupby("category")["revenue"].sum()

# Generated SQL (single query):
# SELECT category, sum(revenue) FROM data WHERE rating > 3.5 GROUP BY category
```

이는 중간 단계인 `DataFrame` 구체화를 제거하여 메모리 사용량과 실행 시간을 크게 줄일 수 있습니다.

***


## Execution Engine과 비교 \{#vs-execution-engine\}

성능 모드(`compat_mode`)와 execution engine(`execution_engine`)은 **서로 독립적인 설정 축**입니다:

| Config             | Controls                         | Values                   |
| ------------------ | -------------------------------- | ------------------------ |
| `execution_engine` | 계산을 실행하는 **엔진**                  | `auto`, `chdb`, `pandas` |
| `compat_mode`      | pandas 호환성을 위해 출력을 재구성할지의 **여부** | `pandas`, `performance`  |

`compat_mode='performance'`로 설정하면, 성능 모드는 SQL 실행을 위해 설계되었기 때문에 `execution_engine='chdb'`가 자동으로 설정됩니다.

```python
from chdb.datastore.config import config

# These are independent
config.use_chdb()              # Force chDB engine, keep pandas compat
config.use_performance_mode()  # Force chDB + remove pandas overhead
```

***


## Performance Mode로 테스트하기 \{#testing\}

Performance Mode에 대한 테스트를 작성할 때 결과의 행 순서와 구조나 형식이 pandas와 다를 수 있습니다. 다음과 같은 전략을 사용하십시오.

### 정렬 후 비교(집계, 필터링) \{#sort-then-compare\}

```python
# Sort both sides by the same columns before comparing
ds_result = ds.groupby("cat")["val"].sum()
pd_result = pd_df.groupby("cat")["val"].sum()

ds_sorted = ds_result.sort_index()
pd_sorted = pd_result.sort_index()
np.testing.assert_array_equal(ds_sorted.values, pd_sorted.values)
```


### 값 범위 검사(처음/마지막) \{#value-range-check\}

```python
# first() with any() returns an arbitrary element from the group
result = ds.groupby("cat")["val"].first()
for group_key in groups:
    assert result.loc[group_key] in group_values[group_key]
```


### 스키마 및 개수 조회 (ORDER BY 없이 LIMIT) \{#schema-and-count\}

```python
# head() without sort_values: row set is non-deterministic
result = ds.head(5)
assert len(result) == 5
assert set(result.columns) == expected_columns
```

***


## 모범 사례 \{#best-practices\}

### 1. 스크립트 시작 부분에서 활성화하십시오 \{#enable-early\}

```python
from chdb.datastore.config import config

config.use_performance_mode()

# All subsequent operations benefit
ds = pd.read_parquet("data.parquet")
result = ds[ds["amount"] > 100].groupby("region")["amount"].sum()
```


### 2. 순서가 중요할 경우 명시적으로 정렬을 지정합니다 \{#explicit-sort\}

```python
# For display or downstream processing that expects order
result = (ds
    .groupby("region")["revenue"].sum()
    .sort_values(ascending=False)
)
```


### 3. 배치/ETL 워크로드에 활용 \{#batch-etl\}

```python
config.use_performance_mode()

# ETL pipeline — order doesn't matter, throughput does
summary = (ds
    .filter(ds["date"] >= "2024-01-01")
    .groupby(["region", "product"])
    .agg({"revenue": "sum", "quantity": "sum", "rating": "mean"})
)
summary.to_df().to_parquet("summary.parquet")
```


### 4. 세션 내 모드 전환 \{#switch-modes\}

```python
# Performance mode for heavy computation
config.use_performance_mode()
aggregated = ds.groupby("cat")["val"].sum()

# Back to pandas mode for exact-match comparison
config.use_pandas_compat()
detailed = ds[ds["val"] > 100].head(10)
```

***


## 관련 문서 \{#related\}

- [Execution Engine](execution-engine.md) — 실행 엔진 선택(auto/chdb/pandas)
- [성능 가이드](../guides/pandas-performance.md) — 일반적인 최적화 팁
- [pandas와의 주요 차이점](../guides/pandas-differences.md) — 동작상의 차이점