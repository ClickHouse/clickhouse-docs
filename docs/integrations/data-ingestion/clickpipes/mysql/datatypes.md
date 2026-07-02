---
title: 'Supported data types'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Page describing MySQL ClickPipe datatype mapping from MySQL to ClickHouse'
doc_type: 'reference'
keywords: ['MySQL ClickPipe datatypes', 'MySQL to ClickHouse data types', 'ClickPipe datatype mapping', 'MySQL ClickHouse type conversion', 'database type compatibility']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                | Synonyms: `Numeric`, `Dec`, `Fixed`.|
| Bit                       | UInt64                 ||
| TinyInt                   | Int8                   | Supports unsigned. Compatibility alias: `Int1`.|
| SmallInt                  | Int16                  | Supports unsigned. Compatibility alias: `Int2`.|
| MediumInt, Int            | Int32                  | Supports unsigned. Synonyms and compatibility aliases include `Integer`, `Int3`, `Int4`, `MiddleInt`.|
| BigInt                    | Int64                  | Supports unsigned. Compatibility alias: `Int8`.|
| Serial                    | UInt64                 | Alias for `BigInt Unsigned Not Null AUTO_INCREMENT Unique`.|
| Year                      | Int16                  ||
| TinyInt(1)                | Bool                   | Synonyms: `Bool`, `Boolean`.|
| Float                     | Float32                | Precision on ClickHouse may differ from MySQL during initial load due to text protocol. Synonym: `Float4`. `Float(p)` maps to `Float32` for `p <= 24` and `Float64` for `p >= 25`.|
| Double                    | Float64                | Precision on ClickHouse may differ from MySQL during initial load due to text protocol. Synonyms: `Double Precision`, `Real`, `Float8`.|
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 | Synonyms: `Character`, `NChar`, `NVarchar`, `Character Varying`, `Char Varying`, `VarCharacter`, `NChar Varchar`, `NChar Varying`, `NChar VarCharacter`, and `National`-prefixed forms.|
| Long, Long Varchar        | String                 | Compatibility aliases for `MediumText`. Additional MariaDB aliases: `Long Char Varying`, `Long Character Varying`, `Long VarCharacter`.|
| Binary, VarBinary         | String                 ||
| Long VarBinary            | String                 | Compatibility alias for `MediumBlob`.|
| JSON                      | String                 | MySQL only; MariaDB `json` is just an alias for `text` with a constraint.              |
| Geometry & Geometry Types | String | WKT (Well-Known Text). WKT may suffer from small precision loss. |
| UUID                      | UUID                   | MariaDB only. Columns added during CDC are added as `String`.  |
| INET4, INET6              | String                 | MariaDB only.                                                                          |
| Vector                    | Array(Float32)         | MySQL only; MariaDB is adding support soon.                                            |
| Char Byte, Raw            | String                 | MariaDB/Oracle-mode aliases for binary types.                                          |
| Clob, Varchar2, XMLType   | String                 | MariaDB/Oracle-mode aliases for text types.                                            |
| Number                    | Decimal                | MariaDB/Oracle-mode alias for `Decimal`.                                               |
| Date                      | Date32                 | 00 day/month mapped to 01.|
| Time                      | DateTime64(6)          | Time offset from unix epoch.|
| Datetime, Timestamp       | DateTime64(6)          | 00 day/month mapped to 01.|
