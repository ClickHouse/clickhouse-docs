---
title: 'Конфигурация движка выполнения'
sidebar_label: 'Движок выполнения'
slug: /chdb/configuration/execution-engine
description: 'Настройка движка выполнения DataStore: auto, chdb или pandas'
keywords: ['chdb', 'datastore', 'execution', 'engine', 'chdb', 'pandas', 'auto']
doc_type: 'guide'
---

# Конфигурация движка выполнения \{#execution-engine-configuration\}

DataStore может выполнять операции с использованием различных бэкэндов. В этом руководстве рассматривается, как настраивать и оптимизировать выбор движка выполнения.

## Доступные движки \{#engines\}

| Engine | Описание | Лучше всего подходит для |
|--------|----------|--------------------------|
| `auto` | Автоматически выбирает оптимальный движок для каждой операции | Общее использование (по умолчанию) |
| `chdb` | Выполняет все операции только через ClickHouse SQL | Крупные наборы данных, агрегации |
| `pandas` | Выполняет все операции только через pandas | Тестирование совместимости, функции, специфичные для pandas |

## Выбор движка \{#setting\}

### Глобальная конфигурация \{#global\}

```python
from chdb.datastore.config import config

# Option 1: Using set method
config.set_execution_engine('auto')    # Default
config.set_execution_engine('chdb')    # Force ClickHouse
config.set_execution_engine('pandas')  # Force pandas

# Option 2: Using shortcuts
config.use_auto()     # Auto-select
config.use_chdb()     # Force ClickHouse
config.use_pandas()   # Force pandas
```


### Проверка текущего движка выполнения \{#checking\}

```python
print(config.execution_engine)  # 'auto', 'chdb', or 'pandas'
```

***


## Автоматический режим \{#auto-mode\}

В режиме `auto` (значение по умолчанию) DataStore выбирает оптимальный движок выполнения для каждой операции:

### Операции, выполняемые в chDB \{#auto-chdb\}

- SQL-совместимая фильтрация данных (`filter()`, `where()`)
- Выбор столбцов (`select()`)
- Сортировка (`sort()`, `orderby()`)
- Группировка и агрегация (`groupby().agg()`)
- Соединения (`join()`, `merge()`)
- Удаление дубликатов (`distinct()`, `drop_duplicates()`)
- Ограничение выборки (`limit()`, `head()`, `tail()`)

### Операции, выполняемые в pandas \{#auto-pandas\}

- Пользовательские функции `apply` (`apply(custom_func)`)
- Сложные сводные таблицы с пользовательскими агрегациями
- Операции, которые нельзя выразить на SQL
- Когда входные данные уже представлены в виде pandas DataFrame

### Пример \{#auto-example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

config.use_auto()  # Default

ds = pd.read_csv("data.csv")

# This uses chDB (SQL)
result = (ds
    .filter(ds['amount'] > 100)   # SQL: WHERE
    .groupby('region')            # SQL: GROUP BY
    .agg({'amount': 'sum'})       # SQL: SUM()
)

# This uses pandas (custom function)
result = ds.apply(lambda row: complex_calculation(row), axis=1)
```

***


## Режим chDB \{#chdb-mode\}

Выполнять все операции только через ClickHouse SQL:

```python
config.use_chdb()
```


### Когда использовать \{#chdb-when\}

- Обработка больших наборов данных (миллионы строк)
- Нагрузки с ресурсоёмкими операциями агрегации
- Когда нужна максимальная оптимизация SQL
- Предсказуемое поведение во всех операциях

### Характеристики производительности \{#chdb-performance\}

| Тип операции | Производительность |
|--------------|--------------------|
| Группировка/агрегация | Отличная (до 20 раз быстрее) |
| Сложная фильтрация | Отличная |
| Сортировка | Очень хорошая |
| Простые одиночные фильтры | Хорошая (незначительные накладные расходы) |

### Ограничения \{#chdb-limitations\}

- Пользовательские функции Python могут не поддерживаться
- Некоторые функции, специфичные для pandas, требуют преобразования

---

## Режим pandas \{#pandas-mode\}

Принудительное выполнение всех операций в pandas:

```python
config.use_pandas()
```


### Когда использовать \{#pandas-when\}

- Тестирование совместимости с pandas
- Использование специфичных для pandas функций
- Отладка проблем, связанных с pandas
- Когда данные уже находятся в формате pandas

### Характеристики производительности \{#pandas-performance\}

| Тип операции | Производительность |
|--------------|--------------------|
| Простые одиночные операции | Хорошая |
| Пользовательские функции | Отличная |
| Сложные агрегации | Медленнее, чем chDB |
| Большие наборы данных | Требовательны к памяти |

---

## Движок Cross-DataStore \{#cross-datastore\}

Настройте движок для операций по объединению столбцов из разных DataStore:

```python
# Set cross-DataStore engine
config.set_cross_datastore_engine('auto')
config.set_cross_datastore_engine('chdb')
config.set_cross_datastore_engine('pandas')
```


### Пример \{#cross-example\}

```python
ds1 = pd.read_csv("sales.csv")
ds2 = pd.read_csv("inventory.csv")

# This operation involves two DataStores
result = ds1.join(ds2, on='product_id')
# Uses cross_datastore_engine setting
```

***


## Логика выбора движка выполнения \{#selection-logic\}

### Дерево принятия решений для автоматического режима \{#decision-tree\}

```text
Operation requested
    │
    ├─ Can be expressed in SQL?
    │      │
    │      ├─ Yes → Use chDB
    │      │
    │      └─ No → Use pandas
    │
    └─ Cross-DataStore operation?
           │
           └─ Use cross_datastore_engine setting
```


### Переопределение на уровне функций \{#function-override\}

Для некоторых функций можно явно задать используемый ими движок выполнения:

```python
from chdb.datastore.config import function_config

# Force specific functions to use specific engine
function_config.use_chdb('length', 'substring')
function_config.use_pandas('upper', 'lower')
```

Дополнительные сведения см. в разделе [Function Config](function-config.md).

***


## Сравнение производительности \{#performance-comparison\}

Результаты бенчмарка на 10 млн строк:

| Operation | pandas (мс) | chDB (мс) | Ускорение |
|-----------|-------------|-----------|-----------|
| GroupBy count | 347 | 17 | 19.93x |
| Combined ops | 1,535 | 234 | 6.56x |
| Complex pipeline | 2,047 | 380 | 5.39x |
| Filter+Sort+Head | 1,537 | 350 | 4.40x |
| GroupBy agg | 406 | 141 | 2.88x |
| Single filter | 276 | 526 | 0.52x |

**Ключевые выводы:**

- chDB отлично справляется с агрегациями и сложными пайплайнами
- pandas немного быстрее для простых одиночных операций
- Используйте режим `auto`, чтобы задействовать сильные стороны обоих вариантов

---

## Лучшие практики \{#best-practices\}

### 1. Сначала используйте автоматический режим \{#start-with-auto-mode\}

```python
config.use_auto()  # Let DataStore decide
```


### 2. Проведите профилирование перед принудительным выбором движка \{#profile-before-forcing\}

```python
config.enable_profiling()
# Run your workload
# Check profiler report to see where time is spent
```


### 3. Принудительно используйте движок для определённых типов нагрузок \{#force-engine-for-specific-workloads\}

```python
# For heavy aggregation workloads
config.use_chdb()

# For pandas compatibility testing
config.use_pandas()
```


### 4. Используйте explain() для анализа выполнения \{#use-explain-to-understand-execution\}

```python
ds = pd.read_csv("data.csv")
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'sum'})

# See what SQL will be generated
query.explain()
```

***


## Устранение неполадок \{#troubleshooting\}

### Проблема: операция выполняется медленнее ожидаемого \{#issue-operation-slower\}

```python
# Check current engine
print(config.execution_engine)

# Enable debug to see what's happening
config.enable_debug()

# Try forcing specific engine
config.use_chdb()  # or config.use_pandas()
```


### Проблема: операция не поддерживается в режиме chdb \{#issue-unsupported-operation\}

```python
# Some pandas operations aren't supported in SQL
# Solution: use auto mode
config.use_auto()

# Or explicitly convert to pandas first
df = ds.to_df()
result = df.some_pandas_specific_operation()
```


### Проблема: нехватка памяти при обработке больших объёмов данных \{#issue-memory-issues\}

```python
# Use chdb engine to avoid loading all data into memory
config.use_chdb()

# Filter early to reduce data size
result = ds.filter(ds['date'] >= '2024-01-01').to_df()
```
