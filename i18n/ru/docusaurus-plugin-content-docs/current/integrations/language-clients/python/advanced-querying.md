---
sidebar_label: 'Расширенные запросы'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'Расширенные запросы с использованием ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-querying
title: 'Расширенные запросы'
doc_type: 'reference'
---



# Расширенное использование ClickHouse Connect для выполнения запросов к данным {#querying-data-with-clickhouse-connect--advanced-usage}



## QueryContexts

ClickHouse Connect выполняет стандартные запросы внутри объекта `QueryContext`. `QueryContext` содержит основные структуры, которые используются для построения запросов к базе данных ClickHouse, а также конфигурацию, применяемую для обработки результата в `QueryResult` или другую структуру данных ответа. Сюда входят сам запрос, параметры, настройки, форматы чтения и другие свойства.

Объект `QueryContext` можно получить с помощью клиентского метода `create_query_context`. Этот метод принимает те же параметры, что и базовый метод выполнения запроса. Затем этот контекст запроса может быть передан в методы `query`, `query_df` или `query_np` в виде именованного аргумента `context` вместо любого или всех остальных аргументов этих методов. Обратите внимание, что дополнительные аргументы, указанные при вызове метода, переопределят любые свойства `QueryContext`.

Наиболее наглядный вариант использования `QueryContext` — отправка одного и того же запроса с разными значениями параметров привязки. Все значения параметров можно обновить, вызвав метод `QueryContext.set_parameters` со словарём, либо любое отдельное значение можно обновить, вызвав `QueryContext.set_parameter` с нужной парой `key`, `value`.

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'
```

Обратите внимание, что `QueryContext` не является потокобезопасным, но его копию можно получить в многопоточной среде, вызвав метод `QueryContext.updated_copy`.


## Потоковые запросы

ClickHouse Connect Client предоставляет несколько методов для получения данных в виде потока (реализовано как генератор Python):

* `query_column_block_stream` -- Возвращает данные запроса по блокам в виде последовательности столбцов, используя обычные объекты Python
* `query_row_block_stream` -- Возвращает данные запроса в виде блока строк, используя обычные объекты Python
* `query_rows_stream` -- Возвращает данные запроса в виде последовательности строк, используя обычные объекты Python
* `query_np_stream` -- Возвращает каждый блок данных запроса ClickHouse в виде массива NumPy
* `query_df_stream` -- Возвращает каждый блок ClickHouse с данными запроса в виде Pandas DataFrame
* `query_arrow_stream` -- Возвращает данные запроса в виде PyArrow RecordBlocks
* `query_df_arrow_stream` -- Возвращает каждый блок ClickHouse с данными запроса в виде Pandas DataFrame на базе Arrow или Polars DataFrame в зависимости от аргумента `dataframe_library` (по умолчанию «pandas»).

Каждый из этих методов возвращает объект `ContextStream`, который должен использоваться внутри оператора `with`, чтобы начать чтение потока.

### Блоки данных

ClickHouse Connect обрабатывает все данные из основного метода `query` как поток блоков, получаемых от сервера ClickHouse. Эти блоки передаются в специальном формате «Native» между клиентом и ClickHouse. «Блок» — это просто последовательность столбцов двоичных данных, где каждый столбец содержит одинаковое количество значений заданного типа данных. (Как колоночная база данных, ClickHouse хранит эти данные в похожем виде.) Размер блока, возвращаемого запросом, регулируется двумя пользовательскими настройками, которые могут быть заданы на нескольких уровнях (профиль пользователя, пользователь, сессия или запрос). Они:

* [max&#95;block&#95;size](/operations/settings/settings#max_block_size) -- Ограничение на размер блока в строках. По умолчанию 65536.
* [preferred&#95;block&#95;size&#95;bytes](/operations/settings/settings#preferred_block_size_bytes) -- Мягкое ограничение на размер блока в байтах. По умолчанию 1,000,0000.

Независимо от `preferred_block_size_setting`, размер блока никогда не превышает `max_block_size` строк. В зависимости от типа запроса фактические возвращаемые блоки могут быть любого размера. Например, запросы к распределённой таблице, охватывающей множество шардов, могут содержать более мелкие блоки, получаемые напрямую от каждого шарда.

При использовании одного из клиентских методов `query_*_stream` результаты возвращаются по блокам. ClickHouse Connect загружает только один блок за раз. Это позволяет обрабатывать большие объёмы данных без необходимости загружать весь большой результат запроса в память. Обратите внимание, что приложение должно быть готово обрабатывать любое количество блоков, и точный размер каждого блока не может быть заранее задан.

### HTTP-буфер данных при медленной обработке

Из-за ограничений протокола HTTP, если блоки обрабатываются с заметно меньшей скоростью, чем сервер ClickHouse передаёт данные в потоковом режиме, сервер ClickHouse закроет соединение, что приведёт к возникновению исключения в потоке обработки. Частично это можно компенсировать, увеличив размер HTTP-буфера потоковой передачи (по умолчанию 10 мегабайт) с помощью общей настройки `http_buffer_size`. Большие значения `http_buffer_size` допустимы в этой ситуации, если приложению доступно достаточно памяти. Данные в буфере хранятся в сжатом виде при использовании сжатия `lz4` или `zstd`, поэтому использование этих типов сжатия увеличит общий доступный буфер.

### StreamContexts

Каждый из методов `query_*_stream` (например, `query_row_block_stream`) возвращает объект ClickHouse `StreamContext`, который представляет собой комбинированный контекст-менеджер/генератор Python. Базовое использование выглядит так:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <выполните операции с каждой строкой данных о поездках>
```

Имейте в виду, что попытка использовать `StreamContext` без оператора `with` приведёт к ошибке. Использование контекстного менеджера Python гарантирует, что поток (в данном случае потоковый HTTP‑ответ) будет корректно закрыт, даже если не все данные были прочитаны и/или во время обработки было возбуждено исключение. Кроме того, `StreamContext` можно использовать только один раз для чтения потока. Попытка использовать `StreamContext` после выхода из него приведёт к возникновению `StreamClosedError`.

Вы можете использовать свойство `source` объекта `StreamContext` для доступа к родительскому объекту `QueryResult`, который содержит имена и типы столбцов.

### Типы потоков


Метод `query_column_block_stream` возвращает блок как последовательность данных по столбцам, хранящихся в виде нативных типов данных Python. Используя приведённые выше запросы к `taxi_trips`, возвращаемые данные будут списком, где каждый элемент списка — это другой список (или кортеж), содержащий все данные для соответствующего столбца. Таким образом, `block[0]` будет кортежем, содержащим только строки. Форматы, ориентированные на столбцы, чаще всего используются для выполнения агрегирующих операций по всем значениям в столбце, например для суммирования общей стоимости поездок.

Метод `query_row_block_stream` возвращает блок как последовательность строк, как в традиционной реляционной базе данных. Для поездок на такси возвращаемые данные будут списком, где каждый элемент списка — это другой список, представляющий строку данных. Таким образом, `block[0]` будет содержать все поля (по порядку) для первой поездки на такси, `block[1]` будет содержать строку со всеми полями для второй поездки на такси и так далее. Ориентированные на строки результаты обычно используются для отображения или для процессов трансформации данных.

Метод `query_row_stream` — это вспомогательный метод, который автоматически переходит к следующему блоку при итерации по потоку. В остальном он идентичен `query_row_block_stream`.

Метод `query_np_stream` возвращает каждый блок как двумерный массив NumPy. Внутренне массивы NumPy (обычно) хранятся по столбцам, поэтому отдельные методы для строк или столбцов не нужны. «Форма» массива NumPy будет выражаться как (столбцы, строки). Библиотека NumPy предоставляет множество методов для манипулирования массивами NumPy. Обратите внимание, что если все столбцы в запросе имеют один и тот же dtype NumPy, возвращаемый массив NumPy также будет иметь только один dtype и может быть изменён по форме/повёрнут без фактического изменения его внутренней структуры.

Метод `query_df_stream` возвращает каждый блок ClickHouse как двумерный DataFrame библиотеки Pandas. Вот пример, который показывает, что объект `StreamContext` может использоваться как контекст в отложенном режиме (но только один раз).

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <выполните действия с pandas DataFrame>
```

Метод `query_df_arrow_stream` возвращает каждый блок ClickHouse как DataFrame с подсистемой типов данных PyArrow (dtype backend). Этот метод поддерживает как Pandas (версии 2.x и новее), так и Polars DataFrame через параметр `dataframe_library` (по умолчанию `"pandas"`). Каждая итерация возвращает DataFrame, преобразованный из пакетов записей PyArrow (record batches), что обеспечивает более высокую производительность и эффективность использования памяти для некоторых типов данных.

Наконец, метод `query_arrow_stream` возвращает результат в формате ClickHouse `ArrowStream` в виде объекта `pyarrow.ipc.RecordBatchStreamReader`, обёрнутого в `StreamContext`. Каждая итерация потока возвращает объект PyArrow RecordBlock.

### Примеры потоковой выборки

#### Потоковая выборка строк

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# Построчное чтение больших наборов результатов

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # Обрабатываем каждую строку

# Вывод:

# (0, 0)

# (1, 2)

# (2, 4)

# ....

````

#### Потоковая передача блоков строк {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Потоковая передача блоками строк (эффективнее, чем построчно)

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# Вывод:

# Получен блок с 65409 строк

# Получен блок с 34591 строк

````

#### Потоковая передача Pandas DataFrames {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Потоковая передача результатов запроса в виде DataFrame Pandas

with client.query&#95;df&#95;stream(&quot;SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000&quot;) as stream:
for df in stream:

# Обработка каждого блока DataFrame

print(f&quot;Received DataFrame with {len(df)} rows&quot;)
print(df.head(3))

# Вывод:

# Получен DataFrame с 65409 строками

# number str

# 0       0   0

# 1       1   1

# 2       2   2

# Получен DataFrame с 34591 строкой

# number    str

# 0   65409  65409

# 1   65410  65410

# 2   65411  65411

````

#### Потоковые пакеты Arrow {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Потоковая передача результатов запроса в виде пакетов записей Arrow

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# Обрабатываем каждый пакет Arrow

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# Вывод:

# Получен пакет Arrow с 65409 строками

# Получен пакет Arrow с 34591 строками

```
```


## Запросы с использованием NumPy, Pandas и Arrow

ClickHouse Connect предоставляет специализированные методы выполнения запросов для работы со структурами данных NumPy, Pandas и Arrow. Эти методы позволяют получать результаты запросов напрямую в этих популярных форматах данных, не прибегая к ручному преобразованию.

### Запросы NumPy

Метод `query_np` возвращает результаты запроса в виде массива NumPy вместо объекта `QueryResult` ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# Запрос возвращает массив NumPy
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(np_array))

# Вывод:

# <class "numpy.ndarray">


print(np&#95;array)

# Результат:

# [[0 0]

# [1 2]

# [2 4]

# [3 6]

# [4 8]]

````

### Запросы Pandas {#pandas-queries}

Метод `query_df` возвращает результаты запроса в виде Pandas DataFrame вместо объекта `QueryResult` из ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Запрос возвращает объект Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(df))

# Вывод: <class "pandas.core.frame.DataFrame">

print(df)

# Вывод:

# number doubled

# 0 0 0

# 1 1 2

# 2 2 4

# 3 3 6

# 4 4 8

````

### Запросы PyArrow {#pyarrow-queries}

Метод `query_arrow` возвращает результаты запроса в виде таблицы PyArrow. Он напрямую использует формат `Arrow` ClickHouse, поэтому принимает только три общих с основным методом `query` аргумента: `query`, `parameters` и `settings`. Кроме того, имеется дополнительный аргумент `use_strings`, который определяет, будут ли типы String ClickHouse отображаться в таблице Arrow как строки (при значении True) или как байты (при значении False).

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# Запрос возвращает таблицу PyArrow
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



print(type(arrow_table))

# Output:

# <class "pyarrow.lib.Table">


print(arrow&#95;table)

# Вывод:

# pyarrow.Table

# number: uint64 not null

# str: string not null

# ----

# number: [[0,1,2]]

# str: [[&quot;0&quot;,&quot;1&quot;,&quot;2&quot;]]

````

### DataFrame на основе Arrow {#arrow-backed-dataframes}

ClickHouse Connect поддерживает быстрое и эффективное по памяти создание DataFrame из результатов Arrow с помощью методов `query_df_arrow` и `query_df_arrow_stream`. Это тонкие обёртки над методами запросов Arrow, которые выполняют преобразования в DataFrame без копирования данных там, где это возможно:

- `query_df_arrow`: Выполняет запрос с использованием выходного формата ClickHouse `Arrow` и возвращает DataFrame.
  - Для `dataframe_library='pandas'` возвращает pandas 2.x DataFrame с использованием типов данных на основе Arrow (`pd.ArrowDtype`). Требуется pandas 2.x и использует буферы без копирования там, где это возможно, для отличной производительности и низких затрат памяти.
  - Для `dataframe_library='polars'` возвращает Polars DataFrame, созданный из таблицы Arrow (`pl.from_arrow`), что также эффективно и может выполняться без копирования в зависимости от данных.
- `query_df_arrow_stream`: Передаёт результаты в виде последовательности DataFrame (pandas 2.x или Polars), преобразованных из пакетов потока Arrow.

#### Запрос к DataFrame на основе Arrow {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Запрос возвращает DataFrame pandas с типами данных Arrow (требуется pandas 2.x)
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)



print(df.dtypes)
# Результат:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object



# Или используйте Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# Результат:
# [UInt64, String]




# Потоковая передача в пакеты DataFrame (показан polars)

with client.query_df_arrow_stream(
"SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
for df_batch in stream:
print(f"Получен пакет {type(df_batch)} с {len(df_batch)} строками и dtypes: {df_batch.dtypes}") # Output: # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String] # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]

```

#### Примечания и предостережения {#notes-and-caveats}
- Сопоставление типов Arrow: При возврате данных в формате Arrow ClickHouse сопоставляет типы с ближайшими поддерживаемыми типами Arrow. Некоторые типы ClickHouse не имеют нативного эквивалента в Arrow и возвращаются в виде необработанных байтов в полях Arrow (обычно `BINARY` или `FIXED_SIZE_BINARY`).
  - Примеры: `IPv4` представляется как Arrow `UINT32`; `IPv6` и большие целые числа (`Int128/UInt128/Int256/UInt256`) часто представляются как `FIXED_SIZE_BINARY`/`BINARY` с необработанными байтами.
  - В этих случаях столбец DataFrame будет содержать байтовые значения, поддерживаемые полем Arrow; клиентский код должен интерпретировать/преобразовывать эти байты в соответствии с семантикой ClickHouse.
- Неподдерживаемые типы данных Arrow (например, UUID/ENUM как истинные типы Arrow) не выводятся; значения представляются с использованием ближайшего поддерживаемого типа Arrow (часто в виде двоичных байтов) для вывода.
- Требование Pandas: типы данных на основе Arrow требуют pandas 2.x. Для более старых версий pandas используйте вместо этого `query_df` (без Arrow).
- Строки и двоичные данные: опция `use_strings` (когда поддерживается настройкой сервера `output_format_arrow_string_as_string`) управляет тем, возвращаются ли столбцы ClickHouse `String` как строки Arrow или как двоичные данные.

#### Примеры преобразования несовпадающих типов ClickHouse/Arrow {#mismatched-clickhousearrow-type-conversion-examples}

Когда ClickHouse возвращает столбцы в виде необработанных двоичных данных (например, `FIXED_SIZE_BINARY` или `BINARY`), код приложения должен преобразовать эти байты в соответствующие типы Python. Приведенные ниже примеры показывают, что некоторые преобразования возможны с использованием API библиотек DataFrame, в то время как другие могут требовать чистых подходов Python, таких как `struct.unpack` (которые жертвуют производительностью, но сохраняют гибкость).

```


Столбцы типа `Date` могут поступать как `UINT16` (количество дней с начала Unix‑эпохи, 1970‑01‑01). Преобразование в DataFrame выполняется эффективно и просто:

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


Столбцы, такие как `Int128`, могут приходить в виде `FIXED_SIZE_BINARY` с сырыми байтами. Polars предоставляет встроенную поддержку 128-битных целых чисел:

```python
# Polars — нативная поддержка
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

По состоянию на NumPy 2.3 нет общедоступного 128-битного целочисленного типа dtype, поэтому нам приходится использовать чистый Python и можно сделать, например, следующее:


```python
# Предположим, у нас есть pandas DataFrame со столбцом Int128 типа fixed_size_binary[16][pyarrow]
```


print(df)
# Вывод:
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...



print([int.from&#95;bytes(n, byteorder=&quot;little&quot;) for n in df[&quot;int&#95;128&#95;col&quot;].to&#95;list()])

# Результат:

# [1234567898765432123456789, 8, 456789123456789]

```

Главный вывод: прикладной код должен выполнять эти преобразования с учётом возможностей выбранной библиотеки DataFrame и приемлемых компромиссов по производительности. Если встроенные в DataFrame механизмы преобразования недоступны, по‑прежнему можно использовать подходы на чистом Python.
```


## Форматы чтения

Форматы чтения определяют типы данных значений, возвращаемых методами клиента `query`, `query_np` и `query_df`. (`raw_query` и `query_arrow` не изменяют исходные данные из ClickHouse, поэтому управление форматом к ним не применяется.) Например, если формат чтения для UUID изменён с формата по умолчанию `native` на альтернативный формат `string`, результат запроса ClickHouse к столбцу типа `UUID` будет возвращён в виде строковых значений (в стандартном формате 8-4-4-4-12 RFC 1422) вместо объектов Python UUID.

Аргумент «data type» для любой функции форматирования может включать подстановочные символы. Формат задаётся одной строкой в нижнем регистре.

Форматы чтения могут задаваться на нескольких уровнях:

* Глобально — с использованием методов, определённых в пакете `clickhouse_connect.datatypes.format`. Это управляет форматом настроенного типа данных для всех запросов.

```python
from clickhouse_connect.datatypes.format import set_read_format
```


# Возвращать значения и IPv6, и IPv4 в виде строк
set_read_format('IPv*', 'string')



# Возвращать все типы Date в виде количества секунд или дней с начала эпохи

set&#95;read&#95;format(&#39;Date*&#39;, &#39;int&#39;)

````
- Для всего запроса, используя необязательный словарный аргумент `query_formats`. В этом случае любой столбец (или подстолбец) указанного типа данных будет использовать заданный формат.
```python
# Возвращать все столбцы типа UUID в виде строк
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

* Для значений отдельного столбца с использованием необязательного аргумента-словаря `column_formats`. Ключом является имя столбца, возвращаемое ClickHouse, а значением — формат для этого столбца данных или вложенный словарь второго уровня «format», в котором ключом выступает имя типа ClickHouse, а значением — формат выполнения запроса. Этот дополнительный словарь можно использовать для вложенных типов столбцов, таких как Tuples или Maps.

```python
# Возвращайте значения IPv6 в столбце `dev_address` как строки
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### Варианты форматов чтения (типы Python)

| Тип ClickHouse        | Нативный тип Python     | Форматы чтения    | Комментарии                                                                                                                                     |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                                                 |
| UInt64                | int                     | signed            | Superset в данный момент не обрабатывает большие беззнаковые значения UInt64                                                                    |
| [U]Int[128,256]       | int                     | string            | Значения int в Pandas и NumPy имеют максимум 64 бита, поэтому они могут возвращаться как строки                                                 |
| BFloat16              | float                   | -                 | Все числа с плавающей запятой в Python внутренне хранятся в 64 битах                                                                            |
| Float32               | float                   | -                 | Все числа с плавающей запятой в Python внутренне хранятся в 64 битах                                                                            |
| Float64               | float                   | -                 |                                                                                                                                                 |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                                                 |
| String                | string                  | bytes             | Столбцы ClickHouse типа String не имеют встроенной кодировки, поэтому также используются для бинарных данных переменной длины                   |
| FixedString           | bytes                   | string            | FixedString — это байтовые массивы фиксированного размера, но иногда обрабатываются как строки Python                                           |
| Enum[8,16]            | string                  | string, int       | Перечисления Python не принимают пустые строки, поэтому все enum-значения выводятся либо как строки, либо как соответствующее значение типа int |
| Date                  | datetime.date           | int               | ClickHouse хранит Date как количество дней с 01/01/1970. Это значение доступно как int                                                          |
| Date32                | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                                                          |
| DateTime              | datetime.datetime       | int               | ClickHouse хранит DateTime в секундах Unix-эпохи. Это значение доступно как int                                                                 |
| DateTime64            | datetime.datetime       | int               | В Python datetime.datetime ограничен микросекундной точностью. Доступно «сырое» 64-битное значение типа int                                     |
| Time                  | datetime.timedelta      | int, string, time | Момент времени сохраняется как Unix timestamp. Это значение доступно как int                                                                    |
| Time64                | datetime.timedelta      | int, string, time | В Python datetime.timedelta ограничен микросекундной точностью. Доступно «сырое» 64-битное значение типа int                                    |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP-адреса можно читать как строки, а корректно отформатированные строки можно вставлять как IP-адреса                                           |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP-адреса можно читать как строки, а корректно отформатированные строки можно вставлять как IP-адреса                                           |
| Tuple                 | dict or tuple           | tuple, json       | Именованные кортежи по умолчанию возвращаются как словари. Именованные кортежи также могут возвращаться как JSON-строки                         |
| Map                   | dict                    | -                 |                                                                                                                                                 |
| Nested                | Sequence[dict]          | -                 |                                                                                                                                                 |
| UUID                  | uuid.UUID               | string            | UUID можно читать как строки, отформатированные в соответствии с RFC 4122<br />                                                                 |
| JSON                  | dict                    | string            | По умолчанию возвращается словарь Python. Формат `string` вернёт строку в формате JSON                                                          |
| Variant               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, сохранённого для значения                                                     |
| Dynamic               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, сохранённого для значения                                                     |


## Внешние данные

Запросы ClickHouse могут принимать внешние данные в любом формате ClickHouse. Эти двоичные данные отправляются вместе с текстом запроса и используются для обработки данных. Подробности о функции External Data описаны [здесь](/engines/table-engines/special/external-data.md). Методы клиента `query*` принимают необязательный параметр `external_data` для использования этой функциональности. Значением параметра `external_data` должен быть объект `clickhouse_connect.driver.external.ExternalData`. Конструктор этого объекта принимает следующие аргументы:

| Name          | Type              | Description                                                                                                                                        |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| file&#95;path | str               | Путь к файлу в локальной файловой системе, из которого будут прочитаны внешние данные. Требуется либо `file_path`, либо `data`                     |
| file&#95;name | str               | Имя внешнего &quot;файла&quot; с данными. Если не указано, будет определено из `file_path` (без расширения)                                        |
| data          | bytes             | Внешние данные в двоичном виде (вместо чтения из файла). Требуется либо `data`, либо `file_path`                                                   |
| fmt           | str               | [Входной формат](/sql-reference/formats.mdx) ClickHouse для данных. По умолчанию `TSV`                                                             |
| types         | str or seq of str | Список типов данных столбцов во внешних данных. Если указана строка, типы должны быть разделены запятыми. Требуется либо `types`, либо `structure` |
| structure     | str or seq of str | Список пар &quot;имя столбца + тип данных&quot; в данных (см. примеры). Требуется либо `structure`, либо `types`                                   |
| mime&#95;type | str               | Необязательный MIME-тип файловых данных. В настоящее время ClickHouse игнорирует этот HTTP-подзаголовок                                            |

Чтобы отправить запрос с внешним CSV-файлом, содержащим данные о фильмах, и объединить эти данные с таблицей `directors`, уже существующей на сервере ClickHouse:

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

Дополнительные внешние файлы данных можно добавить к исходному объекту `ExternalData` с помощью метода `add_file`, который принимает те же параметры, что и конструктор. При использовании HTTP все внешние данные передаются как часть загрузки файла в формате `multipart/form-data`.


## Часовые пояса {#time-zones}
Существует несколько механизмов применения часового пояса к значениям ClickHouse `DateTime` и `DateTime64`. Внутри сервера ClickHouse любой объект `DateTime` или `DateTime64` всегда хранится как число без информации о часовом поясе, представляющее количество секунд, прошедших с начала эпохи (1970-01-01 00:00:00 UTC). Для значений `DateTime64` представление может быть в миллисекундах, микросекундах или наносекундах с начала эпохи, в зависимости от заданной точности. В результате применение любой информации о часовом поясе всегда выполняется на стороне клиента. Имейте в виду, что это влечет за собой дополнительные вычисления, поэтому в приложениях с высокими требованиями к производительности рекомендуется рассматривать типы `DateTime` как метки времени в формате epoch, за исключением пользовательского отображения и конвертации (например, объекты Pandas `Timestamp` всегда представляют собой 64-битное целое число, соответствующее количеству наносекунд с начала эпохи, для повышения производительности).

При использовании учитывающих часовой пояс типов данных в запросах — в частности, объекта Python `datetime.datetime` — `clickhouse-connect` применяет часовой пояс на стороне клиента в соответствии со следующими правилами приоритета:

1. Если для метода запроса указан параметр `client_tzs`, применяется указанный часовой пояс для столбца.
2. Если у столбца ClickHouse есть метаданные часового пояса (то есть его тип выглядит как `DateTime64(3, 'America/Denver')`), применяется часовой пояс столбца ClickHouse. (Обратите внимание, что такие метаданные часового пояса недоступны для `clickhouse-connect` для столбцов типа `DateTime` в версиях ClickHouse до 23.2.)
3. Если для метода запроса указан параметр `query_tz`, применяется «часовой пояс запроса».
4. Если к запросу или сессии применена настройка часового пояса, используется этот часовой пояс. (Эта функциональность еще не выпущена в сервере ClickHouse.)
5. Наконец, если у клиента параметр `apply_server_timezone` установлен в `True` (значение по умолчанию), применяется часовой пояс сервера ClickHouse.

Обратите внимание, что если примененный в соответствии с этими правилами часовой пояс — UTC, `clickhouse-connect` _всегда_ вернет объект Python `datetime.datetime` без информации о часовом поясе. При необходимости дополнительная информация о часовом поясе затем может быть добавлена к этому объекту без часового пояса прикладным кодом.
