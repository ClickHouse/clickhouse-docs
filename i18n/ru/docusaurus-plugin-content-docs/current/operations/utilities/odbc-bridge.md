---
description: 'Документация по Odbc Bridge'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

Простой HTTP-сервер, который работает как прокси для драйвера ODBC. Основная мотивация
заключалась в возможных аварийных завершениях (segfault) или других сбоях в реализациях ODBC, которые могут
привести к падению всего процесса clickhouse-server.

Этот инструмент работает по HTTP, а не через каналы (pipes), разделяемую память или TCP, потому что:
- это проще реализовать;
- это проще отлаживать;
- jdbc-bridge можно реализовать таким же образом.



## Использование {#usage}

`clickhouse-server` использует этот инструмент внутри табличной функции `odbc` и StorageODBC.
Однако он может использоваться как самостоятельный инструмент из командной строки
со следующими параметрами в URL POST-запроса:
- `connection_string` -- строка подключения ODBC.
- `sample_block` -- описание столбцов в формате ClickHouse NamesAndTypesList, имя в обратных
  кавычках, тип в виде строки. Имя и тип разделены пробелом, строки разделены
  переводом строки.
- `max_block_size` -- необязательный параметр, задает максимальный размер одного блока.
Запрос передается в теле POST-запроса. Ответ возвращается в формате RowBinary.



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
