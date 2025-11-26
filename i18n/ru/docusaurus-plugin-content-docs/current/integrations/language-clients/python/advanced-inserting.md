---
sidebar_label: 'Расширенная вставка данных'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'Расширенные способы вставки данных с помощью ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-inserting
title: 'Расширенная вставка данных'
doc_type: 'reference'
---



## Вставка данных с ClickHouse Connect: расширенное использование

### InsertContexts

ClickHouse Connect выполняет все операции вставки в рамках `InsertContext`. `InsertContext` включает все значения, переданные в качестве аргументов методу клиента `insert`. Кроме того, при первоначальном создании `InsertContext` ClickHouse Connect получает типы данных для столбцов вставки, необходимые для эффективных вставок в формате Native. При повторном использовании `InsertContext` для нескольких вставок выполнение этого «предварительного запроса» не требуется, и вставки выполняются быстрее и эффективнее.

`InsertContext` можно получить с помощью метода клиента `create_insert_context`. Метод принимает те же аргументы, что и функция `insert`. Обратите внимание, что при повторном использовании следует изменять только свойство `data` объектов `InsertContext`. Это соответствует его назначению — предоставлять переиспользуемый объект для многократных вставок новых данных в ту же таблицу.

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

Объекты `InsertContext` включают изменяемое состояние, которое обновляется в процессе вставки, поэтому они не являются потокобезопасными.

### Форматы записи

Форматы записи в данный момент реализованы только для ограниченного набора типов. В большинстве случаев ClickHouse Connect попытается автоматически определить корректный формат записи для столбца, проверив тип первого (ненулевого/не равного NULL) значения. Например, если выполняется вставка в столбец `DateTime`, и первое вставляемое значение в этот столбец — целое число Python, ClickHouse Connect будет напрямую вставлять это целое значение, предполагая, что на самом деле это количество секунд с начала эпохи.

В большинстве случаев нет необходимости переопределять формат записи для типа данных, но соответствующие методы в пакете `clickhouse_connect.datatypes.format` могут использоваться для этого на глобальном уровне.

#### Параметры формата записи


| Тип ClickHouse              | Базовый тип Python      | Форматы записи    | Комментарии                                                                                                                       |
| --------------------------- | ----------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32]       | int                     | -                 |                                                                                                                                   |
| UInt64                      | int                     |                   |                                                                                                                                   |
| [U]Int[128,256]             | int                     |                   |                                                                                                                                   |
| BFloat16                    | float                   |                   |                                                                                                                                   |
| Float32                     | float                   |                   |                                                                                                                                   |
| Float64                     | float                   |                   |                                                                                                                                   |
| Decimal                     | decimal.Decimal         |                   |                                                                                                                                   |
| String                      | string                  |                   |                                                                                                                                   |
| FixedString                 | bytes                   | string            | Если вставка выполняется как строка, дополнительные байты будут заполнены нулями                                                  |
| Enum[8,16]                  | string                  |                   |                                                                                                                                   |
| Date                        | datetime.date           | int               | ClickHouse хранит Date как количество дней, прошедших с 01/01/1970. Для типов int предполагается именно это значение «даты эпохи» |
| Date32                      | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                                            |
| DateTime                    | datetime.datetime       | int               | ClickHouse хранит DateTime в секундах эпохи. Для типов int предполагается именно это значение «секунд эпохи»                      |
| DateTime64                  | datetime.datetime       | int               | Python datetime.datetime ограничен точностью до микросекунд. Доступно исходное 64-битное целочисленное значение                   |
| Time                        | datetime.timedelta      | int, string, time | ClickHouse хранит DateTime в секундах эпохи. Для типов int предполагается именно это значение «секунд эпохи»                      |
| Time64                      | datetime.timedelta      | int, string, time | Python datetime.timedelta ограничен точностью до микросекунд. Доступно исходное 64-битное целочисленное значение                  |
| IPv4                        | `ipaddress.IPv4Address` | string            | Корректно отформатированные строки могут быть вставлены как IPv4-адреса                                                           |
| IPv6                        | `ipaddress.IPv6Address` | string            | Корректно отформатированные строки могут быть вставлены как IPv6-адреса                                                           |
| Tuple                       | dict or tuple           |                   |                                                                                                                                   |
| Map                         | dict                    |                   |                                                                                                                                   |
| Nested                      | Sequence[dict]          |                   |                                                                                                                                   |
| UUID                        | uuid.UUID               | string            | Корректно отформатированные строки могут быть вставлены как UUID ClickHouse                                                       |
| JSON/Object(&#39;json&#39;) | dict                    | string            | В столбцы JSON могут быть вставлены как словари, так и JSON-строки (обратите внимание, что `Object('json')` признан устаревшим)   |
| Variant                     | object                  |                   | В настоящее время все значения типа Variant вставляются как строки и разбираются сервером ClickHouse                              |
| Dynamic                     | object                  |                   | Предупреждение — в настоящее время любые вставки в столбец Dynamic сохраняются как значение типа String в ClickHouse              |

### Специализированные методы вставки

ClickHouse Connect предоставляет специализированные методы вставки для распространённых форматов данных:

* `insert_df` -- вставка Pandas DataFrame. Вместо аргумента `data` типа Python Sequence of Sequences второй параметр этого метода требует аргумент `df`, который должен быть экземпляром Pandas DataFrame. ClickHouse Connect автоматически обрабатывает DataFrame как колонно-ориентированный источник данных, поэтому параметр `column_oriented` не требуется и недоступен.
* `insert_arrow` -- вставка PyArrow Table. ClickHouse Connect передаёт таблицу Arrow без изменений на сервер ClickHouse для обработки, поэтому, помимо `table` и `arrow_table`, доступны только аргументы `database` и `settings`.
* `insert_df_arrow` -- вставка Pandas DataFrame на базе Arrow или Polars DataFrame. ClickHouse Connect автоматически определит, является ли DataFrame типом Pandas или Polars. Для Pandas будет выполнена проверка, чтобы убедиться, что backend dtype каждого столбца основан на Arrow, и будет вызвано исключение, если найдутся столбцы, для которых это не так.

:::note
Массив NumPy является допустимой последовательностью последовательностей (Sequence of Sequences) и может использоваться как аргумент `data` для основного метода `insert`, поэтому специализированный метод не требуется.
:::

#### Вставка Pandas DataFrame

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_df("users", df)
```

#### Вставка из таблицы PyArrow

```python
import clickhouse_connect
import pyarrow as pa
```


client = clickhouse_connect.get_client()

arrow_table = pa.table({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)

````

#### Вставка DataFrame на основе Arrow (pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

````


# Преобразование в типы данных на основе Arrow для повышения производительности

df = pd.DataFrame({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)

````

### Часовые пояса {#time-zones}

При вставке объектов Python `datetime.datetime` в столбцы ClickHouse `DateTime` или `DateTime64` ClickHouse Connect автоматически обрабатывает информацию о часовом поясе. Поскольку ClickHouse хранит все значения DateTime внутренне как Unix-метки времени без привязки к часовому поясу (секунды или доли секунд с начала эпохи), преобразование часового пояса выполняется автоматически на стороне клиента при вставке.

#### Объекты datetime с информацией о часовом поясе {#timezone-aware-datetime-objects}

Если вы вставляете объект Python `datetime.datetime` с информацией о часовом поясе, ClickHouse Connect автоматически вызовет `.timestamp()` для преобразования его в Unix-метку времени, корректно учитывая смещение часового пояса. Это означает, что вы можете вставлять объекты datetime из любого часового пояса, и они будут корректно сохранены как эквивалентная метка времени UTC.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

````


# Создание объектов datetime с учётом часового пояса
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]



client.insert(&#39;events&#39;, data, column&#95;names=[&#39;event&#95;time&#39;])
results = client.query(&quot;SELECT * from events&quot;)
print(*results.result&#95;rows, sep=&quot;\n&quot;)

# Результат:

# (datetime.datetime(2023, 6, 15, 10, 30),)

# (datetime.datetime(2023, 6, 15, 16, 30),)

# (datetime.datetime(2023, 6, 15, 1, 30),)

````

В этом примере все три объекта datetime представляют различные моменты времени, так как имеют разные часовые пояса. Каждый из них будет корректно преобразован в соответствующую временную метку Unix и сохранён в ClickHouse.

:::note
При использовании pytz необходимо использовать метод `localize()` для присоединения информации о часовом поясе к наивному datetime. Передача `tzinfo=` напрямую в конструктор datetime приведёт к использованию некорректных исторических смещений. Для UTC параметр `tzinfo=pytz.UTC` работает корректно. Дополнительную информацию см. в [документации pytz](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic).
:::

#### Объекты datetime без указания часового пояса {#timezone-naive-datetime-objects}

Если вы вставляете объект Python `datetime.datetime` без указания часового пояса (без `tzinfo`), метод `.timestamp()` интерпретирует его как находящийся в локальном часовом поясе системы. Во избежание неоднозначности рекомендуется:

1. Всегда использовать объекты datetime с указанием часового пояса при вставке, или
2. Убедиться, что системный часовой пояс установлен на UTC, или
3. Вручную преобразовывать во временные метки epoch перед вставкой

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# Рекомендуется: всегда используйте значения datetime с часовым поясом
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# Альтернатива: ручное преобразование во временную метку Unix (epoch)

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### Колонки DateTime с метаданными часового пояса {#datetime-columns-with-timezone-metadata}

Колонки ClickHouse могут быть определены с метаданными часового пояса (например, `DateTime('America/Denver')` или `DateTime64(3, 'Asia/Tokyo')`). Эти метаданные не влияют на способ хранения данных (данные по-прежнему хранятся как временные метки UTC), но определяют часовой пояс, используемый при извлечении данных из ClickHouse.

При вставке данных в такие колонки ClickHouse Connect преобразует объект datetime из Python в временную метку Unix (с учётом его часового пояса, если он указан). При извлечении данных ClickHouse Connect возвращает datetime, преобразованный в часовой пояс колонки, независимо от того, какой часовой пояс использовался при вставке.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# Создайте таблицу с метаданными часового пояса Лос‑Анджелеса
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# Вставляем время по Нью-Йорку (10:30 AM EDT, что соответствует 14:30 UTC)
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# При запросе обратно время автоматически преобразуется в часовой пояс Лос-Анджелеса

# 10:30 AM Нью-Йорк (UTC-4) = 14:30 UTC = 7:30 AM Лос-Анджелес (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# Вывод:

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## Вставка из файла

Пакет `clickhouse_connect.driver.tools` включает метод `insert_file`, который позволяет вставлять данные напрямую из файловой системы в существующую таблицу ClickHouse. Разбор данных выполняется на стороне сервера ClickHouse. `insert_file` принимает следующие параметры:

| Parameter        | Type            | Default           | Description                                                                                                                             |
| ---------------- | --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| client           | Client          | *Required*        | `driver.Client`, используемый для выполнения вставки                                                                                    |
| table            | str             | *Required*        | Таблица ClickHouse, в которую выполняется вставка. Допускается полное имя таблицы (включая базу данных).                                |
| file&#95;path    | str             | *Required*        | Путь в файловой системе к файлу с данными                                                                                               |
| fmt              | str             | CSV, CSVWithNames | Формат ввода ClickHouse для файла. Если `column_names` не указаны, предполагается CSVWithNames                                          |
| column&#95;names | Sequence of str | *None*            | Список имён столбцов в файле с данными. Не требуется для форматов, которые включают имена столбцов                                      |
| database         | str             | *None*            | База данных таблицы. Игнорируется, если указано полное имя таблицы. Если не задано, будет использована база данных клиента по умолчанию |
| settings         | dict            | *None*            | См. [описание settings](driver-api.md#settings-argument).                                                                               |
| compression      | str             | *None*            | Поддерживаемый ClickHouse тип сжатия (zstd, lz4, gzip), используемый для HTTP-заголовка Content-Encoding                                |

Для файлов с некорректными данными или значениями даты/времени в нестандартном формате для этого метода учитываются настройки, применимые к импорту данных (такие как `input_format_allow_errors_num` и `input_format_allow_errors_num`).

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
