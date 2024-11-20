---
sidebar_label: JDBC Driver
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: ClickHouse JDBC driver
slug: /en/integrations/java/jdbc-driver
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# JDBC Driver

`clickhouse-jdbc` implements the standard JDBC interface. Being built on top of [clickhouse-client](/docs/en/integrations/clickhouse-client-local.md), it provides additional features like custom type mapping, transaction support, and standard synchronous `UPDATE` and `DELETE` statements, etc., so that it can be easily used with legacy applications and tools.

:::note
    Latest JDBC (0.7.1) version uses Client-V1 
:::

`clickhouse-jdbc` API is synchronous, and generally, it has more overheads(e.g., SQL parsing and type mapping/conversion, etc.). Consider [clickhouse-client](/docs/en/integrations/clickhouse-client-local.md) when performance is critical or if you prefer a more direct way to access ClickHouse.

## Environment requirements

- [OpenJDK](https://openjdk.java.net) version >= 8


### Setup

<Tabs groupId="client-v1-compression-deps">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.7.1</version>
    <!-- use uber jar with all dependencies included, change classifier to http for smaller jar -->
    <classifier>all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
// use uber jar with all dependencies included, change classifier to http for smaller jar
implementation("com.clickhouse:clickhouse-jdbc:0.7.1:all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
// use uber jar with all dependencies included, change classifier to http for smaller jar
implementation 'com.clickhouse:clickhouse-jdbc:0.7.1:all'
```

</TabItem>
</Tabs>

Since version `0.5.0`, we are using Apache HTTP Client that's packed the Client. Since there is not a shared version of the package, you need to add a logger as a dependency.

<Tabs groupId="client-v1-compression-deps">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-api -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.16</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.slf4j/slf4j-api
implementation("org.slf4j:slf4j-api:2.0.16")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.slf4j/slf4j-api
implementation 'org.slf4j:slf4j-api:2.0.16'
```

</TabItem>
</Tabs>

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

JDBC Driver supports same data formats as client library does. 

:::note
- AggregatedFunction - :warning: does not support `SELECT * FROM table ...`
- Decimal - `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency
- Enum - can be treated as both string and integer
- UInt64 - mapped to `long` (in client-v1) 
:::

## Creating Connection

```java
String url = "jdbc:ch://my-server/system"; // use http protocol and port 8123 by default

Properties properties = new Properties();

ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);
try (Connection conn = dataSource.getConnection("default", "password");
    Statement stmt = conn.createStatement()) {
}
```

## Simple Statement

```java showLineNumbers

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

## Insert

:::note
- Use `PreparedStatement` instead of `Statement`
:::

It's easier to use but slower performance compare to input function (see below):

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("insert into mytable(* except (description))")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch(); // parameters will be write into buffered stream immediately in binary format
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```

### With input table function

An option with great performance characteristics:

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement(
    "insert into mytable select col1, col2 from input('col1 String, col2 DateTime64(3), col3 Int32')")) {
    // The column definition will be parsed so the driver knows there are 3 parameters: col1, col2 and col3
    ps.setString(1, "test"); // col1
    ps.setObject(2, LocalDateTime.now()); // col2, setTimestamp is slow and not recommended
    ps.setInt(3, 123); // col3
    ps.addBatch(); // parameters will be write into buffered stream immediately in binary format
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```
- [input function doc](/en/sql-reference/table-functions/input/) whenever possible

### Insert with placeholders

This option is recommended only for small inserts because it would require a long SQL expression (that will be parsed on client side and it will consume CPU & Memory): 

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("insert into mytable values(trim(?),?,?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.setString(3, null); // description
    ps.addBatch(); // append parameters to the query
    ...
    ps.executeBatch(); // issue the composed query: insert into mytable values(...)(...)...(...)
}
```

## Handling DateTime and time zones

Please to use `java.time.LocalDateTime` or `java.time.OffsetDateTime` instead of `java.sql.Timestamp`, and `java.time.LocalDate` instead of `java.sql.Date`.

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("select date_time from mytable where date_time > ?")) {
    ps.setObject(2, LocalDateTime.now());
    ResultSet rs = ps.executeQuery();
    while(rs.next()) {
        LocalDateTime dateTime = (LocalDateTime) rs.getObject(1);
    }
    ...
}
```

## Handling `AggregateFunction`

:::note
As of now, only `groupBitmap` is supported.
:::

```java showLineNumbers
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

<br/>

## Configuring HTTP library

The ClickHouse JDBC connector supports three HTTP libraries: [HttpClient](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html), [HttpURLConnection](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/net/HttpURLConnection.html), and [Apache HttpClient](https://hc.apache.org/httpcomponents-client-5.2.x/).

:::note
HttpClient is only supported in JDK 11 or above.
:::

The JDBC driver uses `HttpClient` by default. You can change the HTTP library used by the ClickHouse JDBC connector by setting the following property:

```java
properties.setProperty("http_connection_provider", "APACHE_HTTP_CLIENT");
```

Here is a full list of the corresponding values:

| Property Value      | HTTP Library      |
| ------------------- | ----------------- |
| HTTP_CLIENT         | HTTPClient        |
| HTTP_URL_CONNECTION | HttpURLConnection |
| APACHE_HTTP_CLIENT  | Apache HttpClient |

<br/>

## Connect to ClickHouse with SSL

To establish a secure JDBC connection to ClickHouse using SSL, you need to configure your JDBC properties to include SSL parameters. This typically involves specifying SSL properties such as `sslmode` and `sslrootcert` in your JDBC URL or Properties object.

## SSL Properties

| Name               | Default Value | Optional Values | Description                                                                  |
| ------------------ | ------------- | --------------- | ---------------------------------------------------------------------------- |
| ssl                | false         | true, false     | Whether to enable SSL/TLS for the connection                                 |
| sslmode            | strict        | strict, none    | Whether to verify SSL/TLS certificate                                        |
| sslrootcert        |               |                 | Path to SSL/TLS root certificates                                            |
| sslcert            |               |                 | Path to SSL/TLS certificate                                                  |
| sslkey             |               |                 | RSA key in PKCS#8 format                                                     |
| key_store_type     |               | JKS, PKCS12     | Specifies the type or format of the keystore/truststore file                 |
| trust_store        |               |                 | Path to the truststore file                                                  |
| key_store_password |               |                 | Password needed to access the keystore file specified in the keystore config |

These properties ensure that your Java application communicates with the ClickHouse server over an encrypted connection, enhancing data security during transmission.

```java showLineNumbers
  String url = "jdbc:ch://your-server:8443/system";

  Properties properties = new Properties();
  properties.setProperty("ssl", "true");
  properties.setProperty("sslmode", "strict"); // NONE to trust all servers; STRICT for trusted only
  properties.setProperty("sslrootcert", "/mine.crt");
  try (Connection con = DriverManager
          .getConnection(url, properties)) {

      try (PreparedStatement stmt = con.prepareStatement(

          // place your code here

      }
  }
```

## Resolving JDBC Timeout on Large Inserts

When performing large inserts in ClickHouse with long execution times, you may encounter JDBC timeout errors like:

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```

These errors can disrupt the data insertion process and affect system stability. To address this issue you need to adjust a few timeout settings in the client's OS.

### Mac OS

On Mac OS, the following settings can be adjusted to resolve the issue:

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

### Linux

On Linux, the equivalent settings alone may not resolve the issue. Additional steps are required due to the differences in how Linux handles socket keep-alive settings. Follow these steps:

1. Adjust the following Linux kernel parameters in `/etc/sysctl.conf` or a related configuration file:

   - `net.inet.tcp.keepidle`: 60000
   - `net.inet.tcp.keepintvl`: 45000
   - `net.inet.tcp.keepinit`: 45000
   - `net.inet.tcp.keepcnt`: 8
   - `net.inet.tcp.always_keepalive`: 1
   - `net.ipv4.tcp_keepalive_intvl`: 75
   - `net.ipv4.tcp_keepalive_probes`: 9
   - `net.ipv4.tcp_keepalive_time`: 60 (You may consider lowering this value from the default 300 seconds)

2. After modifying the kernel parameters, apply the changes by running the following command:

   ```shell
   sudo sysctl -p
   ```

After Setting those settings, you need to ensure that your client enables the Keep Alive option on the socket:

```java
properties.setProperty("socket_keepalive", "true");
```

:::note
Currently, you must use Apache HTTP Client library when setting the socket keep-alive, as the other two HTTP client libraries supported by `clickhouse-java` do not allow setting socket options. For a detailed guide, see [Configuring HTTP library](/docs/en/integrations/java#configuring-http-library).
:::

Alternatively, you can add equivalent parameters to the JDBC URL.

The default socket and connection timeout for the JDBC driver is 30 seconds. The timeout can be increased to support large data insert operations. Use the `options` method on `ClickHouseClient` together with the `SOCKET_TIMEOUT` and `CONNECTION_TIMEOUT` options as defined by `ClickHouseClientOption`:

```java showLineNumbers
final int MS_12H = 12 * 60 * 60 * 1000; // 12 h in ms
final String sql = "insert into table_a (c1, c2, c3) select c1, c2, c3 from table_b;";

try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP)) {
    client.read(servers).write()
        .option(ClickHouseClientOption.SOCKET_TIMEOUT, MS_12H)
        .option(ClickHouseClientOption.CONNECTION_TIMEOUT, MS_12H)
        .query(sql)
        .executeAndWait();
}
```
