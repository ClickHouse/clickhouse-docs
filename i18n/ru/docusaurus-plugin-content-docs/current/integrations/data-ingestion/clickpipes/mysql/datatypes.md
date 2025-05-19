---
title: 'ClickPipes для MySQL: Поддерживаемые типы данных'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Страница, описывающая отображение типов данных ClickPipe MySQL в ClickHouse'
---

Вот отображение поддерживаемых типов данных для ClickPipe MySQL:

| Тип MySQL                                                                  | Тип ClickHouse                             | Примечания                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                    |                                                                                       |
| Set                                                                        | String                                    |                                                                                       |
| Decimal                                                                    | Decimal                                   |                                                                                       |
| TinyInt                                                                    | Int8                                      | Поддерживает беззнаковые.                                                              |
| SmallInt                                                                   | Int16                                     | Поддерживает беззнаковые.                                                              |
| MediumInt, Int                                                             | Int32                                     | Поддерживает беззнаковые.                                                              |
| BigInt                                                                     | Int64                                     | Поддерживает беззнаковые.                                                              |
| Year                                                                       | Int16                                     |                                                                                       |
| TinyText, Text, MediumText, LongText                                       | String                                    |                                                                                       |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                    |                                                                                       |
| Char, Varchar                                                              | String                                    |                                                                                       |
| Binary, VarBinary                                                          | String                                    |                                                                                       |
| TinyInt(1)                                                                 | Bool                                      |                                                                                       |
| JSON                                                                       | String                                    | Только MySQL; MariaDB `json` является лишь псевдонимом для `text` с ограничением.      |
| Geometry & Geometry Types                                                 | String                                    | WKT (Well-Known Text). WKT может незначительно терять точность.                      |
| Vector                                                                     | Array(Float32)                           | Только MySQL; поддержка в MariaDB будет добавлена в ближайшее время.                  |
| Float                                                                      | Float32                                   | Точность в ClickHouse может отличаться от MySQL во время первоначальной загрузки из-за текстовых протоколов. |
| Double                                                                     | Float64                                   | Точность в ClickHouse может отличаться от MySQL во время первоначальной загрузки из-за текстовых протоколов. |
| Date                                                                       | Date32                                    |                                                                                       |
| Time                                                                       | DateTime64(6)                            | Дата представляет собой эпоху Unix.                                                   |
| Datetime, Timestamp                                                        | DateTime64(6)                            |                                                                                       |
