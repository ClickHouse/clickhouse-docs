---
title: 'Руководство по производительности'
sidebar_label: 'Руководство по производительности'
slug: /chdb/guides/pandas-performance
description: 'Рекомендации по оптимизации производительности DataStore в сравнении с pandas'
keywords: ['chdb', 'datastore', 'pandas', 'performance', 'benchmark', 'optimization']
doc_type: 'guide'
---

# Руководство по производительности \{#performance-guide\}

DataStore обеспечивает значительный прирост производительности по сравнению с pandas для многих операций. В этом руководстве объясняется, почему это так и как оптимизировать ваши рабочие нагрузки.

## Почему DataStore быстрее \{#why-faster\}

### 1. SQL Pushdown \{#sql-pushdown\}

Операции выполняются непосредственно в источнике данных:

```python
# pandas: Loads ALL data, then filters in memory
df = pd.read_csv("huge.csv")       # Load 10GB
df = df[df['year'] == 2024]        # Filter in Python

# DataStore: Filter at source
ds = pd.read_csv("huge.csv")       # Just metadata
ds = ds[ds['year'] == 2024]        # Filter in SQL
df = ds.to_df()                    # Only load filtered data
```


### 2. Отсечение столбцов \{#column-pruning\}

Читаются только необходимые столбцы:

```python
# DataStore: Only reads name, age columns
ds = pd.read_parquet("wide_table.parquet")
result = ds.select('name', 'age').to_df()

# vs pandas: Reads all 100 columns, then selects
```


### 3. Ленивое вычисление \{#lazy-evaluation\}

Несколько операций объединяются в один запрос:

```python
# DataStore: One optimized SQL query
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# Becomes:
# SELECT region, SUM(amount) FROM data
# WHERE amount > 100
# GROUP BY region ORDER BY sum DESC LIMIT 10
```

***


## Бенчмарк: DataStore и pandas \{#benchmark\}

### Тестовая среда \{#test-environment\}

- Данные: 10 миллионов строк
- Оборудование: стандартный ноутбук
- Формат файла: CSV

### Результаты \{#results\}

| Операция | pandas (мс) | DataStore (мс) | Победитель |
|-----------|-------------|----------------|------------|
| GroupBy count | 347 | 17 | **DataStore (19.93x)** |
| Combined ops | 1,535 | 234 | **DataStore (6.56x)** |
| Complex pipeline | 2,047 | 380 | **DataStore (5.39x)** |
| MultiFilter+Sort+Head | 1,963 | 366 | **DataStore (5.36x)** |
| Filter+Sort+Head | 1,537 | 350 | **DataStore (4.40x)** |
| Head/Limit | 166 | 45 | **DataStore (3.69x)** |
| Ultra-complex (10+ ops) | 1,070 | 338 | **DataStore (3.17x)** |
| GroupBy agg | 406 | 141 | **DataStore (2.88x)** |
| Select+Filter+Sort | 1,217 | 443 | **DataStore (2.75x)** |
| Filter+GroupBy+Sort | 466 | 184 | **DataStore (2.53x)** |
| Filter+Select+Sort | 1,285 | 533 | **DataStore (2.41x)** |
| Sort (single) | 1,742 | 1,197 | **DataStore (1.45x)** |
| Filter (single) | 276 | 526 | Сравнимо |
| Sort (multiple) | 947 | 1,477 | Сравнимо |

### Ключевые выводы \{#insights\}

1. **Операции GroupBy**: DataStore до **19.93 раза быстрее**
2. **Сложные пайплайны обработки**: DataStore **в 5–6 раз быстрее** (благодаря SQL pushdown)
3. **Простые операции выборки (slice)**: Производительность сопоставима — разница пренебрежимо мала
4. **Оптимальный сценарий**: Многошаговые операции с groupby/агрегацией
5. **Zero-copy**: `to_df()` не добавляет накладных расходов на преобразование данных

---

## Когда выигрывает DataStore \{#when-datastore-wins\}

### Тяжёлые агрегации \{#heavy-aggregations\}

```python
# DataStore excels: 19.93x faster
result = ds.groupby('category')['amount'].sum()
```


### Сложные конвейеры обработки данных \{#complex-pipelines\}

```python
# DataStore excels: 5-6x faster
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': ['sum', 'mean', 'count']})
    .sort('sum', ascending=False)
    .head(20)
)
```


### Обработка больших файлов \{#large-file-processing\}

```python
# DataStore: Only loads what you need
ds = pd.read_parquet("huge_file.parquet")
result = ds.filter(ds['id'] == 12345).to_df()  # Fast!
```


### Операции над несколькими столбцами \{#multiple-column-operations\}

```python
# DataStore: Combines into single SQL
ds['total'] = ds['price'] * ds['quantity']
ds['is_large'] = ds['total'] > 1000
ds = ds.filter(ds['is_large'])
```

***


## Когда pandas сопоставим по производительности \{#when-pandas-wins\}

В большинстве сценариев DataStore соответствует производительности pandas или превосходит её. Однако в следующих конкретных случаях pandas может быть немного быстрее:

### Небольшие наборы данных (&lt;1,000 строк) \{#small-datasets\}

```python
# For very small datasets, overhead is minimal for both
# Performance difference is negligible
small_df = pd.DataFrame({'x': range(100)})
```


### Простые операции среза \{#simple-slice-operations\}

```python
# Single slice operations without aggregation
df = df[df['x'] > 10]  # pandas slightly faster
ds = ds[ds['x'] > 10]  # DataStore comparable
```


### Пользовательские лямбда-функции на Python \{#custom-python-functions\}

```python
# pandas required for custom Python code
def complex_function(row):
    return custom_logic(row)

df['result'] = df.apply(complex_function, axis=1)
```

:::note Важно
Даже в сценариях, когда DataStore оказывается «медленнее», производительность обычно **сопоставима с pandas** — разница пренебрежимо мала для практического использования. Преимущества DataStore в сложных операциях значительно перевешивают эти редкие случаи.

Для тонкой настройки выполнения см. раздел [Execution Engine Configuration](../configuration/execution-engine.md).
:::

***


## Zero-copy интеграция DataFrame \{#zero-copy\}

DataStore использует **zero-copy** при чтении и записи pandas DataFrame. Это означает:

```python
# to_df() does NOT copy data - it's a zero-copy operation
result = ds.filter(ds['x'] > 10).to_df()  # No data conversion overhead

# Same for creating DataStore from DataFrame
ds = DataStore(existing_df)  # No data copy
```

**Ключевые выводы:**

* `to_df()` практически не имеет накладных расходов — нет сериализации и копирования памяти
* Создание DataStore из pandas DataFrame происходит мгновенно
* Память разделяется между DataStore и представлениями pandas

***


## Рекомендации по оптимизации \{#tips\}

### 1. Используйте формат Parquet вместо CSV \{#use-parquet\}

```python
# CSV: Slower, reads entire file
ds = pd.read_csv("data.csv")

# Parquet: Faster, columnar, compressed
ds = pd.read_parquet("data.parquet")

# Convert once, benefit forever
df = pd.read_csv("data.csv")
df.to_parquet("data.parquet")
```

**Ожидаемый прирост производительности**: операции чтения в 3–10 раз быстрее


### 2. Выполняйте фильтрацию как можно раньше \{#filter-early\}

```python
# Good: Filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduce data early
    .groupby('category')['amount'].sum()
)

# Less optimal: Process all data
result = (ds
    .groupby('category')['amount'].sum()
    .filter(ds['sum'] > 1000)  # Filter too late
)
```


### 3. Выбирайте только нужные столбцы \{#select-only-needed-columns\}

```python
# Good: Column pruning
result = ds.select('name', 'amount').filter(ds['amount'] > 100)

# Less optimal: All columns loaded
result = ds.filter(ds['amount'] > 100)  # Loads all columns
```


### 4. Используйте агрегатные функции SQL \{#leverage-sql-aggregations\}

```python
# GroupBy is where DataStore shines
# Up to 20x speedup!
result = ds.groupby('category').agg({
    'amount': ['sum', 'mean', 'count', 'max'],
    'quantity': 'sum'
})
```


### 5. Используйте head() вместо выполнения полных запросов \{#use-head\}

```python
# Don't load entire result if you only need a sample
result = ds.filter(ds['type'] == 'A').head(100)  # LIMIT 100

# Avoid this for large results
# result = ds.filter(ds['type'] == 'A').to_df()  # Loads everything
```


### 6. Пакетные операции \{#batch-operations\}

```python
# Good: Single execution
result = ds.filter(ds['x'] > 10).filter(ds['y'] < 100).to_df()

# Bad: Multiple executions
result1 = ds.filter(ds['x'] > 10).to_df()  # Execute
result2 = result1[result1['y'] < 100]       # Execute again
```


### 7. Используйте explain() для оптимизации запросов \{#use-explain\}

```python
# View the query plan before executing
query = ds.filter(...).groupby(...).agg(...)
query.explain()  # Check if operations are pushed down

# Then execute
result = query.to_df()
```

***


## Профилирование нагрузки \{#profiling\}

### Включите профилирование \{#enable-profiling\}

```python
from chdb.datastore.config import config, get_profiler

config.enable_profiling()

# Run your workload
result = your_pipeline()

# View report
profiler = get_profiler()
profiler.report()
```


### Определение узких мест \{#identify-bottlenecks\}

```text
Performance Report
==================
Step                    Duration    % Total
----                    --------    -------
SQL execution           2.5s        62.5%     <- Bottleneck!
read_csv                1.2s        30.0%
Other                   0.3s        7.5%
```


### Сравнение подходов \{#compare-approaches\}

```python
# Test approach 1
profiler.reset()
result1 = approach1()
time1 = profiler.get_steps()[-1]['duration_ms']

# Test approach 2
profiler.reset()
result2 = approach2()
time2 = profiler.get_steps()[-1]['duration_ms']

print(f"Approach 1: {time1:.0f}ms")
print(f"Approach 2: {time2:.0f}ms")
```

***


## Краткое резюме рекомендаций \{#summary\}

| Рекомендация | Результат |
|--------------|-----------|
| Используйте файлы Parquet | Чтение в 3–10 раз быстрее |
| Фильтруйте как можно раньше | Сократите объём обрабатываемых данных |
| Выбирайте только нужные столбцы | Сократите I/O и потребление памяти |
| Используйте GroupBy/агрегации | До 20 раз быстрее |
| Объединяйте операции в батчи | Избегайте повторного выполнения |
| Проводите профилирование перед оптимизацией | Найдите реальные узкие места |
| Используйте explain() | Проверьте оптимизацию запроса |
| Используйте head() для выборок | Избегайте полного сканирования таблицы |

---

## Краткое руководство по выбору \{#decision\}

| Ваша рабочая нагрузка | Рекомендация |
|---------------|--------------|
| GroupBy/агрегация | Используйте DataStore |
| Сложный многошаговый конвейер обработки данных | Используйте DataStore |
| Крупные файлы с фильтрами | Используйте DataStore |
| Простые операции выборки (slice) | Любой вариант (сопоставимая производительность) |
| Пользовательские Python-функции lambda | Используйте pandas или выполните преобразование на позднем этапе |
| Очень небольшой объём данных (&lt;1 000 строк) | Любой вариант (незначительная разница) |

:::tip
Для автоматического оптимального выбора движка используйте `config.set_execution_engine('auto')` (по умолчанию).
Подробности см. в разделе [Execution Engine Configuration](../configuration/execution-engine.md).
:::