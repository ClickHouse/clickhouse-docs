---
title: 'Операции ввода-вывода в DataStore'
sidebar_label: 'Операции ввода-вывода'
slug: /chdb/datastore/io
description: 'Чтение и запись данных с помощью DataStore — все поддерживаемые форматы и направления'
keywords: ['chdb', 'datastore', 'io', 'read', 'write', 'csv', 'parquet', 'json', 'excel']
doc_type: 'reference'
---

# Операции ввода-вывода в DataStore \{#datastore-io-operations\}

DataStore поддерживает чтение из и запись в различные файловые форматы и источники данных.

## Чтение данных \{#reading\}

### CSV-файлы \{#read-csv\}

```python
read_csv(filepath_or_buffer, sep=',', header='infer', names=None, 
         usecols=None, dtype=None, nrows=None, skiprows=None,
         compression=None, encoding=None, **kwargs)
```

**Примеры:**

```python
from chdb import datastore as pd

# Basic CSV read
ds = pd.read_csv("data.csv")

# With options
ds = pd.read_csv(
    "data.csv",
    sep=";",                    # Custom delimiter
    header=0,                   # Header row index
    names=['a', 'b', 'c'],      # Custom column names
    usecols=['a', 'b'],         # Only read specific columns
    dtype={'a': 'Int64'},       # Specify dtypes
    nrows=1000,                 # Read only first 1000 rows
    skiprows=1,                 # Skip first row
    compression='gzip',         # Compressed file
    encoding='utf-8'            # Encoding
)

# From URL
ds = pd.read_csv("https://example.com/data.csv")
```


### Файлы Parquet \{#read-parquet\}

Рекомендуются для больших наборов данных: столбцовый формат с более эффективным сжатием.

```python
read_parquet(path, columns=None, **kwargs)
```

**Примеры:**

```python
# Basic Parquet read
ds = pd.read_parquet("data.parquet")

# Read specific columns only (efficient - only reads needed data)
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2', 'col3'])

# From S3
ds = pd.read_parquet("s3://bucket/data.parquet")
```


### JSON-файлы \{#read-json\}

```python
read_json(path_or_buf, orient=None, lines=False, **kwargs)
```

**Примеры:**

```python
# Standard JSON
ds = pd.read_json("data.json")

# JSON Lines (newline-delimited)
ds = pd.read_json("data.jsonl", lines=True)

# JSON with specific orientation
ds = pd.read_json("data.json", orient='records')
```


### Файлы Excel \{#read-excel\}

```python
read_excel(io, sheet_name=0, header=0, names=None, **kwargs)
```

**Примеры:**

```python
# Read first sheet
ds = pd.read_excel("data.xlsx")

# Read specific sheet
ds = pd.read_excel("data.xlsx", sheet_name="Sheet1")
ds = pd.read_excel("data.xlsx", sheet_name=2)  # Third sheet

# Read multiple sheets (returns dict)
sheets = pd.read_excel("data.xlsx", sheet_name=['Sheet1', 'Sheet2'])
```


### Базы данных SQL \{#read-sql\}

```python
read_sql(sql, con, **kwargs)
```

**Примеры:**

```python
# Read from SQL query
ds = pd.read_sql("SELECT * FROM users", connection)
ds = pd.read_sql("SELECT * FROM orders WHERE date > '2024-01-01'", connection)
```


### Прочие форматы \{#read-other\}

```python
# Feather (Arrow)
ds = pd.read_feather("data.feather")

# ORC
ds = pd.read_orc("data.orc")

# Pickle
ds = pd.read_pickle("data.pkl")

# Fixed-width formatted
ds = pd.read_fwf("data.txt", widths=[10, 20, 15])

# HTML tables
ds = pd.read_html("https://example.com/table.html")[0]
```

***


## Запись данных \{#writing\}

### to_csv \{#to-csv\}

Экспорт в формат CSV.

```python
to_csv(path_or_buf=None, sep=',', na_rep='', header=True, 
       index=True, mode='w', compression=None, **kwargs)
```

**Примеры:**

```python
ds = pd.read_parquet("data.parquet")

# Basic export
ds.to_csv("output.csv")

# With options
ds.to_csv(
    "output.csv",
    sep=";",                    # Custom delimiter
    index=False,                # Don't include index
    header=True,                # Include header
    na_rep='NULL',              # Represent NaN as 'NULL'
    compression='gzip'          # Compress output
)

# To string
csv_string = ds.to_csv()
```


### to_parquet \{#to-parquet\}

Экспорт в формат Parquet (рекомендуется для больших объёмов данных).

```python
to_parquet(path, engine='pyarrow', compression='snappy', **kwargs)
```

**Примеры:**

```python
# Basic export
ds.to_parquet("output.parquet")

# With compression options
ds.to_parquet("output.parquet", compression='gzip')
ds.to_parquet("output.parquet", compression='zstd')

# Partitioned output
ds.to_parquet(
    "output/",
    partition_cols=['year', 'month']
)
```


### to_json \{#to-json\}

Экспорт в формат JSON.

```python
to_json(path_or_buf=None, orient='records', lines=False, **kwargs)
```

**Примеры:**

```python
# Standard JSON (array of records)
ds.to_json("output.json", orient='records')

# JSON Lines (one JSON object per line)
ds.to_json("output.jsonl", lines=True)

# Different orientations
ds.to_json("output.json", orient='split')    # {columns, data, index}
ds.to_json("output.json", orient='records')  # [{col: val}, ...]
ds.to_json("output.json", orient='columns')  # {col: {idx: val}}

# To string
json_string = ds.to_json()
```


### to_excel \{#to-excel\}

Экспорт в формат Excel.

```python
to_excel(excel_writer, sheet_name='Sheet1', index=True, **kwargs)
```

**Примеры:**

```python
# Single sheet
ds.to_excel("output.xlsx")
ds.to_excel("output.xlsx", sheet_name="Data", index=False)

# Multiple sheets
with pd.ExcelWriter("output.xlsx") as writer:
    ds1.to_excel(writer, sheet_name="Sales")
    ds2.to_excel(writer, sheet_name="Inventory")
```


### to_sql \{#to-sql-method\}

Экспорт в SQL-базу данных или генерация SQL-строки.

```python
to_sql(name=None, con=None, schema=None, if_exists='fail', **kwargs)
```

**Примеры:**

```python
# Generate SQL query (no execution)
sql = ds.to_sql()
print(sql)
# SELECT ...
# FROM ...
# WHERE ...

# Write to database
ds.to_sql("table_name", connection, if_exists='replace')
```


### Другие способы экспорта \{#to-other\}

```python
# To pandas DataFrame
df = ds.to_df()
df = ds.to_pandas()

# To Arrow Table
table = ds.to_arrow()

# To NumPy array
arr = ds.to_numpy()

# To dictionary
d = ds.to_dict()
d = ds.to_dict(orient='records')  # List of dicts
d = ds.to_dict(orient='list')     # Dict of lists

# To records (list of tuples)
records = ds.to_records()

# To string
s = ds.to_string()
s = ds.to_string(max_rows=100)

# To Markdown
md = ds.to_markdown()

# To HTML
html = ds.to_html()

# To LaTeX
latex = ds.to_latex()

# To clipboard
ds.to_clipboard()

# To pickle
ds.to_pickle("output.pkl")

# To feather
ds.to_feather("output.feather")
```

***


## Сравнение форматов файлов \{#format-comparison\}

| Формат | Скорость чтения | Скорость записи | Размер файла | Схема | Лучше всего подходит для |
|--------|-----------------|-----------------|-------------|-------|--------------------------|
| **Parquet** | Быстро | Быстро | Небольшой | Да | Крупные наборы данных, аналитика |
| **CSV** | Средне | Быстро | Большой | Нет | Совместимость, простые данные |
| **JSON** | Медленно | Средне | Большой | Частично | API, вложенные данные |
| **Excel** | Медленно | Медленно | Средний | Частично | Совместное использование с пользователями без технической подготовки |
| **Feather** | Очень быстро | Очень быстро | Средний | Да | Межпроцессный обмен, pandas |

### Рекомендации \{#recommendations\}

1. **Для аналитических нагрузок:** используйте Parquet
   - Столбцовый формат позволяет читать только нужные столбцы
   - Отличное сжатие
   - Сохраняет типы данных

2. **Для обмена данными:** используйте CSV или JSON
   - Универсальная совместимость
   - Человекочитаемый формат

3. **Для взаимодействия с pandas:** используйте Feather или Arrow
   - Самая быстрая сериализация
   - Сохранение типов

---

## Поддержка сжатия \{#compression\}

### Чтение сжатых файлов \{#read-compressed\}

```python
# Auto-detect from extension
ds = pd.read_csv("data.csv.gz")
ds = pd.read_csv("data.csv.bz2")
ds = pd.read_csv("data.csv.xz")
ds = pd.read_csv("data.csv.zst")

# Explicit compression
ds = pd.read_csv("data.csv", compression='gzip')
```


### Запись в сжатые файлы \{#write-compressed\}

```python
# CSV with compression
ds.to_csv("output.csv.gz", compression='gzip')
ds.to_csv("output.csv.bz2", compression='bz2')

# Parquet (always compressed)
ds.to_parquet("output.parquet", compression='snappy')  # Default
ds.to_parquet("output.parquet", compression='gzip')
ds.to_parquet("output.parquet", compression='zstd')    # Best ratio
ds.to_parquet("output.parquet", compression='lz4')     # Fastest
```


### Параметры сжатия \{#compression-options\}

| Сжатие | Скорость | Степень сжатия | Типичный сценарий |
|-------------|-------|---------------|-------------------|
| `snappy` | Очень высокая | Низкая | По умолчанию для Parquet |
| `lz4` | Очень высокая | Низкая | Приоритет скорости |
| `gzip` | Средняя | Высокая | Совместимость |
| `zstd` | Высокая | Очень высокая | Оптимальный баланс |
| `bz2` | Низкая | Очень высокая | Максимальное сжатие |

---

## Потоковый ввод-вывод \{#streaming\}

Для очень больших файлов, которые не помещаются в оперативную память:

### Чтение фрагментами \{#chunked-read\}

```python
# Read in chunks
for chunk in pd.read_csv("large.csv", chunksize=100000):
    # Process each chunk
    process(chunk)

# Using iterator
reader = pd.read_csv("large.csv", iterator=True)
chunk = reader.get_chunk(10000)
```


### Работа с ClickHouse Streaming \{#clickhouse-streaming\}

```python
from chdb.datastore import DataStore

# Stream from file without loading all into memory
ds = DataStore.from_file("huge.parquet")

# Operations are lazy - only computes what's needed
result = ds.filter(ds['amount'] > 1000).head(100)
```

***


## Удалённые источники данных \{#remote\}

### HTTP/HTTPS \{#http\}

```python
# Read from URL
ds = pd.read_csv("https://example.com/data.csv")
ds = pd.read_parquet("https://example.com/data.parquet")
```


### S3 \{#s3\}

```python
from chdb.datastore import DataStore

# Anonymous access
ds = DataStore.uri("s3://bucket/data.parquet?nosign=true")

# With credentials
ds = DataStore.from_s3(
    "s3://bucket/data.parquet",
    access_key_id="KEY",
    secret_access_key="SECRET"
)
```


### GCS, Azure, HDFS \{#cloud\}

См. раздел [Factory Methods](factory-methods.md) для вариантов облачных хранилищ.

---

## Рекомендации по использованию \{#best-practices\}

### 1. Используйте формат Parquet для больших файлов \{#use-parquet-for-large-files\}

```python
# Convert CSV to Parquet for better performance
ds = pd.read_csv("large.csv")
ds.to_parquet("large.parquet")

# Future reads are much faster
ds = pd.read_parquet("large.parquet")
```


### 2. Выбирайте только нужные столбцы \{#select-only-needed-columns\}

```python
# Efficient - only reads col1 and col2
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2'])

# Inefficient - reads all columns then filters
ds = pd.read_parquet("data.parquet")[['col1', 'col2']]
```


### 3. Используйте сжатие \{#use-compression\}

```python
# Smaller file size, usually faster due to less I/O
ds.to_parquet("output.parquet", compression='zstd')
```


### 4. Пакетная запись \{#batch-writes\}

```python
# Write once, not in a loop
result = process_all_data(ds)
result.to_parquet("output.parquet")

# NOT this (inefficient)
for chunk in chunks:
    chunk.to_parquet(f"output_{i}.parquet")
```
