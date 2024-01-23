---
sidebar_label: Java
sidebar_position: 1
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: Options for connecting to ClickHouse from Java
slug: /en/integrations/java
---

# Java Language Client Options for ClickHouse

There are three options for connecting to ClickHouse using Java:

- [Java client](#java-client)
- [JDBC Driver](#jdbc-driver)
- [R2DBC Driver](#r2dbc-driver)

## Java Client

Provides the most flexible and performant way to integrate your app with ClickHouse.

### Environment requirements

- [OpenJDK](https://openjdk.java.net) version >= 8

### Compatibility with ClickHouse

| Client version | ClickHouse |
|----------------| ---------- |
| 0.6.0          | 22.8+      |

### Installation

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- or clickhouse-grpc-client if you prefer gRPC -->
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.6.0</version>
</dependency>
```

Since version `0.5.0`, the driver uses a new client http library that needs to be added as a dependency.

```xml
<dependency>
   <groupId>org.apache.httpcomponents.client5</groupId>
   <artifactId>httpclient5</artifactId>
   <version>5.2.3</version>
</dependency>
```

### Supported data types

| Format                  | Support            | Comment                                                               |
| ----------------------- | ------------------ | --------------------------------------------------------------------- | --- |
| AggregatedFunction      | :white_check_mark: | :warning: does not support `SELECT * FROM table ...`                  |
| Array(\*)               | :white_check_mark: |                                                                       |
| Bool                    | :white_check_mark: |                                                                       |
| Date\*                  | :white_check_mark: |                                                                       |
| DateTime\*              | :white_check_mark: |                                                                       |
| Decimal\*               | :white_check_mark: | `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency |
| Enum\*                  | :white_check_mark: | can be treated as both string and integer                             |     |
| Geo Types               | :white_check_mark: | Point, Ring, Polygon, and MultiPolygon                                |     |
| Int\*, UInt\*           | :white_check_mark: | UInt64 is mapped to `long`                                            |     |
| IPv\*                   | :white_check_mark: |                                                                       |
| Map(\*)                 | :white_check_mark: |                                                                       |
| Nested(\*)              | :white_check_mark: |                                                                       |
| Object('JSON')          | :white_check_mark: |                                                                       |
| SimpleAggregateFunction | :white_check_mark: |                                                                       |
| \*String                | :white_check_mark: |                                                                       |
| Tuple(\*)               | :white_check_mark: |                                                                       |
| UUID                    | :white_check_mark: |                                                                       |

### Driver API

#### Connect to ClickHouse

**URL Syntax**: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`, for example:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `http://(https://explorer@play.clickhouse.com:443`
- `tcp://localhost?!auto_discovery#experimental),(grpc://localhost#experimental)?failover=3#test`

```java
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

#### Query

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers(:limit)")
        .params(1000)
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            long totalRows = summary.getTotalRowsToRead();
}
```

#### Streaming Query

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers(:limit)")
        .params(1000)
        .executeAndWait()) {
            for (ClickHouseRecord r : response.records()) {
            int num = r.getValue(0).asInteger();
            // type conversion
            String str = r.getValue(0).asString();
            LocalDate date = r.getValue(0).asDate();
        }
}
```

#### Insert

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // load data into a table and wait untilit's completed
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

#### Multiple queries

Execute multiple queries in a worker thread one after another within same session:

```java
CompletableFuture<List<ClickHouseResponseSummary>> future = ClickHouseClient.send(servers.apply(servers.getNodeSelector()),
    "create database if not exists my_base",
    "use my_base",
    "create table if not exists test_table(s String) engine=Memory",
    "insert into test_table values('1')('2')('3')",
    "select * from test_table limit 1",
    "truncate table test_table",
    "drop table if exists test_table");
List<ClickHouseResponseSummary> results = future.get();
```

#### Named Parameters

You can pass parameters by name rather than relying solely on their position in the parameter list. This capability is available using `params` function.

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name limit :limit")
        .params("Ben", 1000)
        .executeAndWait()) {
            //...
        }
}
```

:::note Parameters
All `params` signatures involving `String` type (`String`, `String[]`, `Map<String, String>`) assume the keys being passed are valid ClickHouse SQL strings. For instance:

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name","'Ben'"))
        .executeAndWait()) {
            //...
        }
}
```

If you prefer not to parse String objects to ClickHouse SQL manually, you can use the helper function `ClickHouseValues.convertToSqlExpression` located at `com.clickhouse.data`:

```java
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name", ClickHouseValues.convertToSqlExpression("Ben's")))
        .executeAndWait()) {
            //...
        }
}
```

In the example above, `ClickHouseValues.convertToSqlExpression` will escape the inner single quote, and surround the variable with a valid single quotes.

Other types, such as `Integer`, `UUID`, `Array` and `Enum` will be converted automatically inside `params`.
:::

## JDBC Driver

`clickhouse-jdbc` implements the standard JDBC interface. Being built on top of [clickhouse-client](/docs/en/integrations/clickhouse-client-local.md), it provides additional features like custom type mapping, transaction support, and standard synchronous `UPDATE` and `DELETE` statements, etc., so that it can be easily used with legacy applications and tools.

`clickhouse-jdbc` API is synchronous, and generally, it has more overheads(e.g., SQL parsing and type mapping/conversion, etc.). Consider [clickhouse-client](/docs/en/integrations/clickhouse-client-local.md) when performance is critical or if you prefer a more direct way to access ClickHouse.

### Environment requirements

- [OpenJDK](https://openjdk.java.net) version >= 8

### Compatibility with ClickHouse

| Client version | ClickHouse |
|----------------| ---------- |
| 0.6.0          | 22.8+      |

### Installation

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.6.0</version>
    <!-- use uber jar with all dependencies included, change classifier to http for smaller jar -->
    <classifier>all</classifier>
</dependency>
```

Since version `0.5.0`, we are using Apache HTTP Client that's packed the Client. Since there is not a shared version of the package, you need to add a logger as a dependency.

```xml
<dependency>
   <groupId>org.slf4j</groupId>
   <artifactId>slf4j-api</artifactId>
   <version>2.0.9</version>
</dependency>
```

### Configuration

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

### Supported data types

| Format                  | Support            | Comment                                                               |
| ----------------------- | ------------------ | --------------------------------------------------------------------- | --- |
| AggregatedFunction      | :white_check_mark: | :warning: does not support `SELECT * FROM table ...`                  |
| Array(\*)               | :white_check_mark: |                                                                       |
| Bool                    | :white_check_mark: |                                                                       |
| Date\*                  | :white_check_mark: |                                                                       |
| DateTime\*              | :white_check_mark: |                                                                       |
| Decimal\*               | :white_check_mark: | `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency |
| Enum\*                  | :white_check_mark: | can be treated as both string and integer                             |     |
| Geo Types               | :white_check_mark: | Point, Ring, Polygon, and MultiPolygon                                |     |
| Int\*, UInt\*           | :white_check_mark: | UInt64 is mapped to `long`                                            |     |
| IPv\*                   | :white_check_mark: |                                                                       |
| Map(\*)                 | :white_check_mark: |                                                                       |
| Nested(\*)              | :white_check_mark: |                                                                       |
| Object('JSON')          | :white_check_mark: |                                                                       |
| SimpleAggregateFunction | :white_check_mark: |                                                                       |
| \*String                | :white_check_mark: |                                                                       |
| Tuple(\*)               | :white_check_mark: |                                                                       |
| UUID                    | :white_check_mark: |                                                                       |

### Driver API

#### Connect to ClickHouse

```java
String url = "jdbc:ch://my-server/system"; // use http protocol and port 8123 by default

Properties properties = new Properties();

ClickHouseDataSource dataSource = new ClickHouseDataSource(url, properties);
try (Connection conn = dataSource.getConnection("default", "password");
    Statement stmt = conn.createStatement()) {
}
```

#### Query

```java

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

#### Insert

:::note
- Use `PreparedStatement` instead of `Statement`
- Use [input function](/en/sql-reference/table-functions/input/) whenever possible
:::

##### With input table function

Recommended way with the best performance:

```java
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

##### Insert

It's easier to use but slower performance compare to input function:

```java
try (PreparedStatement ps = conn.prepareStatement("insert into mytable(* except (description))")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch(); // parameters will be write into buffered stream immediately in binary format
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```

##### Insert with placeholders

Not recommended as it's based on a large SQL:

```java
try (PreparedStatement ps = conn.prepareStatement("insert into mytable values(trim(?),?,?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.setString(3, null); // description
    ps.addBatch(); // append parameters to the query
    ...
    ps.executeBatch(); // issue the composed query: insert into mytable values(...)(...)...(...)
}
```

### Advanced API

#### Connect to ClickHouse with SSL

To establish a secure JDBC connection to ClickHouse using SSL, you'll need to configure your JDBC properties to include the SSL parameters. This typically involves specifying the SSL properties such as sslmode and sslrootcert in your JDBC URL/Properties object.

#### SSL Properties

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

```java
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

#### Handling DateTime and time zones

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

#### Handling AggregateFunction

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

<br/>

#### Configuring HTTP library

The ClickHouse JDBC connector supports three HTTP libraries: [HttpClient](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html), [HttpURLConnection](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/net/HttpURLConnection.html), and [Apache HttpClient](https://hc.apache.org/httpcomponents-client-5.2.x/).

:::note
HttpClient is only supported in JDK 11 or above.
:::

By default, the JDBC driver uses `HttpClient`. You can change the default HTTP library used by the ClickHouse JDBC connector, by adding the following property:

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

#### Resolving JDBC Timeout on Large Inserts

When performing large inserts in ClickHouse with long execution times, you may encounter JDBC timeout errors like:

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```

These errors can disrupt the data insertion process and affect system stability. To address this issue you need to adjust a few timeout settings in the client's OS.

##### Mac OS

On Mac OS, the following settings can be adjusted to resolve the issue:

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

##### Linux

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
Currently, you must use Apache HTTP Client library, as the other two HTTP client libraries in clickhouse-java do not allow setting socket options.
For a detailed guide, go to [Configuring HTTP library](/docs/en/integrations/java#configuring-http-library)
:::

Alternatively, you can add equivalent parameters to the JDBC URL.

#### Configuring node discovery, load balancing, and failover

##### Node discovery

Java client provides the ability to discover ClickHouse nodes automatically. Auto-discovery is disabled by default. To manually enable it, set `auto_discovery`  to `true`:

```java
properties.setProperty("auto_discovery", "true");
```

Or in the connection URL:

```plaintext
jdbc:ch://my-server/system?auto_discovery=true
```

If auto-discovery is enabled, there is no need to specify all ClickHouse nodes in the connection URL. Nodes specified in the URL will be treated as seeds, and the Java client will automatically discover more nodes from system tables and/or clickhouse-keeper or zookeeper.

The following options are responsible for auto-discovery configuration:

| Property                | Default | Description                                                                                           |
|-------------------------|---------|-------------------------------------------------------------------------------------------------------|
| auto_discovery          | `false` | Whether the client should discover more nodes from system tables and/or clickhouse-keeper/zookeeper.  |
| node_discovery_interval | `0`     | Node discovery interval in milliseconds, zero or negative value means one-time discovery.             |
| node_discovery_limit    | `100`   | Maximum number of nodes that can be discovered at a time; zero or negative value means no limit.           |

##### Load balancing

The Java client chooses a ClickHouse node to send requests to, according to the load-balancing policy. In general, the load-balancing policy is responsible for the following things:

1. Get a node from a managed node list.
2. Managing node's status.
3. Optionally schedule a background process for node discovery (if auto-discovery is enabled) and run a health check.

Here is a list of options to configure load balancing:

| Property              | Default                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| load_balancing_policy | `""`                                      | The load-balancing policy can be one of: <li>`firstAlive` - request is sent to the first healthy node from the managed node list</li><li>`random` - request is sent to a random node from the managed node list </li><li>`roundRobin` - request is sent to each node from the managed node list, in turn.</li><li>full qualified class name implementing `ClickHouseLoadBalancingPolicy` - custom load balancing policy</li>If it is not specified the request is sent to the first node from the managed node list |
| load_balancing_tags   | `""`                                      | Load balancing tags for filtering out nodes. Requests are sent only to nodes that have the specified tags                                                                                                                                                                                                                                                                                                                                                                                                      |
| health_check_interval | `0`                                       | Health check interval in milliseconds, zero or negative value means one-time.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| health_check_method   | `ClickHouseHealthCheckMethod.SELECT_ONE`  | Health check method. Can be one of: <li>`ClickHouseHealthCheckMethod.SELECT_ONE` - check with `select 1` query</li> <li>`ClickHouseHealthCheckMethod.PING` - protocol-specific check, which is generally faster</li>                                                                                                                                                                                                                                                                                          |
| node_check_interval   | `0`                                       | Node check interval in milliseconds, negative number is treated as zero. The node status is checked if the specified amount of time has passed since the last check.<br/>The difference between `health_check_interval` and `node_check_interval` is that the `health_check_interval` option schedules the background job, which checks the status for the list of nodes (all or faulty), but `node_check_interval` specifies the amount of time has passed since the last check for the particular node                |
| check_all_nodes       | `false`                                   | Whether to perform a health check against all nodes or just faulty ones.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

##### Failover and retry

Java client provides configuration options to set up failover and retry behavior for failed queries:

| Property                | Default | Description                                                                                                                                                                                                                        |
|-------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover                | `0`     | Maximum number of times a failover can happen for a request. Zero or a negative value means no failover. Failover sends the failed request to a different node (according to the load-balancing policy) in order to recover from failover. |
| retry                   | `0`     | Maximum number of times retry can happen for a request. Zero or a negative value means no retry. Retry sends a request to the same node and only if the ClickHouse server returns the `NETWORK_ERROR` error code                               |
| repeat_on_session_lock  | `true`  | Whether to repeat execution when the session is locked until timed out(according to `session_timeout` or `connect_timeout`). The failed request is repeated if the ClickHouse server returns the `SESSION_IS_LOCKED` error code               |

## R2DBC driver

[R2DBC](https://r2dbc.io/) wrapper of async Java client for ClickHouse.

### Environment requirements

- [OpenJDK](https://openjdk.java.net) version >= 8

### Compatibility with ClickHouse

| Client version | ClickHouse |
|----------------| ---------- |
| 0.6.0          | 22.8+      |

### Installation

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- change to clickhouse-r2dbc_0.9.1 for SPI 0.9.1.RELEASE -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.6.0</version>
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

### Supported data types

| Format                  | Support            | Comment                                                               |
| ----------------------- | ------------------ | --------------------------------------------------------------------- | --- |
| AggregatedFunction      | :white_check_mark: | :warning: does not support `SELECT * FROM table ...`                  |
| Array(\*)               | :white_check_mark: |                                                                       |
| Bool                    | :white_check_mark: |                                                                       |
| Date\*                  | :white_check_mark: |                                                                       |
| DateTime\*              | :white_check_mark: |                                                                       |
| Decimal\*               | :white_check_mark: | `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency |
| Enum\*                  | :white_check_mark: | can be treated as both string and integer                             |     |
| Geo Types               | :white_check_mark: | Point, Ring, Polygon, and MultiPolygon                                |     |
| Int\*, UInt\*           | :white_check_mark: | UInt64 is mapped to `long`                                            |     |
| IPv\*                   | :white_check_mark: |                                                                       |
| Map(\*)                 | :white_check_mark: |                                                                       |
| Nested(\*)              | :white_check_mark: |                                                                       |
| Object('JSON')          | :white_check_mark: |                                                                       |
| SimpleAggregateFunction | :white_check_mark: |                                                                       |
| \*String                | :white_check_mark: |                                                                       |
| Tuple(\*)               | :white_check_mark: |                                                                       |
| UUID                    | :white_check_mark: |                                                                       |

### Driver API

#### Connect to ClickHouse

```java
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

#### Query

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

#### Insert

```java
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
