---
title: 'Установка chDB для Python'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Руководство по установке chDB для Python'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---

## Требования {#requirements}

- Python 3.8+ 
- Поддерживаемые платформы: macOS и Linux (x86_64 и ARM64)

## Установка

```bash
pip install chdb
```


## Использование {#usage} 

### Интерфейс командной строки

Выполняйте SQL-запросы непосредственно из командной строки:

```bash
# Базовый запрос
python3 -m chdb "SELECT 1, 'abc'" Pretty

# Запрос с форматированием
python3 -m chdb "SELECT version()" JSON
```


### Основы работы с Python

```python
import chdb

# Простой запрос
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)

# Получить статистику запроса
print(f"Прочитано строк: {result.rows_read()}")
print(f"Прочитано байт: {result.bytes_read()}")
print(f"Время выполнения: {result.elapsed()} секунд")
```


### API на основе подключений (рекомендуется)

Для более эффективного управления ресурсами и повышения производительности:

```python
import chdb

# Создание соединения (по умолчанию в памяти)
conn = chdb.connect(":memory:")
# Или использовать файловое хранилище: conn = chdb.connect("mydata.db")

# Создание курсора для выполнения запросов
cur = conn.cursor()

# Выполнение запросов
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")

# Получение результатов различными способами
print(cur.fetchone())    # Одна строка: (0, '0')
print(cur.fetchmany(2))  # Несколько строк: ((1, '1'), (2, '2'))

# Получение метаданных
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']

# Использование курсора как итератора
for row in cur:
    print(row)

# Всегда закрывайте ресурсы
cur.close()
conn.close()
```


## Методы ввода данных {#data-input}

### Файловые источники данных

chDB поддерживает более чем 70 форматов данных для непосредственного выполнения запросов к файлам:

```python
import chdb
# Подготовьте данные
# ...

# Запрос файлов Parquet
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')

# Запрос CSV с заголовками
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')

# Множественные форматы файлов
result = chdb.query("""
    SELECT * FROM file('logs*.jsonl', JSONEachRow)
    WHERE timestamp > '2024-01-01'
""", 'Pretty')
```


### Примеры форматов вывода

```python
# DataFrame для анализа
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>

# Arrow Table для совместимости  
arrow_table = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table))  # <class 'pyarrow.lib.Table'>

# JSON для API
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)

# Формат Pretty для отладки
pretty_result = chdb.query('SELECT * FROM system.numbers LIMIT 3', 'Pretty')
print(pretty_result)
```


### Операции с DataFrame {#dataframe-operations}

#### Устаревший API DataFrame

```python
import chdb.dataframe as cdf
import pandas as pd

# Объединение нескольких DataFrame
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
    sql="SELECT * FROM __tbl1__ t1 JOIN __tbl2__ t2 ON t1.a = t2.c",
    tbl1=df1, 
    tbl2=df2
)
print(result_df)

# Запрос к результирующему DataFrame
summary = result_df.query('SELECT b, sum(a) FROM __table__ GROUP BY b')
print(summary)
```


#### Табличный движок Python (рекомендуется)

```python
import chdb
import pandas as pd
import pyarrow as pa

# Прямой запрос к Pandas DataFrame
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

# Прямой запрос к DataFrame с поддержкой JSON
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

# Запрос к Arrow Table
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


### Сеансы с сохранением состояния

Сессии поддерживают состояние запросов между несколькими операциями, что позволяет реализовывать сложные рабочие процессы:

```python
from chdb import session

# Временная сессия (автоматическая очистка)
sess = session.Session()

# Или постоянная сессия с указанием пути
# sess = session.Session("/путь/к/данным")

# Создать базу данных и таблицы
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

# Вставить данные
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")

# Создать материализованные представления
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")

# Запросить представление
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)

# Сессия автоматически управляет ресурсами
sess.close()  # Необязательно — автоматически закрывается при удалении объекта
```


### Расширенные возможности сессий

```python
# Сессия с пользовательскими настройками
sess = session.Session(
    path="/tmp/analytics_db",
)

# Оптимизация производительности запросов
result = sess.query("""
    SELECT product, sum(amount) as total
    FROM sales 
    GROUP BY product
    ORDER BY total DESC
    SETTINGS max_threads = 4
""", "JSON")
```

См. также: [test&#95;stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).


### Интерфейс Python DB-API 2.0

Стандартный интерфейс доступа к базе данных для совместимости с существующими приложениями на Python:

```python
import chdb.dbapi as dbapi

# Проверка информации о драйвере
print(f"Версия драйвера chDB: {dbapi.get_client_info()}")

# Создание соединения
conn = dbapi.connect()
cursor = conn.cursor()

# Выполнение запросов с параметрами
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))

# Получение метаданных
print("Описание столбцов:", cursor.description)
print("Количество строк:", cursor.rowcount)

# Получение результатов
print("Первая строка:", cursor.fetchone())
print("Следующие 2 строки:", cursor.fetchmany(2))

# Получение оставшихся строк
for row in cursor.fetchall():
    print("Строка:", row)

# Пакетные операции
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

Расширяйте SQL с помощью пользовательских функций, написанных на Python:

#### Основы использования пользовательских функций (UDF)

```python
from chdb.udf import chdb_udf
from chdb import query

# Простая математическая функция
@chdb_udf()
def add_numbers(a, b):
    return int(a) + int(b)

# Функция обработки строк
@chdb_udf()
def reverse_string(text):
    return text[::-1]

# Функция обработки JSON  
@chdb_udf()
def extract_json_field(json_str, field):
    import json
    try:
        data = json.loads(json_str)
        return str(data.get(field, ''))
    except:
        return ''

# Использование пользовательских функций в запросах
result = query("""
    SELECT 
        add_numbers('10', '20') as sum_result,
        reverse_string('hello') as reversed,
        extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)
```


#### Продвинутые UDF с пользовательскими типами возвращаемых значений

```python
# UDF с указанным типом возвращаемого значения
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # Преобразование см в метры
    weight = float(weight_str)
    return weight / (height * height)

# UDF для проверки данных
@chdb_udf(return_type="UInt8") 
def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return 1 if re.match(pattern, email) else 0

# Использование в сложных запросах
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


#### Рекомендации по использованию UDF

1. **Stateless Functions**: функции UDF должны быть чистыми, без побочных эффектов
2. **Import Inside Functions**: все необходимые модули должны импортироваться внутри UDF
3. **String Input/Output**: все параметры UDF являются строками (формат TabSeparated)
4. **Error Handling**: добавляйте блоки try-catch для повышения устойчивости UDF к ошибкам
5. **Performance**: UDF вызываются для каждой строки, поэтому оптимизируйте их с учетом производительности

```python
# Хорошо структурированная UDF с обработкой ошибок
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

# Использование со сложным вложенным JSON
query("""
    SELECT safe_json_extract(
        '{"user": {"profile": {"name": "Alice", "age": 25}}}',
        'user.profile.name'
    ) as extracted_name
""")
```


### Потоковая обработка запросов

Обрабатывайте большие наборы данных при фиксированном объёме потребляемой памяти:

```python
from chdb import session

sess = session.Session()

# Настройка большого набора данных
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")

# Пример 1: Базовая потоковая передача с менеджером контекста
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"Обработан фрагмент: {chunk_rows} строк")
        
        # Досрочное завершение при необходимости
        if total_rows > 100000:
            break

print(f"Всего обработано строк: {total_rows}")

# Пример 2: Ручная итерация с явной очисткой
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # Обработка данных фрагмента
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # Пропуск пустых строк
            processed_count += 1
    
    print(f"Обработано {processed_count} записей на данный момент...")
    
stream.close()  # Важно: явная очистка

# Пример 3: Интеграция Arrow для внешних библиотек
import pyarrow as pa
from deltalake import write_deltalake

# Потоковая передача результатов в формате Arrow
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")

# Создание RecordBatchReader с пользовательским размером пакета
batch_reader = stream.record_batch(rows_per_batch=10000)

# Экспорт в Delta Lake
write_deltalake(
    table_or_uri="./my_delta_table",
    data=batch_reader,
    mode="overwrite"
)

stream.close()
sess.close()
```


### Табличный движок Python {#python-table-engine}

#### Выполнение запросов к DataFrame в Pandas

```python
import chdb
import pandas as pd

# Сложный DataFrame с вложенными данными
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

# Расширенные запросы с JSON-операциями
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

# Оконные функции на DataFrames
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


#### Пользовательские источники данных с PyReader

Реализуйте пользовательские ридеры данных для специализированных источников данных:

````python
import chdb
from typing import List, Tuple, Any
import json

class DatabaseReader(chdb.PyReader):
    """Пользовательский читатель для источников данных, подобных базам данных"""
    
    def __init__(self, connection_string: str):
        # Имитация подключения к базе данных
        self.data = self._load_data(connection_string)
        self.cursor = 0
        self.batch_size = 1000
        super().__init__(self.data)
    
    def _load_data(self, conn_str):
        # Имитация загрузки из базы данных
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
        """Определяет схему таблицы с явным указанием типов"""
        return [
            ("id", "UInt64"),
            ("name", "String"),
            ("score", "Int64"),
            ("metadata", "String")  # JSON хранится в виде строки
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """Читает данные пакетами"""
        if self.cursor >= len(self.data["id"]):
            return []  # Больше нет данных
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # Возвращает данные для запрошенных столбцов
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # Обработка отсутствующих столбцов
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### Определение типов и обработка JSON                                

chDB автоматически обрабатывает сложные вложенные структуры данных:

```python
import pandas as pd
import chdb

# DataFrame со смешанными JSON-объектами
df_with_json = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "profile": [
        {"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
        {"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
        {"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
        {"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
    ]
})

# Управление определением типов JSON с помощью настроек
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- Анализ всех строк для обнаружения JSON
""", "Pretty")
print(result)

# Расширенные операции с JSON
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


## Производительность и оптимизация {#performance-optimization}

### Бенчмарки {#benchmarks}

chDB стабильно превосходит другие встроенные движки:

- **Операции с DataFrame**: в 2–5 раз быстрее, чем традиционные библиотеки DataFrame для аналитических запросов
- **Обработка Parquet**: сопоставима с лучшими колонночными движками
- **Эффективность использования памяти**: меньший объём потребляемой памяти по сравнению с альтернативами

[Подробнее о результатах бенчмарков](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### Рекомендации по оптимизации производительности

```python
import chdb

# 1. Используйте соответствующие форматы вывода
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # Для анализа
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # Для взаимодействия
native_result = chdb.query("SELECT * FROM large_table", "Native")   # Для передачи между chDB

# 2. Оптимизируйте запросы с помощью настроек
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")

# 3. Используйте потоковую обработку для больших наборов данных
from chdb import session

sess = session.Session()

# Настройка большого набора данных
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")

# Потоковая обработка с постоянным использованием памяти
total_amount = 0
processed_rows = 0

with sess.send_query("SELECT customer_id, sum(amount) as total FROM large_sales GROUP BY customer_id", "JSONEachRow") as stream:
    for chunk in stream:
        lines = chunk.data().strip().split('\n')
        for line in lines:
            if line:  # Пропуск пустых строк
                import json
                row = json.loads(line)
                total_amount += row['total']
                processed_rows += 1
        
        print(f"Обработано {processed_rows} записей клиентов, текущая сумма: {total_amount}")
        
        # Досрочное завершение для демонстрации
        if processed_rows > 1000:
            break

print(f"Итоговый результат: обработано {processed_rows} клиентов, общая сумма: {total_amount}")

# Потоковая передача во внешние системы (например, Delta Lake)
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)

# Обработка пакетами
for batch in batch_reader:
    print(f"Обработка пакета с {batch.num_rows} строками...")
    # Преобразование или экспорт каждого пакета
    # df_batch = batch.to_pandas()
    # process_batch(df_batch)

stream.close()
sess.close()
```


## Репозиторий GitHub {#github-repository}

- **Основной репозиторий**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Обращения и поддержка**: создавайте обращения в [репозитории на GitHub](https://github.com/chdb-io/chdb/issues)