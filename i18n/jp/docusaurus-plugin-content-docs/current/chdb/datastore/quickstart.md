---
title: 'DataStore クイックスタート'
sidebar_label: 'クイックスタート'
slug: /chdb/datastore/quickstart
description: 'DataStore を使い始める — インストール、pandas からの 1 行での移行、基本的な使い方'
keywords: ['chdb', 'datastore', 'quickstart', 'installation', 'pandas', 'migration']
doc_type: 'guide'
---

# DataStore クイックスタート \{#datastore-quickstart\}

数分で DataStore を使い始められます。このガイドでは、インストール手順、pandas からの移行、および基本的な利用パターンについて説明します。

## インストール \{#installation\}

pip を使って chDB をインストールします：

```bash
pip install "chdb>=4.0"
```

オプションの依存関係：

```bash
# For pandas DataFrame support
pip install "chdb[pandas]>=4.0"

# For PyArrow support
pip install "chdb[arrow]>=4.0"

# All optional dependencies
pip install "chdb[all]>=4.0"
```


### インストールの確認 \{#verify\}

```python
import chdb
print(chdb.__version__)  # Should print 4.x.x or higher

from chdb import datastore as pd
print("DataStore ready!")
```


## Pandas からの 1 行での移行 \{#migration\}

DataStore の利用を開始する最も簡単な方法は、`import` 文を 1 行書き換えることです。

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

以上で完了です！既存の pandas コードは今後 DataStore を利用し、SQL 最適化のメリットを享受できるようになります。


### 移行の例 \{#migration-example\}

```python
# Original pandas code
import pandas as pd

df = pd.read_csv("employees.csv")
result = (df[df['salary'] > 50000]
          .groupby('department')['salary']
          .agg(['mean', 'count'])
          .sort_values('mean', ascending=False))
print(result)

# DataStore version - just change the import!
from chdb import datastore as pd

df = pd.read_csv("employees.csv")
result = (df[df['salary'] > 50000]
          .groupby('department')['salary']
          .agg(['mean', 'count'])
          .sort_values('mean', ascending=False))
print(result)  # Same result, faster execution!
```


## 基本的な使い方 \{#basic-usage\}

### DataStore の作成 \{#creating\}

```python
from chdb import datastore as pd

# From a dictionary
ds = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'NYC']
})

# From a pandas DataFrame
import pandas
pdf = pandas.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
ds = pd.DataFrame(pdf)

# From a CSV file
ds = pd.read_csv("data.csv")

# From a Parquet file (recommended for large datasets)
ds = pd.read_parquet("data.parquet")
```


### データの絞り込み \{#filtering\}

```python
from chdb import datastore as pd

ds = pd.read_csv("employees.csv")

# Single condition
senior = ds[ds['age'] > 30]

# Multiple conditions (AND)
senior_nyc = ds[(ds['age'] > 30) & (ds['city'] == 'NYC')]

# Multiple conditions (OR)
young_or_senior = ds[(ds['age'] < 25) | (ds['age'] > 50)]

# Using filter method (SQL-style)
result = ds.filter(ds['salary'] > 50000)
```


### カラムの指定 \{#selecting\}

```python
# Pandas style
subset = ds[['name', 'age']]

# SQL style
subset = ds.select('name', 'age')
```


### 並べ替え \{#sorting\}

```python
# Pandas style
sorted_ds = ds.sort_values('salary', ascending=False)

# SQL style
sorted_ds = ds.sort('salary', ascending=False)
```


### グループ化と集約 \{#groupby\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# Group by single column
by_region = ds.groupby('region')['amount'].sum()

# Group by multiple columns
by_region_product = ds.groupby(['region', 'product']).agg({
    'amount': ['sum', 'mean'],
    'quantity': 'sum'
})

# Multiple aggregations
summary = ds.groupby('category').agg({
    'price': ['min', 'max', 'mean'],
    'quantity': 'sum'
})
```


### DataStore 間の結合 \{#joining\}

```python
from chdb import datastore as pd

employees = pd.read_csv("employees.csv")
departments = pd.read_csv("departments.csv")

# Inner join
result = employees.join(departments, on='dept_id', how='inner')

# Left join
result = employees.join(departments, on='dept_id', how='left')

# Using merge (pandas style)
result = pd.merge(employees, departments, on='dept_id')
```


## 結果の取得 \{#results\}

DataStore は遅延評価を採用しており、結果が必要になるまで操作は実行されません。

### 実行を開始する \{#execution-triggers\}

```python
# Automatic triggers
print(ds)           # Displaying results
len(ds)             # Getting row count
ds.columns          # Accessing properties
list(ds)            # Converting to list

# Explicit conversion
df = ds.to_df()     # Convert to pandas DataFrame
df = ds.to_pandas() # Same as to_df()
```


### 生成された SQL を確認する \{#view-sql\}

```python
# See what SQL DataStore will execute
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})
print(query.to_sql())
```

出力結果:

```sql
SELECT city, AVG(salary) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE age > 25
GROUP BY city
```


## さまざまなデータソースの利用 \{#data-sources\}

### ローカルファイル \{#local-files\}

```python
from chdb import datastore as pd

# CSV
ds = pd.read_csv("data.csv")

# Parquet (best performance)
ds = pd.read_parquet("data.parquet")

# JSON
ds = pd.read_json("data.json")
```


### Cloud ストレージ \{#cloud-storage\}

```python
from chdb.datastore import DataStore

# S3 (anonymous)
ds = DataStore.uri("s3://bucket/data.parquet?nosign=true")

# S3 (with credentials)
ds = DataStore.from_s3(
    "s3://bucket/data.parquet",
    access_key_id="KEY",
    secret_access_key="SECRET"
)

# HTTP/HTTPS
ds = DataStore.uri("https://example.com/data.csv")
```


### データベース \{#databases\}

```python
from chdb.datastore import DataStore

# MySQL
ds = DataStore.from_mysql(
    host="localhost",
    database="mydb",
    table="users",
    user="root",
    password="pass"
)

# PostgreSQL
ds = DataStore.from_postgresql(
    host="localhost",
    database="mydb",
    table="users",
    user="postgres",
    password="pass"
)

# Using URI
ds = DataStore.uri("mysql://user:pass@localhost:3306/mydb/users")
```


## 文字列および DateTime の操作 \{#accessors\}

### 文字列操作 \{#string-ops\}

```python
# All pandas .str methods work
ds['name_upper'] = ds['name'].str.upper()
ds['name_len'] = ds['name'].str.len()
ds['has_a'] = ds['name'].str.contains('a')
```


### DateTime の操作 \{#datetime-ops\}

```python
# All pandas .dt methods work
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### ClickHouse の拡張機能 \{#extensions\}

```python
# URL parsing (not available in pandas!)
ds['domain'] = ds['url'].url.domain()

# JSON extraction
ds['user_name'] = ds['json_data'].json.get_string('name')

# IP address operations
ds['is_ipv4'] = ds['ip_addr'].ip.is_ipv4_string()
```


## ベストプラクティス \{#best-practices\}

### 1. 大きなファイルには Parquet 形式を使用する \{#use-parquet-for-large-files\}

```python
# CSV - slower, reads entire file
ds = pd.read_csv("large_data.csv")

# Parquet - faster, columnar format, reads only needed columns
ds = pd.read_parquet("large_data.parquet")
```


### 2. 早期にフィルタする \{#filter-early\}

```python
# Good - filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .groupby('category')['amount'].sum()
)

# Less optimal - aggregate first
result = ds.groupby('category')['amount'].sum()
```


### 3. 必要なカラムだけを選択 \{#select-only-needed-columns\}

```python
# Good - select specific columns
result = ds.select('name', 'age', 'city').filter(ds['age'] > 25)

# Less optimal - work with all columns
result = ds.filter(ds['age'] > 25)
```


### 4. 複雑な操作には SQL を使用する \{#use-sql-for-complex-operations\}

```python
# For complex queries, use SQL directly
ds = DataStore()
result = ds.sql("""
    SELECT category, 
           SUM(amount) as total,
           COUNT(*) as count,
           AVG(amount) as avg
    FROM file('sales.csv', 'CSVWithNames')
    WHERE date >= '2024-01-01'
    GROUP BY category
    HAVING total > 10000
    ORDER BY total DESC
    LIMIT 10
""")
```


## 次のステップ \{#next-steps\}

- DataStore を作成するためのすべての [Factory Methods](factory-methods.md) について学ぶ
- SQL スタイルの操作向けのクエリ構築について [Query Building](query-building.md) を参照する
- 文字列や日時などのための [Accessors](accessors.md) を確認する
- 最適化のヒントについては [Performance Guide](../guides/pandas-performance.md) を参照する