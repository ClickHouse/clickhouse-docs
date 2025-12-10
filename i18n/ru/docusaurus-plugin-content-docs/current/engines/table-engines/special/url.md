---
description: 'Позволяет запрашивать и отправлять данные на удалённый HTTP/HTTPS-сервер. Этот движок аналогичен движку File.'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'Табличный движок URL'
doc_type: 'reference'
---

# Движок таблицы URL {#url-table-engine}

Выполняет чтение и запись данных на удалённый HTTP/HTTPS-сервер. Этот движок похож на движок [File](../../../engines/table-engines/special/file.md).

Синтаксис: `URL(URL [,Format] [,CompressionMethod])`

- Параметр `URL` должен соответствовать структуре Uniform Resource Locator. Указанный URL должен указывать на сервер, использующий HTTP или HTTPS. Для получения ответа от сервера не требуются дополнительные заголовки.

- `Format` должен быть форматом, который ClickHouse может использовать в запросах `SELECT` и, при необходимости, в запросах `INSERT`. Полный список поддерживаемых форматов см. в разделе [Formats](/interfaces/formats#formats-overview).

    Если этот аргумент не указан, ClickHouse автоматически определяет формат по суффиксу параметра `URL`. Если суффикс параметра `URL` не соответствует ни одному из поддерживаемых форматов, создание таблицы завершится с ошибкой. Например, для выражения движка `URL('http://localhost/test.json')` будет применён формат `JSON`.

- `CompressionMethod` указывает, нужно ли сжимать тело HTTP-запроса. Если сжатие включено, HTTP-пакеты, отправляемые движком URL, содержат заголовок `Content-Encoding`, который указывает, какой метод сжатия используется.

Чтобы включить сжатие, сначала убедитесь, что удалённая HTTP‑конечная точка, указанная параметром `URL`, поддерживает соответствующий алгоритм сжатия.

Поддерживаемое значение `CompressionMethod` должно быть одним из следующих:
- gzip или gz
- deflate
- brotli или br
- lzma или xz
- zstd или zst
- lz4
- bz2
- snappy
- none
- auto

Если `CompressionMethod` не указан, по умолчанию используется значение `auto`. Это означает, что ClickHouse автоматически определяет метод сжатия по суффиксу параметра `URL`. Если суффикс совпадает с каким-либо из перечисленных выше методов сжатия, применяется соответствующее сжатие, в противном случае сжатие не включается.

Например, для выражения движка `URL('http://localhost/test.gzip')` применяется метод сжатия `gzip`, но для `URL('http://localhost/test.fr')` сжатие не включается, поскольку суффикс `fr` не соответствует ни одному из указанных выше методов сжатия.

## Использование {#using-the-engine-in-the-clickhouse-server}

Запросы `INSERT` и `SELECT` преобразуются соответственно в HTTP-запросы `POST` и `GET`. Для обработки `POST`-запросов удалённый сервер должен поддерживать [передачу с кодированием фрагментами (Chunked transfer encoding)](https://en.wikipedia.org/wiki/Chunked_transfer_encoding).

Вы можете ограничить максимальное количество переходов по перенаправлениям для HTTP-запросов GET с помощью настройки [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects).

## Пример {#example}

**1.** Создайте таблицу `url_engine_table` на сервере:

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** Создайте базовый HTTP-сервер, используя стандартные средства Python 3
и запустите его:

```python3
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('Hello,1\nWorld,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```bash
$ python3 server.py
```

**3.** Выполните запрос данных:

```sql
SELECT * FROM url_engine_table
```

```text
┌─word──┬─value─┐
│ Привет │     1 │
│ Мир │     2 │
└───────┴───────┘
```

## Подробности реализации {#details-of-implementation}

- Возможны параллельные операции чтения и записи
- Не поддерживаются:
  - Операции `ALTER` и `SELECT...SAMPLE`.
  - Индексы.
  - Репликация.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к URL-ресурсу. Тип: `LowCardinality(String)`.
- `_file` — Имя URL-ресурса. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_headers` — Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Настройки хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключена.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) — позволяет включать и отключать кодирование и декодирование пути в URI. По умолчанию включена.
