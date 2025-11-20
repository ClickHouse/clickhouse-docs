---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Страница, описывающая сопоставление типов данных MySQL ClickPipe из MySQL в ClickHouse'
doc_type: 'reference'
keywords: ['MySQL ClickPipe datatypes', 'типы данных MySQL в ClickHouse', 'ClickPipe datatype mapping', 'MySQL ClickHouse type conversion', 'database type compatibility']
---

Ниже приведено поддерживаемое сопоставление типов данных для MySQL ClickPipe:

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | Поддерживает unsigned.|
| SmallInt                  | Int16                  | Поддерживает unsigned.|
| MediumInt, Int            | Int32                  | Поддерживает unsigned.|
| BigInt                    | Int64                  | Поддерживает unsigned.|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | Только MySQL; в MariaDB `json` — это просто псевдоним для `text` с ограничением.       |
| Geometry & Geometry Types | String                 | WKT (Well-Known Text). В WKT возможна небольшая потеря точности.                       |
| Vector                    | Array(Float32)         | Только MySQL; поддержка в MariaDB появится в ближайшее время.                          |
| Float                     | Float32                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из-за текстового протокола.|
| Double                    | Float64                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из-за текстового протокола.|
| Date                      | Date32                 | День/месяц 00 преобразуется в 01.|
| Time                      | DateTime64(6)          | Временное смещение относительно Unix-эпохи.|
| Datetime, Timestamp       | DateTime64(6)          | День/месяц 00 преобразуется в 01.|