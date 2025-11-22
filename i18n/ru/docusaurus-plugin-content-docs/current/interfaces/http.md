---
description: 'Документация по HTTP‑интерфейсу ClickHouse, который предоставляет REST API‑доступ к ClickHouse с любой платформы и на любом языке программирования'
sidebar_label: 'HTTP‑интерфейс'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP‑интерфейс'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP-интерфейс



## Предварительные требования {#prerequisites}

Для работы с примерами из этой статьи вам потребуется:

- работающий экземпляр сервера ClickHouse
- установленная утилита `curl`. В Ubuntu или Debian выполните команду `sudo apt install curl` или обратитесь к [документации](https://curl.se/download.html) для получения инструкций по установке.


## Обзор {#overview}

HTTP-интерфейс позволяет использовать ClickHouse на любой платформе из любого языка программирования в форме REST API. HTTP-интерфейс более ограничен по сравнению с нативным интерфейсом, но имеет более широкую поддержку языков программирования.

По умолчанию `clickhouse-server` прослушивает следующие порты:

- порт 8123 для HTTP
- порт 8443 для HTTPS (может быть включён)

Если выполнить запрос `GET /` без параметров, возвращается код ответа 200 со строкой "Ok.":

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." — это значение по умолчанию, определённое в параметре [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response), которое можно изменить при необходимости.

См. также: [Особенности кодов ответа HTTP](#http_response_codes_caveats).


## Веб-интерфейс {#web-ui}

ClickHouse включает веб-интерфейс, доступ к которому можно получить по следующему адресу:

```text
http://localhost:8123/play
```

Веб-интерфейс поддерживает отображение прогресса выполнения запроса, отмену запроса и потоковую передачу результатов.
В нём есть скрытая функция для отображения диаграмм и графиков конвейеров запросов.

После успешного выполнения запроса появляется кнопка загрузки, которая позволяет скачать результаты запроса в различных форматах, включая CSV, TSV, JSON, JSONLines, Parquet, Markdown или любой пользовательский формат, поддерживаемый ClickHouse. Функция загрузки использует кэш запросов для эффективного получения результатов без повторного выполнения запроса. Будет загружен полный набор результатов, даже если в интерфейсе отображалась только одна страница из многих.

Веб-интерфейс разработан для таких профессионалов, как вы.

<Image img={PlayUI} size='md' alt='Скриншот веб-интерфейса ClickHouse' />

В скриптах проверки работоспособности используйте запрос `GET /ping`. Этот обработчик всегда возвращает «Ok.» (с переводом строки в конце). Доступно начиная с версии 18.12.13. См. также `/replicas_status` для проверки задержки реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## Выполнение запросов через HTTP/HTTPS {#querying}

Для выполнения запросов через HTTP/HTTPS существует три варианта:

- отправить запрос в качестве параметра URL 'query'
- использовать метод POST
- отправить начало запроса в параметре 'query', а остальное через POST

:::note
Размер URL по умолчанию ограничен 1 МиБ, это можно изменить с помощью настройки `http_max_uri_size`.
:::

В случае успеха вы получите код ответа 200 и результат в теле ответа.
При возникновении ошибки вы получите код ответа 500 и текст описания ошибки в теле ответа.

Запросы с использованием GET являются 'readonly'. Это означает, что для запросов, изменяющих данные, можно использовать только метод POST.
Сам запрос можно отправить либо в теле POST, либо в параметре URL. Рассмотрим несколько примеров.

В примере ниже curl используется для отправки запроса `SELECT 1`. Обратите внимание на использование URL-кодирования для пробела: `%20`.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Ответ"
1
```

В этом примере wget используется с параметрами `-nv` (неподробный режим) и `-O-` для вывода результата в терминал.
В этом случае не требуется использовать URL-кодирование для пробела:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

В этом примере мы передаем необработанный HTTP-запрос в netcat:

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="ответ"
HTTP/1.0 200 OK
X-ClickHouse-Summary: {"read_rows":"1","read_bytes":"1","written_rows":"0","written_bytes":"0","total_rows_to_read":"1","result_rows":"0","result_bytes":"0","elapsed_ns":"4505959","memory_usage":"1111711"}
Date: Tue, 11 Nov 2025 18:16:01 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
Access-Control-Expose-Headers: X-ClickHouse-Query-Id,X-ClickHouse-Summary,X-ClickHouse-Server-Display-Name,X-ClickHouse-Format,X-ClickHouse-Timezone,X-ClickHouse-Exception-Code,X-ClickHouse-Exception-Tag
X-ClickHouse-Server-Display-Name: MacBook-Pro.local
X-ClickHouse-Query-Id: ec0d8ec6-efc4-4e1d-a14f-b748e01f5294
X-ClickHouse-Format: TabSeparated
X-ClickHouse-Timezone: Europe/London
X-ClickHouse-Exception-Tag: dngjzjnxkvlwkeua

1
```

Как видите, команда `curl` несколько неудобна тем, что пробелы должны быть экранированы в формате URL.
Хотя `wget` экранирует всё самостоятельно, мы не рекомендуем его использовать, поскольку он плохо работает с HTTP 1.1 при использовании keep-alive и Transfer-Encoding: chunked.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса отправляется в параметре, а часть в POST, между этими двумя частями данных вставляется перевод строки.
Например, это не будет работать:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в формате [`TabSeparated`](/interfaces/formats/TabSeparated).

Для запроса любого другого формата в запросе используется конструкция `FORMAT`. Например:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1, 2, 3 FORMAT JSON'
```


```response title="Response"
{
    "meta":
    [
        {
            "name": "1",
            "type": "UInt8"
        },
        {
            "name": "2",
            "type": "UInt8"
        },
        {
            "name": "3",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "1": 1,
            "2": 2,
            "3": 3
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.000515,
        "rows_read": 1,
        "bytes_read": 1
    }
}
```

Вы можете использовать URL-параметр `default_format` или заголовок `X-ClickHouse-Format`, чтобы указать формат по умолчанию, отличный от `TabSeparated`.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

Вы можете использовать метод POST для параметризованных запросов. Параметры указываются в фигурных скобках с именем параметра и его типом, например `{name:Type}`. Значения параметров передаются через параметр `param_name`:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## INSERT-запросы через HTTP/HTTPS {#insert-queries}

Для выполнения `INSERT`-запросов необходимо использовать метод передачи данных `POST`. В этом случае начало запроса можно указать в параметре URL, а данные для вставки передать через POST. Вставляемые данные могут представлять собой, например, дамп из MySQL с разделителями-табуляциями. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.

### Примеры {#examples}

Создание таблицы:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

Использование стандартного запроса `INSERT` для вставки данных:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

Отправка данных отдельно от запроса:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

Можно указать любой формат данных. Например, можно указать формат Values — тот же формат, который используется при записи `INSERT INTO t VALUES`:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Для вставки данных из дампа с разделителями-табуляциями укажите соответствующий формат:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

Чтение содержимого таблицы:

```bash
$ curl 'http://localhost:8123/?query=SELECT%20a%20FROM%20t'
7
8
9
10
11
12
1
2
3
4
5
6
```

:::note
Данные выводятся в произвольном порядке из-за параллельной обработки запросов
:::

Удаление таблицы:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

Для успешных запросов, которые не возвращают таблицу данных, возвращается пустое тело ответа.


## Сжатие {#compression}

Сжатие можно использовать для уменьшения сетевого трафика при передаче больших объёмов данных или для создания дампов, которые сразу же сжимаются.

При передаче данных можно использовать внутренний формат сжатия ClickHouse. Сжатые данные имеют нестандартный формат, и для работы с ними требуется программа `clickhouse-compressor`. Она устанавливается по умолчанию вместе с пакетом `clickhouse-client`.

Для повышения эффективности вставки данных отключите проверку контрольных сумм на стороне сервера с помощью настройки [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если указать `compress=1` в URL, сервер будет сжимать отправляемые вам данные. Если указать `decompress=1` в URL, сервер будет распаковывать данные, которые вы передаёте методом `POST`.

Также можно использовать [HTTP-сжатие](https://en.wikipedia.org/wiki/HTTP_compression). ClickHouse поддерживает следующие [методы сжатия](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

Чтобы отправить сжатый `POST`-запрос, добавьте заголовок `Content-Encoding: compression_method`.

Чтобы ClickHouse сжимал ответ, добавьте к запросу заголовок `Accept-Encoding: compression_method`.

Уровень сжатия данных можно настроить с помощью параметра [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут распаковывать данные с сервера по умолчанию (с помощью `gzip` и `deflate`), и вы можете получить распакованные данные, даже если правильно используете настройки сжатия.
:::


## Примеры {#examples-compression}

Отправка сжатых данных на сервер:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

Получение сжатого архива данных с сервера:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

Получение сжатых данных с сервера с использованием gunzip для распаковки:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## База данных по умолчанию {#default-database}

Для указания базы данных по умолчанию можно использовать URL-параметр `database` или заголовок `X-ClickHouse-Database`.

```bash
echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

По умолчанию используется база данных, указанная в настройках сервера. В стандартной конфигурации это база данных с именем `default`. Также можно всегда явно указать базу данных, добавив точку перед именем таблицы.


## Аутентификация {#authentication}

Имя пользователя и пароль можно указать одним из трёх способов:

1. С помощью HTTP Basic Authentication.

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В URL-параметрах `user` и `password`

:::warning
Мы не рекомендуем использовать этот метод, так как параметры могут быть записаны в логи веб-прокси и кэшированы в браузере
:::

Например:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. С помощью заголовков 'X-ClickHouse-User' и 'X-ClickHouse-Key'

Например:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

Если имя пользователя не указано, используется имя `default`. Если пароль не указан, используется пустой пароль.
Вы также можете использовать URL-параметры для указания любых настроек обработки отдельного запроса или целых профилей настроек.

Например:

```text
http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1
```

```bash
$ echo 'SELECT number FROM system.numbers LIMIT 10' | curl 'http://localhost:8123/?' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

Для получения дополнительной информации см.:

- [Настройки](/operations/settings/settings)
- [SET](/sql-reference/statements/set)


## Использование сессий ClickHouse в HTTP-протоколе {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сессии ClickHouse в HTTP-протоколе. Для этого необходимо добавить `GET`-параметр `session_id` к запросу. В качестве идентификатора сессии можно использовать любую строку.

По умолчанию сессия завершается после 60 секунд бездействия. Чтобы изменить этот таймаут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте `GET`-параметр `session_timeout` к запросу.

Чтобы проверить статус сессии, используйте параметр `session_check=1`. В рамках одной сессии одновременно может выполняться только один запрос.

Вы можете получать информацию о ходе выполнения запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите настройку [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers).

Ниже приведен пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

Возможные поля заголовка:

| Поле заголовка       | Описание                                      |
| -------------------- | --------------------------------------------- |
| `read_rows`          | Количество прочитанных строк.                 |
| `read_bytes`         | Объем прочитанных данных в байтах.            |
| `total_rows_to_read` | Общее количество строк для чтения.            |
| `written_rows`       | Количество записанных строк.                  |
| `written_bytes`      | Объем записанных данных в байтах.             |
| `elapsed_ns`         | Время выполнения запроса в наносекундах.      |
| `memory_usage`       | Объем памяти в байтах, используемой запросом. |

Выполняющиеся запросы не останавливаются автоматически при потере HTTP-соединения. Разбор и форматирование данных выполняются на стороне сервера, и использование сети может оказаться неэффективным.

Существуют следующие необязательные параметры:

| Параметр               | Описание                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `query_id` (необязательный)  | Может быть передан в качестве идентификатора запроса (любая строка). [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (необязательный) | Может быть передан в качестве ключа квоты (любая строка). [«Квоты»](/operations/quotas)                                                |

HTTP-интерфейс позволяет передавать внешние данные (внешние временные таблицы) для выполнения запросов. Для получения дополнительной информации см. [«Внешние данные для обработки запросов»](/engines/table-engines/special/external-data).


## Буферизация ответов {#response-buffering}

Буферизацию ответов можно включить на стороне сервера. Для этого предусмотрены следующие URL-параметры:

- `buffer_size`
- `wait_end_of_query`

Можно использовать следующие настройки:

- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

Параметр `buffer_size` определяет количество байтов результата, которые будут буферизованы в памяти сервера. Если размер тела результата превышает этот порог, буфер записывается в HTTP-канал, а оставшиеся данные отправляются непосредственно в HTTP-канал.

Чтобы обеспечить буферизацию всего ответа, установите `wait_end_of_query=1`. В этом случае данные, не помещающиеся в памяти, будут буферизованы во временном файле на сервере.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса возникает после того, как код ответа и HTTP-заголовки уже отправлены клиенту. В такой ситуации сообщение об ошибке записывается в конец тела ответа, и на стороне клиента ошибка может быть обнаружена только на этапе разбора ответа.
:::


## Установка роли с помощью параметров запроса {#setting-role-with-query-parameters}

Эта функция была добавлена в ClickHouse 24.4.

В некоторых сценариях может потребоваться сначала установить назначенную роль перед выполнением самого оператора.
Однако отправить `SET ROLE` и оператор вместе невозможно, так как множественные операторы не допускаются:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Приведённая выше команда приводит к ошибке:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

Чтобы обойти это ограничение, используйте параметр запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это эквивалентно выполнению `SET ROLE my_role` перед оператором.

Кроме того, можно указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед оператором.


## Особенности кодов ответа HTTP {#http_response_codes_caveats}

Из-за ограничений протокола HTTP код ответа HTTP 200 не гарантирует успешное выполнение запроса.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения заключается в особенностях протокола HTTP. Сначала отправляется HTTP-заголовок с кодом 200, затем тело HTTP-ответа, а ошибка встраивается в тело в виде обычного текста.

Это поведение не зависит от используемого формата — будь то `Native`, `TSV` или `JSON`; сообщение об ошибке всегда будет находиться в середине потока ответа.

Вы можете смягчить эту проблему, включив `wait_end_of_query=1` ([Буферизация ответа](#response-buffering)). В этом случае отправка HTTP-заголовка откладывается до полного выполнения запроса. Однако это не решает проблему полностью, поскольку результат всё равно должен помещаться в [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size), а другие настройки, такие как [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers), могут помешать задержке отправки заголовка.

:::tip
Единственный способ перехватить все ошибки — проанализировать тело HTTP-ответа перед его разбором в требуемом формате.
:::

Такие исключения в ClickHouse имеют единообразный формат, как показано ниже, независимо от используемого формата (например, `Native`, `TSV`, `JSON` и т. д.), когда `http_write_exception_in_output_format=0` (по умолчанию). Это упрощает разбор и извлечение сообщений об ошибках на стороне клиента.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

Где `<TAG>` — это случайный тег размером 16 байт, который совпадает с тегом, отправленным в заголовке ответа `X-ClickHouse-Exception-Tag`.
`<error message>` — это фактическое сообщение об исключении (точную длину можно найти в `<message_length>`). Весь блок исключения, описанный выше, может занимать до 16 КиБ.

Вот пример в формате `JSON`:

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+JSON"
...
{
    "meta":
    [
        {
            "name": "sleepEachRow(0.001)",
            "type": "UInt8"
        },
        {
            "name": "throwIf(equals(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        },
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        }
__exception__
dmrdfnujjqvszhav
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 dmrdfnujjqvszhav
__exception__
```

Вот аналогичный пример в формате `CSV`:

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

```


**исключение**
rumfyutuqkncbgau
Код: 395. DB::Exception: Значение, переданное функции &#39;throwIf&#39;, не равно нулю: при выполнении выражения &#39;FUNCTION throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8) :: 1) -&gt; throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8)) UInt8 : 0&#39;. (FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
**исключение**

```
```


## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передать их значения из соответствующих параметров HTTP-запроса. Подробнее см. [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).

### Пример {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### Табуляция в параметрах URL {#tabs-in-url-parameters}

Параметры запроса разбираются из экранированного формата. Это дает некоторые преимущества, например, возможность однозначно интерпретировать значения null как `\N`. Это означает, что символ табуляции должен кодироваться как `\t` (или `\` и символ табуляции). Например, в следующем запросе между `abc` и `123` находится реальный символ табуляции, и входная строка разделяется на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако если попытаться закодировать реальный символ табуляции с помощью `%09` в параметре URL, он не будет корректно разобран:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

При использовании параметров URL необходимо кодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## Предопределённый HTTP-интерфейс {#predefined_http_interface}

ClickHouse поддерживает выполнение специфических запросов через HTTP-интерфейс. Например, вы можете записать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает предопределённый HTTP-интерфейс, который упрощает интеграцию со сторонними инструментами, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Прежде всего, добавьте этот раздел в конфигурационный файл сервера.

Параметр `http_handlers` настраивается для содержания нескольких правил `rule`. ClickHouse сопоставляет полученные HTTP-запросы с предопределённым типом в `rule`, и первое совпавшее правило запускает обработчик. Затем ClickHouse выполняет соответствующий предопределённый запрос при успешном сопоставлении.

```yaml title="config.xml"
<http_handlers>
<rule>
<url>/predefined_query</url>
<methods>POST,GET</methods>
<handler>
<type>predefined_query_handler</type>
<query>SELECT * FROM system.metrics LIMIT 5 FORMAT Template SETTINGS format_template_resultset = 'prometheus_template_output_format_resultset', format_template_row = 'prometheus_template_output_format_row', format_template_rows_between_delimiter = '\n'</query>
</handler>
</rule>
<rule>...</rule>
<rule>...</rule>
</http_handlers>
```

Теперь вы можете напрямую запросить URL для получения данных в формате Prometheus:


```bash
$ curl -v 'http://localhost:8123/predefined_query'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /predefined_query HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Tue, 28 Apr 2020 08:52:56 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< X-ClickHouse-Server-Display-Name: i-mloy5trc
< Transfer-Encoding: chunked
< X-ClickHouse-Query-Id: 96fe0052-01e6-43ce-b12a-6b7370de6e8a
< X-ClickHouse-Format: Template
< X-ClickHouse-Timezone: Asia/Shanghai
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
# HELP "Query" "Number of executing queries"
# TYPE "Query" counter
"Query" 1
```


# HELP "Merge" "Количество выполняемых фоновых слияний"
# TYPE "Merge" counter
"Merge" 0



# HELP "PartMutation" "Количество мутаций (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0



# HELP "ReplicatedFetch" "Количество частей данных, загружаемых с реплики"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;Количество частей данных, отправляемых на реплики&quot;

# TYPE &quot;ReplicatedSend&quot; counter

&quot;ReplicatedSend&quot; 0

* Соединение №0 с хостом localhost осталось открытым

* Соединение №0 с хостом localhost осталось открытым

```

Параметры конфигурации для `http_handlers` работают следующим образом.

`rule` может настраивать следующие параметры:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

Каждый из них описан ниже:

- `method` отвечает за сопоставление метода HTTP-запроса. `method` полностью соответствует определению [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательный параметр конфигурации. Если он не определён в   
  конфигурационном файле, сопоставление метода HTTP-запроса не выполняется.

- `url` отвечает за сопоставление части URL (пути и строки запроса) HTTP-запроса.
  Если `url` имеет префикс `regex:`, ожидаются регулярные выражения [RE2](https://github.com/google/re2).
  Это необязательный параметр конфигурации. Если он не определён в конфигурационном файле, сопоставление части URL HTTP-запроса не выполняется.

- `full_url` аналогичен `url`, но включает полный URL, т. е. `schema://host:port/path?query_string`.
  Обратите внимание, что ClickHouse не поддерживает «виртуальные хосты», поэтому `host` является IP-адресом (а не значением заголовка `Host`).

- `empty_query_string` — гарантирует отсутствие строки запроса (`?query_string`) в запросе

- `headers` отвечает за сопоставление заголовков HTTP-запроса. Совместим с регулярными выражениями RE2. Это необязательный 
  параметр конфигурации. Если он не определён в конфигурационном файле, сопоставление заголовков HTTP-запроса не выполняется.

- `handler` содержит основную часть обработки.

  Может иметь следующие значения `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  И следующие параметры:
  - `query` — используется с типом `predefined_query_handler`, выполняет запрос при вызове обработчика.
  - `query_param_name` — используется с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в 
       параметрах HTTP-запроса.
  - `status` — используется с типом `static`, код статуса ответа.
  - `content_type` — используется с любым типом, [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) ответа.
  - `http_response_headers` — используется с любым типом, карта заголовков ответа. Также может использоваться для установки типа содержимого.
  - `response_content` — используется с типом `static`, содержимое ответа, отправляемое клиенту; при использовании префикса 'file://' или 'config://' содержимое 
    извлекается из файла или конфигурации и отправляется клиенту.
  - `user` — пользователь, от имени которого выполняется запрос (пользователь по умолчанию — `default`).
    **Примечание**: не требуется указывать пароль для этого пользователя.

Методы конфигурации для различных значений `type` рассматриваются далее.

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает установку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` представляет собой предопределённый запрос `predefined_query_handler`, который выполняется ClickHouse при совпадении HTTP-запроса, и возвращается результат запроса. Это обязательный параметр конфигурации.

Следующий пример определяет значения настроек [`max_threads`](../operations/settings/settings.md#max_threads) и [`max_final_threads`](/operations/settings/settings#max_final_threads), затем выполняет запрос к системной таблице для проверки успешной установки этих настроек.

:::note
Чтобы сохранить обработчики по умолчанию, такие как `query`, `play`, `ping`, добавьте правило `<defaults/>`.
:::

Например:
```


```yaml
<http_handlers>
<rule>
<url><![CDATA[regex:/query_param_with_url/(?P<name_1>[^/]+)]]></url>
<methods>GET</methods>
<headers>
<XXX>TEST_HEADER_VALUE</XXX>
<PARAMS_XXX><![CDATA[regex:(?P<name_2>[^/]+)]]></PARAMS_XXX>
</headers>
<handler>
<type>predefined_query_handler</type>
<query>
SELECT name, value FROM system.settings
WHERE name IN ({name_1:String}, {name_2:String})
</query>
</handler>
</rule>
<defaults/>
</http_handlers>
```

```bash
curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads    2
max_threads    1
```

:::note
В одном `predefined_query_handler` поддерживается только один запрос `query`.
:::

### dynamic_query_handler {#dynamic_query_handler}

В `dynamic_query_handler` запрос передается в виде параметра HTTP-запроса. Отличие от `predefined_query_handler` заключается в том, что в последнем запрос записывается в конфигурационном файле. В `dynamic_query_handler` можно настроить параметр `query_param_name`.

ClickHouse извлекает и выполняет значение, соответствующее `query_param_name` в URL HTTP-запроса. Значение по умолчанию для `query_param_name` — `/query`. Это необязательный параметр конфигурации. Если он не определен в конфигурационном файле, параметр не передается.

Для демонстрации этой функциональности в следующем примере задаются значения [`max_threads`](../operations/settings/settings.md#max_threads) и `max_final_threads`, а также проверяется, были ли настройки установлены успешно.

Пример:

```yaml
<http_handlers>
<rule>
<headers>
<XXX>TEST_HEADER_VALUE_DYNAMIC</XXX>    </headers>
<handler>
<type>dynamic_query_handler</type>
<query_param_name>query_param</query_param_name>
</handler>
</rule>
<defaults/>
</http_handlers>
```

```bash
curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```

### static {#static}

Обработчик `static` может возвращать [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. Параметр `response_content` позволяет вернуть указанное содержимое.

Например, чтобы вернуть сообщение «Say Hi!»:

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #highlight-next-line
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

Параметр `http_response_headers` можно использовать для установки типа содержимого вместо `content_type`.


```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                #begin-highlight
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #end-highlight
                <response_content>Привет!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

```bash
curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /hi HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 402 Payment Required
< Date: Wed, 29 Apr 2020 03:51:26 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

Получает содержимое из конфигурации, отправляемой клиенту.

```yaml
<get_config_static_handler><![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]></get_config_static_handler>

<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_config_static_handler</url>
            <handler>
                <type>static</type>
                <response_content>config://get_config_static_handler</response_content>
            </handler>
        </rule>
</http_handlers>
```

```bash
$ curl -v  -H 'XXX:xxx' 'http://localhost:8123/get_config_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_config_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:01:24 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

Чтобы найти содержимое файла, отправленного клиенту:


```yaml
<http_handlers>
<rule>
<methods>GET</methods>
<headers><XXX>xxx</XXX></headers>
<url>/get_absolute_path_static_handler</url>
<handler>
<type>static</type>
<content_type>text/html; charset=UTF-8</content_type>
<http_response_headers>
<ETag>737060cd8c284d8af7ad3082f209582d</ETag>
</http_response_headers>
<response_content>file:///absolute_path_file.html</response_content>
</handler>
</rule>
<rule>
<methods>GET</methods>
<headers><XXX>xxx</XXX></headers>
<url>/get_relative_path_static_handler</url>
<handler>
<type>static</type>
<content_type>text/html; charset=UTF-8</content_type>
<http_response_headers>
<ETag>737060cd8c284d8af7ad3082f209582d</ETag>
</http_response_headers>
<response_content>file://./relative_path_file.html</response_content>
</handler>
</rule>
</http_handlers>
```

```bash
$ user_files_path='/var/lib/clickhouse/user_files'
$ sudo echo "<html><body>Файл по относительному пути</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Файл по абсолютному пути</body></html>" > $user_files_path/absolute_path_file.html
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_absolute_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_absolute_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:16 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Файл по абсолютному пути</body></html>
* Connection #0 to host localhost left intact
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_relative_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_relative_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:31 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Файл по относительному пути</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` выполняет перенаправление `302` на адрес `location`

Например, так можно автоматически установить пользователя `play` для ClickHouse play:

```xml
<clickhouse>
    <http_handlers>
        <rule>
            <methods>GET</methods>
            <url>/play</url>
            <handler>
                <type>redirect</type>
                <location>/play?user=play</location>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP-заголовки ответа {#http-response-headers}

ClickHouse позволяет настраивать пользовательские HTTP-заголовки ответа, которые могут применяться к любому типу настраиваемого обработчика. Эти заголовки задаются с помощью параметра `http_response_headers`, который принимает пары ключ-значение, представляющие имена заголовков и их значения. Эта функция особенно полезна для реализации пользовательских заголовков безопасности, политик CORS или любых других требований к HTTP-заголовкам в HTTP-интерфейсе ClickHouse.

Например, можно настроить заголовки для:

- обычных конечных точек запросов;
- веб-интерфейса;
- проверки работоспособности.

Также можно указать `common_http_response_headers`. Они будут применяться ко всем HTTP-обработчикам, определенным в конфигурации.

Заголовки будут включены в HTTP-ответ для каждого настроенного обработчика.

В приведенном ниже примере каждый ответ сервера будет содержать два пользовательских заголовка: `X-My-Common-Header` и `X-My-Custom-Header`.

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>Common header</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>Custom indeed</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## Корректный JSON/XML-ответ при исключении во время HTTP-потоковой передачи {#valid-output-on-exception-http-streaming}

При выполнении запроса по HTTP может возникнуть исключение после того, как часть данных уже отправлена. Обычно исключение отправляется клиенту в виде обычного текста.
Даже если для вывода данных использовался определённый формат, вывод может стать некорректным с точки зрения этого формата.
Чтобы предотвратить это, можно использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (по умолчанию отключена), которая указывает ClickHouse записывать исключение в заданном формате (в настоящее время поддерживается для форматов XML и JSON\*).

Примеры:

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>3)+from+system.numbers+format+JSON+settings+max_block_size=1&http_write_exception_in_output_format=1'
{
    "meta":
    [
        {
            "name": "number",
            "type": "UInt64"
        },
        {
            "name": "throwIf(greater(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "number": "0",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "1",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "2",
            "throwIf(greater(number, 2))": 0
        }
    ],

    "rows": 3,

    "exception": "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)"
}
```

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>2)+from+system.numbers+format+XML+settings+max_block_size=1&http_write_exception_in_output_format=1'
<?xml version='1.0' encoding='UTF-8' ?>
<result>
    <meta>
        <columns>
            <column>
                <name>number</name>
                <type>UInt64</type>
            </column>
            <column>
                <name>throwIf(greater(number, 2))</name>
                <type>UInt8</type>
            </column>
        </columns>
    </meta>
    <data>
        <row>
            <number>0</number>
            <field>0</field>
        </row>
        <row>
            <number>1</number>
            <field>0</field>
        </row>
        <row>
            <number>2</number>
            <field>0</field>
        </row>
    </data>
    <rows>3</rows>
    <exception>Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)</exception>
</result>
```
