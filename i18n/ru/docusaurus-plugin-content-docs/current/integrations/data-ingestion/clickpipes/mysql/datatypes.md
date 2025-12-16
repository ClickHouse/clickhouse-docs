---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Страница, описывающая соответствие типов данных MySQL ClickPipe при загрузке из MySQL в ClickHouse'
doc_type: 'reference'
keywords: ['типы данных MySQL ClickPipe', 'типы данных MySQL в ClickHouse', 'сопоставление типов данных ClickPipe', 'преобразование типов MySQL ClickHouse', 'совместимость типов баз данных']
---

Ниже приведено поддерживаемое соответствие типов данных для MySQL ClickPipe:

| Тип MySQL                 | Тип ClickHouse         | Примечания                                                                            |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | Поддерживается UNSIGNED.|
| SmallInt                  | Int16                  | Поддерживается UNSIGNED.|
| MediumInt, Int            | Int32                  | Поддерживается UNSIGNED.|
| BigInt                    | Int64                  | Поддерживается UNSIGNED.|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | Только MySQL; в MariaDB `json` — это всего лишь псевдоним для `text` с ограничением.  |
| Geometry & Geometry Types | String                 | WKT (Well-Known Text). Использование WKT может приводить к небольшой потере точности. |
| Vector                    | Array(Float32)         | Только MySQL; в MariaDB поддержка будет добавлена в ближайшее время.                  |
| Float                     | Float32                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из-за текстового протокола.|
| Double                    | Float64                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из-за текстового протокола.|
| Date                      | Date32                 | День/месяц 00 сопоставляется с 01.|
| Time                      | DateTime64(6)          | Смещение времени от Unix-эпохи.|
| Datetime, Timestamp       | DateTime64(6)          | День/месяц 00 сопоставляется с 01.|