---
description: 'Документация для HTTP интерфейса в ClickHouse, который предоставляет доступ к API REST для ClickHouse с любой платформы и любого языка программирования'
sidebar_label: 'HTTP Интерфейс'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP Интерфейс'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';

# HTTP Интерфейс
## Предварительные требования {#prerequisites}

Для примеров в этой статье вам потребуется:
- работающий экземпляр сервера ClickHouse
- установленный `curl`. На Ubuntu или Debian выполните команду `sudo apt install curl` или ознакомьтесь с этой [документацией](https://curl.se/download.html) для инструкций по установке.
## Обзор {#overview}

HTTP интерфейс позволяет использовать ClickHouse на любой платформе с любого языка программирования в форме REST API. HTTP интерфейс более ограничен, чем родной интерфейс, но имеет лучшую поддержку языков.

По умолчанию `clickhouse-server` прослушивает следующие порты:
- порт 8123 для HTTP
- порт 8443 для HTTPS может быть включён

Если вы выполните запрос `GET /` без параметров, будет возвращён код ответа 200 вместе со строкой "Ok.":

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." — это значение по умолчанию, определённое в [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) и его можно изменить при необходимости.

Также см.: [Коды ответов HTTP. Замечания](#http_response_codes_caveats).
## Веб-интерфейс пользователя {#web-ui}

ClickHouse включает веб-интерфейс пользователя, к которому можно получить доступ по следующему адресу:

```text
http://localhost:8123/play`
```

Веб-интерфейс поддерживает отображение прогресса во время выполнения запроса, отмену запросов и потоковую передачу результатов.
Он имеет секретную функцию для отображения графиков и диаграмм для конвейеров запросов.

Веб-интерфейс предназначен для профессионалов, таких как вы.

<Image img={PlayUI} size="md" alt="Скриншот веб-интерфейса ClickHouse" />

В скриптах проверки состояния здоровье используйте запрос `GET /ping`. Этот обработчик всегда возвращает "Ok." (с переносом строки в конце). Доступно с версии 18.12.13. Также смотрите `/replicas_status`, чтобы проверить задержку реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```
## Запросы через HTTP/HTTPS {#querying}

Чтобы выполнять запросы через HTTP/HTTPS есть три варианта:
- отправить запрос как URL параметр 'query'
- используйте метод POST.
- Отправьте начало запроса в параметре 'query', а остальную часть с помощью POST

:::note
Размер URL по умолчанию ограничен 1 Миб, это можно изменить с помощью настройки `http_max_uri_size`.
:::

Если запрос успешен, вы получите код ответа 200 и результат в теле ответа.
Если произошла ошибка, вы получите код ответа 500 и текст описания ошибки в теле ответа.

Запросы с использованием GET являются 'только для чтения'. Это означает, что для запросов, которые модифицируют данные, вы можете использовать только метод POST.
Вы можете отправить сам запрос либо в теле POST, либо в параметре URL. Рассмотрим несколько примеров.

В приведённом ниже примере используется curl для отправки запроса `SELECT 1`. Обратите внимание на использование кодирования URL для пробелов: `%20`.

```bash title="команда"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Ответ"
1
```

В этом примере используется wget с параметрами `-nv` (негромкий) и `-O-`, чтобы вывести результат в терминал.
В этом случае не обязательно использовать кодирование URL для пробела:

```bash title="команда"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

В этом примере мы передаём сырой HTTP запрос в netcat:

```bash title="команда"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="ответ"
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

Как видите, команда `curl` несколько неудобна, так как пробелы должны быть URL закодированы.
Хотя `wget` сам все кодирует, мы не рекомендуем его использовать, так как он плохо работает через HTTP 1.1 при использовании keep-alive и Transfer-Encoding: chunked.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса отправляется в параметре, а часть в POST, между этими двумя частями данных вставляется перенос строки.
Например, это не сработает:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Ошибка синтаксиса: сбой на позиции 0: SEL
ECT 1
, ожидается одно из: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в формате [`TabSeparated`](formats.md#tabseparated).

Клаузула `FORMAT` используется в запросе для запроса любого другого формата. Например:

```bash title="команда"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1, 2, 3 FORMAT JSON'
```

```response title="Ответ"
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

Вы можете использовать URL параметр `default_format` или заголовок `X-ClickHouse-Format`, чтобы указать формат по умолчанию, отличный от `TabSeparated`.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```
## Запросы INSERT через HTTP/HTTPS {#insert-queries}

Метод `POST` передачи данных необходим для запросов `INSERT`. В этом случае вы можете написать начало запроса в параметре URL и использовать POST для передачи данных, которые нужно вставить. Данными для вставки могут быть, например, дампы с разделителями табуляции из MySQL. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.
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

Можно указать любой формат данных. Например, формат 'Values', тот же формат, что и при написании `INSERT INTO t VALUES`, можно указать следующим образом:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из дампа с разделителями табуляции, укажите соответствующий формат:

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
Данные выводятся в произвольном порядке из-за параллельной обработки запросов
:::

Чтобы удалить таблицу:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

Для успешных запросов, которые не возвращают таблицу данных, возвращается пустое тело ответа.
## Сжатие {#compression}

Сжатие может использоваться для уменьшения сетевого трафика при передаче большого объёма данных или для создания дампов, которые сразу же сжимаются.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и вам понадобится программа `clickhouse-compressor`, чтобы работать с ними. Она устанавливается по умолчанию с пакетом `clickhouse-client`.

Чтобы повысить эффективность вставки данных, отключите проверку контрольной суммы на стороне сервера с помощью настройки [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер сожмёт данные, которые он отправляет вам. Если вы укажете `decompress=1` в URL, сервер распакует данные, которые вы передали с помощью метода POST.

Вы также можете выбрать использование [сжатия HTTP](https://en.wikipedia.org/wiki/HTTP_compression). ClickHouse поддерживает следующие [методы сжатия](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

Чтобы отправить сжатый запрос `POST`, добавьте заголовок запроса `Content-Encoding: compression_method`.

Для того чтобы ClickHouse сжимал ответ, включите сжатие с помощью установки [`enable_http_compression`](../operations/settings/settings.md#enable_http_compression) и добавьте заголовок `Accept-Encoding: compression_method` к запросу.

Вы можете настроить уровень сжатия данных с помощью настройки [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP клиенты могут распаковывать данные от сервера по умолчанию (с `gzip` и `deflate`), и вы можете получить распакованные данные, даже если используете настройки сжатия правильно.
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

Чтобы получить сжатые данные от сервера, используя gunzip для получения распакованных данных:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## База данных по умолчанию {#default-database}

Вы можете использовать URL параметр `database` или заголовок `X-ClickHouse-Database`, чтобы указать базу данных по умолчанию.

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

По умолчанию используется база данных, которая зарегистрирована в настройках сервера, по умолчанию это база данных с именем `default`. Кроме того, вы всегда можете указать базу данных, используя точку перед именем таблицы.

Имя пользователя и пароль можно указать одним из трёх способов:

1. Используя HTTP Basic аутентификацию.

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В URL параметрах `user` и `password`

:::warning
Мы не рекомендуем использовать этот метод, так как параметр может быть зарегистрирован веб-прокси и кэширован в браузере.
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

Если имя пользователя не указано, используется имя `default`. Если пароль не указан, то используется пустой пароль.
Вы также можете использовать URL параметры для указания любых настроек для обработки одного запроса или для целых профилей настроек.

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
- [SET](#set)
## Использование сессий ClickHouse в HTTP протоколе {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сессии ClickHouse в HTTP протоколе. Для этого нужно добавить параметр `session_id` в запрос `GET`. Вы можете использовать любую строку в качестве идентификатора сессии.

По умолчанию сессия завершается через 60 секунд бездействия. Чтобы изменить этот тайм-аут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте параметр `session_timeout` в запрос.

Чтобы проверить статус сессии, используйте параметр `session_check=1`. В одной сессии можно выполнять только один запрос за раз.

Вы можете получить информацию о прогрессе выполнения запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers).

Ниже приведён пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

Возможные поля заголовков:

| Поле заголовка      | Описание                       |
|----------------------|---------------------------------|
| `read_rows`          | Количество считанных строк.    |
| `read_bytes`         | Объём считанных данных в байтах.  |
| `total_rows_to_read` | Общее количество строк для чтения.|
| `written_rows`       | Количество записанных строк.   |
| `written_bytes`      | Объём записанных данных в байтах.|

Запускающиеся запросы не останавливаются автоматически, если HTTP соединение потеряно. Парсинг и форматирование данных выполняются на стороне сервера, и использование сети может быть неэффективным.

Существуют следующие необязательные параметры:

| Параметры            | Описание                               |
|-----------------------|-------------------------------------------|
| `query_id` (необязательно) | Может быть передан как идентификатор запроса (любая строка). [`replace_running_query`](/operations/settings/settings#replace_running_query)|
| `quota_key` (необязательно)| Может быть передан как ключ квоты (любая строка). ["Квоты"](/operations/quotas)   |

HTTP интерфейс позволяет передавать внешние данные (временные таблицы внешнего источника) для запросов. Для получения дополнительной информации смотрите ["Внешние данные для обработки запросов"](/engines/table-engines/special/external-data).
## Буферизация ответа {#response-buffering}

Буферизация ответа может быть включена на стороне сервера. Для этой цели предусмотрены следующие URL параметры:
- `buffer_size`
-  `wait_end_of_query`

Можно использовать следующие настройки:
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` определяет количество байтов в результате, которое нужно буферизировать в памяти сервера. Если тело результата превышает этот порог, буфер записывается в HTTP канал, а оставшиеся данные отправляются напрямую в HTTP канал.

Чтобы убедиться, что весь ответ буферизуется, установите `wait_end_of_query=1`. В этом случае данные, которые не хранятся в памяти, будут буферизоваться во временный серверный файл.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после отправки кода ответа и заголовков HTTP клиенту. В этой ситуации сообщение об ошибке записывается в конце тела ответа, и на стороне клиента ошибка может быть обнаружена только на этапе парсинга.
:::
## Установка роли с помощью параметров запроса {#setting-role-with-query-parameters}

Эта функция была добавлена в ClickHouse 24.4.

В определённых сценариях может потребоваться сначала установить выданную роль перед выполнением самого оператора.
Однако отправить `SET ROLE` и оператор вместе невозможно, так как многооператорные команды не разрешены:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Команда выше вызывает ошибку:

```sql
Code: 62. DB::Exception: Ошибка синтаксиса (Многооператорные запросы не разрешены)
```

Чтобы обойти это ограничение, используйте параметр запроса `role` вместо этого:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это эквивалентно выполнению `SET ROLE my_role` перед оператором.

Кроме того, возможно указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед оператором.
## Коды ответов HTTP. Замечания {#http_response_codes_caveats}

Из-за ограничений протокола HTTP, код ответа HTTP 200 не гарантирует, что запрос был успешен.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Значение, переданное функции 'throwIf', ненулевое: во время выполнения 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения заключается в природе протокола HTTP. HTTP заголовок отправляется сначала с кодом 200, за ним следует HTTP тело, и затем ошибка вводится в тело в виде простого текста.

Это поведение независимо от формата, используемого, будь то `Native`, `TSV` или `JSON`; сообщение об ошибке всегда будет находиться в середине потока ответа.

Вы можете смягчить эту проблему, включая `wait_end_of_query=1` ([Буферизация ответа](#response-buffering)). В этом случае отправка заголовка HTTP задерживается до тех пор, пока весь запрос не будет выполнен. Однако это не полностью решает проблему, так как результат по-прежнему должен помещаться в [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size), и другие настройки, такие как [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers), могут мешать задержке заголовка.

:::tip
Единственный способ отлавливать все ошибки — это проанализировать HTTP тело перед его парсингом, используя требуемый формат.
:::
## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения для них из соответствующих HTTP параметров запроса. Для получения дополнительной информации смотрите [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).
### Пример {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### Табуляция в URL параметрах {#tabs-in-url-parameters}

Параметры запроса разбираются из "экранированного" формата. Это имеет некоторые преимущества, такие как возможность однозначно разбирать нули как `\N`. Это означает, что символ табуляции должен кодироваться как `\t` (или `\` и табуляция). Например, следующий пример содержит фактическую табуляцию между `abc` и `123`, а входная строка разбивается на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако, если вы попытаетесь закодировать фактическую табуляцию, используя `%09` в параметре URL, она не будет правильно разобрана:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Значение abc    123 не может быть разобрано как String для параметра запроса 'arg1', потому что оно не было полностью разобрано: только 3 из 7 байтов было разобрано: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

Если вы используете параметры URL, вам нужно будет закодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## Предопределённый HTTP интерфейс {#predefined_http_interface}

ClickHouse поддерживает определённые запросы через HTTP интерфейс. Например, вы можете записать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает Предопределённый HTTP интерфейс, который может помочь вам более легко интегрироваться с такими сторонними инструментами, как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Прежде всего, добавьте этот раздел в файл конфигурации вашего сервера.

`http_handlers` сконфигурирован для включения нескольких `rule`. ClickHouse будет сопоставлять полученные HTTP запросы с предопределённым типом в `rule`, и первый соответствующий правило запускает обработчик. Затем ClickHouse выполнит соответствующий предварительно определённый запрос, если сопоставление будет успешным.

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

Теперь вы можете выполнить запрос к URL напрямую для получения данных в формате Prometheus:

```bash
$ curl -v 'http://localhost:8123/predefined_query'
*   Trying ::1...
* Соединено с localhost (::1) порт 8123 (#0)
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

# HELP "Query" "Количество выполняемых запросов"

# TYPE "Query" counter
"Query" 1


# HELP "Merge" "Количество выполняемых фоновых слияний"

# TYPE "Merge" counter
"Merge" 0


# HELP "PartMutation" "Количество мутаций (ALTER DELETE/UPDATE)"

# TYPE "PartMutation" counter
"PartMutation" 0


# HELP "ReplicatedFetch" "Количество частей данных, считываемых с реплики"

# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0


# HELP "ReplicatedSend" "Количество частей данных, отправляемых на реплики"

# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Соединение #0 с хостом localhost остаётся открытым

* Соединение #0 с хостом localhost остаётся открытым
```

Параметры конфигурации для `http_handlers` работают следующим образом.

`rule` может настраивать следующие параметры:
- `method`
- `headers`
- `url`
- `handler`

Каждый из них обсуждается ниже:

  - `method` отвечает за сопоставление части метода HTTP запроса. `method` полностью соответствует определению [`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательная настройка. Если она не определена в конфигурационном файле, она не соответствует metоду HTTP-запроса.

  - `url` отвечает за сопоставление части URL HTTP запроса. Оно совместимо с регулярными выражениями [RE2](https://github.com/google/re2). Это необязательная настройка. Если она не определена в конфигурационном файле, она не соответствует части URL HTTP запроса.

  - `headers` отвечают за сопоставление заголовка HTTP запроса. Оно совместимо с регулярными выражениями RE2. Это необязательная настройка. Если она не определена в конфигурационном файле, она не соответствует части заголовков HTTP запроса.

  - `handler` содержит основную часть обработки. Сейчас `handler` может настраивать `type`, `status`, `content_type`, `http_response_headers`, `response_content`, `query`, `query_param_name`. `type` в настоящее время поддерживает три типа: [`predefined_query_handler`](#predefined_query_handler), [`dynamic_query_handler`](#dynamic_query_handler), [`static`](#static).

    - `query` — используется с типом `predefined_query_handler`, выполняет запрос, когда обработчик вызывается.
    - `query_param_name` — используется с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в параметрах HTTP-запроса.
    - `status` — используется с типом `static`, код состояния ответа.
    - `content_type` — используется с любым типом, тип [содержимого](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) ответа.
    - `http_response_headers` — используется с любым типом, отображает карту заголовков ответа. Может быть использован для установки типа содержимого.
    - `response_content` — используется с типом `static`, содержимое ответа, отправляемое клиенту, при использовании префикса 'file://' или 'config://', находит содержимое из файла или конфигурации и отправляет клиенту.

Методы конфигурации для различных `type` обсуждаются ниже.
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает установку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` — это предопределённый запрос `predefined_query_handler`, который выполняется ClickHouse, когда HTTP-запрос совпадает, и результат запроса возвращается. Это обязательная настройка.

Следующий пример определяет значения для настроек [`max_threads`](../operations/settings/settings.md#max_threads) и [`max_final_threads`](/operations/settings/settings#max_final_threads), затем запрашивает системную таблицу, чтобы проверить, были ли эти настройки установлены успешно.

:::note
Чтобы сохранить стандартные `handlers`, такие как `query`, `play`, `ping`, добавьте правило `<defaults/>`.
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

В `dynamic_query_handler` запрос записан в виде параметра HTTP-запроса. Разница заключается в том, что в `predefined_query_handler` запрос записан в конфигурационном файле. В `dynamic_query_handler` можно настроить `query_param_name`.

ClickHouse извлекает и выполняет значение, соответствующее значению `query_param_name` в URL HTTP-запроса. Значение по умолчанию для `query_param_name` — `/query`. Это необязательная настройка. Если в конфигурационном файле нет определения, параметр не передаётся.

Чтобы поэкспериментировать с этой функциональностью, следующий пример определяет значения для настроек [`max_threads`](../operations/settings/settings.md#max_threads) и `max_final_threads` и запрашивает, были ли эти настройки установлены успешно.

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

`static` может возвращать [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` может возвращать указанное содержимое.

Например, чтобы вернуть сообщение "Say Hi!":

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

`http_response_headers` могут использоваться для установки типа содержимого вместо `content_type`.

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

Найдите содержимое из конфигурации, отправленное клиенту.

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

Чтобы найти содержимое из файла, отправленного клиенту:

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
## Valid JSON/XML response on exception during HTTP streaming {#valid-output-on-exception-http-streaming}

Во время выполнения запроса через HTTP может произойти исключение, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в виде неформатированного текста.
Даже если для вывода данных был использован какой-то специфический формат данных, вывод может стать недействительным в терминах указанного формата данных.
Чтобы предотвратить это, вы можете использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (включена по умолчанию), которая укажет ClickHouse записать исключение в указанном формате (в настоящее время поддерживается для форматов XML и JSON*).

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
