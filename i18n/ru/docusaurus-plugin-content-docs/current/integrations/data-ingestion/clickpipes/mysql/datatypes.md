---
title: 'Поддерживаемые типы данных'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Страница, описывающая соответствие типов данных MySQL ClickPipe между MySQL и ClickHouse'
doc_type: 'reference'
keywords: ['типы данных MySQL ClickPipe', 'типы данных MySQL в ClickHouse', 'соответствие типов данных ClickPipe', 'преобразование типов MySQL ClickHouse', 'совместимость типов баз данных']
---

Ниже приведены поддерживаемые соответствия типов данных для MySQL ClickPipe:

| Тип MySQL                 | Тип ClickHouse         | Примечания                                                                          |
| --------------------------| -----------------------| ----------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | Поддерживает `UNSIGNED`.|
| SmallInt                  | Int16                  | Поддерживает `UNSIGNED`.|
| MediumInt, Int            | Int32                  | Поддерживает `UNSIGNED`.|
| BigInt                    | Int64                  | Поддерживает `UNSIGNED`.|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | Только MySQL; в MariaDB `json` — это просто алиас для `text` с ограничением.        |
| Geometry & Geometry Types | String                 | WKT (Well-Known Text). В WKT возможна небольшая потеря точности.                    |
| Vector                    | Array(Float32)         | Только MySQL; поддержка в MariaDB появится в ближайшее время.                       |
| Float                     | Float32                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из‑за текстового протокола.|
| Double                    | Float64                | Точность в ClickHouse может отличаться от MySQL при начальной загрузке из‑за текстового протокола.|
| Date                      | Date32                 | День/месяц `00` отображается как `01`.|
| Time                      | DateTime64(6)          | Смещение времени относительно эпохи Unix.|
| Datetime, Timestamp       | DateTime64(6)          | День/месяц `00` отображается как `01`.|