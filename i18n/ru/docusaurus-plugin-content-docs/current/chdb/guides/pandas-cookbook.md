---
title: 'Сборник рецептов Pandas'
sidebar_label: 'Сборник рецептов Pandas'
slug: /chdb/guides/pandas-cookbook
description: 'Распространённые шаблоны pandas и их эквиваленты в DataStore'
keywords: ['chdb', 'datastore', 'pandas', 'сборник рецептов', 'шаблоны', 'примеры']
doc_type: 'guide'
---

# Справочник по Pandas \{#pandas-cookbook\}

Типовые приёмы Pandas и их эквиваленты в DataStore. Большая часть кода работает без изменений!

## Загрузка данных \{#loading\}

### Чтение CSV \{#read-csv\}

```python
# Pandas
import pandas as pd
df = pd.read_csv("data.csv")

# DataStore - same!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
```


### Чтение нескольких файлов \{#read-multiple-files\}

```python
# Pandas
import glob
dfs = [pd.read_csv(f) for f in glob.glob("data/*.csv")]
df = pd.concat(dfs)

# DataStore - more efficient with glob pattern
df = pd.read_csv("data/*.csv")
```

***


## Фильтрация \{#filtering\}

### Одно условие \{#single-condition\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25]
df[df['city'] == 'NYC']
df[df['name'].str.contains('John')]
```


### Несколько условий \{#multiple-conditions\}

```python
# AND
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# OR
df[(df['age'] < 18) | (df['age'] > 65)]

# NOT
df[~(df['status'] == 'inactive')]
```


### Использование функции query() \{#using-query\}

```python
# Pandas and DataStore - identical
df.query('age > 25 and city == "NYC"')
df.query('salary > 50000')
```


### isin() \{#isin\}

```python
# Pandas and DataStore - identical
df[df['city'].isin(['NYC', 'LA', 'SF'])]
```


### between() \{#between\}

```python
# Pandas and DataStore - identical
df[df['age'].between(18, 65)]
```

***


## Выбор столбцов \{#selecting\}

### Один столбец \{#single-column-select\}

```python
# Pandas and DataStore - identical
df['name']
df.name  # attribute access
```


### Несколько столбцов \{#multiple-columns-select\}

```python
# Pandas and DataStore - identical
df[['name', 'age', 'city']]
```


### Выборка и фильтрация \{#select-and-filter\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25][['name', 'salary']]

# DataStore also supports SQL-style
df.filter(df['age'] > 25).select('name', 'salary')
```

***


## Сортировка \{#sorting\}

### Один столбец \{#single-column-sort\}

```python
# Pandas and DataStore - identical
df.sort_values('salary')
df.sort_values('salary', ascending=False)
```


### Несколько столбцов \{#multiple-columns-sort\}

```python
# Pandas and DataStore - identical
df.sort_values(['city', 'salary'], ascending=[True, False])
```


### Получение верхних/нижних N \{#get-top-bottom-n\}

```python
# Pandas and DataStore - identical
df.nlargest(10, 'salary')
df.nsmallest(5, 'age')
```

***


## GroupBy и агрегирование \{#groupby\}

### Простой пример GroupBy \{#simple-groupby\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].mean()
df.groupby('city')['salary'].sum()
df.groupby('city').size()  # count
```


### Несколько агрегаций \{#multiple-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].agg(['sum', 'mean', 'count'])

df.groupby('city').agg({
    'salary': ['sum', 'mean'],
    'age': ['min', 'max']
})
```


### Именованные агрегации \{#named-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city').agg(
    total_salary=('salary', 'sum'),
    avg_salary=('salary', 'mean'),
    employee_count=('id', 'count')
)
```


### Несколько ключей группировки \{#multiple-groupby-keys\}

```python
# Pandas and DataStore - identical
df.groupby(['city', 'department'])['salary'].mean()
```

***


## Объединение данных \{#joining\}

### Внутреннее соединение \{#inner-join\}

```python
# Pandas
pd.merge(df1, df2, on='id')

# DataStore - same API
pd.merge(df1, df2, on='id')

# DataStore also supports
df1.join(df2, on='id')
```


### Левое соединение \{#left-join\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, on='id', how='left')
```


### Объединение по разным столбцам \{#join-on-different-columns\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, left_on='emp_id', right_on='id')
```


### Объединение \{#concat\}

```python
# Pandas and DataStore - identical
pd.concat([df1, df2, df3])
pd.concat([df1, df2], axis=1)
```

***


## Операции со строками \{#string\}

### Изменение регистра \{#case-conversion\}

```python
# Pandas and DataStore - identical
df['name'].str.upper()
df['name'].str.lower()
df['name'].str.title()
```


### Подстрока \{#substring\}

```python
# Pandas and DataStore - identical
df['name'].str[:3]        # First 3 characters
df['name'].str.slice(0, 3)
```


### Поиск \{#search\}

```python
# Pandas and DataStore - identical
df['name'].str.contains('John')
df['name'].str.startswith('A')
df['name'].str.endswith('son')
```


### Замена \{#replace\}

```python
# Pandas and DataStore - identical
df['text'].str.replace('old', 'new')
df['text'].str.replace(r'\d+', '', regex=True)  # Remove digits
```


### Разделение \{#split\}

```python
# Pandas and DataStore - identical
df['name'].str.split(' ')
df['name'].str.split(' ', expand=True)
```


### Продолжительность \{#length\}

```python
# Pandas and DataStore - identical
df['name'].str.len()
```

***


## Операции с датой и временем \{#datetime\}

### Выделение компонентов \{#extract-components\}

```python
# Pandas and DataStore - identical
df['date'].dt.year
df['date'].dt.month
df['date'].dt.day
df['date'].dt.dayofweek
df['date'].dt.hour
```


### Форматирование \{#formatting\}

```python
# Pandas and DataStore - identical
df['date'].dt.strftime('%Y-%m-%d')
```

***


## Пропущенные данные \{#missing\}

### Проверка пропущенных значений \{#check-missing\}

```python
# Pandas and DataStore - identical
df['col'].isna()
df['col'].notna()
df.isna().sum()
```


### Удаление пропущенных значений \{#drop-missing\}

```python
# Pandas and DataStore - identical
df.dropna()
df.dropna(subset=['col1', 'col2'])
```


### Заполнение пропущенных значений \{#fill-missing\}

```python
# Pandas and DataStore - identical
df.fillna(0)
df.fillna({'col1': 0, 'col2': 'Unknown'})
df.fillna(method='ffill')
```

***


## Создание новых столбцов \{#new-columns\}

### Простое присваивание \{#simple-assignment\}

```python
# Pandas and DataStore - identical
df['total'] = df['price'] * df['quantity']
df['age_group'] = df['age'] // 10 * 10
```


### Использование функции assign() \{#using-assign\}

```python
# Pandas and DataStore - identical
df = df.assign(
    total=df['price'] * df['quantity'],
    is_adult=df['age'] >= 18
)
```


### Условные выражения (where/mask) \{#conditional-where-mask\}

```python
# Pandas and DataStore - identical
df['status'] = df['age'].where(df['age'] >= 18, 'minor')
```


### apply() для пользовательской логики \{#apply-for-custom-logic\}

```python
# Works, but triggers pandas execution
df['category'] = df['amount'].apply(lambda x: 'high' if x > 1000 else 'low')

# DataStore alternative (stays lazy)
df['category'] = (
    df.when(df['amount'] > 1000, 'high')
      .otherwise('low')
)
```

***


## Изменение структуры данных \{#reshaping\}

### Сводная таблица \{#pivot-table\}

```python
# Pandas and DataStore - identical
df.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)
```


### Melt (unpivot, обратное преобразование) \{#melt-unpivot\}

```python
# Pandas and DataStore - identical
df.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)
```


### Развёртка (explode) \{#explode\}

```python
# Pandas and DataStore - identical
df.explode('tags')  # Expand array column
```

***


## Оконные функции \{#window\}

### Скользящие окна \{#rolling\}

```python
# Pandas and DataStore - identical
df['rolling_avg'] = df['price'].rolling(window=7).mean()
df['rolling_sum'] = df['amount'].rolling(window=30).sum()
```


### Расширяющиеся окна \{#expanding\}

```python
# Pandas and DataStore - identical
df['cumsum'] = df['amount'].expanding().sum()
df['cummax'] = df['amount'].expanding().max()
```


### Смещение \{#shift\}

```python
# Pandas and DataStore - identical
df['prev_value'] = df['value'].shift(1)   # Lag
df['next_value'] = df['value'].shift(-1)  # Lead
```


### Разница \{#diff\}

```python
# Pandas and DataStore - identical
df['change'] = df['value'].diff()
df['pct_change'] = df['value'].pct_change()
```

***


## Результат \{#output\}

### В CSV \{#to-csv\}

```python
# Pandas and DataStore - identical
df.to_csv("output.csv", index=False)
```


### В Parquet \{#to-parquet\}

```python
# Pandas and DataStore - identical
df.to_parquet("output.parquet")
```


### В DataFrame библиотеки pandas \{#to-pandas-dataframe\}

```python
# DataStore specific
pandas_df = ds.to_df()
pandas_df = ds.to_pandas()
```

***


## Дополнительные возможности DataStore \{#extras\}

### Просмотр SQL \{#view-sql\}

```python
# DataStore only
print(ds.to_sql())
```


### План выполнения \{#explain-plan\}

```python
# DataStore only
ds.explain()
```


### Функции ClickHouse \{#clickhouse-functions\}

```python
# DataStore only - extra accessors
df['domain'] = df['url'].url.domain()
df['json_value'] = df['data'].json.get_string('key')
df['ip_valid'] = df['ip'].ip.is_ipv4_string()
```


### Универсальный URI \{#universal-uri\}

```python
# DataStore only - read from anywhere
ds = DataStore.uri("s3://bucket/data.parquet")
ds = DataStore.uri("mysql://user:pass@host/db/table")
```
