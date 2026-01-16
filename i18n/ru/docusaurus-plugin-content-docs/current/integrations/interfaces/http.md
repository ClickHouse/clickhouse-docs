---
description: 'Документация по HTTP-интерфейсу ClickHouse, обеспечивающему доступ к ClickHouse по REST API с любой платформы и на любом языке программирования'
sidebar_label: 'HTTP-интерфейс'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP-интерфейс'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP-интерфейс \{#http-interface\}

## Предварительные требования \\{#prerequisites\\}

Для примеров, приведённых в этой статье, вам потребуется:

- работающий сервер ClickHouse
- установленный `curl`. В Ubuntu или Debian выполните команду `sudo apt install curl` или обратитесь к этой [документации](https://curl.se/download.html) за инструкциями по установке.

## Обзор \{#overview\}

HTTP-интерфейс позволяет использовать ClickHouse на любой платформе и из любого языка программирования в виде REST API. HTTP-интерфейс более ограничен, чем нативный интерфейс, но обладает более широкой поддержкой языков программирования.

По умолчанию `clickhouse-server` прослушивает следующие порты:

* порт 8123 для HTTP
* порт 8443 для HTTPS (может быть включен)

Если выполнить запрос `GET /` без каких-либо параметров, возвращается код ответа 200 вместе со строкой «Ok.»:

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; — значение по умолчанию, заданное в [`http_server_default_response`](../../operations/server-configuration-parameters/settings.md#http_server_default_response), и при необходимости его можно изменить.

См. также: [Особенности кодов ответа HTTP](#http_response_codes_caveats).


## Веб-интерфейс \{#web-ui\}

ClickHouse включает веб-интерфейс, доступ к которому можно получить по следующему адресу:

```text
http://localhost:8123/play
```

Веб-интерфейс поддерживает отображение прогресса во время выполнения запроса, отмену запроса и потоковую передачу результатов.
В нем есть скрытая возможность отображения диаграмм и графиков для конвейеров (пайплайнов) запросов.

После успешного выполнения запроса появляется кнопка загрузки, которая позволяет скачать результаты запроса в различных форматах, включая CSV, TSV, JSON, JSONLines, Parquet, Markdown или любой пользовательский формат, поддерживаемый ClickHouse. Функция загрузки использует кэш запросов для эффективного получения результатов без повторного выполнения запроса. Она скачает все результаты, даже если в интерфейсе была показана только одна страница из многих.

Веб-интерфейс разработан для профессионалов, таких как вы.

<Image img={PlayUI} size="md" alt="Скриншот веб-интерфейса ClickHouse" />

В скриптах проверки работоспособности используйте запрос `GET /ping`. Этот обработчик всегда возвращает строку &quot;Ok.&quot; (с символом перевода строки в конце). Доступно начиная с версии 18.12.13. См. также `/replicas_status` для проверки задержки реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## Выполнение запросов по HTTP/HTTPS \{#querying\}

Для выполнения запросов по HTTP/HTTPS есть три варианта:

* отправить запрос как параметр URL `query`;
* использовать метод POST;
* отправить начало запроса в параметре `query`, а остальную часть — с помощью POST.

:::note
Размер URL по умолчанию ограничен 1 МиБ, это можно изменить с помощью настройки `http_max_uri_size`.
:::

Если запрос выполнен успешно, вы получаете код ответа 200 и результат в теле ответа.
Если произошла ошибка, вы получаете код ответа 500 и текст с описанием ошибки в теле ответа.

Запросы с использованием GET являются «только для чтения». Это означает, что для запросов, которые модифицируют данные, вы можете использовать только метод POST.
Вы можете отправить сам запрос либо в теле POST-запроса, либо в параметре URL. Рассмотрим несколько примеров.

В примере ниже для отправки запроса `SELECT 1` используется curl. Обратите внимание на использование URL-кодирования для пробела: `%20`.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

В этом примере wget используется с параметрами `-nv` (неподробный вывод) и `-O-` для вывода результата в терминал.
В этом случае нет необходимости URL-кодировать пробел:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

В этом примере мы перенаправляем сырой HTTP-запрос в netcat:

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
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

Как видно, команда `curl` несколько неудобна тем, что пробелы необходимо URL-кодировать.
Хотя `wget` кодирует всё сам, мы не рекомендуем его использовать, поскольку он плохо работает по HTTP/1.1 при использовании keep-alive и Transfer-Encoding: chunked.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса передаётся в параметре, а часть — в POST, между этими двумя частями данных вставляется символ перевода строки.
Например, это не сработает:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в формате [`TabSeparated`](/interfaces/formats/TabSeparated).

Чтобы запросить любой другой формат, в запросе используется предложение `FORMAT`. Например:

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

Вы можете использовать метод POST для параметризованных запросов. Параметры задаются с помощью фигурных скобок с именем и типом параметра, например `{name:Type}`. Значения параметров передаются через `param_name`:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## Запросы `INSERT` по HTTP/HTTPS \\{#insert-queries\\}

Для запросов `INSERT` используется метод `POST`. В этом случае вы можете записать начальную часть запроса в параметр URL, а данные для вставки передать через POST. Данные для вставки могут представлять собой, например, дамп из MySQL с разделителем табуляции. Таким образом, запрос `INSERT` заменяет в MySQL команду `LOAD DATA LOCAL INFILE`.

### Примеры \{#examples\}

Чтобы создать таблицу:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

Чтобы использовать привычный запрос `INSERT` для вставки данных:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

Для отправки данных отдельно от запроса:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

Можно указать любой формат данных. Например, можно указать формат &#39;Values&#39; — тот же, что используется при выполнении `INSERT INTO t VALUES`:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из дампа с разделителями табуляции, укажите соответствующий формат:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

Чтобы просмотреть содержимое таблицы:

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

Для успешных запросов, не возвращающих таблицу данных, возвращается пустое тело ответа.


## Сжатие \\{#compression\\}

Сжатие можно использовать для уменьшения сетевого трафика при передаче больших объёмов данных или для создания дампов, которые сразу сохраняются в сжатом виде.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и для работы с ними требуется программа `clickhouse-compressor`. Она устанавливается по умолчанию вместе с пакетом `clickhouse-client`. 

Чтобы повысить эффективность вставки данных, отключите проверку контрольных сумм на стороне сервера с помощью настройки [`http_native_compression_disable_checksumming_on_decompress`](../../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер будет сжимать данные, которые он вам отправляет. Если вы укажете `decompress=1` в URL, сервер будет распаковывать данные, которые вы передаёте методом `POST`.

Вы также можете использовать [HTTP-сжатие](https://en.wikipedia.org/wiki/HTTP_compression). ClickHouse поддерживает следующие [методы сжатия](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens):

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

Чтобы отправить сжатый `POST`-запрос, добавьте заголовок запроса `Content-Encoding: compression_method`.

Чтобы ClickHouse сжимал ответ, добавьте к запросу заголовок `Accept-Encoding: compression_method`. 

Вы можете настроить уровень сжатия данных с помощью настройки [`http_zlib_compression_level`](../../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут по умолчанию распаковывать данные с сервера (для `gzip` и `deflate`), и вы можете получить распакованные данные, даже если используете настройки сжатия корректно.
:::

## Примеры \{#examples-compression\}

Чтобы отправить сжатые данные на сервер:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

Чтобы получить с сервера сжатый архив данных:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

Чтобы получать от сервера сжатые данные и сразу же их распаковывать, используйте gunzip:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## База данных по умолчанию \{#default-database\}

Вы можете использовать параметр URL `database` или заголовок `X-ClickHouse-Database`, чтобы указать базу данных, используемую по умолчанию.

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

По умолчанию используется база данных, указанная в настройках сервера. Изначально это база данных `default`. При необходимости вы можете явно указать базу данных, добавив её имя перед именем таблицы через точку.


## Аутентификация \{#authentication\}

Имя пользователя и пароль можно указать одним из трёх способов:

1. С помощью базовой HTTP-аутентификации.

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В параметрах URL `user` и `password`

:::warning
Мы не рекомендуем использовать этот способ, так как параметры могут быть записаны в журнал веб‑прокси и сохранены в кэше браузера
:::

Например:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. Использование заголовков &#39;X-ClickHouse-User&#39; и &#39;X-ClickHouse-Key&#39;

Например:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

Если имя пользователя не указано, используется имя `default`. Если пароль не указан, используется пустой пароль.
Вы также можете использовать URL‑параметры, чтобы задать любые настройки для обработки одного запроса или целых профилей настроек.

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

Дополнительные сведения см.:

* [Настройки](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## Использование сессий ClickHouse в протоколе HTTP \{#using-clickhouse-sessions-in-the-http-protocol\}

В протоколе HTTP также можно использовать сессии ClickHouse. Для этого необходимо добавить к запросу параметр `session_id` в `GET`. В качестве идентификатора сессии можно использовать любую строку.

По умолчанию сессия завершается через 60 секунд бездействия. Чтобы изменить этот таймаут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте к запросу параметр `session_timeout` в `GET`.

Чтобы проверить состояние сессии, используйте параметр `session_check=1`. В рамках одной сессии одновременно может выполняться только один запрос.

Вы можете получать информацию о прогрессе выполнения запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers).

Ниже приведён пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

Возможные поля заголовка:

| Поле заголовка       | Описание                                      |
| -------------------- | --------------------------------------------- |
| `read_rows`          | Количество прочитанных строк.                 |
| `read_bytes`         | Объём прочитанных данных в байтах.            |
| `total_rows_to_read` | Общее количество строк для чтения.            |
| `written_rows`       | Количество записанных строк.                  |
| `written_bytes`      | Объём записанных данных в байтах.             |
| `elapsed_ns`         | Время выполнения запроса в наносекундах.      |
| `memory_usage`       | Объём памяти в байтах, используемый запросом. |

Выполняющиеся запросы не останавливаются автоматически при потере HTTP‑соединения. Разбор и форматирование данных выполняются на стороне сервера, и использование сети может быть неэффективным.

Существуют следующие необязательные параметры:

| Параметр               | Описание                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | Можно передать как идентификатор запроса (произвольная строка). [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | Можно передать как ключ квоты (произвольная строка). [«Quotas»](/operations/quotas)                                                            |

HTTP‑интерфейс позволяет передавать внешние данные (внешние временные таблицы) для обработки запросов. Дополнительные сведения см. в разделе [«External data for query processing»](/engines/table-engines/special/external-data).


## Буферизация ответа \{#response-buffering\}

Буферизацию ответа можно включить на стороне сервера. Для этого предусмотрены следующие параметры URL:

* `buffer_size`
* `wait_end_of_query`

Можно использовать следующие параметры настроек:

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` определяет количество байт результата, которое будет буферизовано в памяти сервера. Если тело результата больше этого порога, буфер записывается в HTTP‑канал, а оставшиеся данные отправляются напрямую в HTTP‑канал.

Чтобы обеспечить буферизацию всего ответа, установите `wait_end_of_query=1`. В этом случае данные, которые не помещаются в память, будут буферизованы во временном серверном файле.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса возникает после того, как код ответа и HTTP‑заголовки уже отправлены клиенту. В этом случае сообщение об ошибке оказывается в конце тела ответа, и на стороне клиента ошибка может быть обнаружена только при разборе ответа.
:::


## Установка роли с помощью параметров запроса \{#setting-role-with-query-parameters\}

Эта функция была добавлена в ClickHouse 24.4.

В некоторых сценариях может потребоваться сначала установить предоставленную роль, а уже затем выполнять саму команду.
Однако отправить `SET ROLE` и команду вместе невозможно, поскольку многокомандные запросы не допускаются:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Приведённая выше команда вызывает ошибку:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

Чтобы обойти это ограничение, воспользуйтесь параметром запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это эквивалентно выполнению `SET ROLE my_role` перед выполнением запроса.

Кроме того, можно указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед выполнением запроса.


## Особенности кодов ответа HTTP \{#http_response_codes_caveats\}

Из-за ограничений протокола HTTP код ответа 200 не гарантирует, что запрос был выполнен успешно.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения связана с природой протокола HTTP. Сначала отправляется HTTP-заголовок с кодом 200, затем тело HTTP-ответа, и уже после этого ошибка добавляется в это тело в виде обычного текста.

Это поведение не зависит от используемого формата, будь то `Native`, `TSV` или `JSON`: сообщение об ошибке всегда будет находиться в середине потока ответа.

Вы можете частично устранить эту проблему, включив `wait_end_of_query=1` ([Буферизация ответа](#response-buffering)). В этом случае отправка HTTP-заголовка откладывается до тех пор, пока весь запрос не будет обработан. Однако это не полностью решает проблему, потому что результат всё равно должен поместиться в [`http_response_buffer_size`](../../operations/settings/settings.md#http_response_buffer_size), а другие настройки, такие как [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers), могут нарушать задержку отправки заголовка.

:::tip
Единственный способ перехватить все ошибки — проанализировать тело HTTP-ответа до его разбора с использованием требуемого формата.
:::

Подобные исключения в ClickHouse имеют единообразный формат, как показано ниже, независимо от используемого формата (например, `Native`, `TSV`, `JSON` и т. д.), при `http_write_exception_in_output_format=0` (значение по умолчанию). Это упрощает разбор и извлечение сообщений об ошибках на стороне клиента.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

Где `<TAG>` — это 16-байтовый случайный тег, который совпадает с тегом, отправленным в заголовке ответа `X-ClickHouse-Exception-Tag`.
`<error message>` — это фактическое сообщение об исключении (точную длину можно найти в `<message_length>`). Весь блок исключения, описанный выше, может достигать 16 КиБ.

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


## Запросы с параметрами \\{#cli-queries-with-parameters\\}

Вы можете создавать запросы с параметрами и передавать для них значения из соответствующих параметров HTTP-запроса. Для получения дополнительной информации см. раздел [Запросы с параметрами для CLI](../../interfaces/cli.md#cli-queries-with-parameters).

### Пример \{#example-3\}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```


### Табуляция в параметрах URL \{#tabs-in-url-parameters\}

Параметры запроса интерпретируются в «экранированном» формате. Это даёт некоторые преимущества, например возможность однозначно интерпретировать `\N` как null. Это означает, что символ табуляции должен быть закодирован как `\t` (либо как `\` и символ табуляции). Например, в следующем примере между `abc` и `123` содержится фактический символ табуляции, и входная строка разбивается на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако если вы попытаетесь закодировать символ табуляции как `%09` в параметре URL, он не будет корректно разобран:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

Если вы используете параметры URL-запроса, вам нужно закодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## Предопределённый HTTP-интерфейс \{#predefined_http_interface\}

ClickHouse поддерживает выполнение ряда специфических запросов через HTTP-интерфейс. Например, вы можете записать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает предопределённый HTTP-интерфейс, который может упростить интеграцию со сторонними инструментами, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Прежде всего добавьте этот раздел в файл конфигурации сервера.

`http_handlers` настраивается так, чтобы содержать несколько правил (`rule`). ClickHouse будет сопоставлять полученные HTTP-запросы с предопределённым типом в `rule`, и обработчик запускается для первого правила, которому запрос соответствует. Затем, если сопоставление прошло успешно, ClickHouse выполнит соответствующий предопределённый запрос.

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

Теперь вы можете запрашивать данные в формате Prometheus по этому URL:

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

Параметры конфигурации для `http_handlers` задаются следующим образом.

`rule` позволяет настроить следующие параметры:

* `method`
* `headers`
* `url`
* `full_url`
* `handler`

Каждый из них рассматривается ниже.


- `method` отвечает за сопоставление части метода HTTP-запроса. `method` полностью соответствует определению [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательный параметр конфигурации. Если он не определён в   
  конфигурационном файле, сопоставление с частью метода HTTP-запроса не выполняется.

- `url` отвечает за сопоставление части URL (путь и строка запроса) HTTP-запроса.
  Если `url` начинается с префикса `regex:`, ожидаются регулярные выражения [RE2](https://github.com/google/re2).
  Это необязательный параметр конфигурации. Если он не определён в конфигурационном файле, сопоставление с частью URL HTTP-запроса не выполняется.

- `full_url` аналогичен `url`, но включает полный URL, т.е. `schema://host:port/path?query_string`.
  Обратите внимание, ClickHouse не поддерживает «виртуальные хосты», поэтому `host` — это IP-адрес (а не значение заголовка `Host`).

- `empty_query_string` — обеспечивает отсутствие строки запроса (`?query_string`) в запросе.

- `headers` отвечают за сопоставление части заголовков HTTP-запроса. Поддерживают регулярные выражения RE2. Это необязательный 
  параметр конфигурации. Если он не определён в конфигурационном файле, сопоставление с частью заголовков HTTP-запроса не выполняется.

- `handler` содержит основную логику обработки.

  Для него могут быть заданы следующие значения `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  А также следующие параметры:
  - `query` — использовать с типом `predefined_query_handler`, выполняет запрос при вызове обработчика.
  - `query_param_name` — использовать с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее значению `query_param_name` в 
       параметрах HTTP-запроса.
  - `status` — использовать с типом `static`, код статуса ответа.
  - `content_type` — использовать с любым типом, тип содержимого ([Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)) ответа.
  - `http_response_headers` — использовать с любым типом, отображение (map) заголовков ответа. Может также использоваться для задания типа содержимого.
  - `response_content` — использовать с типом `static`, содержимое ответа, отправляемое клиенту; при использовании префикса `file://` или `config://` содержимое берётся из файла или конфигурации и отправляется клиенту.
  - `user` — пользователь, от имени которого выполняется запрос (пользователь по умолчанию — `default`).
    **Обратите внимание**, вам не нужно указывать пароль для этого пользователя.

Способы конфигурирования для разных значений `type` рассматриваются далее.

### predefined&#95;query&#95;handler \\{#predefined&#95;query&#95;handler\\}

`predefined_query_handler` поддерживает установку значений параметров `Settings` и `query_params`. В типе `predefined_query_handler` можно задать параметр `query`.

Значение `query` — это предопределённый запрос `predefined_query_handler`, который выполняется ClickHouse при совпадении HTTP‑запроса и возвращает результат выполнения. Это обязательная настройка.

В следующем примере задаются значения настроек [`max_threads`](../../operations/settings/settings.md#max_threads) и [`max_final_threads`](../../operations/settings/settings.md#max_final_threads), после чего выполняется запрос к системной таблице, чтобы проверить, были ли эти настройки успешно применены.

:::note
Чтобы сохранить обработчики по умолчанию, такие как `query`, `play`, `ping`, добавьте правило `<defaults/>`.
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


#### Виртуальный параметр `_request_body` \\{#virtual-param-request-body\\}

Кроме параметров URL, заголовков и параметров запроса `predefined_query_handler` поддерживает специальный виртуальный параметр `_request_body`.
Он содержит исходное тело HTTP-запроса в виде строки.
Это позволяет создавать гибкие REST API, которые могут принимать произвольные форматы данных и обрабатывать их внутри ваших запросов.

Например, вы можете использовать `_request_body` для реализации REST-эндпоинта, который принимает данные в формате JSON в POST-запросе и вставляет их в таблицу:

```yaml
<http_handlers>
    <rule>
        <methods>POST</methods>
        <url>/api/events</url>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                INSERT INTO events (id, data)
                SELECT {id:UInt32}, {_request_body:String}
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

После этого вы можете отправлять данные на этот endpoint:

```bash
curl -X POST 'http://localhost:8123/api/events?id=123' \
  -H 'Content-Type: application/json' \
  -d '{"user": "john", "action": "login", "timestamp": "2024-01-01T10:00:00Z"}'
```

:::note
Для одного `predefined_query_handler` может быть задан только один `query`.
:::


### dynamic&#95;query&#95;handler \{#dynamic_query_handler\}

В `dynamic_query_handler` запрос передаётся в параметре HTTP‑запроса. В отличие от `predefined_query_handler`, где запрос задаётся в конфигурационном файле. Параметр `query_param_name` можно настроить в `dynamic_query_handler`.

ClickHouse извлекает и выполняет значение, соответствующее `query_param_name` в URL HTTP‑запроса. Значение по умолчанию для `query_param_name` — `/query`. Это необязательная настройка. Если в конфигурационном файле она не задана, параметр не передаётся.

Чтобы поэкспериментировать с этой функциональностью, в следующем примере задаются значения [`max_threads`](../../operations/settings/settings.md#max_threads) и `max_final_threads`, а затем с помощью запросов проверяется, были ли настройки успешно применены.

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


### static \{#static\}

`static` может возвращать [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` может возвращать указанное содержимое.

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

`http_response_headers` можно использовать для задания типа содержимого вместо `content_type`.

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

Находит в конфигурации содержимое, отправляемое клиенту.

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

Чтобы определить содержимое файла, отправляемое клиенту:

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


### redirect \{#redirect\}

`redirect` выполнит перенаправление с кодом `302` на `location`.

Например, так можно автоматически добавить `SET USER` к `play` для ClickHouse Play:

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


## Заголовки HTTP-ответа \{#http-response-headers\}

ClickHouse позволяет настраивать произвольные заголовки HTTP-ответов, которые могут быть применены к любым обработчикам, доступным для конфигурирования. Эти заголовки можно задавать с помощью настройки `http_response_headers`, которая принимает пары ключ-значение, представляющие имена заголовков и их значения. Эта возможность особенно полезна для реализации пользовательских заголовков безопасности, политик CORS или любых других требований к HTTP-заголовкам во всем HTTP-интерфейсе ClickHouse.

Например, вы можете настроить заголовки для:

* Обычных конечных точек (endpoint) для запросов
* Web UI
* Health check.

Также можно задать `common_http_response_headers`. Они будут применяться ко всем HTTP-обработчикам, определенным в конфигурации.

Заголовки будут включены в HTTP-ответ для каждого настроенного обработчика.

В примере ниже каждый ответ сервера будет содержать два пользовательских заголовка: `X-My-Common-Header` и `X-My-Custom-Header`.

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


## Корректный JSON/XML‑ответ при возникновении исключения во время HTTP‑потоковой передачи \{#valid-output-on-exception-http-streaming\}

Во время выполнения запроса по HTTP может произойти исключение, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в виде обычного текста.
Даже если для вывода данных использовался определённый формат, результат может оказаться некорректным с точки зрения заданного формата данных.
Чтобы этого избежать, вы можете использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (по умолчанию отключена), которая укажет ClickHouse записывать исключение в заданном формате (в настоящее время поддерживаются форматы XML и JSON*).

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
