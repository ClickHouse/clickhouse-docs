---
description: 'Документация для Odbc Bridge'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
---

Простой HTTP-сервер, который работает как прокси для ODBC-драйвера. Основной мотив был связан с возможными сегментационными ошибками или другими сбоями в реализациях ODBC, которые могут привести к сбою всего процесса clickhouse-server.

Этот инструмент работает через HTTP, а не через каналы, общую память или TCP, потому что:
- Проще реализовать
- Проще отлаживать
- jdbc-bridge можно реализовать тем же образом

## Использование {#usage}

`clickhouse-server` использует этот инструмент внутри табличной функции odbc и StorageODBC. Однако его можно использовать как отдельный инструмент из командной строки с следующими параметрами в URL POST-запроса:
- `connection_string` -- ODBC строка подключения.
- `sample_block` -- описание колонок в формате ClickHouse NamesAndTypesList, имена в обратных кавычках, тип в виде строки. Имя и тип разделяются пробелом, строки разделяются новой строкой.
- `max_block_size` -- необязательный параметр, устанавливающий максимальный размер одного блока. Запрос отправляется в теле POST. Ответ возвращается в формате RowBinary.

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
