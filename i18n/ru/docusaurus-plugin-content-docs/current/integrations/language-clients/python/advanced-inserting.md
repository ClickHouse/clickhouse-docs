---
sidebar_label: 'Расширенные способы вставки данных'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'Расширенные способы вставки данных с ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-inserting
title: 'Расширенные способы вставки данных'
doc_type: 'reference'
---



## Вставка данных с помощью ClickHouse Connect: расширенное использование {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContext {#insertcontexts}

ClickHouse Connect выполняет все вставки в контексте `InsertContext`. `InsertContext` включает все значения, переданные в качестве аргументов методу клиента `insert`. Кроме того, при первоначальном создании `InsertContext` ClickHouse Connect получает типы данных для столбцов вставки, необходимые для эффективной вставки в формате Native. При повторном использовании `InsertContext` для нескольких вставок этот «предварительный запрос» не выполняется, и вставки происходят быстрее и эффективнее.

`InsertContext` можно получить с помощью метода клиента `create_insert_context`. Метод принимает те же аргументы, что и функция `insert`. Обратите внимание, что для повторного использования следует изменять только свойство `data` объектов `InsertContext`. Это соответствует его назначению — предоставлять переиспользуемый объект для повторных вставок новых данных в одну и ту же таблицу.

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

`InsertContext` содержат изменяемое состояние, которое обновляется в процессе вставки, поэтому они не являются потокобезопасными.

### Форматы записи {#write-formats}

Форматы записи в настоящее время реализованы для ограниченного числа типов. В большинстве случаев ClickHouse Connect автоматически определяет правильный формат записи для столбца, проверяя тип первого (не NULL) значения данных. Например, при вставке в столбец `DateTime`, если первое вставляемое значение столбца является целым числом Python, ClickHouse Connect напрямую вставит целочисленное значение, предполагая, что это секунды эпохи Unix.

В большинстве случаев нет необходимости переопределять формат записи для типа данных, но соответствующие методы в пакете `clickhouse_connect.datatypes.format` можно использовать для этого на глобальном уровне.

#### Параметры формата записи {#write-format-options}


| Тип ClickHouse        | Нативный тип Python     | Форматы записи    | Комментарии                                                                                                 |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | При вставке как строки дополнительные байты будут заполнены нулями                                          |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse хранит значения Date как количество дней, прошедших с 01/01/1970. Для типов int предполагается, что это значение «даты эпохи» |
| Date32                | datetime.date           | int               | То же, что и Date, но для более широкого диапазона дат                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouse хранит значения DateTime в секундах с начала эпохи. Для типов int предполагается, что это значение «секунд эпохи» |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime ограничен микросекундной точностью. Доступно «сырое» 64‑битное целое значение      |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse хранит значения DateTime в секундах с начала эпохи. Для типов int предполагается, что это значение «секунд эпохи» |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta ограничен микросекундной точностью. Доступно «сырое» 64‑битное целое значение     |
| IPv4                  | `ipaddress.IPv4Address` | string            | Корректно отформатированные строки можно вставлять как IPv4‑адреса                                         |
| IPv6                  | `ipaddress.IPv6Address` | string            | Корректно отформатированные строки можно вставлять как IPv6‑адреса                                         |
| Tuple                 | dict or tuple           |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | Корректно отформатированные строки можно вставлять как UUID в ClickHouse                                    |
| JSON/Object('json')   | dict                    | string            | В JSON‑столбцы можно вставлять либо словари, либо JSON‑строки (обратите внимание, `Object('json')` устарел) |
| Variant               | object                  |                   | В настоящее время все значения Variant вставляются как строки и разбираются сервером ClickHouse             |
| Dynamic               | object                  |                   | Предупреждение: в настоящее время любые вставки в столбец Dynamic сохраняются как значение типа String в ClickHouse |

### Специализированные методы вставки {#specialized-insert-methods}

ClickHouse Connect предоставляет специализированные методы вставки для распространённых форматов данных:

- `insert_df` -- Вставка объекта Pandas DataFrame. Вместо аргумента `data` (Python Sequence of Sequences) второй параметр этого метода — аргумент `df`, который должен быть экземпляром Pandas DataFrame. ClickHouse Connect автоматически обрабатывает DataFrame как столбцовый источник данных, поэтому параметр `column_oriented` не требуется и недоступен.
- `insert_arrow` -- Вставка таблицы PyArrow. ClickHouse Connect передаёт таблицу Arrow на сервер ClickHouse без изменений для обработки, поэтому, помимо `table` и `arrow_table`, доступны только аргументы `database` и `settings`.
- `insert_df_arrow` -- Вставка Pandas DataFrame на базе Arrow или Polars DataFrame. ClickHouse Connect автоматически определит, является ли DataFrame типом Pandas или Polars. Для Pandas будет выполнена проверка, что backend типа данных (dtype) каждого столбца основан на Arrow; если для какого‑либо столбца это не так, будет сгенерировано исключение.

:::note
Массив NumPy является корректным Sequence of Sequences и может использоваться как аргумент `data` для основного метода `insert`, поэтому специализированный метод не обязателен.
:::

#### Вставка Pandas DataFrame {#pandas-dataframe-insert}

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

#### Вставка таблицы PyArrow {#pyarrow-table-insert}

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

#### Вставка DataFrame с поддержкой Arrow (pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

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

При вставке объектов Python `datetime.datetime` в столбцы ClickHouse `DateTime` или `DateTime64` ClickHouse Connect автоматически обрабатывает информацию о часовом поясе. Поскольку ClickHouse хранит все значения DateTime внутренне как Unix-метки времени без привязки к часовому поясу (секунды или доли секунд с начала эпохи), преобразование часового пояса происходит автоматически на стороне клиента при вставке.

#### Объекты datetime с информацией о часовом поясе {#timezone-aware-datetime-objects}

Если вы вставляете объект Python `datetime.datetime` с информацией о часовом поясе, ClickHouse Connect автоматически вызовет `.timestamp()` для преобразования его в Unix-метку времени, что корректно учитывает смещение часового пояса. Это означает, что вы можете вставлять объекты datetime из любого часового пояса, и они будут корректно сохранены как эквивалентная метка времени UTC.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

````


# Вставка объектов datetime с информацией о часовом поясе
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
При использовании pytz необходимо использовать метод `localize()` для привязки информации о часовом поясе к наивному datetime. Передача `tzinfo=` напрямую в конструктор datetime приведёт к использованию некорректных исторических смещений. Для UTC параметр `tzinfo=pytz.UTC` работает корректно. Подробнее см. в [документации pytz](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic).
:::

#### Объекты datetime без часового пояса {#timezone-naive-datetime-objects}

Если вы вставляете объект Python `datetime.datetime` без часового пояса (без `tzinfo`), метод `.timestamp()` интерпретирует его как находящийся в локальном часовом поясе системы. Чтобы избежать неоднозначности, рекомендуется:

1. Всегда использовать объекты datetime с указанием часового пояса при вставке, или
2. Убедиться, что системный часовой пояс установлен на UTC, или
3. Вручную преобразовывать во временные метки эпохи перед вставкой

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# Рекомендуется: всегда использовать часовые пояса в датах и времени
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# Альтернатива: вручную преобразовать во временную метку эпохи (epoch timestamp)

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### Колонки DateTime с метаданными часового пояса {#datetime-columns-with-timezone-metadata}

Колонки ClickHouse могут быть определены с метаданными часового пояса (например, `DateTime('America/Denver')` или `DateTime64(3, 'Asia/Tokyo')`). Эти метаданные не влияют на способ хранения данных (данные по-прежнему хранятся как временные метки UTC), но определяют часовой пояс, используемый при извлечении данных из ClickHouse.

При вставке данных в такие колонки ClickHouse Connect преобразует объект datetime из Python в временную метку Unix (с учетом его часового пояса, если он указан). При извлечении данных ClickHouse Connect возвращает datetime, преобразованный в часовой пояс колонки, независимо от того, какой часовой пояс использовался при вставке.

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# Создайте таблицу с часовым поясом Лос-Анджелеса в метаданных
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# Вставка времени для Нью‑Йорка (10:30 AM EDT, что соответствует 14:30 UTC)
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# При выполнении запроса время автоматически преобразуется в часовой пояс Лос-Анджелеса

# 10:30 утра Нью-Йорк (UTC-4) = 14:30 UTC = 7:30 утра Лос-Анджелес (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# Результат:

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## Вставка из файлов {#file-inserts}

Пакет `clickhouse_connect.driver.tools` включает метод `insert_file`, который позволяет вставлять данные напрямую из файловой системы в существующую таблицу ClickHouse. Парсинг делегируется серверу ClickHouse. Метод `insert_file` принимает следующие параметры:

| Параметр     | Тип             | По умолчанию      | Описание                                                                                                                                    |
| ------------ | --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| client       | Client          | _Обязательный_    | `driver.Client`, используемый для выполнения вставки                                                                                        |
| table        | str             | _Обязательный_    | Таблица ClickHouse, в которую вставляются данные. Допускается полное имя таблицы (включая базу данных).                                     |
| file_path    | str             | _Обязательный_    | Путь к файлу данных в файловой системе                                                                                                      |
| fmt          | str             | CSV, CSVWithNames | Входной формат ClickHouse для файла. Если `column_names` не указан, предполагается CSVWithNames                                            |
| column_names | Sequence of str | _None_            | Список имен столбцов в файле данных. Не требуется для форматов, которые включают имена столбцов                                             |
| database     | str             | _None_            | База данных таблицы. Игнорируется, если таблица указана полностью. Если не указана, при вставке будет использована база данных клиента      |
| settings     | dict            | _None_            | См. [описание настроек](driver-api.md#settings-argument).                                                                                   |
| compression  | str             | _None_            | Распознаваемый тип сжатия ClickHouse (zstd, lz4, gzip), используемый для HTTP-заголовка Content-Encoding                                    |

Для файлов с несогласованными данными или значениями даты/времени в нестандартном формате этот метод поддерживает настройки, применимые к импорту данных (такие как `input_format_allow_errors_num` и `input_format_allow_errors_ratio`).

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
