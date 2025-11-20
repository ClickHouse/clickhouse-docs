---
title: 'Установка chDB для Python'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Установка chDB для Python'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---



## Требования {#requirements}

- Python 3.8+
- Поддерживаемые платформы: macOS и Linux (x86_64 и ARM64)


## Установка {#install}

```bash
pip install chdb
```


## Использование {#usage}

### Интерфейс командной строки {#command-line-interface}

Запуск SQL-запросов напрямую из командной строки:


```bash
# Базовый запрос
python3 -m chdb "SELECT 1, 'abc'" Pretty
```


# Запрос с указанием формата

python3 -m chdb &quot;SELECT version()&quot; JSON

````

### Базовое использование Python {#basic-python-usage}

```python
import chdb
````


# Простой запрос
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)



# Получение статистики запроса

print(f&quot;Прочитано строк: {result.rows_read()}&quot;)
print(f&quot;Прочитано байт: {result.bytes_read()}&quot;)
print(f&quot;Время выполнения: {result.elapsed()} секунд&quot;)

````

### API на основе соединений (рекомендуется) {#connection-based-api}

Для более эффективного управления ресурсами и повышения производительности:

```python
import chdb
````


# Создать подключение (по умолчанию в памяти)
conn = chdb.connect(":memory:")
# Или использовать файловое хранилище: conn = chdb.connect("mydata.db")



# Создаём курсор для выполнения запроса
cur = conn.cursor()



# Выполнение запросов
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")



# Получение результатов разными способами
print(cur.fetchone())    # Одна строка: (0, '0')
print(cur.fetchmany(2))  # Несколько строк: ((1, '1'), (2, '2'))



# Получение метаданных
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']



# Использование курсора в качестве итератора
for row in cur:
    print(row)



# Всегда закрывайте ресурсы

cur.close()
conn.close()

```
```


## Методы ввода данных {#data-input}

### Файловые источники данных {#file-based-data-sources}

chDB поддерживает более 70 форматов данных для прямых запросов к файлам:


```python
import chdb
# Подготовьте данные
# ...
```


# Запрос к файлам Parquet
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')



# Запрос к CSV-файлу с заголовками
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')



# Несколько форматов файлов

result = chdb.query(&quot;&quot;&quot;
SELECT * FROM file(&#39;logs*.jsonl&#39;, JSONEachRow)
WHERE timestamp &gt; &#39;2024-01-01&#39;
&quot;&quot;&quot;, &#39;Pretty&#39;)

```

### Примеры форматов вывода {#output-format-examples}
```


```python
# DataFrame для анализа
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>
```


# Таблица Arrow для обеспечения совместимости

arrow_table = chdb.query('SELECT \* FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table)) # <class 'pyarrow.lib.Table'>


# JSON для API
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)



# Красивый формат для отладки

pretty&#95;result = chdb.query(&#39;SELECT * FROM system.numbers LIMIT 3&#39;, &#39;Pretty&#39;)
print(pretty&#95;result)

````

### Операции DataFrame {#dataframe-operations}

#### Устаревший API DataFrame {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd
````


# Объединение нескольких DataFrame

df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
sql="SELECT \* FROM **tbl1** t1 JOIN **tbl2** t2 ON t1.a = t2.c",
tbl1=df1,
tbl2=df2
)
print(result_df)


# Выполнение запроса к результирующему DataFrame

summary = result&#95;df.query(&#39;SELECT b, sum(a) FROM **table** GROUP BY b&#39;)
print(summary)

````

#### Движок таблиц Python (рекомендуется) {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa
````


# Непосредственное выполнение запросов к DataFrame Pandas

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

````

### Stateful sessions {#stateful-sessions}

Сессии сохраняют состояние запросов между операциями, что позволяет реализовывать сложные рабочие процессы:

```python
from chdb import session

````


# Временная сессия (автоматическая очистка)
sess = session.Session()



# Или постоянная сессия с указанным путём
# sess = session.Session("/path/to/data")



# Создание базы данных и таблиц
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



# Вставка данных
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")



# Создание материализованного представления
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")



# Выполнить запрос к представлению
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)



# Session автоматически управляет ресурсами

sess.close()  # Необязателен — автоматически закрывается при удалении объекта

```

### Расширенные возможности сеансов {#advanced-session-features}
```


```python
# Сессия с пользовательскими настройками
sess = session.Session(
    path="/tmp/analytics_db",
)
```


# Оптимизация производительности запросов

result = sess.query(&quot;&quot;&quot;
SELECT product, sum(amount) as total
FROM sales
GROUP BY product
ORDER BY total DESC
SETTINGS max&#95;threads = 4
&quot;&quot;&quot;, &quot;JSON&quot;)

````

См. также: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py).

### Интерфейс Python DB-API 2.0 {#python-db-api-20}

Стандартный интерфейс базы данных для обеспечения совместимости с существующими приложениями на Python:

```python
import chdb.dbapi as dbapi
````


# Проверка сведений о драйвере
print(f"chDB driver version: {dbapi.get_client_info()}")



# Создать соединение
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

### Пользовательские функции (UDF) {#user-defined-functions}

Расширение SQL с помощью пользовательских функций Python:

#### Базовое использование UDF {#basic-udf-usage}

```python
from chdb.udf import chdb_udf
from chdb import query
````


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



# Использование UDF в запросах

result = query("""
SELECT
add_numbers('10', '20') as sum_result,
reverse_string('hello') as reversed,
extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)

```

#### Расширенные UDF с пользовательскими типами возвращаемых значений {#advanced-udf-custom-return-types}

```


```python
# UDF с указанным типом возвращаемого значения
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # Преобразуем см в метры
    weight = float(weight_str)
    return weight / (height * height)
```


# UDF для проверки данных

@chdb_udf(return_type="UInt8")
def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return 1 if re.match(pattern, email) else 0


# Использование в сложных запросах

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

#### Рекомендации по работе с UDF {#udf-best-practices}

1. **Функции без состояния**: UDF должны быть чистыми функциями без побочных эффектов
2. **Импорт внутри функций**: Все необходимые модули должны импортироваться внутри UDF
3. **Строковый ввод/вывод**: Все параметры UDF являются строками (формат TabSeparated)
4. **Обработка ошибок**: Включайте блоки try-catch для обеспечения надёжности UDF
5. **Производительность**: UDF вызываются для каждой строки, поэтому оптимизируйте производительность
```


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
```


# Использование со сложным вложенным JSON

query("""
SELECT safe_json_extract(
'{"user": {"profile": {"name": "Alice", "age": 25}}}',
'user.profile.name'
) as extracted_name
""")

````

### Потоковая обработка запросов {#streaming-queries}

Обработка больших наборов данных с постоянным потреблением памяти:

```python
from chdb import session

sess = session.Session()

````


# Подготовка крупного набора данных
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")



# Пример 1: Базовая потоковая обработка с менеджером контекста
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"Обработан фрагмент: {chunk_rows} строк(и)")
        
        # При необходимости — досрочное завершение
        if total_rows > 100000:
            break

print(f"Всего обработано строк: {total_rows}")



# Пример 2: Ручная итерация с явным освобождением ресурсов
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # Обработка данных фрагмента
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # Пропустить пустые строки
            processed_count += 1
    
    print(f"Processed {processed_count} records so far...")
    
stream.close()  # Важно: явное освобождение ресурсов



# Пример 3: Интеграция Arrow для внешних библиотек

import pyarrow as pa
from deltalake import write_deltalake


# Потоковая передача результатов в формате Arrow
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")



# Создание RecordBatchReader с пользовательским размером пакета
batch_reader = stream.record_batch(rows_per_batch=10000)



# Экспорт в Delta Lake

write&#95;deltalake(
table&#95;or&#95;uri=&quot;./my&#95;delta&#95;table&quot;,
data=batch&#95;reader,
mode=&quot;overwrite&quot;
)

stream.close()
sess.close()

````

### Движок таблиц Python {#python-table-engine}

#### Запросы к Pandas DataFrame {#query-pandas-dataframes}

```python
import chdb
import pandas as pd
````


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


# Расширенные запросы с операциями над JSON
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



# Оконные функции для DataFrames

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

#### Пользовательские источники данных с PyReader {#custom-data-sources-pyreader}

Реализуйте пользовательские читатели данных для специализированных источников данных:

```python
import chdb
from typing import List, Tuple, Any
import json

class DatabaseReader(chdb.PyReader):
    """Пользовательский читатель для источников данных типа баз данных"""
    
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
        """Определение схемы таблицы с явными типами"""
        return [
            ("id", "UInt64"),
            ("name", "String"),
            ("score", "Int64"),
            ("metadata", "String")  # JSON хранится как строка
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """Чтение данных пакетами"""
        if self.cursor >= len(self.data["id"]):
            return []  # Больше нет данных
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # Возврат данных для запрошенных столбцов
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # Обработка отсутствующих столбцов
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### Вывод типов JSON и обработка {#json-type-inference-handling}

chDB автоматически обрабатывает сложные вложенные структуры данных:

```python
import pandas as pd
import chdb
````


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


# Управление определением JSON с помощью настроек
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- Анализировать все строки для определения JSON
""", "Pretty")
print(result)



# Расширенные операции с JSON

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


## Производительность и оптимизация {#performance-optimization}

### Тесты производительности {#benchmarks}

chDB стабильно превосходит другие встраиваемые движки:

- **Операции с DataFrame**: в 2-5 раз быстрее традиционных библиотек DataFrame для аналитических запросов
- **Обработка Parquet**: сопоставима с ведущими колоночными движками
- **Эффективность использования памяти**: меньший объем потребляемой памяти по сравнению с альтернативами

[Подробные результаты тестов производительности](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### Рекомендации по производительности {#performance-tips}

```python
import chdb

```


# 1. Используйте подходящие форматы вывода
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # Для анализа
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # Для взаимодействия с другими системами
native_result = chdb.query("SELECT * FROM large_table", "Native")   # Для обмена данными между экземплярами chDB



# 2. Оптимизация запросов с использованием настроек
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")



# 3. Используйте стриминг для больших наборов данных
from chdb import session

sess = session.Session()



# Подготовка большого набора данных
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")



# Потоковая обработка с постоянным объёмом памяти
total_amount = 0
processed_rows = 0

with sess.send_query("SELECT customer_id, sum(amount) as total FROM large_sales GROUP BY customer_id", "JSONEachRow") as stream:
    for chunk in stream:
        lines = chunk.data().strip().split('\n')
        for line in lines:
            if line:  # Пропускаем пустые строки
                import json
                row = json.loads(line)
                total_amount += row['total']
                processed_rows += 1
        
        print(f"Обработано {processed_rows} записей о клиентах, текущая сумма: {total_amount}")
        
        # Досрочное завершение для демонстрации
        if processed_rows > 1000:
            break

print(f"Итоговый результат: обработано {processed_rows} клиентов, общая сумма: {total_amount}")



# Потоковая передача во внешние системы (например, Delta Lake)
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)



# Обработка по пакетам

for batch in batch&#95;reader:
print(f&quot;Обработка пакета из {batch.num_rows} строк...&quot;)

# Преобразовать или экспортировать каждый пакет

# df&#95;batch = batch.to&#95;pandas()

# process&#95;batch(df&#95;batch)

stream.close()
sess.close()

```
```


## Репозиторий GitHub {#github-repository}

- **Основной репозиторий**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Вопросы и поддержка**: Сообщайте о проблемах в [репозитории GitHub](https://github.com/chdb-io/chdb/issues)
