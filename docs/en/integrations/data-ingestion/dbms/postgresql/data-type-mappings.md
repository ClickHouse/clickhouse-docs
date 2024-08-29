---
slug: /en/integrations/postgresql/data-type-mappings
title: Data Type Mappings for PostgreSQL
keywords: [postgres, postgresql, data types, types]
---

The following table shows the equivalent ClickHouse data types for Postgres.

| Postgres Data Type | ClickHouse Type |
| --- | --- |
| DATE | [Date](/en/sql-reference/data-types/date) |
| TIMESTAMP | [DateTime](/en/sql-reference/data-types/datetime) |
| REAL | [Float32](/en/sql-reference/data-types/float) |
| DOUBLE | [Float64](/en/sql-reference/data-types/float) |
| DECIMAL, NUMERIC | [Decimal](/en/sql-reference/data-types/decimal) |
| SMALLINT | [Int16](/en/sql-reference/data-types/int-uint) |
| INTEGER | [Int32](/en/sql-reference/data-types/int-uint) |
| BIGINT | [Int64](/en/sql-reference/data-types/int-uint) |
| SERIAL | [UInt32](/en/sql-reference/data-types/int-uint) |
| BIGSERIAL | [UInt64](/en/sql-reference/data-types/int-uint) |
| TEXT, CHAR | [String](/en/sql-reference/data-types/string) |
| INTEGER | Nullable([Int32](/en/sql-reference/data-types/int-uint)) |
| ARRAY | [Array](/en/sql-reference/data-types/array) |
| FLOAT4 | [Float32](/en/sql-reference/data-types/float) |
| BOOLEAN | [Bool](/en/sql-reference/data-types/boolean) |
| VARCHAR | [String](/en/sql-reference/data-types/string) |
| BIT | [String](/en/sql-reference/data-types/string) |
| BIT VARYING | [String](/en/sql-reference/data-types/string) |
| BYTEA | [String](/en/sql-reference/data-types/string) |
| NUMERIC | [Decimal](/en/sql-reference/data-types/decimal) |
| GEOGRAPHY | [Point](/en/sql-reference/data-types/geo#point), [Ring](/en/sql-reference/data-types/geo#ring), [Polygon](/en/sql-reference/data-types/geo#polygon), [MultiPolygon](/en/sql-reference/data-types/geo#multipolygon) |
| GEOMETRY | [Point](/en/sql-reference/data-types/geo#point), [Ring](/en/sql-reference/data-types/geo#ring), [Polygon](/en/sql-reference/data-types/geo#polygon), [MultiPolygon](/en/sql-reference/data-types/geo#multipolygon) |
| INET | [IPv4](/en/sql-reference/data-types/ipv4), [IPv6](/en/sql-reference/data-types/ipv6) |
| MACADDR | [String](/en/sql-reference/data-types/string) |
| CIDR | [String](/en/sql-reference/data-types/string) |
| HSTORE | [Map(K, V)](/en/sql-reference/data-types/map), [Map](/en/sql-reference/data-types/map)(K,[Variant](/en/sql-reference/data-types/variant)) |
| UUID | [UUID](/en/sql-reference/data-types/uuid) |
| ARRAY<T\> | [ARRAY(T)](/en/sql-reference/data-types/array) |
| JSON* | [String](/en/sql-reference/data-types/string), [Variant](/en/sql-reference/data-types/variant), [Nested](/en/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/en/sql-reference/data-types/tuple) |
| JSONB | [String](/en/sql-reference/data-types/string) |

*\* Production support for JSON in ClickHouse is under development. Currently users can either map JSON as String, and use [JSON functions](/en/sql-reference/functions/json-functions), or map the JSON directly to [Tuples](/en/sql-reference/data-types/tuple) and [Nested](/en/sql-reference/data-types/nested-data-structures/nested) if the structure is predictable. Read more about JSON [here](/en/integrations/data-formats/json#handle-as-structured-data).*
