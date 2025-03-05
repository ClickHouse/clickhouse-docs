---
slug: /integrations/postgresql/data-type-mappings
title: PostgreSQLのデータ型マッピング
keywords: [postgres, postgresql, data types, types]
---

以下の表は、Postgresのデータ型に対する等価のClickHouseデータ型を示しています。

| Postgres データ型 | ClickHouse 型 |
| --- | --- |
| `DATE` | [Date](/sql-reference/data-types/date) |
| `TIMESTAMP` | [DateTime](/sql-reference/data-types/datetime) |
| `REAL` | [Float32](/sql-reference/data-types/float) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float) |
| `DECIMAL, NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `SMALLINT` | [Int16](/sql-reference/data-types/int-uint) |
| `INTEGER` | [Int32](/sql-reference/data-types/int-uint) |
| `BIGINT` | [Int64](/sql-reference/data-types/int-uint) |
| `SERIAL` | [UInt32](/sql-reference/data-types/int-uint) |
| `BIGSERIAL` | [UInt64](/sql-reference/data-types/int-uint) |
| `TEXT, CHAR` | [String](/sql-reference/data-types/string) |
| `INTEGER` | Nullable([Int32](/sql-reference/data-types/int-uint)) |
| `ARRAY` | [Array](/sql-reference/data-types/array) |
| `FLOAT4` | [Float32](/sql-reference/data-types/float) |
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean) |
| `VARCHAR` | [String](/sql-reference/data-types/string) |
| `BIT` | [String](/sql-reference/data-types/string) |
| `BIT VARYING` | [String](/sql-reference/data-types/string) |
| `BYTEA` | [String](/sql-reference/data-types/string) |
| `NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `GEOGRAPHY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `GEOMETRY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `INET` | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6) |
| `MACADDR` | [String](/sql-reference/data-types/string) |
| `CIDR` | [String](/sql-reference/data-types/string) |
| `HSTORE` | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant)) |
| `UUID` | [UUID](/sql-reference/data-types/uuid) |
| `ARRAY<T>` | [ARRAY(T)](/sql-reference/data-types/array) |
| `JSON*` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |

*\* ClickHouseでのJSONの製品サポートは開発中です。現在、ユーザーはJSONをStringとしてマッピングし、[JSON関数](/sql-reference/functions/json-functions)を使用するか、構造が予測可能な場合はJSONを直接[Tuples](/sql-reference/data-types/tuple)や[Nested](/sql-reference/data-types/nested-data-structures/nested)にマッピングできます。JSONについての詳細は[こちら](/integrations/data-formats/json/overview)をお読みください。*
