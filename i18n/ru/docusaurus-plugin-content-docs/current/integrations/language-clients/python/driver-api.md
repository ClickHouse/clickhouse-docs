---
sidebar_label: 'API драйвера'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'API драйвера ClickHouse Connect'
slug: /integrations/language-clients/python/driver-api
title: 'API драйвера ClickHouse Connect'
doc_type: 'reference'
---

# API драйвера ClickHouse Connect \{#clickhouse-connect-driver-api\}

:::note
Для большинства методов API рекомендуется передавать параметры в виде именованных аргументов, учитывая количество возможных аргументов, большинство из которых являются необязательными.

*Методы, не описанные здесь, не считаются частью API и могут быть удалены или изменены.*
:::

## Инициализация клиента \{#client-initialization\}

Класс `clickhouse_connect.driver.client` предоставляет основной интерфейс между Python‑приложением и сервером базы данных ClickHouse. Используйте функцию `clickhouse_connect.get_client` для получения экземпляра клиента; функция принимает следующие аргументы:

### Аргументы подключения \{#connection-arguments\}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | Должен быть http или https.                                                                                                                                                                                                                          |
| host                     | str         | localhost                     | Имя хоста или IP-адрес сервера ClickHouse. Если не задано, будет использован `localhost`.                                                                                                                                                            |
| port                     | int         | 8123 or 8443                  | HTTP- или HTTPS-порт ClickHouse. Если не задан, по умолчанию используется 8123 или 8443, если *secure*=*True* или *interface*=*https*.                                                                                                               |
| username                 | str         | default                       | Имя пользователя ClickHouse. Если не задано, будет использован пользователь ClickHouse `default`.                                                                                                                                                    |
| password                 | str         | *&lt;empty string&gt;*        | Пароль для *username*.                                                                                                                                                                                                                                |
| database                 | str         | *None*                        | База данных по умолчанию для подключения. Если не задана, ClickHouse Connect будет использовать базу данных по умолчанию для *username*.                                                                                                            |
| secure                   | bool        | False                         | Использовать HTTPS/TLS. Переопределяет значения, выведенные из аргументов interface или port.                                                                                                                                                        |
| dsn                      | str         | *None*                        | Строка в стандартном формате DSN (Data Source Name). Другие параметры подключения (такие как host или user) будут извлечены из этой строки, если они не заданы иным образом.                                                                         |
| compress                 | bool or str | True                          | Включить сжатие для HTTP-вставок и результатов запросов ClickHouse. См. [Additional Options (Compression)](additional-options.md#compression)                                                                                                        |
| query_limit              | int         | 0 (unlimited)                 | Максимальное число строк, возвращаемых для любого ответа `query`. Установите ноль для неограниченного числа строк. Обратите внимание, что большие значения лимита запроса могут привести к ошибкам нехватки памяти, если результаты не передаются потоково, так как все результаты загружаются в память сразу. |
| query_retries            | int         | 2                             | Максимальное число повторных попыток для запроса `query`. Повторно выполняются только «повторяемые» HTTP-ответы. Запросы `command` или `insert` не повторяются драйвером автоматически, чтобы избежать непреднамеренных дублирующих запросов.        |
| connect_timeout          | int         | 10                            | Тайм-аут HTTP-соединения в секундах.                                                                                                                                                                                                                 |
| send_receive_timeout     | int         | 300                           | Тайм-аут отправки/получения для HTTP-соединения в секундах.                                                                                                                                                                                          |
| client_name              | str         | *None*                        | `client_name`, добавляемый в начало заголовка HTTP User-Agent. Установите это значение, чтобы отслеживать клиентские запросы в ClickHouse system.query_log.                                                                                          |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | PoolManager библиотеки `urllib3`, который будет использоваться. Для сложных сценариев, требующих нескольких пулов подключений к разным хостам.                                                                                                      |
| http_proxy               | str         | *None*                        | Адрес HTTP-прокси (эквивалент установки переменной окружения HTTP_PROXY).                                                                                                                                                                            |
| https_proxy              | str         | *None*                        | Адрес HTTPS-прокси (эквивалент установки переменной окружения HTTPS_PROXY).                                                                                                                                                                          |
| apply_server_timezone    | bool        | True                          | Использовать часовой пояс сервера для результатов запросов с учётом часового пояса. См. [Timezone Precedence](advanced-querying.md#time-zones).                                                                                                      |
| show_clickhouse_errors   | bool        | True                          | Включать подробные сообщения об ошибках сервера ClickHouse и коды исключений в исключения клиента.                                                                                                                                                   |
| autogenerate_session_id  | bool        | *None*                        | Переопределить глобальный параметр `autogenerate_session_id`. Если True, автоматически генерировать идентификатор сессии UUID4, если он не указан.                                                                                                   |
| proxy_path               | str         | &lt;empty string&gt;          | Необязательный префикс пути, добавляемый к URL сервера ClickHouse для конфигураций с прокси.                                                                                                                                                         |
| form_encode_query_params | bool        | False                         | Отправлять параметры запроса как form-encoded данные в теле запроса вместо параметров URL. Полезно для запросов с большими наборами параметров, которые могут превысить ограничения длины URL.                                                       |
| rename_response_column   | str         | *None*                        | Необязательная callback-функция или отображение имён столбцов для переименования столбцов ответа в результатах запроса.                                                                                                                              |

### Параметры HTTPS/TLS \{#httpstls-arguments\}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | Проверяет TLS/SSL-сертификат сервера ClickHouse (имя хоста, срок действия и т. д.) при использовании HTTPS/TLS.                                                                                                                                                                  |
| ca_cert          | str  | *None*  | Если *verify*=*True*, путь к файлу корневого сертификата удостоверяющего центра (Certificate Authority) в формате .pem для проверки сертификата сервера ClickHouse. Игнорируется, если *verify*=*False*. Не требуется, если сертификат сервера ClickHouse выдан глобально доверенным корневым удостоверяющим центром и подтверждён операционной системой. |
| client_cert      | str  | *None*  | Путь к файлу клиентского TLS-сертификата в формате .pem (для взаимной аутентификации TLS). Файл должен содержать полную цепочку сертификатов, включая все промежуточные сертификаты.                                                                                            |
| client_cert_key  | str  | *None*  | Путь к файлу закрытого ключа для клиентского сертификата. Обязателен, если закрытый ключ не включён в файл с клиентским сертификатом.                                                                                                                                           |
| server_host_name | str  | *None*  | Имя хоста сервера ClickHouse, указанное в CN или SNI его TLS-сертификата. Задайте это значение, чтобы избежать ошибок SSL при подключении через прокси или туннель с другим именем хоста.                                                                                       |
| tls_mode         | str  | *None*  | Управляет расширенным поведением TLS. Режимы `proxy` и `strict` не устанавливают взаимное TLS-соединение с ClickHouse, но отправляют клиентский сертификат и ключ. Режим `mutual` предполагает взаимную TLS-аутентификацию ClickHouse с клиентским сертификатом. Поведение по умолчанию (*None*) — `mutual`.                     |

### Аргумент settings \{#settings-argument\}

Наконец, аргумент `settings` функции `get_client` используется для передачи дополнительных настроек ClickHouse серверу для каждого клиентского запроса. Обратите внимание, что в большинстве случаев пользователи с доступом *readonly*=*1* не могут изменять настройки, отправляемые вместе с запросом, поэтому ClickHouse Connect отбросит такие настройки в итоговом запросе и запишет предупреждение в журнал. Следующие настройки применяются только к HTTP‑запросам/сессиям, используемым ClickHouse Connect, и не документированы как общие настройки ClickHouse.

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | Размер буфера (в байтах), который сервер ClickHouse использует перед записью в HTTP‑канал.                                                                      |
| session_id        | Уникальный идентификатор сессии для привязки связанных запросов на сервере. Требуется для временных таблиц.                                                     |
| compress          | Должен ли сервер ClickHouse сжимать данные ответа на POST‑запрос. Эту настройку следует использовать только для «сырых» (`raw`) запросов.                        |
| decompress        | Нужно ли распаковывать данные, отправляемые на сервер ClickHouse. Эту настройку следует использовать только для «сырых» (`raw`) вставок.                        |
| quota_key         | Ключ квоты, связанный с этим запросом. См. документацию сервера ClickHouse по квотам.                                                                           |
| session_check     | Используется для проверки состояния сессии.                                                                                                                      |
| session_timeout   | Количество секунд простоя, по истечении которых сессия с указанным идентификатором будет закрыта и больше не будет считаться действительной. По умолчанию 60 секунд. |
| wait_end_of_query | Буферизует весь ответ на сервере ClickHouse. Эта настройка требуется для возврата сводной информации и автоматически устанавливается для нестреминговых запросов. |
| role              | Роль ClickHouse, которая будет использоваться для сессии. Допустимый транспортный параметр, который можно указать в контексте запроса.                         |

Для других настроек ClickHouse, которые могут быть отправлены с каждым запросом, см. [документацию ClickHouse](/operations/settings/settings.md).

### Примеры создания клиента \{#client-creation-examples\}

* Если не указывать параметры, клиент ClickHouse Connect подключится к HTTP-порту по умолчанию на `localhost` с пользователем по умолчанию и без пароля:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

* Подключение к защищённому (HTTPS) внешнему серверу ClickHouse

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

* Подключение с идентификатором сессии и другими настраиваемыми параметрами подключения и настройками ClickHouse.

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='play.clickhouse.com',
    user='play',
    password='clickhouse',
    port=443,
    session_id='example_session_1',
    connect_timeout=15,
    database='github',
    settings={'distributed_ddl_task_timeout':300},
)
print(client.database)
# Output: 'github'
```


## Жизненный цикл клиента и лучшие практики \{#client-lifecycle-and-best-practices\}

Создание клиента ClickHouse Connect — это затратная операция, включающая установление соединения, получение метаданных сервера и инициализацию настроек. Следуйте этим рекомендациям для обеспечения оптимальной производительности:

### Основные принципы \{#core-principles\}

- **Повторно используйте клиентов**: Создавайте клиентов один раз при старте приложения и используйте их на протяжении всего времени его работы
- **Избегайте частого создания**: Не создавайте нового клиента для каждого запроса или обращения (это добавляет сотни миллисекунд к каждой операции)
- **Корректно освобождайте ресурсы**: Всегда закрывайте клиентов при завершении работы, чтобы освободить ресурсы пула подключений
- **По возможности используйте клиентов совместно**: Один клиент может обрабатывать множество одновременных запросов через свой пул подключений (см. примечания по многопоточности ниже)

### Основные шаблоны \{#basic-patterns\}

**✅ Хорошо: используйте один и тот же клиент**

```python
import clickhouse_connect

# Create once at startup
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# Reuse for all queries
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# Close on shutdown
client.close()
```

**❌ Плохо: многократное создание клиентов**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### Многопоточные приложения \{#multi-threaded-applications\}

:::warning
Экземпляры клиента **НЕ потокобезопасны** при использовании идентификаторов сессии. По умолчанию у клиентов автоматически генерируется идентификатор сессии, и параллельные запросы в рамках одной и той же сессии вызовут `ProgrammingError`.
:::

Чтобы безопасно использовать один клиент в нескольких потоках:

```python
import clickhouse_connect
import threading

# Option 1: Disable sessions (recommended for shared clients)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Required for thread safety
)

def worker(thread_id):
    # All threads can now safely use the same client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# Output:
# Thread 0: 0
# Thread 7: 7
# Thread 1: 1
# Thread 9: 9
# Thread 4: 4
# Thread 2: 2
# Thread 8: 8
# Thread 5: 5
# Thread 6: 6
# Thread 3: 3
```

**Альтернативный вариант для сессий:** если вам нужны сессии (например, для временных таблиц), создавайте отдельный клиент на каждый поток:

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```


### Корректное завершение работы \{#proper-cleanup\}

Всегда закрывайте клиентов при завершении работы. Обратите внимание, что `client.close()` уничтожает клиент и закрывает HTTP‑соединения из пула только в том случае, если клиент владеет собственным менеджером пула (например, когда он создан с пользовательскими параметрами TLS/прокси). Для стандартного общего пула используйте `client.close_connections()` для принудительной очистки сокетов; в противном случае соединения автоматически освобождаются по истечении времени простоя и при завершении процесса.

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

Или используйте контекстный менеджер:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```


### Когда использовать несколько клиентов \{#when-to-use-multiple-clients\}

Несколько клиентов оправданы в следующих случаях:

- **Разные серверы**: Один клиент на каждый сервер или кластер ClickHouse
- **Разные учетные данные**: Отдельные клиенты для разных пользователей или уровней доступа
- **Разные базы данных**: Когда нужно работать с несколькими базами данных
- **Изолированные сессии**: Когда нужны отдельные сессии для временных таблиц или настроек, специфичных для сессии
- **Изоляция потоков**: Когда каждому потоку нужны независимые сессии (как показано выше)

## Общие аргументы методов \{#common-method-arguments\}

Некоторые методы клиента принимают один или оба общих аргумента `parameters` и `settings`. Эти именованные аргументы описаны ниже.

### Аргумент parameters \{#parameters-argument\}

Методы ClickHouse Connect Client `query*` и `command` принимают необязательный именованный аргумент `parameters`, используемый для привязки выражений Python к выражениям значений ClickHouse. Доступны два варианта привязки.

#### Привязка на стороне сервера \{#server-side-binding\}

ClickHouse поддерживает [привязку на стороне сервера](/interfaces/cli.md#cli-queries-with-parameters) для большинства значений запроса, при которой привязанное значение отправляется отдельно от запроса в виде параметра HTTP‑запроса. ClickHouse Connect добавит соответствующие параметры запроса, если обнаружит выражение привязки вида `{<name>:<datatype>}`. Для привязки на стороне сервера аргумент `parameters` должен быть словарём Python.

* Привязка на стороне сервера с использованием словаря Python, значения DateTime и строкового значения

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

На сервере при этом формируется следующий запрос:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
Серверная привязка параметров поддерживается сервером ClickHouse только для запросов `SELECT`. Она не работает для `ALTER`, `DELETE`, `INSERT` или других типов запросов. В будущем это может измениться; см. [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092).
:::


#### Привязка на стороне клиента \{#client-side-binding\}

ClickHouse Connect также поддерживает привязку параметров на стороне клиента, что обеспечивает большую гибкость при генерации шаблонных SQL‑запросов. Для привязки на стороне клиента аргумент `parameters` должен быть словарём или последовательностью. Привязка на стороне клиента использует форматирование строк в Python‑стиле [&quot;printf&quot;](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) для подстановки параметров.

Обратите внимание, что в отличие от привязки на стороне сервера, привязка на стороне клиента не работает для идентификаторов, таких как имена баз данных, таблиц или столбцов, поскольку форматирование строк в стиле Python не может различать разные типы строк, а их нужно форматировать по‑разному (обратные кавычки или двойные кавычки для идентификаторов, одинарные кавычки для значений данных).

* Пример со словарём Python, значением DateTime и экранированием строк

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

В результате на сервер отправляется следующий запрос:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

* Пример с Python Sequence (tuple), Float64 и IPv4Address

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

В результате на сервер отправляется следующий запрос:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
Для привязки аргументов типа DateTime64 (типов ClickHouse с точностью до долей секунды) требуется один из двух специализированных подходов:

* Оберните значение `datetime.datetime` из Python в новый класс DT64Param, например:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Привязка на стороне сервера со словарём
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Привязка на стороне клиента со списком 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * Если вы используете словарь со значениями параметров, добавьте суффикс `_64` к имени параметра:
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Привязка на стороне сервера со словарём

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Аргумент settings \{#settings-argument-1\}

Все основные методы ClickHouse Connect Client `insert` и `select` принимают необязательный именованный аргумент `settings` для передачи [пользовательских настроек](/operations/settings/settings.md) сервера ClickHouse для выполняемого SQL-выражения. Аргумент `settings` должен быть словарём. Каждый элемент должен содержать имя настройки ClickHouse и соответствующее ей значение. Обратите внимание, что значения будут преобразованы в строки при отправке на сервер в качестве параметров запроса.

Как и в случае с настройками на уровне клиента, ClickHouse Connect отбросит любые настройки, которые сервер помечает как *readonly*=*1*, с соответствующим сообщением в журнале. Настройки, применимые только к запросам через HTTP-интерфейс ClickHouse, всегда считаются корректными. Эти настройки описаны в разделе [API `get_client`](#settings-argument).

Пример использования настроек ClickHouse:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Метод клиента `command` \{#client-command-method\}

Используйте метод `Client.command` для отправки SQL‑запросов на сервер ClickHouse, которые обычно либо не возвращают данные, либо возвращают одно примитивное значение или массив значений, а не полный набор данных. Этот метод принимает следующие параметры:

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | SQL-выражение ClickHouse, которое возвращает одно значение или одну строку значений.                                                                          |
| parameters    | dict or iterable | *None*     | См. [описание параметров](#parameters-argument).                                                                                                              |
| data          | str or bytes     | *None*     | Необязательные данные, которые нужно включить в команду в качестве тела POST-запроса.                                                                         |
| settings      | dict             | *None*     | См. [описание настроек](#settings-argument).                                                                                                                  |
| use_database  | bool             | True       | Использовать базу данных клиента (указывается при создании клиента). False означает, что команда будет использовать базу данных сервера ClickHouse по умолчанию для подключенного пользователя. |
| external_data | ExternalData     | *None*     | Объект `ExternalData`, содержащий файловые или бинарные данные для использования в запросе. См. [Расширенные запросы (External Data)](advanced-querying.md#external-data)     |

### Примеры команд \{#command-examples\}

#### DDL-команды \{#ddl-statements\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create a table
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Returns QuerySummary with query_id

# Show table definition
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Output:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()

# Drop table
client.command("DROP TABLE test_command")
```


#### Простые запросы, возвращающие одно значение \{#simple-queries-returning-single-values\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Single value result
count = client.command("SELECT count() FROM system.tables")
print(count)
# Output: 151

# Server version
version = client.command("SELECT version()")
print(version)
# Output: "25.8.2.29"
```


#### Команды с параметрами \{#commands-with-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using client-side parameters
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# Using server-side parameters
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```


#### Команды с параметрами \{#commands-with-settings\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Метод клиента `query` \{#client-query-method\}

Метод `Client.query` является основным способом получения одного «пакетного» набора данных с сервера ClickHouse. Он использует нативный формат ClickHouse поверх HTTP для эффективной передачи больших наборов данных (до примерно одного миллиона строк). Этот метод принимает следующие параметры:

| Параметр           | Тип              | Значение по умолчанию | Описание                                                                                                                                                                           |
|--------------------|------------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query              | str              | *Required*             | SQL-запрос ClickHouse `SELECT` или `DESCRIBE`.                                                                                                                                     |
| parameters         | dict or iterable | *None*                 | См. [описание parameters](#parameters-argument).                                                                                                                                    |
| settings           | dict             | *None*                 | См. [описание settings](#settings-argument).                                                                                                                                        |
| query_formats      | dict             | *None*                 | Спецификация форматирования типов данных для значений результата. См. раздел Advanced Usage (Read Formats).                                                                       |
| column_formats     | dict             | *None*                 | Форматирование типов данных по столбцам. См. раздел Advanced Usage (Read Formats).                                                                                                 |
| encoding           | str              | *None*                 | Кодировка, используемая для преобразования столбцов ClickHouse типа String в строки Python. По умолчанию в Python используется `UTF-8`, если не задано иное.                      |
| use_none           | bool             | True                   | Использовать тип Python *None* для значений NULL в ClickHouse. Если False — использовать значение по умолчанию для типа (например, 0) для значений NULL в ClickHouse. Примечание: по умолчанию имеет значение False для NumPy/Pandas по соображениям производительности. |
| column_oriented    | bool             | False                  | Возвращать результаты в виде последовательности столбцов, а не последовательности строк. Полезно для преобразования данных Python в другие столбцово-ориентированные форматы данных. |
| query_tz           | str              | *None*                 | Имя часового пояса из базы данных `zoneinfo`. Этот часовой пояс будет применён ко всем объектам datetime или Pandas Timestamp, возвращаемым запросом.                             |
| column_tzs         | dict             | *None*                 | Словарь, сопоставляющий имя столбца с именем часового пояса. Аналогично `query_tz`, но позволяет задавать разные часовые пояса для разных столбцов.                               |
| use_extended_dtypes| bool             | True                   | Использовать расширенные типы данных Pandas (например, StringArray), а также pandas.NA и pandas.NaT для значений NULL в ClickHouse. Применяется только к методам `query_df` и `query_df_stream`. |
| external_data      | ExternalData     | *None*                 | Объект ExternalData, содержащий файловые или бинарные данные для использования в запросе. См. [Advanced Queries (External Data)](advanced-querying.md#external-data).             |
| context            | QueryContext     | *None*                 | Повторно используемый объект QueryContext, который можно использовать для инкапсуляции аргументов метода, перечисленных выше. См. [Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts). |

### Примеры запросов \{#query-examples\}

#### Простой запрос \{#basic-query\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Simple SELECT query
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# Access results as rows
for row in result.result_rows:
    print(row)
# Output:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')

# Access column names and types
print(result.column_names)
# Output: ("name", "database")
print([col_type.name for col_type in result.column_types])
# Output: ['String', 'String']
```


#### Доступ к результатам запроса \{#accessing-query-results\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# Row-oriented access (default)
print(result.result_rows)
# Output: [[0, "0"], [1, "1"], [2, "2"]]

# Column-oriented access
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]

# Named results (list of dictionaries)
for row_dict in result.named_results():
    print(row_dict)
# Output: 
# {"number": 0, "str": "0"}
# {"number": 1, "str": "1"}
# {"number": 2, "str": "2"}

# First row as dictionary
print(result.first_item)
# Output: {"number": 0, "str": "0"}

# First row as tuple
print(result.first_row)
# Output: (0, "0")
```


#### Запрос с параметрами на стороне клиента \{#query-with-client-side-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using dictionary parameters (printf-style)
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# Using tuple parameters
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```


#### Запрос с серверными параметрами \{#query-with-server-side-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### Запрос с настройками \{#query-with-settings\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Pass ClickHouse settings with the query
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```


### Объект `QueryResult` \{#the-queryresult-object\}

Базовый метод `query` возвращает объект `QueryResult` со следующими публичными свойствами:

- `result_rows` -- Матрица возвращаемых данных в виде последовательности строк, где каждый элемент строки является последовательностью значений столбцов.
- `result_columns` -- Матрица возвращаемых данных в виде последовательности столбцов, где каждый элемент столбца является последовательностью значений строк для этого столбца.
- `column_names` -- Кортеж строк, представляющих имена столбцов в `result_set`.
- `column_types` -- Кортеж экземпляров ClickHouseType, представляющих тип данных ClickHouse для каждого столбца в `result_columns`.
- `query_id` -- ClickHouse `query_id` (полезно для анализа запроса в таблице `system.query_log`).
- `summary` -- Любые данные, возвращаемые HTTP-заголовком ответа `X-ClickHouse-Summary`.
- `first_item` -- Упрощённое свойство для получения первой строки ответа в виде словаря (ключи — имена столбцов).
- `first_row` -- Упрощённое свойство для получения первой строки результата.
- `column_block_stream` -- Генератор результатов запроса в столбцово-ориентированном формате. Это свойство не должно использоваться напрямую (см. ниже).
- `row_block_stream` -- Генератор результатов запроса в строково-ориентированном формате. Это свойство не должно использоваться напрямую (см. ниже).
- `rows_stream` -- Генератор результатов запроса, который возвращает одну строку при каждом вызове. Это свойство не должно использоваться напрямую (см. ниже).
- `summary` -- Как описано в методе `command`, словарь сводной информации, возвращаемой ClickHouse.

Свойства `*_stream` возвращают контекстный менеджер Python, который может использоваться как итератор для возвращаемых данных. К ним следует обращаться только косвенно, используя методы клиента `*_stream`. 

Полные сведения о потоковой выборке результатов запросов (с использованием объектов StreamContext) приведены в разделе [Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries).

## Получение результатов запросов с помощью NumPy, Pandas или Arrow \{#consuming-query-results-with-numpy-pandas-or-arrow\}

ClickHouse Connect предоставляет специализированные методы выполнения запросов для форматов данных NumPy, Pandas и Arrow. Подробную информацию об использовании этих методов, включая примеры, возможности потоковой обработки и расширенную работу с типами, см. в разделе [Расширенные запросы (запросы NumPy, Pandas и Arrow)](advanced-querying.md#numpy-pandas-and-arrow-queries).

## Методы клиентских потоковых запросов \{#client-streaming-query-methods\}

Для потоковой обработки больших наборов результатов ClickHouse Connect предоставляет несколько методов потоковой передачи данных. Подробности и примеры см. в разделе [Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries).

## Метод клиента `insert` \{#client-insert-method\}

Для типичного случая вставки нескольких записей в ClickHouse используется метод `Client.insert`. Он принимает следующие параметры:

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | Таблица ClickHouse, в которую выполняется вставка. Допускается полное имя таблицы (включая базу данных).                                                                                      |
| data               | Sequence of Sequences             | *Required* | Матрица данных для вставки: либо последовательность строк, каждая из которых является последовательностью значений столбцов, либо последовательность столбцов, каждый из которых является последовательностью значений строк. |
| column_names       | Sequence of str, or str           | '*'        | Список `column_names` для матрицы данных. Если вместо этого используется `*`, ClickHouse Connect выполнит «предварительный запрос» для получения всех имён столбцов таблицы.               |
| database           | str                               | ''         | Целевая база данных для вставки. Если не указано, будет использоваться база данных, настроенная для клиента.                                                                                 |
| column_types       | Sequence of ClickHouseType        | *None*     | Список экземпляров `ClickHouseType`. Если не указаны ни `column_types`, ни `column_type_names`, ClickHouse Connect выполнит «предварительный запрос» для получения всех типов столбцов таблицы. |
| column_type_names  | Sequence of ClickHouse type names | *None*     | Список имён типов данных ClickHouse. Если не указаны ни `column_types`, ни `column_type_names`, ClickHouse Connect выполнит «предварительный запрос» для получения всех типов столбцов таблицы. |
| column_oriented    | bool                              | False      | Если True, аргумент `data` считается последовательностью столбцов (и «поворот» данных для вставки не потребуется). В противном случае `data` интерпретируется как последовательность строк. |
| settings           | dict                              | *None*     | См. [описание settings](#settings-argument).                                                                                                                                                  |
| context            | InsertContext                     | *None*     | Можно использовать повторно используемый объект InsertContext для инкапсуляции указанных выше аргументов метода. См. [Расширенные вставки (InsertContexts)](advanced-inserting.md#insertcontexts). |
| transport_settings | dict                              | *None*     | Необязательный словарь настроек транспортного уровня (HTTP-заголовки и т. п.).                                                                                                               |

Этот метод возвращает словарь с «сводкой запроса» (query summary), как описано в разделе о методе `command`. Если вставка по какой-либо причине завершится неудачно, будет возбуждено исключение.

Для специализированных методов вставки, работающих с Pandas DataFrames, PyArrow Tables и DataFrames на основе Arrow, см. [Расширенные вставки (специализированные методы вставки)](advanced-inserting.md#specialized-insert-methods).

:::note
Массив NumPy является допустимой последовательностью последовательностей и может использоваться как аргумент `data` для основного метода `insert`, поэтому специализированный метод не требуется.
:::

### Примеры \{#examples\}

В примерах ниже предполагается, что уже существует таблица `users` со схемой `(id UInt32, name String, age UInt8)`.

#### Базовая строко-ориентированная вставка \{#basic-row-oriented-insert\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Row-oriented data: each inner list is a row
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```


#### Вставка по столбцам \{#column-oriented-insert\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Column-oriented data: each inner list is a column
data = [
    [1, 2, 3],  # id column
    ["Alice", "Bob", "Joe"],  # name column
    [25, 30, 28],  # age column
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```


#### Вставка с явно указанными типами столбцов \{#insert-with-explicit-column-types\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Useful when you want to avoid a DESCRIBE query to the server
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    column_type_names=["UInt32", "String", "UInt8"],
)
```


#### Вставка в указанную базу данных \{#insert-into-specific-database\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# Insert into a table in a specific database
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```


## Вставки из файлов \{#file-inserts\}

Для вставки данных напрямую из файлов в таблицы ClickHouse см. раздел [Расширенные способы вставки (вставки из файлов)](advanced-inserting.md#file-inserts).

## Низкоуровневый API \{#raw-api\}

Для более сложных сценариев использования, требующих прямого доступа к HTTP-интерфейсам ClickHouse без преобразования типов, см. [Расширенное использование (низкоуровневый API)](advanced-usage.md#raw-api).

## Вспомогательные классы и функции \{#utility-classes-and-functions\}

Следующие классы и функции также считаются частью «публичного» API `clickhouse-connect` и, как и классы и методы, описанные выше, остаются стабильными в пределах минорных версий. Ломающие изменения в этих классах и функциях будут вноситься только в минорном (а не патч-) релизе и при этом будут помечены как устаревшие минимум на один минорный релиз.

### Исключения \{#exceptions\}

Все пользовательские исключения (включая те, что определены в спецификации DB API 2.0) объявлены в модуле `clickhouse_connect.driver.exceptions`. Исключения, фактически обнаруживаемые драйвером, имеют один из этих типов.

### Утилиты ClickHouse SQL \{#clickhouse-sql-utilities\}

Функции и класс DT64Param в модуле `clickhouse_connect.driver.binding` можно использовать для корректного формирования и экранирования SQL‑запросов ClickHouse. Аналогично, функции в модуле `clickhouse_connect.driver.parser` можно использовать для разбора названий типов данных ClickHouse.

## Многопоточные, многопроцессные и асинхронные/событийно-ориентированные сценарии использования \{#multithreaded-multiprocess-and-asyncevent-driven-use-cases\}

Информацию об использовании ClickHouse Connect в многопоточных, многопроцессных и асинхронных/событийно-ориентированных приложениях см. в разделе [Advanced Usage (Multithreaded, multiprocess, and async/event driven use cases)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases).

## Обертка AsyncClient \{#asyncclient-wrapper\}

Подробности об использовании обертки AsyncClient в средах asyncio см. в разделе [Расширенное использование (обертка AsyncClient)](advanced-usage.md#asyncclient-wrapper).

## Управление идентификаторами сеансов ClickHouse \{#managing-clickhouse-session-ids\}

Подробнее об управлении идентификаторами сеансов ClickHouse в многопоточных или конкурентных приложениях см. раздел [Расширенное использование (управление идентификаторами сеансов ClickHouse)](advanced-usage.md#managing-clickhouse-session-ids).

## Настройка пула HTTP‑подключений \{#customizing-the-http-connection-pool\}

Подробнее о настройке пула HTTP‑подключений для крупных многопоточных приложений см. в разделе [Расширенное использование (настройка пула HTTP‑подключений)](advanced-usage.md#customizing-the-http-connection-pool).