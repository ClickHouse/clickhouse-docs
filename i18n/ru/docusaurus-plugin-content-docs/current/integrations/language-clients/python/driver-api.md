---
sidebar_label: 'API драйвера'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'API драйвера ClickHouse Connect'
slug: /integrations/language-clients/python/driver-api
title: 'API драйвера ClickHouse Connect'
doc_type: 'reference'
---



# API драйвера ClickHouse Connect {#clickhouse-connect-driver-api}

:::note
Для большинства методов API рекомендуется передавать именованные аргументы, так как количество возможных аргументов велико, и большинство из них являются необязательными.

_Методы, не описанные в данной документации, не являются частью API и могут быть удалены или изменены._
:::


## Инициализация клиента {#client-initialization}

Класс `clickhouse_connect.driver.client` предоставляет основной интерфейс между приложением Python и сервером базы данных ClickHouse. Используйте функцию `clickhouse_connect.get_client` для получения экземпляра Client, которая принимает следующие аргументы:

### Аргументы подключения {#connection-arguments}

| Параметр                 | Тип         | По умолчанию                  | Описание                                                                                                                                                                                                                                              |
| ------------------------ | ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| interface                | str         | http                          | Должен быть http или https.                                                                                                                                                                                                                           |
| host                     | str         | localhost                     | Имя хоста или IP-адрес сервера ClickHouse. Если не указано, будет использоваться `localhost`.                                                                                                                                                         |
| port                     | int         | 8123 или 8443                 | Порт HTTP или HTTPS сервера ClickHouse. Если не указан, по умолчанию будет использоваться 8123 или 8443, если _secure_=_True_ или _interface_=_https_.                                                                                                |
| username                 | str         | default                       | Имя пользователя ClickHouse. Если не указано, будет использоваться пользователь `default` ClickHouse.                                                                                                                                                 |
| password                 | str         | _&lt;пустая строка&gt;_       | Пароль для _username_.                                                                                                                                                                                                                                |
| database                 | str         | _None_                        | База данных по умолчанию для подключения. Если не указана, ClickHouse Connect будет использовать базу данных по умолчанию для _username_.                                                                                                             |
| secure                   | bool        | False                         | Использовать HTTPS/TLS. Переопределяет значения, выведенные из аргументов interface или port.                                                                                                                                                         |
| dsn                      | str         | _None_                        | Строка в стандартном формате DSN (Data Source Name). Другие значения подключения (такие как host или user) будут извлечены из этой строки, если не указаны иначе.                                                                                     |
| compress                 | bool или str | True                         | Включить сжатие для HTTP-вставок и результатов запросов ClickHouse. См. [Дополнительные параметры (Сжатие)](additional-options.md#compression)                                                                                                        |
| query_limit              | int         | 0 (неограничено)              | Максимальное количество строк для возврата в любом ответе `query`. Установите значение 0 для возврата неограниченного количества строк. Обратите внимание, что большие лимиты запросов могут привести к исключениям нехватки памяти, если результаты не передаются потоком, так как все результаты загружаются в память одновременно. |
| query_retries            | int         | 2                             | Максимальное количество повторных попыток для запроса `query`. Будут повторяться только HTTP-ответы, допускающие повторную попытку. Запросы `command` или `insert` не повторяются драйвером автоматически для предотвращения непреднамеренных дублирующихся запросов. |
| connect_timeout          | int         | 10                            | Тайм-аут HTTP-подключения в секундах.                                                                                                                                                                                                                 |
| send_receive_timeout     | int         | 300                           | Тайм-аут отправки/получения для HTTP-подключения в секундах.                                                                                                                                                                                          |
| client_name              | str         | _None_                        | Значение client_name, добавляемое в начало заголовка HTTP User Agent. Установите это значение для отслеживания клиентских запросов в system.query_log ClickHouse.                                                                                     |
| pool_mgr                 | obj         | _&lt;PoolManager по умолчанию&gt;_ | PoolManager библиотеки `urllib3` для использования. Для продвинутых сценариев использования, требующих несколько пулов подключений к разным хостам.                                                                                              |
| http_proxy               | str         | _None_                        | Адрес HTTP-прокси (эквивалентно установке переменной окружения HTTP_PROXY).                                                                                                                                                                           |
| https_proxy              | str         | _None_                        | Адрес HTTPS-прокси (эквивалентно установке переменной окружения HTTPS_PROXY).                                                                                                                                                                         |
| apply_server_timezone    | bool        | True                          | Использовать часовой пояс сервера для результатов запросов с учетом часового пояса. См. [Приоритет часовых поясов](advanced-querying.md#time-zones)                                                                                                   |
| show_clickhouse_errors   | bool        | True                          | Включать подробные сообщения об ошибках сервера ClickHouse и коды исключений в клиентские исключения.                                                                                                                                                 |
| autogenerate_session_id  | bool        | _None_                        | Переопределить глобальную настройку `autogenerate_session_id`. Если True, автоматически генерировать идентификатор сессии UUID4, когда он не предоставлен.                                                                                            |
| proxy_path               | str         | &lt;пустая строка&gt;         | Необязательный префикс пути для добавления к URL сервера ClickHouse для конфигураций прокси.                                                                                                                                                          |
| form_encode_query_params | bool        | False                         | Отправлять параметры запроса как данные в формате form-encoded в теле запроса вместо параметров URL. Полезно для запросов с большими наборами параметров, которые могут превысить ограничения длины URL.                                              |
| rename_response_column   | str         | _None_                        | Необязательная функция обратного вызова или сопоставление имен столбцов для переименования столбцов ответа в результатах запроса.                                                                                                                      |

### Аргументы HTTPS/TLS {#httpstls-arguments}


| Параметр         | Тип  | По умолчанию | Описание                                                                                                                                                                                                                                                                       |
| ---------------- | ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify           | bool | True    | Проверять TLS/SSL-сертификат сервера ClickHouse (имя хоста, срок действия и т. д.) при использовании HTTPS/TLS.                                                                                                                                                               |
| ca_cert          | str  | _None_  | Если _verify_=_True_, путь к файлу корневого сертификата центра сертификации для проверки сертификата сервера ClickHouse в формате .pem. Игнорируется, если verify равен False. Не требуется, если сертификат сервера ClickHouse является глобально доверенным корневым сертификатом, проверенным операционной системой. |
| client_cert      | str  | _None_  | Путь к файлу клиентского TLS-сертификата в формате .pem (для взаимной TLS-аутентификации). Файл должен содержать полную цепочку сертификатов, включая промежуточные сертификаты.                                                                                                  |
| client_cert_key  | str  | _None_  | Путь к файлу закрытого ключа для клиентского сертификата. Требуется, если закрытый ключ не включен в файл ключа клиентского сертификата.                                                                                                                                             |
| server_host_name | str  | _None_  | Имя хоста сервера ClickHouse, определяемое по CN или SNI его TLS-сертификата. Установите это значение, чтобы избежать ошибок SSL при подключении через прокси или туннель с другим именем хоста                                                                                            |
| tls_mode         | str  | _None_  | Управляет расширенным поведением TLS. Режимы `proxy` и `strict` не инициируют взаимное TLS-соединение ClickHouse, но отправляют клиентский сертификат и ключ. Режим `mutual` предполагает взаимную TLS-аутентификацию ClickHouse с клиентским сертификатом. Поведение _None_/по умолчанию — `mutual`                                  |

### Аргумент settings {#settings-argument}

Наконец, аргумент `settings` для `get_client` используется для передачи дополнительных настроек ClickHouse на сервер для каждого клиентского запроса. Обратите внимание, что в большинстве случаев пользователи с доступом _readonly_=_1_ не могут изменять настройки, отправляемые с запросом, поэтому ClickHouse Connect отбросит такие настройки в итоговом запросе и запишет предупреждение в лог. Следующие настройки применяются только к HTTP-запросам/сессиям, используемым ClickHouse Connect, и не документированы как общие настройки ClickHouse.

| Настройка         | Описание                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| buffer_size       | Размер буфера (в байтах), используемый сервером ClickHouse перед записью в HTTP-канал.                                                                         |
| session_id        | Уникальный идентификатор сессии для связывания связанных запросов на сервере. Требуется для временных таблиц.                                                                   |
| compress          | Должен ли сервер ClickHouse сжимать данные POST-ответа. Эта настройка должна использоваться только для «сырых» запросов.                                        |
| decompress        | Должны ли данные, отправляемые на сервер ClickHouse, быть распакованы. Эта настройка должна использоваться только для «сырых» вставок.                                         |
| quota_key         | Ключ квоты, связанный с этим запросом. См. документацию сервера ClickHouse по квотам.                                                                   |
| session_check     | Используется для проверки статуса сессии.                                                                                                                                |
| session_timeout   | Количество секунд неактивности, после которых сессия, идентифицируемая по идентификатору сессии, истечет и больше не будет считаться действительной. По умолчанию 60 секунд.         |
| wait_end_of_query | Буферизует весь ответ на сервере ClickHouse. Эта настройка требуется для возврата сводной информации и устанавливается автоматически для непотоковых запросов. |
| role              | Роль ClickHouse, которая будет использоваться для сессии. Допустимая транспортная настройка, которая может быть включена в контекст запроса.                                                       |

Другие настройки ClickHouse, которые могут быть отправлены с каждым запросом, см. в [документации ClickHouse](/operations/settings/settings.md).

### Примеры создания клиента {#client-creation-examples}

- Без каких-либо параметров клиент ClickHouse Connect подключится к HTTP-порту по умолчанию на `localhost` с пользователем по умолчанию и без пароля:

```python
import clickhouse_connect

```


client = clickhouse&#95;connect.get&#95;client()
print(client.server&#95;version)

# Результат: &#39;22.10.1.98&#39;

````

- Подключение к внешнему серверу ClickHouse по защищенному соединению (HTTPS)

```python
import clickhouse_connect
````


client = clickhouse&#95;connect.get&#95;client(host=&#39;play.clickhouse.com&#39;, secure=True, port=443, user=&#39;play&#39;, password=&#39;clickhouse&#39;)
print(client.command(&#39;SELECT timezone()&#39;))

# Вывод: &#39;Etc/UTC&#39;

````

- Подключение с идентификатором сеанса и другими пользовательскими параметрами подключения и настройками ClickHouse.

```python
import clickhouse_connect
````


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

# Результат: 'github'

```

```


## Жизненный цикл клиента и лучшие практики {#client-lifecycle-and-best-practices}

Создание клиента ClickHouse Connect — это ресурсоёмкая операция, включающая установку соединения, получение метаданных сервера и инициализацию настроек. Следуйте этим рекомендациям для достижения оптимальной производительности:

### Основные принципы {#core-principles}

- **Переиспользуйте клиенты**: Создавайте клиенты один раз при запуске приложения и используйте их на протяжении всего жизненного цикла приложения
- **Избегайте частого создания**: Не создавайте новый клиент для каждого запроса или обращения (это приводит к потере сотен миллисекунд на каждую операцию)
- **Корректно освобождайте ресурсы**: Всегда закрывайте клиенты при завершении работы для освобождения ресурсов пула соединений
- **Используйте совместно, где возможно**: Один клиент может обрабатывать множество параллельных запросов через свой пул соединений (см. примечания о многопоточности ниже)

### Базовые паттерны {#basic-patterns}

**✅ Правильно: Переиспользование одного клиента**

```python
import clickhouse_connect

```


# Создайте клиент один раз при запуске
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')



# Повторно используем для всех запросов
for i in range(1000):
    result = client.query('SELECT count() FROM users')



# Закрытие при завершении работы

client.close()

```

**❌ Плохо: Повторное создание клиентов**
```


```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### Многопоточные приложения {#multi-threaded-applications}

:::warning
Экземпляры клиента **НЕ являются потокобезопасными** при использовании идентификаторов сессий. По умолчанию клиенты имеют автоматически сгенерированный идентификатор сессии, и конкурентные запросы в рамках одной сессии вызовут исключение `ProgrammingError`.
:::

Для безопасного использования клиента в нескольких потоках:

```python
import clickhouse_connect
import threading

```


# Вариант 1: Отключить сессии (рекомендуется для клиентов, используемых несколькими потоками)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Требуется для потокобезопасности
)

def worker(thread_id):
    # Теперь все потоки могут безопасно использовать один и тот же клиент
    result = client.query(f"SELECT {thread_id}")
    print(f"Поток {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()



client.close()

# Вывод:

# Поток 0: 0

# Поток 7: 7

# Поток 1: 1

# Поток 9: 9

# Поток 4: 4

# Поток 2: 2

# Поток 8: 8

# Поток 5: 5

# Поток 6: 6

# Поток 3: 3

````

**Альтернативный подход для сессий:** Если требуются сессии (например, для временных таблиц), создайте отдельный клиент для каждого потока:

```python
def worker(thread_id):
    # Каждый поток получает собственный клиент с изолированной сессией
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... использование временной таблицы ...
    client.close()
````

### Корректная очистка ресурсов {#proper-cleanup}

Всегда закрывайте клиенты при завершении работы. Обратите внимание, что `client.close()` освобождает клиент и закрывает пулированные HTTP-соединения только в том случае, если клиент владеет собственным менеджером пула (например, при создании с пользовательскими параметрами TLS/прокси). Для общего пула по умолчанию используйте `client.close_connections()` для проактивной очистки сокетов; в противном случае соединения освобождаются автоматически по истечении времени простоя и при завершении процесса.

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

### Когда использовать несколько клиентов {#when-to-use-multiple-clients}

Использование нескольких клиентов целесообразно в следующих случаях:

- **Разные серверы**: один клиент на сервер или кластер ClickHouse
- **Разные учетные данные**: отдельные клиенты для разных пользователей или уровней доступа
- **Разные базы данных**: когда необходимо работать с несколькими базами данных
- **Изолированные сессии**: когда требуются отдельные сессии для временных таблиц или настроек, специфичных для сессии
- **Изоляция по потокам**: когда потокам требуются независимые сессии (как показано выше)


## Общие аргументы методов {#common-method-arguments}

Некоторые методы клиента используют один или оба общих аргумента `parameters` и `settings`. Эти именованные аргументы описаны ниже.

### Аргумент parameters {#parameters-argument}

Методы `query*` и `command` клиента ClickHouse Connect принимают необязательный именованный аргумент `parameters`, используемый для привязки выражений Python к выражениям значений ClickHouse. Доступны два типа привязки.

#### Привязка на стороне сервера {#server-side-binding}

ClickHouse поддерживает [привязку на стороне сервера](/interfaces/cli.md#cli-queries-with-parameters) для большинства значений запросов, при которой привязанное значение отправляется отдельно от запроса в виде HTTP-параметра запроса. ClickHouse Connect добавит соответствующие параметры запроса, если обнаружит выражение привязки в форме `{<name>:<datatype>}`. Для привязки на стороне сервера аргумент `parameters` должен быть словарем Python.

- Привязка на стороне сервера со словарем Python, значением DateTime и строковым значением

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

Это генерирует следующий запрос на сервере:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
Привязка на стороне сервера поддерживается (сервером ClickHouse) только для запросов `SELECT`. Она не работает для запросов `ALTER`, `DELETE`, `INSERT` и других типов запросов. Это может измениться в будущем; см. https://github.com/ClickHouse/ClickHouse/issues/42092.
:::

#### Привязка на стороне клиента {#client-side-binding}

ClickHouse Connect также поддерживает привязку параметров на стороне клиента, что обеспечивает большую гибкость при генерации шаблонных SQL-запросов. Для привязки на стороне клиента аргумент `parameters` должен быть словарем или последовательностью. Привязка на стороне клиента использует форматирование строк в [стиле «printf»](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) Python для подстановки параметров.

Обратите внимание, что в отличие от привязки на стороне сервера, привязка на стороне клиента не работает для идентификаторов базы данных, таких как имена баз данных, таблиц или столбцов, поскольку форматирование в стиле Python не может различать разные типы строк, а они должны форматироваться по-разному (обратные кавычки или двойные кавычки для идентификаторов базы данных, одинарные кавычки для значений данных).

- Пример со словарем Python, значением DateTime и экранированием строк

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

Это генерирует следующий запрос на сервере:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

- Пример с последовательностью Python (кортежем), Float64 и IPv4Address

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

Это генерирует следующий запрос на сервере:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
Для привязки аргументов DateTime64 (типы ClickHouse с точностью до долей секунды) требуется один из двух специальных подходов:

- Оберните значение Python `datetime.datetime` в новый класс DT64Param, например:

  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Привязка на стороне сервера со словарем
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Привязка на стороне клиента со списком
    parameters=['a string', DT64Param(datetime.now())]
  ```

  - При использовании словаря значений параметров добавьте строку `_64` к имени параметра

  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Привязка на стороне сервера со словарем

  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### Аргумент settings {#settings-argument-1}

Все основные методы "insert" и "select" клиента ClickHouse Connect принимают необязательный именованный аргумент `settings` для передачи [пользовательских настроек](/operations/settings/settings.md) сервера ClickHouse для выполняемого SQL-запроса. Аргумент `settings` должен быть словарем. Каждый элемент должен содержать имя настройки ClickHouse и соответствующее значение. Обратите внимание, что значения будут преобразованы в строки при отправке на сервер в качестве параметров запроса.

Как и в случае с настройками уровня клиента, ClickHouse Connect отбросит любые настройки, помеченные сервером как *readonly*=*1*, с соответствующим сообщением в журнале. Настройки, применимые только к запросам через HTTP-интерфейс ClickHouse, всегда действительны. Эти настройки описаны в разделе [API](#settings-argument) `get_client`.

Пример использования настроек ClickHouse:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## Метод `command` клиента {#client-command-method}

Используйте метод `Client.command` для отправки SQL-запросов на сервер ClickHouse, которые обычно не возвращают данные или возвращают одно примитивное значение или массив вместо полного набора данных. Этот метод принимает следующие параметры:

| Параметр      | Тип              | По умолчанию | Описание                                                                                                                                                      |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cmd           | str              | _Обязательный_ | SQL-выражение ClickHouse, которое возвращает одно значение или одну строку значений.                                                                             |
| parameters    | dict or iterable | _None_     | См. [описание параметров](#parameters-argument).                                                                                                           |
| data          | str or bytes     | _None_     | Необязательные данные для включения в команду в качестве тела POST-запроса.                                                                                   |
| settings      | dict             | _None_     | См. [описание настроек](#settings-argument).                                                                                                               |
| use_database  | bool             | True       | Использовать базу данных клиента (указанную при создании клиента). False означает, что команда будет использовать базу данных сервера ClickHouse по умолчанию для подключенного пользователя. |
| external_data | ExternalData     | _None_     | Объект `ExternalData`, содержащий файловые или бинарные данные для использования с запросом. См. [Расширенные запросы (внешние данные)](advanced-querying.md#external-data)     |

### Примеры команд {#command-examples}

#### DDL-выражения {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# Создание таблицы
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Возвращает объект QuerySummary с query_id



# Вывести определение таблицы
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Вывод:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()
# SETTINGS index_granularity = 8192



# Удаление таблицы

client.command(&quot;DROP TABLE test&#95;command&quot;)

````

#### Простые запросы, возвращающие одиночные значения {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Результат — одно значение
count = client.command("SELECT count() FROM system.tables")
print(count)
# Вывод: 151



# Версия сервера

version = client.command(&quot;SELECT version()&quot;)
print(version)

# Вывод: &quot;25.8.2.29&quot;

````

#### Команды с параметрами {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Использование параметров на стороне клиента

table_name = "system"
result = client.command(
"SELECT count() FROM system.tables WHERE database = %(db)s",
parameters={"db": table_name}
)


# Использование параметров на стороне сервера

result = client.command(
"SELECT count() FROM system.tables WHERE database = {db:String}",
parameters={"db": "system"}
)

````

#### Команды с настройками {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# Выполнение команды с конкретными настройками

result = client.command(
"OPTIMIZE TABLE large_table FINAL",
settings={"optimize_throw_if_noop": 1}
)

```

```


## Метод `query` клиента {#client-query-method}

Метод `Client.query` является основным способом получения одного пакета данных с сервера ClickHouse. Он использует нативный формат ClickHouse поверх HTTP для эффективной передачи больших наборов данных (до приблизительно одного миллиона строк). Этот метод принимает следующие параметры:

| Параметр            | Тип              | По умолчанию | Описание                                                                                                                                                                           |
| ------------------- | ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query               | str              | _Обязательный_ | SQL-запрос ClickHouse SELECT или DESCRIBE.                                                                                                                                       |
| parameters          | dict or iterable | _Нет_        | См. [описание параметров](#parameters-argument).                                                                                                                                |
| settings            | dict             | _Нет_        | См. [описание настроек](#settings-argument).                                                                                                                                    |
| query_formats       | dict             | _Нет_        | Спецификация форматирования типов данных для результирующих значений. См. раздел «Расширенное использование (форматы чтения)»                                                             |
| column_formats      | dict             | _Нет_        | Форматирование типов данных для каждого столбца. См. раздел «Расширенное использование (форматы чтения)»                                                                  |
| encoding            | str              | _Нет_        | Кодировка, используемая для преобразования столбцов типа String из ClickHouse в строки Python. По умолчанию Python использует `UTF-8`, если не указано иное.                                                                      |
| use_none            | bool             | True         | Использовать тип Python _None_ для значений NULL в ClickHouse. Если False, использовать значение по умолчанию для типа данных (например, 0) для NULL в ClickHouse. Примечание: по умолчанию установлено False для NumPy/Pandas по соображениям производительности. |
| column_oriented     | bool             | False        | Возвращать результаты в виде последовательности столбцов, а не последовательности строк. Полезно для преобразования данных Python в другие столбцово-ориентированные форматы данных.                            |
| query_tz            | str              | _Нет_        | Имя часового пояса из базы данных `zoneinfo`. Этот часовой пояс будет применен ко всем объектам datetime или Pandas Timestamp, возвращаемым запросом.                                     |
| column_tzs          | dict             | _Нет_        | Словарь соответствия имени столбца и имени часового пояса. Аналогично `query_tz`, но позволяет указывать различные часовые пояса для разных столбцов.                                                    |
| use_extended_dtypes | bool             | True         | Использовать расширенные типы данных Pandas (например, StringArray), а также pandas.NA и pandas.NaT для значений NULL в ClickHouse. Применяется только к методам `query_df` и `query_df_stream`.                  |
| external_data       | ExternalData     | _Нет_        | Объект ExternalData, содержащий файловые или бинарные данные для использования с запросом. См. [Расширенные запросы (внешние данные)](advanced-querying.md#external-data)                            |
| context             | QueryContext     | _Нет_        | Многократно используемый объект QueryContext может применяться для инкапсуляции вышеуказанных аргументов метода. См. [Расширенные запросы (QueryContexts)](advanced-querying.md#querycontexts)                   |

### Примеры запросов {#query-examples}

#### Базовый запрос {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# Простой запрос SELECT
result = client.query("SELECT name, database FROM system.tables LIMIT 3")



# Получение результатов по строкам
for row in result.result_rows:
    print(row)
# Вывод:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')



# Доступ к именам и типам столбцов

print(result.column&#95;names)

# Вывод: (&quot;name&quot;, &quot;database&quot;)

print([col&#95;type.name for col&#95;type in result.column&#95;types])

# Вывод: [&#39;String&#39;, &#39;String&#39;]

````

#### Получение результатов запроса {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# Строчно-ориентированный доступ (по умолчанию)
print(result.result_rows)
# Вывод: [[0, "0"], [1, "1"], [2, "2"]]



# Колонно-ориентированный доступ
print(result.result_columns)
# Результат: [[0, 1, 2], ["0", "1", "2"]]



# Именованные результаты (список словарей)

for row_dict in result.named_results():
print(row_dict)

# Вывод:

# {"number": 0, "str": "0"}

# {"number": 1, "str": "1"}

# {"number": 2, "str": "2"}


# Первая строка в виде словаря

print(result.first_item)

# Вывод: {"number": 0, "str": "0"}


# Первая строка как кортеж

print(result.first&#95;row)

# Вывод: (0, &quot;0&quot;)

````

#### Запрос с параметрами на стороне клиента {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Использование параметров в виде словаря (в стиле printf)

query = "SELECT \* FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)


# Использование параметров в виде кортежа

query = &quot;SELECT * FROM system.tables WHERE database = %s LIMIT %s&quot;
parameters = (&quot;system&quot;, 5)
result = client.query(query, parameters=parameters)

````

#### Запрос с параметрами на стороне сервера {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Привязка на стороне сервера (более безопасна, лучшая производительность для SELECT-запросов)

query = "SELECT \* FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)

````

#### Запрос с настройками {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# Передача настроек ClickHouse вместе с запросом

result = client.query(
"SELECT sum(number) FROM numbers(1000000)",
settings={
"max_block_size": 100000,
"max_execution_time": 30
}
)

```

### Объект `QueryResult` {#the-queryresult-object}

Базовый метод `query` возвращает объект `QueryResult` со следующими публичными свойствами:

- `result_rows` -- Матрица возвращаемых данных в виде последовательности строк, где каждый элемент строки является последовательностью значений столбцов.
- `result_columns` -- Матрица возвращаемых данных в виде последовательности столбцов, где каждый элемент столбца является последовательностью значений строк для этого столбца
- `column_names` -- Кортеж строк, представляющих имена столбцов в `result_set`
- `column_types` -- Кортеж экземпляров ClickHouseType, представляющих тип данных ClickHouse для каждого столбца в `result_columns`
- `query_id` -- Идентификатор запроса ClickHouse query_id (полезен для анализа запроса в таблице `system.query_log`)
- `summary` -- Любые данные, возвращаемые HTTP-заголовком ответа `X-ClickHouse-Summary`
- `first_item` -- Вспомогательное свойство для получения первой строки ответа в виде словаря (ключами являются имена столбцов)
- `first_row` -- Вспомогательное свойство для возврата первой строки результата
- `column_block_stream` -- Генератор результатов запроса в столбцовом формате. Это свойство не должно использоваться напрямую (см. ниже).
- `row_block_stream` -- Генератор результатов запроса в строчном формате. Это свойство не должно использоваться напрямую (см. ниже).
- `rows_stream` -- Генератор результатов запроса, возвращающий одну строку за вызов. Это свойство не должно использоваться напрямую (см. ниже).
- `summary` -- Как описано в методе `command`, словарь сводной информации, возвращаемой ClickHouse

Свойства `*_stream` возвращают контекст Python, который может использоваться как итератор для возвращаемых данных. Доступ к ним должен осуществляться только косвенно через методы `*_stream` клиента.

Полная информация о потоковой передаче результатов запросов (с использованием объектов StreamContext) приведена в разделе [Расширенные запросы (потоковые запросы)](advanced-querying.md#streaming-queries).

```


## Получение результатов запросов в форматах NumPy, Pandas или Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect предоставляет специализированные методы запросов для форматов данных NumPy, Pandas и Arrow. Подробная информация об использовании этих методов, включая примеры, возможности потоковой передачи и расширенную обработку типов, приведена в разделе [Расширенные запросы (запросы NumPy, Pandas и Arrow)](advanced-querying.md#numpy-pandas-and-arrow-queries).


## Методы потоковых запросов клиента {#client-streaming-query-methods}

Для потоковой передачи больших наборов результатов ClickHouse Connect предоставляет несколько методов потоковой обработки. Подробную информацию и примеры см. в разделе [Расширенные запросы (Потоковые запросы)](advanced-querying.md#streaming-queries).


## Метод `insert` клиента {#client-insert-method}

Для распространённого случая вставки нескольких записей в ClickHouse предназначен метод `Client.insert`. Он принимает следующие параметры:

| Параметр           | Тип                               | По умолчанию | Описание                                                                                                                                                                                      |
| ------------------ | --------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table              | str                               | _Обязательный_ | Таблица ClickHouse для вставки данных. Допускается указание полного имени таблицы (включая базу данных).                                                                                      |
| data               | Sequence of Sequences             | _Обязательный_ | Матрица данных для вставки: либо последовательность строк, каждая из которых является последовательностью значений столбцов, либо последовательность столбцов, каждый из которых является последовательностью значений строк. |
| column_names       | Sequence of str, or str           | '\*'       | Список имён столбцов для матрицы данных. Если используется '\*', ClickHouse Connect выполнит предварительный запрос для получения всех имён столбцов таблицы.                                 |
| database           | str                               | ''         | Целевая база данных для вставки. Если не указана, будет использована база данных клиента.                                                                                                     |
| column_types       | Sequence of ClickHouseType        | _None_     | Список экземпляров ClickHouseType. Если не указаны ни column_types, ни column_type_names, ClickHouse Connect выполнит предварительный запрос для получения всех типов столбцов таблицы.      |
| column_type_names  | Sequence of ClickHouse type names | _None_     | Список имён типов данных ClickHouse. Если не указаны ни column_types, ни column_type_names, ClickHouse Connect выполнит предварительный запрос для получения всех типов столбцов таблицы.    |
| column_oriented    | bool                              | False      | Если True, аргумент `data` интерпретируется как последовательность столбцов (и транспонирование данных не требуется). В противном случае `data` интерпретируется как последовательность строк. |
| settings           | dict                              | _None_     | См. [описание настроек](#settings-argument).                                                                                                                                                  |
| context            | InsertContext                     | _None_     | Многократно используемый объект InsertContext может применяться для инкапсуляции вышеуказанных аргументов метода. См. [Расширенная вставка (InsertContexts)](advanced-inserting.md#insertcontexts) |
| transport_settings | dict                              | _None_     | Необязательный словарь настроек транспортного уровня (HTTP-заголовки и т. д.)                                                                                                                 |

Этот метод возвращает словарь со сводкой запроса, как описано в методе command. При любой ошибке вставки будет вызвано исключение.

Для специализированных методов вставки, работающих с Pandas DataFrames, PyArrow Tables и DataFrames на основе Arrow, см. [Расширенная вставка (Специализированные методы вставки)](advanced-inserting.md#specialized-insert-methods).

:::note
Массив NumPy является допустимой последовательностью последовательностей и может использоваться в качестве аргумента `data` основного метода `insert`, поэтому специализированный метод не требуется.
:::

### Примеры {#examples}

Приведённые ниже примеры предполагают наличие существующей таблицы `users` со схемой `(id UInt32, name String, age UInt8)`.

#### Базовая построчная вставка {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# Строко-ориентированные данные: каждый вложенный список — отдельная строка

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;])

````

#### Вставка данных по столбцам {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Данные в колоночном формате: каждый вложенный список — это столбец

data = [
[1, 2, 3],  # столбец id
[&quot;Alice&quot;, &quot;Bob&quot;, &quot;Joe&quot;],  # столбец name
[25, 30, 28],  # столбец age
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;], column&#95;oriented=True)

````

#### Вставка с явным указанием типов столбцов {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Полезно, когда нужно избежать выполнения запроса DESCRIBE к серверу

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
column&#95;type&#95;names=[&quot;UInt32&quot;, &quot;String&quot;, &quot;UInt8&quot;],
)

````

#### Вставка в конкретную базу данных {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]
````


# Вставка в таблицу в заданной базе данных

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## Вставка из файлов {#file-inserts}

Для вставки данных непосредственно из файлов в таблицы ClickHouse см. [Расширенная вставка (вставка из файлов)](advanced-inserting.md#file-inserts).


## Raw API {#raw-api}

Для сложных сценариев использования, требующих прямого доступа к HTTP-интерфейсам ClickHouse без преобразования типов, см. [Расширенное использование (Raw API)](advanced-usage.md#raw-api).


## Вспомогательные классы и функции {#utility-classes-and-functions}

Следующие классы и функции также являются частью «публичного» API `clickhouse-connect` и, как и классы и методы, описанные выше, остаются стабильными в рамках минорных релизов. Несовместимые изменения в этих классах и функциях будут происходить только при выпуске минорной (не патч) версии и будут доступны со статусом устаревших как минимум в течение одного минорного релиза.

### Исключения {#exceptions}

Все пользовательские исключения (включая определённые в спецификации DB API 2.0) объявлены в модуле `clickhouse_connect.driver.exceptions`. Исключения, фактически обнаруживаемые драйвером, будут использовать один из этих типов.

### Утилиты для работы с ClickHouse SQL {#clickhouse-sql-utilities}

Функции и класс DT64Param в модуле `clickhouse_connect.driver.binding` можно использовать для корректного построения и экранирования SQL-запросов ClickHouse. Аналогично функции в модуле `clickhouse_connect.driver.parser` можно использовать для разбора имён типов данных ClickHouse.


## Многопоточные, многопроцессные и асинхронные/событийно-управляемые сценарии использования {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

Информацию об использовании ClickHouse Connect в многопоточных, многопроцессных и асинхронных/событийно-управляемых приложениях см. в разделе [Расширенное использование (Многопоточные, многопроцессные и асинхронные/событийно-управляемые сценарии использования)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases).


## Обёртка AsyncClient {#asyncclient-wrapper}

Информацию об использовании обёртки AsyncClient для сред asyncio см. в разделе [Продвинутое использование (обёртка AsyncClient)](advanced-usage.md#asyncclient-wrapper).


## Управление идентификаторами сеансов ClickHouse {#managing-clickhouse-session-ids}

Информацию об управлении идентификаторами сеансов ClickHouse в многопоточных или параллельных приложениях см. в разделе [Расширенное использование (Управление идентификаторами сеансов ClickHouse)](advanced-usage.md#managing-clickhouse-session-ids).


## Настройка пула HTTP-соединений {#customizing-the-http-connection-pool}

Информацию о настройке пула HTTP-соединений для больших многопоточных приложений см. в разделе [Расширенное использование (Настройка пула HTTP-соединений)](advanced-usage.md#customizing-the-http-connection-pool).
