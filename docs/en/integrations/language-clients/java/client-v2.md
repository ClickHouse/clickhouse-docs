---
sidebar_label: Client V2
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouse Connector v2
slug: /en/integrations/java/client-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java Client (V2)

Java client library to communicate with a DB server through its protocols. The current implementation only supports the [HTTP interface](/docs/en/interfaces/http). The library provides its own API to send requests to a server. The library also provides tools to work with different binary data formats (RowBinary* & Native*).  

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

The Client object is initialized by `com.clickhouse.client.api.Client.Builder#build()`. Each client has its own context and no objects are shared between them.
The Builder has configuration methods for convenient setup. 

Example: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` is `AutoCloseable` and should be closed when not needed anymore. 

## Configuration 

All settings are defined by instance methods (a.k.a configuration methods) that make the scope and context of each value clear. 
Major configuration parameters are defined in one scope (client or operation) and do not override each other.

Configuration is defined during client creation. See `com.clickhouse.client.api.Client.Builder`.

## Common Definitions

### ClickHouseFormat

Enum of [supported formats](/docs/en/interfaces/formats). It includes all formats that ClickHouse supports. 

* `raw` - user should transcode raw data 
* `full` - the client can transcode data by itself and accepts a raw data stream
* `-` - operation not supported by ClickHouse for this format

This client version supports:

| Format                                                                                                                        | Input  | Output  |
|-------------------------------------------------------------------------------------------------------------------------------|:------:|:-------:|
| [TabSeparated](/docs/en/interfaces/formats#tabseparated)                                                                      | raw    | raw     |
| [TabSeparatedRaw](/docs/en/interfaces/formats#tabseparatedraw)                                                                | raw    | raw     |
| [TabSeparatedWithNames](/docs/en/interfaces/formats#tabseparatedwithnames)                                                    | raw    | raw     |
| [TabSeparatedWithNamesAndTypes](/docs/en/interfaces/formats#tabseparatedwithnamesandtypes)                                    | raw    | raw     |
| [TabSeparatedRawWithNames](/docs/en/interfaces/formats#tabseparatedrawwithnames)                                              | raw    | raw     |
| [TabSeparatedRawWithNamesAndTypes](/docs/en/interfaces/formats#tabseparatedrawwithnamesandtypes)                              | raw    | raw     |
| [Template](/docs/en/interfaces/formats#format-template)                                                                       | raw    | raw     |
| [TemplateIgnoreSpaces](/docs/en/interfaces/formats#templateignorespaces)                                                      | raw    |  -      |
| [CSV](/docs/en/interfaces/formats#csv)                                                                                        | raw    | raw     |
| [CSVWithNames](/docs/en/interfaces/formats#csvwithnames)                                                                      | raw    | raw     |
| [CSVWithNamesAndTypes](/docs/en/interfaces/formats#csvwithnamesandtypes)                                                      | raw    | raw     |
| [CustomSeparated](/docs/en/interfaces/formats#format-customseparated)                                                         | raw    | raw     |
| [CustomSeparatedWithNames](/docs/en/interfaces/formats#customseparatedwithnames)                                              | raw    | raw     |
| [CustomSeparatedWithNamesAndTypes](/docs/en/interfaces/formats#customseparatedwithnamesandtypes)                              | raw    | raw     |
| [SQLInsert](/docs/en/interfaces/formats#sqlinsert)                                                                            | -      | raw     |
| [Values](/docs/en/interfaces/formats#data-format-values)                                                                      | raw    | raw     |
| [Vertical](/docs/en/interfaces/formats#vertical)                                                                              | -      | raw     |
| [JSON](/docs/en/interfaces/formats#json)                                                                                      | raw    | raw     |
| [JSONAsString](/docs/en/interfaces/formats#jsonasstring)                                                                      | raw    | -       |
| [JSONAsObject](/docs/en/interfaces/formats#jsonasobject)                                                                      | raw    | -       |
| [JSONStrings](/docs/en/interfaces/formats#jsonstrings)                                                                        | raw    | raw     |
| [JSONColumns](/docs/en/interfaces/formats#jsoncolumns)                                                                        | raw    | raw     |
| [JSONColumnsWithMetadata](/docs/en/interfaces/formats#jsoncolumnsmonoblock)                                                   | raw    | raw     |
| [JSONCompact](/docs/en/interfaces/formats#jsoncompact)                                                                        | raw    | raw     |
| [JSONCompactStrings](/docs/en/interfaces/formats#jsoncompactstrings)                                                          | -      | raw     |
| [JSONCompactColumns](/docs/en/interfaces/formats#jsoncompactcolumns)                                                          | raw    | raw     |
| [JSONEachRow](/docs/en/interfaces/formats#jsoneachrow)                                                                        | raw    | raw     |
| [PrettyJSONEachRow](/docs/en/interfaces/formats#prettyjsoneachrow)                                                            | -      | raw     |
| [JSONEachRowWithProgress](/docs/en/interfaces/formats#jsoneachrowwithprogress)                                                | -      | raw     |
| [JSONStringsEachRow](/docs/en/interfaces/formats#jsonstringseachrow)                                                          | raw    | raw     |
| [JSONStringsEachRowWithProgress](/docs/en/interfaces/formats#jsonstringseachrowwithprogress)                                  | -      | raw     |
| [JSONCompactEachRow](/docs/en/interfaces/formats#jsoncompacteachrow)                                                          | raw    | raw     |
| [JSONCompactEachRowWithNames](/docs/en/interfaces/formats#jsoncompacteachrowwithnames)                                        | raw    | raw     |
| [JSONCompactEachRowWithNamesAndTypes](/docs/en/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                        | raw    | raw     |
| [JSONCompactStringsEachRow](/docs/en/interfaces/formats#jsoncompactstringseachrow)                                            | raw    | raw     |
| [JSONCompactStringsEachRowWithNames](/docs/en/interfaces/formats#jsoncompactstringseachrowwithnames)                          | raw    | raw     |
| [JSONCompactStringsEachRowWithNamesAndTypes](/docs/en/interfaces/formats#jsoncompactstringseachrowwithnamesandtypes)          | raw    | raw     |
| [JSONObjectEachRow](/docs/en/interfaces/formats#jsonobjecteachrow)                                                            | raw    | raw     |
| [BSONEachRow](/docs/en/interfaces/formats#bsoneachrow)                                                                        | raw    | raw     |
| [TSKV](/docs/en/interfaces/formats#tskv)                                                                                      | raw    | raw     |
| [Pretty](/docs/en/interfaces/formats#pretty)                                                                                  | -      | raw     |
| [PrettyNoEscapes](/docs/en/interfaces/formats#prettynoescapes)                                                                | -      | raw     |
| [PrettyMonoBlock](/docs/en/interfaces/formats#prettymonoblock)                                                                | -      | raw     |
| [PrettyNoEscapesMonoBlock](/docs/en/interfaces/formats#prettynoescapesmonoblock)                                              | -      | raw     |
| [PrettyCompact](/docs/en/interfaces/formats#prettycompact)                                                                    | -      | raw     |
| [PrettyCompactNoEscapes](/docs/en/interfaces/formats#prettycompactnoescapes)                                                  | -      | raw     |
| [PrettyCompactMonoBlock](/docs/en/interfaces/formats#prettycompactmonoblock)                                                  | -      | raw     |
| [PrettyCompactNoEscapesMonoBlock](/docs/en/interfaces/formats#prettycompactnoescapesmonoblock)                                | -      | raw     |
| [PrettySpace](/docs/en/interfaces/formats#prettyspace)                                                                        | -      | raw     |
| [PrettySpaceNoEscapes](/docs/en/interfaces/formats#prettyspacenoescapes)                                                      | -      | raw     |
| [PrettySpaceMonoBlock](/docs/en/interfaces/formats#prettyspacemonoblock)                                                      | -      | raw     |
| [PrettySpaceNoEscapesMonoBlock](/docs/en/interfaces/formats#prettyspacenoescapesmonoblock)                                    | -      | raw     |
| [Prometheus](/docs/en/interfaces/formats#prometheus)                                                                          | -      | raw     |
| [Protobuf](/docs/en/interfaces/formats#protobuf)                                                                              | raw    | raw     |
| [ProtobufSingle](/docs/en/interfaces/formats#protobufsingle)                                                                  | raw    | raw     |
| [ProtobufList](/docs/en/interfaces/formats#protobuflist)								                                        | raw    | raw     |
| [Avro](/docs/en/interfaces/formats#data-format-avro)                                                                          | raw    | raw     |
| [AvroConfluent](/docs/en/interfaces/formats#data-format-avro-confluent)                                                       | raw    | -       |
| [Parquet](/docs/en/interfaces/formats#data-format-parquet)                                                                    | raw    | raw     |
| [ParquetMetadata](/docs/en/interfaces/formats#data-format-parquet-metadata)                                                   | raw    | -       |
| [Arrow](/docs/en/interfaces/formats#data-format-arrow)                                                                        | raw    | raw     |
| [ArrowStream](/docs/en/interfaces/formats#data-format-arrow-stream)                                                           | raw    | raw     |
| [ORC](/docs/en/interfaces/formats#data-format-orc)                                                                            | raw    | raw     |
| [One](/docs/en/interfaces/formats#data-format-one)                                                                            | raw    | -       |
| [Npy](/docs/en/interfaces/formats#data-format-npy)                                                                            | raw    | raw     |
| [RowBinary](/docs/en/interfaces/formats#rowbinary)                                                                            | full   | full    |
| [RowBinaryWithNames](/docs/en/interfaces/formats#rowbinarywithnamesandtypes)                                                  | full   | full    |
| [RowBinaryWithNamesAndTypes](/docs/en/interfaces/formats#rowbinarywithnamesandtypes)                                          | full   | full    |
| [RowBinaryWithDefaults](/docs/en/interfaces/formats#rowbinarywithdefaults)                                                    | full   | -       |
| [Native](/docs/en/interfaces/formats#native)                                                                                  | full   | raw     |
| [Null](/docs/en/interfaces/formats#null)                                                                                      | -      | raw     |
| [XML](/docs/en/interfaces/formats#xml)                                                                                        | -      | raw     |
| [CapnProto](/docs/en/interfaces/formats#capnproto)                                                                            | raw    | raw     |
| [LineAsString](/docs/en/interfaces/formats#lineasstring)                                                                      | raw    | raw     |
| [Regexp](/docs/en/interfaces/formats#data-format-regexp)                                                                      | raw    | -       |
| [RawBLOB](/docs/en/interfaces/formats#rawblob)                                                                                | raw    | raw     |
| [MsgPack](/docs/en/interfaces/formats#msgpack)                                                                                | raw    | raw     |
| [MySQLDump](/docs/en/interfaces/formats#mysqldump)                                                                            | raw    | -       |
| [DWARF](/docs/en/interfaces/formats#dwarf)                                                                                    | raw    | -       |
| [Markdown](/docs/en/interfaces/formats#markdown)                                                                              | -      | raw     |
| [Form](/docs/en/interfaces/formats#form)                                                                                      | raw    | -       |


## Insert API

### insert(String tableName, InputStream data, ClickHouseFormat format) 

Accepts data as an `InputStream` of bytes in the specified format. It is expected that `data` is encoded in the `format`.

**Signatures**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**Parameters**

`tableName` - a target table name.

`data` - an input stream of an encoded data.

`format` - a format in which the data is encoded.

`settings` - request settings.

**Return value**

Future of `InsertResponse` type - result of the operation and additional information like server side metrics.

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

Sends a write request to database. The list of objects is converted into an efficient format and then is sent to a server. The class of the list items should be registed up-front using `register(Class, TableSchema)` method.

**Signatures**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**Parameters**

`tableName` - name of the target table. 

`data` - collection DTO (Data Transfer Object) objects.

`settings` - request settings.

**Return value**

Future of `InsertResponse` type - the result of the operation and additional information like server side metrics.

**Examples**

```java showLineNumbers
// Important step (done once) - register class to pre-compile object serializer according to the table schema. 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));


List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // handle response, then it will be closed and connection that served request will be released. 
}
```

### InsertSettings

Configuration options for insert operations.

**Configuration methods**

<dl>
  <dt>setQueryId(String queryId)</dt>
  <dd>Sets query ID that will be assigned to the operation</dd>

  <dt>setDeduplicationToken(String token)</dt>
  <dd>Sets the deduplication token. This token will be sent to the server and can be used to identify the query.</dd>

  <dt>waitEndOfQuery(Boolean waitEndOfQuery)</dt>
  <dd>Requests the server to wait for the and of the query before sending response.</dd>

  <dt>setInputStreamCopyBufferSize(int size)</dt>
  <dd>Copy buffer size. The buffer is used during write operations to copy data from user provided input stream to an output stream.</dd>
</dl>

### InsertResponse 

Response object that holds result of insert operation. It is only available if the client got response from a server. 

:::note
This object should be closed as soon as possible to release a connection because the connection cannot be re-used until all data of previous response is fully read.
:::

<dl>
    <dt>OperationMetrics getMetrics()</dt>
    <dd>Returns object with operation metrics</dd>
    <dt>String getQueryId()</dt>
    <dd>Returns query ID assigned for the operation by application (thru operation settings or by server).</dd>
</dl>

## Query API

### query(String sqlQuery)

Sends `sqlQuery` as is. Response format is set by query settings. `QueryResponse` will hold a reference to the response stream that should be consumed by a reader for the supportig format.

**Signatures**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**Parameters**

`sqlQuery` - a single SQL statement. The Query is sent as is to a server.  

`settings` - request settings.

**Return value**

Future of `QueryResponse` type - a result dataset and additional information like server side metrics. The Response object should be closed after consuming the dataset. 

**Examples**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// Default format is RowBinaryWithNamesAndTypesFormatReader so reader have all information about columns
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // Create a reader to access the data in a convenient way
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Read the next record from stream and parse it

        // get values
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // collecting data 
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// put business logic outside of the reading block to release http connection asap.  
```

### query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings) 

Sends `sqlQuery` as is. Additionally will send query parameters so the server can compile the SQL expression.

**Signatures**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**Parameters**

`sqlQuery` - sql expression with placeholders `{}`. 

`queryParams` - map of variables to complete the sql expression on server.

`settings` - request settings. 

**Return value**

Future of `QueryResponse` type - a result dataset and additional information like server side metrics. The Response object should be closed after consuming the dataset. 

**Examples**

```java showLineNumbers

// define parameters. They will be sent to the server along with the request.   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // Create a reader to access the data in a convenient way
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Read the next record from stream and parse it

        // reading data 
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}

```

### queryAll(String sqlQuery)

Queries a data in `RowBinaryWithNamesAndTypes` format. Returns the result as a collection. Read performance is the same as with the reader but more memory is required to hold the whole dataset.

**Signatures**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**Parameters**

`sqlQuery` - sql expression to query data from a server.

**Return value**

Complete dataset represented by a list of `GenericRecord` objects that provide access in row style for the result data. 

**Examples**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // Read whole result set and process it record by record
    client.queryAll(sql).forEach(row -> {
        double id = row.getDouble("id");
        String title = row.getString("title");
        String url = row.getString("url");

        log.info("id: {}, title: {}, url: {}", id, title, url);
    });
} catch (Exception e) {
    log.error("Failed to read data", e);
}
```

### QuerySettings

Configuration options for query operations.

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
  <dd>Requests server to use `timeZone` for time conversion. See <a href="/docs/en/operations/settings/settings#session_timezone" target="_blank">session_timezone</a>.</dd>
</dl>

### QueryResponse 

Response object that holds result of query execution. It is only available if the client got a response from a server. 

:::note
This object should be closed as soon as possible to release a connection because the connection cannot be re-used until all data of previous response is fully read.
:::

<dl>
    <dt>ClickHouseFormat getFormat()</dt>
    <dd>Returns a format in which data in the response is encoded.</dd>
    <dt>InputStream getInputStream()</dt>
    <dd>Returns uncompressed byte stream of data in the specified format.</dd>
    <dt>OperationMetrics getMetrics()</dt>
    <dd>Returns object with operation metrics</dd>
    <dt>String getQueryId()</dt>
    <dd>Returns query ID assigned for the operation by application (thru operation settings or by server).</dd>
    <dt>TimeZone getTimeZone()</dt>
    <dd>Returns timezone that should be used for handling Date/DateTime types in the response.</dd>
</dl>

### Examples 

- Example code is available in [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)
- Reference Spring Service [implementation](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)

## Common API

### getTableSchema(String table)

Fetches table schema for the `table`.

**Signatures**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**Parameters**

`table` - table name for which schema data should be fetched.

`database` - database where the target table is defined.

**Return value**

Returns a `TableSchema` object with list of table columns.

### getTableSchemaFromQuery(String sql)

Fetches schema from a SQL statement. 

**Signatures**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**Parameters**

`sql` - "SELECT" SQL statement which schema should be returned.

**Return value**

Returns a `TableSchema` object with columns matching the `sql` expression.

### TableSchema

### register(Class<?> clazz, TableSchema schema)

Compiles SerDe layer for the Java Class to use for writing/reading data with `schema`. The method will create a serializer and deserializer for the pair getter/setter and corresponding column. 
Column match is found by extracting its name from a method name. For example, `getFirstName` will be for the column `first_name` or `firstname`. 

**Signatures**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**Parameters**

`clazz` - Class representing the POJO used to read/write data.

`schema` - Data schema to use for matching with POJO properties.


**Examples**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples 

Complete examples code is stored in the repo in a 'example` [folder](https://github.com/ClickHouse/clickhouse-java/tree/main/examples):

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - main set of examples.
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - example of how to use the client in a Spring Boot application.
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - example of how to use the client in Ktor (Kotlin) application.
