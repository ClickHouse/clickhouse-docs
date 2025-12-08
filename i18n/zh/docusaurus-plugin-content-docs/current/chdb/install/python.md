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
# 基本查询 {#basic-query}
python3 -m chdb "SELECT 1, 'abc'" Pretty

# 格式化查询 {#query-with-formatting}
python3 -m chdb "SELECT version()" JSON
```

### Python 基本用法 {#basic-python-usage}

```python
import chdb

# 简单查询 {#simple-query}
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)

# 获取查询统计信息 {#get-query-statistics}
print(f"读取行数：{result.rows_read()}")
print(f"读取字节数：{result.bytes_read()}")
print(f"执行时间：{result.elapsed()} 秒")
```

### 基于连接的 API（推荐使用） {#connection-based-api}

为更好地进行资源管理并提升性能：

```python
import chdb

# 创建连接（默认使用内存模式） {#create-connection-in-memory-by-default}
conn = chdb.connect(":memory:")
# 或使用基于文件的方式：conn = chdb.connect("mydata.db") {#or-use-file-based-conn-chdbconnectmydatadb}

# 创建游标用于执行查询 {#create-cursor-for-query-execution}
cur = conn.cursor()

# 执行查询 {#execute-queries}
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")

# 以不同方式获取结果 {#fetch-results-in-different-ways}
print(cur.fetchone())    # 单行：(0, '0')
print(cur.fetchmany(2))  # 多行：((1, '1'), (2, '2'))

# 获取元数据 {#get-metadata}
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']

# 将游标用作迭代器 {#use-cursor-as-iterator}
for row in cur:
    print(row)

# 始终关闭资源 {#always-close-resources}
cur.close()
conn.close()
```

## 数据接入方式 {#data-input}

### 基于文件的数据源 {#file-based-data-sources}

chDB 支持 70 多种数据格式，可直接查询文件：

```python
import chdb
# 准备数据 {#prepare-your-data}
# ...

# 查询 Parquet 文件 {#query-parquet-files}
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')

# 查询带表头的 CSV 文件 {#query-csv-with-headers}
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')

# 查询多种文件格式 {#multiple-file-formats}
result = chdb.query("""
    SELECT * FROM file('logs*.jsonl', JSONEachRow)
    WHERE timestamp > '2024-01-01'
""", 'Pretty')
```

### 输出格式示例 {#output-format-examples}

```python
# DataFrame 用于数据分析 {#dataframe-for-analysis}
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>

# Arrow Table 用于数据互操作   {#arrow-table-for-interoperability}
arrow_table = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table))  # <class 'pyarrow.lib.Table'>

# JSON 用于 API 接口 {#json-for-apis}
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)

# Pretty 格式用于调试 {#pretty-format-for-debugging}
pretty_result = chdb.query('SELECT * FROM system.numbers LIMIT 3', 'Pretty')
print(pretty_result)
```

### DataFrame 操作 {#dataframe-operations}

#### 旧版 DataFrame API {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd

# 连接多个 DataFrame {#join-multiple-dataframes}
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
    sql="SELECT * FROM __tbl1__ t1 JOIN __tbl2__ t2 ON t1.a = t2.c",
    tbl1=df1, 
    tbl2=df2
)
print(result_df)

# 查询结果 DataFrame {#query-the-result-dataframe}
summary = result_df.query('SELECT b, sum(a) FROM __table__ GROUP BY b')
print(summary)
```

#### Python 表引擎（推荐） {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa

# 直接查询 Pandas DataFrame {#query-pandas-dataframe-directly}
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

# 直接查询 DataFrame（支持 JSON） {#direct-dataframe-querying-with-json-support}
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

# 查询 Arrow 表 {#query-arrow-table}
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

# 临时会话(自动清理) {#temporary-session-auto-cleanup}
sess = session.Session()

# 或使用指定路径的持久会话 {#or-persistent-session-with-specific-path}
# sess = session.Session("/path/to/data") {#sess-sessionsessionpathtodata}

# 创建数据库和表 {#create-database-and-tables}
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

# 插入数据 {#insert-data}
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")

# 创建物化视图 {#create-materialized-views}
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")

# 查询视图 {#query-the-view}
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)

# 会话自动管理资源 {#session-automatically-manages-resources}
sess.close()  # 可选 - 对象删除时自动关闭
```

### 高级会话功能 {#advanced-session-features}

```python
# 使用自定义设置的会话 {#session-with-custom-settings}
sess = session.Session(
    path="/tmp/analytics_db",
)

# 查询性能优化 {#query-performance-optimization}
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

# 检查驱动信息 {#check-driver-information}
print(f"chDB 驱动版本: {dbapi.get_client_info()}")

# 创建连接 {#create-connection}
conn = dbapi.connect()
cursor = conn.cursor()

# 执行带参数的查询 {#execute-queries-with-parameters}
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))

# 获取元数据 {#get-metadata}
print("列描述:", cursor.description)
print("行数:", cursor.rowcount)

# 获取结果 {#fetch-results}
print("第一行:", cursor.fetchone())
print("接下来 2 行:", cursor.fetchmany(2))

# 获取剩余行 {#fetch-remaining-rows}
for row in cursor.fetchall():
    print("行:", row)

# 批量操作 {#batch-operations}
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

# 简单数学函数 {#simple-mathematical-function}
@chdb_udf()
def add_numbers(a, b):
    return int(a) + int(b)

# 字符串处理函数 {#string-processing-function}
@chdb_udf()
def reverse_string(text):
    return text[::-1]

# JSON 处理函数   {#json-processing-function}
@chdb_udf()
def extract_json_field(json_str, field):
    import json
    try:
        data = json.loads(json_str)
        return str(data.get(field, ''))
    except:
        return ''

# 在查询中使用 UDF {#use-udfs-in-queries}
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
# 指定返回类型的 UDF {#udf-with-specific-return-type}
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # 将厘米转换为米
    weight = float(weight_str)
    return weight / (height * height)

# 数据验证 UDF {#udf-for-data-validation}
@chdb_udf(return_type="UInt8") 
def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return 1 if re.match(pattern, email) else 0

# 在复杂查询中使用 {#use-in-complex-queries}
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
# 结构良好的 UDF，带有错误处理 {#well-structured-udf-with-error-handling}
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

# 处理复杂嵌套 JSON {#use-with-complex-nested-json}
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

# 设置大型数据集 {#setup-large-dataset}
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")

# 示例 1：使用上下文管理器进行基本流式处理 {#example-1-basic-streaming-with-context-manager}
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"Processed chunk: {chunk_rows} rows")
        
        # 如有需要可提前终止
        if total_rows > 100000:
            break

print(f"Total rows processed: {total_rows}")

# 示例 2：手动迭代与显式清理 {#example-2-manual-iteration-with-explicit-cleanup}
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # 处理数据块
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # 跳过空行
            processed_count += 1
    
    print(f"Processed {processed_count} records so far...")
    
stream.close()  # 重要：显式清理

# 示例 3：Arrow 与外部库集成 {#example-3-arrow-integration-for-external-libraries}
import pyarrow as pa
from deltalake import write_deltalake

# 以 Arrow 格式流式传输结果 {#stream-results-in-arrow-format}
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")

# 创建自定义批次大小的 RecordBatchReader {#create-recordbatchreader-with-custom-batch-size}
batch_reader = stream.record_batch(rows_per_batch=10000)

# 导出到 Delta Lake {#export-to-delta-lake}
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

# 包含嵌套数据的复杂 DataFrame {#complex-dataframe-with-nested-data}
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

# 使用 JSON 操作进行高级查询 {#advanced-querying-with-json-operations}
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

# 对 DataFrame 使用窗口函数 {#window-functions-on-dataframes}
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
    """类数据库数据源的自定义读取器"""
    
    def __init__(self, connection_string: str):
        # 模拟数据库连接
        self.data = self._load_data(connection_string)
        self.cursor = 0
        self.batch_size = 1000
        super().__init__(self.data)
    
    def _load_data(self, conn_str):
        # 模拟从数据库加载
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
        """定义表结构并显式指定类型"""
        return [
            ("id", "UInt64"),
            ("name", "String"),
            ("score", "Int64"),
            ("metadata", "String")  # JSON 以字符串形式存储
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """批量读取数据"""
        if self.cursor >= len(self.data["id"]):
            return []  # 无更多数据
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # 返回所请求列的数据
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # 处理缺失列
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### JSON 类型推断与处理                                 {#json-type-inference-handling}

chDB 自动处理复杂的嵌套数据结构:

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

## 性能和优化 {#performance-optimization}

### 基准测试 {#benchmarks}

chDB 在性能上持续优于其他嵌入式引擎：

- **DataFrame 操作**：在分析查询方面相比传统 DataFrame 库快 2–5 倍
- **Parquet 处理**：性能可与领先的列式引擎相媲美
- **内存效率**：相比其他方案具有更低的内存占用

[更多基准测试结果详情](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### 性能优化建议 {#performance-tips}

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