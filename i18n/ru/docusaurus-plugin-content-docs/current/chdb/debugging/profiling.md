---
title: 'Профилирование DataStore'
sidebar_label: 'Профилирование'
slug: /chdb/debugging/profiling
description: 'Измерение производительности DataStore с помощью встроенного средства профилирования'
keywords: ['chdb', 'datastore', 'профилирование', 'производительность', 'тайминг', 'бенчмарк']
doc_type: 'guide'
---

# Профилирование DataStore \{#datastore-profiling\}

Профилировщик DataStore позволяет измерять время выполнения и выявлять узкие места в производительности.

## Быстрый старт \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run your operations
ds = pd.read_csv("large_data.csv")
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('category')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# View report
profiler = get_profiler()
print(profiler.report())
```


## Включение профилирования \{#enabling\}

```python
from chdb.datastore.config import config

# Enable profiling
config.enable_profiling()

# Disable profiling
config.disable_profiling()

# Check if profiling is enabled
print(config.profiling_enabled)  # True or False
```

***


## API профилировщика \{#api\}

### Получение экземпляра профайлера \{#get-profiler\}

```python
from chdb.datastore.config import get_profiler

profiler = get_profiler()
```


### report() \{#report\}

Выводит отчет о производительности.

```python
profiler.report(min_duration_ms=0.1)
```

**Параметры:**

| Параметр          | Тип   | По умолчанию | Описание                                                |
| ----------------- | ----- | ------------ | ------------------------------------------------------- |
| `min_duration_ms` | float | `0.1`        | Показывать только шаги с длительностью ≥ этого значения |

**Пример вывода:**

```text
======================================================================
EXECUTION PROFILE
======================================================================
   45.79ms (100.0%) Total Execution
     23.25ms ( 50.8%) Query Planning [ops_count=2]
     22.29ms ( 48.7%) SQL Segment 1 [ops=2]
       20.48ms ( 91.9%) SQL Execution
        1.74ms (  7.8%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:    45.79ms
======================================================================
```

Отчёт показывает:

* Длительность каждого шага в миллисекундах
* Долю во времени родительской операции / общего времени
* Иерархическое вложение операций
* Метаданные для каждого шага (например, `ops_count`, `ops`)


### step() \{#step\}

Измеряет время выполнения блока кода вручную.

```python
with profiler.step("custom_operation"):
    # Your code here
    expensive_operation()
```


### clear() \{#clear\}

Очищает все данные профилирования.

```python
profiler.clear()
```


### summary() \{#summary\}

Возвращает словарь, сопоставляющий имена шагов с их длительностью (мс).

```python
summary = profiler.summary()
for name, duration in summary.items():
    print(f"{name}: {duration:.2f}ms")
```

Пример вывода:

```text
Total Execution: 45.79ms
Total Execution.Cache Check: 0.00ms
Total Execution.Query Planning: 23.25ms
Total Execution.SQL Segment 1: 22.29ms
Total Execution.SQL Segment 1.SQL Execution: 20.48ms
Total Execution.SQL Segment 1.Result to DataFrame: 1.74ms
```

***


## Разбор отчёта \{#understanding\}

### Названия шагов \{#step-names\}

| Название шага | Описание |
|-----------|----------|
| `Total Execution` | Общее время выполнения |
| `Query Planning` | Время, затраченное на планирование запроса |
| `SQL Segment N` | Выполнение SQL-сегмента N |
| `SQL Execution` | Фактическое выполнение SQL-запроса |
| `Result to DataFrame` | Преобразование результатов в DataFrame pandas |
| `Cache Check` | Проверка кэша запросов |
| `Cache Write` | Запись результатов в кэш |

### Длительность \{#duration\}

- **Этапы планирования** (Query Planning): обычно выполняются быстро
- **Этапы выполнения** (SQL Execution): здесь выполняется основная работа
- **Этапы передачи** (Result to DataFrame): преобразование данных в pandas

### Определение узких мест \{#bottlenecks\}

```text
======================================================================
EXECUTION PROFILE
======================================================================
  200.50ms (100.0%) Total Execution
    10.25ms (  5.1%) Query Planning [ops_count=4]
   190.00ms ( 94.8%) SQL Segment 1 [ops=4]
     185.00ms ( 97.4%) SQL Execution    <- Main bottleneck
       5.00ms (  2.6%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:   200.50ms
======================================================================
```

***


## Паттерны профилирования \{#patterns\}

### Профилирование одного запроса \{#single-query\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()  # Clear previous data

# Run query
result = ds.filter(...).groupby(...).agg(...).to_df()

# View this query's profile
print(profiler.report())
```


### Профилирование нескольких запросов \{#multiple-queries\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()

# Query 1
with profiler.step("Query 1"):
    result1 = query1.to_df()

# Query 2
with profiler.step("Query 2"):
    result2 = query2.to_df()

print(profiler.report())
```


### Сравнение подходов \{#compare\}

```python
profiler = get_profiler()

# Approach 1: Filter then groupby
profiler.clear()
with profiler.step("filter_then_groupby"):
    result1 = ds.filter(ds['x'] > 10).groupby('y').sum().to_df()
summary1 = profiler.summary()
time1 = summary1.get('filter_then_groupby', 0)

# Approach 2: Groupby then filter
profiler.clear()
with profiler.step("groupby_then_filter"):
    result2 = ds.groupby('y').sum().filter(ds['x'] > 10).to_df()
summary2 = profiler.summary()
time2 = summary2.get('groupby_then_filter', 0)

print(f"Approach 1: {time1:.2f}ms")
print(f"Approach 2: {time2:.2f}ms")
print(f"Winner: {'Approach 1' if time1 < time2 else 'Approach 2'}")
```

***


## Советы по оптимизации \{#optimization\}

### 1. Проверьте время выполнения SQL \{#check-sql\}

Если узким местом является выполнение SQL-запросов:

- Добавьте дополнительные фильтры, чтобы сократить объём данных
- Используйте Parquet вместо CSV
- Проверьте наличие подходящих индексов (для источников данных в БД)

### 2. Проверьте время операций ввода-вывода \{#check-io\}

Если `read_csv` или `read_parquet` — узкое место:

- Используйте Parquet (столбцовый, сжатый формат)
- Читайте только необходимые столбцы
- Фильтруйте данные на стороне источника, если возможно

### 3. Проверка передачи данных \{#check-transfer\}

Если `to_df` работает медленно:

- Результирующий набор может быть слишком большим
- Добавьте больше фильтров или ограничьте выборку с помощью LIMIT
- Используйте `head()` для предварительного просмотра результатов

### 4. Сравните движки \{#compare-engines\}

```python
from chdb.datastore.config import config

# Profile with chdb
config.use_chdb()
profiler.clear()
result_chdb = query.to_df()
time_chdb = profiler.total_duration_ms

# Profile with pandas
config.use_pandas()
profiler.clear()
result_pandas = query.to_df()
time_pandas = profiler.total_duration_ms

print(f"chdb: {time_chdb:.2f}ms")
print(f"pandas: {time_pandas:.2f}ms")
```

***


## Лучшие практики \{#best-practices\}

### 1. Проводите профилирование перед оптимизацией \{#best-practice-1\}

```python
# Don't guess - measure!
config.enable_profiling()
result = your_query.to_df()
print(get_profiler().report())
```


### 2. Очищайте хранилище между тестами \{#best-practice-2\}

```python
profiler.clear()  # Clear previous data
# Run test
print(profiler.report())
```


### 3. Используйте min_duration_ms для фокусировки профилирования \{#best-practice-3\}

```python
# Only show operations >= 100ms
profiler.report(min_duration_ms=100)
```


### 4. Профилирование представительных данных \{#best-practice-4\}

```python
# Profile with real-world data sizes
# Small test data may not show real bottlenecks
```


### 5. Отключите в продакшене \{#best-practice-5\}

```python
# Development
config.enable_profiling()

# Production
config.set_profiling_enabled(False)  # Avoid overhead
```

***


## Пример: полноценная сессия профилирования \{#example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Setup
config.enable_profiling()
config.enable_debug()  # Also see what's happening
profiler = get_profiler()

# Load data
profiler.clear()
print("=== Loading Data ===")
ds = pd.read_csv("sales_2024.csv")  # 10M rows
print(profiler.report())

# Query 1: Simple filter
profiler.clear()
print("\n=== Query 1: Simple Filter ===")
result1 = ds.filter(ds['amount'] > 1000).to_df()
print(profiler.report())

# Query 2: Complex aggregation
profiler.clear()
print("\n=== Query 2: Complex Aggregation ===")
result2 = (ds
    .filter(ds['amount'] > 100)
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .head(20)
    .to_df()
)
print(profiler.report())

# Summary
print("\n=== Summary ===")
print(f"Query 1: {len(result1)} rows")
print(f"Query 2: {len(result2)} rows")
```
