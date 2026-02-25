---
title: 'DataStore 집계 함수'
sidebar_label: '집계'
slug: /chdb/datastore/aggregation
description: 'DataStore의 집계 함수, 윈도우 함수, F 네임스페이스'
keywords: ['chdb', 'datastore', 'aggregation', 'window', 'groupby', 'sum', 'mean', 'avg']
doc_type: 'reference'
---

# DataStore 집계 함수 \{#datastore-aggregation-functions\}

DataStore는 ClickHouse의 강력한 SQL 집계 기능을 활용하여 포괄적인 집계 및 윈도우 함수 지원을 제공합니다.

## 기본 집계 \{#basic\}

### 내장 메서드 \{#builtin\}

| Method      | SQL Equivalent    | Description    |
| ----------- | ----------------- | -------------- |
| `sum()`     | `SUM()`           | 값의 합           |
| `mean()`    | `AVG()`           | 평균             |
| `count()`   | `COUNT()`         | NULL이 아닌 값의 개수 |
| `min()`     | `MIN()`           | 최소값            |
| `max()`     | `MAX()`           | 최대값            |
| `median()`  | `MEDIAN()`        | 중앙값            |
| `std()`     | `stddevPop()`     | 표준편차           |
| `var()`     | `varPop()`        | 분산             |
| `nunique()` | `COUNT(DISTINCT)` | 고유값의 개수        |

**예시:**

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# Single column aggregation
total = ds['amount'].sum()
average = ds['amount'].mean()
count = ds['amount'].count()

# All aggregations
print(ds['amount'].sum())    # Total
print(ds['amount'].mean())   # Average
print(ds['amount'].std())    # Standard deviation
print(ds['amount'].median()) # Median
print(ds['amount'].nunique()) # Unique count
```

***


## GroupBy 집계 연산 \{#groupby\}

### 단일 집계 \{#single-agg\}

```python
# Group by and aggregate
result = ds.groupby('category')['amount'].sum()
result = ds.groupby('region')['sales'].mean()
```


### 다중 집계 \{#multi-agg\}

```python
# Dictionary syntax
result = ds.groupby('category').agg({
    'amount': 'sum',
    'quantity': 'mean',
    'order_id': 'count'
})

# List of aggregations per column
result = ds.groupby('category').agg({
    'amount': ['sum', 'mean', 'max'],
    'quantity': ['sum', 'count']
})
```


### 이름 지정 집계 \{#named-agg\}

```python
# Named aggregation (pandas style)
result = ds.groupby('region').agg(
    total_amount=('amount', 'sum'),
    avg_quantity=('quantity', 'mean'),
    order_count=('order_id', 'count'),
    max_price=('price', 'max')
)
```


### 여러 개의 GROUP BY 키 \{#multi-groupby\}

```python
# Group by multiple columns
result = ds.groupby(['region', 'category']).agg({
    'amount': 'sum',
    'quantity': 'sum'
})
```

***


## 통계 집계(Statistical Aggregations) \{#statistical\}

| Method        | SQL Equivalent | Description  |
| ------------- | -------------- | ------------ |
| `quantile(q)` | `quantile(q)`  | q번째 분위수(0-1) |
| `skew()`      | `skewPop()`    | 왜도           |
| `kurt()`      | `kurtPop()`    | 첨도           |
| `corr()`      | `corr()`       | 상관계수         |
| `cov()`       | `covar()`      | 공분산          |
| `sem()`       | -              | 평균의 표준오차     |

**예시:**

```python
# Quantiles
q50 = ds['amount'].quantile(0.5)  # Median
q95 = ds['amount'].quantile(0.95) # 95th percentile

# Multiple quantiles
quantiles = ds['amount'].quantile([0.25, 0.5, 0.75])

# Correlation between columns
correlation = ds[['sales', 'marketing_spend']].corr()
```

***


## 조건부 집계 \{#conditional\}

ClickHouse에 특화된 조건부 집계 함수입니다.

| Function         | ClickHouse  | Description     |
| ---------------- | ----------- | --------------- |
| `sum_if(cond)`   | `sumIf()`   | 조건을 만족하는 값의 합계  |
| `count_if(cond)` | `countIf()` | 조건을 만족하는 값의 개수  |
| `avg_if(cond)`   | `avgIf()`   | 조건을 만족하는 값의 평균  |
| `min_if(cond)`   | `minIf()`   | 조건을 만족하는 값의 최소값 |
| `max_if(cond)`   | `maxIf()`   | 조건을 만족하는 값의 최대값 |

**예시:**

```python
from chdb.datastore import F, Field

# Sum only high value orders
high_value_sum = F.sum_if(Field('amount'), Field('amount') > 1000)

# Count active users
active_count = F.count_if(Field('status') == 'active')

# In groupby context
result = ds.groupby('region').agg({
    'total': ('amount', 'sum'),
    'high_value': ('amount', F.sum_if(Field('amount') > 1000)),
})
```

***


## 컬렉션 집계 함수 \{#collection\}

값을 수집하는 ClickHouse 전용 함수입니다.

| Function             | ClickHouse         | Description        |
| -------------------- | ------------------ | ------------------ |
| `group_array()`      | `groupArray()`     | 배열로 수집             |
| `group_uniq_array()` | `groupUniqArray()` | 고유 값을 배열로 수집       |
| `group_concat(sep)`  | `groupConcat()`    | 문자열을 연결            |
| `top_k(n)`           | `topK(n)`          | 가장 자주 등장하는 값 상위 K개 |
| `any()`              | `any()`            | 임의의 값              |
| `any_last()`         | `anyLast()`        | 마지막 값              |
| `first_value()`      | `first_value()`    | 순서상 첫 번째 값         |
| `last_value()`       | `last_value()`     | 순서상 마지막 값          |

**예시:**

```python
from chdb.datastore import F, Field

# Collect all tags per category
result = ds.groupby('category').agg({
    'all_tags': ('tag', F.group_array()),
    'unique_tags': ('tag', F.group_uniq_array())
})

# Get top 5 products per region
result = ds.groupby('region').agg({
    'top_products': ('product_id', F.top_k(5))
})
```

***


## 윈도우 함수 \{#window\}

### 순위 함수 \{#ranking\}

| Function         | SQL              | Description         |
| ---------------- | ---------------- | ------------------- |
| `row_number()`   | `ROW_NUMBER()`   | 연속 행 번호             |
| `rank()`         | `RANK()`         | 중간 값이 비는 순위(동순위 허용) |
| `dense_rank()`   | `DENSE_RANK()`   | 중간 값이 비지 않는 연속 순위   |
| `ntile(n)`       | `NTILE(n)`       | n개의 버킷으로 분할         |
| `percent_rank()` | `PERCENT_RANK()` | 백분위 순위(0-1)         |
| `cume_dist()`    | `CUME_DIST()`    | 누적 분포               |

**예시:**

```python
from chdb.datastore import F, Field

# Add row number
ds['row_num'] = F.row_number().over(order_by='date')

# Rank within groups
ds['rank'] = F.rank().over(
    partition_by='category',
    order_by='sales'
)

# Dense rank (no gaps)
ds['dense_rank'] = F.dense_rank().over(
    partition_by='region',
    order_by=('revenue', 'desc')
)

# Divide into quartiles
ds['quartile'] = F.ntile(4).over(order_by='score')
```


### 값 함수 \{#value-functions\}

| Function        | SQL                 | 설명          |
| --------------- | ------------------- | ----------- |
| `lag(n)`        | `LAG(col, n)`       | 이전 행 값      |
| `lead(n)`       | `LEAD(col, n)`      | 다음 행 값      |
| `first_value()` | `FIRST_VALUE()`     | 윈도 내 첫 번째 값 |
| `last_value()`  | `LAST_VALUE()`      | 윈도 내 마지막 값  |
| `nth_value(n)`  | `NTH_VALUE(col, n)` | 윈도 내 N번째 값  |

**예시:**

```python
# Previous and next value
ds['prev_price'] = F.lag('price', 1).over(order_by='date')
ds['next_price'] = F.lead('price', 1).over(order_by='date')

# First and last in partition
ds['first_order'] = F.first_value('amount').over(
    partition_by='customer_id',
    order_by='date'
)
```


### 누적 함수 \{#cumulative\}

| Method          | 설명               |
| --------------- | ---------------- |
| `cumsum()`      | 누적 합             |
| `cummax()`      | 누적 최댓값           |
| `cummin()`      | 누적 최솟값           |
| `cumprod()`     | 누적 곱             |
| `diff(n)`       | n개 행 전과의 차이      |
| `pct_change(n)` | n개 행 전 대비 백분율 변화 |

**예시:**

```python
# Cumulative calculations
ds['running_total'] = ds['amount'].cumsum()
ds['running_max'] = ds['amount'].cummax()

# With grouping
ds['group_cumsum'] = ds.groupby('category')['amount'].cumsum()

# Period over period
ds['daily_diff'] = ds['sales'].diff(1)
ds['pct_change'] = ds['sales'].pct_change(1)
```


### 이동 윈도우 \{#rolling\}

```python
# Rolling window aggregations
ds['rolling_avg'] = ds['price'].rolling(window=7).mean()
ds['rolling_sum'] = ds['amount'].rolling(window=30).sum()
ds['rolling_std'] = ds['value'].rolling(window=10).std()

# Expanding windows
ds['expanding_max'] = ds['price'].expanding().max()
ds['expanding_sum'] = ds['amount'].expanding().sum()
```

***


## F 네임스페이스 \{#f-namespace\}

`F` 네임스페이스는 ClickHouse FUNCTION에 대한 접근을 제공합니다.

### 임포트 \{#f-import\}

```python
from chdb.datastore import F, Field
```


### F 함수 활용 \{#f-usage\}

```python
# Aggregations
F.sum(Field('amount'))
F.avg(Field('price'))
F.count(Field('id'))

# Statistical
F.quantile(Field('value'), 0.95)
F.stddev_pop(Field('score'))
F.corr(Field('x'), Field('y'))

# Conditional
F.sum_if(Field('amount'), Field('status') == 'completed')
F.count_if(Field('is_active'))

# String
F.length(Field('name'))
F.upper(Field('text'))

# Date/Time
F.to_year(Field('date'))
F.date_diff('day', Field('start'), Field('end'))

# Array
F.array_sum(Field('values'))
F.array_avg(Field('scores'))

# Math
F.abs(Field('delta'))
F.round(Field('price'), 2)
F.floor(Field('value'))
F.ceil(Field('value'))
```


### F와 윈도우 함수 \{#f-window\}

```python
# Define window frame
window = F.window(
    partition_by='category',
    order_by='date',
    rows_between=(-7, 0)  # Current row and 7 preceding
)

ds['rolling_avg'] = F.avg(Field('price')).over(window)
```

***


## 일반적인 집계 패턴 \{#patterns\}

### 그룹별 상위 N \{#top-n\}

```python
# Top 3 products per category by sales
result = (ds
    .assign(rank=F.row_number().over(
        partition_by='category',
        order_by=('sales', 'desc')
    ))
    .filter(ds['rank'] <= 3)
)
```


### 누적 합 \{#running-total\}

```python
# Running total of sales
ds['running_total'] = F.sum('amount').over(
    order_by='date',
    rows_between=(None, 0)  # All rows up to current
)
```


### 이동평균 \{#moving-avg\}

```python
# 7-day moving average
ds['ma_7'] = F.avg('price').over(
    order_by='date',
    rows_between=(-6, 0)
)
```


### 전년 대비 \{#yoy\}

```python
# YoY comparison
ds['prev_year_sales'] = F.lag('sales', 12).over(
    partition_by='product_id',
    order_by='month'
)
ds['yoy_growth'] = (ds['sales'] - ds['prev_year_sales']) / ds['prev_year_sales']
```


### 백분위수 순위 \{#percentile\}

```python
# Rank customers by total spend
ds['spend_percentile'] = F.percent_rank().over(order_by='total_spend')
```

***


## 집계 메서드 요약 \{#summary\}

| 범주 | 메서드 |
|----------|---------|
| **기본** | `sum`, `mean`, `count`, `min`, `max`, `median` |
| **통계** | `std`, `var`, `quantile`, `skew`, `kurt`, `corr`, `cov` |
| **조건부** | `sum_if`, `count_if`, `avg_if`, `min_if`, `max_if` |
| **집합** | `group_array`, `group_uniq_array`, `group_concat`, `top_k` |
| **순위** | `row_number`, `rank`, `dense_rank`, `ntile`, `percent_rank` |
| **값** | `lag`, `lead`, `first_value`, `last_value`, `nth_value` |
| **누적** | `cumsum`, `cummax`, `cummin`, `cumprod`, `diff`, `pct_change` |
| **롤링(이동)** | `rolling().mean/sum/std/...`, `expanding().mean/sum/...` |