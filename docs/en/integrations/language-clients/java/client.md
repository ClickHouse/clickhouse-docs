---
sidebar_label: Java client
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: The ClickHouse Java driver
slug: /en/integrations/language-clients/java/client
---
# JDBC driver

Provides the most flexible and performant way to integrate your app with ClickHouse.

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
    <!-- or clickhouse-grpc-client if you prefer gRPC -->
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.4.0</version>
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

**URL Syntax**: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`, for example:
- `http://localhost:8443?ssl=true&sslmode=NONE`
- `http://(https://explorer@play.clickhouse.com:443`
- `tcp://localhost?!auto_discovery#experimental),(grpc://localhost#experimental)?failover=3#test`

```java
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

### Query

```java
ClickHouseResponse response = client.connect(endpoint) // or client.connect(endpoints)
    // you'll have to parse response manually if using a different format
    .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
    .query("select * from numbers(:limit)")
    .params(1000).executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            long totalRows = summary.getTotalRowsToRead();
```

### Streaming Query
```java
ClickHouseResponse response = client.connect(endpoint) // or client.connect(endpoints)
    // you'll have to parse response manually if using a different format
    .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
    .query("select * from numbers(:limit)")
    .params(1000).executeAndWait()) {
    for (ClickHouseRecord r : response.records()) {
        int num = r.getValue(0).asInteger();
        // type conversion
        String str = r.getValue(0).asString();
        LocalDate date = r.getValue(0).asDate();
    }
```

### Insert
```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP)) {
    ClickHouseRequest<?> request = client.connect(servers).format(ClickHouseFormat.RowBinaryWithNamesAndTypes);
    // load data into a table and wait until it's completed
    request.write()
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream).execute().thenAccept(response -> {
            response.close();
        });
```

### Multiple queries
Execute multiple queries in a worker thread one after another within same session:
```java
CompletableFuture<List<ClickHouseResponseSummary>> future = ClickHouseClient.send(servers.get(),
    "create database if not exists my_base",
    "use my_base",
    "create table if not exists test_table(s String) engine=Memory",
    "insert into test_table values('1')('2')('3')",
    "select * from test_table limit 1",
    "truncate table test_table",
    "drop table if exists test_table");

// block current thread until queries completed, and then retrieve summaries
List<ClickHouseResponseSummary> results = future.get();
```
