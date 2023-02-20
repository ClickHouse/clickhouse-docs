---
sidebar_label: R2DBC driver
sidebar_position: 3
keywords: [clickhouse, r2dbc, integrate]
description: The ClickHouse R2DBC Driver
slug: /en/integrations/language-clients/java/r2dbc
---
# JDBC driver
[R2DBC](https://r2dbc.io/) wrapper of async [Java client](./client) for ClickHouse.

## Environment requirements
- [OpenJDK](https://openjdk.java.net) version >= 17
## Compatibility with ClickHouse

| Client version | ClickHouse  |
|----------------|-------------|
| 0.4.0          | 20.7+       |

## Installation

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- change to clickhouse-r2dbc_0.9.1 for SPI 0.9.1.RELEASE -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.4.0</version>
    <!-- use uber jar with all dependencies included, change classifier to http or grpc for smaller jar -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## Supported data types
| Format  | Support | Comment |
| --- | --- | --- |
| AggregatedFunction  | :x: | limited to `groupBitmap`, and known to have issue with 64bit bitmap |
| Array(\*)  | :white_check_mark: | |
| Bool | :white_check_mark: | |
| Date\*  | :white_check_mark: | |
| DateTime\*  | :white_check_mark: | |
| Decimal\*  | :white_check_mark: | `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency |
| Enum\*  | :white_check_mark: | can be treated as both string and integer | |
| Geo Types | :white_check_mark: | Point, Ring, Polygon, and MultiPolygon  | |
| Int\*, UInt\* | :white_check_mark: | UInt64 is mapped to `long` | |
| IPv\*  | :white_check_mark: | |
| Map(\*) | :white_check_mark: | |
| Nested(\*) | :white_check_mark: | |
| Object('JSON') | :white_check_mark: | |
| SimpleAggregateFunction | :white_check_mark: | |
| \*String | :white_check_mark: | |
| Tuple(\*) | :white_check_mark: |  |
| UUID | :white_check_mark: | |


## Driver API
### Connect to ClickHouse

```java
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### Query

```java
connection
    .createStatement("select domain, path,  toDate(cdate) as d, count(1) as count from clickdb.clicks where domain = :domain group by domain, path, d")
    .bind("domain", domain)
    .execute())
    .flatMap(result -> result
    .map((row, rowMetadata) -> String.format("%s%s[%s]:%d", row.get("domain", String.class),
        row.get("path", String.class),
        row.get("d", LocalDate.class),
        row.get("count", Long.class)))
    )
    .doOnNext(System.out::println)
    .subscribe();
```

### Insert
```java
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
