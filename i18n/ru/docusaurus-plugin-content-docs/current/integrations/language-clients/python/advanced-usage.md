---
sidebar_label: 'Продвинутое использование'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'Продвинутое использование ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-usage
title: 'Продвинутое использование'
doc_type: 'reference'
---



# Расширенное использование {#advanced-usage}



## Низкоуровневый API {#raw-api}

Для сценариев, в которых не требуется преобразование между данными ClickHouse и собственными или сторонними типами данных и структурами, клиент ClickHouse Connect предоставляет методы для прямого использования соединения с ClickHouse.

### Метод клиента `raw_query` {#client-rawquery-method}

Метод `Client.raw_query` позволяет напрямую использовать HTTP-интерфейс запросов ClickHouse через клиентское соединение. Возвращаемое значение — необработанный объект `bytes`. Метод представляет собой удобную обёртку с привязкой параметров, обработкой ошибок, повторными попытками и управлением настройками через минимальный интерфейс:

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | Любой корректный запрос ClickHouse                                                                                                                      |
| parameters    | dict or iterable | *None*     | См. [описание параметров](driver-api.md#parameters-argument).                                                                                            |
| settings      | dict             | *None*     | См. [описание настроек](driver-api.md#settings-argument).                                                                                               |
| fmt           | str              | *None*     | Формат вывода ClickHouse для результирующих байт (ClickHouse использует TSV, если не указан).                                                           |
| use_database  | bool             | True       | Использовать назначенную клиентом ClickHouse Connect базу данных в качестве контекста запроса                                                           |
| external_data | ExternalData     | *None*     | Объект ExternalData, содержащий файловые или бинарные данные для использования в запросе. См. [Расширенные запросы (внешние данные)](advanced-querying.md#external-data) |

Обработка результирующего объекта `bytes` лежит на вызывающем коде. Обратите внимание, что `Client.query_arrow` — это всего лишь тонкая обёртка вокруг этого метода, использующая формат вывода ClickHouse `Arrow`.

### Метод клиента `raw_stream` {#client-rawstream-method}
Метод `Client.raw_stream` имеет тот же API, что и метод `raw_query`, но возвращает объект `io.IOBase`, который можно использовать как генератор/источник потока объектов `bytes`. В настоящее время он используется методом `query_arrow_stream`.

### Метод клиента `raw_insert` {#client-rawinsert-method}

Метод `Client.raw_insert` позволяет выполнять прямые вставки объектов `bytes` или генераторов объектов `bytes`, используя клиентское соединение. Поскольку он не выполняет обработку полезной нагрузки вставки, он обладает высокой производительностью. Метод предоставляет возможность указать настройки и формат вставки:

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | Простое имя таблицы или имя таблицы с указанием базы данных                                |
| column_names | Sequence[str]                          | *None*     | Имена столбцов для блока вставки. Обязательны, если параметр `fmt` не включает имена       |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | Данные для вставки. Строки будут закодированы с использованием кодировки клиента.          |
| settings     | dict                                   | *None*     | См. [описание настроек](driver-api.md#settings-argument).                                   |
| fmt          | str                                    | *None*     | Формат ввода ClickHouse для байт `insert_block` (ClickHouse использует TSV, если не указан). |

Ответственность за то, чтобы `insert_block` соответствовал указанному формату и использовал указанный метод сжатия, лежит на вызывающем коде. ClickHouse Connect использует эти низкоуровневые вставки для загрузки файлов и таблиц PyArrow, передавая разбор серверу ClickHouse.



## Сохранение результатов запроса в файлы

Вы можете потоково передавать данные напрямую из ClickHouse в локальную файловую систему, используя метод `raw_stream`. Например, если вы хотите сохранить результаты запроса в CSV‑файл, используйте следующий фрагмент кода:

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

Также вы можете сохранять данные в формате [TabSeparated](/interfaces/formats/TabSeparated) и других форматах. См. [Форматы для ввода и вывода данных](/interfaces/formats) для обзора всех доступных форматов.


## Многопоточные, многопроцессные и асинхронные/событийно-ориентированные варианты использования {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect хорошо работает в многопоточных, многопроцессных и асинхронных (управляемых циклом событий) приложениях. Вся обработка запросов и вставок выполняется в одном потоке, поэтому операции в целом потокобезопасны. (Параллельная обработка некоторых операций на низком уровне рассматривается как возможное будущее улучшение, чтобы компенсировать потери производительности из‑за единственного потока, но даже в этом случае потокобезопасность будет сохранена.)

Поскольку каждый выполняемый запрос и каждая операция вставки имеют собственное состояние в объекте `QueryContext` или `InsertContext` соответственно, эти вспомогательные объекты не являются потокобезопасными и не должны разделяться между несколькими потоками обработки. См. подробное обсуждение объектов контекста в разделах [QueryContexts](advanced-querying.md#querycontexts) и [InsertContexts](advanced-inserting.md#insertcontexts).

Кроме того, в приложении, в котором одновременно выполняются два или более запроса и/или вставки «в полёте», следует учитывать ещё два момента. Первый — это «сеанс» ClickHouse, связанный с запросом/вставкой, а второй — пул HTTP‑соединений, используемый экземплярами клиента ClickHouse Connect.



## Обёртка AsyncClient

ClickHouse Connect предоставляет асинхронную обёртку над обычным `Client`, чтобы можно было использовать клиент в среде `asyncio`.

Чтобы получить экземпляр `AsyncClient`, вы можете использовать функцию-фабрику `get_async_client`, которая принимает те же параметры, что и стандартная `get_client`:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # Результат:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` имеет те же методы с теми же параметрами, что и стандартный `Client`, но, когда это применимо, они являются корутинами. Внутри методы из `Client`, которые выполняют операции ввода/вывода, обёрнуты в вызов [run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor).

Производительность в многопоточной среде увеличится при использовании `AsyncClient`, так как потоки исполнения и GIL будут освобождаться во время ожидания завершения операций ввода/вывода.

Примечание: в отличие от обычного `Client`, `AsyncClient` по умолчанию жёстко устанавливает `autogenerate_session_id` в значение `False`.

См. также: [пример run&#95;async](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).


## Управление идентификаторами сессий ClickHouse

Каждый запрос ClickHouse выполняется в контексте «сессии» ClickHouse. В настоящее время сессии используются для двух целей:

* Связывание определённых настроек ClickHouse с несколькими запросами (см. [настройки пользователя](/operations/settings/settings.md)). Команда ClickHouse `SET` используется для изменения настроек в рамках пользовательской сессии.
* Отслеживание [временных таблиц.](/sql-reference/statements/create/table#temporary-tables)

По умолчанию каждый запрос, выполняемый с использованием экземпляра `Client` ClickHouse Connect, использует идентификатор сессии этого клиента. Операторы `SET` и временные таблицы работают как ожидается при использовании одного клиента. Однако сервер ClickHouse не допускает параллельные запросы в рамках одной и той же сессии (клиент вызовет `ProgrammingError` при такой попытке). Для приложений, выполняющих параллельные запросы, используйте один из следующих подходов:

1. Создавайте отдельный экземпляр `Client` для каждого потока/процесса/обработчика событий, которому требуется изоляция сессии. Это сохраняет состояние сессии на уровне клиента (временные таблицы и значения `SET`).
2. Используйте уникальный `session_id` для каждого запроса через аргумент `settings` при вызове `query`, `command` или `insert`, если вам не требуется общее состояние сессии.
3. Отключите сессии для общего клиента, установив `autogenerate_session_id=False` перед созданием клиента (или передав это значение напрямую в `get_client`).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

Или передайте `autogenerate_session_id=False` напрямую в `get_client(...)`.

В этом случае ClickHouse Connect не отправляет `session_id`, и сервер не рассматривает отдельные запросы как относящиеся к одной сессии. Временные таблицы и настройки на уровне сессии не будут сохраняться между запросами.


## Настройка пула HTTP‑соединений

ClickHouse Connect использует пулы соединений `urllib3` для работы с низкоуровневым HTTP‑подключением к серверу. По умолчанию все экземпляры клиента используют общий пул соединений, чего достаточно для большинства сценариев использования. Этот пул по умолчанию поддерживает до 8 HTTP Keep Alive‑соединений с каждым сервером ClickHouse, используемым приложением.

Для крупных многопоточных приложений могут потребоваться отдельные пулы соединений. Пользовательские пулы соединений можно передать как именованный аргумент `pool_mgr` в основную функцию `clickhouse_connect.get_client`:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

Как показано в приведённом выше примере, клиенты могут использовать общий менеджер пулов или для каждого клиента может быть создан отдельный менеджер пулов. Более подробную информацию о доступных возможностях при создании `PoolManager` см. в [документации `urllib3`](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior).
