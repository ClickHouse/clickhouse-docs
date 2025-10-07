---
'title': 'Поддерживаемые типы данных'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': 'Страница, описывающая отображение типов данных MySQL ClickPipe из
  MySQL в ClickHouse'
'doc_type': 'reference'
---

Вот поддерживаемое отображение типов данных для MySQL ClickPipe:

| MySQL Type                | ClickHouse type        | Примечания                                                                              |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | Поддерживает беззнаковый.                                                              |
| SmallInt                  | Int16                  | Поддерживает беззнаковый.                                                              |
| MediumInt, Int            | Int32                  | Поддерживает беззнаковый.                                                              |
| BigInt                    | Int64                  | Поддерживает беззнаковый.                                                              |
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | Только для MySQL; MariaDB `json` является просто псевдонимом для `text` с ограничением. |
| Geometry & Geometry Types | String                 | WKT (Well-Known Text). WKT может страдать от небольшой потери точности.                  |
| Vector                    | Array(Float32)         | Только для MySQL; поддержка будет добавлена в ближайшее время в MariaDB.                |
| Float                     | Float32                | Точность в ClickHouse может отличаться от MySQL во время начальной загрузки из-за текстового протокола.|
| Double                    | Float64                | Точность в ClickHouse может отличаться от MySQL во время начальной загрузки из-за текстового протокола.|
| Date                      | Date32                 | 00 день/месяц сопоставляется с 01.                                                    |
| Time                      | DateTime64(6)          | Смещение времени от эпохи unix.                                                       |
| Datetime, Timestamp       | DateTime64(6)          | 00 день/месяц сопоставляется с 01.                                                    |
