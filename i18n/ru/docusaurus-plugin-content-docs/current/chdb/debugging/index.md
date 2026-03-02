---
title: 'Отладка DataStore'
sidebar_label: 'Обзор'
slug: /chdb/debugging
description: 'Отладка операций DataStore с помощью explain(), профилирования и логирования'
keywords: ['chdb', 'datastore', 'debug', 'explain', 'profiling', 'logging']
doc_type: 'guide'
---

# Отладка DataStore \{#datastore-debugging\}

DataStore предоставляет комплексные инструменты отладки для анализа и оптимизации ваших конвейеров данных.

## Обзор инструментов отладки \{#overview\}

| Инструмент | Назначение | Когда использовать |
|------------|------------|--------------------|
| `explain()` | Просмотр плана выполнения | Понять, какой SQL‑запрос будет выполнен |
| Profiler | Измерение производительности | Найти медленные операции |
| Logging | Просмотр деталей выполнения | Отладка неожиданного поведения |

## Быстрая матрица решений \{#decision-matrix\}

| Задача | Инструмент | Команда |
|------|------|---------|
| Посмотреть план выполнения | `explain()` | `ds.explain()` |
| Измерить производительность | Profiler | `config.enable_profiling()` |
| Отладить SQL‑запросы | Logging | `config.enable_debug()` |
| Всё вышеперечисленное | Комбинированный подход | См. ниже |

## Быстрый запуск \{#quick-setup\}

### Включить полную отладку \{#enable-all\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable all debugging
config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})

# View execution plan
result.explain()

# Get profiler report
from chdb.datastore.config import get_profiler
profiler = get_profiler()
profiler.report()
```

***


## Метод explain() \{#explain\}

Просмотрите план выполнения перед запуском запроса.

```python
ds = pd.read_csv("data.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View plan
query.explain()
```

Вывод:

```text
Pipeline:
  Source: file('data.csv', 'CSVWithNames')
  Filter: amount > 1000
  GroupBy: region
  Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

Подробности см. в [документации по explain()](explain.md).

***


## Профилирование \{#profiling\}

Измеряйте время выполнения каждой операции.

```python
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run operations
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
profiler.report(min_duration_ms=0.1)
```

Вывод:

```text
Performance Report
==================
Step                          Duration    Calls
----                          --------    -----
read_csv                      1.234s      1
filter                        0.002s      1
groupby                       0.001s      1
agg                           0.089s      1
sort                          0.045s      1
head                          0.001s      1
to_df (SQL execution)         0.567s      1
----                          --------    -----
Total                         1.939s      7
```

См. [руководство по профилированию](profiling.md) для получения подробной информации.

***


## Логирование \{#logging\}

Просматривайте подробные логи выполнения.

```python
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Run operations - logs will show:
# - SQL queries generated
# - Execution engine used
# - Cache hits/misses
# - Timing information
```

Пример вывода логов:

```text
DEBUG - DataStore: Creating from file 'data.csv'
DEBUG - Query: SELECT region, SUM(amount) FROM ... WHERE amount > 1000 GROUP BY region
DEBUG - Engine: Using chdb for aggregation
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```

Подробности см. в разделе [Logging Configuration](logging.md).

***


## Типичные сценарии отладки \{#scenarios\}

### 1. Запрос не возвращает ожидаемые результаты \{#scenario-wrong-results\}

```python
# Step 1: View the execution plan
query = ds.filter(ds['age'] > 25).groupby('city').sum()
query.explain(verbose=True)

# Step 2: Enable logging to see SQL
config.enable_debug()

# Step 3: Run and check logs
result = query.to_df()
```


### 2. Медленное выполнение запроса \{#scenario-slow\}

```python
# Step 1: Enable profiling
config.enable_profiling()

# Step 2: Run your query
result = process_data()

# Step 3: Check profiler report
profiler = get_profiler()
profiler.report()

# Step 4: Identify slow operations and optimize
```


### 3. Принципы выбора движка \{#scenario-engine\}

```python
# Enable verbose logging
config.enable_debug()

# Run operations
result = ds.filter(ds['x'] > 10).apply(custom_func)

# Logs will show which engine was used for each operation:
# DEBUG - filter: Using chdb engine
# DEBUG - apply: Using pandas engine (custom function)
```


### 4. Отладка проблем с кэшем \{#scenario-cache\}

```python
# Enable debug to see cache operations
config.enable_debug()

# First run
result1 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache miss, executing query

# Second run (should use cache)
result2 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache hit, returning cached result

# If not caching when expected, check:
# - Are operations identical?
# - Is cache enabled? config.cache_enabled
```

***


## Лучшие практики \{#best-practices\}

### 1. Отлаживайте в среде разработки, а не в продакшене \{#best-practice-1\}

```python
# Development
config.enable_debug()
config.enable_profiling()

# Production
config.set_log_level(logging.WARNING)
config.set_profiling_enabled(False)
```


### 2. Перед выполнением крупных запросов используйте explain() \{#best-practice-2\}

```python
# Build query
query = ds.filter(...).groupby(...).agg(...)

# Check plan first
query.explain()

# If plan looks good, execute
result = query.to_df()
```


### 3. Сначала профилируйте, потом оптимизируйте \{#best-practice-3\}

```python
# Don't guess what's slow - measure it
config.enable_profiling()
result = your_pipeline()
get_profiler().report()
```


### 4. Проверьте SQL‑запрос, если результаты неверны \{#best-practice-4\}

```python
# View generated SQL
print(query.to_sql())

# Compare with expected SQL
# Run SQL directly in ClickHouse to verify
```

***


## Сводка инструментов отладки \{#summary\}

| Инструмент | Команда | Результат |
|------|---------|--------|
| План выполнения | `ds.explain()` | Шаги выполнения + SQL |
| Подробный план выполнения | `ds.explain(verbose=True)` | + Метаданные |
| Просмотр SQL | `ds.to_sql()` | Строка SQL-запроса |
| Включить отладку | `config.enable_debug()` | Детализированные логи |
| Включить профилирование | `config.enable_profiling()` | Данные о времени выполнения |
| Отчет профилировщика | `get_profiler().report()` | Сводка по производительности |
| Очистить профилировщик | `get_profiler().reset()` | Очистка данных о времени выполнения |

---

## Дальнейшие шаги \{#next-steps\}

- [Метод explain()](explain.md) - Подробное описание плана выполнения
- [Руководство по профилированию](profiling.md) - Измерение производительности
- [Конфигурация логирования](logging.md) - Настройка уровней и формата логирования