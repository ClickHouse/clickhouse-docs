---
title: 'Режим производительности (compat_mode)'
sidebar_label: 'Режим производительности'
slug: /chdb/configuration/performance-mode
description: 'Режим производительности с приоритетом SQL, который отключает накладные расходы совместимости с pandas для максимальной пропускной способности'
keywords: ['chdb', 'datastore', 'performance', 'mode', 'compat', 'sql-first', 'optimization']
doc_type: 'guide'
---

# Режим производительности \{#performance-mode\}

В DataStore есть два режима совместимости, которые определяют, будет ли вывод формироваться для совместимости с pandas или оптимизироваться для производительности при выполнении «сырого» SQL.

## Обзор \{#overview\}

| Режим | Значение `compat_mode` | Описание |
|-------|------------------------|----------|
| **Pandas** (по умолчанию) | `"pandas"` | Полная совместимость с поведением pandas. Порядок строк сохраняется, поддерживаются MultiIndex, set_index, исправления dtype, устойчивые правила сортировки при равных значениях, обертки `-If`/`isNaN`. |
| **Performance** | `"performance"` | Выполнение в режиме SQL-first. Все накладные расходы, связанные с совместимостью с pandas, убраны. Максимальная пропускная способность, но структура результатов может отличаться от pandas. |

### Что отключает режим Performance \{#what-it-disables\}

| Накладные расходы | Поведение в режиме Pandas | Поведение в режиме Performance |
|-------------------|---------------------------|---------------------------------|
| **Сохранение порядка строк** | Вставка `_row_id`, `rowNumberInAllBlocks()`, подзапросы `__orig_row_num__` | Отключено — порядок строк не гарантируется |
| **Стабильное разрешение совпадений при сортировке** | `rowNumberInAllBlocks() ASC` добавляется к ORDER BY | Отключено — элементы с равными значениями могут иметь произвольный порядок |
| **Parquet preserve_order** | `input_format_parquet_preserve_order=1` | Отключено — разрешено параллельное чтение Parquet |
| **Авто ORDER BY для GroupBy** | Добавляется `ORDER BY group_key` (pandas по умолчанию `sort=True`) | Отключено — группы возвращаются в произвольном порядке |
| **GroupBy dropna WHERE** | Добавляется `WHERE key IS NOT NULL` (pandas по умолчанию `dropna=True`) | Отключено — группы с NULL включены |
| **GroupBy set_index** | Ключи групп устанавливаются как индекс | Отключено — ключи групп остаются столбцами |
| **Столбцы MultiIndex** | `agg({'col': ['sum','mean']})` возвращает столбцы MultiIndex | Отключено — плоские имена столбцов (`col_sum`, `col_mean`) |
| **Обёртки `-If`/`isNaN`** | `sumIf(col, NOT isNaN(col))` для skipna | Отключено — обычный `sum(col)` (ClickHouse изначально пропускает NULL) |
| **`toInt64` для count** | `toInt64(count())` для соответствия pandas int64 | Отключено — возвращается нативный SQL dtype |
| **`fillna(0)` для суммы из одних NaN** | Сумма из одних NaN возвращает 0 (поведение pandas) | Отключено — возвращает NULL |
| **Коррекция dtypes** | `abs()` беззнаковый→знаковый и т.п. | Отключено — нативные SQL dtypes |
| **Сохранение индекса** | Восстанавливает исходный индекс после выполнения SQL | Отключено |
| **`first()`/`last()`** | `argMin/argMax(col, rowNumberInAllBlocks())` | `any(col)` / `anyLast(col)` — быстрее, но недетерминированно |
| **Агрегация в одном SQL** | groupby в ColumnExpr материализует промежуточный DataFrame | Вставляет `LazyGroupByAgg` в цепочку ленивых операций — один SQL-запрос |

---

## Включение режима повышенной производительности \{#enabling\}

### Использование объекта конфигурации \{#using-config\}

```python
from chdb.datastore.config import config

# Enable performance mode
config.use_performance_mode()

# Back to pandas compatibility
config.use_pandas_compat()

# Check current mode
print(config.compat_mode)  # 'pandas' or 'performance'
```


### Использование функций на уровне модуля \{#using-functions\}

```python
from chdb.datastore.config import set_compat_mode, CompatMode, is_performance_mode

# Enable performance mode
set_compat_mode(CompatMode.PERFORMANCE)

# Check
print(is_performance_mode())  # True

# Back to default
set_compat_mode(CompatMode.PANDAS)
```


### Использование упрощённых импортов \{#using-imports\}

```python
from chdb import use_performance_mode, use_pandas_compat

use_performance_mode()
# ... high-performance operations ...
use_pandas_compat()
```

:::note
Включение режима повышенной производительности автоматически выбирает в качестве движка выполнения `chdb`. Вам не нужно отдельно вызывать `config.use_chdb()`.
:::

***


## Когда использовать режим производительности \{#when-to-use\}

**Используйте режим производительности, когда:**

- Обрабатываете большие наборы данных (от сотен тысяч до миллионов строк)
- Запускаете нагрузки с интенсивной агрегацией (groupby, sum, mean, count)
- Порядок строк не имеет значения (например, агрегированные результаты, отчёты, дашборды)
- Вам нужна максимальная пропускная способность SQL и минимальные накладные расходы
- Важно потребление памяти (параллельное чтение Parquet, без промежуточных DataFrame)

**Оставайтесь в режиме pandas, когда:**

- Вам нужно точное поведение pandas (порядок строк, MultiIndex, dtypes)
- Вы полагаетесь на то, что `first()`/`last()` возвращают действительно первую/последнюю строку
- Вы используете `shift()`, `diff()`, `cumsum()`, которые зависят от порядка строк
- Вы пишете тесты, сравнивающие вывод DataStore с pandas

---

## Особенности поведения \{#behavior-differences\}

### Порядок строк \{#row-order\}

В режиме повышенной производительности порядок строк **не гарантируется** ни для одной операции. Это касается:

* результатов фильтрации
* результатов агрегирования GroupBy
* `head()` / `tail()` без явного `sort_values()`
* агрегирующих функций `first()` / `last()`

Если вам нужны упорядоченные результаты, добавьте явный `sort_values()`:

```python
config.use_performance_mode()

ds = pd.read_csv("data.csv")

# Unordered (fast)
result = ds.groupby("region")["revenue"].sum()

# Ordered (still fast, just adds ORDER BY)
result = ds.groupby("region")["revenue"].sum().sort_values()
```


### Результаты GroupBy \{#groupby-results\}

| Аспект | Режим Pandas | Режим производительности |
|--------|------------|-----------------|
| Расположение ключа группировки | Индекс (через `set_index`) | Обычный столбец |
| Порядок групп | Отсортировано по ключу (по умолчанию) | Произвольный порядок |
| Группы с NULL | Исключены (по умолчанию `dropna=True`) | Включены |
| Формат столбцов | MultiIndex при множественной агрегации | Плоские имена (`col_func`) |
| `first()`/`last()` | Детерминированно (по порядку строк) | Нердетерминированно (`any()`/`anyLast()`) |

### Агрегация \{#aggregation\}

```python
config.use_performance_mode()

# Sum of all-NaN group returns NULL (not 0)
# Count returns native uint64 (not forced int64)
# No -If wrappers: sum() instead of sumIf()
result = ds.groupby("cat")["val"].sum()
```


### Выполнение одним SQL-запросом \{#single-sql\}

В режиме производительности агрегация groupby `ColumnExpr` (например, `ds[condition].groupby('col')['val'].sum()`) выполняется как **один SQL запрос**, вместо двухэтапного процесса, используемого в режиме pandas:

```python
config.use_performance_mode()

# Pandas mode: two SQL queries (filter → materialize → groupby)
# Performance mode: one SQL query (WHERE + GROUP BY in same query)
result = ds[ds["rating"] > 3.5].groupby("category")["revenue"].sum()

# Generated SQL (single query):
# SELECT category, sum(revenue) FROM data WHERE rating > 3.5 GROUP BY category
```

Это устраняет необходимость в промежуточной материализации DataFrame и может существенно сократить потребление памяти и время выполнения.

***


## Сравнение с Execution Engine \{#vs-execution-engine\}

Режим производительности (`compat_mode`) и execution engine (`execution_engine`) — это **независимые параметры конфигурации**:

| Config             | Controls                                                          | Values                   |
| ------------------ | ----------------------------------------------------------------- | ------------------------ |
| `execution_engine` | **Какой движок** выполняет вычисления                             | `auto`, `chdb`, `pandas` |
| `compat_mode`      | **Нужно ли** преобразовывать результат для совместимости с pandas | `pandas`, `performance`  |

Установка `compat_mode='performance'` автоматически задаёт `execution_engine='chdb'`, так как режим производительности предназначен для выполнения SQL.

```python
from chdb.datastore.config import config

# These are independent
config.use_chdb()              # Force chDB engine, keep pandas compat
config.use_performance_mode()  # Force chDB + remove pandas overhead
```

***


## Тестирование в режиме повышенной производительности \{#testing\}

При написании тестов для режима повышенной производительности результаты могут отличаться от pandas по порядку строк и структуре. Используйте следующие стратегии:

### Сначала сортировать, затем сравнивать (агрегации, фильтры) \{#sort-then-compare\}

```python
# Sort both sides by the same columns before comparing
ds_result = ds.groupby("cat")["val"].sum()
pd_result = pd_df.groupby("cat")["val"].sum()

ds_sorted = ds_result.sort_index()
pd_sorted = pd_result.sort_index()
np.testing.assert_array_equal(ds_sorted.values, pd_sorted.values)
```


### Проверка диапазона значений (первое/последнее значение) \{#value-range-check\}

```python
# first() with any() returns an arbitrary element from the group
result = ds.groupby("cat")["val"].first()
for group_key in groups:
    assert result.loc[group_key] in group_values[group_key]
```


### Схема и подсчёт строк (LIMIT без ORDER BY) \{#schema-and-count\}

```python
# head() without sort_values: row set is non-deterministic
result = ds.head(5)
assert len(result) == 5
assert set(result.columns) == expected_columns
```

***


## Лучшие практики \{#best-practices\}

### 1. Включайте его в начале скрипта \{#enable-early\}

```python
from chdb.datastore.config import config

config.use_performance_mode()

# All subsequent operations benefit
ds = pd.read_parquet("data.parquet")
result = ds[ds["amount"] > 100].groupby("region")["amount"].sum()
```


### 2. Добавляйте явную сортировку, когда важен порядок \{#explicit-sort\}

```python
# For display or downstream processing that expects order
result = (ds
    .groupby("region")["revenue"].sum()
    .sort_values(ascending=False)
)
```


### 3. Используйте для пакетных ETL‑нагрузок \{#batch-etl\}

```python
config.use_performance_mode()

# ETL pipeline — order doesn't matter, throughput does
summary = (ds
    .filter(ds["date"] >= "2024-01-01")
    .groupby(["region", "product"])
    .agg({"revenue": "sum", "quantity": "sum", "rating": "mean"})
)
summary.to_df().to_parquet("summary.parquet")
```


### 4. Переключение режимов в пределах одной сессии \{#switch-modes\}

```python
# Performance mode for heavy computation
config.use_performance_mode()
aggregated = ds.groupby("cat")["val"].sum()

# Back to pandas mode for exact-match comparison
config.use_pandas_compat()
detailed = ds[ds["val"] > 100].head(10)
```

***


## Связанная документация \{#related\}

- [Execution Engine](execution-engine.md) — выбор движка выполнения (auto/chdb/pandas)
- [Performance Guide](../guides/pandas-performance.md) — руководство по оптимизации производительности
- [Key Differences from pandas](../guides/pandas-differences.md) — ключевые поведенческие отличия