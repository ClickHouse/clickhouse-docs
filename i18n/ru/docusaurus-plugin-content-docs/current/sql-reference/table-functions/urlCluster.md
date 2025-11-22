---
description: 'Позволяет параллельно обрабатывать файлы по URL на множестве узлов указанного кластера.'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# Функция-таблица urlCluster

Позволяет параллельно обрабатывать файлы по URL с множества узлов в заданном кластере. На инициаторе создаётся соединение со всеми узлами в кластере, в пути к файлу URL раскрывается символ «звёздочка», и каждый файл динамически распределяется. На рабочем узле он запрашивает у инициатора следующую задачу и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут завершены.



## Синтаксис {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```


## Аргументы {#arguments}

| Аргумент       | Описание                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам.                                  |
| `URL`          | Адрес HTTP- или HTTPS-сервера, который может принимать `GET`-запросы. Тип: [String](../../sql-reference/data-types/string.md).                        |
| `format`       | [Формат](/sql-reference/formats) данных. Тип: [String](../../sql-reference/data-types/string.md).                                                     |
| `structure`    | Структура таблицы в формате `'UserID UInt64, Name String'`. Определяет имена и типы столбцов. Тип: [String](../../sql-reference/data-types/string.md). |


## Возвращаемое значение {#returned_value}

Таблица с указанными форматом и структурой, содержащая данные из заданного `URL`.


## Примеры {#examples}

Получение первых 3 строк таблицы, содержащей столбцы типов `String` и [UInt32](../../sql-reference/data-types/int-uint.md), с HTTP-сервера, который возвращает данные в формате [CSV](/interfaces/formats/CSV).

1. Создайте базовый HTTP-сервер с помощью стандартных инструментов Python 3 и запустите его:

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


## Глобы в URL {#globs-in-url}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов или для указания резервных адресов. Поддерживаемые типы шаблонов и примеры см. в описании функции [remote](remote.md#globs-in-addresses).
Символ `|` внутри шаблонов используется для указания резервных адресов. Они перебираются в том же порядке, в котором указаны в шаблоне. Количество генерируемых адресов ограничено настройкой [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements).


## Связанные материалы {#related}

- [Движок HDFS](/engines/table-engines/integrations/hdfs)
- [Табличная функция URL](/engines/table-engines/special/url)
