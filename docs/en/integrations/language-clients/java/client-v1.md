---
sidebar_label: Client V1
sidebar_position: 3
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouse Connector v1
slug: /en/integrations/java/client-v1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Client (V1)

Java client library to communicate with a DB server thru its protocols. Current implementation supports only [HTTP interface](/docs/en/interfaces/http). The library provides own API to send requests to a server.  

*Note*: this component will be deprecated soon. 

## Setup

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.7.1</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation("com.clickhouse:clickhouse-http-client:0.7.1")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation 'com.clickhouse:clickhouse-http-client:0.7.1'
```

</TabItem>
</Tabs>

Since version `0.5.0`, the driver uses a new client http library that needs to be added as a dependency.


<Tabs groupId="client-v1-http-client">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5 -->
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3.1</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation("org.apache.httpcomponents.client5:httpclient5:5.3.1")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation 'org.apache.httpcomponents.client5:httpclient5:5.3.1'
```

</TabItem>
</Tabs>

## Initialization

Connection URL Format: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`, for example:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://(https://explorer@play.clickhouse.com:443`

Connect to a single node:

```java showLineNumbers
ClickHouseNode server = ClickHouseNode.of("http://localhost:8123/default?compress=0");
```
Connect to a cluster with multiple nodes:

```java showLineNumbers
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

## Query API

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            long totalRows = summary.getTotalRowsToRead();
}
```

## Streaming Query API 

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
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


See [complete code example](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L73) in the [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client).

## Insert API

```java showLineNumbers



try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // `myInputStream` is source of data in RowBinary format
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

See [complete code example](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L39) in the [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client). 

**RowBinary Encoding**

RowBinary format is descriped on its [page](/docs/en/interfaces/formats#rowbinarywithnamesandtypes).

There is an example of [code](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/db/ClickHouseWriter.java#L622).


## Features
### Compression

The client will by default use LZ4 compression, which requires this dependency:

<Tabs groupId="client-v1-compression-deps">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/org.lz4/lz4-java -->
<dependency>
    <groupId>org.lz4</groupId>
    <artifactId>lz4-java</artifactId>
    <version>1.8.0</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation("org.lz4:lz4-java:1.8.0")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation 'org.lz4:lz4-java:1.8.0'
```

</TabItem>
</Tabs>


You can choose to use gzip instead by setting `compress_algorithm=gzip` in the connection URL.

Alternatively, you can disable compression a few ways.

1. Disable by setting `compress=0` in the connection URL: `http://localhost:8123/default?compress=0`
2. Disable via the client configuration:

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
   .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
   .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
   .build();
```

See the [compression documentation](/en/native-protocol/compression) to learn more about different compression options.

### Multiple queries

Execute multiple queries in a worker thread one after another within same session:

```java showLineNumbers
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

### Named Parameters

You can pass parameters by name rather than relying solely on their position in the parameter list. This capability is available using `params` function.

```java showLineNumbers
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

```java showLineNumbers
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

```java showLineNumbers
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

## Node Discovery

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

### Load Balancing

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

### Failover and retry

Java client provides configuration options to set up failover and retry behavior for failed queries:

| Property                | Default | Description                                                                                                                                                                                                                        |
|-------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover                | `0`     | Maximum number of times a failover can happen for a request. Zero or a negative value means no failover. Failover sends the failed request to a different node (according to the load-balancing policy) in order to recover from failover. |
| retry                   | `0`     | Maximum number of times retry can happen for a request. Zero or a negative value means no retry. Retry sends a request to the same node and only if the ClickHouse server returns the `NETWORK_ERROR` error code                               |
| repeat_on_session_lock  | `true`  | Whether to repeat execution when the session is locked until timed out(according to `session_timeout` or `connect_timeout`). The failed request is repeated if the ClickHouse server returns the `SESSION_IS_LOCKED` error code               |

### Adding custom http headers

Java client support HTTP/S transport layer in case we want to add custom HTTP headers to the request.
We should use the custom_http_headers property, and the headers need to be `,` separated. The header key/value should be divided using `=`

## Java Client support

```java
options.put("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

## JDBC Driver  

```java
properties.setProperty("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

