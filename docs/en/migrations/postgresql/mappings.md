---
sidebar_label: Data type mappings
sidebar_position: 70
title: Data type mappings
slug: /en/migrations/postgresql/mappings
description: Data type mappings for Postgresql
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres, concepts, mappings, data types]
---

The following table shows the equivalent ClickHouse data types for Postgres.

| Postgres Data Type | ClickHouse Type                    |
|--------------------|------------------------------------|
| DATE               | [Date](/docs/en/sql-reference/data-types/date)                               |
| TIMESTAMP          | [DateTime](/docs/en/sql-reference/data-types/datetime)                           |
| REAL               | [Float32](/docs/en/sql-reference/data-types/float)                            |
| DOUBLE             | [Float64](/docs/en/sql-reference/data-types/float)                            |
| DECIMAL, NUMERIC   | [Decimal](/docs/en/sql-reference/data-types/decimal)                            |
| SMALLINT           | [Int16](/docs/en/sql-reference/data-types/int-uint)                              |
| INTEGER            | [Int32](/docs/en/sql-reference/data-types/int-uint)                              |
| BIGINT             | [Int64](/docs/en/sql-reference/data-types/int-uint)                              |
| SERIAL             | [UInt32](/docs/en/sql-reference/data-types/int-uint)                             |
| BIGSERIAL          | [UInt64](/docs/en/sql-reference/data-types/int-uint)                             |
| TEXT, CHAR         | [String](/docs/en/sql-reference/data-types/string)                             |
| INTEGER            | Nullable([Int32](/docs/en/sql-reference/data-types/int-uint))                    |
| ARRAY              | [Array](/docs/en/sql-reference/data-types/array)                              |
| FLOAT4             | [Float32](/docs/en/sql-reference/data-types/float)                            |
| BOOLEAN            | [Bool](/docs/en/sql-reference/data-types/boolean)                               |
| VARCHAR            | [String](/docs/en/sql-reference/data-types/string)                             |
| BIT                | [String](/docs/en/sql-reference/data-types/string)                             |
| BIT VARYING        | [String](/docs/en/sql-reference/data-types/string)                             |
| BYTEA              | [String](/docs/en/sql-reference/data-types/string)                             |
| NUMERIC            | [Decimal](/docs/en/sql-reference/data-types/decimal)                            |
| GEOGRAPHY          | [Point](/docs/en/sql-reference/data-types/geo#point), [Ring](/docs/en/sql-reference/data-types/geo#ring), [Polygon](/docs/en/sql-reference/data-types/geo#polygon), [MultiPolygon](/docs/en/sql-reference/data-types/geo#multipolygon) |
| GEOMETRY           | [Point](/docs/en/sql-reference/data-types/geo#point), [Ring](/docs/en/sql-reference/data-types/geo#ring), [Polygon](/docs/en/sql-reference/data-types/geo#polygon), [MultiPolygon](/docs/en/sql-reference/data-types/geo#multipolygon) |
| INET               | [IPv4](/docs/en/sql-reference/data-types/ipv4), [IPv6](/docs/en/sql-reference/data-types/ipv6)                         |
| MACADDR            | [String](/docs/en/sql-reference/data-types/string)                             |
| CIDR               | [String](/docs/en/sql-reference/data-types/string)                             |
| HSTORE             | [Map(K, V)](/docs/en/sql-reference/data-types/map)      |
| UUID               | [UUID](/docs/en/sql-reference/data-types/uuid)                               |
| ARRAY&lt;T&gt;     | [ARRAY(T)](m/docs/en/sql-reference/data-types/array)                           |
| JSON**             | [String](/docs/en/sql-reference/data-types/string), [Nested](/docs/en/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple*](/docs/en/sql-reference/data-types/tuple), [ARRAY(T)](m/docs/en/sql-reference/data-types/array)     |
| JSONB              | [String](/docs/en/sql-reference/data-types/string)                             |
