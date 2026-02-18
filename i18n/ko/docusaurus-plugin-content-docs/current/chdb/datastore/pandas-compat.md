---
title: 'DataStore Pandas 호환성'
sidebar_label: 'Pandas 호환성'
slug: /chdb/datastore/pandas-compat
description: 'DataStore의 pandas 호환 메서드 전체 목록(총 209개 DataFrame 메서드)'
keywords: ['chdb', 'datastore', 'pandas', 'compatibility', 'dataframe', 'methods']
doc_type: 'reference'
---

# Pandas 호환성 \{#pandas-compatibility\}

DataStore는 API와 완전히 호환되도록 **209개의 pandas DataFrame 메서드**를 구현합니다. 기존 pandas 코드는 거의 수정 없이 그대로 사용할 수 있습니다.

## 호환성 제공 방식 \{#approach\}

```python
# Typical migration - just change the import
- import pandas as pd
+ from chdb import datastore as pd

# Your code works unchanged
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

**핵심 원칙:**

* 209개 pandas DataFrame 메서드 모두 구현
* SQL 최적화를 위한 지연 평가
* 자동 타입 래핑(DataFrame → DataStore, Series → ColumnExpr)
* 불변 연산(`inplace=True` 미사용)

***


## 속성과 프로퍼티 \{#attributes\}

| Property  | 설명                   | 실행 트리거 여부 |
| --------- | -------------------- | --------- |
| `shape`   | (행, 컬럼) 튜플           | 예         |
| `columns` | 컬럼 이름(인덱스)           | 예         |
| `dtypes`  | 컬럼 데이터 타입            | 예         |
| `values`  | NumPy 배열             | 예         |
| `index`   | 행 인덱스                | 예         |
| `size`    | 원소 개수                | 예         |
| `ndim`    | 차원 수                 | 아니오       |
| `empty`   | DataFrame이 비어 있는지 여부 | 예         |
| `T`       | 전치                   | 예         |
| `axes`    | 축 목록                 | 예         |

**예시:**

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")

print(ds.shape)      # (1000, 5)
print(ds.columns)    # Index(['name', 'age', 'city', 'salary', 'dept'])
print(ds.dtypes)     # name: object, age: int64, ...
print(ds.empty)      # False
```

***


## 인덱싱 및 선택 \{#indexing\}

| Method | Description              | Example |
|--------|--------------------------|---------|
| `df['col']` | 컬럼 선택                 | `ds['age']` |
| `df[['col1', 'col2']]` | 여러 컬럼 선택            | `ds[['name', 'age']]` |
| `df[condition]` | 불리언 인덱싱              | `ds[ds['age'] > 25]` |
| `df.loc[...]` | 라벨 기반 접근              | `ds.loc[0:10, 'name']` |
| `df.iloc[...]` | 정수 기반 접근              | `ds.iloc[0:10, 0:3]` |
| `df.at[...]` | 라벨로 단일 값 접근        | `ds.at[0, 'name']` |
| `df.iat[...]` | 위치로 단일 값 접근        | `ds.iat[0, 0]` |
| `df.head(n)` | 처음 n개 행 선택           | `ds.head(10)` |
| `df.tail(n)` | 마지막 n개 행 선택          | `ds.tail(10)` |
| `df.sample(n)` | 무작위 샘플 선택            | `ds.sample(100)` |
| `df.select_dtypes()` | 데이터 타입(Dtype)별 선택 | `ds.select_dtypes(include='number')` |
| `df.query()` | 쿼리 표현식               | `ds.query('age > 25')` |
| `df.where()` | 조건부 치환               | `ds.where(ds['age'] > 0, 0)` |
| `df.mask()` | where의 반대 조건 적용     | `ds.mask(ds['age'] < 0, 0)` |
| `df.isin()` | 값 포함 여부 확인          | `ds['city'].isin(['NYC', 'LA'])` |
| `df.get()` | 안전한 컬럼 접근           | `ds.get('col', default=None)` |
| `df.xs()` | 단면 선택(크로스 섹션)       | `ds.xs('key')` |
| `df.pop()` | 컬럼 제거                 | `ds.pop('col')` |

---

## 통계 메서드 \{#statistical\}

| Method           | Description   | SQL Equivalent |
| ---------------- | ------------- | -------------- |
| `mean()`         | 평균값           | `AVG()`        |
| `median()`       | 중앙값           | `MEDIAN()`     |
| `mode()`         | 최빈값           | -              |
| `std()`          | 표준편차          | `STDDEV()`     |
| `var()`          | 분산            | `VAR()`        |
| `min()`          | 최솟값           | `MIN()`        |
| `max()`          | 최댓값           | `MAX()`        |
| `sum()`          | 합계            | `SUM()`        |
| `prod()`         | 곱             | -              |
| `count()`        | NULL이 아닌 값 개수 | `COUNT()`      |
| `nunique()`      | 고윳값 개수        | `UNIQ()`       |
| `value_counts()` | 값의 빈도수        | `GROUP BY`     |
| `quantile()`     | 분위수           | `QUANTILE()`   |
| `describe()`     | 요약 통계량        | -              |
| `corr()`         | 상관행렬          | `CORR()`       |
| `cov()`          | 공분산 행렬        | `COV()`        |
| `corrwith()`     | 쌍별 상관         | -              |
| `rank()`         | 순위            | `RANK()`       |
| `abs()`          | 절댓값           | `ABS()`        |
| `round()`        | 반올림           | `ROUND()`      |
| `clip()`         | 값 제한          | -              |
| `cumsum()`       | 누적 합계         | 윈도우 함수         |
| `cumprod()`      | 누적 곱          | 윈도우 함수         |
| `cummin()`       | 누적 최솟값        | 윈도우 함수         |
| `cummax()`       | 누적 최댓값        | 윈도우 함수         |
| `diff()`         | 차이            | 윈도우 함수         |
| `pct_change()`   | 백분율 변화        | 윈도우 함수         |
| `skew()`         | 왜도            | `SKEW()`       |
| `kurt()`         | 첨도            | `KURT()`       |
| `sem()`          | 표준 오차         | -              |
| `all()`          | 모두 참          | -              |
| `any()`          | 하나라도 참        | -              |
| `idxmin()`       | 최솟값의 인덱스      | -              |
| `idxmax()`       | 최댓값의 인덱스      | -              |

**예시:**

```python
ds = pd.read_csv("data.csv")

# Basic statistics
print(ds['salary'].mean())
print(ds['age'].std())
print(ds.describe())

# Group statistics
print(ds.groupby('department')['salary'].mean())
print(ds.groupby('city').agg({'salary': ['mean', 'std'], 'age': 'count'}))
```

***


## 데이터 조작 \{#manipulation\}

| Method              | Description  |
| ------------------- | ------------ |
| `drop()`            | 행/컬럼 삭제      |
| `drop_duplicates()` | 중복 제거        |
| `duplicated()`      | 중복 여부 표시     |
| `dropna()`          | 결측값 제거       |
| `fillna()`          | 결측값 채우기      |
| `ffill()`           | 앞 방향으로 채우기   |
| `bfill()`           | 뒤 방향으로 채우기   |
| `interpolate()`     | 값 보간         |
| `replace()`         | 값 대체         |
| `rename()`          | 컬럼/인덱스 이름 변경 |
| `rename_axis()`     | 축 이름 변경      |
| `assign()`          | 새 컬럼 추가      |
| `astype()`          | 타입 변환        |
| `convert_dtypes()`  | 타입 추론        |
| `copy()`            | DataFrame 복사 |

**예시:**

```python
ds = pd.read_csv("data.csv")

# Drop operations
result = ds.drop(columns=['unused_col'])
result = ds.drop_duplicates(subset=['user_id'])
result = ds.dropna(subset=['email'])

# Fill operations
result = ds.fillna(0)
result = ds.fillna({'age': 0, 'name': 'Unknown'})

# Transform operations
result = ds.rename(columns={'old_name': 'new_name'})
result = ds.assign(
    full_name=lambda x: x['first_name'] + ' ' + x['last_name'],
    age_group=lambda x: pd.cut(x['age'], bins=[0, 25, 50, 100])
)
```

***


## 정렬 및 순위 매기기 \{#sorting\}

| Method          | Description |
| --------------- | ----------- |
| `sort_values()` | 값 기준으로 정렬   |
| `sort_index()`  | 인덱스 기준으로 정렬 |
| `nlargest()`    | 가장 큰 값 N개   |
| `nsmallest()`   | 가장 작은 값 N개  |

**예제:**

```python
# Sort by single column
result = ds.sort_values('salary', ascending=False)

# Sort by multiple columns
result = ds.sort_values(['department', 'salary'], ascending=[True, False])

# Get top/bottom N
result = ds.nlargest(10, 'salary')
result = ds.nsmallest(5, 'age')
```

***


## 재구조화(Reshaping) \{#reshaping\}

| Method              | Description     |
| ------------------- | --------------- |
| `pivot()`           | 피벗 테이블          |
| `pivot_table()`     | 집계를 수행하는 피벗 테이블 |
| `melt()`            | 언피벗(Unpivot)    |
| `stack()`           | 컬럼을 인덱스로 변환     |
| `unstack()`         | 인덱스를 컬럼으로 변환    |
| `transpose()` / `T` | 전치              |
| `explode()`         | 리스트를 행으로 분해     |
| `squeeze()`         | 차원 축소           |
| `droplevel()`       | 인덱스 레벨 제거       |
| `swaplevel()`       | 인덱스 레벨 교환       |
| `reorder_levels()`  | 레벨 재정렬          |

**예시:**

```python
# Pivot table
result = ds.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)

# Melt (unpivot)
result = ds.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)

# Explode arrays
result = ds.explode('tags')
```

***


## 결합 / 조인 \{#combining\}

| Method            | Description       |
| ----------------- | ----------------- |
| `merge()`         | SQL 스타일 병합(merge) |
| `join()`          | 인덱스로 조인           |
| `concat()`        | 연결                |
| `append()`        | 행 추가              |
| `combine()`       | 함수로 결합            |
| `combine_first()` | 우선순위 기반으로 결합      |
| `update()`        | 값 업데이트            |
| `compare()`       | 차이점 표시            |

**예시:**

```python
# Merge (join)
result = pd.merge(df1, df2, on='id', how='left')
result = df1.join(df2, on='id')

# Concatenate
result = pd.concat([df1, df2, df3])
result = pd.concat([df1, df2], axis=1)
```

***


## 이항 연산 \{#binary\}

| Method                       | Description |
| ---------------------------- | ----------- |
| `add()` / `radd()`           | 덧셈          |
| `sub()` / `rsub()`           | 뺄셈          |
| `mul()` / `rmul()`           | 곱셈          |
| `div()` / `rdiv()`           | 나눗셈         |
| `truediv()` / `rtruediv()`   | 실수 나눗셈      |
| `floordiv()` / `rfloordiv()` | 버림 나눗셈      |
| `mod()` / `rmod()`           | 나머지 연산      |
| `pow()` / `rpow()`           | 거듭제곱        |
| `dot()`                      | 행렬 곱셈       |

**예제:**

```python
# Arithmetic operations
result = ds['col1'].add(ds['col2'])
result = ds['price'].mul(ds['quantity'])

# With fill_value for missing data
result = ds['col1'].add(ds['col2'], fill_value=0)
```

***


## 비교 연산 \{#comparison\}

| Method | Description |
|--------|-------------|
| `eq()` | 같음 |
| `ne()` | 같지 않음 |
| `lt()` | 보다 작음 |
| `le()` | 작거나 같음 |
| `gt()` | 보다 큼 |
| `ge()` | 크거나 같음 |
| `equals()` | 동등성 검사 |
| `compare()` | 차이점 표시 |

---

## 함수 적용 \{#application\}

| Method                  | Description |
| ----------------------- | ----------- |
| `apply()`               | 함수 적용       |
| `applymap()`            | 요소별로 적용     |
| `map()`                 | 값 매핑        |
| `agg()` / `aggregate()` | 집계          |
| `transform()`           | 변환          |
| `pipe()`                | 함수 파이프 처리   |
| `groupby()`             | 그룹화         |

**예시:**

```python
# Apply function
result = ds['name'].apply(lambda x: x.upper())
result = ds.apply(lambda row: row['a'] + row['b'], axis=1)

# Aggregate
result = ds.agg({'col1': 'sum', 'col2': 'mean'})
result = ds.agg(['sum', 'mean', 'std'])

# Pipe
result = (ds
    .pipe(filter_active)
    .pipe(calculate_metrics)
    .pipe(format_output)
)
```

***


## 시계열(Time Series) \{#timeseries\}

| Method               | Description          |
| -------------------- | -------------------- |
| `rolling()`          | 롤링 윈도우               |
| `expanding()`        | 누적 윈도우               |
| `ewm()`              | 지수 가중 윈도우            |
| `resample()`         | 시계열 리샘플링             |
| `shift()`            | 값 이동                 |
| `asfreq()`           | 빈도 변환                |
| `asof()`             | 기준 시점의 최신 값          |
| `at_time()`          | 특정 시점 선택             |
| `between_time()`     | 시간 구간 선택             |
| `first()` / `last()` | 처음/마지막 기간            |
| `to_period()`        | 기간(Period)으로 변환      |
| `to_timestamp()`     | 타임스탬프(Timestamp)로 변환 |
| `tz_convert()`       | 시간대(timezone) 변환     |
| `tz_localize()`      | 시간대(timezone) 로컬라이즈  |

**예시:**

```python
# Rolling window
result = ds['value'].rolling(window=7).mean()

# Expanding window
result = ds['value'].expanding().sum()

# Shift
result = ds['value'].shift(1)  # Lag
result = ds['value'].shift(-1)  # Lead
```

***


## 결측 데이터 \{#missing\}

| Method | 설명 |
|--------|-------------|
| `isna()` / `isnull()` | 결측값 탐지 |
| `notna()` / `notnull()` | 결측값이 아닌 값 탐지 |
| `dropna()` | 결측값 삭제 |
| `fillna()` | 결측값 채우기 |
| `ffill()` | 앞쪽 채우기 |
| `bfill()` | 뒤쪽 채우기 |
| `interpolate()` | 보간 |
| `replace()` | 값 대체 |

---

## I/O 메서드 \{#io\}

| Method | Description |
|--------|-------------|
| `to_csv()` | CSV로 내보내기 |
| `to_json()` | JSON으로 내보내기 |
| `to_excel()` | Excel로 내보내기 |
| `to_parquet()` | Parquet으로 내보내기 |
| `to_feather()` | Feather로 내보내기 |
| `to_sql()` | SQL 데이터베이스로 내보내기 |
| `to_pickle()` | Pickle 직렬화 |
| `to_html()` | HTML 테이블 |
| `to_latex()` | LaTeX 테이블 |
| `to_markdown()` | Markdown 테이블 |
| `to_string()` | 문자열 표현 |
| `to_dict()` | 딕셔너리 |
| `to_records()` | 레코드 |
| `to_numpy()` | NumPy 배열 |
| `to_clipboard()` | 클립보드 |

자세한 내용은 [I/O Operations](io.md)을 참조하십시오.

---

## 반복 \{#iteration\}

| Method | 설명              |
|--------|--------------------------|
| `items()` | (컬럼, Series) 쌍을 순회 |
| `iterrows()` | (인덱스, Series) 쌍을 순회  |
| `itertuples()` | named tuple로 순회  |

---

## Pandas와의 핵심 차이점 \{#differences\}

### 1. 반환 유형 \{#return-types\}

```python
# Pandas returns Series
pdf['col']  # → pd.Series

# DataStore returns ColumnExpr (lazy)
ds['col']   # → ColumnExpr
```


### 2. 지연 실행 \{#lazy-execution\}

```python
# DataStore operations are lazy
result = ds.filter(ds['age'] > 25)  # Not executed yet
df = result.to_df()  # Executed here
```


### 3. inplace 매개변수를 지원하지 않음 \{#no-inplace-parameter\}

```python
# Pandas
df.drop(columns=['col'], inplace=True)

# DataStore (always returns new object)
ds = ds.drop(columns=['col'])
```


### 4. 결과 비교 \{#comparing-results\}

```python
# Use to_pandas() for comparison
pd.testing.assert_frame_equal(
    ds.to_pandas(),
    expected_df
)
```

자세한 내용은 [주요 차이점](../guides/pandas-differences.md)을 참조하십시오.
