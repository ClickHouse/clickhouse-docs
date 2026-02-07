---
title: 'Миграция с pandas'
sidebar_label: 'Миграция с pandas'
slug: /chdb/guides/migration-from-pandas
description: 'Пошаговое руководство по переходу с pandas на DataStore'
keywords: ['chdb', 'datastore', 'pandas', 'migration', 'guide']
doc_type: 'guide'
---

# Миграция с pandas \{#migration-from-pandas\}

В этом руководстве показано, как перенести существующий код с pandas в DataStore для повышения производительности, обеспечивая при этом совместимость.

## Миграция в одну строку \{#one-line\}

Самая простая миграция — это изменение вашего импорта:

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

Вот и всё! Почти весь код на pandas будет работать без изменений.


## Пошаговая миграция \{#step-by-step\}

<VerticalStepper headerLevel="h3">

### Установите chDB \{#step-1\}

```bash
pip install "chdb>=4.0"
```

### Измените импорт \{#step-2\}

```python
# Замените это:
import pandas as pd

# На это:
from chdb import datastore as pd
```

### Протестируйте свой код \{#step-3\}

Запустите свой существующий код. Большинство операций работают без изменений:

```python
from chdb import datastore as pd

# Все эти операции работают одинаково
df = pd.read_csv("data.csv")
result = df[df['age'] > 25]
grouped = df.groupby('city')['salary'].mean()
df.to_csv("output.csv")
```

### Обработайте отличия \{#step-4\}

Некоторые операции работают по-другому. См. раздел [Ключевые отличия](#differences) ниже.

</VerticalStepper>

---

## Что работает без изменений \{#works-unchanged\}

### Загрузка данных \{#loading-unchanged\}

```python
# All these work the same
df = pd.read_csv("data.csv")
df = pd.read_parquet("data.parquet")
df = pd.read_json("data.json")
df = pd.read_excel("data.xlsx")
```


### Фильтрация \{#filtering-unchanged\}

```python
# Boolean indexing
df[df['age'] > 25]
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# query() method
df.query('age > 25 and salary > 50000')
```


### Выбор \{#selection-unchanged\}

```python
# Column selection
df['name']
df[['name', 'age']]

# Row selection
df.head(10)
df.tail(10)
df.iloc[0:100]
```


### Группировка и агрегирование \{#groupby-unchanged\}

```python
# GroupBy
df.groupby('city')['salary'].mean()
df.groupby(['city', 'dept']).agg({'salary': ['sum', 'mean']})
```


### Сортировка \{#sorting-unchanged\}

```python
df.sort_values('salary', ascending=False)
df.sort_values(['city', 'age'])
```


### Строковые операции \{#string-unchanged\}

```python
df['name'].str.upper()
df['name'].str.contains('John')
df['name'].str.len()
```


### Операции с датой и временем \{#datetime-unchanged\}

```python
df['date'].dt.year
df['date'].dt.month
df['date'].dt.dayofweek
```


### Операции ввода/вывода \{#io-unchanged\}

```python
df.to_csv("output.csv")
df.to_parquet("output.parquet")
df.to_json("output.json")
```

***


## Основные отличия \{#differences\}

### 1. Ленивые вычисления \{#lazy\}

Операции в DataStore выполняются лениво — они не запускаются, пока не понадобятся результаты.

**pandas:**

```python
# Executes immediately
result = df[df['age'] > 25]
print(type(result))  # pandas.DataFrame
```

**DataStore:**

```python
# Builds query, doesn't execute yet
result = ds[ds['age'] > 25]
print(type(result))  # DataStore (lazy)

# Executes when you need the data
print(result)        # Triggers execution
df = result.to_df()  # Triggers execution
```


### 2. Типы возвращаемых значений \{#return-types\}

| Operation | Возвращаемое значение pandas | Возвращаемое значение DataStore |
|-----------|---------------|-------------------|
| `df['col']` | Series | ColumnExpr (lazy) |
| `df[['a', 'b']]` | DataFrame | DataStore (lazy) |
| `df[condition]` | DataFrame | DataStore (lazy) |
| `df.groupby('x')` | GroupBy | LazyGroupBy |

### 3. Отсутствие параметра inplace \{#no-inplace\}

DataStore не поддерживает `inplace=True`. Всегда используйте возвращаемое значение:

**pandas:**

```python
df.drop(columns=['col'], inplace=True)
```

**DataStore (хранилище данных):**

```python
ds = ds.drop(columns=['col'])  # Assign the result
```


### 4. Сравнение объектов DataStore \{#comparing\}

pandas не распознаёт объекты DataStore, поэтому для сравнения используйте метод `to_pandas()`:

```python
# This may not work as expected
df == ds  # pandas doesn't know DataStore

# Do this instead
df.equals(ds.to_pandas())
```


### 5. Порядок строк \{#row-order\}

DataStore может не сохранять порядок строк при работе с файловыми источниками (например, SQL-базами данных). Используйте явную сортировку:

```python
# pandas preserves order
df = pd.read_csv("data.csv")

# DataStore - use sort for guaranteed order
ds = pd.read_csv("data.csv")
ds = ds.sort('id')  # Explicit ordering
```

***


## Сценарии миграции \{#patterns\}

### Паттерн 1: Чтение — анализ — запись \{#pattern-1\}

```python
# pandas
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")

# DataStore - same code works!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")
```


### Шаблон 2: DataFrame с операциями pandas \{#pattern-2\}

Если вам нужны специальные возможности pandas, выполняйте преобразование в самом конце:

```python
from chdb import datastore as pd

# Fast DataStore operations
ds = pd.read_csv("large_data.csv")
ds = ds.filter(ds['date'] >= '2024-01-01')
ds = ds.filter(ds['amount'] > 100)

# Convert to pandas for specific features
df = ds.to_df()
df_pivoted = df.pivot_table(...)  # pandas-specific
```


### Паттерн 3: Комбинированный рабочий процесс \{#pattern-3\}

```python
from chdb import datastore as pd
import pandas

# Start with DataStore for fast filtering
ds = pd.read_csv("huge_file.csv")  # 10M rows
ds = ds.filter(ds['year'] == 2024)  # Fast SQL filter
ds = ds.select('col1', 'col2', 'col3')  # Column pruning

# Convert for pandas-specific operations
df = ds.to_df()  # Now only ~100K rows
result = df.apply(complex_custom_function)  # pandas
```

***


## Сравнение производительности \{#performance\}

DataStore значительно быстрее при работе с большими наборами данных:

| Операция | pandas | DataStore | Ускорение |
|-----------|--------|-----------|---------|
| GroupBy count | 347 мс | 17 мс | **19.93x** |
| Complex pipeline | 2,047 мс | 380 мс | **5.39x** |
| Filter+Sort+Head | 1,537 мс | 350 мс | **4.40x** |
| GroupBy agg | 406 мс | 141 мс | **2.88x** |

*Бенчмарк на 10 млн строк*

---

## Устранение неполадок при миграции \{#troubleshooting\}

### Проблема: операция не работает \{#issue-op\}

Некоторые операции pandas могут не поддерживаться. Проверьте:

1. Есть ли операция в [списке совместимости](../datastore/pandas-compat.md)?
2. Попробуйте сначала перевести данные в pandas: `ds.to_df().operation()`

### Проблема: различающиеся результаты \{#issue-results\}

Включите отладочное журналирование, чтобы понять, что происходит:

```python
from chdb.datastore.config import config
config.enable_debug()

# View the SQL being generated
ds.filter(ds['x'] > 10).explain()
```


### Проблема: низкая производительность \{#issue-slow\}

Проверьте характер выполнения:

```python
# Bad: Multiple small executions
for i in range(1000):
    result = ds.filter(ds['id'] == i).to_df()

# Good: Single execution
result = ds.filter(ds['id'].isin(ids)).to_df()
```


### Проблема: несоответствия типов \{#issue-types\}

DataStore может по-разному выводить типы данных:

```python
# Check types
print(ds.dtypes)

# Force conversion
ds['col'] = ds['col'].astype('int64')
```

***


## Стратегия постепенной миграции \{#gradual\}

### 1-я неделя: Проверка совместимости \{#week-1\}

```python
# Keep both imports
import pandas as pd
from chdb import datastore as ds

# Compare results
pdf = pd.read_csv("data.csv")
dsf = ds.read_csv("data.csv")

# Verify they match
assert pdf.equals(dsf.to_pandas())
```


### Неделя 2: Миграция простых скриптов \{#week-2\}

Начните со скриптов, которые:

- Читают большие файлы
- Выполняют фильтрацию и агрегацию
- Не используют пользовательские функции apply

### Неделя 3: Работа со сложными случаями \{#week-3\}

Для скриптов с пользовательскими функциями:

```python
from chdb import datastore as pd

# Let DataStore handle the heavy lifting
ds = pd.read_csv("data.csv")
ds = ds.filter(ds['year'] == 2024)  # SQL

# Convert for custom work
df = ds.to_df()
result = df.apply(my_custom_function)
```


### Неделя 4: Полная миграция \{#week-4\}

Переведите все скрипты на импорт в DataStore.

---

## Часто задаваемые вопросы \{#faq\}

### Могу ли я использовать одновременно и pandas, и DataStore? \{#faq-both\}

Да! Можно свободно преобразовывать данные между ними:

```python
from chdb import datastore as ds
import pandas as pd

# DataStore to pandas
df = ds_result.to_pandas()

# pandas to DataStore  
ds = ds.DataFrame(pd_result)
```


### Будут ли мои тесты по-прежнему проходить? \{#faq-tests\}

Большинство тестов по-прежнему должно проходить. Для сравнительных тестов преобразуйте в pandas:

```python
def test_my_function():
    result = my_function()
    expected = pd.DataFrame(...)
    pd.testing.assert_frame_equal(result.to_pandas(), expected)
```


### Могу ли я использовать DataStore в Jupyter? \{#faq-jupyter\}

Да! DataStore работает в Jupyter Notebook:

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")
ds.head()  # Displays nicely in Jupyter
```


### Как сообщить о проблемах? \{#faq-issues\}

Если вы обнаружите какие-либо проблемы совместимости, сообщите о них здесь:
https://github.com/chdb-io/chdb/issues