---
title: 'Основные отличия от pandas'
sidebar_label: 'Основные отличия'
slug: /chdb/guides/pandas-differences
description: 'Основные отличия между DataStore и pandas'
keywords: ['chdb', 'datastore', 'pandas', 'differences', 'behavior']
doc_type: 'guide'
---

# Ключевые отличия от pandas \{#key-differences-from-pandas\}

Хотя DataStore в значительной степени совместим с pandas, важно понимать некоторые важные отличия.

## Сводная таблица \{#summary\}

| Аспект | pandas | DataStore |
|--------|--------|-----------|
| **Выполнение** | Раннее (немедленное) | Отложенное (ленивое) |
| **Типы возвращаемых значений** | DataFrame/Series | DataStore/ColumnExpr |
| **Порядок строк** | Сохраняется | Сохраняется (автоматически); не гарантируется в [режиме производительности](../configuration/performance-mode.md) |
| **inplace** | Поддерживается | Не поддерживается |
| **Индекс** | Полная поддержка | Упрощённая |
| **Память** | Все данные в памяти | Данные остаются у источника |

---

## 1. Ленивое vs немедленное выполнение \{#lazy-execution\}

### pandas (жадное выполнение) \{#pandas-eager\}

Операции выполняются немедленно:

```python
import pandas as pd

df = pd.read_csv("data.csv")  # Loads entire file NOW
result = df[df['age'] > 25]   # Filters NOW
grouped = result.groupby('city')['salary'].mean()  # Aggregates NOW
```


### DataStore (ленивый режим) \{#datastore-lazy\}

Операции выполняются только тогда, когда требуются результаты.

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")  # Just records the source
result = ds[ds['age'] > 25]   # Just records the filter
grouped = result.groupby('city')['salary'].mean()  # Just records

# Execution happens here:
print(grouped)        # Executes when displaying
df = grouped.to_df()  # Or when converting to pandas
```


### Почему это важно \{#why-lazy\}

Ленивое выполнение позволяет:

- **Оптимизацию запросов**: несколько операций объединяются в один SQL-запрос
- **Отсечение столбцов**: считываются только необходимые столбцы
- **Проталкивание фильтров**: фильтры применяются на стороне источника данных
- **Более эффективное использование памяти**: данные, которые не нужны, не загружаются

---

## 2. Типы возвращаемых значений \{#return-types\}

### pandas \{#pandas-return-types\}

```python
df['col']           # Returns pd.Series
df[['a', 'b']]      # Returns pd.DataFrame
df[df['x'] > 10]    # Returns pd.DataFrame
df.groupby('x')     # Returns DataFrameGroupBy
```


### Хранилище данных (DataStore) \{#datastore-return-types\}

```python
ds['col']           # Returns ColumnExpr (lazy)
ds[['a', 'b']]      # Returns DataStore (lazy)
ds[ds['x'] > 10]    # Returns DataStore (lazy)
ds.groupby('x')     # Returns LazyGroupBy
```


### Преобразование в типы данных pandas \{#converting-to-pandas-types\}

```python
# Get pandas DataFrame
df = ds.to_df()
df = ds.to_pandas()

# Get pandas Series from column
series = ds['col'].to_pandas()

# Or trigger execution
print(ds)  # Automatically converts for display
```

***


## 3. Триггеры выполнения \{#triggers\}

DataStore выполняет вычисления, когда вам нужны фактические значения:

| Триггер | Пример | Примечания |
|---------|--------|------------|
| `print()` / `repr()` | `print(ds)` | Для отображения нужны данные |
| `len()` | `len(ds)` | Нужно количество строк |
| `.columns` | `ds.columns` | Нужны имена столбцов |
| `.dtypes` | `ds.dtypes` | Нужна информация о типах |
| `.shape` | `ds.shape` | Нужны размеры |
| `.values` | `ds.values` | Нужны фактические данные |
| `.index` | `ds.index` | Нужен индекс |
| `to_df()` | `ds.to_df()` | Явное преобразование |
| Итерация | `for row in ds` | Нужно итерироваться |
| `equals()` | `ds.equals(other)` | Нужно сравнение |

### Операции, выполняемые лениво \{#stay-lazy\}

| Операция | Возвращает |
|-----------|---------|
| `filter()` | DataStore |
| `select()` | DataStore |
| `sort()` | DataStore |
| `groupby()` | LazyGroupBy |
| `join()` | DataStore |
| `ds['col']` | ColumnExpr |
| `ds[['a', 'b']]` | DataStore |
| `ds[condition]` | DataStore |

---

## 4. Порядок строк \{#row-order\}

### pandas \{#pandas-row-order\}

Порядок строк всегда сохраняется:

```python
df = pd.read_csv("data.csv")
print(df.head())  # Always same order as file
```


### DataStore \{#datastore-row-order\}

Порядок строк **автоматически сохраняется** при большинстве операций:

```python
ds = pd.read_csv("data.csv")
print(ds.head())  # Matches file order

# Filter preserves order
ds_filtered = ds[ds['age'] > 25]  # Same order as pandas
```

DataStore автоматически отслеживает исходные позиции строк во внутреннем представлении (используя `rowNumberInAllBlocks()`), чтобы порядок соответствовал порядку в pandas.


### Когда порядок сохраняется \{#order-preserved\}

- Источники из файлов (CSV, Parquet, JSON и т. д.)
- Источники pandas DataFrame
- Операции фильтрации
- Выбор столбцов
- После явного вызова `sort()` или `sort_values()`
- Операции, задающие порядок (`nlargest()`, `nsmallest()`, `head()`, `tail()`)

### Когда порядок может отличаться \{#order-may-differ\}

- После агрегаций с `groupby()` (используйте `sort_values()` для обеспечения детерминированного порядка)
- После `merge()` / `join()` с определёнными типами соединений
- В **режиме производительности** (`config.use_performance_mode()`): порядок строк не гарантируется ни для каких операций. См. [Режим производительности](../configuration/performance-mode.md).

---

## 5. Отсутствие параметра inplace \{#no-inplace\}

### pandas \{#pandas-inplace\}

```python
df.drop(columns=['col'], inplace=True)  # Modifies df
df.fillna(0, inplace=True)              # Modifies df
df.rename(columns={'old': 'new'}, inplace=True)
```


### DataStore \{#datastore-inplace\}

`inplace=True` не поддерживается. Всегда присваивайте результат:

```python
ds = ds.drop(columns=['col'])           # Returns new DataStore
ds = ds.fillna(0)                       # Returns new DataStore
ds = ds.rename(columns={'old': 'new'})  # Returns new DataStore
```


### Почему нет inplace? \{#why-no-inplace\}

DataStore использует неизменяемые операции для:

- построения запросов (ленивое вычисление)
- потокобезопасности
- более простой отладки
- более чистого кода

---

## 6. Поддержка индексов \{#index\}

### pandas \{#pandas-index\}

Полная поддержка индексов:

```python
df = df.set_index('id')
df.loc['user123']           # Label-based access
df.loc['a':'z']             # Label-based slicing
df.reset_index()
df.index.name = 'user_id'
```


### DataStore \{#datastore-index\}

Упрощённая поддержка индексов:

```python
# Basic operations work
ds.loc[0:10]               # Integer position
ds.iloc[0:10]              # Same as loc for DataStore

# For pandas-style index operations, convert first
df = ds.to_df()
df = df.set_index('id')
df.loc['user123']
```


### Важно, какой источник DataStore используется \{#datastore-source-matters\}

- **Источник DataFrame**: сохраняет индекс pandas
- **Файловый источник**: использует простой целочисленный индекс

---

## 7. Поведение при сравнении \{#comparison\}

### Сравнение с pandas \{#comparing-with-pandas\}

pandas не распознаёт объекты типа DataStore:

```python
import pandas as pd
from chdb import datastore as ds

pdf = pd.DataFrame({'a': [1, 2, 3]})
dsf = ds.DataFrame({'a': [1, 2, 3]})

# This doesn't work as expected
pdf == dsf  # pandas doesn't know DataStore

# Solution: convert DataStore to pandas
pdf.equals(dsf.to_pandas())  # True
```


### Использование метода equals() \{#using-equals\}

```python
# DataStore.equals() also works
dsf.equals(pdf)  # Compares with pandas DataFrame
```

***


## 8. Вывод типов \{#types\}

### pandas \{#pandas-types\}

Используются типы numpy/pandas:

```python
df['col'].dtype  # int64, float64, object, datetime64, etc.
```


### DataStore \{#datastore-types\}

Может использовать типы данных ClickHouse:

```python
ds['col'].dtype  # Int64, Float64, String, DateTime, etc.

# Types are converted when going to pandas
df = ds.to_df()
df['col'].dtype  # Now pandas type
```


### Явное приведение типов \{#explicit-casting\}

```python
# Force specific type
ds['col'] = ds['col'].astype('int64')
```

***


## 9. Модель памяти \{#memory\}

### pandas \{#pandas-memory\}

Все данные хранятся в памяти:

```python
df = pd.read_csv("huge.csv")  # 10GB in memory!
```


### DataStore \{#datastore-memory\}

Данные остаются в исходном источнике до тех пор, пока не понадобятся:

```python
ds = pd.read_csv("huge.csv")  # Just metadata
ds = ds.filter(ds['year'] == 2024)  # Still just metadata

# Only filtered result is loaded
df = ds.to_df()  # Maybe only 1GB now
```

***


## 10. Сообщения об ошибках \{#errors\}

### Различные источники ошибок \{#different-error-sources\}

* **ошибки pandas**: из библиотеки pandas
* **ошибки DataStore**: из chDB или ClickHouse

```python
# May see ClickHouse-style errors
# "Code: 62. DB::Exception: Syntax error..."
```


### Рекомендации по отладке \{#debugging-tips\}

```python
# View the SQL to debug
print(ds.to_sql())

# See execution plan
ds.explain()

# Enable debug logging
from chdb.datastore.config import config
config.enable_debug()
```

***


## Контрольный список миграции \{#checklist\}

При миграции с pandas:

- [ ] Измените инструкцию `import`
- [ ] Удалите параметры `inplace=True`
- [ ] Добавьте явный вызов `to_df()`, когда требуется pandas DataFrame
- [ ] Добавьте сортировку, если важен порядок строк
- [ ] Используйте `to_pandas()` для сравнительных тестов
- [ ] Тестируйте на репрезентативных объёмах данных

---

## Краткая справка \{#quick-ref\}

| pandas | DataStore |
|--------|-----------|
| `df[condition]` | Аналогично (возвращает DataStore) |
| `df.groupby()` | Аналогично (возвращает LazyGroupBy) |
| `df.drop(inplace=True)` | `ds = ds.drop()` |
| `df.equals(other)` | `ds.to_pandas().equals(other)` |
| `df.loc['label']` | `ds.to_df().loc['label']` |
| `print(df)` | Аналогично (запускает выполнение) |
| `len(df)` | Аналогично (запускает выполнение) |