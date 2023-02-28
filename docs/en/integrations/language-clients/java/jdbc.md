---
sidebar_label: JDBC driver
sidebar_position: 1
keywords: [clickhouse, jdbc, integrate]
description: The ClickHouse JDBC driver
slug: /en/integrations/language-clients/java/jdbc
---
# JDBC driver
`clickhouse-jdbc` implements the standard JDBC interface. Being built on top of [clickhouse-client](./client), it
provides additional features like custom type mapping, transaction support, and standard synchronous `UPDATE` and `DELETE` statements, etc., so that it can be easily used with legacy applications and tools.

`clickhouse-jdbc` API is synchronous, and generally, it has more overheads(e.g., SQL parsing and type mapping/conversion, etc.).
Consider [clickhouse-client](./client) when performance is critical or if you prefer a more direct way to access ClickHouse.

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
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.4.0</version>
    <!-- use uber jar with all dependencies included, change classifier to http for smaller jar -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```
## Configuration

**Driver Class**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL Syntax**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`, for example:

- `jdbc:ch://localhost` is same as `jdbc:clickhouse:http://localhost:8123`
- `jdbc:ch:https://localhost` is same as `jdbc:clickhouse:http://localhost:8443?ssl=true&sslmode=STRICT`
- `jdbc:ch:grpc://localhost` is same as `jdbc:clickhouse:grpc://localhost:9100`

**Connection Properties**:

| Property                 | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| continueBatchOnError     | `false` | Whether to continue batch processing when error occurred                                                                                                                                                                                                                                                                                                                                                                   |
| createDatabaseIfNotExist | `false` | Whether to create database if it does not exist                                                                                                                                                                                                                                                                                                                                                                            |
| custom_http_headers      |         | comma separated custom http headers, for example: `User-Agent=client1,X-Gateway-Id=123`                                                                                                                                                                                                                                                                                                                                    |
| custom_http_params       |         | comma separated custom http query parameters, for example: `extremes=0,max_result_rows=100`                                                                                                                                                                                                                                                                                                                                |
| nullAsDefault            | `0`     | `0` - treat null value as is and throw exception when inserting null into non-nullable column; `1` - treat null value as is and disable null-check for inserting; `2` - replace null to default value of corresponding data type for both query and insert                                                                                                                                                                 |
| jdbcCompliance           | `true`  | Whether to support standard synchronous UPDATE/DELETE and fake transaction                                                                                                                                                                                                                                                                                                                                                 |
| typeMappings             |         | Customize mapping between ClickHouse data type and Java class, which will affect result of both [getColumnType()](https://docs.oracle.com/javase/8/docs/api/java/sql/ResultSetMetaData.html#getColumnType-int-) and [getObject(Class<?>)](https://docs.oracle.com/javase/8/docs/api/java/sql/ResultSet.html#getObject-java.lang.String-java.lang.Class-). For example: `UInt128=java.lang.String,UInt256=java.lang.String` |
| wrapperObject            | `false` | Whether [getObject()](https://docs.oracle.com/javase/8/docs/api/java/sql/ResultSet.html#getObject-int-) should return java.sql.Array / java.sql.Struct for Array / Tuple.                                                                                                                                                                                                                                                  |

Note: please refer to [JDBC specific configuration](https://github.com/ClickHouse/clickhouse-java/blob/main/clickhouse-jdbc/src/main/java/com/clickhouse/jdbc/JdbcConfig.java) for more.

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
String url = "jdbc:ch://my-server/system"; // use http protocol and port 8123 by default
// String url = "jdbc:ch://my-server:8443/system?ssl=true&sslmode=strict&&sslrootcert=/mine.crt";
Properties properties = new Properties();
// properties.setProperty("ssl", "true");
// properties.setProperty("sslmode", "NONE"); // NONE to trust all servers; STRICT for trusted only
ClickHouseDataSource dataSource = new ClickHouseDataSource(url, new Properties());
try (Connection conn = dataSource.getConnection("default", "password");
    Statement stmt = conn.createStatement()) {
}
```

### Query

```java

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

### Insert

:::note
  - Use `PreparedStatement` instead of `Statement`
  - Use [input function](/en/sql-reference/table-functions/input/) whenever possible
:::

#### With input table function
Recommended way with the best performance
```java
try (PreparedStatement ps = conn.prepareStatement(
    "insert into mytable select col1, col2 from input('col1 String, col2 DateTime64(3), col3 Int32')")) {
    // the column definition will be parsed so the driver knows there are 3 parameters: col1, col2 and col3
    ps.setString(1, "test"); // col1
    ps.setObject(2, LocalDateTime.now()); // col2, setTimestamp is slow and not recommended
    ps.setInt(3, 123); // col3
    ps.addBatch(); // parameters will be write into buffered stream immediately in binary format
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```

#### Insert
It's easier to use but slower performance compare to input function
```java
try (PreparedStatement ps = conn.prepareStatement("insert into mytable(* except (description))")) {
    // the driver will issue query "select * except (description) from mytable where 0" for type inferring
    // since description column is excluded, we know there are only two parameters: col1 and col2
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch(); // parameters will be write into buffered stream immediately in binary format
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```

#### Insert with placeholders
Not recommended as it's based on a large SQL
```java
// Note: "insert into mytable values(?,?,?)" is treated as "insert into mytable"
try (PreparedStatement ps = conn.prepareStatement("insert into mytable values(trim(?),?,?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.setString(3, null); // description
    ps.addBatch(); // append parameters to the query
    ...
    ps.executeBatch(); // issue the composed query: insert into mytable values(...)(...)...(...)
}
```

## Advanced API
### Handling DateTime and time zones

Please to use `java.time.LocalDateTime` or `java.time.OffsetDateTime` instead of `java.sql.Timestamp`, and `java.time.LocalDate` instead of `java.sql.Date`.

```java
try (PreparedStatement ps = conn.prepareStatement("select date_time from mytable where date_time > ?")) {
    ps.setObject(2, LocalDateTime.now());
    ResultSet rs = ps.executeQuery();
    while(rs.next()) {
        LocalDateTime dateTime = (LocalDateTime) rs.getObject(1);
    }
    ...
}
```

### Handling AggregateFunction
:::note
  As of now, only `groupBitmap` is supported.
:::

```java
// batch insert using input function
try (ClickHouseConnection conn = newConnection(props);
        Statement s = conn.createStatement();
        PreparedStatement stmt = conn.prepareStatement(
                "insert into test_batch_input select id, name, value from input('id Int32, name Nullable(String), desc Nullable(String), value AggregateFunction(groupBitmap, UInt32)')")) {
    s.execute("drop table if exists test_batch_input;"
            + "create table test_batch_input(id Int32, name Nullable(String), value AggregateFunction(groupBitmap, UInt32))engine=Memory");
    Object[][] objs = new Object[][] {
            new Object[] { 1, "a", "aaaaa", ClickHouseBitmap.wrap(1, 2, 3, 4, 5) },
            new Object[] { 2, "b", null, ClickHouseBitmap.wrap(6, 7, 8, 9, 10) },
            new Object[] { 3, null, "33333", ClickHouseBitmap.wrap(11, 12, 13) }
    };
    for (Object[] v : objs) {
        stmt.setInt(1, (int) v[0]);
        stmt.setString(2, (String) v[1]);
        stmt.setString(3, (String) v[2]);
        stmt.setObject(4, v[3]);
        stmt.addBatch();
    }
    int[] results = stmt.executeBatch();
    ...
}

// use bitmap as query parameter
try (PreparedStatement stmt = conn.prepareStatement(
    "SELECT bitmapContains(my_bitmap, toUInt32(1)) as v1, bitmapContains(my_bitmap, toUInt32(2)) as v2 from {tt 'ext_table'}")) {
    stmt.setObject(1, ClickHouseExternalTable.builder().name("ext_table")
            .columns("my_bitmap AggregateFunction(groupBitmap,UInt32)").format(ClickHouseFormat.RowBinary)
            .content(new ByteArrayInputStream(ClickHouseBitmap.wrap(1, 3, 5).toBytes()))
            .asTempTable()
            .build());
    ResultSet rs = stmt.executeQuery();
    Assert.assertTrue(rs.next());
    Assert.assertEquals(rs.getInt(1), 1);
    Assert.assertEquals(rs.getInt(2), 0);
    Assert.assertFalse(rs.next());
}
```

