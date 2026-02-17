---
title: 'pandas에서의 마이그레이션'
sidebar_label: 'pandas에서의 마이그레이션'
slug: /chdb/guides/migration-from-pandas
description: 'pandas에서 DataStore로 마이그레이션하기 위한 단계별 가이드'
keywords: ['chdb', 'datastore', 'pandas', 'migration', 'guide']
doc_type: 'guide'
---

# pandas에서 마이그레이션 \{#migration-from-pandas\}

이 가이드는 기존 pandas 코드의 호환성을 유지하면서 성능을 향상시키기 위해 DataStore로 이전하는 방법을 설명합니다.

## 한 줄로 끝내는 마이그레이션 \{#one-line\}

가장 간단한 마이그레이션 방법은 `import`를 변경하는 것입니다:

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

이제 끝입니다! 대부분의 pandas 코드는 별다른 수정 없이 그대로 동작합니다.


## 단계별 마이그레이션 \{#step-by-step\}

<VerticalStepper headerLevel="h3">

### chDB 설치 \{#step-1\}

```bash
pip install "chdb>=4.0"
```

### import 구문 변경 \{#step-2\}

```python
# 다음 코드를:
import pandas as pd

# 다음과 같이 변경합니다:
from chdb import datastore as pd
```

### 코드 테스트하기 \{#step-3\}

기존 코드를 실행하십시오. 대부분의 연산은 변경 없이 그대로 동작합니다:

```python
from chdb import datastore as pd

# 다음 연산은 모두 동일하게 동작합니다
df = pd.read_csv("data.csv")
result = df[df['age'] > 25]
grouped = df.groupby('city')['salary'].mean()
df.to_csv("output.csv")
```

### 차이점 처리 \{#step-4\}

일부 연산은 동작 방식이 다릅니다. 아래 [주요 차이점](#differences)을 참조하십시오.

</VerticalStepper>

---

## 변경 없이 그대로 사용할 수 있는 기능 \{#works-unchanged\}

### 데이터 로드 \{#loading-unchanged\}

```python
# All these work the same
df = pd.read_csv("data.csv")
df = pd.read_parquet("data.parquet")
df = pd.read_json("data.json")
df = pd.read_excel("data.xlsx")
```


### 필터링 \{#filtering-unchanged\}

```python
# Boolean indexing
df[df['age'] > 25]
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# query() method
df.query('age > 25 and salary > 50000')
```


### 데이터 선택 \{#selection-unchanged\}

```python
# Column selection
df['name']
df[['name', 'age']]

# Row selection
df.head(10)
df.tail(10)
df.iloc[0:100]
```


### GroupBy와 집계 \{#groupby-unchanged\}

```python
# GroupBy
df.groupby('city')['salary'].mean()
df.groupby(['city', 'dept']).agg({'salary': ['sum', 'mean']})
```


### 정렬 \{#sorting-unchanged\}

```python
df.sort_values('salary', ascending=False)
df.sort_values(['city', 'age'])
```


### 문자열 연산 \{#string-unchanged\}

```python
df['name'].str.upper()
df['name'].str.contains('John')
df['name'].str.len()
```


### DateTime 연산 \{#datetime-unchanged\}

```python
df['date'].dt.year
df['date'].dt.month
df['date'].dt.dayofweek
```


### 입출력(I/O) 작업 \{#io-unchanged\}

```python
df.to_csv("output.csv")
df.to_parquet("output.parquet")
df.to_json("output.json")
```

***


## 핵심 차이점 \{#differences\}

### 1. 지연 평가(Lazy Evaluation) \{#lazy\}

DataStore 연산은 지연 평가 방식으로 동작하므로, 결과가 실제로 필요해질 때까지 실행되지 않습니다.

**pandas:**

```python
# Executes immediately
result = df[df['age'] > 25]
print(type(result))  # pandas.DataFrame
```

**DataStore(데이터 저장소):**

```python
# Builds query, doesn't execute yet
result = ds[ds['age'] > 25]
print(type(result))  # DataStore (lazy)

# Executes when you need the data
print(result)        # Triggers execution
df = result.to_df()  # Triggers execution
```


### 2. 반환 타입 \{#return-types\}

| 연산 | pandas 반환 | DataStore 반환 |
|-----------|---------------|-------------------|
| `df['col']` | Series | ColumnExpr (지연) |
| `df[['a', 'b']]` | DataFrame | DataStore (지연) |
| `df[condition]` | DataFrame | DataStore (지연) |
| `df.groupby('x')` | GroupBy | LazyGroupBy |

### 3. inplace 파라미터 없음 \{#no-inplace\}

DataStore는 `inplace=True`를 지원하지 않습니다. 항상 반환값을 사용하십시오:

**pandas:**

```python
df.drop(columns=['col'], inplace=True)
```

**데이터 저장소(DataStore):**

```python
ds = ds.drop(columns=['col'])  # Assign the result
```


### 4. DataStore 비교 \{#comparing\}

pandas는 DataStore 객체를 인식하지 않으므로 비교를 위해서는 `to_pandas()`를 사용합니다:

```python
# This may not work as expected
df == ds  # pandas doesn't know DataStore

# Do this instead
df.equals(ds.to_pandas())
```


### 5. 행 순서 \{#row-order\}

DataStore는 파일 소스(예: SQL 데이터베이스)에 대해 행 순서를 보장하지 않을 수 있습니다. 명시적으로 정렬을 수행해야 합니다:

```python
# pandas preserves order
df = pd.read_csv("data.csv")

# DataStore - use sort for guaranteed order
ds = pd.read_csv("data.csv")
ds = ds.sort('id')  # Explicit ordering
```

***


## 마이그레이션 패턴 \{#patterns\}

### 패턴 1: 읽기-분석-쓰기 \{#pattern-1\}

```python
# pandas
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")

# DataStore - same code works!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")
```


### 패턴 2: pandas 연산을 사용하는 DataFrame \{#pattern-2\}

pandas 전용 기능이 필요하다면, 마지막 단계에서 변환하십시오:

```python
from chdb import datastore as pd

# Fast DataStore operations
ds = pd.read_csv("large_data.csv")
ds = ds.filter(ds['date'] >= '2024-01-01')
ds = ds.filter(ds['amount'] > 100)

# Convert to pandas for specific features
df = ds.to_df()
df_pivoted = df.pivot_table(...)  # pandas-specific
```


### 패턴 3: 혼합형 워크플로우 \{#pattern-3\}

```python
from chdb import datastore as pd
import pandas

# Start with DataStore for fast filtering
ds = pd.read_csv("huge_file.csv")  # 10M rows
ds = ds.filter(ds['year'] == 2024)  # Fast SQL filter
ds = ds.select('col1', 'col2', 'col3')  # Column pruning

# Convert for pandas-specific operations
df = ds.to_df()  # Now only ~100K rows
result = df.apply(complex_custom_function)  # pandas
```

***


## 성능 비교 \{#performance\}

DataStore는 대규모 데이터셋에서 훨씬 더 빠르게 동작합니다:

| 연산 | pandas | DataStore | 속도 향상 |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*1,000만 행에서 측정한 벤치마크 결과*

---

## 마이그레이션 문제 해결 \{#troubleshooting\}

### 문제: 연산이 동작하지 않음 \{#issue-op\}

일부 pandas 연산은 지원되지 않을 수 있습니다. 다음 사항을 확인하십시오.

1. 해당 연산이 [호환성 목록](../datastore/pandas-compat.md)에 포함되어 있습니까?
2. 먼저 pandas DataFrame으로 변환한 후 시도하십시오: `ds.to_df().operation()`

### 문제: 결과가 다름 \{#issue-results\}

무슨 일이 일어나는지 확인하려면 디버그 로깅을 활성화하십시오:

```python
from chdb.datastore.config import config
config.enable_debug()

# View the SQL being generated
ds.filter(ds['x'] > 10).explain()
```


### 문제: 성능 저하 \{#issue-slow\}

실행 패턴을 확인하십시오:

```python
# Bad: Multiple small executions
for i in range(1000):
    result = ds.filter(ds['id'] == i).to_df()

# Good: Single execution
result = ds.filter(ds['id'].isin(ids)).to_df()
```


### 문제: 타입 불일치 \{#issue-types\}

DataStore가 타입을 서로 다르게 추론할 수 있습니다:

```python
# Check types
print(ds.dtypes)

# Force conversion
ds['col'] = ds['col'].astype('int64')
```

***


## 점진적 마이그레이션 전략 \{#gradual\}

### 1주차: 호환성 테스트 \{#week-1\}

```python
# Keep both imports
import pandas as pd
from chdb import datastore as ds

# Compare results
pdf = pd.read_csv("data.csv")
dsf = ds.read_csv("data.csv")

# Verify they match
assert pdf.equals(dsf.to_pandas())
```


### 2주차: 단순 스크립트 전환 \{#week-2\}

다음과 같은 스크립트부터 시작하십시오:

- 대용량 파일을 읽는 스크립트
- 필터링과 집계를 수행하는 스크립트
- 사용자 정의 `apply` 함수를 사용하지 않는 스크립트

### 3주차: 복잡한 사례 처리 \{#week-3\}

사용자 정의 함수가 포함된 스크립트:

```python
from chdb import datastore as pd

# Let DataStore handle the heavy lifting
ds = pd.read_csv("data.csv")
ds = ds.filter(ds['year'] == 2024)  # SQL

# Convert for custom work
df = ds.to_df()
result = df.apply(my_custom_function)
```


### 4주차: 전체 마이그레이션 \{#week-4\}

모든 스크립트를 DataStore import를 사용하도록 전환합니다.

---

## 자주 묻는 질문(FAQ) \{#faq\}

### pandas와 DataStore를 함께 사용할 수 있나요? \{#faq-both\}

네! 서로 간에 자유롭게 변환해서 사용할 수 있습니다.

```python
from chdb import datastore as ds
import pandas as pd

# DataStore to pandas
df = ds_result.to_pandas()

# pandas to DataStore  
ds = ds.DataFrame(pd_result)
```


### 테스트가 여전히 통과되나요? \{#faq-tests\}

대부분의 테스트는 통과합니다. 비교 테스트는 pandas로 변환하여 실행하십시오:

```python
def test_my_function():
    result = my_function()
    expected = pd.DataFrame(...)
    pd.testing.assert_frame_equal(result.to_pandas(), expected)
```


### Jupyter에서 DataStore를 사용할 수 있습니까? \{#faq-jupyter\}

예. DataStore는 Jupyter 노트북에서 사용할 수 있습니다.

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")
ds.head()  # Displays nicely in Jupyter
```


### 이슈는 어떻게 보고하나요? \{#faq-issues\}

호환성 관련 이슈를 발견하면 다음 GitHub 리포지토리의 이슈 트래커에 보고하십시오:
https://github.com/chdb-io/chdb/issues