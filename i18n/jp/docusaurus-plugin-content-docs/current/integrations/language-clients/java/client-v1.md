import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# クライアント (0.7.x およびそれ以前)

DBサーバとそのプロトコルを通じて通信するためのJavaクライアントライブラリです。現在の実装は、[HTTPインターフェース](/interfaces/http) のみをサポートしています。このライブラリは、サーバにリクエストを送信するための独自のAPIを提供します。

:::warning 非推奨
このライブラリは近々非推奨になります。新しいプロジェクトには最新の[Java Client](/integrations/language-clients/java/client.md)を使用してください。
:::

## セットアップ {#setup}

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.7.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation("com.clickhouse:clickhouse-http-client:0.7.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation 'com.clickhouse:clickhouse-http-client:0.7.2'
```

</TabItem>
</Tabs>

バージョン `0.5.0` 以降、ドライバは新しいクライアントHTTPライブラリを使用しており、依存関係として追加する必要があります。

<Tabs groupId="client-v1-http-client">
<TabItem value="maven" label="Maven">

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

## 初期化 {#initialization}

接続URL形式: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`。例:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://(https://explorer@play.clickhouse.com:443`

単一ノードに接続:

```java showLineNumbers
ClickHouseNode server = ClickHouseNode.of("http://localhost:8123/default?compress=0");
```
複数ノードを持つクラスターに接続:

```java showLineNumbers
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

## クエリAPI {#query-api}

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

## ストリーミングクエリAPI {#streaming-query-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            for (ClickHouseRecord r : response.records()) {
            int num = r.getValue(0).asInteger();
            // 型変換
            String str = r.getValue(0).asString();
            LocalDate date = r.getValue(0).asDate();
        }
}
```

[完全なコード例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L73)を[リポジトリ](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)で確認してください。

## 挿入API {#insert-api}

```java showLineNumbers

try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // `myInputStream` はRowBinary形式のデータソースです
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

[完全なコード例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L39)を[リポジトリ](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)で確認してください。

**RowBinaryエンコーディング**

RowBinary形式については、[ページ](/interfaces/formats#rowbinarywithnamesandtypes)を参照してください。

[コードの例](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/db/ClickHouseWriter.java#L622)があります。

## 機能 {#features}
### 圧縮 {#compression}

クライアントはデフォルトでLZ4圧縮を使用します。これには次の依存関係が必要です：

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

接続URLに `compress_algorithm=gzip` を設定することでgzipを使用することもできます。

もしくは、いくつかの方法で圧縮を無効にすることができます。

1. 接続URLで `compress=0` を設定して無効にする: `http://localhost:8123/default?compress=0`
2. クライアント構成を介して無効にする：

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
   .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
   .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
   .build();
```

さまざまな圧縮オプションについては、[圧縮ドキュメント](/data-compression/compression-modes)を確認してください。

### 複数のクエリ {#multiple-queries}

同じセッション内でワーカースレッドで複数のクエリを1つずつ実行します：

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

### 名前付きパラメータ {#named-parameters}

パラメータリスト内の位置に依存せず、名前でパラメータを渡すことができます。この機能は `params` 関数を使用して利用できます。

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

:::note パラメータ
`String`型を含むすべての `params` シグネチャ（`String`、`String[]`、`Map<String, String>`）は、渡されるキーが有効なClickHouse SQL文字列であることを前提としています。例えば：

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

ClickHouse SQLに手動でStringオブジェクトを解析したくない場合は、`com.clickhouse.data` にあるヘルパー関数 `ClickHouseValues.convertToSqlExpression` を使用できます：

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

上記の例では、`ClickHouseValues.convertToSqlExpression` が内部のシングルクオートをエスケープし、変数を有効なシングルクオートで囲みます。

`Integer`、`UUID`、`Array`、および `Enum` などの他の型は、 `params` 内で自動的に変換されます。
:::

## ノード発見 {#node-discovery}

Javaクライアントは、ClickHouseノードを自動的に発見する機能を提供します。自動発見はデフォルトで無効になっています。手動で有効にするには、`auto_discovery` を `true` に設定します：

```java
properties.setProperty("auto_discovery", "true");
```

または接続URL内で：

```plaintext
jdbc:ch://my-server/system?auto_discovery=true
```

自動発見が有効になっている場合、接続URL内ですべてのClickHouseノードを指定する必要はありません。URL内で指定されたノードはシードとして扱われ、Javaクライアントはシステムテーブルやclickhouse-keeperまたはzookeeperから自動的に他のノードを発見します。

自動発見設定に関連するオプションは次のとおりです：

| プロパティ                | デフォルト | 説明                                                                                               |
|-------------------------|---------|-------------------------------------------------------------------------------------------------------|
| auto_discovery          | `false` | クライアントがシステムテーブルやclickhouse-keeper/zookeeperからさらにノードを発見するべきかどうか。                         |
| node_discovery_interval | `0`     | ノード発見間隔（ミリ秒）。ゼロまたは負の値は一度だけ発見することを意味します。                                           |
| node_discovery_limit    | `100`   | 一度に発見できるノードの最大数。ゼロまたは負の値は制限なしを意味します。                                                             |

### 負荷分散 {#load-balancing}

Javaクライアントは、負荷分散ポリシーに従ってリクエストを送信するClickHouseノードを選択します。一般に、負荷分散ポリシーは以下のことを担当します：

1. 管理されたノードリストからノードを取得する。
2. ノードの状態を管理する。
3. （自動発見が有効な場合）ノード発見のためのバックグラウンドプロセスをスケジュールし、ヘルスチェックを実行する。

負荷分散を構成するためのオプションは以下のとおりです：

| プロパティ              | デフォルト                                   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| load_balancing_policy | `""`                                      | 負荷分散ポリシーは次のいずれかです： <li>`firstAlive` - 管理されたノードリストから最初の健康なノードにリクエストを送信</li><li>`random` - 管理されたノードリストからランダムなノードにリクエストを送信</li><li>`roundRobin` - 管理されたノードリストの各ノードに順番にリクエストを送信。</li><li>`ClickHouseLoadBalancingPolicy`を実装する完全修飾クラス名 - カスタム負荷分散ポリシー</li>指定されていない場合、リクエストは管理されたノードリストの最初のノードに送信されます。 |
| load_balancing_tags   | `""`                                      | ノードをフィルタリングするための負荷分散タグ。指定されたタグを持つノードのみにリクエストが送信されます。                                                                                                                                                                                                                                                                                                                                                                                                 |
| health_check_interval | `0`                                       | ヘルスチェック間隔（ミリ秒）。ゼロまたは負の値は一度だけを意味します。                                                                                                                                                                                                                                                                                                                                                                                                                                |
| health_check_method   | `ClickHouseHealthCheckMethod.SELECT_ONE`  | ヘルスチェックメソッド。次のいずれかです： <li>`ClickHouseHealthCheckMethod.SELECT_ONE` - `select 1` クエリでチェック</li> <li>`ClickHouseHealthCheckMethod.PING` - プロトコル固有のチェック、通常はより高速です。</li>                                                                                                                                                                                                                                                                                   |
| node_check_interval   | `0`                                       | ノードチェック間隔（ミリ秒）。負の数はゼロとして扱われます。指定された時間が最終チェックから経過すると、ノード状態がチェックされます。<br/>`health_check_interval`と`node_check_interval`の違いは、`health_check_interval`オプションがバックグラウンドジョブをスケジュールし、ノードリスト（全てまたは故障したもの）のステータスをチェックするのに対し、`node_check_interval`は特定のノードについて最後のチェックから経過した時間を指定します。 |
| check_all_nodes       | `false`                                   | すべてのノードに対してヘルスチェックを実行するか、故障したノードのみかどうか。                                                                                                                                                                                                                                                                                                                                                                                                                          |

### フェイルオーバーとリトライ {#failover-and-retry}

Javaクライアントは、失敗したクエリのためにフェイルオーバーとリトライの動作を設定するためのオプションを提供します：

| プロパティ                | デフォルト | 説明                                                                                                                                                                                                                        |
|-------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover                | `0`     | リクエストのためのフェイルオーバーが発生する最大回数。ゼロまたは負の値はフェイルオーバーなしを意味します。フェイルオーバーは、異なるノードに失敗したリクエストを送信し、フェイルオーバーから回復します。                                                                                              |
| retry                   | `0`     | リクエストのためのリトライが発生する最大回数。ゼロまたは負の値はリトライなしを意味します。リトライは、同じノードにリクエストを送信し、ClickHouseサーバが `NETWORK_ERROR` エラーコードを返した場合のみ発生します。                                                                                         |
| repeat_on_session_lock  | `true`  | セッションがタイムアウトするまで、ロック時に実行を繰り返すかどうか（`session_timeout` または `connect_timeout` に従う）。ClickHouseサーバが `SESSION_IS_LOCKED` エラーコードを返した場合、失敗したリクエストは繰り返されます。                                           |

### カスタムHTTPヘッダーの追加 {#adding-custom-http-headers}

Javaクライアントは、リクエストにカスタムHTTPヘッダーを追加する場合に、HTTP/Sトランスポート層をサポートします。 `custom_http_headers` プロパティを使用する必要があり、ヘッダーは `,` で区切る必要があります。ヘッダーのキー/値は `=` で区切るべきです。

## Javaクライアントサポート {#java-client-support}

```java
options.put("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

## JDBCドライバ {#jdbc-driver}

```java
properties.setProperty("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```
