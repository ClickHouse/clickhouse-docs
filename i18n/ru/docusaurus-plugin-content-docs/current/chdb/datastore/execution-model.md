---
title: 'Модель выполнения DataStore'
sidebar_label: 'Модель выполнения'
slug: /chdb/datastore/execution-model
description: 'Разбор отложенных вычислений, механизмов запуска выполнения и кэширования в DataStore'
keywords: ['chdb', 'datastore', 'lazy', 'evaluation', 'execution', 'caching']
doc_type: 'guide'
---

# Модель выполнения DataStore \{#datastore-execution-model\}

Понимание модели ленивых вычислений DataStore — ключ к его эффективному использованию и достижению оптимальной производительности.

## Отложенное вычисление \{#lazy-evaluation\}

DataStore использует **отложенное вычисление** — операции не выполняются сразу, а записываются и компилируются в оптимизированные SQL-запросы. Выполнение происходит только тогда, когда результаты действительно нужны.

### Пример: ленивые и жадные вычисления \{#lazy-vs-eager\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# These operations are NOT executed yet
result = (ds
    .filter(ds['amount'] > 1000)    # Recorded, not executed
    .select('region', 'amount')      # Recorded, not executed
    .groupby('region')               # Recorded, not executed
    .agg({'amount': 'sum'})          # Recorded, not executed
    .sort('sum', ascending=False)    # Recorded, not executed
)

# Still no execution - just building the query plan
print(result.to_sql())
# SELECT region, SUM(amount) AS sum
# FROM file('sales.csv', 'CSVWithNames')
# WHERE amount > 1000
# GROUP BY region
# ORDER BY sum DESC

# NOW execution happens
df = result.to_df()  # <-- Triggers execution
```


### Преимущества ленивых вычислений \{#benefits\}

1. **Оптимизация запросов**: Несколько операций компилируются в один оптимизированный SQL‑запрос
2. **Проталкивание фильтров**: Фильтры применяются на уровне источника данных
3. **Отсечение столбцов**: Считываются только необходимые столбцы
4. **Отложенный выбор**: Движок выполнения можно выбрать во время выполнения
5. **Анализ плана**: Вы можете просмотреть и отладить запрос перед выполнением

---

## Триггеры выполнения \{#triggers\}

Выполнение автоматически запускается, когда требуются фактические значения:

### Автоматические триггеры \{#automatic-triggers\}

| Триггер              | Пример             | Описание                   |
| -------------------- | ------------------ | -------------------------- |
| `print()` / `repr()` | `print(ds)`        | Отобразить результаты      |
| `len()`              | `len(ds)`          | Получить количество строк  |
| `.columns`           | `ds.columns`       | Получить имена столбцов    |
| `.dtypes`            | `ds.dtypes`        | Получить типы столбцов     |
| `.shape`             | `ds.shape`         | Получить размеры           |
| `.index`             | `ds.index`         | Получить индекс строк      |
| `.values`            | `ds.values`        | Получить массив NumPy      |
| Iteration            | `for row in ds`    | Перебор строк              |
| `to_df()`            | `ds.to_df()`       | Преобразовать в pandas     |
| `to_pandas()`        | `ds.to_pandas()`   | Синоним to&#95;df          |
| `to_dict()`          | `ds.to_dict()`     | Преобразовать в dict       |
| `to_numpy()`         | `ds.to_numpy()`    | Преобразовать в массив     |
| `.equals()`          | `ds.equals(other)` | Сравнить объекты DataStore |

**Примеры:**

```python
# All these trigger execution
print(ds)              # Display
len(ds)                # 1000
ds.columns             # Index(['name', 'age', 'city'])
ds.shape               # (1000, 3)
list(ds)               # List of values
ds.to_df()             # pandas DataFrame
```


### Операции, которые выполняются лениво \{#stay-lazy\}

| Operation              | Returns     | Description                 |
| ---------------------- | ----------- | --------------------------- |
| `filter()`             | DataStore   | Добавляет предложение WHERE |
| `select()`             | DataStore   | Добавляет выбор столбцов    |
| `sort()`               | DataStore   | Добавляет ORDER BY          |
| `groupby()`            | LazyGroupBy | Подготавливает GROUP BY     |
| `join()`               | DataStore   | Добавляет JOIN              |
| `ds['col']`            | ColumnExpr  | Ссылка на столбец           |
| `ds[['col1', 'col2']]` | DataStore   | Выбор столбцов              |

**Примеры:**

```python
# These do NOT trigger execution - they stay lazy
result = ds.filter(ds['age'] > 25)      # Returns DataStore
result = ds.select('name', 'age')        # Returns DataStore
result = ds['name']                      # Returns ColumnExpr
result = ds.groupby('city')              # Returns LazyGroupBy
```

***


## Трёхфазное выполнение \{#three-phase\}

Операции DataStore используют трёхфазную модель выполнения:

### Этап 1: построение SQL-запроса (отложенное) \{#phase-1\}

Операции, которые можно выразить в SQL, накапливаются:

```python
result = (ds
    .filter(ds['status'] == 'active')   # WHERE
    .select('user_id', 'amount')         # SELECT
    .groupby('user_id')                  # GROUP BY
    .agg({'amount': 'sum'})              # SUM()
    .sort('sum', ascending=False)        # ORDER BY
    .limit(10)                           # LIMIT
)
# All compiled into one SQL query
```


### Фаза 2: Точка выполнения \{#phase-2\}

Когда срабатывает триггер, накопленный SQL-запрос выполняется:

```python
# Execution triggered here
df = result.to_df()  
# The single optimized SQL query runs now
```


### Фаза 3: операции с DataFrame (если есть) \{#phase-3\}

Если после выполнения вы добавляете цепочку операций, выполняемых исключительно средствами pandas:

```python
# Mixed operations
result = (ds
    .filter(ds['amount'] > 100)          # Phase 1: SQL
    .to_df()                             # Phase 2: Execute
    .pivot_table(...)                    # Phase 3: pandas
)
```

***


## Просмотр планов выполнения \{#explain\}

Используйте `explain()`, чтобы увидеть, что именно будет выполнено:

```python
ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View execution plan
query.explain()
```

Вывод:

```text
Pipeline:
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000
  3. GroupBy: region
  4. Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

Используйте `verbose=True`, чтобы получить более подробные сведения:

```python
query.explain(verbose=True)
```

Полную документацию см. в разделе [Отладка: explain()](../debugging/explain.md).

***


## Кеширование \{#caching\}

DataStore кеширует результаты выполнения, чтобы избежать повторных запросов.

### Как устроено кэширование \{#how-caching\}

```python
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25)

# First access - executes query
print(result.shape)  # Executes and caches

# Second access - uses cache
print(result.columns)  # Uses cached result

# Third access - uses cache
df = result.to_df()  # Uses cached result
```


### Инвалидация кэша \{#cache-invalidation\}

Кэш становится недействительным, когда операции модифицируют DataStore:

```python
result = ds.filter(ds['age'] > 25)
print(result.shape)  # Executes, caches

# New operation invalidates cache
result2 = result.filter(result['city'] == 'NYC')
print(result2.shape)  # Re-executes (different query)
```


### Ручное управление кэшем \{#cache-control\}

```python
# Clear cache
ds.clear_cache()

# Disable caching
from chdb.datastore.config import config
config.set_cache_enabled(False)
```

***


## Смешивание операций SQL и Pandas \{#mixing\}

DataStore интеллектуально обрабатывает операции, сочетающие SQL и Pandas:

### Операции, совместимые с SQL \{#sql-ops\}

Эти операции транслируются в SQL:

- `filter()`, `where()`
- `select()`
- `groupby()`, `agg()`
- `sort()`, `orderby()`
- `limit()`, `offset()`
- `join()`, `union()`
- `distinct()`
- Операции над столбцами (арифметика, сравнение, строковые методы)

### Операции только в pandas \{#pandas-ops\}

Эти операции запускают выполнение и используют pandas:

- `apply()` с пользовательскими функциями
- `pivot_table()` со сложными агрегациями
- `stack()`, `unstack()`
- Операции с выполненными объектами DataFrame

### Гибридные конвейеры \{#hybrid\}

```python
# SQL phase
result = (ds
    .filter(ds['amount'] > 100)      # SQL
    .groupby('category')              # SQL
    .agg({'amount': 'sum'})           # SQL
)

# Execution + pandas phase
result = (result
    .to_df()                          # Execute SQL
    .pivot_table(...)                 # pandas operation
)
```

***


## Выбор движка выполнения \{#engine-selection\}

DataStore может выполнять операции с использованием различных движков:

### Автоматический режим (по умолчанию) \{#auto-mode\}

```python
from chdb.datastore.config import config

config.set_execution_engine('auto')  # Default
# Automatically selects best engine per operation
```


### Принудительный выбор движка chDB \{#chdb-engine\}

```python
config.set_execution_engine('chdb')
# All operations use ClickHouse SQL
```


### Принудительное использование движка Pandas \{#pandas-engine\}

```python
config.set_execution_engine('pandas')
# All operations use pandas
```

Подробности см. в разделе [Configuration: Execution Engine](../configuration/execution-engine.md).

***


## Влияние на производительность \{#performance\}

### Хорошо: ранняя фильтрация \{#filter-early\}

```python
# Good: Filter in SQL, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduces data early
    .groupby('category')
    .agg({'amount': 'sum'})
)
```


### Плохо: фильтровать поздно \{#filter-late\}

```python
# Bad: Aggregate all, then filter
result = (ds
    .groupby('category')
    .agg({'amount': 'sum'})
    .to_df()
    .query('sum > 1000')  # Pandas filter after aggregation
)
```


### Хорошо: выбирайте столбцы как можно раньше \{#select-early\}

```python
# Good: Select columns in SQL
result = (ds
    .select('user_id', 'amount', 'date')
    .filter(ds['date'] >= '2024-01-01')
    .groupby('user_id')
    .agg({'amount': 'sum'})
)
```


### Лучше так: пусть за вас работает SQL \{#sql-work\}

```python
# Good: Complex aggregation in SQL
result = (ds
    .groupby('category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .limit(10)
)
# One SQL query does everything

# Bad: Multiple separate queries
sums = ds.groupby('category')['amount'].sum().to_df()
means = ds.groupby('category')['amount'].mean().to_df()
# Two queries instead of one
```

***


## Краткое изложение передовых практик \{#best-practices\}

1. **Связывайте операции перед выполнением** - Сформируйте полный запрос, затем выполните его один раз
2. **Фильтруйте как можно раньше** - Уменьшайте объем данных на стороне источника
3. **Выбирайте только нужные столбцы** - Исключение лишних столбцов улучшает производительность
4. **Используйте `explain()` для понимания выполнения** - Отлаживайте перед запуском
5. **Позвольте SQL обрабатывать агрегации** - ClickHouse оптимизирован для этого
6. **Понимайте, что именно запускает выполнение** - Избегайте случайного раннего выполнения
7. **Разумно используйте кэширование** - Понимайте, когда кэш инвалидируется