---
slug: '/sql-reference/table-functions/urlCluster'
sidebar_label: urlCluster
sidebar_position: 201
description: 'Позволяет обрабатывать файлы из URL параллельно с многих узлов в заданном'
title: urlCluster
doc_type: reference
---
# urlCluster Табличная Функция

Позволяет обрабатывать файлы из URL в параллельном режиме с множества узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере, раскрывается звездочка в пути к файлу URL и динамически распределяются каждый файл. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и обрабатывает её. Это повторяется, пока все задачи не будут завершены.

## Синтаксис {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```

## Аргументы {#arguments}

| Аргумент       | Описание                                                                                                                                              |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | Имя кластера, которое используется для формирования набора адресов и параметров подключения к удаленным и локальным серверам.                        |
| `URL`          | Адрес HTTP или HTTPS сервера, который может принимать `GET` запросы. Тип: [String](../../sql-reference/data-types/string.md).                       |
| `format`       | [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).                                                  |
| `structure`    | Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы колонок. Тип: [String](../../sql-reference/data-types/string.md). |

## Возвращаемое значение {#returned_value}

Таблица с указанным форматом и структурой и с данными из определённого `URL`.

## Примеры {#examples}

Получение первых 3 строк таблицы, содержащей колонки типа `String` и [UInt32](../../sql-reference/data-types/int-uint.md) из HTTP-сервера, который отвечает в [CSV](../../interfaces/formats.md#csv) формате.

1. Создайте базовый HTTP-сервер с использованием стандартных инструментов Python 3 и запустите его:

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

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```

## Глобусы в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания резервных адресов. Поддерживаемые типы шаблонов и примеры см. в описании функции [remote](remote.md#globs-in-addresses). 
Символ `|` внутри шаблонов используется для указания резервных адресов. Они перебираются в том же порядке, в каком они перечислены в шаблоне. Количество сгенерированных адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).

## Связанные темы {#related}

-   [HDFS engine](/engines/table-engines/integrations/hdfs)
-   [URL табличная функция](/engines/table-engines/special/url)