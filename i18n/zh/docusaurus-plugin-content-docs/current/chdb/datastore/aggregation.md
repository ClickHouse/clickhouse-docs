---
title: 'DataStore 聚合函数'
sidebar_label: '聚合'
slug: /chdb/datastore/aggregation
description: 'DataStore 中的聚合函数、窗口函数以及 F 命名空间'
keywords: ['chdb', 'datastore', 'aggregation', 'window', 'groupby', 'sum', 'mean', 'avg']
doc_type: 'reference'
---

# DataStore 聚合函数 \{#datastore-aggregation-functions\}

DataStore 提供了完整的聚合函数和窗口函数支持，充分利用 ClickHouse 强大的 SQL 聚合能力。

## 基本聚合 \{#basic\}

### 内置方法 \{#builtin\}

| Method      | 对应的 SQL 函数        | 说明       |
| ----------- | ----------------- | -------- |
| `sum()`     | `SUM()`           | 值的求和     |
| `mean()`    | `AVG()`           | 平均值/均值   |
| `count()`   | `COUNT()`         | 统计非空值数量  |
| `min()`     | `MIN()`           | 最小值      |
| `max()`     | `MAX()`           | 最大值      |
| `median()`  | `MEDIAN()`        | 中位数      |
| `std()`     | `stddevPop()`     | 标准差      |
| `var()`     | `varPop()`        | 方差       |
| `nunique()` | `COUNT(DISTINCT)` | 统计唯一值的数量 |

**示例：**

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


## GroupBy 分组聚合 \{#groupby\}

### 单个聚合 \{#single-agg\}

```python
# Group by and aggregate
result = ds.groupby('category')['amount'].sum()
result = ds.groupby('region')['sales'].mean()
```


### 多个聚合 \{#multi-agg\}

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


### 具名聚合 \{#named-agg\}

```python
# Named aggregation (pandas style)
result = ds.groupby('region').agg(
    total_amount=('amount', 'sum'),
    avg_quantity=('quantity', 'mean'),
    order_count=('order_id', 'count'),
    max_price=('price', 'max')
)
```


### 多个 GroupBy 键 \{#multi-groupby\}

```python
# Group by multiple columns
result = ds.groupby(['region', 'category']).agg({
    'amount': 'sum',
    'quantity': 'sum'
})
```

***


## 统计聚合 \{#statistical\}

| Method        | SQL Equivalent | Description  |
| ------------- | -------------- | ------------ |
| `quantile(q)` | `quantile(q)`  | 第 q 分位数（0-1） |
| `skew()`      | `skewPop()`    | 偏度           |
| `kurt()`      | `kurtPop()`    | 峰度           |
| `corr()`      | `corr()`       | 相关系数         |
| `cov()`       | `covar()`      | 协方差          |
| `sem()`       | -              | 均值的标准误       |

**示例：**

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


## 条件聚合 \{#conditional\}

ClickHouse 特有的条件聚合函数。

| Function         | ClickHouse  | Description |
| ---------------- | ----------- | ----------- |
| `sum_if(cond)`   | `sumIf()`   | 在满足条件时求和    |
| `count_if(cond)` | `countIf()` | 在满足条件时计数    |
| `avg_if(cond)`   | `avgIf()`   | 在满足条件时求平均值  |
| `min_if(cond)`   | `minIf()`   | 在满足条件时取最小值  |
| `max_if(cond)`   | `maxIf()`   | 在满足条件时取最大值  |

**示例：**

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


## 集合聚合函数 \{#collection\}

ClickHouse 特有的用于收集值的函数。

| Function             | ClickHouse         | Description |
| -------------------- | ------------------ | ----------- |
| `group_array()`      | `groupArray()`     | 收集为数组       |
| `group_uniq_array()` | `groupUniqArray()` | 收集为去重数组     |
| `group_concat(sep)`  | `groupConcat()`    | 拼接字符串       |
| `top_k(n)`           | `topK(n)`          | 前 K 个最频繁的值  |
| `any()`              | `any()`            | 任意一个值       |
| `any_last()`         | `anyLast()`        | 最后一个值       |
| `first_value()`      | `first_value()`    | 按顺序的首个值     |
| `last_value()`       | `last_value()`     | 按顺序的最后一个值   |

**示例：**

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


## 窗口函数 \{#window\}

### 排名函数 \{#ranking\}

| Function         | SQL              | Description |
| ---------------- | ---------------- | ----------- |
| `row_number()`   | `ROW_NUMBER()`   | 顺序行号        |
| `rank()`         | `RANK()`         | 带间隙的排名      |
| `dense_rank()`   | `DENSE_RANK()`   | 无间隙的排名      |
| `ntile(n)`       | `NTILE(n)`       | 划分为 n 个桶    |
| `percent_rank()` | `PERCENT_RANK()` | 百分位排名（0-1）  |
| `cume_dist()`    | `CUME_DIST()`    | 累积分布        |

**示例：**

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


### 值函数 \{#value-functions\}

| Function        | SQL                 | Description |
| --------------- | ------------------- | ----------- |
| `lag(n)`        | `LAG(col, n)`       | 上一行的值       |
| `lead(n)`       | `LEAD(col, n)`      | 下一行的值       |
| `first_value()` | `FIRST_VALUE()`     | 窗口内的第一个值    |
| `last_value()`  | `LAST_VALUE()`      | 窗口内的最后一个值   |
| `nth_value(n)`  | `NTH_VALUE(col, n)` | 窗口内的第 N 个值  |

**示例：**

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


### 累积函数 \{#cumulative\}

| Method          | Description    |
| --------------- | -------------- |
| `cumsum()`      | 累积和            |
| `cummax()`      | 累积最大值          |
| `cummin()`      | 累积最小值          |
| `cumprod()`     | 累积乘积           |
| `diff(n)`       | 与前 n 行的差值      |
| `pct_change(n)` | 与前 n 行相比的百分比变化 |

**示例：**

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


### 滚动窗口 \{#rolling\}

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


## F 命名空间 \{#f-namespace\}

`F` 命名空间用于访问 ClickHouse 函数。

### 导入 \{#f-import\}

```python
from chdb.datastore import F, Field
```


### 使用 F 命名空间函数 \{#f-usage\}

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


### F 与窗口函数配合使用 \{#f-window\}

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


## 常见聚合模式 \{#patterns\}

### 每组的前 N 个 \{#top-n\}

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


### 累积和 \{#running-total\}

```python
# Running total of sales
ds['running_total'] = F.sum('amount').over(
    order_by='date',
    rows_between=(None, 0)  # All rows up to current
)
```


### 移动平均 \{#moving-avg\}

```python
# 7-day moving average
ds['ma_7'] = F.avg('price').over(
    order_by='date',
    rows_between=(-6, 0)
)
```


### 年度同比对比 \{#yoy\}

```python
# YoY comparison
ds['prev_year_sales'] = F.lag('sales', 12).over(
    partition_by='product_id',
    order_by='month'
)
ds['yoy_growth'] = (ds['sales'] - ds['prev_year_sales']) / ds['prev_year_sales']
```


### 百分位数排名 \{#percentile\}

```python
# Rank customers by total spend
ds['spend_percentile'] = F.percent_rank().over(order_by='total_spend')
```

***


## 聚合方法汇总 \{#summary\}

| 类别 | 方法 |
|----------|---------|
| **基础** | `sum`, `mean`, `count`, `min`, `max`, `median` |
| **统计** | `std`, `var`, `quantile`, `skew`, `kurt`, `corr`, `cov` |
| **条件** | `sum_if`, `count_if`, `avg_if`, `min_if`, `max_if` |
| **集合** | `group_array`, `group_uniq_array`, `group_concat`, `top_k` |
| **排名** | `row_number`, `rank`, `dense_rank`, `ntile`, `percent_rank` |
| **取值** | `lag`, `lead`, `first_value`, `last_value`, `nth_value` |
| **累积** | `cumsum`, `cummax`, `cummin`, `cumprod`, `diff`, `pct_change` |
| **滚动/扩展** | `rolling().mean/sum/std/...`, `expanding().mean/sum/...` |