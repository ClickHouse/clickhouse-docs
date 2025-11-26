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
Для большинства методов API рекомендуется передавать аргументы в виде именованных, учитывая большое количество возможных аргументов, большинство из которых являются необязательными.

*Методы, не задокументированные здесь, не считаются частью API и могут быть удалены или изменены.*
:::



## Инициализация клиента {#client-initialization}

Класс `clickhouse_connect.driver.client` предоставляет основной интерфейс между Python‑приложением и сервером базы данных ClickHouse. Используйте функцию `clickhouse_connect.get_client` для получения экземпляра Client, который принимает следующие аргументы:

### Параметры подключения {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | Должен быть http или https.                                                                                                                                                                                                                          |
| host                     | str         | localhost                     | Имя хоста или IP‑адрес сервера ClickHouse. Если не задано, будет использовано значение `localhost`.                                                                                                                                                 |
| port                     | int         | 8123 or 8443                  | HTTP‑ или HTTPS‑порт ClickHouse. Если не задан, по умолчанию используется 8123, или 8443, если *secure*=*True* или *interface*=*https*.                                                                                                              |
| username                 | str         | default                       | Имя пользователя ClickHouse. Если не задано, будет использован пользователь ClickHouse `default`.                                                                                                                                                    |
| password                 | str         | *&lt;empty string&gt;*        | Пароль для *username*.                                                                                                                                                                                                                               |
| database                 | str         | *None*                        | База данных по умолчанию для подключения. Если не задана, ClickHouse Connect использует базу данных по умолчанию для *username*.                                                                                                                    |
| secure                   | bool        | False                         | Использовать HTTPS/TLS. Переопределяет значения, выведенные из параметров interface или port.                                                                                                                                                        |
| dsn                      | str         | *None*                        | Строка в стандартном формате DSN (Data Source Name). Другие параметры подключения (такие как host или user) будут извлечены из этой строки, если они явно не заданы.                                                                                |
| compress                 | bool or str | True                          | Включить сжатие для HTTP‑вставок и результатов запросов ClickHouse. См. [Дополнительные опции (Сжатие)](additional-options.md#compression).                                                                                                          |
| query_limit              | int         | 0 (unlimited)                 | Максимальное количество строк, возвращаемых для любого ответа `query`. Установите 0 для неограниченного количества строк. Имейте в виду, что большие значения могут приводить к ошибкам нехватки памяти, если результаты не передаются потоково, так как все результаты загружаются в память сразу. |
| query_retries            | int         | 2                             | Максимальное количество повторных попыток для запроса `query`. Повторяются только HTTP‑ответы, для которых допустим повтор. Запросы `command` или `insert` драйвером автоматически не повторяются, чтобы избежать непреднамеренного дублирования запросов. |
| connect_timeout          | int         | 10                            | Таймаут HTTP‑подключения в секундах.                                                                                                                                                                                                                 |
| send_receive_timeout     | int         | 300                           | Таймаут отправки/получения для HTTP‑соединения в секундах.                                                                                                                                                                                           |
| client_name              | str         | *None*                        | Значение client_name, добавляемое в начало заголовка HTTP User Agent. Установите его, чтобы отслеживать клиентские запросы в ClickHouse system.query_log.                                                                                            |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | Объект PoolManager библиотеки `urllib3`, который будет использоваться. Для продвинутых сценариев, требующих нескольких пулов подключений к разным хостам.                                                                                           |
| http_proxy               | str         | *None*                        | Адрес HTTP‑прокси (аналогично установке переменной окружения HTTP_PROXY).                                                                                                                                                                            |
| https_proxy              | str         | *None*                        | Адрес HTTPS‑прокси (аналогично установке переменной окружения HTTPS_PROXY).                                                                                                                                                                          |
| apply_server_timezone    | bool        | True                          | Использовать часовой пояс сервера для результатов запросов с поддержкой часовых поясов. См. [Приоритет часовых поясов](advanced-querying.md#time-zones).                                                                                            |
| show_clickhouse_errors   | bool        | True                          | Включать подробные сообщения об ошибках сервера ClickHouse и коды исключений во внутренних исключениях клиента.                                                                                                                                      |
| autogenerate_session_id  | bool        | *None*                        | Переопределить глобальную настройку `autogenerate_session_id`. Если True, автоматически генерировать UUID4 session ID, если он не указан.                                                                                                           |
| proxy_path               | str         | &lt;empty string&gt;          | Необязательный префикс пути, добавляемый к URL сервера ClickHouse для конфигураций с прокси.                                                                                                                                                        |
| form_encode_query_params | bool        | False                         | Отправлять параметры запроса как данные в формате form‑encoded в теле запроса вместо параметров URL. Полезно для запросов с большим числом параметров, которые могут превысить ограничения на длину URL.                                             |
| rename_response_column   | str         | *None*                        | Необязательная функция‑обработчик или отображение имён столбцов для переименования столбцов ответа в результатах запроса.                                                                                                                           |

### Параметры HTTPS/TLS {#httpstls-arguments}



| Параметр                 | Тип  | Значение по умолчанию | Описание                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify                   | bool | True                  | Проверять TLS/SSL‑сертификат сервера ClickHouse (имя хоста, срок действия и т. д.) при использовании HTTPS/TLS.                                                                                                                                                                                                                                   |
| ca&#95;cert              | str  | *None*                | Если *verify*=*True*, путь к файлу корневого центра сертификации (Certificate Authority) для проверки сертификата сервера ClickHouse в формате .pem. Игнорируется, если verify имеет значение False. Это не требуется, если сертификат сервера ClickHouse выдан глобально доверенным корневым центром, который проверяется операционной системой. |
| client&#95;cert          | str  | *None*                | Путь к файлу клиентского TLS‑сертификата в формате .pem (для взаимной аутентификации TLS). Файл должен содержать полную цепочку сертификатов, включая любые промежуточные сертификаты.                                                                                                                                                            |
| client&#95;cert&#95;key  | str  | *None*                | Путь к файлу закрытого ключа для клиентского сертификата. Требуется, если закрытый ключ не включён в файл клиентского сертификата.                                                                                                                                                                                                                |
| server&#95;host&#95;name | str  | *None*                | Имя хоста сервера ClickHouse, указанное в CN или SNI его TLS‑сертификата. Укажите это значение, чтобы избежать ошибок SSL при подключении через прокси или туннель с другим именем хоста.                                                                                                                                                         |
| tls&#95;mode             | str  | *None*                | Управляет расширенным поведением TLS. Режимы `proxy` и `strict` не устанавливают взаимное TLS‑подключение к ClickHouse, но отправляют клиентский сертификат и ключ. `mutual` предполагает взаимную TLS‑аутентификацию ClickHouse с использованием клиентского сертификата. Поведение по умолчанию/*None* — `mutual`.                              |

### Параметр settings

Аргумент `settings` для `get_client` используется для передачи дополнительных настроек ClickHouse серверу для каждого клиентского запроса. Обратите внимание, что в большинстве случаев пользователи с доступом *readonly*=*1* не могут изменять настройки, отправляемые с запросом, поэтому ClickHouse Connect отбросит такие настройки в итоговом запросе и запишет предупреждение в журнал. Следующие настройки применяются только к HTTP‑запросам и сессиям, используемым ClickHouse Connect, и не документированы как общие настройки ClickHouse.

| Настройка                     | Описание                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| buffer&#95;size               | Размер буфера (в байтах), используемого сервером ClickHouse перед записью в HTTP‑канал.                                                                                       |
| session&#95;id                | Уникальный идентификатор сессии для связывания связанных запросов на сервере. Обязателен для временных таблиц.                                                                |
| compress                      | Следует ли серверу ClickHouse сжимать данные ответа POST. Эту настройку следует использовать только для запросов «raw».                                                       |
| decompress                    | Должны ли данные, отправляемые на сервер ClickHouse, быть распакованы. Эту настройку следует использовать только для вставок «raw».                                           |
| quota&#95;key                 | Ключ квоты, связанный с этим запросом. См. документацию сервера ClickHouse по квотам.                                                                                         |
| session&#95;check             | Используется для проверки состояния сессии.                                                                                                                                   |
| session&#95;timeout           | Время бездействия в секундах, по истечении которого сессия, идентифицируемая session ID, будет завершена и более не будет считаться действительной. По умолчанию — 60 секунд. |
| wait&#95;end&#95;of&#95;query | Буферизует весь ответ на сервере ClickHouse. Эта настройка необходима для возврата сводной информации и автоматически устанавливается для нестреминговых запросов.            |
| role                          | Роль ClickHouse, которая будет использоваться для сессии. Корректная транспортная настройка, которую можно включать в контекст запроса.                                       |

Для других настроек ClickHouse, которые можно отправлять с каждым запросом, см. [документацию ClickHouse](/operations/settings/settings.md).

### Примеры создания клиента

* Без каких‑либо параметров клиент ClickHouse Connect подключится к стандартному HTTP‑порту на `localhost` с пользователем по умолчанию и без пароля:

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

# Вывод: 'github'

```

```


## Жизненный цикл клиента и рекомендации по использованию

Создание клиента ClickHouse Connect — это ресурсоёмкая операция, которая включает установку соединения, получение метаданных сервера и инициализацию настроек. Следуйте этим рекомендациям для оптимальной производительности:

### Основные принципы

* **Повторно используйте клиентов**: Создавайте клиентов один раз при запуске приложения и используйте их повторно на всём протяжении работы приложения
* **Избегайте частого создания**: Не создавайте нового клиента для каждого запроса (это приводит к потере сотен миллисекунд на каждую операцию)
* **Корректно освобождайте ресурсы**: Всегда закрывайте клиентов при остановке приложения, чтобы освободить ресурсы пула соединений
* **Используйте совместно, когда это возможно**: Один клиент может обрабатывать множество параллельных запросов через свой пул соединений (см. примечания по потокам ниже)

### Базовые шаблоны

**✅ Хорошо: повторно использовать один клиент**

```python
import clickhouse_connect
```


# Создайте клиент один раз при запуске
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')



# Повторное использование клиента для всех запросов
for i in range(1000):
    result = client.query('SELECT count() FROM users')



# Закрытие при завершении

client.close()

```

**❌ Неправильно: Повторное создание клиентов**
```


```python
# ПЛОХО: Создаёт 1000 клиентов с высокими издержками на инициализацию
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### Многопоточные приложения

:::warning
Экземпляры клиента **НЕ являются потокобезопасными** при использовании идентификаторов сессии. По умолчанию клиенты используют автоматически создаваемый идентификатор сессии, и параллельные запросы в одной и той же сессии приведут к выбросу исключения `ProgrammingError`.
:::

Чтобы безопасно использовать один клиент в нескольких потоках:

```python
import clickhouse_connect
import threading
```


# Вариант 1: Отключить сессии (рекомендуется при совместном использовании клиента)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Требуется для потокобезопасности
)

def worker(thread_id):
    # Теперь все потоки могут безопасно использовать один и тот же клиент
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


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

**Альтернатива для сессий:** Если вам нужны сессии (например, для временных таблиц), создайте отдельный клиент для каждого потока:

```python
def worker(thread_id):
    # Каждый поток получает собственный клиент с изолированной сессией
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... используйте временную таблицу ...
    client.close()
````

### Корректная очистка

Всегда закрывайте клиентов при завершении работы. Обратите внимание, что `client.close()` освобождает клиента и закрывает пул HTTP‑соединений только в том случае, если клиент владеет своим пулом соединений (например, когда он создан с пользовательскими параметрами TLS/прокси). Для стандартного общего пула используйте `client.close_connections()` для явной очистки сокетов; в противном случае соединения автоматически освобождаются по истечении времени простоя и при завершении процесса.

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

Или используйте менеджер контекста:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```

### Когда использовать несколько клиентов

Использование нескольких клиентов уместно в следующих случаях:

* **Разные серверы**: Один клиент для каждого сервера или кластера ClickHouse
* **Разные учётные данные**: Отдельные клиенты для разных пользователей или уровней доступа
* **Разные базы данных**: Когда нужно работать с несколькими базами данных
* **Изолированные сессии**: Когда нужны отдельные сессии для временных таблиц или настроек, специфичных для сессии
* **Изоляция по потокам**: Когда потокам требуются независимые сессии (как показано выше)


## Общие аргументы методов

Несколько методов клиента используют один или оба общих аргумента `parameters` и `settings`. Эти именованные аргументы описаны ниже.

### Аргумент parameters

Методы ClickHouse Connect Client `query*` и `command` принимают необязательный именованный аргумент `parameters`, который используется для привязки Python‑выражений к выражениям значений ClickHouse. Доступны два типа привязки.

#### Привязка на стороне сервера

ClickHouse поддерживает [привязку на стороне сервера](/interfaces/cli.md#cli-queries-with-parameters) для большинства значений в запросе, когда привязанное значение отправляется отдельно от запроса в качестве HTTP‑параметра. ClickHouse Connect добавит соответствующие параметры запроса, если обнаружит выражение привязки вида `{<name>:<datatype>}`. Для привязки на стороне сервера аргумент `parameters` должен быть словарём Python.

* Привязка на стороне сервера с использованием словаря Python, значения DateTime и строкового значения

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

В результате на сервере формируется следующий запрос:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
Привязка параметров на стороне сервера поддерживается (сервером ClickHouse) только для запросов `SELECT`. Она не работает для `ALTER`, `DELETE`, `INSERT` или других типов запросов. В будущем это может измениться; см. [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092).
:::

#### Привязка параметров на стороне клиента

ClickHouse Connect также поддерживает привязку параметров на стороне клиента, что может обеспечить большую гибкость при генерации шаблонных SQL‑запросов. Для привязки на стороне клиента аргумент `parameters` должен быть словарём или последовательностью. Привязка на стороне клиента использует Python‑форматирование строк в стиле [«printf»](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) для подстановки параметров.

Обратите внимание, что в отличие от привязки на стороне сервера, привязка на стороне клиента не работает для идентификаторов базы данных, таких как имена баз данных, таблиц или столбцов, поскольку форматирование в стиле Python не может различать разные типы строк, а их нужно форматировать по‑разному (обратные кавычки или двойные кавычки для идентификаторов базы данных, одинарные кавычки для значений данных).

* Пример со словарём Python, значением типа DateTime и экранированием строк

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

На сервере при этом формируется следующий запрос:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

* Пример с последовательностью Python (tuple), Float64 и IPv4Address

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

При этом на сервере формируется следующий запрос:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
Для привязки аргументов типа DateTime64 (типов ClickHouse с субсекундной точностью) требуется один из двух специальных подходов:

* Оберните значение Python `datetime.datetime` в новый класс DT64Param, например:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Привязка на стороне сервера с использованием словаря
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Привязка на стороне клиента с использованием списка 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * Если используется словарь значений параметров, добавьте суффикс `_64` к имени параметра
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Привязка на стороне сервера с использованием словаря
  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### Аргумент settings {#settings-argument-1}

Все основные методы ClickHouse Connect Client «insert» и «select» принимают необязательный именованный аргумент `settings` для передачи [пользовательских настроек](/operations/settings/settings.md) сервера ClickHouse для выполняемого SQL-запроса. Аргумент `settings` должен быть словарем. Каждый элемент должен содержать имя настройки ClickHouse и соответствующее ей значение. Обратите внимание, что значения будут преобразованы в строки при отправке на сервер в качестве параметров запроса.

Как и в случае с настройками уровня клиента, ClickHouse Connect отбросит любые настройки, помеченные сервером как *readonly*=*1*, с соответствующим сообщением в журнале. Настройки, применимые только к запросам через HTTP-интерфейс ClickHouse, всегда допустимы. Эти настройки описаны в разделе [API](#settings-argument) `get_client`.

Пример использования настроек ClickHouse:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## Метод клиента `command`

Используйте метод `Client.command` для отправки SQL‑запросов к серверу ClickHouse, которые обычно не возвращают данных или возвращают одно примитивное значение либо массив значений, а не полный набор данных. Этот метод принимает следующие параметры:

| Параметр          | Тип              | Значение по умолчанию | Описание                                                                                                                                                                                       |
| ----------------- | ---------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cmd               | str              | *Required*            | SQL‑выражение ClickHouse, которое возвращает одно значение или одну строку значений.                                                                                                           |
| parameters        | dict or iterable | *None*                | См. [описание параметра parameters](#parameters-argument).                                                                                                                                     |
| data              | str or bytes     | *None*                | Необязательные данные, передаваемые вместе с командой в теле POST‑запроса.                                                                                                                     |
| settings          | dict             | *None*                | См. [описание параметра settings](#settings-argument).                                                                                                                                         |
| use&#95;database  | bool             | True                  | Использовать базу данных клиента (указанную при создании клиента). Значение False означает, что команда будет использовать базу данных ClickHouse по умолчанию для подключённого пользователя. |
| external&#95;data | ExternalData     | *None*                | Объект `ExternalData`, содержащий файловые или бинарные данные для использования в запросе. См. [Advanced Queries (External Data)](advanced-querying.md#external-data).                        |

### Примеры команд

#### DDL‑операторы

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# Создание таблицы
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Возвращает QuerySummary с query_id



# Показать определение таблицы
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


# Результат в виде одного значения
count = client.command("SELECT count() FROM system.tables")
print(count)
# Вывод: 151



# Версия сервера

version = client.command(&quot;SELECT version()&quot;)
print(version)

# Результат: &quot;25.8.2.29&quot;

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

#### Команды с параметрами {#commands-with-settings}

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


## Метод клиента `query`

Метод `Client.query` является основным способом получения одного «пакетного» набора данных с сервера ClickHouse. Он использует нативный формат ClickHouse поверх HTTP для эффективной передачи больших наборов данных (до примерно одного миллиона строк). Этот метод принимает следующие параметры:

| Параметр                    | Тип              | Значение по умолчанию | Описание                                                                                                                                                                                                                                                                   |
| --------------------------- | ---------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query                       | str              | *Required*            | SQL‑запрос ClickHouse: SELECT или DESCRIBE.                                                                                                                                                                                                                                |
| parameters                  | dict or iterable | *None*                | См. [описание параметра parameters](#parameters-argument).                                                                                                                                                                                                                 |
| settings                    | dict             | *None*                | См. [описание параметра settings](#settings-argument).                                                                                                                                                                                                                     |
| query&#95;formats           | dict             | *None*                | Спецификация форматирования типов данных для значений результата. См. раздел расширенного использования (форматы чтения).                                                                                                                                                  |
| column&#95;formats          | dict             | *None*                | Спецификация форматирования типов данных по столбцам. См. раздел расширенного использования (форматы чтения).                                                                                                                                                              |
| encoding                    | str              | *None*                | Кодировка, используемая для преобразования строковых столбцов ClickHouse в строки Python. Если не указано иное, в Python по умолчанию используется `UTF-8`.                                                                                                                |
| use&#95;none                | bool             | True                  | Использовать тип Python *None* для значений NULL в ClickHouse. Если False, использовать значение по умолчанию для типа данных (например, 0) для значений NULL в ClickHouse. Примечание: по умолчанию имеет значение False для NumPy/Pandas по причинам производительности. |
| column&#95;oriented         | bool             | False                 | Возвращать результаты в виде последовательности столбцов, а не последовательности строк. Полезно при преобразовании данных Python в другие столбцовые форматы данных.                                                                                                      |
| query&#95;tz                | str              | *None*                | Имя часового пояса из базы данных `zoneinfo`. Этот часовой пояс будет применён ко всем объектам datetime или Pandas Timestamp, возвращаемым запросом.                                                                                                                      |
| column&#95;tzs              | dict             | *None*                | Словарь вида «имя столбца → имя часового пояса». Аналогично `query_tz`, но позволяет указывать разные часовые пояса для разных столбцов.                                                                                                                                   |
| use&#95;extended&#95;dtypes | bool             | True                  | Использовать расширенные типы данных Pandas (такие как StringArray), а также pandas.NA и pandas.NaT для значений NULL в ClickHouse. Применяется только к методам `query_df` и `query_df_stream`.                                                                           |
| external&#95;data           | ExternalData     | *None*                | Объект ExternalData, содержащий файловые или бинарные данные для использования в запросе. См. раздел «[Advanced Queries (External Data)](advanced-querying.md#external-data)».                                                                                             |
| context                     | QueryContext     | *None*                | Повторно используемый объект QueryContext, который может быть использован для инкапсуляции аргументов метода, перечисленных выше. См. раздел «[Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts)».                                                     |

### Примеры запросов

#### Базовый запрос

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# Простой запрос SELECT
result = client.query("SELECT name, database FROM system.tables LIMIT 3")



# Доступ к результатам как к строкам
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

#### Доступ к результатам запроса {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# Доступ к данным по строкам (по умолчанию)
print(result.result_rows)
# Вывод: [[0, "0"], [1, "1"], [2, "2"]]



# Столбцовый доступ
print(result.result_columns)
# Вывод: [[0, 1, 2], ["0", "1", "2"]]



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


# Первая строка в виде кортежа

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


# Привязка параметров на стороне сервера (более безопасно, выше производительность для SELECT-запросов)

query = "SELECT \* FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)

````

#### Запрос с параметрами {#query-with-settings}

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

- `result_rows` — матрица возвращаемых данных в виде последовательности строк, где каждый элемент строки является последовательностью значений столбцов.
- `result_columns` — матрица возвращаемых данных в виде последовательности столбцов, где каждый элемент столбца является последовательностью значений строк для этого столбца
- `column_names` — кортеж строк, представляющих имена столбцов в `result_set`
- `column_types` — кортеж экземпляров ClickHouseType, представляющих тип данных ClickHouse для каждого столбца в `result_columns`
- `query_id` — идентификатор запроса ClickHouse query_id (полезен для анализа запроса в таблице `system.query_log`)
- `summary` — любые данные, возвращаемые HTTP-заголовком ответа `X-ClickHouse-Summary`
- `first_item` — вспомогательное свойство для получения первой строки ответа в виде словаря (ключи — имена столбцов)
- `first_row` — вспомогательное свойство для возврата первой строки результата
- `column_block_stream` — генератор результатов запроса в столбцовом формате. Это свойство не следует использовать напрямую (см. ниже).
- `row_block_stream` — генератор результатов запроса в строчном формате. Это свойство не следует использовать напрямую (см. ниже).
- `rows_stream` — генератор результатов запроса, возвращающий одну строку за вызов. Это свойство не следует использовать напрямую (см. ниже).
- `summary` — как описано в методе `command`, словарь сводной информации, возвращаемой ClickHouse

Свойства `*_stream` возвращают контекст Python, который можно использовать в качестве итератора для возвращаемых данных. К ним следует обращаться только косвенно через методы `*_stream` клиента.

Полная информация о потоковой передаче результатов запросов (с использованием объектов StreamContext) приведена в разделе [Расширенные запросы (потоковые запросы)](advanced-querying.md#streaming-queries).

```


## Получение результатов запросов с помощью NumPy, Pandas или Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect предоставляет специализированные методы выполнения запросов для форматов данных NumPy, Pandas и Arrow. Подробную информацию об использовании этих методов, включая примеры, возможности потоковой передачи и расширенную работу с типами, см. в разделе [Расширенные запросы (запросы NumPy, Pandas и Arrow)](advanced-querying.md#numpy-pandas-and-arrow-queries).



## Методы клиентских потоковых запросов {#client-streaming-query-methods}

Для потоковой обработки больших наборов результатов ClickHouse Connect предоставляет несколько методов. Подробности и примеры см. в разделе [Расширенные запросы (потоковые запросы)](advanced-querying.md#streaming-queries).



## Метод клиента `insert`

Для типичного сценария, когда нужно вставить несколько записей в ClickHouse, используется метод `Client.insert`. Он принимает следующие параметры:

| Параметр                  | Тип                               | По умолчанию | Описание                                                                                                                                                                                                                      |
| ------------------------- | --------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table                     | str                               | *Required*   | Таблица ClickHouse, в которую выполняется вставка. Допускается полное имя таблицы (включая базу данных).                                                                                                                      |
| data                      | Sequence of Sequences             | *Required*   | Матрица данных для вставки: либо последовательность строк, каждая из которых является последовательностью значений столбцов, либо последовательность столбцов, каждый из которых является последовательностью значений строк. |
| column&#95;names          | Sequence of str, or str           | &#39;*&#39;  | Список column&#95;names для матрицы данных. Если используется &#39;*&#39;, ClickHouse Connect выполнит «предзапрос» для получения всех имён столбцов таблицы.                                                                 |
| database                  | str                               | &#39;&#39;   | Целевая база данных для вставки. Если не указана, будет использоваться база данных, настроенная для клиента.                                                                                                                  |
| column&#95;types          | Sequence of ClickHouseType        | *None*       | Список экземпляров ClickHouseType. Если не указаны ни column&#95;types, ни column&#95;type&#95;names, ClickHouse Connect выполнит «предзапрос» для получения всех типов столбцов для таблицы.                                 |
| column&#95;type&#95;names | Sequence of ClickHouse type names | *None*       | Список имён типов данных ClickHouse. Если не указаны ни column&#95;types, ни column&#95;type&#95;names, ClickHouse Connect выполнит «предзапрос» для получения всех типов столбцов для таблицы.                               |
| column&#95;oriented       | bool                              | False        | Если True, аргумент `data` считается последовательностью столбцов (и «поворот» данных для вставки не требуется). В противном случае `data` интерпретируется как последовательность строк.                                     |
| settings                  | dict                              | *None*       | См. [описание параметра settings](#settings-argument).                                                                                                                                                                        |
| context                   | InsertContext                     | *None*       | Для инкапсуляции перечисленных выше аргументов метода можно использовать многократно применяемый объект InsertContext. См. [Продвинутая вставка (InsertContexts)](advanced-inserting.md#insertcontexts).                      |
| transport&#95;settings    | dict                              | *None*       | Необязательный словарь настроек транспортного уровня (HTTP-заголовки и т. п.)                                                                                                                                                 |

Этот метод возвращает словарь — «сводку запроса», как описано в разделе о методе `command`. Если вставка по какой-либо причине завершится неудачно, будет выброшено исключение.

Для специализированных методов вставки, работающих с объектами Pandas DataFrame, PyArrow Table и DataFrame на базе Arrow, см. [Продвинутая вставка (специализированные методы вставки)](advanced-inserting.md#specialized-insert-methods).

:::note
Массив NumPy является допустимой последовательностью последовательностей и может использоваться как аргумент `data` для основного метода `insert`, поэтому специализированный метод не требуется.
:::

### Примеры

В примерах ниже предполагается существование таблицы `users` со схемой `(id UInt32, name String, age UInt8)`.

#### Базовая вставка в строко-ориентированном формате

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# Строко-ориентированные данные: каждый внутренний список — отдельная строка

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


# Колонко-ориентированные данные: каждый вложенный список — это столбец

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


# Полезно, когда вы хотите избежать выполнения запроса DESCRIBE к серверу

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


# Вставка в таблицу в определённой базе данных

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## Вставка данных из файлов {#file-inserts}

Для вставки данных напрямую из файлов в таблицы ClickHouse см. раздел [Расширенные способы вставки (вставка из файлов)](advanced-inserting.md#file-inserts).



## Низкоуровневый API {#raw-api}

Для продвинутых сценариев использования, требующих прямого доступа к HTTP-интерфейсам ClickHouse без преобразований типов, см. раздел [Расширенное использование (Низкоуровневый API)](advanced-usage.md#raw-api).



## Вспомогательные классы и функции {#utility-classes-and-functions}

Следующие классы и функции также считаются частью «публичного» API `clickhouse-connect` и, как и классы и методы, описанные выше, остаются стабильными в пределах минорных релизов. Несовместимые изменения этих классов и функций возможны только в минорном (не patch) релизе и при этом будут иметь статус устаревших (deprecated) как минимум в одном минорном релизе.

### Исключения {#exceptions}

Все пользовательские исключения (включая определённые в спецификации DB API 2.0) определены в модуле `clickhouse_connect.driver.exceptions`. Исключения, фактически перехватываемые драйвером, будут иметь один из этих типов.

### Вспомогательные средства для ClickHouse SQL {#clickhouse-sql-utilities}

Функции и класс DT64Param в модуле `clickhouse_connect.driver.binding` можно использовать для корректного построения и экранирования SQL‑запросов ClickHouse. Аналогично, функции в модуле `clickhouse_connect.driver.parser` можно использовать для разбора имён типов данных ClickHouse.



## Многопоточные, многопроцессные и асинхронные/событийно-ориентированные варианты использования {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

Подробную информацию об использовании ClickHouse Connect в многопоточных, многопроцессных и асинхронных/событийно-ориентированных приложениях см. в разделе [Расширенное использование (многопоточные, многопроцессные и асинхронные/событийно-ориентированные варианты использования)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases).



## Обёртка AsyncClient {#asyncclient-wrapper}

Сведения об использовании обёртки AsyncClient в средах asyncio см. в разделе [Расширенное использование (обёртка AsyncClient)](advanced-usage.md#asyncclient-wrapper).



## Управление идентификаторами сеансов ClickHouse {#managing-clickhouse-session-ids}

Подробную информацию об управлении идентификаторами сеансов ClickHouse в многопоточных или параллельных приложениях см. в разделе [Расширенное использование (управление идентификаторами сеансов ClickHouse)](advanced-usage.md#managing-clickhouse-session-ids).



## Настройка пула HTTP‑соединений {#customizing-the-http-connection-pool}

Подробнее о настройке пула HTTP‑соединений для больших многопоточных приложений см. в разделе [Расширенное использование (настройка пула HTTP‑соединений)](advanced-usage.md#customizing-the-http-connection-pool).
