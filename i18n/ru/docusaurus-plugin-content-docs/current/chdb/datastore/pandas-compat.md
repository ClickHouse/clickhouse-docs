---
title: 'Совместимость DataStore с Pandas'
sidebar_label: 'Совместимость с Pandas'
slug: /chdb/datastore/pandas-compat
description: 'Полный список совместимых с pandas методов DataStore (209 методов DataFrame)'
keywords: ['chdb', 'datastore', 'pandas', 'compatibility', 'dataframe', 'methods']
doc_type: 'reference'
---

# Совместимость с Pandas \{#pandas-compatibility\}

DataStore реализует **209 методов pandas DataFrame** для полной совместимости с API pandas. Ваш существующий код на pandas будет работать практически без изменений.

## Подход к обеспечению совместимости \{#approach\}

```python
# Typical migration - just change the import
- import pandas as pd
+ from chdb import datastore as pd

# Your code works unchanged
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

**Ключевые принципы:**

* Реализованы все 209 методов pandas DataFrame
* Ленивые вычисления для оптимизации SQL
* Автоматическое оборачивание типов (DataFrame → DataStore, Series → ColumnExpr)
* Неизменяемые операции (без `inplace=True`)

***


## Атрибуты и свойства \{#attributes\}

| Свойство  | Описание                 | Вызывает вычисление |
| --------- | ------------------------ | ------------------- |
| `shape`   | кортеж (строки, столбцы) | Да                  |
| `columns` | Имена столбцов (INDEX)   | Да                  |
| `dtypes`  | Типы данных столбцов     | Да                  |
| `values`  | Массив NumPy             | Да                  |
| `index`   | Индекс строк             | Да                  |
| `size`    | Количество элементов     | Да                  |
| `ndim`    | Количество измерений     | Нет                 |
| `empty`   | Пустой ли DataFrame      | Да                  |
| `T`       | Транспонирование         | Да                  |
| `axes`    | Список осей              | Да                  |

**Примеры:**

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")

print(ds.shape)      # (1000, 5)
print(ds.columns)    # Index(['name', 'age', 'city', 'salary', 'dept'])
print(ds.dtypes)     # name: object, age: int64, ...
print(ds.empty)      # False
```

***


## Индексация и выборка \{#indexing\}

| Метод | Описание              | Пример |
|--------|--------------------------|---------|
| `df['col']` | Выбор столбца            | `ds['age']` |
| `df[['col1', 'col2']]` | Выбор столбцов           | `ds[['name', 'age']]` |
| `df[condition]` | Логическая индексация     | `ds[ds['age'] > 25]` |
| `df.loc[...]` | Доступ по меткам         | `ds.loc[0:10, 'name']` |
| `df.iloc[...]` | Доступ по позициям       | `ds.iloc[0:10, 0:3]` |
| `df.at[...]` | Одно значение по метке   | `ds.at[0, 'name']` |
| `df.iat[...]` | Одно значение по позиции | `ds.iat[0, 0]` |
| `df.head(n)` | Первые n строк            | `ds.head(10)` |
| `df.tail(n)` | Последние n строк         | `ds.tail(10)` |
| `df.sample(n)` | Случайная выборка        | `ds.sample(100)` |
| `df.select_dtypes()` | Выбор по типу данных     | `ds.select_dtypes(include='number')` |
| `df.query()` | Запрос по выражению      | `ds.query('age > 25')` |
| `df.where()` | Условная замена          | `ds.where(ds['age'] > 0, 0)` |
| `df.mask()` | Инверсия условия where   | `ds.mask(ds['age'] < 0, 0)` |
| `df.isin()` | Проверка вхождения значений | `ds['city'].isin(['NYC', 'LA'])` |
| `df.get()` | Безопасный доступ к столбцу | `ds.get('col', default=None)` |
| `df.xs()` | Поперечное сечение        | `ds.xs('key')` |
| `df.pop()` | Удаление столбца          | `ds.pop('col')` |

---

## Статистические методы \{#statistical\}

| Method           | Description                              | SQL Equivalent  |
| ---------------- | ---------------------------------------- | --------------- |
| `mean()`         | Среднее значение                         | `AVG()`         |
| `median()`       | Медиана                                  | `MEDIAN()`      |
| `mode()`         | Мода                                     | -               |
| `std()`          | Стандартное отклонение                   | `STDDEV()`      |
| `var()`          | Дисперсия                                | `VAR()`         |
| `min()`          | Минимум                                  | `MIN()`         |
| `max()`          | Максимум                                 | `MAX()`         |
| `sum()`          | Сумма                                    | `SUM()`         |
| `prod()`         | Произведение                             | -               |
| `count()`        | Количество ненулевых (non-null) значений | `COUNT()`       |
| `nunique()`      | Количество уникальных значений           | `UNIQ()`        |
| `value_counts()` | Частоты значений                         | `GROUP BY`      |
| `quantile()`     | Квантиль                                 | `QUANTILE()`    |
| `describe()`     | Описательная статистика                  | -               |
| `corr()`         | Матрица корреляции                       | `CORR()`        |
| `cov()`          | Матрица ковариации                       | `COV()`         |
| `corrwith()`     | Попарная корреляция                      | -               |
| `rank()`         | Присвоение рангов значениям              | `RANK()`        |
| `abs()`          | Абсолютные значения                      | `ABS()`         |
| `round()`        | Округление значений                      | `ROUND()`       |
| `clip()`         | Ограничение значений                     | -               |
| `cumsum()`       | Накопительная сумма                      | оконная функция |
| `cumprod()`      | Накопительное произведение               | оконная функция |
| `cummin()`       | Накопительный минимум                    | оконная функция |
| `cummax()`       | Накопительный максимум                   | оконная функция |
| `diff()`         | Разность                                 | оконная функция |
| `pct_change()`   | Процентное изменение                     | оконная функция |
| `skew()`         | Асимметрия                               | `SKEW()`        |
| `kurt()`         | Эксцесс                                  | `KURT()`        |
| `sem()`          | Стандартная ошибка                       | -               |
| `all()`          | Все значения истинны                     | -               |
| `any()`          | Есть хотя бы одно истинное значение      | -               |
| `idxmin()`       | Индекс минимума                          | -               |
| `idxmax()`       | Индекс максимума                         | -               |

**Примеры:**

```python
ds = pd.read_csv("data.csv")

# Basic statistics
print(ds['salary'].mean())
print(ds['age'].std())
print(ds.describe())

# Group statistics
print(ds.groupby('department')['salary'].mean())
print(ds.groupby('city').agg({'salary': ['mean', 'std'], 'age': 'count'}))
```

***


## Обработка данных \{#manipulation\}

| Method              | Description                    |
| ------------------- | ------------------------------ |
| `drop()`            | Удалить строки/столбцы         |
| `drop_duplicates()` | Удалить дубликаты              |
| `duplicated()`      | Отметить дубликаты             |
| `dropna()`          | Удалить пропущенные значения   |
| `fillna()`          | Заполнить пропущенные значения |
| `ffill()`           | Заполнение вперёд              |
| `bfill()`           | Заполнение назад               |
| `interpolate()`     | Интерполировать значения       |
| `replace()`         | Заменить значения              |
| `rename()`          | Переименовать столбцы/индекс   |
| `rename_axis()`     | Переименовать ось              |
| `assign()`          | Добавить новые столбцы         |
| `astype()`          | Преобразовать типы             |
| `convert_dtypes()`  | Определить подходящие типы     |
| `copy()`            | Копировать DataFrame           |

**Примеры:**

```python
ds = pd.read_csv("data.csv")

# Drop operations
result = ds.drop(columns=['unused_col'])
result = ds.drop_duplicates(subset=['user_id'])
result = ds.dropna(subset=['email'])

# Fill operations
result = ds.fillna(0)
result = ds.fillna({'age': 0, 'name': 'Unknown'})

# Transform operations
result = ds.rename(columns={'old_name': 'new_name'})
result = ds.assign(
    full_name=lambda x: x['first_name'] + ' ' + x['last_name'],
    age_group=lambda x: pd.cut(x['age'], bins=[0, 25, 50, 100])
)
```

***


## Сортировка и ранжирование \{#sorting\}

| Метод           | Описание                |
| --------------- | ----------------------- |
| `sort_values()` | Сортировка по значениям |
| `sort_index()`  | Сортировка по индексу   |
| `nlargest()`    | N наибольших значений   |
| `nsmallest()`   | N наименьших значений   |

**Примеры:**

```python
# Sort by single column
result = ds.sort_values('salary', ascending=False)

# Sort by multiple columns
result = ds.sort_values(['department', 'salary'], ascending=[True, False])

# Get top/bottom N
result = ds.nlargest(10, 'salary')
result = ds.nsmallest(5, 'age')
```

***


## Преобразование формы данных \{#reshaping\}

| Method              | Description                       |
| ------------------- | --------------------------------- |
| `pivot()`           | Сводная таблица                   |
| `pivot_table()`     | Сводная таблица с агрегацией      |
| `melt()`            | Обратное преобразование (unpivot) |
| `stack()`           | Преобразовать столбцы в индекс    |
| `unstack()`         | Преобразовать индекс в столбцы    |
| `transpose()` / `T` | Транспонировать                   |
| `explode()`         | Развёрнуть списки в строки        |
| `squeeze()`         | Уменьшить размерность             |
| `droplevel()`       | Удалить уровень индекса           |
| `swaplevel()`       | Поменять уровни индекса местами   |
| `reorder_levels()`  | Изменить порядок уровней          |

**Примеры:**

```python
# Pivot table
result = ds.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)

# Melt (unpivot)
result = ds.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)

# Explode arrays
result = ds.explode('tags')
```

***


## Комбинирование / объединение \{#combining\}

| Метод             | Описание                     |
| ----------------- | ---------------------------- |
| `merge()`         | Объединение в стиле SQL      |
| `join()`          | Объединение по индексу       |
| `concat()`        | Конкатенация                 |
| `append()`        | Добавление строк             |
| `combine()`       | Комбинирование с функцией    |
| `combine_first()` | Комбинирование с приоритетом |
| `update()`        | Обновление значений          |
| `compare()`       | Показать различия            |

**Примеры:**

```python
# Merge (join)
result = pd.merge(df1, df2, on='id', how='left')
result = df1.join(df2, on='id')

# Concatenate
result = pd.concat([df1, df2, df3])
result = pd.concat([df1, df2], axis=1)
```

***


## Бинарные операции \{#binary\}

| Method                       | Description          |
| ---------------------------- | -------------------- |
| `add()` / `radd()`           | Сложение             |
| `sub()` / `rsub()`           | Вычитание            |
| `mul()` / `rmul()`           | Умножение            |
| `div()` / `rdiv()`           | Деление              |
| `truediv()` / `rtruediv()`   | Истинное деление     |
| `floordiv()` / `rfloordiv()` | Деление нацело       |
| `mod()` / `rmod()`           | Остаток от деления   |
| `pow()` / `rpow()`           | Возведение в степень |
| `dot()`                      | Матричное умножение  |

**Примеры:**

```python
# Arithmetic operations
result = ds['col1'].add(ds['col2'])
result = ds['price'].mul(ds['quantity'])

# With fill_value for missing data
result = ds['col1'].add(ds['col2'], fill_value=0)
```

***


## Операции сравнения \{#comparison\}

| Method | Description |
|--------|-------------|
| `eq()` | Равно |
| `ne()` | Не равно |
| `lt()` | Меньше |
| `le()` | Меньше либо равно |
| `gt()` | Больше |
| `ge()` | Больше либо равно |
| `equals()` | Проверка равенства |
| `compare()` | Показ различий |

---

## Применение функций \{#application\}

| Method                  | Description           |
| ----------------------- | --------------------- |
| `apply()`               | Применить функцию     |
| `applymap()`            | Применить поэлементно |
| `map()`                 | Отобразить значения   |
| `agg()` / `aggregate()` | Агрегировать          |
| `transform()`           | Преобразовать         |
| `pipe()`                | Передать в функцию    |
| `groupby()`             | Группировать по       |

**Примеры:**

```python
# Apply function
result = ds['name'].apply(lambda x: x.upper())
result = ds.apply(lambda row: row['a'] + row['b'], axis=1)

# Aggregate
result = ds.agg({'col1': 'sum', 'col2': 'mean'})
result = ds.agg(['sum', 'mean', 'std'])

# Pipe
result = (ds
    .pipe(filter_active)
    .pipe(calculate_metrics)
    .pipe(format_output)
)
```

***


## Временные ряды \{#timeseries\}

| Method               | Description                     |
| -------------------- | ------------------------------- |
| `rolling()`          | Скользящее окно                 |
| `expanding()`        | Расширяющееся окно              |
| `ewm()`              | Экспоненциально взвешенное окно |
| `resample()`         | Ресемплирование временного ряда |
| `shift()`            | Сдвиг значений                  |
| `asfreq()`           | Преобразование частоты          |
| `asof()`             | Последнее значение на момент    |
| `at_time()`          | Выбор по времени                |
| `between_time()`     | Выбор диапазона времени         |
| `first()` / `last()` | Первые/последние периоды        |
| `to_period()`        | Преобразование в период         |
| `to_timestamp()`     | Преобразование в timestamp      |
| `tz_convert()`       | Преобразование часового пояса   |
| `tz_localize()`      | Локализация часового пояса      |

**Примеры:**

```python
# Rolling window
result = ds['value'].rolling(window=7).mean()

# Expanding window
result = ds['value'].expanding().sum()

# Shift
result = ds['value'].shift(1)  # Lag
result = ds['value'].shift(-1)  # Lead
```

***


## Пропущенные данные \{#missing\}

| Метод | Описание |
|--------|-------------|
| `isna()` / `isnull()` | Обнаружение пропущенных значений |
| `notna()` / `notnull()` | Обнаружение непропущенных значений |
| `dropna()` | Удаление пропущенных значений |
| `fillna()` | Заполнение пропущенных значений |
| `ffill()` | Заполнение вперёд |
| `bfill()` | Заполнение назад |
| `interpolate()` | Интерполяция значений |
| `replace()` | Замена значений |

---

## Методы ввода-вывода \{#io\}

| Метод | Описание |
|--------|----------|
| `to_csv()` | Экспорт в CSV |
| `to_json()` | Экспорт в JSON |
| `to_excel()` | Экспорт в Excel |
| `to_parquet()` | Экспорт в Parquet |
| `to_feather()` | Экспорт в Feather |
| `to_sql()` | Экспорт в базу данных SQL |
| `to_pickle()` | Сериализация в формат pickle |
| `to_html()` | Таблица HTML |
| `to_latex()` | Таблица LaTeX |
| `to_markdown()` | Таблица Markdown |
| `to_string()` | Строковое представление |
| `to_dict()` | Словарь |
| `to_records()` | Записи |
| `to_numpy()` | Массив NumPy |
| `to_clipboard()` | Буфер обмена |

См. подробную документацию в разделе [Операции ввода-вывода](io.md).

---

## Итерация \{#iteration\}

| Method | Описание              |
|--------|--------------------------|
| `items()` | Итерация (столбец, Series) |
| `iterrows()` | Итерация (индекс, Series)  |
| `itertuples()` | Итерация по именованным кортежам  |

---

## Основные отличия от Pandas \{#differences\}

### 1. Типы возврата \{#return-types\}

```python
# Pandas returns Series
pdf['col']  # → pd.Series

# DataStore returns ColumnExpr (lazy)
ds['col']   # → ColumnExpr
```


### 2. Ленивое вычисление \{#lazy-execution\}

```python
# DataStore operations are lazy
result = ds.filter(ds['age'] > 25)  # Not executed yet
df = result.to_df()  # Executed here
```


### 3. Отсутствие параметра inplace \{#no-inplace-parameter\}

```python
# Pandas
df.drop(columns=['col'], inplace=True)

# DataStore (always returns new object)
ds = ds.drop(columns=['col'])
```


### 4. Сравнение результатов \{#comparing-results\}

```python
# Use to_pandas() for comparison
pd.testing.assert_frame_equal(
    ds.to_pandas(),
    expected_df
)
```

Подробности см. в разделе [Ключевые отличия](../guides/pandas-differences.md).
