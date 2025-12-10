---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Страница, описывающая сопоставление типов данных MongoDB ClickPipes из MongoDB в ClickHouse'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

MongoDB хранит записи как BSON-документы. В ClickPipes вы можете настроить приём BSON-документов в ClickHouse в виде JSON или JSON-строки. В следующей таблице показано поддерживаемое сопоставление типов полей BSON в JSON:

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | формат ISO 8601          |
| Regular Expression       | \{Options: String, Pattern: String\}   | регулярное выражение MongoDB с фиксированными полями: Options (флаги regex) и Pattern (шаблон regex) |
| Timestamp                | \{T: Int64, I: Int64\}                 | внутренний формат временной метки MongoDB с фиксированными полями: T (timestamp) и I (increment) |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | двоичные данные MongoDB с фиксированными полями: Data (закодированы в base64) и Subtype ([тип двоичных данных](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | массивы с однородными типами становятся Array(Nullable(T)); массивы со смешанными примитивными типами приводятся к наиболее общему типу; массивы со сложными несовместимыми типами становятся Tuples |
| Object                   | Dynamic                                | каждое вложенное поле сопоставляется рекурсивно |

:::info
Чтобы узнать больше о типах данных JSON в ClickHouse, см. [нашу документацию](https://clickhouse.com/docs/sql-reference/data-types/newjson).
:::