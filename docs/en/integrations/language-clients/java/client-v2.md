---
sidebar_label: Client V2
sidebar_position: 2
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: Options for connecting to ClickHouse from Java
slug: /en/integrations/java/client-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java Client (V2)

Implementation of a new API. It uses Apache Http Client to communicate with ClickHouse server. We have selected this http client because it has many built-in features and 
has proven itself in old client implementation. We are planning to support other http client libraries. 

*Note*: Client-V2 is currently in the phase of active development and we are still working on it. 

## Setup

- Maven Central (project web page): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- Nightly builds (repository link): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-v2-setup">
<TabItem value="maven" label="Maven" >

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.6.5</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.6.5")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.6.5'
```

</TabItem>
</Tabs>

## Initialization

Client object is initialized by `com.clickhouse.client.api.Client.Builder#build()`. Each client has own context and no objects are shared between them.
Builder has configuration method for convinient setup. 

Example: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build;
```

`Client` is `AutoCloseable` and should be closed when not needed anymore. 

## Configuration 

All settings are defined by instance methods (a.k.a configuration methods) that make scope and context of each value clear. 
Major configuration parameters are defined in one scope (client or operation) and do not override each other. Handling 
configuration overriding across is a very hard task so we doing our best to keep it simple. 

This section describes only client wide settings. Each operation may have own and will be listed in the their sections. 


## Insert API

### insert(String tableName, InputStream data) 

Sends write request to database. Input data is read from the input stream.

**Signatures**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**Parameters**

`tableName` - a target table name.

`data` - an input stream of an encoded data.

`format` - a format in which the data is encoded.

`settings` - request settings 

**Return value**

Future of `InsertResponse` type - result of operation and additional information like server side metrics.

**Examples**

```java showLineNumbers
try (InputStream dataStream = getDataStream()) {
    try (InsertResponse response = client.insert(TABLE_NAME, dataStream, ClickHouseFormat.JSONEachRow,
            insertSettings).get(3, TimeUnit.SECONDS)) {

        log.info("Insert finished: {} rows written", response.getMetrics().getMetric(ServerMetrics.NUM_ROWS_WRITTEN).getLong());
    } catch (Exception e) {
        log.error("Failed to write JSONEachRow data", e);
        throw new RuntimeException(e);
    }
}

```

### insert(String tableName, List<?> data, InsertSettings settings)

Sends write request to database. List of objects is converted into a most effective format and then is sent to a server. Class of the list items should be registed up-front using `register(Class, TableSchema)` method.

**Signatures**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**Parameters**

`tableName` - name of the target table. 

`data` - collection DTO (Data Transfer Object) objects.

`settings` - request settings 

**Return value**

Future of `InsertResponse` type - result of operation and additional information like server side metrics.

**Examples**

```java showLineNumbers
// Important step (done once) - register class to pre-compile object serializer according to the table schema. 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));


List<ArtivleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // handle response, then it will be closed and connection that served request will be released. 
}
```

## Query API

### query(String sqlQuery)

Sends `sqlQuery` as is. Response format is set by query settings. `QueryResponse` will hold a reference to the response stream what should be consumer by a reader for supportig format

**Signatures**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**Parameters**


**Return value**

Future of `QueryResponse` type - a result dataset and  additional information like server side metrics. Response object should be closed after consuming the dataset. 

**Examples**

```java 

```

### query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings) 

Sends `sqlQuery` as is. Additionally will send query parameter so server can comple SQL expression.

**Signatures**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**Parameters**

`sqlQuery` - sql expression with placeholders `{}` 

`queryParams` - map of variables to complete sql expression on server

`settings` - request settings 

**Return value**

Future of `QueryResponse` type - a result dataset and  additional information like server side metrics. Response object should be closed after consuming the dataset. 


### queryAll(String sqlQuery)

Queries a data in `RowBinaryWithNamesAndTypes` format. Returns result as a collection. Read performance is the same as with reader but more memory required at a time to keep whole dataset.

**Signatures**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**Parameters**

`sqlQuery` - sql expression to query data from a serve r

**Return value**

Complete dataset represented by list of `GenericRecord` object that provide access in row style for the result data. 

**Examples**


### QuerySettings

**Configuration methods**

<dl>
  <dt>setQueryId(String queryId)</dt>
  <dd>Sets query ID that will be assigned to the operation</dd>

  <dt>setFormat(ClickHouseFormat format)</dt>
  <dd>Sets response format. See `RowBinaryWithNamesAndTypes` for the full list.</dd>

  <dt>setMaxExecutionTime(Integer maxExecutionTime)</dt>
  <dd>Sets operation execution time on server. Will not affect read timeout.</dd>

  <dt>waitEndOfQuery(Boolean waitEndOfQuery)</dt>
  <dd>Requests the server to wait for the and of the query before sending response.</dd>

  <dt>setUseServerTimeZone(Boolean useServerTimeZone)</dt>
  <dd>Server timezone (see client config) will be used to parse date/time types in the result of an operation. Default `false`</dd>

  <dt>setUseTimeZone(String timeZone)</dt>
  <dd>Requests server to use `timeZone` for time conversion. See (`session_timezone`)[https://clickhouse.com/docs/en/operations/settings/settings#session_timezone]</dd>
</dl>

### Examples 

- Example code is available in [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)
- Reference Spring Service [implementation](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)

## Common API