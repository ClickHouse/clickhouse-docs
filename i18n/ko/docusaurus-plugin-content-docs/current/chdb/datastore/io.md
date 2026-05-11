---
title: 'DataStore I/O 작업'
sidebar_label: 'I/O 작업'
slug: /chdb/datastore/io
description: 'DataStore를 사용한 데이터 읽기 및 쓰기 - 지원되는 모든 형식과 대상'
keywords: ['chdb', 'datastore', 'io', 'read', 'write', 'csv', 'parquet', 'json', 'excel']
doc_type: 'reference'
---

# DataStore I/O 작업 \{#datastore-io-operations\}

DataStore는 다양한 파일 형식과 데이터 소스에서 데이터를 읽고 쓰는 작업을 지원합니다.

## 데이터 읽기 \{#reading\}

### CSV 파일 \{#read-csv\}

```python
read_csv(filepath_or_buffer, sep=',', header='infer', names=None, 
         usecols=None, dtype=None, nrows=None, skiprows=None,
         compression=None, encoding=None, **kwargs)
```

**예제:**

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


### Parquet Files \{#read-parquet\}

대규모 데이터셋에 적합합니다 — 더 나은 압축을 제공하는 컬럼형 포맷입니다.

```python
read_parquet(path, columns=None, **kwargs)
```

**예시:**

```python
# Basic Parquet read
ds = pd.read_parquet("data.parquet")

# Read specific columns only (efficient - only reads needed data)
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2', 'col3'])

# From S3
ds = pd.read_parquet("s3://bucket/data.parquet")
```


### JSON 파일 \{#read-json\}

```python
read_json(path_or_buf, orient=None, lines=False, **kwargs)
```

**예제:**

```python
# Standard JSON
ds = pd.read_json("data.json")

# JSON Lines (newline-delimited)
ds = pd.read_json("data.jsonl", lines=True)

# JSON with specific orientation
ds = pd.read_json("data.json", orient='records')
```


### Excel 파일 \{#read-excel\}

```python
read_excel(io, sheet_name=0, header=0, names=None, **kwargs)
```

**예제:**

```python
# Read first sheet
ds = pd.read_excel("data.xlsx")

# Read specific sheet
ds = pd.read_excel("data.xlsx", sheet_name="Sheet1")
ds = pd.read_excel("data.xlsx", sheet_name=2)  # Third sheet

# Read multiple sheets (returns dict)
sheets = pd.read_excel("data.xlsx", sheet_name=['Sheet1', 'Sheet2'])
```


### SQL 데이터베이스 \{#read-sql\}

```python
read_sql(sql, con, **kwargs)
```

**예시:**

```python
# Read from SQL query
ds = pd.read_sql("SELECT * FROM users", connection)
ds = pd.read_sql("SELECT * FROM orders WHERE date > '2024-01-01'", connection)
```


### 기타 포맷 \{#read-other\}

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


## 데이터 기록 \{#writing\}

### to_csv \{#to-csv\}

CSV 형식으로 데이터를 내보냅니다.

```python
to_csv(path_or_buf=None, sep=',', na_rep='', header=True, 
       index=True, mode='w', compression=None, **kwargs)
```

**예제:**

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

Parquet 형식으로 데이터를 내보냅니다(대용량 데이터에 권장됩니다).

```python
to_parquet(path, engine='pyarrow', compression='snappy', **kwargs)
```

**예제:**

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

데이터를 JSON 형식으로 내보냅니다.

```python
to_json(path_or_buf=None, orient='records', lines=False, **kwargs)
```

**예제:**

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

데이터를 Excel 형식으로 내보냅니다.

```python
to_excel(excel_writer, sheet_name='Sheet1', index=True, **kwargs)
```

**예:**

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

데이터를 SQL 데이터베이스로 내보내거나 SQL 문자열을 생성합니다.

```python
to_sql(name=None, con=None, schema=None, if_exists='fail', **kwargs)
```

**예제:**

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


### 기타 내보내기 방법 \{#to-other\}

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


## 파일 형식 비교 \{#format-comparison\}

| 형식 | 읽기 속도 | 쓰기 속도 | 파일 크기 | 스키마 | 적합한 용도 |
|--------|------------|-------------|-----------|--------|----------|
| **Parquet** | 빠름 | 빠름 | 작음 | 있음 | 대규모 데이터 세트, 분석 작업 |
| **CSV** | 보통 | 빠름 | 큼 | 없음 | 호환성, 단순한 데이터 |
| **JSON** | 느림 | 보통 | 큼 | 부분적 | API, 중첩 데이터 |
| **Excel** | 느림 | 느림 | 보통 | 부분적 | 비기술 사용자와의 공유 |
| **Feather** | 매우 빠름 | 매우 빠름 | 보통 | 있음 | 프로세스 간 데이터 교환, pandas |

### 권장 사항 \{#recommendations\}

1. **분석 워크로드용:** Parquet 사용
   - 컬럼형 포맷으로 필요한 컬럼만 읽을 수 있음
   - 우수한 압축률
   - 데이터 타입 보존

2. **데이터 교환용:** CSV 또는 JSON 사용
   - 폭넓은 호환성
   - 사람이 읽기 쉬움

3. **pandas와의 상호 운용성용:** Feather 또는 Arrow 사용
   - 가장 빠른 직렬화
   - 타입 보존
---

## 압축 지원 \{#compression\}

### 압축된 파일 읽기 \{#read-compressed\}

```python
# Auto-detect from extension
ds = pd.read_csv("data.csv.gz")
ds = pd.read_csv("data.csv.bz2")
ds = pd.read_csv("data.csv.xz")
ds = pd.read_csv("data.csv.zst")

# Explicit compression
ds = pd.read_csv("data.csv", compression='gzip')
```


### 압축 파일 쓰기 \{#write-compressed\}

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


### 압축 옵션 \{#compression-options\}

| 압축 방식 | 속도 | 압축률 | 사용 사례 |
|-------------|-------|-------|----------|
| `snappy` | 매우 빠름 | 낮음 | Parquet의 기본 압축 방식 |
| `lz4` | 매우 빠름 | 낮음 | 속도 우선 |
| `gzip` | 보통 | 높음 | 호환성 |
| `zstd` | 빠름 | 매우 높음 | 최적의 균형 |
| `bz2` | 느림 | 매우 높음 | 최대 압축 |
---

## 스트리밍 I/O \{#streaming\}

메모리에 한 번에 올릴 수 없는 매우 큰 파일의 경우:

### 청크 단위 읽기 \{#chunked-read\}

```python
# Read in chunks
for chunk in pd.read_csv("large.csv", chunksize=100000):
    # Process each chunk
    process(chunk)

# Using iterator
reader = pd.read_csv("large.csv", iterator=True)
chunk = reader.get_chunk(10000)
```


### ClickHouse Streaming 사용 \{#clickhouse-streaming\}

```python
from chdb.datastore import DataStore

# Stream from file without loading all into memory
ds = DataStore.from_file("huge.parquet")

# Operations are lazy - only computes what's needed
result = ds.filter(ds['amount'] > 1000).head(100)
```

***


## 원격 데이터 소스 \{#remote\}

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

Cloud 스토리지 옵션에 대해서는 [Factory Methods](factory-methods.md)를 참조하십시오.

---

## 모범 사례 \{#best-practices\}

### 1. 대용량 파일에는 Parquet 형식을 사용하십시오 \{#use-parquet-for-large-files\}

```python
# Convert CSV to Parquet for better performance
ds = pd.read_csv("large.csv")
ds.to_parquet("large.parquet")

# Future reads are much faster
ds = pd.read_parquet("large.parquet")
```


### 2. 필요한 컬럼만 선택 \{#select-only-needed-columns\}

```python
# Efficient - only reads col1 and col2
ds = pd.read_parquet("data.parquet", columns=['col1', 'col2'])

# Inefficient - reads all columns then filters
ds = pd.read_parquet("data.parquet")[['col1', 'col2']]
```


### 3. 압축 사용 \{#use-compression\}

```python
# Smaller file size, usually faster due to less I/O
ds.to_parquet("output.parquet", compression='zstd')
```


### 4. 배치 쓰기 \{#batch-writes\}

```python
# Write once, not in a loop
result = process_all_data(ds)
result.to_parquet("output.parquet")

# NOT this (inefficient)
for chunk in chunks:
    chunk.to_parquet(f"output_{i}.parquet")
```
