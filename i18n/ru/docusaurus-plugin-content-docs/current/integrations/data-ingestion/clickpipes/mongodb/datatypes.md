---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Страница, описывающая сопоставление типов данных MongoDB ClickPipe при загрузке из MongoDB в ClickHouse'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

MongoDB хранит данные в виде документов BSON. В ClickPipes вы можете настроить загрузку документов BSON в ClickHouse либо в формате JSON, либо как строку JSON (JSON String). В следующей таблице показано поддерживаемое сопоставление типов полей BSON и JSON:

| Тип BSON MongoDB         | Тип JSON ClickHouse                    | Примечания               |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | формат ISO 8601          |
| Regular Expression       | \{Options: String, Pattern: String\}   | Регулярное выражение MongoDB с фиксированными полями: Options (флаги регулярного выражения) и Pattern (шаблон регулярного выражения) |
| Timestamp                | \{T: Int64, I: Int64\}                 | Внутренний формат временной метки MongoDB с фиксированными полями: T (timestamp) и I (increment) |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | Двоичные данные MongoDB с фиксированными полями: Data (в кодировке base64) и Subtype ([тип двоичных данных](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | Массивы с однородными типами становятся Array(Nullable(T)); массивы со смешанными примитивными типами приводятся к наиболее общему совместимому типу; массивы со сложными несовместимыми типами становятся Tuple |
| Object                   | Dynamic                                | Каждое вложенное поле сопоставляется рекурсивно |

:::info
Чтобы узнать больше о типах данных JSON в ClickHouse, см. [нашу документацию](https://clickhouse.com/docs/sql-reference/data-types/newjson).
:::