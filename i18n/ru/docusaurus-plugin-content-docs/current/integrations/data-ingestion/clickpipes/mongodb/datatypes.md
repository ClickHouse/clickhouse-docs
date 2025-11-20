---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Страница, описывающая сопоставление типов данных MongoDB ClickPipe из MongoDB в ClickHouse'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

MongoDB хранит записи данных в виде BSON-документов. В ClickPipes вы можете настроить загрузку BSON-документов в ClickHouse в виде `JSON` или `JSON String`. В следующей таблице показано поддерживаемое сопоставление типов полей BSON в типы полей JSON:

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | Формат ISO 8601          |
| Regular Expression       | \{Options: String, Pattern: String\}   | Регулярное выражение MongoDB с фиксированными полями: Options (флаги regex) и Pattern (шаблон regex) |
| Timestamp                | \{T: Int64, I: Int64\}                 | Внутренний формат временной метки MongoDB с фиксированными полями: T (timestamp) и I (increment) |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | Двоичные данные MongoDB с фиксированными полями: Data (в кодировке base64) и Subtype ([тип двоичных данных](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | Массивы с однородными типами становятся Array(Nullable(T)); массивы со смешанными примитивными типами приводятся к наиболее общему типу; массивы со сложными несовместимыми типами становятся Tuples |
| Object                   | Dynamic                                | Каждое вложенное поле сопоставляется рекурсивно |

:::info
Чтобы узнать больше о типах данных JSON в ClickHouse, см. [нашу документацию](https://clickhouse.com/docs/sql-reference/data-types/newjson).
:::