---
title: 'Справочник по классу DataStore'
sidebar_label: 'Справочник по классам'
slug: /chdb/datastore/class-reference
description: 'Полная справочная информация по API для классов DataStore, ColumnExpr, LazyGroupBy и LazySeries'
keywords: ['chdb', 'datastore', 'class', 'reference', 'api', 'columnexpr', 'lazygroupby']
doc_type: 'reference'
---

# Справочник по классу DataStore \{#datastore-class-reference\}

В этом справочнике описаны основные классы API DataStore.

## DataStore \{#datastore\}

Основной класс, аналогичный DataFrame, для работы с данными.

```python
from chdb.datastore import DataStore
```


### Конструктор \{#datastore-constructor\}

```python
DataStore(data=None, columns=None, index=None, dtype=None, copy=None)
```

**Параметры:**

| Параметр  | Тип                           | Описание             |
| --------- | ----------------------------- | -------------------- |
| `data`    | dict/list/DataFrame/DataStore | Входные данные       |
| `columns` | list                          | Имена столбцов       |
| `index`   | Index                         | Индекс строки        |
| `dtype`   | dict                          | Типы данных столбцов |
| `copy`    | bool                          | Копировать данные    |

**Примеры:**

```python
# From dictionary
ds = DataStore({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})

# From pandas DataFrame
import pandas as pd
ds = DataStore(pd.DataFrame({'a': [1, 2, 3]}))

# Empty DataStore
ds = DataStore()
```


### Свойства \{#datastore-properties\}

| Свойство | Тип | Описание |
|----------|------|----------|
| `columns` | Index | Имена столбцов |
| `dtypes` | Series | Типы данных столбцов |
| `shape` | tuple | (строки, столбцы) |
| `size` | int | Общее количество элементов |
| `ndim` | int | Число измерений (2) |
| `empty` | bool | Является ли DataFrame пустым |
| `values` | ndarray | Базовые данные в виде массива NumPy |
| `index` | Index | Индекс строк |
| `T` | DataStore | Транспонированный DataStore |
| `axes` | list | Список осей |

### Методы-фабрики \{#datastore-factory\}

| Метод | Описание |
|--------|-------------|
| `uri(uri)` | Универсальный метод-фабрика по URI |
| `from_file(path, ...)` | Создать из файла |
| `from_df(df)` | Создать из pandas DataFrame |
| `from_s3(url, ...)` | Создать из S3 |
| `from_gcs(url, ...)` | Создать из Google Cloud Storage |
| `from_azure(url, ...)` | Создать из Azure Blob |
| `from_mysql(...)` | Создать из MySQL |
| `from_postgresql(...)` | Создать из PostgreSQL |
| `from_clickhouse(...)` | Создать из ClickHouse |
| `from_mongodb(...)` | Создать из MongoDB |
| `from_sqlite(...)` | Создать из SQLite |
| `from_iceberg(path)` | Создать из таблицы Iceberg |
| `from_delta(path)` | Создать из Delta Lake |
| `from_numbers(n)` | Создать с последовательными числами |
| `from_random(rows, cols)` | Создать со случайными данными |
| `run_sql(query)` | Создать из SQL-запроса |

Подробности см. в разделе [Методы-фабрики](factory-methods.md).

### Методы запросов \{#datastore-query\}

| Метод | Возвращает | Описание |
|--------|---------|-------------|
| `select(*cols)` | DataStore | Выбрать столбцы |
| `filter(condition)` | DataStore | Отфильтровать строки |
| `where(condition)` | DataStore | Синоним метода filter |
| `sort(*cols, ascending=True)` | DataStore | Отсортировать строки |
| `orderby(*cols)` | DataStore | Синоним метода sort |
| `limit(n)` | DataStore | Ограничить количество строк |
| `offset(n)` | DataStore | Пропустить строки |
| `distinct(subset=None)` | DataStore | Удалить дубликаты строк |
| `groupby(*cols)` | LazyGroupBy | Сгруппировать строки |
| `having(condition)` | DataStore | Отфильтровать группы |
| `join(right, ...)` | DataStore | Объединить объекты DataStore |
| `union(other, all=False)` | DataStore | Скомбинировать объекты DataStore |
| `when(cond, val)` | CaseWhen | CASE WHEN |

Подробности см. в разделе [Query Building](query-building.md).

### Методы, совместимые с Pandas \{#datastore-pandas\}

Полный список из 209 методов см. в разделе [Совместимость с Pandas](pandas-compat.md).

**Индексирование:**
`head()`, `tail()`, `sample()`, `loc`, `iloc`, `at`, `iat`, `query()`, `isin()`, `where()`, `mask()`, `get()`, `xs()`, `pop()`

**Агрегация:**
`sum()`, `mean()`, `std()`, `var()`, `min()`, `max()`, `median()`, `count()`, `nunique()`, `quantile()`, `describe()`, `corr()`, `cov()`, `skew()`, `kurt()`

**Манипуляции:**
`drop()`, `drop_duplicates()`, `dropna()`, `fillna()`, `replace()`, `rename()`, `assign()`, `astype()`, `copy()`

**Сортировка:**
`sort_values()`, `sort_index()`, `nlargest()`, `nsmallest()`, `rank()`

**Изменение структуры:**
`pivot()`, `pivot_table()`, `melt()`, `stack()`, `unstack()`, `transpose()`, `explode()`, `squeeze()`

**Комбинирование:**
`merge()`, `join()`, `concat()`, `append()`, `combine()`, `update()`, `compare()`

**Применение/преобразование:**
`apply()`, `applymap()`, `map()`, `agg()`, `transform()`, `pipe()`, `groupby()`

**Временные ряды:**
`rolling()`, `expanding()`, `ewm()`, `shift()`, `diff()`, `pct_change()`, `resample()`

### Методы ввода-вывода \{#datastore-io\}

| Метод | Описание |
|--------|----------|
| `to_csv(path, ...)` | Экспорт в CSV |
| `to_parquet(path, ...)` | Экспорт в Parquet |
| `to_json(path, ...)` | Экспорт в JSON |
| `to_excel(path, ...)` | Экспорт в Excel |
| `to_df()` | Преобразовать в pandas DataFrame |
| `to_pandas()` | Синоним to_df |
| `to_arrow()` | Преобразовать в таблицу Arrow |
| `to_dict(orient)` | Преобразовать в словарь |
| `to_records()` | Преобразовать в записи |
| `to_numpy()` | Преобразовать в массив NumPy |
| `to_sql()` | Сгенерировать строку SQL |
| `to_string()` | Строковое представление |
| `to_markdown()` | Таблица в Markdown |
| `to_html()` | Таблица в HTML |

Подробности см. в разделе [I/O Operations](io.md).

### Методы отладки \{#datastore-debug\}

| Method | Description |
|--------|-------------|
| `explain(verbose=False)` | Показать план выполнения |
| `clear_cache()` | Очистить кэшированные результаты |

Подробнее см. раздел [Debugging](../debugging/index.md).

### Магические методы \{#datastore-magic\}

| Method | Description |
|--------|-------------|
| `__getitem__(key)` | `ds['col']`, `ds[['a', 'b']]`, `ds[condition]` |
| `__setitem__(key, value)` | `ds['col'] = value` |
| `__delitem__(key)` | `del ds['col']` |
| `__len__()` | `len(ds)` |
| `__iter__()` | `for col in ds` |
| `__contains__(key)` | `'col' in ds` |
| `__repr__()` | `repr(ds)` |
| `__str__()` | `str(ds)` |
| `__eq__(other)` | `ds == other` |
| `__ne__(other)` | `ds != other` |
| `__lt__(other)` | `ds < other` |
| `__le__(other)` | `ds <= other` |
| `__gt__(other)` | `ds > other` |
| `__ge__(other)` | `ds >= other` |
| `__add__(other)` | `ds + other` |
| `__sub__(other)` | `ds - other` |
| `__mul__(other)` | `ds * other` |
| `__truediv__(other)` | `ds / other` |
| `__floordiv__(other)` | `ds // other` |
| `__mod__(other)` | `ds % other` |
| `__pow__(other)` | `ds ** other` |
| `__and__(other)` | `ds & other` |
| `__or__(other)` | `ds | other` |
| `__invert__()` | `~ds` |
| `__neg__()` | `-ds` |
| `__pos__()` | `+ds` |
| `__abs__()` | `abs(ds)` |

---

## ColumnExpr \{#columnexpr\}

Выражение столбца, используемое для отложенных вычислений. Возвращается при обращении к столбцу.

```python
# ColumnExpr is returned automatically
col = ds['name']  # Returns ColumnExpr
```


### Свойства \{#columnexpr-properties\}

| Свойство | Тип | Описание |
|----------|-----|----------|
| `name` | str | Имя столбца |
| `dtype` | dtype | Тип данных |

### Аксессоры \{#columnexpr-accessors\}

| Accessor | Описание | Методы |
|----------|----------|--------|
| `.str` | Операции со строками | 56 методов |
| `.dt` | Операции с DateTime | 42+ методов |
| `.arr` | Операции с массивами | 37 методов |
| `.json` | Разбор JSON | 13 методов |
| `.url` | Разбор URL | 15 методов |
| `.ip` | Операции с IP-адресами | 9 методов |
| `.geo` | Гео-/операции с расстоянием | 14 методов |

Полную документацию см. в разделе [Accessors](accessors.md).

### Арифметические операции \{#columnexpr-arithmetic\}

```python
ds['total'] = ds['price'] * ds['quantity']
ds['profit'] = ds['revenue'] - ds['cost']
ds['ratio'] = ds['a'] / ds['b']
ds['squared'] = ds['value'] ** 2
ds['remainder'] = ds['value'] % 10
```


### Операции сравнения \{#columnexpr-comparison\}

```python
ds[ds['age'] > 25]           # Greater than
ds[ds['age'] >= 25]          # Greater or equal
ds[ds['age'] < 25]           # Less than
ds[ds['age'] <= 25]          # Less or equal
ds[ds['name'] == 'Alice']    # Equal
ds[ds['name'] != 'Bob']      # Not equal
```


### Логические операции \{#columnexpr-logical\}

```python
ds[(ds['age'] > 25) & (ds['city'] == 'NYC')]    # AND
ds[(ds['age'] > 25) | (ds['city'] == 'NYC')]    # OR
ds[~(ds['status'] == 'inactive')]               # NOT
```


### Методы \{#columnexpr-methods\}

| Method | Description |
|--------|-------------|
| `as_(alias)` | Задать псевдоним |
| `cast(dtype)` | Привести к типу |
| `astype(dtype)` | Псевдоним для cast |
| `isnull()` | Проверка на NULL |
| `notnull()` | Проверка на не-NULL |
| `isna()` | Псевдоним для isnull |
| `notna()` | Псевдоним для notnull |
| `isin(values)` | В списке значений |
| `between(low, high)` | Между двумя значениями |
| `fillna(value)` | Заполнить NULL-значения |
| `replace(to_replace, value)` | Заменить значения |
| `clip(lower, upper)` | Обрезать значения |
| `abs()` | Абсолютное значение |
| `round(decimals)` | Округлить значения |
| `floor()` | Округление вниз до целого |
| `ceil()` | Округление вверх до целого |
| `apply(func)` | Применить функцию |
| `map(mapper)` | Отобразить значения |

### Методы агрегации \{#columnexpr-aggregation\}

| Method | Description |
|--------|-------------|
| `sum()` | Сумма |
| `mean()` | Среднее значение |
| `avg()` | Псевдоним функции `mean` |
| `min()` | Минимум |
| `max()` | Максимум |
| `count()` | Количество непустых значений |
| `nunique()` | Количество уникальных значений |
| `std()` | Стандартное отклонение |
| `var()` | Дисперсия |
| `median()` | Медиана |
| `quantile(q)` | Квантиль |
| `first()` | Первое значение |
| `last()` | Последнее значение |
| `any()` | Есть хотя бы одно истинное значение |
| `all()` | Все значения истинны |

---

## LazyGroupBy \{#lazygroupby\}

Представляет сгруппированное хранилище DataStore для выполнения операций агрегации.

```python
# LazyGroupBy is returned automatically
grouped = ds.groupby('category')  # Returns LazyGroupBy
```


### Методы \{#lazygroupby-methods\}

| Метод | Возвращает | Описание |
|--------|---------|-------------|
| `agg(spec)` | DataStore | Агрегирование |
| `aggregate(spec)` | DataStore | Псевдоним agg |
| `sum()` | DataStore | Сумма по группе |
| `mean()` | DataStore | Среднее по группе |
| `count()` | DataStore | Количество по группе |
| `min()` | DataStore | Минимум по группе |
| `max()` | DataStore | Максимум по группе |
| `std()` | DataStore | Стандартное отклонение по группе |
| `var()` | DataStore | Дисперсия по группе |
| `median()` | DataStore | Медиана по группе |
| `nunique()` | DataStore | Количество уникальных значений по группе |
| `first()` | DataStore | Первое значение по группе |
| `last()` | DataStore | Последнее значение по группе |
| `nth(n)` | DataStore | n-е значение по группе |
| `head(n)` | DataStore | Первые n в группе |
| `tail(n)` | DataStore | Последние n в группе |
| `apply(func)` | DataStore | Применить функцию к каждой группе |
| `transform(func)` | DataStore | Преобразование каждой группы |
| `filter(func)` | DataStore | Фильтрация групп |

### Выбор столбцов \{#lazygroupby-columns\}

```python
# Select column after groupby
grouped['amount'].sum()     # Returns DataStore
grouped[['a', 'b']].sum()   # Returns DataStore
```


### Спецификации агрегирования \{#lazygroupby-agg\}

```python
# Single aggregation
grouped.agg({'amount': 'sum'})

# Multiple aggregations per column
grouped.agg({'amount': ['sum', 'mean', 'count']})

# Named aggregations
grouped.agg(
    total=('amount', 'sum'),
    average=('amount', 'mean'),
    count=('id', 'count')
)
```

***


## LazySeries \{#lazyseries\}

Представляет ленивую Series (один столбец).

### Свойства \{#lazyseries-properties\}

| Свойство | Тип | Описание |
|----------|------|-------------|
| `name` | str | Название серии |
| `dtype` | dtype | Тип данных |

### Методы \{#lazyseries-methods\}

Наследует большинство методов от `ColumnExpr`. Основные методы:

| Метод | Описание |
|--------|-------------|
| `value_counts()` | Частоты значений |
| `unique()` | Уникальные значения |
| `nunique()` | Количество уникальных значений |
| `mode()` | Модальное значение |
| `to_list()` | Преобразовать в список |
| `to_numpy()` | Преобразовать в массив NumPy |
| `to_frame()` | Преобразовать в DataStore |

---

## Связанные классы \{#related\}

### F (Функции) \{#f-class\}

Пространство имён для функций ClickHouse.

```python
from chdb.datastore import F, Field

# Aggregations
F.sum(Field('amount'))
F.avg(Field('price'))
F.count(Field('id'))
F.quantile(Field('value'), 0.95)

# Conditional
F.sum_if(Field('amount'), Field('status') == 'completed')
F.count_if(Field('active'))

# Window
F.row_number().over(order_by='date')
F.lag('price', 1).over(partition_by='product', order_by='date')
```

Дополнительные сведения см. в разделе [Aggregation](aggregation.md#f-namespace).


### Field \{#field-class\}

Ссылка на столбец по его имени.

```python
from chdb.datastore import Field

# Create field reference
amount = Field('amount')
price = Field('price')

# Use in expressions
F.sum(Field('amount'))
F.avg(Field('price'))
```


### CaseWhen \{#casewhen-class\}

Билдер для выражений CASE WHEN.

```python
# Create case-when expression
result = (ds
    .when(ds['score'] >= 90, 'A')
    .when(ds['score'] >= 80, 'B')
    .when(ds['score'] >= 70, 'C')
    .otherwise('F')
)

# Assign to column
ds['grade'] = result
```


### Window \{#window-class\}

Определение окна для оконных функций.

```python
from chdb.datastore import F

# Create window
window = F.window(
    partition_by='category',
    order_by='date',
    rows_between=(-7, 0)
)

# Use with aggregation
ds['rolling_avg'] = F.avg('price').over(window)
```
