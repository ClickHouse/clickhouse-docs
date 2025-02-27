import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# クライアント (0.7.x およびそれ以前)

DBサーバーとそのプロトコルを通じて通信するためのJavaクライアントライブラリ。現在の実装は、[HTTPインターフェース](/interfaces/http)のみをサポートしています。このライブラリは、サーバーにリクエストを送信するための独自のAPIを提供します。

:::warning 廃止予定
このライブラリは近日中に廃止されます。新しいプロジェクトには最新の[Javaクライアント](/integrations/language-clients/java/client-v2.md)を使用してください。
:::

## セットアップ {#setup}

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven" >

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

`0.5.0`以降、ドライバは新しいクライアントHTTPライブラリを使用しており、依存関係として追加する必要があります。

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

## 初期化 {#initialization}

接続URL形式: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]` 例:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://explorer@play.clickhouse.com:443`

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

## クエリアPI {#query-api}

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

## ストリーミングクエリアPI {#streaming-query-api}

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

[完全なコード例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L73)は[リポジトリ](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)で確認できます。

## 挿入API {#insert-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // `myInputStream`はRowBinary形式のデータソース
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

[完全なコード例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L39)は[リポジトリ](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)で確認できます。

**RowBinaryエンコーディング**

RowBinary形式については、その[ページ](/interfaces/formats#rowbinarywithnamesandtypes)で説明されています。

[コードの例](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/db/ClickHouseWriter.java#L622)があります。

## 機能 {#features}
### 圧縮 {#compression}

クライアントはデフォルトでLZ4圧縮を使用します。これには次の依存関係が必要です。

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

接続URLで`compress_algorithm=gzip`を設定することでgzipを使用することもできます。

また、圧縮を無効にする方法は以下の通りです。

1. 接続URLに`compress=0`を設定して無効化します: `http://localhost:8123/default?compress=0`
2. クライアント設定を使って無効化します:

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
   .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
   .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
   .build();
```

さまざまな圧縮オプションについては、[圧縮ドキュメント](/data-compression/compression-modes)を参照してください。

### 複数クエリ {#multiple-queries}

ワーカースレッド内で同じセッション内の複数のクエリを連続して実行します。

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

パラメータを位置に依存せずに名前で渡すことができます。この機能は`params`関数を使用して利用できます。

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
すべての`params`シグネチャは、`String`型（`String`、`String[]`、`Map<String, String>`）が有効なClickHouse SQL文字列であることを前提としています。例えば:

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

手動でStringオブジェクトをClickHouse SQLに解析したくない場合は、`com.clickhouse.data`の`ClickHouseValues.convertToSqlExpression`ヘルパー関数を使用できます。

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

上記の例では、`ClickHouseValues.convertToSqlExpression`が内部のシングルクオートをエスケープし、有効なシングルクオートで変数を囲みます。

`Integer`、`UUID`、`Array`、および`Enum`などの他の型は、自動的に`params`内で変換されます。
:::

## ノード発見 {#node-discovery}

JavaクライアントはClickHouseノードを自動的に発見する機能を提供します。自動発見はデフォルトで無効です。手動で有効にするには、`auto_discovery`を`true`に設定します。

```java
properties.setProperty("auto_discovery", "true");
```

または接続URLで:

```plaintext
jdbc:ch://my-server/system?auto_discovery=true
```

自動発見が有効な場合、接続URLにすべてのClickHouseノードを指定する必要はありません。URLに指定されたノードはシードとして扱われ、Javaクライアントはシステムテーブルやclickhouse-keeperまたはzookeeperからさらにノードを自動的に発見します。

以下のオプションが自動発見の設定を担当します:

| プロパティ                | デフォルト | 説明                                                                                           |
|-------------------------|---------|-------------------------------------------------------------------------------------------------------|
| auto_discovery          | `false` | クライアントがシステムテーブルやclickhouse-keeper/zookeeperからさらにノードを発見するかどうか。  |
| node_discovery_interval | `0`     | ミリ秒単位のノード発見間隔、ゼロまたは負の値は一度限りの発見を意味します。             |
| node_discovery_limit    | `100`   | 一度に発見できるノードの最大数；ゼロまたは負の値は制限なしを意味します。           |

### 負荷分散 {#load-balancing}

Javaクライアントは、リクエストを送信するClickHouseノードを負荷分散ポリシーに従って選択します。一般に、負荷分散ポリシーは以下のことを担当します。

1. 管理されているノードリストからノードを取得します。
2. ノードの状態を管理します。
3. 自動発見が有効な場合は、ノード発見のバックグラウンドプロセスをスケジュールし、ヘルスチェックを実行します。

以下は、負荷分散を設定するためのオプションのリストです:

| プロパティ              | デフォルト                                   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| load_balancing_policy | `""`                                      | 負荷分散ポリシーは以下のいずれかです: <li>`firstAlive` - 管理されたノードリストから最初の健康なノードにリクエストを送信します</li><li>`random` - 管理されたノードリストからランダムなノードにリクエストを送信します</li><li>`roundRobin` - 管理されたノードリスト内の各ノードに順番にリクエストを送信します</li><li>`ClickHouseLoadBalancingPolicy`を実装する完全修飾クラス名 - カスタム負荷分散ポリシー</li> 指定しない場合は、リクエストは管理されたノードリストから最初のノードに送信されます。 |
| load_balancing_tags   | `""`                                      | ノードをフィルタリングするための負荷分散タグ。指定されたタグを持つノードのみにリクエストが送信されます。                                                                                                                                                                                                                                                                                                                                                                                                      |
| health_check_interval | `0`                                       | ヘルスチェック間隔（ミリ秒）。ゼロまたは負の値は一度限りを意味します。                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| health_check_method   | `ClickHouseHealthCheckMethod.SELECT_ONE`  | ヘルスチェック方法。以下のいずれかです: <li>`ClickHouseHealthCheckMethod.SELECT_ONE` - `select 1`クエリでチェック</li> <li>`ClickHouseHealthCheckMethod.PING` - プロトコル固有のチェックで、一般的に高速です</li>                                                                                                                                                                                                                                                                                          |
| node_check_interval   | `0`                                       | ノードチェック間隔（ミリ秒）。負の数はゼロとして扱われます。指定された時間が経過するとノードの状態がチェックされます。<br/>`health_check_interval`と`node_check_interval`の違いは、`health_check_interval`オプションがバックグラウンドジョブをスケジュールし、ノードリスト（すべてまたは不良）に対して状態を確認しますが、`node_check_interval`は特定のノードの最後のチェックからの経過時間を指定します。                |
| check_all_nodes       | `false`                                   | すべてのノードに対してヘルスチェックを行うか、不良ノードのみに対して行うか。                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### フェイルオーバーとリトライ {#failover-and-retry}

Javaクライアントは、失敗したクエリのためのフェイルオーバーとリトライの動作を設定するオプションを提供します。

| プロパティ                | デフォルト | 説明                                                                                                                                                                                                                        |
|-------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover                | `0`     | リクエストのフェイルオーバーが発生する最大回数。ゼロまたは負の値はフェイルオーバーなしを意味します。フェイルオーバーは、フェイルしたリクエストを異なるノードに送信し（負荷分散ポリシーに従って）、フェイルから回復します。 |
| retry                   | `0`     | リクエストの最大リトライ回数。ゼロまたは負の値はリトライなしを意味します。リトライは同じノードにリクエストを送信し、ClickHouseサーバーが`NETWORK_ERROR`エラーコードを返した場合にのみ行います。                               |
| repeat_on_session_lock  | `true`  | セッションがタイムアウトするまで実行を繰り返すかどうか（`session_timeout`または`connect_timeout`に従って）。ClickHouseサーバーが`SESSION_IS_LOCKED`エラーコードを返した場合、リクエストが再実行されます。               |

### カスタムHTTPヘッダーの追加 {#adding-custom-http-headers}

Javaクライアントは、リクエストにカスタムHTTPヘッダーを追加したい場合にHTTP/Sトランスポート層をサポートします。
カスタムHTTPヘッダーは、`custom_http_headers`プロパティを使用し、ヘッダーは`,`で区切る必要があります。ヘッダーのキー/値は`=`で区切ります。

## Javaクライアントサポート {#java-client-support}

```java
options.put("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

## JDBCドライバ {#jdbc-driver}

```java
properties.setProperty("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```
