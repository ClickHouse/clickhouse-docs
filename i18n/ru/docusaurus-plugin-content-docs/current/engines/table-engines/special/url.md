---
description: 'Выполняет запросы на чтение и запись данных к удалённому серверу по HTTP/HTTPS. Этот движок аналогичен движку File.'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'Табличный движок URL'
doc_type: 'reference'
---



# Движок таблиц URL

Позволяет запрашивать данные с/на удалённый HTTP/HTTPS‑сервер. Этот движок похож на движок [File](../../../engines/table-engines/special/file.md).

Синтаксис: `URL(URL [,Format] [,CompressionMethod])`

- Параметр `URL` должен соответствовать структуре унифицированного указателя ресурса (URL). Указанный URL должен указывать на сервер, использующий HTTP или HTTPS. Для получения ответа от сервера не требуются дополнительные заголовки.

- `Format` должен быть форматом, который ClickHouse может использовать в запросах `SELECT` и, при необходимости, в `INSERT`. Полный список поддерживаемых форматов см. в разделе [Formats](/interfaces/formats#formats-overview).

    Если этот аргумент не указан, ClickHouse автоматически определяет формат по суффиксу параметра `URL`. Если суффикс параметра `URL` не соответствует ни одному поддерживаемому формату, создание таблицы завершается с ошибкой. Например, для выражения движка `URL('http://localhost/test.json')` используется формат `JSON`.

- `CompressionMethod` указывает, должно ли HTTP‑тело быть сжато. Если сжатие включено, HTTP‑пакеты, отправляемые движком URL, содержат заголовок `Content-Encoding`, указывающий, какой метод сжатия используется.

Чтобы включить сжатие, сначала убедитесь, что удалённая HTTP‑конечная точка, заданная параметром `URL`, поддерживает соответствующий алгоритм сжатия.

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

Если `CompressionMethod` не указан, по умолчанию используется значение `auto`. Это означает, что ClickHouse автоматически определяет метод сжатия по суффиксу параметра `URL`. Если суффикс соответствует одному из перечисленных выше методов сжатия, применяется соответствующее сжатие, иначе сжатие не включается.

Например, для выражения движка `URL('http://localhost/test.gzip')` используется метод сжатия `gzip`, но для `URL('http://localhost/test.fr')` сжатие не включается, поскольку суффикс `fr` не совпадает ни с одним из методов сжатия, перечисленных выше.



## Использование {#using-the-engine-in-the-clickhouse-server}

Запросы `INSERT` и `SELECT` преобразуются в HTTP-запросы `POST` и `GET`
соответственно. Для обработки запросов `POST` удалённый сервер должен поддерживать
[Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding).

Максимальное количество переходов по перенаправлениям HTTP GET можно ограничить с помощью настройки [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects).


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


## Детали реализации {#details-of-implementation}

- Чтение и запись могут выполняться параллельно
- Не поддерживаются:
  - Операции `ALTER` и `SELECT...SAMPLE`.
  - Индексы.
  - Репликация.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к `URL`. Тип: `LowCardinality(String)`.
- `_file` — Имя ресурса `URL`. Тип: `LowCardinality(String)`.
- `_size` — Размер ресурса в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_headers` — Заголовки HTTP-ответа. Тип: `Map(LowCardinality(String), LowCardinality(String))`.


## Настройки хранилища {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - позволяет включать/отключать декодирование/кодирование пути в URI. Включено по умолчанию.
