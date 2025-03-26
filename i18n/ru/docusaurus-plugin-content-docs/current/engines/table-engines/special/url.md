---
description: 'Запрашивает данные к удаленному серверу HTTP/HTTPS. Этот движок похож на движок [File](../../../engines/table-engines/special/file.md).'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'Движок таблиц URL'
---


# Движок таблиц URL

Запрашивает данные к удаленному серверу HTTP/HTTPS. Этот движок похож на движок [File](../../../engines/table-engines/special/file.md).

Синтаксис: `URL(URL [,Format] [,CompressionMethod])`

- Параметр `URL` должен соответствовать структуре универсального указателя ресурса. Указанный URL должен указывать на сервер, использующий HTTP или HTTPS. Это не требует дополнительных заголовков для получения ответа от сервера.

- `Format` должен быть одним из тех, что ClickHouse может использовать в запросах `SELECT` и, если необходимо, в `INSERT`. Для полного списка поддерживаемых форматов см. [Форматы](/interfaces/formats#formats-overview).

    Если этот аргумент не указан, ClickHouse автоматически определяет формат по суффиксу параметра `URL`. Если суффикс параметра `URL` не совпадает ни с одним из поддерживаемых форматов, создание таблицы не удастся. Например, для выражения движка `URL('http://localhost/test.json')` применяется формат `JSON`.

- `CompressionMethod` указывает, следует ли сжимать HTTP-тело. Если сжатие включено, HTTP-пакеты, отправленные движком URL, содержат заголовок 'Content-Encoding', чтобы указать, какой метод сжатия используется.

Чтобы включить сжатие, сначала убедитесь, что удаленная HTTP-точка, указанная параметром `URL`, поддерживает соответствующий алгоритм сжатия.

Поддерживаемый `CompressionMethod` должен быть одним из следующих:
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

Если `CompressionMethod` не указан, по умолчанию используется `auto`. Это означает, что ClickHouse автоматически определяет метод сжатия по суффиксу параметра `URL`. Если суффикс соответствует любому из перечисленных методов сжатия, применяется соответствующее сжатие, либо оно не будет включено.

Например, для выражения движка `URL('http://localhost/test.gzip')` применяется метод сжатия `gzip`, но для `URL('http://localhost/test.fr')` сжатие не включается, так как суффикс `fr` не совпадает с никакими методами сжатия выше.

## Использование {#using-the-engine-in-the-clickhouse-server}

Запросы `INSERT` и `SELECT` преобразуются в запросы `POST` и `GET`, соответственно. Для обработки запросов `POST` удаленный сервер должен поддерживать
[Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding).

Вы можете ограничить максимальное количество переходов по перенаправлениям HTTP GET, используя настройку [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects).

## Пример {#example}

**1.** Создайте таблицу `url_engine_table` на сервере:

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** Создайте базовый HTTP-сервер, используя стандартные инструменты Python 3, и запустите его:

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

**3.** Запросите данные:

```sql
SELECT * FROM url_engine_table
```

```text
┌─word──┬─value─┐
│ Hello │     1 │
│ World │     2 │
└───────┴───────┘
```

## Подробности реализации {#details-of-implementation}

- Чтения и записи могут происходить параллельно.
- Не поддерживается:
    - Операции `ALTER` и `SELECT...SAMPLE`.
    - Индексы.
    - Репликация.

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_headers` - Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.

## Настройки хранения {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/выключать декодирование/кодирование пути в uri. Включено по умолчанию.
