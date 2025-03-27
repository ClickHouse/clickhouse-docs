---
description: 'Документация для Odbc Bridge'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
---

Простой HTTP-сервер, который работает как прокси для ODBC-драйвера. Основная мотивация заключалась в возможных segfault или других ошибках в реализациях ODBC, которые могут привести к сбою всего процесса clickhouse-server.

Этот инструмент работает через HTTP, а не через каналы, общую память или TCP, потому что:
- Проще реализовать
- Проще отлаживать
- jdbc-bridge может быть реализован аналогичным образом

## Использование {#usage}

`clickhouse-server` использует этот инструмент внутри функции таблицы odbc и StorageODBC.
Тем не менее, его можно использовать в качестве отдельного инструмента из командной строки с следующими параметрами в URL POST-запроса:
- `connection_string` -- строка подключения ODBC.
- `sample_block` -- описание столбцов в формате NamesAndTypesList ClickHouse, имя в обратных кавычках,
  тип в виде строки. Имя и тип разделены пробелом, строки разделены
  переводом строки.
- `max_block_size` -- необязательный параметр, устанавливающий максимальный размер одного блока.
Запрос отправляется в теле POST. Ответ возвращается в формате RowBinary.

## Пример: {#example}

```bash
$ clickhouse-odbc-bridge --http-port 9018 --daemon

$ curl -d "query=SELECT PageID, ImpID, AdType FROM Keys ORDER BY PageID, ImpID" --data-urlencode "connection_string=DSN=ClickHouse;DATABASE=stat" --data-urlencode "sample_block=columns format version: 1
3 columns:
\`PageID\` String
\`ImpID\` String
\`AdType\` String
"  "http://localhost:9018/" > result.txt

$ cat result.txt
12246623837185725195925621517
```
