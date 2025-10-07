---
'title': 'Поддерживаемые типы данных'
'slug': '/integrations/clickpipes/mongodb/datatypes'
'description': 'Страница, описывающая сопоставление типов данных MongoDB ClickPipe
  от MongoDB к ClickHouse'
'doc_type': 'reference'
---
MongoDB хранит записи данных в виде BSON-документов. В ClickPipes вы можете настроить прием BSON-документов в ClickHouse как JSON или JSON String. В следующей таблице показано соответствие типов полей BSON и JSON:

| Тип BSON MongoDB        | Тип JSON ClickHouse                   | Примечания               |
| ----------------------- | ------------------------------------- | ------------------------ |
| ObjectId                | String                                |                          |
| String                  | String                                |                          |
| 32-битное целое число   | Int64                                 |                          |
| 64-битное целое число   | Int64                                 |                          |
| Double                  | Float64                               |                          |
| Boolean                 | Bool                                  |                          |
| Date                    | String                                | Формат ISO 8601         |
| Регулярное выражение    | \{Options: String, Pattern: String\}  | Регулярное выражение MongoDB с фиксированными полями: Options (флаги регулярного выражения) и Pattern (шаблон регулярного выражения) |
| Timestamp               | \{T: Int64, I: Int64\}                | Внутренний формат временной метки MongoDB с фиксированными полями: T (временная метка) и I (инкремент) |
| Decimal128              | String                                |                          |
| Двоичные данные         | \{Data: String, Subtype: Int64\}      | Двоичные данные MongoDB с фиксированными полями: Data (base64-кодированный) и Subtype ([тип двоичных данных](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript              | String                                |                          |
| Null                    | Null                                  |                          |
| Массив                  | Dynamic                               | Массивы с однородными типами становятся Array(Nullable(T)); массивы с смешанными примитивными типами повышаются до самого общего типа; массивы со сложными несовместимыми типами становятся кортежами |
| Объект                  | Dynamic                               | Каждое вложенное поле сопоставляется рекурсивно |

:::info
Чтобы узнать больше о типах данных JSON в ClickHouse, смотрите [нашу документацию](https://clickhouse.com/docs/sql-reference/data-types/newjson).
:::