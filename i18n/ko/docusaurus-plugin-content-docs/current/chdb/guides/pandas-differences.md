---
title: 'pandas와의 주요 차이점'
sidebar_label: '주요 차이점'
slug: /chdb/guides/pandas-differences
description: 'DataStore와 pandas의 주요 차이점'
keywords: ['chdb', 'datastore', 'pandas', 'differences', 'behavior']
doc_type: 'guide'
---

# pandas와의 주요 차이점 \{#key-differences-from-pandas\}

DataStore는 pandas와 높은 호환성을 제공하지만, 알아두어야 할 중요한 차이점이 있습니다.

## 요약 표 \{#summary\}

| 항목 | pandas | DataStore |
|--------|--------|-----------|
| **Execution** | 즉시 실행(Eager, immediate) | 지연 실행(Lazy, deferred) |
| **Return types** | DataFrame/Series | DataStore/ColumnExpr |
| **Row order** | 행 순서가 보존됨 | 행 순서가 자동으로 보존됨; [성능 모드](../configuration/performance-mode.md)에서는 보장되지 않음 |
| **inplace** | 지원됨 | 지원되지 않음 |
| **Index** | 인덱스 완전 지원 | 인덱스 단순화 |
| **Memory** | 모든 데이터가 메모리에 상주 | 데이터는 원본에 위치 |

---

## 1. 지연(Lazy) 실행 vs 즉시(Eager) 실행 \{#lazy-execution\}

### pandas (즉시 실행, Eager) \{#pandas-eager\}

연산이 바로 실행됩니다:

```python
import pandas as pd

df = pd.read_csv("data.csv")  # Loads entire file NOW
result = df[df['age'] > 25]   # Filters NOW
grouped = result.groupby('city')['salary'].mean()  # Aggregates NOW
```


### DataStore (지연 실행) \{#datastore-lazy\}

연산은 결과가 실제로 필요해질 때까지 수행되지 않습니다:

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")  # Just records the source
result = ds[ds['age'] > 25]   # Just records the filter
grouped = result.groupby('city')['salary'].mean()  # Just records

# Execution happens here:
print(grouped)        # Executes when displaying
df = grouped.to_df()  # Or when converting to pandas
```


### 왜 중요한가 \{#why-lazy\}

지연 실행(lazy execution)은 다음과 같은 이점을 제공합니다:

- **쿼리 최적화**: 여러 연산이 하나의 SQL 쿼리로 컴파일됩니다
- **컬럼 프루닝(column pruning)**: 필요한 컬럼만 읽습니다
- **필터 푸시다운(filter pushdown)**: 필터를 데이터 소스 단계에서 적용합니다
- **메모리 효율성**: 불필요한 데이터를 로드하지 않습니다

---

## 2. 반환 타입 \{#return-types\}

### pandas \{#pandas-return-types\}

```python
df['col']           # Returns pd.Series
df[['a', 'b']]      # Returns pd.DataFrame
df[df['x'] > 10]    # Returns pd.DataFrame
df.groupby('x')     # Returns DataFrameGroupBy
```


### DataStore \{#datastore-return-types\}

```python
ds['col']           # Returns ColumnExpr (lazy)
ds[['a', 'b']]      # Returns DataStore (lazy)
ds[ds['x'] > 10]    # Returns DataStore (lazy)
ds.groupby('x')     # Returns LazyGroupBy
```


### pandas 타입으로의 변환 \{#converting-to-pandas-types\}

```python
# Get pandas DataFrame
df = ds.to_df()
df = ds.to_pandas()

# Get pandas Series from column
series = ds['col'].to_pandas()

# Or trigger execution
print(ds)  # Automatically converts for display
```

***


## 3. Execution Triggers \{#triggers\}

실제 값이 필요할 때 DataStore가 실행됩니다:

| Trigger | Example | Notes |
|---------|---------|-------|
| `print()` / `repr()` | `print(ds)` | 출력에 데이터가 필요할 때 |
| `len()` | `len(ds)` | 행 개수가 필요할 때 |
| `.columns` | `ds.columns` | 컬럼 이름이 필요할 때 |
| `.dtypes` | `ds.dtypes` | 타입 정보가 필요할 때 |
| `.shape` | `ds.shape` | 차원 정보가 필요할 때 |
| `.values` | `ds.values` | 실제 데이터가 필요할 때 |
| `.index` | `ds.index` | 인덱스가 필요할 때 |
| `to_df()` | `ds.to_df()` | 명시적으로 변환할 때 |
| Iteration | `for row in ds` | 이터레이션(반복)이 필요할 때 |
| `equals()` | `ds.equals(other)` | 비교가 필요할 때 |

### 지연 평가로 남는 연산 \{#stay-lazy\}

| Operation | Returns |
|-----------|---------|
| `filter()` | DataStore |
| `select()` | DataStore |
| `sort()` | DataStore |
| `groupby()` | LazyGroupBy |
| `join()` | DataStore |
| `ds['col']` | ColumnExpr |
| `ds[['a', 'b']]` | DataStore |
| `ds[condition]` | DataStore |

---

## 4. 행 순서 \{#row-order\}

### pandas \{#pandas-row-order\}

행 순서는 항상 그대로 유지됩니다:

```python
df = pd.read_csv("data.csv")
print(df.head())  # Always same order as file
```


### DataStore \{#datastore-row-order\}

대부분의 연산에서 행 순서가 **자동으로 유지됩니다**:

```python
ds = pd.read_csv("data.csv")
print(ds.head())  # Matches file order

# Filter preserves order
ds_filtered = ds[ds['age'] > 25]  # Same order as pandas
```

DataStore는 pandas와 동일한 행 순서를 유지하기 위해 `rowNumberInAllBlocks()`를 사용해 내부적으로 원래 행 위치를 자동으로 추적합니다.


### 순서가 유지되는 경우 \{#order-preserved\}

- 파일 기반 소스(CSV, Parquet, JSON 등)
- pandas DataFrame 기반 소스
- 필터링 연산
- 컬럼 선택
- 명시적으로 `sort()` 또는 `sort_values()`를 호출한 이후
- 순서를 정의하는 연산(`nlargest()`, `nsmallest()`, `head()`, `tail()`)

### 정렬 순서가 달라질 수 있는 경우 \{#order-may-differ\}

- `groupby()` 집계 이후 (일관된 순서를 보장하려면 `sort_values()`를 사용하십시오)
- 특정 조인 유형으로 `merge()` / `join()`을 수행한 이후
- **performance mode** (`config.use_performance_mode()`)에서는 어떤 연산에서도 행 순서가 보장되지 않습니다. [Performance Mode](../configuration/performance-mode.md)를 참조하십시오.

---

## 5. inplace 매개변수 미지원 \{#no-inplace\}

### pandas \{#pandas-inplace\}

```python
df.drop(columns=['col'], inplace=True)  # Modifies df
df.fillna(0, inplace=True)              # Modifies df
df.rename(columns={'old': 'new'}, inplace=True)
```


### DataStore \{#datastore-inplace\}

`inplace=True`는 지원되지 않습니다. 항상 결과를 변수에 할당해야 합니다:

```python
ds = ds.drop(columns=['col'])           # Returns new DataStore
ds = ds.fillna(0)                       # Returns new DataStore
ds = ds.rename(columns={'old': 'new'})  # Returns new DataStore
```


### inplace가 없는 이유 \{#why-no-inplace\}

DataStore는 다음을 위해 불변(immutable) 연산을 사용합니다:

- 쿼리 구성(지연(lazy) 평가)
- 스레드 안전성
- 더 쉬운 디버깅
- 더 깔끔한 코드

---

## 6. 인덱스 지원 \{#index\}

### pandas \{#pandas-index\}

완전한 인덱스 지원:

```python
df = df.set_index('id')
df.loc['user123']           # Label-based access
df.loc['a':'z']             # Label-based slicing
df.reset_index()
df.index.name = 'user_id'
```


### DataStore \{#datastore-index\}

간소화된 인덱스 지원:

```python
# Basic operations work
ds.loc[0:10]               # Integer position
ds.iloc[0:10]              # Same as loc for DataStore

# For pandas-style index operations, convert first
df = ds.to_df()
df = df.set_index('id')
df.loc['user123']
```


### DataStore 소스가 중요한 이유 \{#datastore-source-matters\}

- **DataFrame 소스**: pandas 인덱스를 유지합니다
- **파일 소스**: 단순 정수 인덱스를 사용합니다

---

## 7. 비교 동작 방식 \{#comparison\}

### pandas와의 비교 \{#comparing-with-pandas\}

pandas에서는 DataStore 객체를 인식하지 않습니다.

```python
import pandas as pd
from chdb import datastore as ds

pdf = pd.DataFrame({'a': [1, 2, 3]})
dsf = ds.DataFrame({'a': [1, 2, 3]})

# This doesn't work as expected
pdf == dsf  # pandas doesn't know DataStore

# Solution: convert DataStore to pandas
pdf.equals(dsf.to_pandas())  # True
```


### equals() 함수 사용 \{#using-equals\}

```python
# DataStore.equals() also works
dsf.equals(pdf)  # Compares with pandas DataFrame
```

***


## 8. 타입 추론 \{#types\}

### pandas \{#pandas-types\}

NumPy/pandas 타입을 사용합니다:

```python
df['col'].dtype  # int64, float64, object, datetime64, etc.
```


### DataStore \{#datastore-types\}

ClickHouse 타입을 사용할 수 있습니다:

```python
ds['col'].dtype  # Int64, Float64, String, DateTime, etc.

# Types are converted when going to pandas
df = ds.to_df()
df['col'].dtype  # Now pandas type
```


### 명시적 캐스팅 \{#explicit-casting\}

```python
# Force specific type
ds['col'] = ds['col'].astype('int64')
```

***


## 9. 메모리 모델 \{#memory\}

### pandas \{#pandas-memory\}

모든 데이터는 메모리에 상주합니다:

```python
df = pd.read_csv("huge.csv")  # 10GB in memory!
```


### DataStore \{#datastore-memory\}

데이터는 필요할 때까지 원본에 그대로 남아 있습니다:

```python
ds = pd.read_csv("huge.csv")  # Just metadata
ds = ds.filter(ds['year'] == 2024)  # Still just metadata

# Only filtered result is loaded
df = ds.to_df()  # Maybe only 1GB now
```

***


## 10. 오류 메시지 \{#errors\}

### 서로 다른 오류 출처 \{#different-error-sources\}

* **pandas 오류**: pandas 라이브러리에서 발생합니다.
* **DataStore 오류**: chDB 또는 ClickHouse에서 발생합니다.

```python
# May see ClickHouse-style errors
# "Code: 62. DB::Exception: Syntax error..."
```


### 디버깅 팁 \{#debugging-tips\}

```python
# View the SQL to debug
print(ds.to_sql())

# See execution plan
ds.explain()

# Enable debug logging
from chdb.datastore.config import config
config.enable_debug()
```

***


## 마이그레이션 체크리스트 \{#checklist\}

pandas에서 마이그레이션할 때:

- [ ] import 문 변경
- [ ] `inplace=True` 매개변수 제거
- [ ] pandas DataFrame이 필요한 경우 명시적으로 `to_df()` 추가
- [ ] 행 순서가 중요하다면 정렬을 추가
- [ ] 비교 테스트를 위해 `to_pandas()` 사용
- [ ] 대표적인 데이터 규모로 테스트 수행

---

## 빠른 참조 \{#quick-ref\}

| pandas | DataStore |
|--------|-----------|
| `df[condition]` | 동일 (DataStore 반환) |
| `df.groupby()` | 동일 (LazyGroupBy 반환) |
| `df.drop(inplace=True)` | `ds = ds.drop()` |
| `df.equals(other)` | `ds.to_pandas().equals(other)` |
| `df.loc['label']` | `ds.to_df().loc['label']` |
| `print(df)` | 동일 (실행이 수행됨) |
| `len(df)` | 동일 (실행이 수행됨) |