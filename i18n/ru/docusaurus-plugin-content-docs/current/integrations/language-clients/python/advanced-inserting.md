---
sidebar_label: 'Расширенные возможности вставки'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'Расширенные возможности вставки с ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-inserting
title: 'Расширенные возможности вставки'
doc_type: 'reference'
---

## Вставка данных с помощью ClickHouse Connect: расширенное использование \\{#inserting-data-with-clickhouse-connect--advanced-usage\\}

### InsertContexts \\{#insertcontexts\\}

ClickHouse Connect выполняет все операции вставки в рамках `InsertContext`. `InsertContext` включает все значения, переданные в качестве аргументов методу клиента `insert`. Кроме того, когда `InsertContext` создаётся впервые, ClickHouse Connect получает типы данных для столбцов, в которые выполняется вставка, что необходимо для эффективных вставок в формате Native. При повторном использовании `InsertContext` для многократных вставок предварительный запрос не требуется, и вставки выполняются быстрее и эффективнее.

`InsertContext` можно получить с помощью метода клиента `create_insert_context`. Метод принимает те же аргументы, что и функция `insert`. Обратите внимание, что для повторного использования следует изменять только свойство `data` объектов `InsertContext`. Это соответствует их назначению — предоставлять повторно используемый объект для повторных вставок новых данных в одну и ту же таблицу.

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

`InsertContext` содержит изменяемое состояние, которое обновляется в процессе вставки, поэтому не является потокобезопасным.

### Форматы записи \\{#write-formats\\}

Форматы записи в настоящее время реализованы только для ограниченного числа типов. В большинстве случаев ClickHouse Connect попытается автоматически определить корректный формат записи для столбца, проверяя тип первого значения данных, не равного `NULL`. Например, при вставке в столбец типа `DateTime`, если первое вставляемое значение столбца — целое число Python, ClickHouse Connect вставит это целочисленное значение напрямую, предполагая, что оно фактически представляет собой число секунд с начала эпохи Unix.

В большинстве случаев нет необходимости переопределять формат записи для типа данных, но связанные методы в пакете `clickhouse_connect.datatypes.format` можно использовать для этого на глобальном уровне.

#### Параметры формата записи \\{#write-format-options\\}

| Тип ClickHouse        | Родной тип Python       | Форматы записи    | Комментарии                                                                                                 |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | При вставке в виде строки дополнительные байты будут заполнены нулями                                       |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse хранит Date как количество дней с 01/01/1970. Значения типа int интерпретируются как значение «epoch date» |
| Date32                | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouse хранит DateTime в секундах эпохи. Значения типа int интерпретируются как значение «epoch second» |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime ограничен микросекундной точностью. Также доступно «сырое» 64-битное целочисленное значение |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse хранит DateTime в секундах эпохи. Значения типа int интерпретируются как значение «epoch second» |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta ограничен микросекундной точностью. Также доступно «сырое» 64-битное целочисленное значение |
| IPv4                  | `ipaddress.IPv4Address` | string            | Корректно отформатированные строки могут быть вставлены как IPv4-адреса                                    |
| IPv6                  | `ipaddress.IPv6Address` | string            | Корректно отформатированные строки могут быть вставлены как IPv6-адреса                                    |
| Tuple                 | dict или tuple          |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | Корректно отформатированные строки могут быть вставлены как UUID ClickHouse                                |
| JSON/Object('json')   | dict                    | string            | В JSON-столбцы можно вставлять либо словари, либо JSON-строки (обратите внимание, `Object('json')` устарел) |
| Variant               | object                  |                   | На данный момент все варианты вставляются как строки и разбираются сервером ClickHouse                     |
| Dynamic               | object                  |                   | Предупреждение — на данный момент любые вставки в столбец Dynamic сохраняются как строка ClickHouse (String) |

### Специализированные методы вставки \\{#specialized-insert-methods\\}

ClickHouse Connect предоставляет специализированные методы вставки для распространённых форматов данных:

- `insert_df` -- Вставка объекта Pandas DataFrame. Вместо аргумента `data` типа Python Sequence of Sequences вторым параметром этого метода является аргумент `df`, который должен быть экземпляром Pandas DataFrame. ClickHouse Connect автоматически обрабатывает DataFrame как столбцово-ориентированный источник данных, поэтому параметр `column_oriented` не требуется и недоступен.
- `insert_arrow` -- Вставка объекта PyArrow Table. ClickHouse Connect передаёт таблицу Arrow на сервер ClickHouse без изменений для обработки, поэтому, помимо `table` и `arrow_table`, доступны только аргументы `database` и `settings`.
- `insert_df_arrow` -- Вставка Pandas DataFrame на базе Arrow или Polars DataFrame. ClickHouse Connect автоматически определит, относится ли DataFrame к типу Pandas или Polars. Если это Pandas, будет выполнена проверка, чтобы убедиться, что backend типа dtype каждого столбца основан на Arrow, и будет сгенерирована ошибка, если для каких-либо столбцов это не так.

:::note
Массив NumPy является допустимым типом Sequence of Sequences и может использоваться как аргумент `data` для основного метода `insert`, поэтому специализированный метод не требуется.
:::

#### Вставка из DataFrame Pandas \\{#pandas-dataframe-insert\\}

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

#### Вставка из таблицы PyArrow \\{#pyarrow-table-insert\\}

```python
import clickhouse_connect
import pyarrow as pa

client = clickhouse_connect.get_client()

arrow_table = pa.table({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)
```

#### Вставка DataFrame на основе Arrow (pandas 2.x) \\{#arrow-backed-dataframe-insert-pandas-2\\}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

# Convert to Arrow-backed dtypes for better performance
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)
```

### Часовые пояса \\{#time-zones\\}

При вставке объектов Python `datetime.datetime` в столбцы ClickHouse `DateTime` или `DateTime64` ClickHouse Connect автоматически обрабатывает информацию о часовом поясе. Поскольку ClickHouse хранит все значения `DateTime` как не зависящие от часового пояса Unix-метки времени (секунды или доли секунды с начала эпохи Unix), преобразование часовых поясов автоматически выполняется на стороне клиента при вставке.

#### Объекты datetime с информацией о часовом поясе \\{#timezone-aware-datetime-objects\\}

Если вы вставляете Python-объект `datetime.datetime` с информацией о часовом поясе, ClickHouse Connect автоматически вызовет `.timestamp()` для преобразования его в метку времени Unix, которая корректно учитывает смещение часового пояса. Это означает, что вы можете вставлять объекты datetime из любого часового пояса, и они будут корректно сохранены как эквивалентные им UTC-метки времени.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

# Insert timezone-aware datetime objects
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]

client.insert('events', data, column_names=['event_time'])
results = client.query("SELECT * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 10, 30),)
# (datetime.datetime(2023, 6, 15, 16, 30),)
# (datetime.datetime(2023, 6, 15, 1, 30),)
```

В этом примере все три объекта datetime представляют разные моменты времени, поскольку используют разные часовые пояса. Каждый из них будет корректно преобразован в соответствующий Unix timestamp и сохранён в ClickHouse.

:::note
При использовании pytz необходимо вызывать метод `localize()`, чтобы добавить информацию о часовом поясе к наивному объекту datetime. Передача `tzinfo=` напрямую в конструктор datetime приведёт к использованию некорректных исторических смещений. Для UTC вариант `tzinfo=pytz.UTC` работает корректно. См. [документацию pytz](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic) для получения дополнительной информации.
:::

#### Объекты datetime без часового пояса \\{#timezone-naive-datetime-objects\\}

Если вы вставляете Python-объект `datetime.datetime` без часового пояса (без `tzinfo`), метод `.timestamp()` будет интерпретировать его как время в локальном часовом поясе системы. Чтобы избежать неоднозначности, рекомендуется:

1. Всегда использовать объекты datetime с явным часовым поясом при вставке, или
2. Убедиться, что часовой пояс вашей системы установлен в UTC, или
3. Вручную преобразовать значения во временные метки эпохи перед вставкой

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Recommended: Always use timezone-aware datetimes
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])

# Alternative: Convert to epoch timestamp manually
naive_time = datetime(2023, 6, 15, 10, 30, 0)
epoch_timestamp = int(naive_time.replace(tzinfo=pytz.UTC).timestamp())
client.insert('events', [[epoch_timestamp]], column_names=['event_time'])
```

#### Столбцы DateTime с метаданными часового пояса \\{#datetime-columns-with-timezone-metadata\\}

Столбцы ClickHouse могут быть объявлены с метаданными часового пояса (например, `DateTime('America/Denver')` или `DateTime64(3, 'Asia/Tokyo')`). Эти метаданные не влияют на то, как данные хранятся (по‑прежнему как метки времени в формате UTC), но определяют часовой пояс, используемый при запросе данных из ClickHouse.

При вставке в такие столбцы ClickHouse Connect конвертирует ваш Python‑объект `datetime` в Unix‑метку времени (учитывая его часовой пояс, если он задан). При последующем запросе данных ClickHouse Connect вернет значение `datetime`, преобразованное в часовой пояс столбца, независимо от того, какой часовой пояс вы использовали при вставке.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Create table with Los Angeles timezone metadata
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")

# Insert a New York time (10:30 AM EDT, which is 14:30 UTC)
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])

# When queried back, the time is automatically converted to Los Angeles timezone
# 10:30 AM New York (UTC-4) = 14:30 UTC = 7:30 AM Los Angeles (UTC-7)
results = client.query("select * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)
```

## Вставка из файла \\{#file-inserts\\}

Пакет `clickhouse_connect.driver.tools` включает метод `insert_file`, который позволяет вставлять данные напрямую из файловой системы в существующую таблицу ClickHouse. Разбор данных выполняется на стороне сервера ClickHouse. `insert_file` принимает следующие параметры:

| Parameter        | Type            | Default           | Description                                                                                                                         |
| ---------------- | --------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| client           | Client          | *Required*        | Объект `driver.Client`, используемый для выполнения операции вставки                                                                |
| table            | str             | *Required*        | Таблица ClickHouse, в которую выполняется вставка. Допускается полное имя таблицы (включая базу данных).                            |
| file&#95;path    | str             | *Required*        | Путь к файлу данных в локальной файловой системе                                                                                    |
| fmt              | str             | CSV, CSVWithNames | Формат ввода ClickHouse для файла. Предполагается формат `CSVWithNames`, если `column_names` не передан                             |
| column&#95;names | Sequence of str | *None*            | Список имён столбцов в файле данных. Не требуется для форматов, включающих имена столбцов                                           |
| database         | str             | *None*            | База данных таблицы. Игнорируется, если указано полное имя таблицы. Если не указано, вставка будет использовать базу данных клиента |
| settings         | dict            | *None*            | См. [описание settings](driver-api.md#settings-argument).                                                                           |
| compression      | str             | *None*            | Поддерживаемый тип сжатия ClickHouse (zstd, lz4, gzip), используемый для HTTP-заголовка Content-Encoding                            |

Для файлов с некорректными данными или значениями даты/времени в нестандартном формате для этого метода учитываются настройки, применимые к импорту данных (такие как `input_format_allow_errors_num` и `input_format_allow_errors_num`).

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
