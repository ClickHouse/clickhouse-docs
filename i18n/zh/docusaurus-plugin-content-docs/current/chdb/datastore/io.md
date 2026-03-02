---
title: 'DataStore I/O 操作'
sidebar_label: 'I/O 操作'
slug: /chdb/datastore/io
description: '使用 DataStore 读写数据——所有支持的格式和目标'
keywords: ['chdb', 'datastore', 'io', 'read', 'write', 'csv', 'parquet', 'json', 'excel']
doc_type: 'reference'
---

# DataStore I/O 操作 \{#datastore-io-operations\}

DataStore 支持以多种文件格式和数据源进行数据读写。

## 读取数据 \{#reading\}

### CSV 文件 \{#read-csv\}

```python
read_csv(filepath_or_buffer, sep=',', header='infer', names=None, 
         usecols=None, dtype=None, nrows=None, skiprows=None,
         compression=None, encoding=None, **kwargs)
```

**示例：**

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


### Parquet 文件 \{#read-parquet\}

适用于大规模数据集的列式格式，提供更好的压缩率。

```python
read_parquet(path, columns=None, **kwargs)
```

**示例：**

```python
# Basic Parquet read
ds = pd.read_parquet("data.parquet")

# Read specific columns only (efficient - only reads needed data)
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2', 'col3'])

# From S3
ds = pd.read_parquet("s3://bucket/data.parquet")
```


### JSON 文件 \{#read-json\}

```python
read_json(path_or_buf, orient=None, lines=False, **kwargs)
```

**示例：**

```python
# Standard JSON
ds = pd.read_json("data.json")

# JSON Lines (newline-delimited)
ds = pd.read_json("data.jsonl", lines=True)

# JSON with specific orientation
ds = pd.read_json("data.json", orient='records')
```


### Excel 文件 \{#read-excel\}

```python
read_excel(io, sheet_name=0, header=0, names=None, **kwargs)
```

**示例：**

```python
# Read first sheet
ds = pd.read_excel("data.xlsx")

# Read specific sheet
ds = pd.read_excel("data.xlsx", sheet_name="Sheet1")
ds = pd.read_excel("data.xlsx", sheet_name=2)  # Third sheet

# Read multiple sheets (returns dict)
sheets = pd.read_excel("data.xlsx", sheet_name=['Sheet1', 'Sheet2'])
```


### SQL 数据库 \{#read-sql\}

```python
read_sql(sql, con, **kwargs)
```

**示例：**

```python
# Read from SQL query
ds = pd.read_sql("SELECT * FROM users", connection)
ds = pd.read_sql("SELECT * FROM orders WHERE date > '2024-01-01'", connection)
```


### 其他格式 \{#read-other\}

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


## 写入数据 \{#writing\}

### to_csv \{#to-csv\}

导出为 CSV 格式。

```python
to_csv(path_or_buf=None, sep=',', na_rep='', header=True, 
       index=True, mode='w', compression=None, **kwargs)
```

**示例：**

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

导出为 Parquet 格式（推荐用于大数据量场景）。

```python
to_parquet(path, engine='pyarrow', compression='snappy', **kwargs)
```

**示例：**

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

导出为 JSON 格式。

```python
to_json(path_or_buf=None, orient='records', lines=False, **kwargs)
```

**示例：**

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

导出为 Excel 格式。

```python
to_excel(excel_writer, sheet_name='Sheet1', index=True, **kwargs)
```

**示例：**

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

导出到 SQL 数据库或生成 SQL 字符串。

```python
to_sql(name=None, con=None, schema=None, if_exists='fail', **kwargs)
```

**示例：**

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


### 其他导出方式 \{#to-other\}

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


## 文件格式对比 \{#format-comparison\}

| 格式 | 读取速度 | 写入速度 | 文件大小 | 模式 | 最佳用途 |
|--------|------------|-------------|-----------|--------|----------|
| **Parquet** | 快速 | 快速 | 小 | 是 | 大型数据集、分析 |
| **CSV** | 中等 | 快速 | 大 | 否 | 兼容性、简单数据 |
| **JSON** | 较慢 | 中等 | 大 | 部分 | API、嵌套数据 |
| **Excel** | 较慢 | 较慢 | 中等 | 部分 | 与非技术用户共享 |
| **Feather** | 非常快 | 非常快 | 中等 | 是 | 进程间通信、pandas |

### 建议 \{#recommendations\}

1. **用于分析型工作负载：** 使用 Parquet
   - 列式格式允许仅读取所需列
   - 出色的压缩效果
   - 保留数据类型

2. **用于数据交换：** 使用 CSV 或 JSON
   - 通用兼容性
   - 便于阅读

3. **用于与 pandas 的互操作：** 使用 Feather 或 Arrow
   - 高效的序列化
   - 保留数据类型

---

## 压缩支持 \{#compression\}

### 读取压缩文件 \{#read-compressed\}

```python
# Auto-detect from extension
ds = pd.read_csv("data.csv.gz")
ds = pd.read_csv("data.csv.bz2")
ds = pd.read_csv("data.csv.xz")
ds = pd.read_csv("data.csv.zst")

# Explicit compression
ds = pd.read_csv("data.csv", compression='gzip')
```


### 写入压缩文件 \{#write-compressed\}

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


### 压缩选项 \{#compression-options\}

| 压缩方式 | 速度 | 压缩比 | 适用场景 |
|-------------|-------|-------|----------|
| `snappy` | 非常快 | 低 | Parquet 默认压缩格式 |
| `lz4` | 非常快 | 低 | 速度优先 |
| `gzip` | 中等 | 高 | 兼容性 |
| `zstd` | 快 | 很高 | 综合表现最佳 |
| `bz2` | 慢 | 很高 | 最大压缩率 |

---

## 流式 I/O \{#streaming\}

对于无法全部加载到内存中的超大文件：

### 分块读取 \{#chunked-read\}

```python
# Read in chunks
for chunk in pd.read_csv("large.csv", chunksize=100000):
    # Process each chunk
    process(chunk)

# Using iterator
reader = pd.read_csv("large.csv", iterator=True)
chunk = reader.get_chunk(10000)
```


### 使用 ClickHouse Streaming \{#clickhouse-streaming\}

```python
from chdb.datastore import DataStore

# Stream from file without loading all into memory
ds = DataStore.from_file("huge.parquet")

# Operations are lazy - only computes what's needed
result = ds.filter(ds['amount'] > 1000).head(100)
```

***


## 远程数据源 \{#remote\}

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

有关云存储选项，请参见 [Factory 方法](factory-methods.md)。

---

## 最佳实践 \{#best-practices\}

### 1. 大文件使用 Parquet 格式 \{#use-parquet-for-large-files\}

```python
# Convert CSV to Parquet for better performance
ds = pd.read_csv("large.csv")
ds.to_parquet("large.parquet")

# Future reads are much faster
ds = pd.read_parquet("large.parquet")
```


### 2. 仅选择所需的列 \{#select-only-needed-columns\}

```python
# Efficient - only reads col1 and col2
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2'])

# Inefficient - reads all columns then filters
ds = pd.read_parquet("data.parquet")[['col1', 'col2']]
```


### 3. 启用压缩 \{#use-compression\}

```python
# Smaller file size, usually faster due to less I/O
ds.to_parquet("output.parquet", compression='zstd')
```


### 4. 批量写入 \{#batch-writes\}

```python
# Write once, not in a loop
result = process_all_data(ds)
result.to_parquet("output.parquet")

# NOT this (inefficient)
for chunk in chunks:
    chunk.to_parquet(f"output_{i}.parquet")
```
