---
description: 'Документация по HTTP-интерфейсу ClickHouse, предоставляющему доступ к ClickHouse через REST API с любой платформы и на любом языке программирования'
sidebar_label: 'Интерфейс HTTP'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP-интерфейс'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';

# HTTP-интерфейс

## Предварительные требования {#prerequisites}

Для примеров в этой статье вам потребуется:
- запущенный экземпляр сервера ClickHouse
- установленный `curl`. В Ubuntu или Debian выполните `sudo apt install curl` или обратитесь к этой [документации](https://curl.se/download.html) за инструкциями по установке.

## Обзор {#overview}

HTTP-интерфейс позволяет использовать ClickHouse на любой платформе и на любом языке программирования в виде REST API. HTTP-интерфейс более ограничен, чем нативный интерфейс, но имеет лучшую языковую поддержку.

По умолчанию `clickhouse-server` прослушивает следующие порты:
- порт 8123 для HTTP
- порт 8443 для HTTPS может быть включен

Если вы сделаете запрос `GET /` без каких-либо параметров, будет возвращен код ответа 200 вместе со строкой "Ok.":

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." является значением по умолчанию, определенным в [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response), и может быть изменено при необходимости.

Также см.: [Особенности кодов ответа HTTP](#http_response_codes_caveats).

## Веб-интерфейс пользователя {#web-ui}

ClickHouse включает веб-интерфейс пользователя, доступный по следующему адресу:

```text
http://localhost:8123/play
```

Веб-интерфейс поддерживает отображение прогресса во время выполнения запроса, отмену запроса и потоковую передачу результатов.
У него есть секретная функция для отображения графиков и диаграмм для конвейеров запросов.

После успешного выполнения запроса появляется кнопка загрузки, которая позволяет загрузить результаты запроса в различных форматах, включая CSV, TSV, JSON, JSONLines, Parquet, Markdown или любой пользовательский формат, поддерживаемый ClickHouse. Функция загрузки использует кэш запросов для эффективного получения результатов без повторного выполнения запроса. Она загрузит полный набор результатов, даже если интерфейс отобразил только одну страницу из многих.

Веб-интерфейс разработан для профессионалов, таких как вы.

<Image img={PlayUI} size="md" alt="Скриншот веб-интерфейса ClickHouse" />

В скриптах проверки работоспособности используйте запрос `GET /ping`. Этот обработчик всегда возвращает "Ok." (с переводом строки в конце). Доступен начиная с версии 18.12.13. См. также `/replicas_status` для проверки задержки реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

## Выполнение запросов через HTTP/HTTPS {#querying}

Для выполнения запросов через HTTP/HTTPS существует три варианта:
- отправить запрос в качестве параметра URL 'query'
- использовать метод POST.
- Отправить начало запроса в параметре 'query', а остальное используя POST

:::note
Размер URL по умолчанию ограничен 1 МиБ, это можно изменить с помощью настройки `http_max_uri_size`.
:::

В случае успеха вы получите код ответа 200 и результат в теле ответа.
Если произойдет ошибка, вы получите код ответа 500 и текст описания ошибки в теле ответа.

Запросы с использованием GET являются 'readonly' (только для чтения). Это означает, что для запросов, которые изменяют данные, можно использовать только метод POST.
Сам запрос можно отправить либо в теле POST, либо в параметре URL. Рассмотрим несколько примеров.

В примере ниже curl используется для отправки запроса `SELECT 1`. Обратите внимание на использование URL-кодирования для пробела: `%20`.

```bash title="команда"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Ответ"
1
```

В этом примере используется wget с параметрами `-nv` (не подробный) и `-O-` для вывода результата в терминал.
В этом случае не обязательно использовать URL-кодирование для пробела:

```bash title="команда"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

В этом примере мы передаем необработанный HTTP-запрос в netcat:

```bash title="команда"
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

Как видите, команда `curl` несколько неудобна тем, что пробелы должны быть закодированы в URL.
Хотя `wget` экранирует все само, мы не рекомендуем его использовать, потому что он плохо работает через HTTP 1.1 при использовании keep-alive и Transfer-Encoding: chunked.

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

По умолчанию данные возвращаются в формате [`TabSeparated`](/interfaces/formats/TabSeparated).

Для запроса любого другого формата используется предложение `FORMAT`. Например:

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

Вы можете использовать параметр URL `default_format` или заголовок `X-ClickHouse-Format` для указания формата по умолчанию, отличного от `TabSeparated`.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

Вы можете использовать метод POST с параметризованными запросами. Параметры указываются с использованием фигурных скобок с именем параметра и типом, например `{name:Type}`. Значения параметров передаются с помощью `param_name`:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```

## Запросы вставки через HTTP/HTTPS {#insert-queries}

Метод передачи данных `POST` необходим для запросов `INSERT`. В этом случае вы можете написать начало запроса в параметре URL и использовать POST для передачи данных для вставки. Данные для вставки могут быть, например, дампом, разделенным табуляцией, из MySQL. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.

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

Можно указать любой формат данных. Например, формат 'Values', тот же формат, что используется при написании `INSERT INTO t VALUES`, можно указать:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из дампа, разделенного табуляцией, укажите соответствующий формат:

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

Сжатие можно использовать для уменьшения сетевого трафика при передаче большого объема данных или для создания дампов, которые сразу сжимаются.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и вам нужна программа `clickhouse-compressor` для работы с ними. Она устанавливается по умолчанию вместе с пакетом `clickhouse-client`.

Чтобы повысить эффективность вставки данных, отключите проверку контрольной суммы на стороне сервера, используя настройку [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер сожмет данные, которые он отправляет вам. Если вы укажете `decompress=1` в URL, сервер распакует данные, которые вы передаете методом `POST`.

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

Чтобы ClickHouse сжал ответ, добавьте заголовок `Accept-Encoding: compression_method` к запросу.

Вы можете настроить уровень сжатия данных с помощью настройки [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут распаковывать данные с сервера по умолчанию (с `gzip` и `deflate`), и вы можете получить распакованные данные, даже если правильно используете настройки сжатия.
:::

## Примеры {#examples-compression}

Чтобы отправить сжатые данные на сервер:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

Чтобы получить архив сжатых данных с сервера:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

Чтобы получить сжатые данные с сервера, используя gunzip для получения распакованных данных:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## База данных по умолчанию {#default-database}

Вы можете использовать параметр URL `database` или заголовок `X-ClickHouse-Database` для указания базы данных по умолчанию.

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

По умолчанию используется база данных, зарегистрированная в настройках сервера. По умолчанию это база данных с именем `default`. Кроме того, вы всегда можете указать базу данных, используя точку перед именем таблицы.

## Аутентификация {#authentication}

Имя пользователя и пароль могут быть указаны одним из трех способов:

1. Используя HTTP Basic Authentication.

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В параметрах URL `user` и `password`

:::warning
Мы не рекомендуем использовать этот метод, так как параметр может быть записан в журнал веб-прокси и кэширован в браузере
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

Если имя пользователя не указано, то используется имя `default`. Если пароль не указан, то используется пустой пароль.
Вы также можете использовать параметры URL для указания любых настроек для обработки одного запроса или целых профилей настроек.

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

## Использование сеансов ClickHouse в протоколе HTTP {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сеансы ClickHouse в протоколе HTTP. Для этого вам нужно добавить параметр `GET` `session_id` к запросу. В качестве идентификатора сеанса можно использовать любую строку.

По умолчанию сеанс завершается через 60 секунд бездействия. Чтобы изменить этот тайм-аут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте параметр `GET` `session_timeout` к запросу.

Чтобы проверить статус сеанса, используйте параметр `session_check=1`. В рамках одного сеанса одновременно может выполняться только один запрос.

Вы можете получить информацию о прогрессе запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers).

Ниже приведен пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

Возможные поля заголовка:

| Поле заголовка       | Описание                                    |
|----------------------|---------------------------------------------|
| `read_rows`          | Количество прочитанных строк.               |
| `read_bytes`         | Объем данных, прочитанных в байтах.         |
| `total_rows_to_read` | Общее количество строк для чтения.          |
| `written_rows`       | Количество записанных строк.                |
| `written_bytes`      | Объем данных, записанных в байтах.          |
| `elapsed_ns`         | Время выполнения запроса в наносекундах.    |
| `memory_usage`       | Память в байтах, используемая запросом.     |

Выполняемые запросы не останавливаются автоматически при потере HTTP-соединения. Разбор и форматирование данных выполняются на стороне сервера, и использование сети может быть неэффективным.

Существуют следующие необязательные параметры:

| Параметры             | Описание                                                                    |
|-----------------------|-----------------------------------------------------------------------------|
| `query_id` (optional) | Может быть передан как идентификатор запроса (любая строка). [`replace_running_query`](/operations/settings/settings#replace_running_query)|
| `quota_key` (optional)| Может быть передан как ключ квоты (любая строка). ["Квоты"](/operations/quotas)   |

HTTP-интерфейс позволяет передавать внешние данные (внешние временные таблицы) для запросов. Для получения дополнительной информации см. ["Внешние данные для обработки запросов"](/engines/table-engines/special/external-data).

## Буферизация ответа {#response-buffering}

Буферизация ответа может быть включена на стороне сервера. Для этой цели предоставляются следующие параметры URL:
- `buffer_size`
-  `wait_end_of_query`

Можно использовать следующие настройки:
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` определяет количество байтов в результате для буферизации в памяти сервера. Если тело результата больше этого порога, буфер записывается в HTTP-канал, а остальные данные отправляются непосредственно в HTTP-канал.

Чтобы убедиться, что весь ответ буферизован, установите `wait_end_of_query=1`. В этом случае данные, которые не хранятся в памяти, будут буферизованы во временном файле сервера.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса произошла после того, как код ответа и заголовки HTTP были отправлены клиенту. В этой ситуации сообщение об ошибке записывается в конец тела ответа, и на стороне клиента ошибку можно обнаружить только на этапе синтаксического анализа.
:::

## Установка роли с параметрами запроса {#setting-role-with-query-parameters}

Эта функция была добавлена в ClickHouse 24.4.

В определенных сценариях может потребоваться сначала установить предоставленную роль, прежде чем выполнять сам оператор.
Однако невозможно отправить `SET ROLE` и оператор вместе, так как множественные операторы не разрешены:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Приведенная выше команда приводит к ошибке:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

Чтобы преодолеть это ограничение, используйте параметр запроса `role` вместо этого:

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

Причина такого поведения заключается в природе протокола HTTP. Заголовок HTTP отправляется первым с кодом HTTP 200, затем тело HTTP, а затем ошибка внедряется в тело в виде простого текста.

Это поведение не зависит от используемого формата, будь то `Native`, `TSV` или `JSON`; сообщение об ошибке всегда будет в середине потока ответа.

Вы можете смягчить эту проблему, включив `wait_end_of_query=1` ([Буферизация ответа](#response-buffering)). В этом случае отправка заголовка HTTP откладывается до тех пор, пока не будет разрешен весь запрос. Это, однако, не решает проблему полностью, потому что результат все еще должен помещаться в [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size), и другие настройки, такие как [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers), могут помешать задержке заголовка.

:::tip
Единственный способ поймать все ошибки - проанализировать тело HTTP перед его синтаксическим анализом с использованием требуемого формата.
:::

Такие исключения в ClickHouse имеют согласованный формат исключений, как показано ниже, независимо от того, какой формат используется (например, `Native`, `TSV`, `JSON` и т. д.), когда `http_write_exception_in_output_format=0` (по умолчанию). Это упрощает анализ и извлечение сообщений об ошибках на стороне клиента.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

Где `<TAG>` - это 16-байтовый случайный тег, который является тем же тегом, отправленным в заголовке ответа `X-ClickHouse-Exception-Tag`.
`<error message>` - это фактическое сообщение об исключении (точная длина может быть найдена в `<message_length>`). Весь блок исключений, описанный выше, может быть до 16 КиБ.

Вот пример в формате `JSON`

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

Вот похожий пример, но в формате `CSV`

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

__exception__
rumfyutuqkncbgau
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
__exception__
```

## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передать значения для них из соответствующих параметров HTTP-запроса. Для получения дополнительной информации см. [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).

### Пример {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### Табуляции в параметрах URL {#tabs-in-url-parameters}

Параметры запроса разбираются из «экранированного» формата. Это имеет некоторые преимущества, такие как возможность однозначно разбирать нули как `\N`. Это означает, что символ табуляции должен быть закодирован как `\t` (или `\` и табуляция). Например, следующее содержит фактическую табуляцию между `abc` и `123`, и входная строка разделяется на два значения:

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

## Предопределенный HTTP-интерфейс {#predefined_http_interface}

ClickHouse поддерживает определенные запросы через HTTP-интерфейс. Например, вы можете записывать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает предопределенный HTTP-интерфейс, который может помочь вам легче интегрироваться со сторонними инструментами, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Во-первых, добавьте этот раздел в файл конфигурации вашего сервера.

`http_handlers` настроен на содержание нескольких `rule`. ClickHouse будет сопоставлять полученные HTTP-запросы с предопределенным типом в `rule`, и первое совпадающее правило запускает обработчик. Затем ClickHouse выполнит соответствующий предопределенный запрос, если сопоставление успешно.

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
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

Параметры конфигурации для `http_handlers` работают следующим образом.

`rule` может настроить следующие параметры:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

Каждый из них обсуждается ниже:

- `method` отвечает за сопоставление части метода HTTP-запроса. `method` полностью соответствует определению [`method`]
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательная конфигурация. Если она не определена в файле
  конфигурации, она не соответствует части метода HTTP-запроса.

- `url` отвечает за сопоставление части URL (путь и строка запроса) HTTP-запроса.
  Если `url` начинается с префикса `regex:`, ожидаются регулярные выражения [RE2](https://github.com/google/re2).
  Это необязательная конфигурация. Если она не определена в файле конфигурации, она не соответствует части URL HTTP-запроса.

- `full_url` то же, что и `url`, но включает полный URL, т.е. `schema://host:port/path?query_string`.
  Обратите внимание, что ClickHouse не поддерживает «виртуальные хосты», поэтому `host` - это IP-адрес (а не значение заголовка `Host`).

- `empty_query_string` - обеспечивает отсутствие строки запроса (`?query_string`) в запросе

- `headers` отвечают за сопоставление части заголовка HTTP-запроса. Совместимо с регулярными выражениями RE2. Это необязательная
  конфигурация. Если она не определена в файле конфигурации, она не соответствует части заголовка HTTP-запроса.

- `handler` содержит основную часть обработки.

  Он может иметь следующие `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  И следующие параметры:
  - `query` — используется с типом `predefined_query_handler`, выполняет запрос при вызове обработчика.
  - `query_param_name` — используется с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в
       параметрах HTTP-запроса.
  - `status` — используется с типом `static`, код статуса ответа.
  - `content_type` — используется с любым типом, ответ [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).
  - `http_response_headers` — используется с любым типом, карта заголовков ответа. Может использоваться для установки типа контента также.
  - `response_content` — используется с типом `static`, содержимое ответа, отправленное клиенту, при использовании префикса 'file://' или 'config://', найти содержимое
    из файла или конфигурации для отправки клиенту.
  - `user` - пользователь для выполнения запроса (пользователь по умолчанию - `default`).
    **Примечание**: вам не нужно указывать пароль для этого пользователя.

Методы конфигурации для различных `type` обсуждаются далее.

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает установку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` - это предопределенный запрос `predefined_query_handler`, который выполняется ClickHouse при совпадении HTTP-запроса, и возвращается результат запроса. Это обязательная конфигурация.

В следующем примере определяются значения настроек [`max_threads`](../operations/settings/settings.md#max_threads) и [`max_final_threads`](/operations/settings/settings#max_final_threads), затем запрашивается системная таблица, чтобы проверить, были ли эти настройки установлены успешно.

:::note
Чтобы сохранить обработчики по умолчанию, такие как` query`, `play`,` ping`, добавьте правило `<defaults/>`.
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

В `dynamic_query_handler` запрос записывается в виде параметра HTTP-запроса. Разница в том, что в `predefined_query_handler` запрос записывается в файле конфигурации. `query_param_name` можно настроить в `dynamic_query_handler`.

ClickHouse извлекает и выполняет значение, соответствующее значению `query_param_name` в URL HTTP-запроса. Значение по умолчанию `query_param_name` - `/query`. Это необязательная конфигурация. Если в файле конфигурации нет определения, параметр не передается.

Чтобы поэкспериментировать с этой функциональностью, в следующем примере определяются значения [`max_threads`](../operations/settings/settings.md#max_threads) и `max_final_threads` и `queries`, были ли настройки установлены успешно.

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

`static` может вернуть [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` может вернуть указанное содержимое.

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

`http_response_headers` можно использовать для установки типа контента вместо `content_type`.

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

Найти содержимое из конфигурации для отправки клиенту.

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

Чтобы найти содержимое из файла для отправки клиенту:

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` выполнит перенаправление `302` на `location`

Например, вот как вы можете автоматически добавить набор пользователей в `play` для ClickHouse play:

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

## Заголовки HTTP-ответа {#http-response-headers}

ClickHouse позволяет настраивать пользовательские заголовки HTTP-ответа, которые могут быть применены к любому виду обработчика, который может быть настроен. Эти заголовки можно установить с помощью настройки `http_response_headers`, которая принимает пары ключ-значение, представляющие имена заголовков и их значения. Эта функция особенно полезна для реализации пользовательских заголовков безопасности, политик CORS или любых других требований к заголовкам HTTP в интерфейсе HTTP ClickHouse.

Например, вы можете настроить заголовки для:
- Регулярных конечных точек запросов
- Веб-интерфейса
- Проверки работоспособности.

Также можно указать `common_http_response_headers`. Они будут применены ко всем обработчикам http, определенным в конфигурации.

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

## Допустимый JSON/XML ответ при исключении во время потоковой передачи HTTP {#valid-output-on-exception-http-streaming}

Во время выполнения запроса через HTTP исключение может произойти, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в виде простого текста.
Даже если для вывода данных использовался определенный формат данных, вывод может стать недействительным с точки зрения указанного формата данных.
Чтобы предотвратить это, вы можете использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (отключена по умолчанию), которая сообщит ClickHouse записать исключение в указанном формате (в настоящее время поддерживается для форматов XML и JSON*).

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
