---
title: 'Функции агрегации DataStore'
sidebar_label: 'Агрегация'
slug: /chdb/datastore/aggregation
description: 'Функции агрегации, оконные функции и пространство имен F в DataStore'
keywords: ['chdb', 'datastore', 'aggregation', 'window', 'groupby', 'sum', 'mean', 'avg']
doc_type: 'reference'
---

# Агрегатные функции DataStore \{#datastore-aggregation-functions\}

DataStore предоставляет широкие возможности агрегатных и оконных функций, используя мощные средства агрегирования SQL в ClickHouse.

## Базовые агрегации \{#basic\}

### Встроенные методы \{#builtin\}

| Method      | SQL-эквивалент    | Описание                      |
| ----------- | ----------------- | ----------------------------- |
| `sum()`     | `SUM()`           | Сумма значений                |
| `mean()`    | `AVG()`           | Среднее значение              |
| `count()`   | `COUNT()`         | Количество ненулевых значений |
| `min()`     | `MIN()`           | Минимальное значение          |
| `max()`     | `MAX()`           | Максимальное значение         |
| `median()`  | `MEDIAN()`        | Медиана                       |
| `std()`     | `stddevPop()`     | Стандартное отклонение        |
| `var()`     | `varPop()`        | Дисперсия                     |
| `nunique()` | `COUNT(DISTINCT)` | Число уникальных значений     |

**Примеры:**

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


## Агрегации GroupBy \{#groupby\}

### Одиночная агрегация \{#single-agg\}

```python
# Group by and aggregate
result = ds.groupby('category')['amount'].sum()
result = ds.groupby('region')['sales'].mean()
```


### Множественные агрегации \{#multi-agg\}

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


### Именованные агрегаты \{#named-agg\}

```python
# Named aggregation (pandas style)
result = ds.groupby('region').agg(
    total_amount=('amount', 'sum'),
    avg_quantity=('quantity', 'mean'),
    order_count=('order_id', 'count'),
    max_price=('price', 'max')
)
```


### Несколько ключей группировки (GroupBy) \{#multi-groupby\}

```python
# Group by multiple columns
result = ds.groupby(['region', 'category']).agg({
    'amount': 'sum',
    'quantity': 'sum'
})
```

***


## Статистические агрегации \{#statistical\}

| Метод         | Эквивалент в SQL | Описание                    |
| ------------- | ---------------- | --------------------------- |
| `quantile(q)` | `quantile(q)`    | q-я квантиль (0–1)          |
| `skew()`      | `skewPop()`      | Асимметрия                  |
| `kurt()`      | `kurtPop()`      | Эксцесс                     |
| `corr()`      | `corr()`         | Корреляция                  |
| `cov()`       | `covar()`        | Ковариация                  |
| `sem()`       | -                | Стандартная ошибка среднего |

**Примеры:**

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


## Условные агрегации \{#conditional\}

Специфичные для ClickHouse функции условной агрегации.

| Function         | ClickHouse  | Description                 |
| ---------------- | ----------- | --------------------------- |
| `sum_if(cond)`   | `sumIf()`   | Сумма по условию            |
| `count_if(cond)` | `countIf()` | Количество по условию       |
| `avg_if(cond)`   | `avgIf()`   | Среднее значение по условию |
| `min_if(cond)`   | `minIf()`   | Минимум по условию          |
| `max_if(cond)`   | `maxIf()`   | Максимум по условию         |

**Примеры:**

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


## Агрегации коллекций \{#collection\}

Функции ClickHouse, которые собирают значения.

| Function             | ClickHouse         | Description                           |
| -------------------- | ------------------ | ------------------------------------- |
| `group_array()`      | `groupArray()`     | Собирает значения в массив            |
| `group_uniq_array()` | `groupUniqArray()` | Собирает уникальные значения в массив |
| `group_concat(sep)`  | `groupConcat()`    | Объединяет строки                     |
| `top_k(n)`           | `topK(n)`          | K наиболее частых значений            |
| `any()`              | `any()`            | Любое из значений                     |
| `any_last()`         | `anyLast()`        | Последнее значение                    |
| `first_value()`      | `first_value()`    | Первое значение по порядку            |
| `last_value()`       | `last_value()`     | Последнее значение по порядку         |

**Примеры:**

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


## Оконные функции \{#window\}

### Функции ранжирования \{#ranking\}

| Функция          | SQL              | Описание                      |
| ---------------- | ---------------- | ----------------------------- |
| `row_number()`   | `ROW_NUMBER()`   | Последовательный номер строки |
| `rank()`         | `RANK()`         | Ранг с пропусками             |
| `dense_rank()`   | `DENSE_RANK()`   | Ранг без пропусков            |
| `ntile(n)`       | `NTILE(n)`       | Разделить на n групп          |
| `percent_rank()` | `PERCENT_RANK()` | Процентильный ранг (0-1)      |
| `cume_dist()`    | `CUME_DIST()`    | Накопленное распределение     |

**Примеры:**

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


### Функции значений \{#value-functions\}

| Функция         | SQL                 | Описание                   |
| --------------- | ------------------- | -------------------------- |
| `lag(n)`        | `LAG(col, n)`       | Значение предыдущей строки |
| `lead(n)`       | `LEAD(col, n)`      | Значение следующей строки  |
| `first_value()` | `FIRST_VALUE()`     | Первое значение в окне     |
| `last_value()`  | `LAST_VALUE()`      | Последнее значение в окне  |
| `nth_value(n)`  | `NTH_VALUE(col, n)` | N-е значение в окне        |

**Примеры:**

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


### Кумулятивные функции \{#cumulative\}

| Method          | Description                                     |
| --------------- | ----------------------------------------------- |
| `cumsum()`      | Кумулятивная сумма                              |
| `cummax()`      | Кумулятивный максимум                           |
| `cummin()`      | Кумулятивный минимум                            |
| `cumprod()`     | Кумулятивное произведение                       |
| `diff(n)`       | Разность со значением n строк назад             |
| `pct_change(n)` | Процентное изменение относительно n строк назад |

**Примеры:**

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


### Скользящие окна \{#rolling\}

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


## Пространство имён F \{#f-namespace\}

Пространство имён `F` предоставляет доступ к функциям ClickHouse.

### Импорт \{#f-import\}

```python
from chdb.datastore import F, Field
```


### Использование функций из пространства имён F \{#f-usage\}

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


### F с оконными функциями \{#f-window\}

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


## Типовые шаблоны агрегации \{#patterns\}

### Top N в каждой группе \{#top-n\}

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


### Нарастающий итог \{#running-total\}

```python
# Running total of sales
ds['running_total'] = F.sum('amount').over(
    order_by='date',
    rows_between=(None, 0)  # All rows up to current
)
```


### Скользящее среднее \{#moving-avg\}

```python
# 7-day moving average
ds['ma_7'] = F.avg('price').over(
    order_by='date',
    rows_between=(-6, 0)
)
```


### Сравнение «год к году» \{#yoy\}

```python
# YoY comparison
ds['prev_year_sales'] = F.lag('sales', 12).over(
    partition_by='product_id',
    order_by='month'
)
ds['yoy_growth'] = (ds['sales'] - ds['prev_year_sales']) / ds['prev_year_sales']
```


### Ранжирование по процентилю \{#percentile\}

```python
# Rank customers by total spend
ds['spend_percentile'] = F.percent_rank().over(order_by='total_spend')
```

***


## Сводка методов агрегации \{#summary\}

| Категория | Методы |
|----------|---------|
| **Базовые** | `sum`, `mean`, `count`, `min`, `max`, `median` |
| **Статистические** | `std`, `var`, `quantile`, `skew`, `kurt`, `corr`, `cov` |
| **Условные** | `sum_if`, `count_if`, `avg_if`, `min_if`, `max_if` |
| **Коллекционные** | `group_array`, `group_uniq_array`, `group_concat`, `top_k` |
| **Ранжирование** | `row_number`, `rank`, `dense_rank`, `ntile`, `percent_rank` |
| **Значения** | `lag`, `lead`, `first_value`, `last_value`, `nth_value` |
| **Накопительные** | `cumsum`, `cummax`, `cummin`, `cumprod`, `diff`, `pct_change` |
| **Скользящие** | `rolling().mean/sum/std/...`, `expanding().mean/sum/...` |