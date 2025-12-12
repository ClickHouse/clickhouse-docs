---
title: '安装适用于 Python 的 chDB'
sidebar_label: 'Python'
slug: /chdb/install/python
description: '如何安装适用于 Python 的 chDB'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---

## 系统要求 {#requirements}

- Python 3.8+ 
- 支持的平台：macOS 和 Linux（x86_64 和 ARM64）

## 安装 {#install}

```bash
pip install chdb
```

## 使用方法 {#usage} 

### 命令行界面 {#command-line-interface}

通过命令行直接运行 SQL 查询：

```bash
# Basic query
python3 -m chdb "SELECT 1, 'abc'" Pretty

# Query with formatting
python3 -m chdb "SELECT version()" JSON
```

### Python 基本用法 {#basic-python-usage}

```python
import chdb

# Simple query
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)

# Get query statistics
print(f"Rows read: {result.rows_read()}")
print(f"Bytes read: {result.bytes_read()}")
print(f"Execution time: {result.elapsed()} seconds")
```

### 基于连接的 API（推荐使用） {#connection-based-api}

为更好地进行资源管理并提升性能：

```python
import chdb

# Create connection (in-memory by default)
conn = chdb.connect(":memory:")
# Or use file-based: conn = chdb.connect("mydata.db")

# Create cursor for query execution
cur = conn.cursor()

# Execute queries
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")

# Fetch results in different ways
print(cur.fetchone())    # Single row: (0, '0')
print(cur.fetchmany(2))  # Multiple rows: ((1, '1'), (2, '2'))

# Get metadata
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']

# Use cursor as iterator
for row in cur:
    print(row)

# Always close resources
cur.close()
conn.close()
```

## 数据接入方式 {#data-input}

### 基于文件的数据源 {#file-based-data-sources}

chDB 支持 70 多种数据格式，可直接查询文件：

```python
import chdb
# Prepare your data
# ...

# Query Parquet files
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')

# Query CSV with headers
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')

# Multiple file formats
result = chdb.query("""
    SELECT * FROM file('logs*.jsonl', JSONEachRow)
    WHERE timestamp > '2024-01-01'
""", 'Pretty')
```

### 输出格式示例 {#output-format-examples}

```python
# DataFrame for analysis
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>

# Arrow Table for interoperability  
arrow_table = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table))  # <class 'pyarrow.lib.Table'>

# JSON for APIs
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)

# Pretty format for debugging
pretty_result = chdb.query('SELECT * FROM system.numbers LIMIT 3', 'Pretty')
print(pretty_result)
```

### DataFrame 操作 {#dataframe-operations}

#### 旧版 DataFrame API {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd

# Join multiple DataFrames
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
    sql="SELECT * FROM __tbl1__ t1 JOIN __tbl2__ t2 ON t1.a = t2.c",
    tbl1=df1, 
    tbl2=df2
)
print(result_df)

# Query the result DataFrame
summary = result_df.query('SELECT b, sum(a) FROM __table__ GROUP BY b')
print(summary)
```

#### Python 表引擎（推荐） {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa

# Query Pandas DataFrame directly
df = pd.DataFrame({
    "customer_id": [1, 2, 3, 1, 2],
    "product": ["A", "B", "A", "C", "A"],
    "amount": [100, 200, 150, 300, 250],
    "metadata": [
        {'category': 'electronics', 'priority': 'high'},
        {'category': 'books', 'priority': 'low'},
        {'category': 'electronics', 'priority': 'medium'},
        {'category': 'clothing', 'priority': 'high'},
        {'category': 'books', 'priority': 'low'}
    ]
})

# Direct DataFrame querying with JSON support
result = chdb.query("""
    SELECT 
        customer_id,
        sum(amount) as total_spent,
        toString(metadata.category) as category
    FROM Python(df)
    WHERE toString(metadata.priority) = 'high'
    GROUP BY customer_id, toString(metadata.category)
    ORDER BY total_spent DESC
""").show()

# Query Arrow Table
arrow_table = pa.table({
    "id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "David"],
    "score": [98, 89, 86, 95]
})

chdb.query("""
    SELECT name, score
    FROM Python(arrow_table)
    ORDER BY score DESC
""").show()
```

### 有状态会话 {#stateful-sessions}

会话在多次操作之间保持查询状态，从而支持复杂的工作流：

```python
from chdb import session

# Temporary session (auto-cleanup)
sess = session.Session()

# Or persistent session with specific path
# sess = session.Session("/path/to/data")

# Create database and tables
sess.query("CREATE DATABASE IF NOT EXISTS analytics ENGINE = Atomic")
sess.query("USE analytics")

sess.query("""
    CREATE TABLE sales (
        id UInt64,
        product String,
        amount Decimal(10,2),
        sale_date Date
    ) ENGINE = MergeTree() 
    ORDER BY (sale_date, id)
""")

# Insert data
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")

# Create materialized views
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")

# Query the view
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)

# Session automatically manages resources
sess.close()  # Optional - auto-closed when object is deleted
```

### 高级会话功能 {#advanced-session-features}

```python
# Session with custom settings
sess = session.Session(
    path="/tmp/analytics_db",
)

# Query performance optimization
result = sess.query("""
    SELECT product, sum(amount) as total
    FROM sales 
    GROUP BY product
    ORDER BY total DESC
    SETTINGS max_threads = 4
""", "JSON")
```

另请参见：[test&#95;stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### Python DB-API 2.0 接口 {#python-db-api-20}

面向现有 Python 应用程序的标准数据库接口，以确保兼容性：

```python
import chdb.dbapi as dbapi

# Check driver information
print(f"chDB driver version: {dbapi.get_client_info()}")

# Create connection
conn = dbapi.connect()
cursor = conn.cursor()

# Execute queries with parameters
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))

# Get metadata
print("Column descriptions:", cursor.description)
print("Row count:", cursor.rowcount)

# Fetch results
print("First row:", cursor.fetchone())
print("Next 2 rows:", cursor.fetchmany(2))

# Fetch remaining rows
for row in cursor.fetchall():
    print("Row:", row)

# Batch operations
data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
cursor.execute("""
    CREATE TABLE temp_users (
        id UInt64,
        name String
    ) ENGINE = MergeTree()
    ORDER BY (id)
""")
cursor.executemany(
    "INSERT INTO temp_users (id, name) VALUES (?, ?)", 
    data
)
```

### 用户自定义函数（UDF） {#user-defined-functions}

使用自定义 Python 函数扩展 SQL：

#### UDF 的基本用法 {#basic-udf-usage}

```python
from chdb.udf import chdb_udf
from chdb import query

# Simple mathematical function
@chdb_udf()
def add_numbers(a, b):
    return int(a) + int(b)

# String processing function
@chdb_udf()
def reverse_string(text):
    return text[::-1]

# JSON processing function  
@chdb_udf()
def extract_json_field(json_str, field):
    import json
    try:
        data = json.loads(json_str)
        return str(data.get(field, ''))
    except:
        return ''

# Use UDFs in queries
result = query("""
    SELECT 
        add_numbers('10', '20') as sum_result,
        reverse_string('hello') as reversed,
        extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)
```

#### 具有自定义返回类型的高级 UDF {#advanced-udf-custom-return-types}

```python
# UDF with specific return type
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # Convert cm to meters
    weight = float(weight_str)
    return weight / (height * height)

# UDF for data validation
@chdb_udf(return_type="UInt8") 
def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return 1 if re.match(pattern, email) else 0

# Use in complex queries
result = query("""
    SELECT 
        name,
        calculate_bmi(height, weight) as bmi,
        is_valid_email(email) as has_valid_email
    FROM (
        SELECT 
            'John' as name, '180' as height, '75' as weight, 'john@example.com' as email
        UNION ALL
        SELECT 
            'Jane' as name, '165' as height, '60' as weight, 'invalid-email' as email
    )
""", "Pretty")
print(result)
```

#### UDF 最佳实践 {#udf-best-practices}

1. **无状态函数**：UDF 应为无副作用的纯函数
2. **在函数内部导入模块**：所有所需模块必须在 UDF 内部导入
3. **字符串输入/输出**：所有 UDF 参数都是字符串（制表符分隔 TabSeparated 格式）
4. **错误处理**：使用 try-catch 代码块以提高 UDF 的健壮性
5. **性能**：UDF 会对每一行进行调用，因此需要针对性能进行优化

```python
# Well-structured UDF with error handling
@chdb_udf(return_type="String")
def safe_json_extract(json_str, path):
    import json
    try:
        data = json.loads(json_str)
        keys = path.split('.')
        result = data
        for key in keys:
            if isinstance(result, dict) and key in result:
                result = result[key]
            else:
                return 'null'
        return str(result)
    except Exception as e:
        return f'error: {str(e)}'

# Use with complex nested JSON
query("""
    SELECT safe_json_extract(
        '{"user": {"profile": {"name": "Alice", "age": 25}}}',
        'user.profile.name'
    ) as extracted_name
""")
```

### 流式查询处理 {#streaming-queries}

以固定内存占用处理大规模数据集：

```python
from chdb import session

sess = session.Session()

# Setup large dataset
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")

# Example 1: Basic streaming with context manager
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"Processed chunk: {chunk_rows} rows")
        
        # Early termination if needed
        if total_rows > 100000:
            break

print(f"Total rows processed: {total_rows}")

# Example 2: Manual iteration with explicit cleanup
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # Process chunk data
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # Skip empty lines
            processed_count += 1
    
    print(f"Processed {processed_count} records so far...")
    
stream.close()  # Important: explicit cleanup

# Example 3: Arrow integration for external libraries
import pyarrow as pa
from deltalake import write_deltalake

# Stream results in Arrow format
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")

# Create RecordBatchReader with custom batch size
batch_reader = stream.record_batch(rows_per_batch=10000)

# Export to Delta Lake
write_deltalake(
    table_or_uri="./my_delta_table",
    data=batch_reader,
    mode="overwrite"
)

stream.close()
sess.close()
```

### Python 表引擎 {#python-table-engine}

#### 查询 Pandas DataFrame 数据 {#query-pandas-dataframes}

```python
import chdb
import pandas as pd

# Complex DataFrame with nested data
df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5, 6],
    "customer_name": ["Alice", "Bob", "Charlie", "Alice", "Bob", "David"],
    "orders": [
        {"order_id": 101, "amount": 250.50, "items": ["laptop", "mouse"]},
        {"order_id": 102, "amount": 89.99, "items": ["book"]},
        {"order_id": 103, "amount": 1299.99, "items": ["phone", "case", "charger"]},
        {"order_id": 104, "amount": 45.50, "items": ["pen", "paper"]},
        {"order_id": 105, "amount": 199.99, "items": ["headphones"]},
        {"order_id": 106, "amount": 15.99, "items": ["cable"]}
    ]
})

# Advanced querying with JSON operations
result = chdb.query("""
    SELECT 
        customer_name,
        count() as order_count,
        sum(toFloat64(orders.amount)) as total_spent,
        arrayStringConcat(
            arrayDistinct(
                arrayFlatten(
                    groupArray(orders.items)
                )
            ), 
            ', '
        ) as all_items
    FROM Python(df)
    GROUP BY customer_name
    HAVING total_spent > 100
    ORDER BY total_spent DESC
""").show()

# Window functions on DataFrames
window_result = chdb.query("""
    SELECT 
        customer_name,
        toFloat64(orders.amount) as amount,
        sum(toFloat64(orders.amount)) OVER (
            PARTITION BY customer_name 
            ORDER BY toInt32(orders.order_id)
        ) as running_total
    FROM Python(df)
    ORDER BY customer_name, toInt32(orders.order_id)
""", "Pretty")
print(window_result)
```

#### 使用 PyReader 的自定义数据源 {#custom-data-sources-pyreader}

为特定数据源实现自定义数据读取器：

````python
import chdb
from typing import List, Tuple, Any
import json

class DatabaseReader(chdb.PyReader):
    """Custom reader for database-like data sources"""
    
    def __init__(self, connection_string: str):
        # Simulate database connection
        self.data = self._load_data(connection_string)
        self.cursor = 0
        self.batch_size = 1000
        super().__init__(self.data)
    
    def _load_data(self, conn_str):
        # Simulate loading from database
        return {
            "id": list(range(1, 10001)),
            "name": [f"user_{i}" for i in range(1, 10001)],
            "score": [i * 10 + (i % 7) for i in range(1, 10001)],
            "metadata": [
                json.dumps({"level": i % 5, "active": i % 3 == 0})
                for i in range(1, 10001)
            ]
        }
    
    def get_schema(self) -> List[Tuple[str, str]]:
        """Define table schema with explicit types"""
        return [
            ("id", "UInt64"),
            ("name", "String"),
            ("score", "Int64"),
            ("metadata", "String")  # JSON stored as string
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """Read data in batches"""
        if self.cursor >= len(self.data["id"]):
            return []  # No more data
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # Return data for requested columns
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # Handle missing columns
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### JSON Type Inference and Handling {#json-type-inference-handling}

chDB automatically handles complex nested data structures:

```python
import pandas as pd
import chdb

# 包含混合 JSON 对象的 DataFrame {#dataframe-with-mixed-json-objects}
df_with_json = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "profile": [
        {"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
        {"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
        {"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
        {"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
    ]
})

# 通过设置控制 JSON 推断 {#control-json-inference-with-settings}
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- 分析所有行以检测 JSON
""", "Pretty")
print(result)

# 高级 JSON 操作 {#advanced-json-operations}
complex_json = chdb.query("""
    SELECT 
        user_id,
        JSONLength(toString(profile)) as json_fields,
        JSONType(toString(profile), 'preferences') as pref_type,
        if(
            JSONHas(toString(profile), 'achievements'),
            JSONExtractString(toString(profile), 'achievements[0].title'),
            'None'
        ) as first_achievement
    FROM Python(df_with_json)
""", "JSONEachRow")
print(complex_json)
````

## Performance and optimization {#performance-optimization}

### Benchmarks {#benchmarks}

chDB consistently outperforms other embedded engines:
- **DataFrame operations**: 2-5x faster than traditional DataFrame libraries for analytical queries
- **Parquet processing**: Competitive with leading columnar engines
- **Memory efficiency**: Lower memory footprint than alternatives

[More benchmark result details](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### Performance tips {#performance-tips}

```python
import chdb

# 1. 使用合适的输出格式 {#1-use-appropriate-output-formats}
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # 用于数据分析
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # 用于系统互操作
native_result = chdb.query("SELECT * FROM large_table", "Native")   # 用于 chDB 间传输

# 2. 通过配置参数优化查询 {#2-optimize-queries-with-settings}
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")

# 3. 对大数据集使用流式处理 {#3-leverage-streaming-for-large-datasets}
from chdb import session

sess = session.Session()

# 创建大数据集 {#setup-large-dataset}
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")

# 流式处理保持恒定内存占用 {#stream-processing-with-constant-memory-usage}
total_amount = 0
processed_rows = 0

with sess.send_query("SELECT customer_id, sum(amount) as total FROM large_sales GROUP BY customer_id", "JSONEachRow") as stream:
    for chunk in stream:
        lines = chunk.data().strip().split('\n')
        for line in lines:
            if line:  # 跳过空行
                import json
                row = json.loads(line)
                total_amount += row['total']
                processed_rows += 1
        
        print(f"Processed {processed_rows} customer records, running total: {total_amount}")
        
        # 演示用提前终止
        if processed_rows > 1000:
            break

print(f"Final result: {processed_rows} customers processed, total amount: {total_amount}")

# 流式传输到外部系统(例如 Delta Lake) {#stream-to-external-systems-eg-delta-lake}
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)

# 分批处理 {#process-in-batches}
for batch in batch_reader:
    print(f"Processing batch with {batch.num_rows} rows...")
    # 转换或导出每批数据
    # df_batch = batch.to_pandas()
    # process_batch(df_batch)

stream.close()
sess.close()
```

## GitHub 仓库 {#github-repository}

- **主仓库**：[chdb-io/chdb](https://github.com/chdb-io/chdb)
- **问题与支持**：请在 [GitHub 仓库](https://github.com/chdb-io/chdb/issues) 中提交 Issue