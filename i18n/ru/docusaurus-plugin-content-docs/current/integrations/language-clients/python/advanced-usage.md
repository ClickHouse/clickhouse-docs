---
sidebar_label: 'Расширенное использование'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'Расширенные сценарии использования ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-usage
title: 'Расширенное использование'
doc_type: 'reference'
---



# Продвинутое использование {#advanced-usage}


## Низкоуровневый API {#raw-api}

Для сценариев использования, не требующих преобразования между данными ClickHouse и нативными или сторонними типами данных и структурами, клиент ClickHouse Connect предоставляет методы для прямого использования соединения с ClickHouse.

### Метод `raw_query` клиента {#client-rawquery-method}

Метод `Client.raw_query` позволяет напрямую использовать HTTP-интерфейс запросов ClickHouse через клиентское соединение. Возвращаемое значение представляет собой необработанный объект `bytes`. Метод предоставляет удобную обёртку с привязкой параметров, обработкой ошибок, повторными попытками и управлением настройками через минималистичный интерфейс:

| Параметр      | Тип              | По умолчанию | Описание                                                                                                                                             |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query         | str              | _Обязательный_ | Любой допустимый запрос ClickHouse                                                                                                                              |
| parameters    | dict or iterable | _None_     | См. [описание параметров](driver-api.md#parameters-argument).                                                                                        |
| settings      | dict             | _None_     | См. [описание настроек](driver-api.md#settings-argument).                                                                                            |
| fmt           | str              | _None_     | Формат вывода ClickHouse для результирующих байтов. (ClickHouse использует TSV, если не указано)                                                                |
| use_database  | bool             | True       | Использовать базу данных, назначенную клиентом ClickHouse Connect, для контекста запроса                                                                               |
| external_data | ExternalData     | _None_     | Объект ExternalData, содержащий файловые или бинарные данные для использования с запросом. См. [Расширенные запросы (внешние данные)](advanced-querying.md#external-data) |

Обработка результирующего объекта `bytes` является ответственностью вызывающей стороны. Обратите внимание, что `Client.query_arrow` — это всего лишь тонкая обёртка вокруг этого метода, использующая формат вывода ClickHouse `Arrow`.

### Метод `raw_stream` клиента {#client-rawstream-method}

Метод `Client.raw_stream` имеет тот же API, что и метод `raw_query`, но возвращает объект `io.IOBase`, который может использоваться как генератор/источник потока объектов `bytes`. В настоящее время он используется методом `query_arrow_stream`.

### Метод `raw_insert` клиента {#client-rawinsert-method}

Метод `Client.raw_insert` позволяет напрямую вставлять объекты `bytes` или генераторы объектов `bytes` через клиентское соединение. Поскольку он не выполняет обработку данных для вставки, он обладает высокой производительностью. Метод предоставляет опции для указания настроек и формата вставки:

| Параметр     | Тип                                    | По умолчанию | Описание                                                                                 |
| ------------ | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| table        | str                                    | _Обязательный_ | Простое или полное имя таблицы с указанием базы данных                                          |
| column_names | Sequence[str]                          | _None_     | Имена столбцов для блока вставки. Обязательно, если параметр `fmt` не включает имена   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | _Обязательный_ | Данные для вставки. Строки будут закодированы с использованием кодировки клиента.                           |
| settings     | dict                                   | _None_     | См. [описание настроек](driver-api.md#settings-argument).                                |
| fmt          | str                                    | _None_     | Формат ввода ClickHouse для байтов `insert_block`. (ClickHouse использует TSV, если не указано) |

Обеспечение того, что `insert_block` находится в указанном формате и использует указанный метод сжатия, является ответственностью вызывающей стороны. ClickHouse Connect использует эти низкоуровневые вставки для загрузки файлов и таблиц PyArrow, делегируя парсинг серверу ClickHouse.


## Сохранение результатов запроса в файлы {#saving-query-results-as-files}

Вы можете передавать данные напрямую из ClickHouse в локальную файловую систему, используя метод `raw_stream`. Например, чтобы сохранить результаты запроса в CSV-файл, можно использовать следующий фрагмент кода:

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # или CSV, или CSVWithNamesAndTypes, или TabSeparated и т. д.
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

Приведённый выше код создаёт файл `output.csv` со следующим содержимым:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

Аналогичным образом можно сохранять данные в форматах [TabSeparated](/interfaces/formats/TabSeparated) и других. Обзор всех доступных форматов см. в разделе [Форматы входных и выходных данных](/interfaces/formats).


## Многопоточные, многопроцессные и асинхронные/событийно-ориентированные сценарии использования {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect хорошо работает в многопоточных, многопроцессных и асинхронных приложениях, управляемых циклом событий. Вся обработка запросов и вставок происходит в одном потоке, поэтому операции в целом потокобезопасны. (Параллельная обработка некоторых операций на низком уровне является возможным будущим улучшением для преодоления потерь производительности при использовании одного потока, но даже в этом случае потокобезопасность будет сохранена.)

Поскольку каждый выполняемый запрос или вставка поддерживает состояние в собственном объекте `QueryContext` или `InsertContext` соответственно, эти вспомогательные объекты не являются потокобезопасными и не должны использоваться совместно между несколькими потоками обработки. Дополнительное обсуждение объектов контекста см. в разделах [QueryContexts](advanced-querying.md#querycontexts) и [InsertContexts](advanced-inserting.md#insertcontexts).

Кроме того, в приложении, в котором одновременно выполняются два или более запроса и/или вставки, необходимо учитывать два дополнительных момента. Первый — это сессия ClickHouse, связанная с запросом/вставкой, а второй — пул HTTP-соединений, используемый экземплярами клиента ClickHouse Connect.


## Обёртка AsyncClient {#asyncclient-wrapper}

ClickHouse Connect предоставляет асинхронную обёртку над обычным `Client`, что позволяет использовать клиент в среде `asyncio`.

Чтобы получить экземпляр `AsyncClient`, используйте фабричную функцию `get_async_client`, которая принимает те же параметры, что и стандартная `get_client`:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # Вывод:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` имеет те же методы с теми же параметрами, что и стандартный `Client`, но они являются сопрограммами там, где это применимо. Внутри эти методы `Client`, выполняющие операции ввода-вывода, обёрнуты в вызов [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor).

Многопоточная производительность повысится при использовании обёртки `AsyncClient`, так как потоки выполнения и GIL будут освобождаться во время ожидания завершения операций ввода-вывода.

Примечание: В отличие от обычного `Client`, `AsyncClient` по умолчанию устанавливает для `autogenerate_session_id` значение `False`.

См. также: [пример run_async](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).


## Управление идентификаторами сессий ClickHouse {#managing-clickhouse-session-ids}

Каждый запрос ClickHouse выполняется в контексте «сессии» ClickHouse. В настоящее время сессии используются для двух целей:

- Для связывания определённых настроек ClickHouse с несколькими запросами (см. [пользовательские настройки](/operations/settings/settings.md)). Команда ClickHouse `SET` используется для изменения настроек в области видимости пользовательской сессии.
- Для отслеживания [временных таблиц](/sql-reference/statements/create/table#temporary-tables).

По умолчанию каждый запрос, выполняемый с экземпляром `Client` ClickHouse Connect, использует идентификатор сессии этого клиента. Операторы `SET` и временные таблицы работают как ожидается при использовании одного клиента. Однако сервер ClickHouse не допускает параллельных запросов в рамках одной сессии (при попытке клиент вызовет исключение `ProgrammingError`). Для приложений, выполняющих параллельные запросы, используйте один из следующих подходов:

1. Создайте отдельный экземпляр `Client` для каждого потока/процесса/обработчика событий, которому требуется изоляция сессии. Это сохраняет состояние сессии для каждого клиента (временные таблицы и значения `SET`).
2. Используйте уникальный `session_id` для каждого запроса через аргумент `settings` при вызове `query`, `command` или `insert`, если вам не требуется общее состояние сессии.
3. Отключите сессии для общего клиента, установив `autogenerate_session_id=False` перед созданием клиента (или передайте это значение напрямую в `get_client`).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # Это всегда следует устанавливать перед созданием клиента
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

Альтернативно, передайте `autogenerate_session_id=False` напрямую в `get_client(...)`.

В этом случае ClickHouse Connect не отправляет `session_id`; сервер не рассматривает отдельные запросы как принадлежащие одной сессии. Временные таблицы и настройки уровня сессии не будут сохраняться между запросами.


## Настройка пула HTTP-соединений {#customizing-the-http-connection-pool}

ClickHouse Connect использует пулы соединений `urllib3` для управления базовым HTTP-соединением с сервером. По умолчанию все экземпляры клиента используют общий пул соединений, чего достаточно для большинства сценариев использования. Этот пул по умолчанию поддерживает до 8 HTTP Keep Alive соединений с каждым сервером ClickHouse, используемым приложением.

Для крупных многопоточных приложений могут потребоваться отдельные пулы соединений. Настроенные пулы соединений можно передать в качестве именованного аргумента `pool_mgr` в основную функцию `clickhouse_connect.get_client`:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

Как показано в примере выше, клиенты могут использовать общий менеджер пула, или для каждого клиента можно создать отдельный менеджер пула. Подробнее о доступных параметрах при создании PoolManager см. в [документации `urllib3`](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior).
