---
sidebar_label: 'Продвинутая работа с запросами'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'Продвинутая работа с запросами с помощью ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-querying
title: 'Продвинутая работа с запросами'
doc_type: 'reference'
---



# Запрос данных с помощью ClickHouse Connect: продвинутое использование {#querying-data-with-clickhouse-connect--advanced-usage}


## QueryContexts {#querycontexts}

ClickHouse Connect выполняет стандартные запросы в контексте `QueryContext`. `QueryContext` содержит ключевые структуры, используемые для построения запросов к базе данных ClickHouse, а также конфигурацию для обработки результата в `QueryResult` или другую структуру данных ответа. Сюда входит сам запрос, параметры, настройки, форматы чтения и другие свойства.

`QueryContext` можно получить с помощью метода клиента `create_query_context`. Этот метод принимает те же параметры, что и основной метод запроса. Полученный контекст запроса можно передать в методы `query`, `query_df` или `query_np` в качестве именованного аргумента `context` вместо любых или всех других аргументов этих методов. Обратите внимание, что дополнительные аргументы, указанные при вызове метода, переопределяют любые свойства QueryContext.

Наиболее очевидный сценарий использования `QueryContext` — отправка одного и того же запроса с различными значениями параметров привязки. Все значения параметров можно обновить, вызвав метод `QueryContext.set_parameters` со словарём, или любое отдельное значение можно обновить, вызвав `QueryContext.set_parameter` с нужной парой `key`, `value`.

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

Обратите внимание, что `QueryContext` не являются потокобезопасными, но копию можно получить в многопоточной среде, вызвав метод `QueryContext.updated_copy`.


## Потоковые запросы {#streaming-queries}

Клиент ClickHouse Connect предоставляет несколько методов для получения данных в виде потока (реализованных как генератор Python):

- `query_column_block_stream` -- Возвращает данные запроса блоками в виде последовательности столбцов с использованием встроенных объектов Python
- `query_row_block_stream` -- Возвращает данные запроса в виде блока строк с использованием встроенных объектов Python
- `query_rows_stream` -- Возвращает данные запроса в виде последовательности строк с использованием встроенных объектов Python
- `query_np_stream` -- Возвращает каждый блок данных запроса ClickHouse в виде массива NumPy
- `query_df_stream` -- Возвращает каждый блок данных запроса ClickHouse в виде Pandas DataFrame
- `query_arrow_stream` -- Возвращает данные запроса в виде PyArrow RecordBlocks
- `query_df_arrow_stream` -- Возвращает каждый блок данных запроса ClickHouse в виде Pandas DataFrame на основе Arrow или Polars DataFrame в зависимости от аргумента `dataframe_library` (по умолчанию "pandas").

Каждый из этих методов возвращает объект `ContextStream`, который необходимо открыть с помощью оператора `with` для начала чтения потока.

### Блоки данных {#data-blocks}

ClickHouse Connect обрабатывает все данные из основного метода `query` как поток блоков, получаемых от сервера ClickHouse. Эти блоки передаются в специальном формате "Native" в ClickHouse и из него. "Блок" — это последовательность столбцов бинарных данных, где каждый столбец содержит одинаковое количество значений данных указанного типа. (Как колоночная база данных, ClickHouse хранит эти данные в аналогичной форме.) Размер блока, возвращаемого из запроса, определяется двумя пользовательскими настройками, которые могут быть установлены на нескольких уровнях (профиль пользователя, пользователь, сессия или запрос):

- [max_block_size](/operations/settings/settings#max_block_size) -- Ограничение на размер блока в строках. По умолчанию 65536.
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- Мягкое ограничение на размер блока в байтах. По умолчанию 1,000,0000.

Независимо от настройки `preferred_block_size_setting`, каждый блок никогда не будет содержать более `max_block_size` строк. В зависимости от типа запроса фактические возвращаемые блоки могут иметь любой размер. Например, запросы к распределённой таблице, охватывающей множество шардов, могут содержать меньшие блоки, полученные непосредственно с каждого шарда.

При использовании одного из методов клиента `query_*_stream` результаты возвращаются блок за блоком. ClickHouse Connect загружает только один блок за раз. Это позволяет обрабатывать большие объёмы данных без необходимости загружать весь большой набор результатов в память. Обратите внимание, что приложение должно быть готово обрабатывать любое количество блоков, и точный размер каждого блока не может контролироваться.

### Буфер данных HTTP для медленной обработки {#http-data-buffer-for-slow-processing}

Из-за ограничений протокола HTTP, если блоки обрабатываются со скоростью значительно медленнее, чем сервер ClickHouse передаёт данные в потоке, сервер ClickHouse закроет соединение, что приведёт к возникновению исключения в потоке обработки. Это можно частично смягчить, увеличив размер буфера потоковой передачи HTTP (который по умолчанию составляет 10 мегабайт) с помощью общей настройки `http_buffer_size`. Большие значения `http_buffer_size` допустимы в этой ситуации, если у приложения достаточно доступной памяти. Данные в буфере хранятся в сжатом виде при использовании сжатия `lz4` или `zstd`, поэтому использование этих типов сжатия увеличит общий доступный объём буфера.

### StreamContexts {#streamcontexts}

Каждый из методов `query_*_stream` (например, `query_row_block_stream`) возвращает объект ClickHouse `StreamContext`, который представляет собой комбинированный контекст/генератор Python. Базовое использование:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <выполнить действия с каждой строкой данных о поездках>
```

Обратите внимание, что попытка использовать StreamContext без оператора `with` вызовет ошибку. Использование контекста Python гарантирует, что поток (в данном случае потоковый HTTP-ответ) будет правильно закрыт, даже если не все данные были прочитаны и/или во время обработки возникло исключение. Кроме того, `StreamContext` можно использовать только один раз для чтения потока. Попытка использовать `StreamContext` после его завершения приведёт к ошибке `StreamClosedError`.

Вы можете использовать свойство `source` объекта `StreamContext` для доступа к родительскому объекту `QueryResult`, который включает имена и типы столбцов.

### Типы потоков {#stream-types}


Метод `query_column_block_stream` возвращает блок в виде последовательности столбцов данных, хранящихся в виде встроенных типов данных Python. При использовании приведенных выше запросов `taxi_trips` возвращаемые данные будут представлять собой список, где каждый элемент списка является другим списком (или кортежем), содержащим все данные соответствующего столбца. Таким образом, `block[0]` будет кортежем, содержащим только строки. Столбцовые форматы чаще всего используются для выполнения агрегатных операций над всеми значениями в столбце, например для суммирования общей стоимости поездок.

Метод `query_row_block_stream` возвращает блок в виде последовательности строк, как в традиционной реляционной базе данных. Для поездок на такси возвращаемые данные будут представлять собой список, где каждый элемент списка является другим списком, представляющим строку данных. Таким образом, `block[0]` будет содержать все поля (по порядку) для первой поездки на такси, `block[1]` будет содержать строку со всеми полями для второй поездки на такси и так далее. Строковые результаты обычно используются для процессов отображения или преобразования данных.

Метод `query_row_stream` является вспомогательным методом, который автоматически переходит к следующему блоку при итерации по потоку. В остальном он идентичен `query_row_block_stream`.

Метод `query_np_stream` возвращает каждый блок в виде двумерного массива NumPy. Внутренне массивы NumPy (обычно) хранятся в виде столбцов, поэтому отдельные методы для строк или столбцов не требуются. Форма массива NumPy будет выражена как (столбцы, строки). Библиотека NumPy предоставляет множество методов для манипулирования массивами NumPy. Обратите внимание, что если все столбцы в запросе имеют одинаковый dtype NumPy, возвращаемый массив NumPy также будет иметь только один dtype и может быть изменен/повернут без фактического изменения его внутренней структуры.

Метод `query_df_stream` возвращает каждый блок ClickHouse в виде двумерного Pandas DataFrame. Вот пример, который показывает, что объект `StreamContext` может использоваться в качестве контекста отложенным образом (но только один раз).

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <выполнить операции с pandas DataFrame>
```

Метод `query_df_arrow_stream` возвращает каждый блок ClickHouse в виде DataFrame с бэкендом типов данных PyArrow. Этот метод поддерживает как Pandas (версии 2.x или более поздней), так и Polars DataFrames через параметр `dataframe_library` (по умолчанию `"pandas"`). Каждая итерация возвращает DataFrame, преобразованный из пакетов записей PyArrow, обеспечивая лучшую производительность и эффективность использования памяти для определенных типов данных.

Наконец, метод `query_arrow_stream` возвращает результат в формате ClickHouse `ArrowStream` в виде `pyarrow.ipc.RecordBatchStreamReader`, обернутого в `StreamContext`. Каждая итерация потока возвращает PyArrow RecordBlock.

### Примеры потоковой передачи {#streaming-examples}

#### Потоковая передача строк {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# Построчная обработка крупных наборов результатов

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # Обработка каждой строки

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


# Потоковая передача блоками строк (эффективнее, чем построчная обработка)

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# Вывод:

# Получен блок из 65409 строк

# Получен блок из 34591 строк

````

#### Потоковая передача Pandas DataFrames {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Потоковая выдача результатов запроса в виде DataFrame Pandas

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

#### Потоковая передача пакетов Arrow {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Потоковая передача результатов запроса в виде пакетов записей Arrow

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# Обработка каждого пакета Arrow

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# Вывод:

# Получен пакет Arrow с 65409 строк

# Получен пакет Arrow с 34591 строк

```
```


## Запросы NumPy, Pandas и Arrow {#numpy-pandas-and-arrow-queries}

ClickHouse Connect предоставляет специализированные методы запросов для работы со структурами данных NumPy, Pandas и Arrow. Эти методы позволяют получать результаты запросов напрямую в этих популярных форматах данных без ручного преобразования.

### Запросы NumPy {#numpy-queries}

Метод `query_np` возвращает результаты запроса в виде массива NumPy вместо объекта `QueryResult` ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# Запрос возвращает массив NumPy
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(np_array))

# Результат:

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

Метод `query_df` возвращает результаты запроса в виде Pandas DataFrame вместо объекта `QueryResult` ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Запрос возвращает DataFrame библиотеки Pandas
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

Метод `query_arrow` возвращает результаты запроса в виде таблицы PyArrow. Он напрямую использует формат ClickHouse `Arrow`, поэтому принимает только три общих с основным методом `query` аргумента: `query`, `parameters` и `settings`. Кроме того, имеется дополнительный аргумент `use_strings`, который определяет, будут ли типы ClickHouse String отображаться в таблице Arrow как строки (если True) или как байты (если False).

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# Запрос возвращает таблицу PyArrow
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



print(type(arrow_table))

# Результат:

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

ClickHouse Connect поддерживает быстрое и эффективное по памяти создание DataFrame из результатов Arrow с помощью методов `query_df_arrow` и `query_df_arrow_stream`. Это тонкие обёртки вокруг методов запросов Arrow, которые выполняют преобразования в DataFrame без копирования данных там, где это возможно:

- `query_df_arrow`: Выполняет запрос с использованием выходного формата ClickHouse `Arrow` и возвращает DataFrame.
  - Для `dataframe_library='pandas'` возвращает pandas 2.x DataFrame с использованием типов данных на основе Arrow (`pd.ArrowDtype`). Требуется pandas 2.x и использует буферы без копирования там, где это возможно, для отличной производительности и низкого потребления памяти.
  - Для `dataframe_library='polars'` возвращает Polars DataFrame, созданный из таблицы Arrow (`pl.from_arrow`), что также эффективно и может выполняться без копирования в зависимости от данных.
- `query_df_arrow_stream`: Передаёт результаты в виде последовательности DataFrame (pandas 2.x или Polars), преобразованных из пакетов потока Arrow.

#### Запрос в DataFrame на основе Arrow {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Запрос возвращает объект DataFrame библиотеки Pandas с типами данных Arrow (требуется pandas 2.x)
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
# Вывод:
# [UInt64, String]




# Потоковая передача данных пакетами DataFrames (на примере polars)

with client.query_df_arrow_stream(
"SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
for df_batch in stream:
print(f"Получен пакет {type(df_batch)} с {len(df_batch)} строками и dtypes: {df_batch.dtypes}") # Вывод: # Получен пакет <class 'polars.dataframe.frame.DataFrame'> с 65409 строками и dtypes: [UInt64, String] # Получен пакет <class 'polars.dataframe.frame.DataFrame'> с 34591 строками и dtypes: [UInt64, String]

```

#### Примечания и ограничения {#notes-and-caveats}
- Сопоставление типов Arrow: При возврате данных в формате Arrow ClickHouse сопоставляет типы с ближайшими поддерживаемыми типами Arrow. Некоторые типы ClickHouse не имеют нативного эквивалента в Arrow и возвращаются в виде необработанных байтов в полях Arrow (обычно `BINARY` или `FIXED_SIZE_BINARY`).
  - Примеры: `IPv4` представляется как Arrow `UINT32`; `IPv6` и большие целые числа (`Int128/UInt128/Int256/UInt256`) часто представляются как `FIXED_SIZE_BINARY`/`BINARY` с необработанными байтами.
  - В таких случаях столбец DataFrame будет содержать байтовые значения, поддерживаемые полем Arrow; клиентский код должен интерпретировать и преобразовывать эти байты в соответствии с семантикой ClickHouse.
- Неподдерживаемые типы данных Arrow (например, UUID/ENUM как истинные типы Arrow) не выводятся; значения представляются с использованием ближайшего поддерживаемого типа Arrow (часто в виде двоичных байтов) для вывода.
- Требования к Pandas: типы данных на основе Arrow требуют pandas 2.x. Для более старых версий pandas используйте `query_df` (без Arrow).
- Строки и двоичные данные: опция `use_strings` (при поддержке настройкой сервера `output_format_arrow_string_as_string`) управляет тем, возвращаются ли столбцы ClickHouse `String` как строки Arrow или как двоичные данные.

#### Примеры преобразования несовпадающих типов ClickHouse/Arrow {#mismatched-clickhousearrow-type-conversion-examples}

Когда ClickHouse возвращает столбцы в виде необработанных двоичных данных (например, `FIXED_SIZE_BINARY` или `BINARY`), код приложения должен преобразовать эти байты в соответствующие типы Python. Приведенные ниже примеры показывают, что некоторые преобразования возможны с использованием API библиотек DataFrame, в то время как другие могут потребовать использования чистых подходов Python, таких как `struct.unpack` (которые снижают производительность, но сохраняют гибкость).

```


Столбцы типа `Date` могут приходить в виде `UINT16` (число дней с начала Unix‑эпохи, 1970‑01‑01). Преобразование внутри DataFrame выполняется эффективно и просто:

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


Столбцы типа `Int128` могут приходить в формате `FIXED_SIZE_BINARY` с сырыми байтами. Polars предоставляет встроенную поддержку 128-битных целых чисел:

```python
# Polars - нативная поддержка
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

Начиная с NumPy 2.3 не существует общедоступного типа данных `dtype` для 128‑битных целых чисел, поэтому приходится использовать чистый Python и, например, сделать что-то вроде:


```python
# Предположим, у нас есть pandas DataFrame со столбцом Int128 типа данных fixed_size_binary[16][pyarrow]
```


print(df)
# Результат:
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...



print([int.from&#95;bytes(n, byteorder=&quot;little&quot;) for n in df[&quot;int&#95;128&#95;col&quot;].to&#95;list()])

# Результат:

# [1234567898765432123456789, 8, 456789123456789]

```

Ключевой вывод: код приложения должен обрабатывать эти преобразования с учётом возможностей выбранной библиотеки DataFrame и допустимых компромиссов в производительности. Если встроенные преобразования DataFrame недоступны, можно использовать подходы на чистом Python.
```


## Форматы чтения {#read-formats}

Форматы чтения определяют типы данных значений, возвращаемых методами клиента `query`, `query_np` и `query_df`. (Методы `raw_query` и `query_arrow` не изменяют входящие данные из ClickHouse, поэтому управление форматом к ним не применяется.) Например, если формат чтения для UUID изменён с формата по умолчанию `native` на альтернативный формат `string`, запрос ClickHouse к столбцу `UUID` вернёт строковые значения (в стандартном формате 8-4-4-4-12 RFC 1422) вместо объектов Python UUID.

Аргумент "data type" для любой функции форматирования может включать подстановочные символы. Формат представляет собой одну строку в нижнем регистре.

Форматы чтения могут быть заданы на нескольких уровнях:

- Глобально, с помощью методов, определённых в пакете `clickhouse_connect.datatypes.format`. Это позволит управлять форматом настроенного типа данных для всех запросов.

```python
from clickhouse_connect.datatypes.format import set_read_format

```


# Возврат значений IPv6 и IPv4 как строк
set_read_format('IPv*', 'string')



# Возвращать все типы Date как базовые значения epoch second или epoch day

set_read_format('Date\*', 'int')

````
- Для всего запроса используйте необязательный аргумент-словарь `query_formats`. В этом случае любой столбец (или подстолбец) указанных типов данных будет использовать настроенный формат.
```python
# Возвращать любой столбец UUID как строку
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

- Для значений в конкретном столбце используйте необязательный аргумент-словарь `column_formats`. Ключом является имя столбца, возвращаемое ClickHouse, а значением — формат для столбца данных или словарь второго уровня "format" с именем типа ClickHouse и значением форматов запроса. Этот вторичный словарь может использоваться для вложенных типов столбцов, таких как Tuples или Maps.

```python
# Возвращать значения IPv6 в столбце `dev_address` как строки
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### Параметры формата чтения (типы Python) {#read-format-options-python-types}

| Тип ClickHouse        | Нативный тип Python     | Форматы чтения    | Комментарии                                                                                                       |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset в настоящее время не обрабатывает большие беззнаковые значения UInt64                                    |
| [U]Int[128,256]       | int                     | string            | Целочисленные значения Pandas и NumPy имеют максимум 64 бита, поэтому они могут возвращаться как строки          |
| BFloat16              | float                   | -                 | Все числа с плавающей точкой Python внутренне имеют 64 бита                                                       |
| Float32               | float                   | -                 | Все числа с плавающей точкой Python внутренне имеют 64 бита                                                       |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | Столбцы String в ClickHouse не имеют встроенной кодировки, поэтому они также используются для двоичных данных переменной длины |
| FixedString           | bytes                   | string            | FixedStrings — это байтовые массивы фиксированного размера, но иногда обрабатываются как строки Python            |
| Enum[8,16]            | string                  | string, int       | Перечисления Python не принимают пустые строки, поэтому все перечисления представляются либо как строки, либо как базовое целочисленное значение. |
| Date                  | datetime.date           | int               | ClickHouse хранит даты как количество дней с 01.01.1970. Это значение доступно как целое число                   |
| Date32                | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                            |
| DateTime              | datetime.datetime       | int               | ClickHouse хранит DateTime в секундах эпохи. Это значение доступно как целое число                               |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime ограничен точностью до микросекунд. Доступно исходное 64-битное целочисленное значение  |
| Time                  | datetime.timedelta      | int, string, time | Момент времени сохраняется как временная метка Unix. Это значение доступно как целое число                        |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta ограничен точностью до микросекунд. Доступно исходное 64-битное целочисленное значение |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP-адреса могут читаться как строки, и правильно отформатированные строки могут вставляться как IP-адреса        |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP-адреса могут читаться как строки, и правильно отформатированные строки могут вставляться как IP-адреса        |
| Tuple                 | dict or tuple           | tuple, json       | Именованные кортежи по умолчанию возвращаются как словари. Именованные кортежи также могут возвращаться как строки JSON |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID могут читаться как строки, отформатированные согласно RFC 4122<br/>                                          |
| JSON                  | dict                    | string            | По умолчанию возвращается словарь Python. Формат `string` вернет строку JSON                                      |
| Variant               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, сохраненного для значения                      |
| Dynamic               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, сохраненного для значения                      |


## Внешние данные {#external-data}

Запросы ClickHouse могут принимать внешние данные в любом формате ClickHouse. Эти бинарные данные отправляются вместе со строкой запроса и используются при обработке данных. Подробная информация о функции внешних данных приведена [здесь](/engines/table-engines/special/external-data.md). Клиентские методы `query*` принимают необязательный параметр `external_data` для использования этой функции. Значением параметра `external_data` должен быть объект `clickhouse_connect.driver.external.ExternalData`. Конструктор этого объекта принимает следующие аргументы:

| Имя       | Тип               | Описание                                                                                                                                      |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| file_path | str               | Путь к файлу в локальной файловой системе для чтения внешних данных. Требуется либо `file_path`, либо `data`                                  |
| file_name | str               | Имя «файла» внешних данных. Если не указано, будет определено из `file_path` (без расширения)                                                |
| data      | bytes             | Внешние данные в бинарной форме (вместо чтения из файла). Требуется либо `data`, либо `file_path`                                            |
| fmt       | str               | [Входной формат](/sql-reference/formats.mdx) данных ClickHouse. По умолчанию `TSV`                                                           |
| types     | str or seq of str | Список типов данных столбцов во внешних данных. Если строка, типы должны быть разделены запятыми. Требуется либо `types`, либо `structure`   |
| structure | str or seq of str | Список имён столбцов + типов данных в данных (см. примеры). Требуется либо `structure`, либо `types`                                          |
| mime_type | str               | Необязательный MIME-тип данных файла. В настоящее время ClickHouse игнорирует этот HTTP-подзаголовок                                         |

Чтобы отправить запрос с внешним CSV-файлом, содержащим данные о фильмах, и объединить эти данные с таблицей `directors`, уже присутствующей на сервере ClickHouse:

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

Дополнительные файлы внешних данных могут быть добавлены к исходному объекту `ExternalData` с помощью метода `add_file`, который принимает те же параметры, что и конструктор. Для HTTP все внешние данные передаются как часть загрузки файла `multi-part/form-data`.


## Часовые пояса {#time-zones}

Существует несколько механизмов применения часового пояса к значениям DateTime и DateTime64 в ClickHouse. Внутренне сервер ClickHouse всегда хранит любой объект DateTime или `DateTime64` как число без привязки к часовому поясу, представляющее количество секунд с начала эпохи Unix (1970-01-01 00:00:00 UTC). Для значений `DateTime64` представление может быть в миллисекундах, микросекундах или наносекундах с начала эпохи в зависимости от заданной точности. В результате применение информации о часовом поясе всегда происходит на стороне клиента. Следует учитывать, что это требует дополнительных вычислений, поэтому в приложениях, критичных к производительности, рекомендуется работать с типами DateTime как с временными метками эпохи Unix, за исключением случаев отображения пользователю и преобразования (например, временные метки Pandas всегда представляют собой 64-битное целое число, представляющее наносекунды с начала эпохи, что повышает производительность).

При использовании типов данных с учетом часового пояса в запросах — в частности, объекта Python `datetime.datetime` — `clickhouse-connect` применяет часовой пояс на стороне клиента согласно следующим правилам приоритета:

1. Если для запроса указан параметр метода `client_tzs`, применяется часовой пояс конкретного столбца
2. Если столбец ClickHouse содержит метаданные часового пояса (т. е. имеет тип вида DateTime64(3, 'America/Denver')), применяется часовой пояс столбца ClickHouse. (Обратите внимание, что эти метаданные часового пояса недоступны для clickhouse-connect в столбцах DateTime в версиях ClickHouse до 23.2)
3. Если для запроса указан параметр метода `query_tz`, применяется «часовой пояс запроса»
4. Если к запросу или сеансу применена настройка часового пояса, применяется этот часовой пояс (эта функциональность пока не реализована в сервере ClickHouse)
5. Наконец, если параметр клиента `apply_server_timezone` установлен в значение True (по умолчанию), применяется часовой пояс сервера ClickHouse

Обратите внимание, что если применяемый на основе этих правил часовой пояс является UTC, `clickhouse-connect` _всегда_ будет возвращать объект Python `datetime.datetime` без привязки к часовому поясу. При необходимости дополнительная информация о часовом поясе может быть добавлена к этому объекту кодом приложения.
