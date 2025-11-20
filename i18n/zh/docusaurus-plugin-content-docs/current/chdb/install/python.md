---
title: '安装适用于 Python 的 chDB'
sidebar_label: 'Python'
slug: /chdb/install/python
description: '如何安装适用于 Python 的 chDB'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---



## 要求 {#requirements}

- Python 3.8+
- 支持的平台:macOS 和 Linux(x86_64 和 ARM64)


## 安装 {#install}

```bash
pip install chdb
```


## 使用方法 {#usage}

### 命令行界面 {#command-line-interface}

直接从命令行运行 SQL 查询：


```bash
# 基本查询
python3 -m chdb "SELECT 1, 'abc'" Pretty
```


# 带格式的查询

python3 -m chdb &quot;SELECT version()&quot; JSON

````

### 基本 Python 用法 {#basic-python-usage}

```python
import chdb
````


# 简单查询
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)



# 获取查询统计信息

print(f&quot;读取的行数: {result.rows_read()}&quot;)
print(f&quot;读取的字节数: {result.bytes_read()}&quot;)
print(f&quot;执行时间: {result.elapsed()} 秒&quot;)

````

### 基于连接的 API（推荐） {#connection-based-api}

为了更好地管理资源和提升性能：

```python
import chdb
````


# 创建连接（默认使用内存）
conn = chdb.connect(":memory:")
# 或使用基于文件的连接：conn = chdb.connect("mydata.db")



# 创建用于执行查询的游标对象
cur = conn.cursor()



# 执行查询
cur.execute("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



# 以不同方式获取结果
print(cur.fetchone())    # 单行: (0, '0')
print(cur.fetchmany(2))  # 多行: ((1, '1'), (2, '2'))



# 获取元数据
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']



# 将游标作为迭代器使用
for row in cur:
    print(row)



# 始终关闭资源

cur.close()
conn.close()

```
```


## 数据输入方法 {#data-input}

### 基于文件的数据源 {#file-based-data-sources}

chDB 支持直接查询 70 多种数据格式的文件：


```python
import chdb
# 准备数据
# ...
```


# 查询 Parquet 文件
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')



# 查询包含表头的 CSV
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')



# 多种文件格式

result = chdb.query(&quot;&quot;&quot;
SELECT * FROM file(&#39;logs*.jsonl&#39;, JSONEachRow)
WHERE timestamp &gt; &#39;2024-01-01&#39;
&quot;&quot;&quot;, &#39;Pretty&#39;)

```

### 输出格式示例 {#output-format-examples}
```


```python
# 用于分析的 DataFrame
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>
```


# 用于互操作的 Arrow 表

arrow_table = chdb.query('SELECT \* FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table)) # <class 'pyarrow.lib.Table'>


# 用于 API 的 JSON
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)



# 用于调试的 Pretty 格式

pretty&#95;result = chdb.query(&#39;SELECT * FROM system.numbers LIMIT 3&#39;, &#39;Pretty&#39;)
print(pretty&#95;result)

````

### DataFrame 操作 {#dataframe-operations}

#### 旧版 DataFrame API {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd
````


# 连接多个 DataFrame

df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
sql="SELECT \* FROM **tbl1** t1 JOIN **tbl2** t2 ON t1.a = t2.c",
tbl1=df1,
tbl2=df2
)
print(result_df)


# 查询结果 DataFrame

summary = result&#95;df.query(&#39;SELECT b, sum(a) FROM **table** GROUP BY b&#39;)
print(summary)

````

#### Python 表引擎（推荐） {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa
````


# 直接查询 Pandas DataFrame

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


# 直接查询 DataFrame（支持 JSON）
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



# 查询 Arrow 表

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

````

### 有状态会话 {#stateful-sessions}

会话可在多个操作之间保持查询状态,从而支持复杂的工作流:

```python
from chdb import session

````


# 临时会话（自动清除）
sess = session.Session()



# 或使用指定路径的持久会话
# sess = session.Session("/path/to/data")



# 创建数据库和数据表
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



# 插入数据
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")



# 创建物化视图
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() AS orders,
        sum(amount) AS revenue
    FROM sales 
    GROUP BY sale_date
""")



# 查询该视图
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)



# Session 自动管理资源

sess.close()  # 可选 - 在对象被删除时会自动关闭

```

### 高级会话功能 {#advanced-session-features}
```


```python
# 使用自定义设置的会话
sess = session.Session(
    path="/tmp/analytics_db",
)
```


# 查询性能优化

result = sess.query(&quot;&quot;&quot;
SELECT product, sum(amount) AS total
FROM sales
GROUP BY product
ORDER BY total DESC
SETTINGS max&#95;threads = 4
&quot;&quot;&quot;, &quot;JSON&quot;)

````

另请参阅：[test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### Python DB-API 2.0 接口 {#python-db-api-20}

标准数据库接口，用于与现有 Python 应用程序兼容：

```python
import chdb.dbapi as dbapi
````


# 检查驱动程序信息
print(f"chDB driver version: {dbapi.get_client_info()}")



# 创建连接
conn = dbapi.connect()
cursor = conn.cursor()



# 使用参数化查询执行语句
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))



# 获取元数据
print("列信息:", cursor.description)
print("行数:", cursor.rowcount)



# 获取结果
print("第一行:", cursor.fetchone())
print("接下来的 2 行:", cursor.fetchmany(2))



# 获取剩余的行
for row in cursor.fetchall():
    print("行:", row)



# 批量操作

data = [(1, &#39;Alice&#39;), (2, &#39;Bob&#39;), (3, &#39;Charlie&#39;)]
cursor.execute(&quot;&quot;&quot;
CREATE TABLE temp&#95;users (
id UInt64,
name String
) ENGINE = MergeTree()
ORDER BY (id)
&quot;&quot;&quot;)
cursor.executemany(
&quot;INSERT INTO temp&#95;users (id, name) VALUES (?, ?)&quot;,
data
)

````

### 用户定义函数 (UDF) {#user-defined-functions}

通过自定义 Python 函数扩展 SQL：

#### 基本 UDF 使用方法 {#basic-udf-usage}

```python
from chdb.udf import chdb_udf
from chdb import query
````


# 简单的数学函数
@chdb_udf()
def add_numbers(a, b):
    return int(a) + int(b)



# 字符串处理函数
@chdb_udf()
def reverse_string(text):
    return text[::-1]



# JSON 处理函数  
@chdb_udf()
def extract_json_field(json_str, field):
    import json
    try:
        data = json.loads(json_str)
        return str(data.get(field, ''))
    except:
        return ''



# 在查询中使用 UDF

result = query("""
SELECT
add_numbers('10', '20') as sum_result,
reverse_string('hello') as reversed,
extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)

```

#### 自定义返回类型的高级 UDF {#advanced-udf-custom-return-types}

```


```python
# 指定返回类型的 UDF
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # 将厘米转换为米
    weight = float(weight_str)
    return weight / (height * height)
```


# 用于数据验证的 UDF

@chdb*udf(return_type="UInt8")
def is_valid_email(email):
import re
pattern = r'^[a-zA-Z0-9.*%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
return 1 if re.match(pattern, email) else 0


# 在复杂查询中的使用

result = query(&quot;&quot;&quot;
SELECT
name,
calculate&#95;bmi(height, weight) as bmi,
is&#95;valid&#95;email(email) as has&#95;valid&#95;email
FROM (
SELECT
&#39;John&#39; as name, &#39;180&#39; as height, &#39;75&#39; as weight, &#39;[john@example.com](mailto:john@example.com)&#39; as email
UNION ALL
SELECT
&#39;Jane&#39; as name, &#39;165&#39; as height, &#39;60&#39; as weight, &#39;invalid-email&#39; as email
)
&quot;&quot;&quot;, &quot;Pretty&quot;)
print(result)

```

#### UDF 最佳实践 {#udf-best-practices}

1. **无状态函数**：UDF 应当是无副作用的纯函数
2. **在函数内导入**：所有必需的模块必须在 UDF 内部导入
3. **字符串输入/输出**：所有 UDF 参数均为字符串（TabSeparated 格式）
4. **错误处理**：应包含 try-catch 块以确保 UDF 的健壮性
5. **性能优化**：UDF 会针对每一行数据调用,因此需要优化性能
```


```python
# 结构良好的 UDF 及错误处理
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
```


# 处理复杂的嵌套 JSON

query("""
SELECT safe_json_extract(
'{"user": {"profile": {"name": "Alice", "age": 25}}}',
'user.profile.name'
) as extracted_name
""")

````

### 流式查询处理 {#streaming-queries}

处理大型数据集并保持恒定的内存使用量：

```python
from chdb import session

sess = session.Session()

````


# 设置大型数据集
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")



# 示例 1：使用上下文管理器的基本流式处理
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



# 示例 2：手动迭代并显式清理
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # 处理分块数据
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # 跳过空行
            processed_count += 1
    
    print(f"Processed {processed_count} records so far...")
    
stream.close()  # 重要：显式清理



# 示例 3：外部库的 Arrow 集成

import pyarrow as pa
from deltalake import write_deltalake


# 以 Arrow 格式流式获取结果
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")



# 使用自定义批处理大小创建 RecordBatchReader
batch_reader = stream.record_batch(rows_per_batch=10000)



# 导出到 Delta Lake

write&#95;deltalake(
table&#95;or&#95;uri=&quot;./my&#95;delta&#95;table&quot;,
data=batch&#95;reader,
mode=&quot;overwrite&quot;
)

stream.close()
sess.close()

````

### Python 表引擎 {#python-table-engine}

#### 查询 Pandas DataFrame {#query-pandas-dataframes}

```python
import chdb
import pandas as pd
````


# 包含嵌套数据的复杂 DataFrame

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


# 使用 JSON 操作的高级查询
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



# DataFrame 上的窗口函数

window&#95;result = chdb.query(&quot;&quot;&quot;
SELECT
customer&#95;name,
toFloat64(orders.amount) as amount,
sum(toFloat64(orders.amount)) OVER (
PARTITION BY customer&#95;name
ORDER BY toInt32(orders.order&#95;id)
) as running&#95;total
FROM Python(df)
ORDER BY customer&#95;name, toInt32(orders.order&#95;id)
&quot;&quot;&quot;, &quot;Pretty&quot;)
print(window&#95;result)

````

#### 使用 PyReader 自定义数据源 {#custom-data-sources-pyreader}

为特定数据源实现自定义数据读取器：

```python
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

### JSON 类型推断与处理 {#json-type-inference-handling}

chDB 自动处理复杂的嵌套数据结构：

```python
import pandas as pd
import chdb
````


# 包含混合 JSON 对象的 DataFrame

df_with_json = pd.DataFrame({
"user_id": [1, 2, 3, 4],
"profile": [
{"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
{"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
{"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
{"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
]
})


# 使用设置控制 JSON 推理
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- 为 JSON 检测分析所有行
""", "Pretty")
print(result)



# 高级 JSON 操作

complex&#95;json = chdb.query(&quot;&quot;&quot;
SELECT
user&#95;id,
JSONLength(toString(profile)) as json&#95;fields,
JSONType(toString(profile), &#39;preferences&#39;) as pref&#95;type,
if(
JSONHas(toString(profile), &#39;achievements&#39;),
JSONExtractString(toString(profile), &#39;achievements[0].title&#39;),
&#39;None&#39;
) as first&#95;achievement
FROM Python(df&#95;with&#95;json)
&quot;&quot;&quot;, &quot;JSONEachRow&quot;)
print(complex&#95;json)

```
```


## 性能与优化 {#performance-optimization}

### 基准测试 {#benchmarks}

chDB 的性能始终优于其他嵌入式引擎：

- **DataFrame 操作**：分析查询速度比传统 DataFrame 库快 2-5 倍
- **Parquet 处理**：与领先的列式引擎性能相当
- **内存效率**：内存占用低于其他替代方案

[更多基准测试结果详情](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### 性能优化建议 {#performance-tips}

```python
import chdb

```


# 1. 使用合适的输出格式
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # 用于分析
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # 用于与其他系统集成
native_result = chdb.query("SELECT * FROM large_table", "Native")   # 用于 chDB 之间的数据交换



# 2. 通过设置优化查询
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")



# 3. 利用流式处理处理大型数据集
from chdb import session

sess = session.Session()



# 设置大型数据集
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")



# 使用常量内存的流式处理
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
        
        print(f"已处理 {processed_rows} 条客户记录，当前运行总额: {total_amount}")
        
        # 演示用的提前终止
        if processed_rows > 1000:
            break

print(f"最终结果: 共处理 {processed_rows} 位客户，总金额: {total_amount}")



# 向外部系统进行流式传输（例如 Delta Lake）
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)



# 分批处理

for batch in batch&#95;reader:
print(f&quot;Processing batch with {batch.num_rows} rows...&quot;)

# 转换或导出每个批次

# df&#95;batch = batch.to&#95;pandas()

# process&#95;batch(df&#95;batch)

stream.close()
sess.close()

```
```


## GitHub 仓库 {#github-repository}

- **主仓库**：[chdb-io/chdb](https://github.com/chdb-io/chdb)
- **问题与支持**：在 [GitHub 仓库](https://github.com/chdb-io/chdb/issues)报告问题
