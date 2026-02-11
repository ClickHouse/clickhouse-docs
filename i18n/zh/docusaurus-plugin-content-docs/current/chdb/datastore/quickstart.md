---
title: 'DataStore 快速入门'
sidebar_label: '快速入门'
slug: /chdb/datastore/quickstart
description: '开始使用 DataStore：安装、通过一行代码从 pandas 迁移，以及基础用法'
keywords: ['chdb', 'datastore', 'quickstart', 'installation', 'pandas', 'migration']
doc_type: 'guide'
---

# DataStore 快速入门 \{#datastore-quickstart\}

几分钟内即可开始使用 DataStore。本指南涵盖安装、从 pandas 迁移以及基本使用模式。

## 安装 \{#installation\}

使用 pip 安装 chDB：

```bash
pip install "chdb>=4.0"
```

可选依赖：

```bash
# For pandas DataFrame support
pip install "chdb[pandas]>=4.0"

# For PyArrow support
pip install "chdb[arrow]>=4.0"

# All optional dependencies
pip install "chdb[all]>=4.0"
```


### 验证安装 \{#verify\}

```python
import chdb
print(chdb.__version__)  # Should print 4.x.x or higher

from chdb import datastore as pd
print("DataStore ready!")
```


## 一行代码从 Pandas 迁移 \{#migration\}

开始使用 DataStore 的最简单方式是把你的 import 语句改成：

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

就这样，你现有的 pandas 代码将改用 DataStore，并自动受益于 SQL 优化。


### 迁移示例 \{#migration-example\}

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


## 基本用法 \{#basic-usage\}

### 创建 DataStore 实例 \{#creating\}

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


### 过滤数据 \{#filtering\}

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


### 选择列 \{#selecting\}

```python
# Pandas style
subset = ds[['name', 'age']]

# SQL style
subset = ds.select('name', 'age')
```


### 排序 \{#sorting\}

```python
# Pandas style
sorted_ds = ds.sort_values('salary', ascending=False)

# SQL style
sorted_ds = ds.sort('salary', ascending=False)
```


### 分组与聚合 \{#groupby\}

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


### 关联 DataStores \{#joining\}

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


## 获取结果 \{#results\}

DataStore 使用惰性求值策略——只有在你真正需要结果时，相关操作才会被执行。

### 触发执行 \{#execution-triggers\}

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


### 查看生成的 SQL 语句 \{#view-sql\}

```python
# See what SQL DataStore will execute
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})
print(query.to_sql())
```

输出结果：

```sql
SELECT city, AVG(salary) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE age > 25
GROUP BY city
```


## 处理不同数据源 \{#data-sources\}

### 本地文件 \{#local-files\}

```python
from chdb import datastore as pd

# CSV
ds = pd.read_csv("data.csv")

# Parquet (best performance)
ds = pd.read_parquet("data.parquet")

# JSON
ds = pd.read_json("data.json")
```


### Cloud 存储 \{#cloud-storage\}

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


### 数据库 \{#databases\}

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


## 字符串与 DateTime 操作 \{#accessors\}

### 字符串操作 \{#string-ops\}

```python
# All pandas .str methods work
ds['name_upper'] = ds['name'].str.upper()
ds['name_len'] = ds['name'].str.len()
ds['has_a'] = ds['name'].str.contains('a')
```


### DateTime 运算 \{#datetime-ops\}

```python
# All pandas .dt methods work
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### ClickHouse 扩展功能 \{#extensions\}

```python
# URL parsing (not available in pandas!)
ds['domain'] = ds['url'].url.domain()

# JSON extraction
ds['user_name'] = ds['json_data'].json.get_string('name')

# IP address operations
ds['is_ipv4'] = ds['ip_addr'].ip.is_ipv4_string()
```


## 最佳实践 \{#best-practices\}

### 1. 大文件请使用 Parquet 格式 \{#use-parquet-for-large-files\}

```python
# CSV - slower, reads entire file
ds = pd.read_csv("large_data.csv")

# Parquet - faster, columnar format, reads only needed columns
ds = pd.read_parquet("large_data.parquet")
```


### 2. 尽早进行过滤 \{#filter-early\}

```python
# Good - filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .groupby('category')['amount'].sum()
)

# Less optimal - aggregate first
result = ds.groupby('category')['amount'].sum()
```


### 3. 仅选择所需的列 \{#select-only-needed-columns\}

```python
# Good - select specific columns
result = ds.select('name', 'age', 'city').filter(ds['age'] > 25)

# Less optimal - work with all columns
result = ds.filter(ds['age'] > 25)
```


### 4. 使用 SQL 处理复杂操作 \{#use-sql-for-complex-operations\}

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


## 后续步骤 \{#next-steps\}

- 了解用于创建 DataStore 的全部[工厂方法](factory-methods.md)
- 探索用于 SQL 风格操作的[查询构建](query-building.md)
- 查看用于字符串、日期时间等类型的[访问器](accessors.md)
- 阅读[性能指南](../guides/pandas-performance.md)以获取优化建议