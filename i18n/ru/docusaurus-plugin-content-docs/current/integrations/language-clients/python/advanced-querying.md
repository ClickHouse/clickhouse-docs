---
sidebar_label: 'Расширенные запросы'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'Расширенные запросы с ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-querying
title: 'Расширенные запросы'
doc_type: 'reference'
---

# Запрос данных с помощью ClickHouse Connect: расширенные возможности {#querying-data-with-clickhouse-connect--advanced-usage}

## QueryContexts {#querycontexts}

ClickHouse Connect выполняет стандартные запросы в контексте `QueryContext`. `QueryContext` содержит ключевые структуры, которые используются для построения запросов к базе данных ClickHouse, а также конфигурацию, применяемую для обработки результата в `QueryResult` или другую структуру данных ответа. Сюда входят сам запрос, параметры, настройки, форматы чтения и прочие свойства.

`QueryContext` можно получить с помощью клиентского метода `create_query_context`. Этот метод принимает те же параметры, что и основной метод выполнения запроса. Затем этот контекст запроса может быть передан методам `query`, `query_df` или `query_np` в качестве именованного аргумента `context` вместо любого или всех остальных аргументов этих методов. Обратите внимание, что дополнительные аргументы, указанные при вызове метода, переопределят любые свойства `QueryContext`.

Наиболее наглядный сценарий использования `QueryContext` — отправка одного и того же запроса с разными значениями параметров привязки. Все значения параметров можно обновить, вызвав метод `QueryContext.set_parameters` со словарём, или обновить любое отдельное значение, вызвав `QueryContext.set_parameter` с нужной парой `key`, `value`.

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

Обратите внимание, что экземпляры `QueryContext` не являются потокобезопасными, однако в многопоточной среде можно получить их копию, вызвав метод `QueryContext.updated_copy`.


## Потоковые запросы {#streaming-queries}

Клиент ClickHouse Connect предоставляет несколько методов для получения данных в виде потока (реализовано как генератор Python):

- `query_column_block_stream` -- Возвращает данные запроса по блокам в виде последовательности столбцов с использованием нативных объектов Python
- `query_row_block_stream` -- Возвращает данные запроса в виде блока строк с использованием нативных объектов Python
- `query_rows_stream` -- Возвращает данные запроса в виде последовательности строк с использованием нативных объектов Python
- `query_np_stream` -- Возвращает каждый блок данных запроса ClickHouse как массив NumPy
- `query_df_stream` -- Возвращает каждый блок данных запроса ClickHouse как объект Pandas DataFrame
- `query_arrow_stream` -- Возвращает данные запроса в виде PyArrow RecordBlocks
- `query_df_arrow_stream` -- Возвращает каждый блок данных запроса ClickHouse как основанный на Arrow объект Pandas DataFrame или Polars DataFrame в зависимости от значения аргумента `dataframe_library` (по умолчанию "pandas").

Каждый из этих методов возвращает объект `ContextStream`, который необходимо открыть с помощью конструкции `with`, чтобы начать чтение потока.

### Блоки данных {#data-blocks}

ClickHouse Connect обрабатывает все данные из основного метода `query` как поток блоков, получаемых от сервера ClickHouse. Эти блоки передаются в собственном формате "Native" в ClickHouse и из него. «Блок» — это просто последовательность столбцов бинарных данных, где каждый столбец содержит одинаковое количество значений указанного типа данных. (Как колонночная СУБД, ClickHouse хранит эти данные в аналогичной форме.) Размер блока, возвращаемого из запроса, определяется двумя пользовательскими параметрами, которые могут быть заданы на нескольких уровнях (профиль пользователя, пользователь, сессия или запрос). Это:

- [max_block_size](/operations/settings/settings#max_block_size) — ограничение на размер блока в строках. Значение по умолчанию — 65536.
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) — мягкое ограничение на размер блока в байтах. Значение по умолчанию — 1,000,0000.

Независимо от `preferred_block_size_setting`, каждый блок никогда не будет содержать более чем `max_block_size` строк. В зависимости от типа запроса фактические возвращаемые блоки могут иметь произвольный размер. Например, запросы к распределённой таблице, охватывающей множество шардов, могут содержать более мелкие блоки, полученные непосредственно с каждого шарда.

При использовании одного из клиентских методов `query_*_stream` результаты возвращаются по одному блоку за раз. ClickHouse Connect загружает только один блок одновременно. Это позволяет обрабатывать большие объёмы данных без необходимости загружать весь большой набор результатов в память. Обратите внимание, что приложение должно быть готово обрабатывать произвольное количество блоков, а точный размер каждого блока не может быть задан или жёстко контролируем.

### Буфер HTTP-данных при медленной обработке {#http-data-buffer-for-slow-processing}

Из‑за ограничений протокола HTTP, если блоки обрабатываются значительно медленнее, чем сервер ClickHouse передаёт данные, сервер ClickHouse закроет соединение, что приведёт к выбрасыванию исключения в потоке обработки. Частично это можно компенсировать, увеличив размер буфера HTTP‑потоковой передачи (по умолчанию 10 мегабайт) с помощью общего параметра `http_buffer_size`. Большие значения `http_buffer_size` допустимы в этой ситуации, если приложению доступно достаточно памяти. Данные в буфере хранятся в сжатом виде при использовании сжатия `lz4` или `zstd`, поэтому применение этих типов сжатия увеличивает общий доступный размер буфера.

### StreamContexts {#streamcontexts}

Каждый из методов `query_*_stream` (например, `query_row_block_stream`) возвращает объект `StreamContext` ClickHouse, который представляет собой комбинированный контекстный менеджер/генератор в Python. Типичное использование:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <обработайте каждую строку данных о поездках>
```

Обратите внимание, что попытка использовать `StreamContext` без оператора `with` приведёт к ошибке. Использование контекстного менеджера Python гарантирует, что поток (в данном случае потоковый HTTP‑ответ) будет корректно закрыт, даже если не все данные были прочитаны и/или во время обработки было выброшено исключение. Также `StreamContext` может быть использован только один раз для чтения потока. Попытка использовать `StreamContext` после выхода из него приведёт к `StreamClosedError`.

Вы можете использовать свойство `source` у `StreamContext` для доступа к родительскому объекту `QueryResult`, содержащему имена и типы столбцов.


### Типы потоков {#stream-types}

Метод `query_column_block_stream` возвращает блок в виде последовательности данных столбцов, сохранённых в нативных типах данных Python. Используя приведённые выше запросы к `taxi_trips`, возвращаемые данные будут списком, каждый элемент которого — это другой список (или кортеж), содержащий все данные для соответствующего столбца. Таким образом, `block[0]` будет кортежем, содержащим только строки. Форматы, ориентированные на столбцы, чаще всего используются для выполнения агрегатных операций по всем значениям в столбце, например для суммирования общей стоимости поездок.

Метод `query_row_block_stream` возвращает блок в виде последовательности строк, как в традиционной реляционной базе данных. Для поездок на такси возвращаемые данные будут списком, каждый элемент которого — это другой список, представляющий строку данных. Таким образом, `block[0]` будет содержать все поля (в нужном порядке) для первой поездки на такси, `block[1]` будет содержать строку со всеми полями для второй поездки на такси и так далее. Результаты, ориентированные на строки, обычно используются для отображения или преобразования данных.

`query_row_stream` — это вспомогательный метод, который при итерации по потоку автоматически переходит к следующему блоку. В остальном он идентичен `query_row_block_stream`.

Метод `query_np_stream` возвращает каждый блок в виде двумерного массива NumPy. Внутренне массивы NumPy (обычно) хранятся по столбцам, поэтому отдельные методы для строк и столбцов не требуются. «Форма» (shape) массива NumPy будет выражаться как (столбцы, строки). Библиотека NumPy предоставляет множество методов для работы с массивами NumPy. Обратите внимание, что если все столбцы в запросе имеют один и тот же dtype NumPy, возвращаемый массив NumPy также будет иметь только один dtype и может быть изменён по форме/повёрнут без фактического изменения его внутренней структуры.

Метод `query_df_stream` возвращает каждый блок ClickHouse в виде двумерного DataFrame библиотеки Pandas. Вот пример, показывающий, что объект `StreamContext` может использоваться как контекст в отложенном режиме (но только один раз).

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <выполните действия с pandas DataFrame>
```

Метод `query_df_arrow_stream` возвращает каждый блок ClickHouse в виде DataFrame с бэкендом типов данных PyArrow. Этот метод поддерживает как Pandas (версии 2.x и выше), так и Polars DataFrame через параметр `dataframe_library` (по умолчанию `"pandas"`). Каждая итерация возвращает DataFrame, полученный из пакетов записей (record batches) PyArrow, что обеспечивает более высокую производительность и эффективное использование памяти для отдельных типов данных.

Наконец, метод `query_arrow_stream` возвращает результат в формате ClickHouse `ArrowStream` как объект `pyarrow.ipc.RecordBatchStreamReader`, обёрнутый в `StreamContext`. Каждая итерация потока возвращает PyArrow RecordBlock.


### Примеры потоковой обработки {#streaming-examples}

#### Потоковая передача строк {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Потоковая передача больших наборов результатов построчно {#stream-large-result-sets-row-by-row}
with client.query_rows_stream("SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000") as stream:
    for row in stream:
        print(row)  # Обработать каждую строку
        # Вывод:
        # (0, 0)
        # (1, 2)
        # (2, 4)
        # ....
```


#### Потоковая передача блоков строк {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Потоковая передача блоками строк (эффективнее построчной обработки) {#stream-in-blocks-of-rows-more-efficient-than-row-by-row}
with client.query_row_block_stream("SELECT number, number * 2 FROM system.numbers LIMIT 100000") as stream:
    for block in stream:
        print(f"Получен блок из {len(block)} строк")
        # Вывод:
        # Получен блок из 65409 строк
        # Получен блок из 34591 строк
```


#### Потоковая передача DataFrame из Pandas {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Потоковая передача результатов запроса в виде Pandas DataFrames {#stream-query-results-as-pandas-dataframes}
with client.query_df_stream("SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000") as stream:
    for df in stream:
        # Обработка каждого блока DataFrame
        print(f"Получен DataFrame с {len(df)} строк")
        print(df.head(3))
        # Вывод:
        # Получен DataFrame с 65409 строк
        #    number str
        # 0       0   0
        # 1       1   1
        # 2       2   2
        # Получен DataFrame с 34591 строк
        #    number    str
        # 0   65409  65409
        # 1   65410  65410
        # 2   65411  65411
```


#### Потоковая обработка пакетов Arrow {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Потоковая передача результатов запроса в виде пакетов записей Arrow {#stream-query-results-as-arrow-record-batches}
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for arrow_batch in stream:
        # Обработка каждого пакета Arrow
        print(f"Получен пакет Arrow с {arrow_batch.num_rows} строк")
        # Вывод:
        # Получен пакет Arrow с 65409 строк
        # Получен пакет Arrow с 34591 строк
```


## Запросы с использованием NumPy, Pandas и Arrow {#numpy-pandas-and-arrow-queries}

ClickHouse Connect предоставляет специализированные методы выполнения запросов для работы со структурами данных NumPy, Pandas и Arrow. Эти методы позволяют получать результаты запросов непосредственно в этих популярных форматах данных без ручного преобразования.

### Запросы NumPy {#numpy-queries}

Метод `query_np` возвращает результаты запроса как массив NumPy вместо объекта `QueryResult` ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Запрос возвращает массив NumPy {#query-returns-a-numpy-array}
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(np_array))
# Вывод: {#output}
# <class "numpy.ndarray"> {#class-numpyndarray}

print(np_array)
# Вывод: {#output}
# [[0 0] {#0-0}
#  [1 2] {#1-2}
#  [2 4] {#2-4}
#  [3 6] {#3-6}
#  [4 8]] {#4-8}
```


### Запросы Pandas {#pandas-queries}

Метод `query_df` возвращает результаты запроса в виде объекта DataFrame библиотеки Pandas вместо `QueryResult` из ClickHouse Connect.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Запрос возвращает Pandas DataFrame {#query-returns-a-pandas-dataframe}
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(df))
# Вывод: <class "pandas.core.frame.DataFrame"> {#output-class-pandascoreframedataframe}
print(df)
# Вывод: {#output}
#    number  doubled {#number-doubled}
# 0       0        0 {#0-0-0}
# 1       1        2 {#1-1-2}
# 2       2        4 {#2-2-4}
# 3       3        6 {#3-3-6}
# 4       4        8 {#4-4-8}
```


### Запросы PyArrow {#pyarrow-queries}

Метод `query_arrow` возвращает результаты запроса в виде таблицы PyArrow. Он напрямую использует формат ClickHouse `Arrow`, поэтому принимает только три аргумента, общих с основным методом `query`: `query`, `parameters` и `settings`. Кроме того, предусмотрен дополнительный аргумент `use_strings`, который определяет, будут ли типы ClickHouse String в таблице Arrow представляться как строки (если True) или как байты (если False).

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Запрос возвращает таблицу PyArrow {#query-returns-a-pyarrow-table}
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

print(type(arrow_table))
# Результат: {#output}
# <class "pyarrow.lib.Table"> {#class-pyarrowlibtable}

print(arrow_table)
# Результат: {#output}
# pyarrow.Table {#pyarrowtable}
# number: uint64 not null {#number-uint64-not-null}
# str: string not null {#str-string-not-null}
# ----
# number: [[0,1,2]] {#number-012}
# str: [["0","1","2"]] {#str-012}
```


### DataFrame на базе Arrow {#arrow-backed-dataframes}

ClickHouse Connect поддерживает быстрое и экономное по памяти создание DataFrame из результатов Arrow с помощью методов `query_df_arrow` и `query_df_arrow_stream`. Эти методы являются тонкими обёртками вокруг методов выполнения запросов с использованием Arrow и выполняют преобразование в DataFrame без копирования данных, где это возможно:

- `query_df_arrow`: выполняет запрос, используя формат вывода ClickHouse `Arrow`, и возвращает DataFrame.
  - Для `dataframe_library='pandas'` возвращает DataFrame pandas 2.x с типами данных на базе Arrow (`pd.ArrowDtype`). Требуется pandas 2.x; при этом по возможности используются буферы без копирования данных, что обеспечивает высокую производительность и низкие накладные расходы по памяти.
  - Для `dataframe_library='polars'` возвращает Polars DataFrame, созданный из таблицы Arrow (`pl.from_arrow`), который столь же эффективен и может работать без копирования данных в зависимости от набора данных.
- `query_df_arrow_stream`: отдаёт результаты потоком в виде последовательности DataFrame (pandas 2.x или Polars), преобразованных из пакетов потокового формата Arrow.

#### Запрос к DataFrame на основе Arrow {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Запрос возвращает Pandas DataFrame с типами данных Arrow (требуется pandas 2.x) {#query-returns-a-pandas-dataframe-with-arrow-dtypes-requires-pandas-2x}
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)

print(df.dtypes)
# Вывод: {#output}
# number    uint64[pyarrow] {#number-uint64pyarrow}
# str       string[pyarrow] {#str-stringpyarrow}
# dtype: object {#dtype-object}

# Или используйте Polars {#or-use-polars}
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# Вывод: {#output}
# [UInt64, String] {#uint64-string}


# Потоковая передача пакетами DataFrames (показан пример с polars) {#streaming-into-batches-of-dataframes-polars-shown}
with client.query_df_arrow_stream(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
    for df_batch in stream:
        print(f"Получен пакет {type(df_batch)} с {len(df_batch)} строками и типами данных: {df_batch.dtypes}")
        # Вывод:
        # Получен пакет <class 'polars.dataframe.frame.DataFrame'> с 65409 строками и типами данных: [UInt64, String]
        # Получен пакет <class 'polars.dataframe.frame.DataFrame'> с 34591 строками и типами данных: [UInt64, String]
```


#### Примечания и особенности {#notes-and-caveats}

- Отображение типов Arrow: при возврате данных в формате Arrow ClickHouse сопоставляет свои типы с ближайшими поддерживаемыми типами Arrow. Некоторые типы ClickHouse не имеют нативного аналога в Arrow и возвращаются как «сырые» байты в полях Arrow (обычно `BINARY` или `FIXED_SIZE_BINARY`).
  - Примеры: `IPv4` представляется как Arrow `UINT32`; `IPv6` и большие целые (`Int128/UInt128/Int256/UInt256`) часто представляются как `FIXED_SIZE_BINARY`/`BINARY` с «сырыми» байтами.
  - В таких случаях столбец DataFrame будет содержать значения байтов, хранящиеся в соответствующем поле Arrow; интерпретация и преобразование этих байтов в соответствии с семантикой ClickHouse возлагается на клиентский код.
- Неподдерживаемые типы данных Arrow (например, UUID/ENUM как полноценные типы Arrow) не формируются в выводе; значения представляются с использованием ближайшего поддерживаемого типа Arrow (часто в виде бинарных данных).
- Требования к pandas: типы данных на основе Arrow требуют pandas 2.x. Для более старых версий pandas используйте `query_df` (без Arrow).
- Строки vs бинарные данные: опция `use_strings` (когда она поддерживается серверной настройкой `output_format_arrow_string_as_string`) управляет тем, возвращаются ли столбцы ClickHouse `String` как строковые типы Arrow или как бинарные.

#### Примеры преобразования несовпадающих типов ClickHouse/Arrow {#mismatched-clickhousearrow-type-conversion-examples}

Когда ClickHouse возвращает столбцы в виде сырых бинарных данных (например, `FIXED_SIZE_BINARY` или `BINARY`), ответственность за преобразование этих байтов в соответствующие типы Python лежит на коде приложения. Примеры ниже показывают, что некоторые преобразования можно выполнить с помощью API библиотеки DataFrame, тогда как другие могут потребовать использования «чистого» Python, например `struct.unpack` (что снижает производительность, но сохраняет гибкость).

Столбцы `Date` могут приходить как `UINT16` (количество дней с начала эпохи Unix, 1970‑01‑01). Преобразование внутри DataFrame эффективно и несложно:

```python
# Polars {#polars}
df = df.with_columns(pl.col("event_date").cast(pl.Date))

# Pandas {#pandas}
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

Столбцы типа `Int128` могут поступать в виде `FIXED_SIZE_BINARY` с сырыми байтами. Polars предоставляет встроенную поддержку 128-битных целых чисел:

```python
# Polars — нативная поддержка {#polars-native-support}
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

Начиная с NumPy 2.3 нет общедоступного 128-битного целочисленного типа dtype, поэтому приходится использовать чистый Python и, например, сделать что-то вроде этого:

```python
# Предположим, у нас есть pandas dataframe со столбцом Int128 типа данных fixed_size_binary[16][pyarrow] {#assuming-we-have-a-pandas-dataframe-with-an-int128-column-of-dtype-fixed_size_binary16pyarrow}

print(df)
# Вывод: {#output}
#   str_col                                        int_128_col {#str_col-int_128_col}
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00... {#0-num1-bx15xdaxebx18zux0fnx05x01x00x00x00}
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00... {#1-num2-bx08x00x00x00x00x00x00x00x00x00x00}
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x... {#2-num3-bx15xdfpx81rx9fx01x00x00x00x00x00x}

print([int.from_bytes(n, byteorder="little") for n in df["int_128_col"].to_list()])
# Вывод: {#output}
# [1234567898765432123456789, 8, 456789123456789] {#1234567898765432123456789-8-456789123456789}
```

Основной вывод: прикладной код должен выполнять эти преобразования в зависимости от возможностей выбранной библиотеки DataFrame и приемлемых компромиссов по производительности. Когда нативные для DataFrame преобразования недоступны, вариант с использованием чистого Python по‑прежнему остается рабочим.


## Форматы чтения {#read-formats}

Форматы чтения управляют типами данных значений, возвращаемых методами клиента `query`, `query_np` и `query_df`. (`raw_query` и `query_arrow` не изменяют данные, получаемые из ClickHouse, поэтому управление форматом к ним не применяется.) Например, если формат чтения для UUID изменён с формата по умолчанию `native` на альтернативный формат `string`, запрос ClickHouse к столбцу `UUID` будет возвращать строковые значения (в стандартном формате RFC 1422 8-4-4-4-12), а не объекты Python UUID.

Аргумент `data type` для любой функции форматирования может включать подстановочные символы (wildcards). Формат задаётся одной строкой в нижнем регистре.

Форматы чтения могут быть заданы на нескольких уровнях:

* Глобально — с использованием методов, определённых в пакете `clickhouse_connect.datatypes.format`. Это будет определять формат настроенного типа данных для всех запросов.

```python
from clickhouse_connect.datatypes.format import set_read_format

# Возвращать значения IPv6 и IPv4 в виде строк {#return-both-ipv6-and-ipv4-values-as-strings}
set_read_format('IPv*', 'string')

# Возвращать все типы Date как базовые значения epoch (в секундах или днях) {#return-all-date-types-as-the-underlying-epoch-second-or-epoch-day}
set_read_format('Date*', 'int')
```

* Для всего запроса целиком, используя необязательный аргумент-словарь `query_formats`. В этом случае любой столбец (или подстолбец) указанных типов данных будет использовать настроенный формат.

```python
# Возвращать все столбцы UUID в виде строки {#return-any-uuid-column-as-a-string}
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

* Для значений в определённом столбце, используя необязательный аргумент-словарь `column_formats`. Ключом является имя столбца, возвращаемое ClickHouse, а значением — либо формат для данных этого столбца, либо вложенный словарь второго уровня `format`, где ключом является имя типа ClickHouse, а значением — формат(ы) запроса. Этот дополнительный словарь можно использовать для вложенных типов столбцов, таких как Tuples или Maps.

```python
# Возвращать значения IPv6 из столбца `dev_address` в виде строк {#return-ipv6-values-in-the-dev_address-column-as-strings}
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```


### Параметры формата чтения (типы Python) {#read-format-options-python-types}

| Тип ClickHouse        | Базовый тип Python      | Форматы чтения    | Комментарии                                                                                                       |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset в настоящее время не обрабатывает большие беззнаковые значения UInt64                                   |
| [U]Int[128,256]       | int                     | string            | Значения типов int в Pandas и NumPy имеют максимальный размер 64 бита, поэтому такие значения могут возвращаться как строки |
| BFloat16              | float                   | -                 | Все значения float в Python внутренне являются 64-битными                                                         |
| Float32               | float                   | -                 | Все значения float в Python внутренне являются 64-битными                                                         |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | Столбцы типа String в ClickHouse не имеют встроенной кодировки, поэтому также используются для двоичных данных переменной длины |
| FixedString           | bytes                   | string            | FixedString — это массивы байт фиксированного размера, но иногда обрабатываются как строки Python                 |
| Enum[8,16]            | string                  | string, int       | Перечисления (enum) в Python не принимают пустые строки, поэтому все enum возвращаются либо в виде строк, либо как базовое значение int |
| Date                  | datetime.date           | int               | ClickHouse хранит Date как количество дней с 01/01/1970. Это значение доступно как int                           |
| Date32                | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                            |
| DateTime              | datetime.datetime       | int               | ClickHouse хранит DateTime в секундах Unix-эпохи. Это значение доступно как int                                   |
| DateTime64            | datetime.datetime       | int               | `datetime.datetime` в Python ограничен микросекундной точностью. Доступно исходное 64-битное целочисленное значение |
| Time                  | datetime.timedelta      | int, string, time | Момент времени сохраняется как Unix timestamp. Это значение доступно как int                                     |
| Time64                | datetime.timedelta      | int, string, time | `datetime.timedelta` в Python ограничен микросекундной точностью. Доступно исходное 64-битное целочисленное значение |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP-адреса могут читаться как строки, а корректно отформатированные строки могут вставляться как IP-адреса       |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP-адреса могут читаться как строки, а корректно отформатированные строки могут вставляться как IP-адреса       |
| Tuple                 | dict or tuple           | tuple, json       | Именованные кортежи по умолчанию возвращаются как словари. Именованные кортежи также могут возвращаться как JSON-строки |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID можно читать как строки, форматированные в соответствии с RFC 4122<br/>                                     |
| JSON                  | dict                    | string            | По умолчанию возвращается словарь Python. Формат `string` вернёт JSON-строку                                     |
| Variant               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, хранящегося в значении                         |
| Dynamic               | object                  | -                 | Возвращает соответствующий тип Python для типа данных ClickHouse, хранящегося в значении                         |

## Внешние данные {#external-data}

Запросы ClickHouse могут принимать внешние данные в любом формате ClickHouse. Эти двоичные данные отправляются вместе со строкой запроса и используются для обработки данных. Подробности о функции External Data приведены [здесь](/engines/table-engines/special/external-data.md). Методы клиента `query*` принимают необязательный параметр `external_data`, чтобы использовать эту возможность. Значением параметра `external_data` должен быть объект `clickhouse_connect.driver.external.ExternalData`. Конструктор этого объекта принимает следующие аргументы:

| Name          | Type              | Description                                                                                                                                        |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| file&#95;path | str               | Путь к файлу в локальной файловой системе, из которого будут прочитаны внешние данные. Требуется либо `file_path`, либо `data`                     |
| file&#95;name | str               | Имя внешнего файла данных. Если не указано, будет определено из `file_path` (без расширения)                                                       |
| data          | bytes             | Внешние данные в двоичном виде (вместо чтения из файла). Требуется либо `data`, либо `file_path`                                                   |
| fmt           | str               | [Входной формат](/sql-reference/formats.mdx) данных ClickHouse. По умолчанию `TSV`                                                                 |
| types         | str or seq of str | Список типов данных столбцов во внешних данных. Если указана строка, типы должны быть разделены запятыми. Требуется либо `types`, либо `structure` |
| structure     | str or seq of str | Список «имя столбца + тип данных» в данных (см. примеры). Требуется либо `structure`, либо `types`                                                 |
| mime&#95;type | str               | Необязательный MIME-тип данных файла. В настоящее время ClickHouse игнорирует этот подзаголовок HTTP                                               |

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

К исходному объекту `ExternalData` можно добавить дополнительные внешние файлы данных с помощью метода `add_file`, который принимает те же параметры, что и конструктор. При использовании HTTP все внешние данные передаются как часть загрузки файла в формате `multipart/form-data`.


## Часовые пояса {#time-zones}

Существует несколько механизмов применения часового пояса к значениям ClickHouse `DateTime` и `DateTime64`. Внутри сервера ClickHouse любой объект `DateTime` или `DateTime64` всегда хранится как «наивное» числовое значение (без учёта часового пояса), представляющее количество секунд, прошедших с начала эпохи — 1970-01-01 00:00:00 по времени UTC. Для значений `DateTime64` представление может быть в миллисекундах, микросекундах или наносекундах, прошедших с начала эпохи, в зависимости от точности. В результате любое применение информации о часовом поясе всегда выполняется на стороне клиента. Обратите внимание, что это требует дополнительных вычислений, поэтому в приложениях, критичных к производительности, рекомендуется обрабатывать типы DateTime как метки времени эпохи (epoch timestamps), за исключением пользовательского отображения и конвертации (например, объекты Pandas Timestamps всегда являются 64-битным целым числом, представляющим количество наносекунд с начала эпохи, для повышения производительности).

При использовании зависящих от часового пояса типов данных в запросах — в частности, объекта Python `datetime.datetime` — `clickhouse-connect` применяет часовой пояс на стороне клиента, используя следующие правила приоритета:

1. Если для метода запроса указан параметр `client_tzs`, применяется указанный для столбца часовой пояс.
2. Если столбец ClickHouse имеет метаданные часового пояса (т. е. его тип — такой как `DateTime64(3, 'America/Denver')`), применяется часовой пояс столбца ClickHouse. (Обратите внимание, что эти метаданные часового пояса недоступны `clickhouse-connect` для столбцов типа DateTime в версиях ClickHouse до 23.2.)
3. Если для метода запроса указан параметр `query_tz`, применяется «часовой пояс запроса».
4. Если к запросу или сессии применена настройка часового пояса, применяется этот часовой пояс. (Эта функциональность ещё не реализована в сервере ClickHouse.)
5. Наконец, если для клиентского параметра `apply_server_timezone` установлено значение True (по умолчанию), применяется часовой пояс сервера ClickHouse.

Обратите внимание, что если применённый в соответствии с этими правилами часовой пояс — UTC, `clickhouse-connect` _всегда_ вернёт наивный (без часового пояса) объект Python `datetime.datetime`. При необходимости дополнительную информацию о часовом поясе затем можно добавить к этому объекту в коде приложения.