---
slug: '/interfaces/http'
sidebar_label: 'HTTP Интерфейс'
sidebar_position: 15
description: 'Документация для HTTP интерфейса в ClickHouse, который предоставляет'
title: 'HTTP Интерфейс'
doc_type: reference
---
import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP Интерфейс

## Предварительные требования {#prerequisites}

Для примеров в этой статье вам потребуется:
- работающий экземпляр сервера ClickHouse
- установленный `curl`. На Ubuntu или Debian выполните команду `sudo apt install curl` или обратитесь к этой [документации](https://curl.se/download.html) для инструкций по установке.

## Обзор {#overview}

HTTP интерфейс позволяет использовать ClickHouse на любой платформе с любого языка программирования в форме REST API. HTTP интерфейс более ограничен, чем нативный интерфейс, но имеет лучшую поддержку языков.

По умолчанию `clickhouse-server` слушает на следующих портах:
- порт 8123 для HTTP
- порт 8443 для HTTPS, который можно включить

Если вы сделаете запрос `GET /` без параметров, будет возвращен код ответа 200 вместе со строкой "Ok.":

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." — это значение по умолчанию, определенное в [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) и его можно изменить при желании.

См. также: [Предостережения по кодам ответа HTTP](#http_response_codes_caveats).

## Веб-интерфейс {#web-ui}

ClickHouse включает веб-интерфейс, к которому можно получить доступ по следующему адресу:

```text
http://localhost:8123/play
```

Веб UI поддерживает отображение прогресса во время выполнения запроса, отмену запросов и потоковую передачу результатов.
Он имеет секретную функцию для отображения графиков и диаграмм для конвейеров запросов.

Веб UI разработан для профессионалов, таких как вы.

<Image img={PlayUI} size="md" alt="Скриншот веб-интерфейса ClickHouse" />

В скриптах проверки состояния используйте запрос `GET /ping`. Этот обработчик всегда возвращает "Ok." (с переводом строки в конце). Доступно с версии 18.12.13. Также смотрите `/replicas_status`, чтобы проверить задержку реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

## Выполнение запросов через HTTP/HTTPS {#querying}

Для выполнения запросов через HTTP/HTTPS есть три варианта:
- отправить запрос в качестве параметра URL 'query'
- используя метод POST.
- Отправить начало запроса в параметре 'query', а остальное с помощью POST

:::note
Размер URL по умолчанию ограничен 1 MiB, это можно изменить с помощью настройки `http_max_uri_size`.
:::

Если запрос выполнен успешно, вы получите код ответа 200 и результат в теле ответа.
Если произошла ошибка, вы получите код ответа 500 и текст описания ошибки в теле ответа.

Запросы с использованием GET являются 'только для чтения'. Это означает, что для запросов, которые изменяют данные, вы можете использовать только метод POST. 
Вы можете отправить сам запрос либо в теле POST, либо в параметре URL. Рассмотрим некоторые примеры.

В следующем примере используется curl для отправки запроса `SELECT 1`. Обратите внимание на использование URL кодирования для пробела: `%20`.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

В этом примере используется wget с параметрами `-nv` (неподробный) и `-O-`, чтобы вывести результат в терминал.
В этом случае не обязательно использовать URL кодирование для пробела:

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

```response title="response"
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

Как видите, команда `curl` несколько неудобна, поскольку пробелы необходимо экранировать в URL.
Хотя `wget` сам экранирует все, мы не рекомендуем использовать его, так как он плохо работает через HTTP 1.1 при использовании keep-alive и Transfer-Encoding: chunked.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса отправляется в параметре, а часть в POST, между этими двумя частями данных вставляется перевод строки.
Например, это не сработает:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в формате [`TabSeparated`](formats.md#tabseparated).

В запросе используется оператор `FORMAT`, чтобы запросить любой другой формат. Например:

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

Вы можете использовать параметр URL `default_format` или заголовок `X-ClickHouse-Format`, чтобы указать формат по умолчанию, отличный от `TabSeparated`.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

Вы можете использовать метод POST с параметризованными запросами. Параметры задаются с помощью фигурных скобок с именем параметра и типом, например, `{name:Type}`. Значения параметров передаются с помощью `param_name`:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```

## Запросы на вставку через HTTP/HTTPS {#insert-queries}

Метод `POST` для передачи данных необходим для запросов `INSERT`. В этом случае вы можете написать начало запроса в параметре URL и использовать POST для передачи данных для вставки. Данные для вставки могут быть, например, дампом с разделением табуляцией из MySQL. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.

### Примеры {#examples}

Чтобы создать таблицу:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

Чтобы использовать знакомый запрос `INSERT` для вставки данных:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

Чтобы отправить данные отдельно от запроса:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

Можно указать любой формат данных. Например, можно указать формат 'Values', который совпадает с форматом, используемым при записи `INSERT INTO t VALUES`:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из дампа с разделением табуляцией, укажите соответствующий формат:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

Чтобы прочитать содержимое таблицы:

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
Данные выводятся в случайном порядке из-за параллельной обработки запросов
:::

Чтобы удалить таблицу:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

Для успешных запросов, которые не возвращают таблицу данных, возвращается пустое тело ответа.

## Сжатие {#compression}

Сжатие можно использовать для уменьшения сетевого трафика при передаче большого объема данных или для создания дампов, которые немедленно сжимаются.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и вам понадобится программа `clickhouse-compressor` для работы с ними. Она устанавливается по умолчанию вместе с пакетом `clickhouse-client`. 

Чтобы повысить эффективность вставки данных, отключите проверку контрольной суммы на стороне сервера, используя настройку [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер будет сжимать данные, которые он отправляет вам. Если вы укажете `decompress=1` в URL, сервер разожмет данные, которые вы передадите с помощью метода POST.

Также можно выбрать использование [HTTP-сжатия](https://en.wikipedia.org/wiki/HTTP_compression). ClickHouse поддерживает следующие [методы сжатия](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

Чтобы отправить сжатый запрос `POST`, добавьте заголовок запроса `Content-Encoding: compression_method`.

Чтобы ClickHouse сжимал ответ, включите сжатие с помощью настройки [`enable_http_compression`](../operations/settings/settings.md#enable_http_compression) и добавьте заголовок `Accept-Encoding: compression_method` в запрос. 

Вы можете настроить уровень сжатия данных, используя настройку [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут по умолчанию разжимать данные от сервера (с `gzip` и `deflate`), и вы можете получить разжатые данные, даже если используете настройки сжатия правильно.
:::

## Примеры {#examples-compression}

Чтобы отправить сжатые данные на сервер:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

Чтобы получить сжатый архив данных от сервера:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

Чтобы получить сжатые данные от сервера, используя gunzip для получения разжатых данных:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## База данных по умолчанию {#default-database}

Вы можете использовать параметр URL `database` или заголовок `X-ClickHouse-Database`, чтобы указать базу данных по умолчанию.

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

По умолчанию используется база данных, зарегистрированная в настройках сервера. В "наборе" это база данных с именем `default`. В качестве альтернативы вы всегда можете указать базу данных, используя точку перед именем таблицы.

## Аутентификация {#authentication}

Имя пользователя и пароль можно указать тремя способами:

1. Используя HTTP Basic Authentication.

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В параметрах URL `user` и `password`

:::warning
Мы не рекомендуем использовать этот метод, так как параметр может быть зафиксирован веб-прокси и закэширован в браузере
:::

Например:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. Используя заголовки 'X-ClickHouse-User' и 'X-ClickHouse-Key'

Например:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

Если имя пользователя не указано, используется имя `default`. Если пароль не указан, используется пустой пароль.
Вы также можете использовать параметры URL для указания любых настроек для обработки единичного запроса или целых профилей настроек. 

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

Для получения дополнительной информации смотрите:
- [Настройки](/operations/settings/settings)
- [SET](/sql-reference/statements/set)

## Использование сессий ClickHouse в HTTP протоколе {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сессии ClickHouse в HTTP протоколе. Для этого вам нужно добавить параметр `session_id` `GET` к запросу. Вы можете использовать любую строку в качестве идентификатора сессии. 

По умолчанию сессия завершается после 60 секунд бездействия. Чтобы изменить этот тайм-аут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте параметр `session_timeout` `GET` к запросу. 

Чтобы проверить статус сессии, используйте параметр `session_check=1`. Внутри одной сессии можно выполнить только один запрос за раз.

Вы можете получить информацию о прогрессе запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers). 

Ниже приведен пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

Возможные поля заголовка:

| Поле заголовка       | Описание                          |
|----------------------|-----------------------------------|
| `read_rows`          | Количество прочитанных строк.     |
| `read_bytes`         | Объем прочитанных данных в байтах. |
| `total_rows_to_read` | Общее количество строк для чтения. |
| `written_rows`       | Количество записанных строк.      |
| `written_bytes`      | Объем записанных данных в байтах.  |

Запущенные запросы не останавливаются автоматически, если HTTP-соединение потеряно. Парсинг и форматирование данных выполняются на стороне сервера, и использование сети может быть неэффективным.

Существуют следующие дополнительные параметры:

| Параметры             | Описание                                |
|-----------------------|-----------------------------------------|
| `query_id` (необязательный) | Могут быть переданы в качестве ID запроса (любая строка). [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (необязательный) | Могут быть переданы в качестве ключа квоты (любая строка). ["Квоты"](/operations/quotas) |

HTTP интерфейс позволяет передавать внешние данные (внешние временные таблицы) для выполнения запросов. Для получения дополнительной информации смотрите ["Внешние данные для обработки запросов"](/engines/table-engines/special/external-data).

## Буферизация ответов {#response-buffering}

Буферизация ответов может быть включена на стороне сервера. Для этой цели предусмотрены следующие параметры URL:
- `buffer_size`
-  `wait_end_of_query`

Можно использовать следующие настройки:
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` определяет количество байтов в результате, которые должны быть буферизованы в памяти сервера. Если тело результата больше этого порога, буфер записывается в HTTP-канал, а оставшиеся данные отправляются непосредственно в HTTP-канал.

Чтобы убедиться, что весь ответ буферизован, установите `wait_end_of_query=1`. В этом случае данные, которые не хранятся в памяти, будут буферизованы во временном файле сервера.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после того, как код ответа и HTTP заголовки были отправлены клиенту. В этой ситуации сообщение об ошибке записывается в конце тела ответа, и на стороне клиента ошибка может быть обнаружена только на этапе парсинга.
:::

## Установка роли с помощью параметров запроса {#setting-role-with-query-parameters}

Эта функция была добавлена в ClickHouse 24.4.

В определенных сценариях может потребоваться сначала установить предоставленную роль перед выполнением самого выражения.
Однако невозможно отправить `SET ROLE` и выражение вместе, так как многозначные выражения не разрешены:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Команда выше приводит к ошибке:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

Чтобы обойти это ограничение, вместо этого используйте параметр запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это эквивалентно выполнению `SET ROLE my_role` перед выражением.

Кроме того, вы можете указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед выражением.

## Предостережения по кодам ответа HTTP {#http_response_codes_caveats}

Из-за ограничений протокола HTTP код ответа HTTP 200 не гарантирует, что запрос был успешным.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения заключается в природе протокола HTTP. Заголовок HTTP отправляется первым с кодом HTTP 200, за ним следует тело HTTP, а затем ошибка вводится в тело в виде простого текста.

Это поведение независимо от используемого формата, будь то `Native`, `TSV` или `JSON`; сообщение об ошибке всегда будет находиться в середине потока ответа.

Вы можете смягчить эту проблему, включив `wait_end_of_query=1` ([Буферизация ответов](#response-buffering)). В этом случае отправка заголовка HTTP откладывается до тех пор, пока весь запрос не будет разрешен. Однако это не полностью решает проблему, поскольку результат должен по-прежнему помещаться в пределах [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size), и другие настройки, такие как [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers), могут помешать задержке заголовка.

:::tip
Единственный способ поймать все ошибки — это проанализировать тело HTTP до его парсинга с использованием требуемого формата.
:::

## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения для них из соответствующих параметров HTTP-запроса. Для получения дополнительной информации смотрите [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).

### Пример {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### Закладки в параметрах URL {#tabs-in-url-parameters}

Параметры запроса разбираются из "экранированного" формата. Это имеет некоторые преимущества, такие как возможность однозначно разбирать нули как `\N`. Это означает, что символ табуляции должен кодироваться как `\t` (или `\` и табуляция). Например, следующее содержит фактическую табуляцию между `abc` и `123`, и входная строка разбивается на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако, если вы попытаетесь закодировать фактическую табуляцию, используя `%09` в параметре URL, она не будет правильно разобрана:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

Если вы используете параметры URL, вам нужно будет закодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```

## Предопределенный HTTP интерфейс {#predefined_http_interface}

ClickHouse поддерживает определенные запросы через HTTP интерфейс. Например, вы можете записывать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает предопределенный HTTP интерфейс, который может помочь вам легче интегрироваться с инструментами третьих сторон, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Прежде всего, добавьте этот раздел в файл конфигурации вашего сервера.

`http_handlers` настроен для содержать несколько `rule`. ClickHouse будет сопоставлять полученные HTTP запросы с предопределенным типом в `rule`, и первое совпадение запускает обработчик. Затем ClickHouse выполнит соответствующий предопределенный запрос, если совпадение будет успешным.

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

Теперь вы можете запросить URL напрямую для данных в формате Prometheus:

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<

# HELP "Query" "Number of executing queries"

# TYPE "Query" counter
"Query" 1


# HELP "Merge" "Number of executing background merges"

# TYPE "Merge" counter
"Merge" 0


# HELP "PartMutation" "Number of mutations (ALTER DELETE/UPDATE)"

# TYPE "PartMutation" counter
"PartMutation" 0


# HELP "ReplicatedFetch" "Number of data parts being fetched from replica"

# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0


# HELP "ReplicatedSend" "Number of data parts being sent to replicas"

# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

Опции конфигурации для `http_handlers` работают следующим образом.

`rule` может настраивать следующие параметры:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

Каждый из них обсуждается ниже:

- `method` отвечает за сопоставление части метода HTTP запроса. `method` полностью соответствует определению [`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательная конфигурация. Если она не определена в файле конфигурации, методовой части HTTP запроса не будет соответствовать.

- `url` отвечает за сопоставление части URL (пути и строки запроса) HTTP запроса.
  Если `url` имеет префикс `regex:`, ожидаются регулярные выражения [RE2](https://github.com/google/re2).
  Это необязательная конфигурация. Если она не определена в файле конфигурации, URL части HTTP запроса не будет соответствовать.

- `full_url` так же, как `url`, но включает полный URL, т.е. `schema://host:port/path?query_string`.
  Обратите внимание, что ClickHouse не поддерживает "виртуальные хосты", поэтому `host` является IP-адресом (а не значением заголовка `Host`).

- `empty_query_string` - обеспечивает отсутствие строки запроса (`?query_string`) в запросе.

- `headers` отвечают за сопоставление заголовочной части HTTP запроса. Они совместимы с регулярными выражениями RE2. Это необязательная конфигурация. Если она не определена в файле конфигурации, заголовочной части HTTP запроса не будет соответствовать.

- `handler` содержит основную часть обработки.

  Он может иметь следующий `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  А также следующие параметры:
  - `query` — используйте с типом `predefined_query_handler`, выполняет запрос, когда вызывается обработчик.
  - `query_param_name` — используйте с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в параметрах HTTP-запроса.
  - `status` — используйте с типом `static`, код состояния ответа.
  - `content_type` — используйте с любым типом, [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) ответа.
  - `http_response_headers` — используйте с любым типом, карта заголовков ответа. Также может быть использована для установки типа содержимого.
  - `response_content` — используйте с типом `static`, контент ответа, отправленного клиенту, при использовании префиксов 'file://' или 'config://', находите контент из файла или конфигурации, отправляемый клиенту.
  - `user` - пользователь для выполнения запроса (пользователь по умолчанию - `default`).
    **Примечание**, вам не нужно указывать пароль для этого пользователя.

Методы конфигурации для различных `type` обсуждаются далее.

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает настройку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` - это предопределенный запрос `predefined_query_handler`, который выполняется ClickHouse, когда HTTP запрос совпадает, и результат запроса возвращается. Этот параметр обязателен.

Следующий пример определяет значения настройки [`max_threads`](../operations/settings/settings.md#max_threads) и [`max_final_threads`](/operations/settings/settings#max_final_threads), затем проверяет системную таблицу, чтобы выяснить, были ли эти настройки установлены успешно.

:::note
Чтобы сохранить настройки по умолчанию, такие как `query`, `play`,` ping`, добавьте правило `<defaults/>`.
:::

Например:

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
В одном `predefined_query_handler` поддерживается только один `query`.
:::

### dynamic_query_handler {#dynamic_query_handler}

В `dynamic_query_handler` запрос записан в виде параметра HTTP запроса. Разница в том, что в `predefined_query_handler` запрос записан в файле конфигурации. `query_param_name` можно настроить в `dynamic_query_handler`.

ClickHouse извлекает и выполняет значение, соответствующее значению `query_param_name` в URL HTTP запроса. Значение по умолчанию для `query_param_name` — `/query`. Это необязательная конфигурация. Если в файле конфигурации нет определения, параметр не передается.

Чтобы поэкспериментировать с этой функциональностью, следующий пример определяет значения [`max_threads`](../operations/settings/settings.md#max_threads) и `max_final_threads` и проверяет, были ли настройки заданы успешно.

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

`static` может возвращать [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` может вернуть указанный контент.

Например, чтобы вернуть сообщение "Скажи Привет!":

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

`http_response_headers` могут быть использованы для установки типа содержимого вместо `content_type`.

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
                <response_content>Say Hi!</response_content>
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

Найдите контент из конфигурации и отправьте клиенту.

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

Чтобы найти контент из файла и отправить клиенту:

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
$ sudo echo "<html><body>Relative Path File</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Absolute Path File</body></html>" > $user_files_path/absolute_path_file.html
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
<html><body>Absolute Path File</body></html>
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` выполнит перенаправление `302` на `location`

Например, вот как вы можете автоматически добавить установленного пользователя в `play` для ClickHouse play:

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

## HTTP заголовки ответа {#http-response-headers}

ClickHouse позволяет настраивать пользовательские заголовки HTTP ответа, которые могут быть применены к любому типу обработчика, который можно настроить. Эти заголовки можно установить с помощью настройки `http_response_headers`, которая принимает пары ключ-значение, представляющие названия заголовков и их значения. Эта функция особенно полезна для реализации пользовательских заголовков безопасности, политики CORS или любых других требований к заголовкам HTTP через ваш интерфейс HTTP ClickHouse.

Например, вы можете настроить заголовки для:
- Обычных конечных точек запросов
- Веб UI
- Проверки состояния.

Также можно указать `common_http_response_headers`. Они будут применяться ко всем http обработчикам, определенным в конфигурации.

Заголовки будут включаться в HTTP ответ для каждого настроенного обработчика.

В следующем примере каждый ответ сервера будет содержать два пользовательских заголовка: `X-My-Common-Header` и `X-My-Custom-Header`.

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

## Валидный JSON/XML ответ при исключении во время HTTP потоковой передачи {#valid-output-on-exception-http-streaming}

Во время выполнения запроса через HTTP может произойти исключение, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в чистом виде.
Даже если был использован какой-то специфический формат данных для вывода данных, выход может стать недействительным с точки зрения указанного формата данных.
Чтобы предотвратить это, вы можете использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (включена по умолчанию), которая указывает ClickHouse записывать исключение в указанном формате (в настоящее время поддерживается для форматов XML и JSON*).

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