---
title: '支持的数据类型'
slug: /integrations/clickpipes/mysql/datatypes
description: '介绍 MySQL ClickPipe 中 MySQL 与 ClickHouse 之间数据类型映射的页面'
doc_type: 'reference'
keywords: ['MySQL ClickPipe 数据类型', 'MySQL 到 ClickHouse 数据类型', 'ClickPipe 数据类型映射', 'MySQL ClickHouse 类型转换', '数据库类型兼容性']
---

以下是 MySQL ClickPipe 支持的数据类型映射关系：

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | 支持无符号。|
| SmallInt                  | Int16                  | 支持无符号。|
| MediumInt, Int            | Int32                  | 支持无符号。|
| BigInt                    | Int64                  | 支持无符号。|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | 仅适用于 MySQL；MariaDB 中的 `json` 只是带约束的 `text` 别名。              |
| Geometry & Geometry Types | String                 | WKT（Well-Known Text）。WKT 可能会有轻微的精度损失。                       |
| Vector                    | Array(Float32)         | 仅适用于 MySQL；MariaDB 即将添加支持。                                            |
| Float                     | Float32                | 由于使用文本协议，在初始加载期间 ClickHouse 中的精度可能与 MySQL 不同。|
| Double                    | Float64                | 由于使用文本协议，在初始加载期间 ClickHouse 中的精度可能与 MySQL 不同。|
| Date                      | Date32                 | 若日期或月份为 00，则映射为 01。|
| Time                      | DateTime64(6)          | 自 Unix 纪元起的时间偏移。|
| Datetime, Timestamp       | DateTime64(6)          | 若日期或月份为 00，则映射为 01。|