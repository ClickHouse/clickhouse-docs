---
title: 'DataStore 集約関数'
sidebar_label: '集約'
slug: /chdb/datastore/aggregation
description: 'DataStore における集約関数、ウィンドウ関数、F ネームスペース'
keywords: ['chdb', 'datastore', 'aggregation', 'window', 'groupby', 'sum', 'mean', 'avg']
doc_type: 'reference'
---

# DataStore の集約関数 \{#datastore-aggregation-functions\}

DataStore は、ClickHouse の強力な SQL 集約機能を活用し、集約関数およびウィンドウ関数を包括的にサポートします。

## 基本的な集約 \{#basic\}

### 組み込みメソッド \{#builtin\}

| Method      | SQL 相当            | 説明          |
| ----------- | ----------------- | ----------- |
| `sum()`     | `SUM()`           | 値の合計        |
| `mean()`    | `AVG()`           | 平均値         |
| `count()`   | `COUNT()`         | null 以外の値の数 |
| `min()`     | `MIN()`           | 最小値         |
| `max()`     | `MAX()`           | 最大値         |
| `median()`  | `MEDIAN()`        | 中央値         |
| `std()`     | `stddevPop()`     | 標準偏差        |
| `var()`     | `varPop()`        | 分散          |
| `nunique()` | `COUNT(DISTINCT)` | ユニークな値の数    |

**例:**

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


## GroupBy による集約 \{#groupby\}

### 単一集約 \{#single-agg\}

```python
# Group by and aggregate
result = ds.groupby('category')['amount'].sum()
result = ds.groupby('region')['sales'].mean()
```


### 複数の集約処理 \{#multi-agg\}

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


### 名前付き集約 \{#named-agg\}

```python
# Named aggregation (pandas style)
result = ds.groupby('region').agg(
    total_amount=('amount', 'sum'),
    avg_quantity=('quantity', 'mean'),
    order_count=('order_id', 'count'),
    max_price=('price', 'max')
)
```


### 複数の GroupBy キーの利用 \{#multi-groupby\}

```python
# Group by multiple columns
result = ds.groupby(['region', 'category']).agg({
    'amount': 'sum',
    'quantity': 'sum'
})
```

***


## 統計集計 \{#statistical\}

| Method        | SQL Equivalent | Description    |
| ------------- | -------------- | -------------- |
| `quantile(q)` | `quantile(q)`  | q 番目の分位数 (0-1) |
| `skew()`      | `skewPop()`    | 歪度             |
| `kurt()`      | `kurtPop()`    | 尖度             |
| `corr()`      | `corr()`       | 相関             |
| `cov()`       | `covar()`      | 共分散            |
| `sem()`       | -              | 平均の標準誤差        |

**例:**

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


## 条件付き集約 \{#conditional\}

ClickHouse 固有の条件付き集約関数です。

| Function         | ClickHouse  | Description |
| ---------------- | ----------- | ----------- |
| `sum_if(cond)`   | `sumIf()`   | 条件を満たす行の合計値 |
| `count_if(cond)` | `countIf()` | 条件を満たす行の件数  |
| `avg_if(cond)`   | `avgIf()`   | 条件を満たす行の平均値 |
| `min_if(cond)`   | `minIf()`   | 条件を満たす行の最小値 |
| `max_if(cond)`   | `maxIf()`   | 条件を満たす行の最大値 |

**例:**

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


## コレクション集約関数 \{#collection\}

値を集約する ClickHouse 固有の関数。

| Function             | ClickHouse         | Description  |
| -------------------- | ------------------ | ------------ |
| `group_array()`      | `groupArray()`     | 配列として集約      |
| `group_uniq_array()` | `groupUniqArray()` | 一意な値を配列として集約 |
| `group_concat(sep)`  | `groupConcat()`    | 文字列を連結       |
| `top_k(n)`           | `topK(n)`          | 出現頻度上位 K 個の値 |
| `any()`              | `any()`            | いずれか 1 つの値   |
| `any_last()`         | `anyLast()`        | 最後の値         |
| `first_value()`      | `first_value()`    | 並び順の先頭の値     |
| `last_value()`       | `last_value()`     | 並び順の最後の値     |

**例:**

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


## ウィンドウ関数 \{#window\}

### ランキング関数 \{#ranking\}

| Function         | SQL              | Description  |
| ---------------- | ---------------- | ------------ |
| `row_number()`   | `ROW_NUMBER()`   | 連番の行番号       |
| `rank()`         | `RANK()`         | 欠番を含む順位      |
| `dense_rank()`   | `DENSE_RANK()`   | 欠番のない連続した順位  |
| `ntile(n)`       | `NTILE(n)`       | n 個のバケットへの分割 |
| `percent_rank()` | `PERCENT_RANK()` | 百分位順位 (0〜1)  |
| `cume_dist()`    | `CUME_DIST()`    | 累積分布値        |

**例:**

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


### 値関数 \{#value-functions\}

| Function        | SQL                 | 説明           |
| --------------- | ------------------- | ------------ |
| `lag(n)`        | `LAG(col, n)`       | 前の行の値        |
| `lead(n)`       | `LEAD(col, n)`      | 次の行の値        |
| `first_value()` | `FIRST_VALUE()`     | ウィンドウ内の最初の値  |
| `last_value()`  | `LAST_VALUE()`      | ウィンドウ内の最後の値  |
| `nth_value(n)`  | `NTH_VALUE(col, n)` | ウィンドウ内のn番目の値 |

**例:**

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


### 累積関数 \{#cumulative\}

| Method          | Description |
| --------------- | ----------- |
| `cumsum()`      | 累積合計        |
| `cummax()`      | 累積最大値       |
| `cummin()`      | 累積最小値       |
| `cumprod()`     | 累積積         |
| `diff(n)`       | n 行前との差     |
| `pct_change(n)` | n 行前からの変化率  |

**例:**

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


### ローリングウィンドウ \{#rolling\}

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


## F ネームスペース \{#f-namespace\}

`F` ネームスペースは、ClickHouse の関数へアクセスするための手段を提供します。

### インポート \{#f-import\}

```python
from chdb.datastore import F, Field
```


### F 関数の利用 \{#f-usage\}

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


### ウィンドウ関数を用いたF \{#f-window\}

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


## 一般的な集約パターン \{#patterns\}

### グループごとの上位 N 件 \{#top-n\}

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


### 累積合計 \{#running-total\}

```python
# Running total of sales
ds['running_total'] = F.sum('amount').over(
    order_by='date',
    rows_between=(None, 0)  # All rows up to current
)
```


### 移動平均 \{#moving-avg\}

```python
# 7-day moving average
ds['ma_7'] = F.avg('price').over(
    order_by='date',
    rows_between=(-6, 0)
)
```


### 前年比較 \{#yoy\}

```python
# YoY comparison
ds['prev_year_sales'] = F.lag('sales', 12).over(
    partition_by='product_id',
    order_by='month'
)
ds['yoy_growth'] = (ds['sales'] - ds['prev_year_sales']) / ds['prev_year_sales']
```


### パーセンタイルランク \{#percentile\}

```python
# Rank customers by total spend
ds['spend_percentile'] = F.percent_rank().over(order_by='total_spend')
```

***


## 集約メソッドの概要 \{#summary\}

| カテゴリ | メソッド |
|----------|---------|
| **基本** | `sum`, `mean`, `count`, `min`, `max`, `median` |
| **統計的** | `std`, `var`, `quantile`, `skew`, `kurt`, `corr`, `cov` |
| **条件付き** | `sum_if`, `count_if`, `avg_if`, `min_if`, `max_if` |
| **コレクション** | `group_array`, `group_uniq_array`, `group_concat`, `top_k` |
| **順位付け** | `row_number`, `rank`, `dense_rank`, `ntile`, `percent_rank` |
| **値** | `lag`, `lead`, `first_value`, `last_value`, `nth_value` |
| **累積** | `cumsum`, `cummax`, `cummin`, `cumprod`, `diff`, `pct_change` |
| **ローリング** | `rolling().mean/sum/std/...`, `expanding().mean/sum/...` |