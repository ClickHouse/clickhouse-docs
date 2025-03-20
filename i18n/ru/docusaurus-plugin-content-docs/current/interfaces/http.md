---
slug: /interfaces/http
sidebar_position: 19
sidebar_label: HTTP Интерфейс
---

import PlayUI from '@site/static/images/play.png';

# HTTP Интерфейс

HTTP интерфейс позволяет вам использовать ClickHouse на любой платформе с любого языка программирования в виде REST API. HTTP интерфейс более ограничен по сравнению с нативным интерфейсом, но поддерживает больше языков.

По умолчанию, `clickhouse-server` слушает HTTP на порту 8123 (это можно изменить в конфигурации). HTTPS также может быть включен по умолчанию на порту 8443.

Если вы отправите `GET /` запрос без параметров, он вернет код ответа 200 и строку, определенную в [http_server_default_response](../operations/server-configuration-parameters/settings.md#http_server_default_response) с значением по умолчанию "Ok." (с переводом строки в конце)

``` bash
$ curl 'http://localhost:8123/'
Ok.
```

Также смотрите: [Проблемы с кодами ответа HTTP](#http_response_codes_caveats).

Иногда команда `curl` не доступна в операционных системах пользователей. На Ubuntu или Debian выполните `sudo apt install curl`. Пожалуйста, обратитесь к этой [документации](https://curl.se/download.html) для установки перед выполнением примеров.

Веб UI доступен здесь: `http://localhost:8123/play`.

Веб UI поддерживает отображение прогресса во время выполнения запроса, отмену запроса и потоковую передачу результатов.
У него есть секретная функция для отображения графиков и диаграмм для потоков запросов.

Веб UI предназначен для профессионалов, таких как вы.

<img src={PlayUI} alt="Скриншот ClickHouse Web UI" />

В скриптах проверки состояния используйте запрос `GET /ping`. Этот обработчик всегда возвращает "Ok." (с переводом строки в конце). Доступен с версии 18.12.13. Также смотрите `/replicas_status` для проверки задержки реплики.

``` bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

Отправьте запрос как параметр URL 'query' или как POST. Или отправьте начало запроса в параметре 'query', а остальную часть в POST (позже мы объясним, почему это необходимо). Размер URL по умолчанию ограничен 1 МиБ, это можно изменить с помощью параметра `http_max_uri_size`.

В случае успеха вы получите код ответа 200 и результат в теле ответа.
Если произошла ошибка, вы получите код ответа 500 и текст описания ошибки в теле ответа.

При использовании метода GET, установлен параметр 'readonly'. Другими словами, для запросов, которые модифицируют данные, вы можете использовать только метод POST. Вы можете отправить сам запрос либо в теле POST, либо в параметре URL.

Примеры:

``` bash
$ curl 'http://localhost:8123/?query=SELECT%201'
1

$ wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
1

$ echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

Как вы можете видеть, `curl` неудобен в том, что пробелы должны быть закодированы в URL.
Хотя `wget` сам все кодирует, мы не рекомендуем его использование, так как он плохо работает по HTTP 1.1 при использовании keep-alive и Transfer-Encoding: chunked.

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса отправляется в параметре, а часть в POST, между этими двумя частями данных будет вставлен перевод строки.
Пример (это не будет работать):

``` bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в [TabSeparated](formats.md#tabseparated) формате.

Вы можете использовать условие FORMAT в запросе для запроса любого другого формата.

Кроме того, вы можете использовать параметр URL 'default_format' или заголовок 'X-ClickHouse-Format' для указания формата по умолчанию, отличного от TabSeparated.

``` bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

Метод POST передачи данных необходим для запросов `INSERT`. В этом случае вы можете написать начало запроса в параметре URL и использовать POST для передачи данных для вставки. Данные для вставки могут быть, например, табличный дамп от MySQL. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.

**Примеры**

Создание таблицы:

``` bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

Используя знакомый запрос INSERT для вставки данных:

``` bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

Данные могут быть отправлены отдельно от запроса:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

Вы можете указать любой формат данных. Формат 'Values' такой же, как при записи INSERT INTO t VALUES:

``` bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из табличного дампа, укажите соответствующий формат:

``` bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

Чтение содержимого таблицы. Данные выводятся в случайном порядке из-за параллельной обработки запросов:

``` bash
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

Удаление таблицы.

``` bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

Для успешных запросов, которые не возвращают таблицу данных, возвращается пустое тело ответа.
## Сжатие {#compression}

Вы можете использовать сжатие для уменьшения сетевого трафика при передаче большого объема данных или для создания дампов, которые сразу же сжаты.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и вам нужна программа `clickhouse-compressor`, чтобы с ней работать. Она устанавливается вместе с пакетом `clickhouse-client`. Чтобы увеличить эффективность вставки данных, вы можете отключить проверку контрольной суммы на стороне сервера, используя параметр [http_native_compression_disable_checksumming_on_decompress](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер будет сжимать данные, которые он вам отправляет. Если вы укажете `decompress=1` в URL, сервер будет декомпрессировать данные, которые вы передаете методом `POST`.

Вы также можете использовать [HTTP-сжатие](https://en.wikipedia.org/wiki/HTTP_compression). ClickHouse поддерживает следующие [методы сжатия](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

Чтобы отправить сжатый запрос `POST`, добавьте заголовок запроса `Content-Encoding: compression_method`.
Для того, чтобы ClickHouse сжимал ответ, включите сжатие с помощью параметра [enable_http_compression](../operations/settings/settings.md#enable_http_compression) и добавьте заголовок `Accept-Encoding: compression_method` к запросу. Вы можете настроить уровень сжатия данных в параметре [http_zlib_compression_level](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут по умолчанию декомпрессировать данные от сервера (с `gzip` и `deflate`) и вы можете получить декомпрессированные данные, даже если вы правильно используете параметры сжатия.
:::

**Примеры**

``` bash

# Отправка сжатых данных на сервер
$ echo "SELECT 1" | gzip -c | \
  curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

``` bash

# Получение сжатого архива данных от сервера
$ curl -vsS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'
$ zcat result.gz
0
1
2
```

```bash

# Получение сжатых данных от сервера и использование gunzip для получения декомпрессированных данных
$ curl -sS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## База данных по умолчанию {#default-database}

Вы можете использовать параметр URL 'database' или заголовок 'X-ClickHouse-Database' для указания базы данных по умолчанию.

``` bash
$ echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
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

По умолчанию база данных, зарегистрированная в настройках сервера, используется в качестве базы данных по умолчанию. По умолчанию это база данных с названием 'default'. Альтернативно, вы всегда можете указать базу данных, используя точку перед именем таблицы.

Имя пользователя и пароль могут быть указаны одним из трех способов:

1.  Используя HTTP Basic Authentication. Пример:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2.  В параметрах URL 'user' и 'password' (*Мы не рекомендуем использовать этот метод, так как параметр может быть зарегистрирован веб-прокси и кэширован в браузере*). Пример:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3.  Используя заголовки 'X-ClickHouse-User' и 'X-ClickHouse-Key'. Пример:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

Если имя пользователя не указано, используется имя `default`. Если пароль не указан, используется пустой пароль.
Вы также можете использовать параметры URL для указания любых настроек для обработки одного запроса или целых профилей настроек. Пример: http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1

Для получения дополнительной информации смотрите раздел [Настройки](/operations/settings/settings).

``` bash
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

Для информации о других параметрах см. раздел "SET".
## Использование сессий ClickHouse в HTTP протоколе {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сессии ClickHouse в HTTP протоколе. Для этого нужно добавить параметр GET `session_id` к запросу. Вы можете использовать любую строку в качестве идентификатора сессии. По умолчанию сессия завершается через 60 секунд неактивности. Чтобы изменить этот таймаут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте параметр GET `session_timeout` к запросу. Чтобы проверить статус сессии, используйте параметр `session_check=1`. Внутри одной сессии можно выполнять только один запрос одновременно.

Вы можете получить информацию о прогрессе запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [send_progress_in_http_headers](../operations/settings/settings.md#send_progress_in_http_headers). Пример последовательности заголовков:

``` text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

Возможные поля заголовка:

- `read_rows` — Количество прочитанных строк.
- `read_bytes` — Объем загруженных данных в байтах.
- `total_rows_to_read` — Общее количество строк, которые необходимо прочитать.
- `written_rows` — Количество записанных строк.
- `written_bytes` — Объем записанных данных в байтах.

Запущенные запросы не останавливаются автоматически, если соединение HTTP потеряно. Парсинг и форматирование данных выполняются на стороне сервера, и использование сети может быть неэффективным.
Необязательный параметр 'query_id' может быть передан как идентификатор запроса (любая строка). Для получения дополнительной информации смотрите раздел "Настройки, replace_running_query".

Необязательный параметр 'quota_key' может быть передан как ключ квоты (любая строка). Для получения дополнительной информации смотрите раздел "Квоты".

HTTP интерфейс позволяет передавать внешние данные (временные таблицы) для обработки запросов. Для получения дополнительной информации смотрите раздел "Внешние данные для обработки запросов".
## Буфферизация ответов {#response-buffering}

Вы можете включить буферизацию ответов на стороне сервера. Для этой цели предусмотрены параметры URL `buffer_size` и `wait_end_of_query`.
Также могут использоваться параметры `http_response_buffer_size` и `http_wait_end_of_query`.

`buffer_size` определяет количество байтов в результате, которое будет буферизовано в памяти сервера. Если тело результата больше этого порога, буфер записывается в HTTP-канал, а оставшиеся данные отправляются напрямую в HTTP-канал.

Чтобы гарантировать, что весь ответ будет буферизирован, установите `wait_end_of_query=1`. В этом случае данные, которые не хранятся в памяти, будут буферизованы во временном файле на сервере.

Пример:

``` bash
$ curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

Используйте буферизацию, чтобы избежать ситуаций, в которых ошибка обработки запроса произошла после того, как код ответа и HTTP-заголовки были отправлены клиенту. В этой ситуации сообщение об ошибке записывается в конце тела ответа, и на стороне клиента ошибка может быть выявлена только на этапе парсинга.
## Установка роли с параметрами запроса {#setting-role-with-query-parameters}

Это новая функция, добавленная в ClickHouse 24.4.

В определенных сценариях может потребоваться сначала установить предоставленную роль перед выполнением самого оператора.
Однако невозможно отправить `SET ROLE` и оператор вместе, так как многооператоры не допускаются:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

В результате будет ошибка:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

Чтобы преодолеть это ограничение, вы можете использовать параметр запроса `role` вместо:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это будет эквивалентно выполнению `SET ROLE my_role` перед оператором.

Кроме того, можно указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед оператором.
## Проблемы с кодами ответа HTTP {#http_response_codes_caveats}

Из-за ограничений протокола HTTP, код ответа HTTP 200 не гарантирует, что запрос был успешным.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения заключается в сути протокола HTTP. Сначала отправляются HTTP-заголовок с кодом 200, затем тело HTTP, и ошибка вставляется в тело как простой текст.
Это поведение независимо от использованного формата, будь то `Native`, `TSV` или `JSON`; сообщение об ошибке всегда будет в середине потока ответа.
Вы можете смягчить эту проблему, включив `wait_end_of_query=1` ([Буфферизация ответов](#response-buffering)). В этом случае отправка заголовка HTTP задерживается до полного завершения запроса.
Однако это не решает проблему полностью, так как результат все еще должен помещаться в `http_response_buffer_size`, и другие настройки, такие как `send_progress_in_http_headers`, могут помешать задержке заголовка.
Единственный способ поймать все ошибки — проанализировать тело HTTP до его парсинга с использованием требуемого формата.
## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения для них из соответствующих параметров HTTP-запроса. Для получения дополнительной информации смотрите [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).
### Пример {#example}

``` bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### Табуляция в URL параметрах {#tabs-in-url-parameters}

Параметры запроса анализируются из "кодуемого" формата. Это имеет некоторые преимущества, такие как возможность однозначного анализа null как `\N`. Это означает, что символ табуляции должен быть закодирован как `\t` (или `\` и табуляция). Например, следующее содержит фактическую табуляцию между `abc` и `123`, и входная строка разбивается на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако если вы попытаетесь закодировать фактическую табуляцию, используя `%09` в параметре URL, она не будет правильно проанализирована:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc	123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

Если вы используете параметры URL, вам нужно будет закодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## Предопределенный HTTP интерфейс {#predefined_http_interface}

ClickHouse поддерживает специфические запросы через HTTP интерфейс. Например, вы можете записывать данные в таблицу следующим образом:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает Предопределенный HTTP интерфейс, который может помочь вам легче интегрироваться с сторонними инструментами, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter).

Пример:

- Прежде всего, добавьте этот раздел в файл конфигурации сервера:

<!-- -->

``` xml
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

- Теперь вы можете запрашивать URL напрямую для получения данных в формате Prometheus:

<!-- -->

``` bash
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

Как видно из примера, если `http_handlers` настроен в файле config.xml и `http_handlers` может содержать много `правил`. ClickHouse будет сопоставлять полученные HTTP-запросы с предопределенным типом в `rule`, и первое совпавшее запустит обработчик. Затем ClickHouse выполнит соответствующий предопределенный запрос, если совпадение будет успешным.

Теперь `rule` может настраивать `method`, `headers`, `url`, `handler`:
- `method` отвечает за сопоставление части метода HTTP запроса. `method` полностью соответствует определению [метода](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательная конфигурация. Если она не определена в файле конфигурации, она не сопоставляет часть метода HTTP запроса.

- `url` отвечает за сопоставление части URL HTTP запроса. Он совместим с регулярными выражениями [RE2](https://github.com/google/re2). Это необязательная конфигурация. Если она не определена в файле конфигурации, она не сопоставляет часть URL HTTP запроса.

- `headers` отвечают за сопоставление части заголовка HTTP запроса. Он совместим с регулярными выражениями RE2. Это необязательная конфигурация. Если она не определена в файле конфигурации, она не сопоставляет часть заголовка HTTP запроса.

- `handler` содержит основную часть обработки. Теперь `handler` может настраивать `type`, `status`, `content_type`, `http_response_headers`, `response_content`, `query`, `query_param_name`.
    `type` в настоящее время поддерживает три типа: [predefined_query_handler](#predefined_query_handler), [dynamic_query_handler](#dynamic_query_handler), [static](#static).

    - `query` — используется с типом `predefined_query_handler`, выполняет запрос, когда вызывается обработчик.

    - `query_param_name` — используется с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в параметрах HTTP запроса.

    - `status` — используется с типом `static`, код статуса ответа.

    - `content_type` — используется с любым типом, заголовок [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).

    - `http_response_headers` — используется с любым типом, карта заголовков ответа. Может использоваться для установки типа контента.

    - `response_content` — используется с типом `static`, контент ответа отправляется клиенту, при использовании префикса 'file://' или 'config://', ищите контент из файла или конфигурации, отправьте клиенту.

Далее сертификаты конфигурации для разных `type`.
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает установку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` — это заранее определенный запрос типа `predefined_query_handler`, который выполняется ClickHouse, когда запрос HTTP совпадает, и результат запроса возвращается. Это обязательная конфигурация.

Следующий пример определяет значения параметров [max_threads](../operations/settings/settings.md#max_threads) и `max_final_threads`, затем запрашивает системную таблицу, чтобы проверить, были ли настройки успешно установлены.

:::note
Чтобы сохранить стандартные `handlers`, такие как `query`, `play`, `ping`, добавьте правило `<defaults/>`.
:::

Пример:

``` xml
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

``` bash
$ curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads	2
max_threads	1
```

:::note
В одном `predefined_query_handler` поддерживается только один `query`.
:::
### dynamic_query_handler {#dynamic_query_handler}

В `dynamic_query_handler` запрос записан в виде параметра HTTP запроса. Разница в том, что в `predefined_query_handler` запрос записан в файле конфигурации. Вы можете настроить `query_param_name` в `dynamic_query_handler`.

ClickHouse извлекает и выполняет значение, соответствующее `query_param_name` в URL HTTP запроса. Значение по умолчанию для `query_param_name` — `/query`. Это необязательная конфигурация. Если в файле конфигурации нет определения, параметр не передается.

Чтобы поэкспериментировать с этой функциональностью, в примере определяются значения [max_threads](../operations/settings/settings.md#max_threads) и `max_final_threads`, и запросы, проверяющие, были ли успешно установлены настройки.

Пример:

``` xml
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

``` bash
$ curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```
### static {#static}

`static` может возвращать [content_type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` может возвращать указанный контент.

Пример:

Возвращение сообщения.

``` xml
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
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

`http_response_headers` может быть использован для установки типа контента вместо `content_type`.

``` xml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

``` bash
$ curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
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

Найдите контент из конфигурации, отправленный клиенту.

``` xml
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

``` bash
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

Найдите контент из файла, отправленный клиенту.

``` xml
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

``` bash
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
## Валидный JSON/XML ответ при исключении во время HTTP потоковой передачи {#valid-output-on-exception-http-streaming}

Во время выполнения запроса через HTTP может возникнуть исключение, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в виде обычного текста, даже если для вывода данных использовался некоторый специфический формат данных, и вывод может стать недействительным с точки зрения указанного формата данных. Чтобы предотвратить это, вы можете использовать настройку `http_write_exception_in_output_format` (включена по умолчанию), которая скажет ClickHouse записать исключение в указанном формате (в настоящее время поддерживается для форматов XML и JSON*).

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
