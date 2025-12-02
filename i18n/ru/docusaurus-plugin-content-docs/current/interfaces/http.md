---
description: 'Документация по HTTP-интерфейсу ClickHouse, предоставляющему доступ к ClickHouse через REST API с любой платформы и на любом языке программирования'
sidebar_label: 'Интерфейс HTTP'
sidebar_position: 15
slug: /interfaces/http
title: 'Интерфейс HTTP'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP-интерфейс {#http-interface}



## Предварительные требования {#prerequisites}

Для примеров в этой статье вам понадобится:
- запущенный сервер ClickHouse
- установленный `curl`. В Ubuntu или Debian выполните `sudo apt install curl` или обратитесь к этой [документации](https://curl.se/download.html) за инструкциями по установке.



## Обзор {#overview}

HTTP-интерфейс позволяет использовать ClickHouse на любой платформе и с любого языка программирования в виде REST API. HTTP-интерфейс более ограничен, чем нативный интерфейс, но обладает лучшей поддержкой языков.

По умолчанию `clickhouse-server` слушает следующие порты:

* порт 8123 для HTTP
* порт 8443 для HTTPS, который при необходимости можно включить

Если вы выполняете запрос `GET /` без каких-либо параметров, возвращается код ответа 200 и строка &quot;Ok.&quot;:

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; является значением по умолчанию, определённым в [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response), и при желании его можно изменить.

См. также: [Особенности кодов ответа HTTP](#http_response_codes_caveats).


## Веб-интерфейс пользователя {#web-ui}

ClickHouse включает веб-интерфейс пользователя, доступ к которому можно получить по следующему адресу:

```text
http://localhost:8123/play
```

Веб-интерфейс поддерживает отображение прогресса во время выполнения запроса, отмену запроса и потоковую передачу результатов.
В нём есть скрытая функция для отображения диаграмм и графиков для пайплайнов запросов.

После успешного выполнения запроса появляется кнопка загрузки, которая позволяет скачать результаты запроса в различных форматах, включая CSV, TSV, JSON, JSONLines, Parquet, Markdown или любой пользовательский формат, поддерживаемый ClickHouse. Функция загрузки использует кэш запросов для эффективного получения результатов без повторного выполнения запроса. Будут загружены все результаты, даже если в интерфейсе была показана только одна страница из многих.

Веб-интерфейс разработан для таких профессионалов, как вы.

<Image img={PlayUI} size="md" alt="Скриншот веб-интерфейса ClickHouse" />

В скриптах проверки состояния используйте запрос `GET /ping`. Этот обработчик всегда возвращает «Ok.» (с символом перевода строки в конце). Доступно начиная с версии 18.12.13. См. также `/replicas_status` для проверки задержки реплики.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## Выполнение запросов по HTTP/HTTPS {#querying}

Для выполнения запросов по HTTP/HTTPS есть три варианта:

* отправить запрос как параметр URL `query`
* использовать метод POST
* отправить начало запроса в параметре `query`, а остальную часть — в теле POST

:::note
Размер URL по умолчанию ограничен 1 MiB, это можно изменить с помощью настройки `http_max_uri_size`.
:::

В случае успешного выполнения вы получаете код ответа 200 и результат в теле ответа.
В случае ошибки вы получаете код ответа 500 и текстовое описание ошибки в теле ответа.

Запросы с использованием GET являются «только для чтения» (`readonly`). Это означает, что для запросов, модифицирующих данные, можно использовать только метод POST.
Сам запрос можно отправить либо в теле POST, либо в параметре URL. Рассмотрим несколько примеров.

В приведённом ниже примере для отправки запроса `SELECT 1` используется curl. Обратите внимание на использование URL-кодирования для пробела: `%20`.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

В этом примере wget используется с параметрами `-nv` (минимальный вывод) и `-O-` для вывода результата в терминал.
В данном случае нет необходимости использовать URL-кодирование для пробела:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

В этом примере мы передаём сырой HTTP-запрос в netcat через конвейер (pipe):

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

Как видно, команда `curl` несколько неудобна тем, что пробелы в URL приходится экранировать.
Хотя `wget` выполняет экранирование автоматически, мы не рекомендуем его использовать, поскольку он некорректно работает по HTTP/1.1 при использовании keep-alive и Transfer-Encoding: chunked.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

Если часть запроса отправляется в параметре, а часть в POST, между этими двумя частями данных вставляется символ новой строки.
Например, это не будет работать:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Синтаксическая ошибка: ошибка в позиции 0: SEL
ECT 1
, ожидалось одно из: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

По умолчанию данные возвращаются в формате [`TabSeparated`](/interfaces/formats/TabSeparated).

Для запроса другого формата в запросе используется предложение `FORMAT`. Например:

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

Вы можете использовать параметр `default_format` в URL или заголовок `X-ClickHouse-Format`, чтобы указать формат по умолчанию, отличный от `TabSeparated`.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

Вы можете использовать метод POST для выполнения параметризованных запросов. Параметры задаются в фигурных скобках с указанием имени и типа параметра, например `{name:Type}`. Значения параметров передаются через `param_name`:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## Запросы INSERT по HTTP/HTTPS {#insert-queries}

Метод передачи данных `POST` используется для запросов `INSERT`. В этом случае вы можете указать начало запроса в параметре URL и использовать POST для передачи данных, которые нужно вставить. Вставляемыми данными может быть, например, дамп из MySQL в формате с разделителями табуляции. Таким образом, запрос `INSERT` заменяет `LOAD DATA LOCAL INFILE` из MySQL.

### Примеры {#examples}

Чтобы создать таблицу:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

Чтобы вставлять данные с помощью привычного запроса `INSERT`:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

Чтобы отправить данные отдельно от запроса:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

Можно указать любой формат данных. Например, можно указать формат «Values» — тот же, что используется при выполнении `INSERT INTO t VALUES`:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

Чтобы вставить данные из дампа с разделителями-табуляциями, укажите соответствующий формат:

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
Данные выводятся в произвольном порядке из‑за параллельной обработки запроса.
:::

Чтобы удалить таблицу:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

Для успешных запросов, не возвращающих таблицу данных, возвращается пустое тело ответа.


## Сжатие {#compression}

Сжатие можно использовать для уменьшения объема сетевого трафика при передаче больших объемов данных или для создания дампов, которые сразу сохраняются в сжатом виде.

Вы можете использовать внутренний формат сжатия ClickHouse при передаче данных. Сжатые данные имеют нестандартный формат, и для работы с ними требуется программа `clickhouse-compressor`. Она устанавливается по умолчанию с пакетом `clickhouse-client`. 

Чтобы повысить эффективность вставки данных, отключите проверку контрольных сумм на стороне сервера с помощью настройки [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress).

Если вы укажете `compress=1` в URL, сервер будет сжимать данные, которые отправляет клиенту. Если вы укажете `decompress=1` в URL, сервер будет распаковывать данные, которые вы передаёте методом `POST`.

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

Чтобы ClickHouse сжал ответ, добавьте к запросу заголовок `Accept-Encoding: compression_method`. 

Вы можете настроить уровень сжатия данных с помощью настройки [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) для всех методов сжатия.

:::info
Некоторые HTTP-клиенты могут по умолчанию распаковывать данные от сервера (для `gzip` и `deflate`), и вы можете получить уже распакованные данные, даже если правильно используете настройки сжатия.
:::



## Примеры {#examples-compression}

Чтобы отправить сжатые данные на сервер:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

Чтобы получить с сервера архив сжатых данных:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

Для получения сжатых данных с сервера и их распаковки используйте gunzip:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## База данных по умолчанию {#default-database}

Вы можете использовать параметр `database` в URL или заголовок `X-ClickHouse-Database`, чтобы указать базу данных по умолчанию.

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

По умолчанию в качестве базы данных по умолчанию используется та, которая указана в настройках сервера. Изначально это база данных с именем `default`. При необходимости вы всегда можете указать базу данных, добавив её имя и точку перед именем таблицы.


## Аутентификация {#authentication}

Имя пользователя и пароль можно указать одним из трёх способов:

1. С помощью базовой HTTP-аутентификации (HTTP Basic Authentication).

Например:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. В URL-параметрах `user` и `password`

:::warning
Мы не рекомендуем использовать этот метод, так как параметр может протоколироваться веб-прокси и кэшироваться в браузере
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
Вы также можете использовать параметры URL-адреса, чтобы указать любые настройки для обработки одного запроса или целого профиля настроек.

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

Дополнительную информацию см. в разделах:

* [Settings](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## Использование сессий ClickHouse в протоколе HTTP {#using-clickhouse-sessions-in-the-http-protocol}

Вы также можете использовать сессии ClickHouse в протоколе HTTP. Для этого необходимо добавить к запросу `GET`-параметр `session_id`. В качестве идентификатора сессии можно использовать любую строку.

По умолчанию сессия завершается после 60 секунд бездействия. Чтобы изменить этот таймаут (в секундах), измените настройку `default_session_timeout` в конфигурации сервера или добавьте к запросу `GET`-параметр `session_timeout`.

Чтобы проверить состояние сессии, используйте параметр `session_check=1`. В рамках одной сессии одновременно может выполняться только один запрос.

Вы можете получать информацию о ходе выполнения запроса в заголовках ответа `X-ClickHouse-Progress`. Для этого включите [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers).

Ниже приведён пример последовательности заголовков:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

Возможные поля заголовка:

| Header field         | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `read_rows`          | Количество прочитанных строк.                                 |
| `read_bytes`         | Объём прочитанных данных в байтах.                            |
| `total_rows_to_read` | Общее количество строк, подлежащих чтению.                    |
| `written_rows`       | Количество записанных строк.                                  |
| `written_bytes`      | Объём записанных данных в байтах.                             |
| `elapsed_ns`         | Время выполнения запроса в наносекундах.                      |
| `memory_usage`       | Объём памяти в байтах, использованный для выполнения запроса. |

Выполняющиеся запросы не останавливаются автоматически, если HTTP‑соединение потеряно. Разбор и форматирование данных выполняются на стороне сервера, и в таком случае использование сети может быть неэффективным.

Существуют следующие необязательные параметры:

| Parameters             | Description                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | Может быть передан как идентификатор запроса (произвольная строка). [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | Может быть передан как ключ квоты (произвольная строка). [«Quotas»](/operations/quotas)                                                            |

HTTP‑интерфейс позволяет передавать внешние данные (внешние временные таблицы) для выполнения запросов. Дополнительные сведения см. в разделе [«External data for query processing»](/engines/table-engines/special/external-data).


## Буферизация ответа {#response-buffering}

Буферизацию ответа можно включить на стороне сервера. Для этого предусмотрены следующие параметры URL:

* `buffer_size`
* `wait_end_of_query`

Можно использовать следующие настройки:

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` определяет объём результата в байтах, который будет буферизован в памяти сервера. Если тело результата превышает этот порог, буфер записывается в HTTP-канал, а оставшиеся данные отправляются напрямую в HTTP-канал.

Чтобы гарантировать буферизацию всего ответа, установите `wait_end_of_query=1`. В этом случае данные, не помещающиеся в память, будут буферизованы во временном файле на сервере.

Например:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
Используйте буферизацию, чтобы избежать ситуаций, когда ошибка обработки запроса возникает после того, как код ответа и HTTP-заголовки уже были отправлены клиенту. В таком случае сообщение об ошибке записывается в конце тела ответа, и на стороне клиента ошибка может быть обнаружена только при разборе ответа.
:::


## Установка роли с помощью параметров запроса {#setting-role-with-query-parameters}

Эта возможность была добавлена в ClickHouse 24.4.

В некоторых сценариях перед выполнением самого запроса может потребоваться сначала задать выданную роль. Однако отправить `SET ROLE` и сам запрос вместе нельзя, так как выполнение нескольких операторов в одном запросе не поддерживается:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

Приведённая выше команда вызывает ошибку:

```sql
Код: 62. DB::Exception: Синтаксическая ошибка (Выполнение нескольких операторов не разрешено)
```

Чтобы обойти это ограничение, используйте параметр запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

Это эквивалентно выполнению `SET ROLE my_role` перед выполнением запроса.

Кроме того, можно указать несколько параметров запроса `role`:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

В этом случае `?role=my_role&role=my_other_role` работает аналогично выполнению `SET ROLE my_role, my_other_role` перед выполнением запроса.


## Особенности кодов ответа HTTP {#http_response_codes_caveats}

Из-за ограничений протокола HTTP код ответа 200 не гарантирует, что запрос был успешно выполнен.

Вот пример:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Попытка подключения 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Код: 395. DB::Exception: Значение, переданное в функцию 'throwIf', не равно нулю: при выполнении 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

Причина такого поведения связана с природой протокола HTTP. Сначала отправляется HTTP‑заголовок с кодом 200, затем тело HTTP‑ответа, и уже после этого ошибка внедряется в это тело в виде обычного текста.

Такое поведение не зависит от используемого формата — будь то `Native`, `TSV` или `JSON`: сообщение об ошибке всегда будет находиться посередине потока ответа.

Вы можете частично смягчить эту проблему, включив `wait_end_of_query=1` ([Буферизация ответа](#response-buffering)). В этом случае отправка HTTP‑заголовка откладывается до тех пор, пока весь запрос не будет обработан. Однако это не полностью решает проблему, потому что результат по‑прежнему должен помещаться в [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size), а другие настройки, такие как [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers), могут нарушать задержку отправки заголовка.

:::tip
Единственный способ отловить все ошибки — проанализировать тело HTTP‑ответа до того, как вы начнёте разбирать его в требуемом формате.
:::

Такие исключения в ClickHouse имеют единый формат, приведённый ниже, независимо от используемого формата (например, `Native`, `TSV`, `JSON` и т. д.), если `http_write_exception_in_output_format=0` (значение по умолчанию). Это упрощает разбор и извлечение сообщений об ошибках на стороне клиента.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<сообщение_об_ошибке>\r\n
<длина_сообщения> <TAG>\r\n
__exception__\r\n

```

Где `<TAG>` — это 16-байтовый случайный тег, совпадающий с тегом, отправленным в заголовке ответа `X-ClickHouse-Exception-Tag`.
`<error message>` — это собственно текст сообщения об исключении (его точную длину можно узнать из `<message_length>`). Весь блок исключения, описанный выше, может иметь размер до 16 КиБ.

Ниже приведён пример в формате `JSON`

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

Вот аналогичный пример, но в формате `CSV`

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0
```


**исключение**
rumfyutuqkncbgau
Код: 395. DB::Exception: Значение, переданное в функцию &#39;throwIf&#39;, является ненулевым: при выполнении выражения &#39;FUNCTION throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8) :: 1) -&gt; throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8)) UInt8 : 0&#39;. (FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (версия 25.11.1.1)
262 rumfyutuqkncbgau
**исключение**

```
```


## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете создать запрос с параметрами и передавать им значения из соответствующих параметров HTTP-запроса. Для получения дополнительной информации см. раздел [Запросы с параметрами для CLI](../interfaces/cli.md#cli-queries-with-parameters).

### Пример {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### Табуляции в параметрах URL {#tabs-in-url-parameters}

Параметры запроса разбираются из «экранированного» формата. У этого есть некоторые преимущества, например возможность однозначно интерпретировать значения `NULL` как `\N`. Это означает, что символ табуляции должен быть закодирован как `\t` (или как `\` и табуляция). Например, в следующем примере между `abc` и `123` содержится реальный символ табуляции, и входная строка разбивается на два значения:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

Однако если вы попытаетесь закодировать символ табуляции, используя `%09` в параметре URL, он не будет корректно обработан:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Код: 457. DB::Exception: Значение abc    123 не может быть разобрано как String для параметра запроса 'arg1', так как оно разобрано не полностью: разобрано только 3 из 7 байтов: abc. (BAD_QUERY_PARAMETER) (версия 23.4.1.869 (официальная сборка))
```

Если вы используете параметры URL, вам необходимо закодировать `\t` как `%5C%09`. Например:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## Предопределённый HTTP-интерфейс {#predefined_http_interface}

ClickHouse поддерживает выполнение специальных запросов через HTTP-интерфейс. Например, вы можете записать данные в таблицу следующим образом:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse также поддерживает предопределённый HTTP‑интерфейс, который упрощает интеграцию со сторонними инструментами, такими как [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter). Рассмотрим пример.

Прежде всего добавьте этот раздел в файл конфигурации сервера.

`http_handlers` настроен так, чтобы содержать несколько правил `rule`. ClickHouse будет сопоставлять входящие HTTP‑запросы с предопределённым типом, указанным в `rule`, и обработчик будет запущен для первого совпавшего правила. Затем ClickHouse выполнит соответствующий предопределённый запрос, если сопоставление прошло успешно.

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

Теперь вы можете получать данные в формате Prometheus, обращаясь непосредственно по URL:


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
# HELP "Query" "Number of executing queries" {#help-query-number-of-executing-queries}
# TYPE "Query" counter {#type-query-counter}
"Query" 1
```


# HELP "Merge" "Количество выполняемых фоновых слияний" {#help-merge-number-of-executing-background-merges}
# TYPE "Merge" counter {#type-merge-counter}
"Merge" 0



# HELP "PartMutation" "Количество мутаций (ALTER DELETE/UPDATE)" {#help-partmutation-number-of-mutations-alter-deleteupdate}
# TYPE "PartMutation" counter {#type-partmutation-counter}
"PartMutation" 0



# HELP "ReplicatedFetch" "Количество частей данных, получаемых из реплики" {#help-replicatedfetch-number-of-data-parts-being-fetched-from-replica}
# TYPE "ReplicatedFetch" counter {#type-replicatedfetch-counter}
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;Количество частей данных, отправляемых на реплики&quot; {#help-replicatedsend-number-of-data-parts-being-sent-to-replicas}

# TYPE &quot;ReplicatedSend&quot; counter {#type-replicatedsend-counter}

&quot;ReplicatedSend&quot; 0

* Соединение №0 с хостом localhost оставлено открытым

* Соединение №0 с хостом localhost оставлено открытым

```

Параметры конфигурации `http_handlers` работают следующим образом.

`rule` может настраивать следующие параметры:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

Каждый из них описан ниже:

- `method` отвечает за сопоставление метода HTTP-запроса. `method` полностью соответствует определению [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) в протоколе HTTP. Это необязательный параметр. Если он не определён в   
  конфигурационном файле, сопоставление метода HTTP-запроса не выполняется.

- `url` отвечает за сопоставление части URL (пути и строки запроса) HTTP-запроса.
  Если `url` имеет префикс `regex:`, ожидаются регулярные выражения [RE2](https://github.com/google/re2).
  Это необязательный параметр. Если он не определён в конфигурационном файле, сопоставление части URL HTTP-запроса не выполняется.

- `full_url` аналогичен `url`, но включает полный URL, т. е. `schema://host:port/path?query_string`.
  Обратите внимание, что ClickHouse не поддерживает «виртуальные хосты», поэтому `host` является IP-адресом (а не значением заголовка `Host`).

- `empty_query_string` — гарантирует отсутствие строки запроса (`?query_string`) в запросе

- `headers` отвечает за сопоставление заголовков HTTP-запроса. Совместим с регулярными выражениями RE2. Это необязательный 
  параметр. Если он не определён в конфигурационном файле, сопоставление заголовков HTTP-запроса не выполняется.

- `handler` содержит основную часть обработки.

  Может иметь следующие значения `type`:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  И следующие параметры:
  - `query` — используется с типом `predefined_query_handler`, выполняет запрос при вызове обработчика.
  - `query_param_name` — используется с типом `dynamic_query_handler`, извлекает и выполняет значение, соответствующее `query_param_name` в 
       параметрах HTTP-запроса.
  - `status` — используется с типом `static`, код состояния ответа.
  - `content_type` — используется с любым типом, [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) ответа.
  - `http_response_headers` — используется с любым типом, карта заголовков ответа. Может также использоваться для установки типа содержимого.
  - `response_content` — используется с типом `static`, содержимое ответа, отправляемое клиенту; при использовании префикса 'file://' или 'config://' содержимое 
    извлекается из файла или конфигурации и отправляется клиенту.
  - `user` — пользователь, от имени которого выполняется запрос (пользователь по умолчанию — `default`).
    **Примечание**: не требуется указывать пароль для этого пользователя.

Методы конфигурации для различных значений `type` описаны далее.

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` поддерживает установку значений `Settings` и `query_params`. Вы можете настроить `query` в типе `predefined_query_handler`.

Значение `query` представляет собой предопределённый запрос `predefined_query_handler`, который выполняется ClickHouse при совпадении HTTP-запроса, и возвращается результат запроса. Это обязательный параметр.

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
В одном `predefined_query_handler` поддерживается только один `query`.
:::

### dynamic&#95;query&#95;handler {#dynamic_query_handler}

В `dynamic_query_handler` запрос передаётся в виде параметра HTTP‑запроса. В отличие от него, в `predefined_query_handler` запрос задаётся в конфигурационном файле. Параметр `query_param_name` может быть настроен в `dynamic_query_handler`.

ClickHouse извлекает и выполняет значение, соответствующее `query_param_name`, из URL HTTP‑запроса. Значение `query_param_name` по умолчанию — `/query`. Это необязательная настройка. Если параметр не определён в конфигурационном файле, он не передаётся.

Чтобы поэкспериментировать с этой функциональностью, в следующем примере задаются значения [`max_threads`](../operations/settings/settings.md#max_threads) и `max_final_threads`, а также выполняются запросы, чтобы проверить, были ли настройки успешно применены.

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

`static` может возвращать [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) и `response_content`. `response_content` задаёт возвращаемое содержимое.

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

`http_response_headers` можно использовать для указания типа контента вместо `content_type`.


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

Найдите содержимое конфигурации, отправленной клиенту.

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
$ sudo echo "<html><body>Файл с относительным путем</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Файл с абсолютным путем</body></html>" > $user_files_path/absolute_path_file.html
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
<html><body>Файл с абсолютным путем</body></html>
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
<html><body>Файл с относительным путем</body></html>
* Connection #0 to host localhost left intact
```

### redirect {#redirect}

`redirect` выполнит перенаправление `302` на `location`

Например, так вы можете автоматически добавить параметр `set user` в `play` для ClickHouse Play:

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

ClickHouse позволяет настраивать пользовательские HTTP-заголовки ответа, которые могут применяться к любому настраиваемому обработчику. Эти заголовки можно задать с помощью настройки `http_response_headers`, которая принимает пары ключ-значение, представляющие имена заголовков и их значения. Эта возможность особенно полезна для реализации пользовательских заголовков безопасности, политик CORS или любых других требований к HTTP-заголовкам для всего HTTP-интерфейса ClickHouse.

Например, вы можете настроить заголовки для:

* Обычных эндпоинтов выполнения запросов
* Web UI
* Проверки работоспособности.

Также можно указать `common_http_response_headers`. Они будут применены ко всем HTTP-обработчикам, определённым в конфигурации.

Заголовки будут включены в HTTP-ответ для каждого настроенного обработчика.

В примере ниже каждый ответ сервера будет содержать два пользовательских заголовка: `X-My-Common-Header` и `X-My-Custom-Header`.

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>Общий заголовок</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>Пользовательский заголовок</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## Корректный JSON/XML-ответ при исключении во время HTTP‑стриминга {#valid-output-on-exception-http-streaming}

Во время выполнения запроса по HTTP может произойти исключение, когда часть данных уже была отправлена. Обычно исключение отправляется клиенту в виде обычного текста.
При этом, даже если для вывода использовался определённый формат данных, результат может стать некорректным с точки зрения этого формата.
Чтобы избежать этого, вы можете использовать настройку [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) (по умолчанию отключена), которая заставляет ClickHouse записывать исключение в заданном формате (в настоящее время поддерживаются форматы XML и JSON*).

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

    "exception": "Code: 395. DB::Exception: Значение, переданное в функцию 'throwIf', не равно нулю: при выполнении 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (версия 23.8.1.1)"
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
