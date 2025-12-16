---
sidebar_label: 'Расширенные возможности'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'Расширенные возможности ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-usage
title: 'Расширенные возможности'
doc_type: 'reference'
---

# Продвинутое использование {#advanced-usage}

## Низкоуровневый API {#raw-api}

Для сценариев, которым не требуется выполнять преобразование между данными ClickHouse и нативными или сторонними типами данных и структурами, клиент ClickHouse Connect предоставляет методы для непосредственной работы с соединением ClickHouse.

### Метод клиента `raw_query` {#client-rawquery-method}

Метод `Client.raw_query` позволяет напрямую использовать HTTP-интерфейс запросов ClickHouse через клиентское подключение. Возвращаемое значение — необработанный объект `bytes`. Метод предоставляет удобную обёртку с привязкой параметров, обработкой ошибок, повторными попытками и управлением настройками через минималистичный интерфейс:

| Параметр      | Тип              | Значение по умолчанию | Описание                                                                                                                                                 |
|---------------|------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required*             | Любой корректный запрос ClickHouse                                                                                                                       |
| parameters    | dict or iterable | *None*                 | См. [описание параметра `parameters`](driver-api.md#parameters-argument).                                                                                |
| settings      | dict             | *None*                 | См. [описание параметра `settings`](driver-api.md#settings-argument).                                                                                    |
| fmt           | str              | *None*                 | Формат вывода ClickHouse для возвращаемых байтов. (Если не указан, ClickHouse использует TSV.)                                                           |
| use_database  | bool             | True                   | Использовать назначенную клиентом ClickHouse Connect базу данных в качестве контекста запроса                                                           |
| external_data | ExternalData     | *None*                 | Объект ExternalData, содержащий файловые или бинарные данные для использования в запросе. См. [Advanced Queries (External Data)](advanced-querying.md#external-data) |

Обработка возвращаемого объекта `bytes` лежит на вызывающей стороне. Обратите внимание, что `Client.query_arrow` — это лишь тонкая обёртка над этим методом, использующая формат вывода ClickHouse `Arrow`.

### Метод клиента `raw_stream` {#client-rawstream-method}

Метод `Client.raw_stream` имеет тот же API, что и метод `raw_query`, но возвращает объект `io.IOBase`, который может использоваться в качестве генератора/источника потока объектов `bytes`. В настоящее время он используется методом `query_arrow_stream`.

### Метод `raw_insert` клиента {#client-rawinsert-method}

Метод `Client.raw_insert` позволяет напрямую вставлять объекты типа `bytes` или генераторы объектов `bytes`, используя подключение клиента. Поскольку он не выполняет обработку вставляемых данных, он обладает очень высокой производительностью. Метод предоставляет параметры для указания настроек и формата вставки:

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | Простое имя таблицы или полное имя таблицы с указанием базы данных                         |
| column_names | Sequence[str]                          | *None*     | Имена столбцов для блока вставки. Обязателен, если параметр `fmt` не включает имена        |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | Данные для вставки. Строки будут закодированы в соответствии с кодировкой клиента.         |
| settings     | dict                                   | *None*     | См. [описание настроек](driver-api.md#settings-argument).                                   |
| fmt          | str                                    | *None*     | Формат ввода ClickHouse (Input Format) для байтов `insert_block`. (Если не указан, ClickHouse использует TSV) |

Ответственность за то, чтобы `insert_block` был в указанном формате и использовал указанный метод сжатия, лежит на вызывающем коде. ClickHouse Connect использует такие «сырые» вставки для загрузки файлов и таблиц PyArrow, делегируя разбор серверу ClickHouse.

## Сохранение результатов запроса в файлы {#saving-query-results-as-files}

Вы можете напрямую выгружать файлы из ClickHouse в локальную файловую систему с помощью метода `raw_stream`. Например, если вы хотите сохранить результаты запроса в CSV‑файл, используйте следующий фрагмент кода:

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # or CSV, or CSVWithNamesAndTypes, or TabSeparated, etc.
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

Аналогичным образом вы можете сохранять данные в формате [TabSeparated](/interfaces/formats/TabSeparated), а также в других форматах. Обзор всех доступных вариантов приведён в разделе [Форматы входных и выходных данных](/interfaces/formats).

## Многопоточные, многопроцессные и асинхронные/с управлением через цикл событий варианты использования {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect хорошо работает в многопоточных, многопроцессных и асинхронных приложениях, управляемых циклом событий. Вся обработка запросов и вставок выполняется в одном потоке, поэтому операции в целом потокобезопасны. (Параллельная обработка некоторых операций на низком уровне рассматривается как потенциальное будущее улучшение для преодоления накладных расходов, связанных с использованием одного потока, но даже в этом случае потокобезопасность будет сохранена.)

Поскольку каждый выполняемый запрос или вставка хранит состояние в собственном объекте `QueryContext` или `InsertContext` соответственно, эти вспомогательные объекты не являются потокобезопасными, и их не следует совместно использовать между несколькими потоками обработки. См. дополнительное обсуждение объектов контекста в разделах [QueryContexts](advanced-querying.md#querycontexts) и [InsertContexts](advanced-inserting.md#insertcontexts).

Кроме того, в приложении, в котором два или более запросов и/или вставок выполняются «на лету» одновременно, необходимо учитывать ещё два аспекта. Первый — это «сессия» ClickHouse, связанная с запросом/вставкой, а второй — пул HTTP‑соединений, используемый экземплярами клиента ClickHouse Connect.

## Обёртка AsyncClient {#asyncclient-wrapper}

ClickHouse Connect предоставляет асинхронную обёртку над обычным клиентом `Client`, чтобы можно было использовать клиент в среде `asyncio`.

Чтобы получить экземпляр `AsyncClient`, вы можете использовать фабричную функцию `get_async_client`, которая принимает те же параметры, что и стандартная `get_client`:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # Output:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` имеет те же методы с теми же параметрами, что и стандартный `Client`, но, когда это применимо, они представляют собой корутины. Внутри эти методы из `Client`, выполняющие операции ввода‑вывода, оборачиваются вызовом [run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor).

Производительность в многопоточной среде возрастет при использовании обертки `AsyncClient`, так как потоки выполнения и GIL будут освобождаться во время ожидания завершения операций ввода‑вывода.

Примечание: в отличие от обычного `Client`, `AsyncClient` принудительно устанавливает `autogenerate_session_id` в значение `False` по умолчанию.

См. также: [пример run&#95;async](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).

## Управление идентификаторами сессий ClickHouse {#managing-clickhouse-session-ids}

Каждый запрос ClickHouse выполняется в контексте «сессии» ClickHouse. В настоящее время сессии используются для двух целей:

* Связывать определённые настройки ClickHouse с несколькими запросами (см. [user settings](/operations/settings/settings.md)). Команда ClickHouse `SET` используется для изменения настроек в рамках пользовательской сессии.
* Отслеживать [временные таблицы.](/sql-reference/statements/create/table#temporary-tables)

По умолчанию каждый запрос, выполняемый с экземпляром ClickHouse Connect `Client`, использует идентификатор сессии этого клиента. Операторы `SET` и временные таблицы работают как ожидается при использовании одного клиента. Однако сервер ClickHouse не допускает параллельные запросы в рамках одной сессии (при попытке клиент сгенерирует исключение `ProgrammingError`). Для приложений, выполняющих параллельные запросы, используйте один из следующих подходов:

1. Создайте отдельный экземпляр `Client` для каждого потока/процесса/обработчика событий, которому требуется изоляция сессий. Это сохраняет состояние сессии для каждого клиента (временные таблицы и значения `SET`).
2. Используйте уникальный `session_id` для каждого запроса через аргумент `settings` при вызове `query`, `command` или `insert`, если вам не требуется общее состояние сессии.
3. Отключите сессии для общего клиента, установив `autogenerate_session_id=False` перед созданием клиента (или передайте его напрямую в `get_client`).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

В качестве альтернативы передайте `autogenerate_session_id=False` напрямую в `get_client(...)`.

В этом случае ClickHouse Connect не отправляет `session_id`, и сервер не будет считать отдельные запросы принадлежащими одному сеансу. Временные таблицы и параметры сеанса не будут сохраняться между запросами.

## Настройка пула HTTP‑подключений {#customizing-the-http-connection-pool}

ClickHouse Connect использует пулы подключений `urllib3` для работы с базовым HTTP‑подключением к серверу. По умолчанию все экземпляры клиента используют один и тот же пул подключений, чего достаточно для большинства сценариев использования. Этот пул по умолчанию поддерживает до 8 HTTP Keep Alive‑подключений к каждому серверу ClickHouse, задействованному приложением.

Для больших многопоточных приложений могут быть уместны отдельные пулы подключений. Настраиваемые пулы подключений можно передать в виде именованного аргумента `pool_mgr` основной функции `clickhouse_connect.get_client`:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

Как показано в приведённом выше примере, клиенты могут использовать общий менеджер пулов или создать отдельный менеджер пулов для каждого клиента. Дополнительные сведения о параметрах, доступных при создании `PoolManager`, см. в [документации `urllib3`](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior).
