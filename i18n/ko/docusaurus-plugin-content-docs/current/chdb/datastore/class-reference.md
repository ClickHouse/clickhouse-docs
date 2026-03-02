---
title: 'DataStore 클래스 참조'
sidebar_label: '클래스 참조'
slug: /chdb/datastore/class-reference
description: 'DataStore, ColumnExpr, LazyGroupBy, LazySeries 클래스에 대한 전체 API 참조'
keywords: ['chdb', 'datastore', 'class', 'reference', 'api', 'columnexpr', 'lazygroupby']
doc_type: 'reference'
---

# DataStore 클래스 레퍼런스 \{#datastore-class-reference\}

이 문서에서는 DataStore API의 핵심 클래스를 설명합니다.

## DataStore \{#datastore\}

데이터 조작을 위한 주요 DataFrame 유사 클래스입니다.

```python
from chdb.datastore import DataStore
```


### 생성자 \{#datastore-constructor\}

```python
DataStore(data=None, columns=None, index=None, dtype=None, copy=None)
```

**매개변수:**

| 매개변수      | 타입                            | 설명        |
| --------- | ----------------------------- | --------- |
| `data`    | dict/list/DataFrame/DataStore | 입력 데이터    |
| `columns` | list                          | 컬럼 이름     |
| `index`   | Index                         | 행 인덱스     |
| `dtype`   | dict                          | 컬럼 데이터 형식 |
| `copy`    | bool                          | 데이터 복사 여부 |

**예시:**

```python
# From dictionary
ds = DataStore({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})

# From pandas DataFrame
import pandas as pd
ds = DataStore(pd.DataFrame({'a': [1, 2, 3]}))

# Empty DataStore
ds = DataStore()
```


### 속성 \{#datastore-properties\}

| Property | Type | Description |
|----------|------|-------------|
| `columns` | Index | 컬럼 이름 |
| `dtypes` | Series | 컬럼 데이터 타입 |
| `shape` | tuple | (행, 컬럼) |
| `size` | int | 전체 요소 개수 |
| `ndim` | int | 차원 수 (2) |
| `empty` | bool | DataFrame이 비어 있는지 여부 |
| `values` | ndarray | NumPy 배열 형태의 기본 데이터 |
| `index` | Index | 행 인덱스 |
| `T` | DataStore | 전치된 DataStore |
| `axes` | list | 축 목록 |

### 팩토리 메서드 \{#datastore-factory\}

| Method | Description |
|--------|-------------|
| `uri(uri)` | URI에서 생성하는 범용 팩터리 |
| `from_file(path, ...)` | 파일에서 생성 |
| `from_df(df)` | pandas DataFrame에서 생성 |
| `from_s3(url, ...)` | S3에서 생성 |
| `from_gcs(url, ...)` | Google Cloud Storage에서 생성 |
| `from_azure(url, ...)` | Azure Blob에서 생성 |
| `from_mysql(...)` | MySQL에서 생성 |
| `from_postgresql(...)` | PostgreSQL에서 생성 |
| `from_clickhouse(...)` | ClickHouse에서 생성 |
| `from_mongodb(...)` | MongoDB에서 생성 |
| `from_sqlite(...)` | SQLite에서 생성 |
| `from_iceberg(path)` | Iceberg 테이블에서 생성 |
| `from_delta(path)` | Delta Lake에서 생성 |
| `from_numbers(n)` | 연속된 숫자로 생성 |
| `from_random(rows, cols)` | 임의 데이터로 생성 |
| `run_sql(query)` | SQL 쿼리에서 생성 |

자세한 내용은 [팩토리 메서드](factory-methods.md)를 참조하십시오.

### 쿼리 메서드 \{#datastore-query\}

| Method | Returns | Description |
|--------|---------|-------------|
| `select(*cols)` | DataStore | 컬럼 선택 |
| `filter(condition)` | DataStore | 행 필터링 |
| `where(condition)` | DataStore | `filter`의 별칭 |
| `sort(*cols, ascending=True)` | DataStore | 행 정렬 |
| `orderby(*cols)` | DataStore | `sort`의 별칭 |
| `limit(n)` | DataStore | 행 개수 제한 |
| `offset(n)` | DataStore | 행 건너뛰기 |
| `distinct(subset=None)` | DataStore | 중복 제거 |
| `groupby(*cols)` | LazyGroupBy | 행 그룹화 |
| `having(condition)` | DataStore | 그룹 필터링 |
| `join(right, ...)` | DataStore | DataStore 조인 |
| `union(other, all=False)` | DataStore | DataStore 결합 |
| `when(cond, val)` | CaseWhen | CASE WHEN 구성 |

자세한 내용은 [쿼리 빌딩](query-building.md)을 참조하십시오.

### Pandas 호환 메서드 \{#datastore-pandas\}

전체 209개 메서드 목록은 [Pandas 호환성](pandas-compat.md)을 참조하십시오.

**인덱싱:**
`head()`, `tail()`, `sample()`, `loc`, `iloc`, `at`, `iat`, `query()`, `isin()`, `where()`, `mask()`, `get()`, `xs()`, `pop()`

**집계:**
`sum()`, `mean()`, `std()`, `var()`, `min()`, `max()`, `median()`, `count()`, `nunique()`, `quantile()`, `describe()`, `corr()`, `cov()`, `skew()`, `kurt()`

**데이터 조작:**
`drop()`, `drop_duplicates()`, `dropna()`, `fillna()`, `replace()`, `rename()`, `assign()`, `astype()`, `copy()`

**정렬:**
`sort_values()`, `sort_index()`, `nlargest()`, `nsmallest()`, `rank()`

**재구성:**
`pivot()`, `pivot_table()`, `melt()`, `stack()`, `unstack()`, `transpose()`, `explode()`, `squeeze()`

**결합:**
`merge()`, `join()`, `concat()`, `append()`, `combine()`, `update()`, `compare()`

**적용/변환:**
`apply()`, `applymap()`, `map()`, `agg()`, `transform()`, `pipe()`, `groupby()`

**시계열:**
`rolling()`, `expanding()`, `ewm()`, `shift()`, `diff()`, `pct_change()`, `resample()`

### I/O 메서드 \{#datastore-io\}

| Method | Description |
|--------|-------------|
| `to_csv(path, ...)` | CSV로 내보내기 |
| `to_parquet(path, ...)` | Parquet로 내보내기 |
| `to_json(path, ...)` | JSON으로 내보내기 |
| `to_excel(path, ...)` | Excel로 내보내기 |
| `to_df()` | pandas DataFrame으로 변환 |
| `to_pandas()` | `to_df`의 별칭 |
| `to_arrow()` | Arrow 테이블로 변환 |
| `to_dict(orient)` | 딕셔너리로 변환 |
| `to_records()` | 레코드로 변환 |
| `to_numpy()` | NumPy 배열로 변환 |
| `to_sql()` | SQL 문자열 생성 |
| `to_string()` | 문자열 표현 |
| `to_markdown()` | Markdown 테이블 |
| `to_html()` | HTML 테이블 |

자세한 내용은 [I/O 작업](io.md)을 참고하십시오.

### 디버깅 메서드 \{#datastore-debug\}

| Method | Description |
|--------|-------------|
| `explain(verbose=False)` | 실행 계획 표시 |
| `clear_cache()` | 캐시된 결과 삭제 |

자세한 내용은 [디버깅](../debugging/index.md)을 참고하십시오.

### 매직 메서드 \{#datastore-magic\}

| Method | 설명 |
|--------|-------------|
| `__getitem__(key)` | `ds['col']`, `ds[['a', 'b']]`, `ds[condition]` |
| `__setitem__(key, value)` | `ds['col'] = value` |
| `__delitem__(key)` | `del ds['col']` |
| `__len__()` | `len(ds)` |
| `__iter__()` | `for col in ds` |
| `__contains__(key)` | `'col' in ds` |
| `__repr__()` | `repr(ds)` |
| `__str__()` | `str(ds)` |
| `__eq__(other)` | `ds == other` |
| `__ne__(other)` | `ds != other` |
| `__lt__(other)` | `ds < other` |
| `__le__(other)` | `ds <= other` |
| `__gt__(other)` | `ds > other` |
| `__ge__(other)` | `ds >= other` |
| `__add__(other)` | `ds + other` |
| `__sub__(other)` | `ds - other` |
| `__mul__(other)` | `ds * other` |
| `__truediv__(other)` | `ds / other` |
| `__floordiv__(other)` | `ds // other` |
| `__mod__(other)` | `ds % other` |
| `__pow__(other)` | `ds ** other` |
| `__and__(other)` | `ds & other` |
| `__or__(other)` | `ds | other` |
| `__invert__()` | `~ds` |
| `__neg__()` | `-ds` |
| `__pos__()` | `+ds` |
| `__abs__()` | `abs(ds)` |

---

## ColumnExpr \{#columnexpr\}

지연 평가를 위한 컬럼 표현식을 나타냅니다. 컬럼에 접근하면 반환됩니다.

```python
# ColumnExpr is returned automatically
col = ds['name']  # Returns ColumnExpr
```


### Properties \{#columnexpr-properties\}

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| `name` | str | 컬럼 이름 |
| `dtype` | dtype | 데이터 타입 |

### Accessors \{#columnexpr-accessors\}

| Accessor | 설명 | 메서드 |
|----------|-------------|---------|
| `.str` | 문자열 연산 | 56개 메서드 |
| `.dt` | DateTime 연산 | 42개 이상의 메서드 |
| `.arr` | Array 연산 | 37개 메서드 |
| `.json` | JSON 파싱 | 13개 메서드 |
| `.url` | URL 파싱 | 15개 메서드 |
| `.ip` | IP 주소 연산 | 9개 메서드 |
| `.geo` | 위치/거리 연산 | 14개 메서드 |

자세한 내용은 [Accessors](accessors.md) 문서를 참조하십시오.

### 산술 연산 \{#columnexpr-arithmetic\}

```python
ds['total'] = ds['price'] * ds['quantity']
ds['profit'] = ds['revenue'] - ds['cost']
ds['ratio'] = ds['a'] / ds['b']
ds['squared'] = ds['value'] ** 2
ds['remainder'] = ds['value'] % 10
```


### 비교 연산자 \{#columnexpr-comparison\}

```python
ds[ds['age'] > 25]           # Greater than
ds[ds['age'] >= 25]          # Greater or equal
ds[ds['age'] < 25]           # Less than
ds[ds['age'] <= 25]          # Less or equal
ds[ds['name'] == 'Alice']    # Equal
ds[ds['name'] != 'Bob']      # Not equal
```


### 논리 연산 \{#columnexpr-logical\}

```python
ds[(ds['age'] > 25) & (ds['city'] == 'NYC')]    # AND
ds[(ds['age'] > 25) | (ds['city'] == 'NYC')]    # OR
ds[~(ds['status'] == 'inactive')]               # NOT
```


### Methods \{#columnexpr-methods\}

| Method | Description |
|--------|-------------|
| `as_(alias)` | 별칭 이름 설정 |
| `cast(dtype)` | 타입으로 캐스팅 |
| `astype(dtype)` | cast의 별칭 |
| `isnull()` | NULL 여부 확인 |
| `notnull()` | NULL이 아님 |
| `isna()` | isnull의 별칭 |
| `notna()` | notnull의 별칭 |
| `isin(values)` | 값 목록에 포함 여부 |
| `between(low, high)` | 두 값 사이에 있는지 여부 |
| `fillna(value)` | NULL 값 채우기 |
| `replace(to_replace, value)` | 값 치환 |
| `clip(lower, upper)` | 값 자르기 |
| `abs()` | 절대값 |
| `round(decimals)` | 소수점 반올림 |
| `floor()` | 내림 |
| `ceil()` | 올림 |
| `apply(func)` | 함수 적용 |
| `map(mapper)` | 값 매핑 |

### 집계 메서드 \{#columnexpr-aggregation\}

| Method | Description |
|--------|-------------|
| `sum()` | 합계 |
| `mean()` | 평균 |
| `avg()` | mean의 별칭 |
| `min()` | 최솟값 |
| `max()` | 최댓값 |
| `count()` | null이 아닌 값의 개수 |
| `nunique()` | 고유한 값의 개수 |
| `std()` | 표준편차 |
| `var()` | 분산 |
| `median()` | 중앙값 |
| `quantile(q)` | 분위수 |
| `first()` | 첫 번째 값 |
| `last()` | 마지막 값 |
| `any()` | 하나라도 true인 경우 true |
| `all()` | 모든 값이 true인 경우 true |

---

## LazyGroupBy \{#lazygroupby\}

집계 연산을 수행하기 위한 그룹화된 DataStore를 나타냅니다.

```python
# LazyGroupBy is returned automatically
grouped = ds.groupby('category')  # Returns LazyGroupBy
```


### Methods \{#lazygroupby-methods\}

| Method | Returns | Description |
|--------|---------|-------------|
| `agg(spec)` | DataStore | 그룹별 집계 |
| `aggregate(spec)` | DataStore | agg의 별칭 |
| `sum()` | DataStore | 그룹별 합계 |
| `mean()` | DataStore | 그룹별 평균 |
| `count()` | DataStore | 그룹별 개수 |
| `min()` | DataStore | 그룹별 최소값 |
| `max()` | DataStore | 그룹별 최대값 |
| `std()` | DataStore | 그룹별 표준편차 |
| `var()` | DataStore | 그룹별 분산 |
| `median()` | DataStore | 그룹별 중앙값 |
| `nunique()` | DataStore | 그룹별 고윳값 개수 |
| `first()` | DataStore | 그룹별 첫 번째 값 |
| `last()` | DataStore | 그룹별 마지막 값 |
| `nth(n)` | DataStore | 그룹별 n번째 값 |
| `head(n)` | DataStore | 그룹별 처음 n개 |
| `tail(n)` | DataStore | 그룹별 마지막 n개 |
| `apply(func)` | DataStore | 그룹별 함수 적용 |
| `transform(func)` | DataStore | 그룹별 변환 |
| `filter(func)` | DataStore | 그룹별 필터링 |

### 컬럼 선택 \{#lazygroupby-columns\}

```python
# Select column after groupby
grouped['amount'].sum()     # Returns DataStore
grouped[['a', 'b']].sum()   # Returns DataStore
```


### 집계 명세 \{#lazygroupby-agg\}

```python
# Single aggregation
grouped.agg({'amount': 'sum'})

# Multiple aggregations per column
grouped.agg({'amount': ['sum', 'mean', 'count']})

# Named aggregations
grouped.agg(
    total=('amount', 'sum'),
    average=('amount', 'mean'),
    count=('id', 'count')
)
```

***


## LazySeries \{#lazyseries\}

지연 평가되는 Series(단일 컬럼)를 나타내는 타입입니다.

### 속성(Properties) \{#lazyseries-properties\}

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| `name` | str | 시리즈명 |
| `dtype` | dtype | 데이터 유형 |

### Methods \{#lazyseries-methods\}

대부분의 메서드는 `ColumnExpr`에서 상속됩니다. 주요 메서드는 다음과 같습니다:

| Method | Description |
|--------|-------------|
| `value_counts()` | 값의 빈도 |
| `unique()` | 고유값 |
| `nunique()` | 고유값 개수 |
| `mode()` | 최빈값 |
| `to_list()` | 리스트로 변환 |
| `to_numpy()` | 배열로 변환 |
| `to_frame()` | DataStore로 변환 |

---

## 관련 클래스 \{#related\}

### F (함수) \{#f-class\}

ClickHouse 함수용 네임스페이스입니다.

```python
from chdb.datastore import F, Field

# Aggregations
F.sum(Field('amount'))
F.avg(Field('price'))
F.count(Field('id'))
F.quantile(Field('value'), 0.95)

# Conditional
F.sum_if(Field('amount'), Field('status') == 'completed')
F.count_if(Field('active'))

# Window
F.row_number().over(order_by='date')
F.lag('price', 1).over(partition_by='product', order_by='date')
```

자세한 내용은 [Aggregation](aggregation.md#f-namespace)을 참고하십시오.


### Field \{#field-class\}

컬럼을 이름으로 참조하는 객체입니다.

```python
from chdb.datastore import Field

# Create field reference
amount = Field('amount')
price = Field('price')

# Use in expressions
F.sum(Field('amount'))
F.avg(Field('price'))
```


### CaseWhen \{#casewhen-class\}

CASE WHEN 표현식을 구성하는 빌더입니다.

```python
# Create case-when expression
result = (ds
    .when(ds['score'] >= 90, 'A')
    .when(ds['score'] >= 80, 'B')
    .when(ds['score'] >= 70, 'C')
    .otherwise('F')
)

# Assign to column
ds['grade'] = result
```


### Window \{#window-class\}

윈도우 함수용 윈도우 정의입니다.

```python
from chdb.datastore import F

# Create window
window = F.window(
    partition_by='category',
    order_by='date',
    rows_between=(-7, 0)
)

# Use with aggregation
ds['rolling_avg'] = F.avg('price').over(window)
```
