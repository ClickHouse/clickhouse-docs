---
slug: /sql-reference/table-functions/urlCluster
sidebar_position: 201
sidebar_label: urlCluster
title: "urlCluster"
description: "Позволяет обрабатывать файлы из URL параллельно с многих узлов в указанном кластере."
---


# Функция табличного типа urlCluster

Позволяет обрабатывать файлы из URL параллельно с многих узлов в указанном кластере. На инициаторе она создает соединение со всеми узлами в кластере, раскрывает символ звездочки в пути к файлу URL и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и выполняет ее. Это повторяется до тех пор, пока все задачи не будут завершены.

**Синтаксис**

``` sql
urlCluster(cluster_name, URL, format, structure)
```

**Аргументы**

-   `cluster_name` — Имя кластера, который используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `URL` — Адрес HTTP или HTTPS сервера, который может принимать `GET` запросы. Тип: [String](../../sql-reference/data-types/string.md).
- `format` — [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).
- `structure` — Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

Таблица с указанным форматом и структурой и с данными из определенного `URL`.

**Примеры**

Получение первых 3 строк таблицы, которая содержит колонки типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) с HTTP-сервера, который отвечает в формате [CSV](../../interfaces/formats.md#csv).

1. Создайте простой HTTP сервер с использованием стандартных инструментов Python 3 и запустите его:

```python
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

``` sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```

## Глобальные шаблоны в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания адресов на случай сбоя. Поддерживаемые типы шаблонов и примеры смотрите в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания адресов на случай сбоя. Они перебираются в том порядке, в котором указаны в шаблоне. Количество генерируемых адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

**Смотрите также**

-   [HDFS engine](../../engines/table-engines/special/url.md)
-   [Функция табличного типа URL](../../sql-reference/table-functions/url.md)
