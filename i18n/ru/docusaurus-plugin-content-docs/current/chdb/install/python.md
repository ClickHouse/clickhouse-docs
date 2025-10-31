---
slug: '/chdb/install/python'
sidebar_label: Python
description: 'Как установить chDB для Python'
title: 'Установка chDB для Python'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: guide
---
## Требования {#requirements}

- Python 3.8+ 
- Поддерживаемые платформы: macOS и Linux (x86_64 и ARM64)

## Установка {#install}

```bash
pip install chdb
```

## Использование {#usage} 

### Командный интерфейс {#command-line-interface}

Запускайте SQL-запросы непосредственно из командной строки:

```bash

# Basic query
python3 -m chdb "SELECT 1, 'abc'" Pretty


# Query with formatting
python3 -m chdb "SELECT version()" JSON
```

### Основное использование Python {#basic-python-usage}

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

### API на основе соединений (рекомендуется) {#connection-based-api}

Для лучшего управления ресурсами и производительности:

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

## Методы ввода данных {#data-input}

### Файловые источники данных {#file-based-data-sources}

chDB поддерживает более 70 форматов данных для прямого запроса файлов:

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

### Примеры форматов вывода {#output-format-examples}

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

### Операции с DataFrame {#dataframe-operations}

#### Устаревший API DataFrame {#legacy-dataframe-api}

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

#### Табличный движок Python (рекомендуется) {#python-table-engine-recommended}

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

### Сессии с состоянием {#stateful-sessions}

Сессии поддерживают состояние запроса между несколькими операциями, что позволяет реализовать сложные рабочие процессы:

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

### Расширенные функции сеансов {#advanced-session-features}

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

См. также: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).

### Интерфейс Python DB-API 2.0 {#python-db-api-20}

Стандартный интерфейс базы данных для совместимости с существующими Python приложениями:

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

### Пользовательские функции (UDF) {#user-defined-functions}

Расширьте SQL с помощью пользовательских функций на Python:

#### Основное использование UDF {#basic-udf-usage}

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

#### Расширенные UDF с пользовательскими возвращаемыми типами {#advanced-udf-custom-return-types}

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

#### Рекомендации по использованию UDF {#udf-best-practices}

1. **Бессостояние Функции**: UDF должны быть чистыми функциями без побочных эффектов
2. **Импорт внутри функций**: Все необходимые модули должны импортироваться внутри UDF
3. **Строковый ввод/вывод**: Все параметры UDF - это строки (формат TabSeparated)
4. **Обработка ошибок**: Включите блоки try-catch для надёжных UDF
5. **Производительность**: UDF вызываются для каждой строки, поэтому оптимизируйте производительность

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

### Обработка потоковых запросов {#streaming-queries}

Обрабатывайте большие наборы данных с постоянным использованием памяти:

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

### Табличный движок Python {#python-table-engine}

#### Запрос Pandas DataFrames {#query-pandas-dataframes}

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

#### Пользовательские источники данных с PyReader {#custom-data-sources-pyreader}

Реализуйте пользовательские считыватели данных для специализированных источников данных:

```python
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


# DataFrame with mixed JSON objects
df_with_json = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "profile": [
        {"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
        {"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
        {"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
        {"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
    ]
})


# Control JSON inference with settings
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- Analyze all rows for JSON detection
""", "Pretty")
print(result)


# Advanced JSON operations
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
```

## Производительность и оптимизация {#performance-optimization}

### Бенчмарки {#benchmarks}

chDB стабильно превосходит другие встроенные движки:
- **Операции с DataFrame**: в 2-5 раз быстрее, чем традиционные библиотеки DataFrame для аналитических запросов
- **Обработка Parquet**: Конкурирует с ведущими колонковыми движками
- **Эффективность использования памяти**: меньший объем памяти по сравнению с альтернативами

[Подробнее о результатах бенчмарков](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### Советы по производительности {#performance-tips}

```python
import chdb


# 1. Use appropriate output formats
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # For analysis
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # For interop
native_result = chdb.query("SELECT * FROM large_table", "Native")   # For chDB-to-chDB


# 2. Optimize queries with settings
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")


# 3. Leverage streaming for large datasets
from chdb import session

sess = session.Session()


# Setup large dataset
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")


# Stream processing with constant memory usage
total_amount = 0
processed_rows = 0

with sess.send_query("SELECT customer_id, sum(amount) as total FROM large_sales GROUP BY customer_id", "JSONEachRow") as stream:
    for chunk in stream:
        lines = chunk.data().strip().split('\n')
        for line in lines:
            if line:  # Skip empty lines
                import json
                row = json.loads(line)
                total_amount += row['total']
                processed_rows += 1

        print(f"Processed {processed_rows} customer records, running total: {total_amount}")

        # Early termination for demo
        if processed_rows > 1000:
            break

print(f"Final result: {processed_rows} customers processed, total amount: {total_amount}")


# Stream to external systems (e.g., Delta Lake)
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)


# Process in batches
for batch in batch_reader:
    print(f"Processing batch with {batch.num_rows} rows...")
    # Transform or export each batch
    # df_batch = batch.to_pandas()
    # process_batch(df_batch)

stream.close()
sess.close()
```

## Репозиторий GitHub {#github-repository}

- **Основной репозиторий**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Проблемы и поддержка**: Сообщите о проблемах на [репозитории GitHub](https://github.com/chdb-io/chdb/issues)