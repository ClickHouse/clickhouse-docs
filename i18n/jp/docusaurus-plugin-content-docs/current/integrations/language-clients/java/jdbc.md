---
sidebar_label: JDBC 0.8+
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: ClickHouse JDBCドライバー
slug: /integrations/language-clients/java/jdbc
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# JDBC ドライバー (0.8+)

`clickhouse-jdbc` は、最新の [java client](/integrations/language-clients/java/client.md) を使用して標準 JDBC インターフェースを実装しています。パフォーマンスや直接接続が重要な場合は、最新の [java client](/integrations/language-clients/java/client.md) を直接使用することをお勧めします。

:::note
JDBCドライバの以前のバージョンのドキュメントを探している場合は、[こちら](/integrations/language-clients/java/jdbc-v1.md)をご覧ください。
:::

## 0.7.x からの変更 {#changes-from-07x}
0.8ではドライバーがJDBC仕様により厳密に準拠するようにしたため、削除された機能がいくつかあり、影響を受ける可能性があります：

| 古い機能                             | 注意点                                                                                                                                                                                                                                                                                                        |
|--------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| トランザクションサポート              | ドライバーの初期バージョンでは、トランザクションサポートは**シミュレーション**されており、予期しない結果を招く可能性がありました。                                                                                                                                                                          |
| レスポンスカラムのリネーム           | `ResultSet` は可変だったため、効率を考慮して現在は読み取り専用です。                                                                                                                                                                                                                                           |
| マルチステートメントSQL              | マルチステートメントサポートは**シミュレーション**されていただけで、現在は厳密に1:1に準拠しています。                                                                                                                                                                                                             |
| 名前付きパラメータ                  | JDBC仕様の一部ではありません。                                                                                                                                                                                                                                                                               |
| ストリームベースの `PreparedStatement` | ドライバーの初期バージョンでは、`PreparedStatement` の非jdbc使用を許可していました。こういったオプションが必要な場合は、[Java Client](/integrations/language-clients/java/client.md) とその[例](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)を検討することをお勧めします。 |

:::note
`Date` はタイムゾーンなしで保存され、`DateTime` はタイムゾーン付きで保存されます。注意しないと予期しない結果を招く可能性があります。
:::

## 環境要件 {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) バージョン >= 8

### セットアップ {#setup}

<Tabs groupId="jdbc-base-dependencies">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.8.1</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.1:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.1:shaded-all'
```

</TabItem>
</Tabs>

## 設定 {#configuration}

**ドライバークラス**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL 構文**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`、例えば:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**接続プロパティ**:

標準のJDBCプロパティに加えて、ドライバーは基盤となる [java client](/integrations/language-clients/java/client.md) が提供するClickHouse特有のプロパティをサポートしています。可能な場合、サポートされていない機能については `SQLFeatureNotSupportedException` を返します。他のカスタムプロパティには次のものがあります：

| プロパティ                             | デフォルト   | 説明                                                       |
|----------------------------------------|--------------|----------------------------------------------------------|
| `disable_frameworks_detection`         | `true`       | User-Agentのためのフレームワーク検出を無効にします       |
| `jdbc_ignore_unsupported_values`       | `false`      | `SQLFeatureNotSupportedException`を抑制します             |
| `clickhouse.jdbc.v1`                   | `false`      | 新しいJDBCではなく古いJDBC実装を使用します                 |
| `default_query_settings`               | `null`       | クエリ操作と共にデフォルトのクエリ設定を渡すことを許可します |

## サポートされるデータ型 {#supported-data-types}

JDBC ドライバーは、基盤となる [java client](/integrations/language-clients/java/client.md) と同じデータ形式をサポートしています。

### 日付、時刻、タイムゾーンの処理 {#handling-dates-times-and-timezones}
`java.sql.Date`、`java.sql.Time`、および `java.sql.Timestamp` はタイムゾーンの計算を複雑にする可能性がありますが、もちろんサポートされています。`java.time` (https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) パッケージの使用を検討することをお勧めします。`ZonedDateTime` と `OffsetDateTime` は、`java.sql.Timestamp`、`java.sql.Date`、および `java.sql.Time` の優れた代替品です。

## 接続の作成 {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties); // DataSource または DriverManager が主なエントリポイントです
try (Connection conn = dataSource.getConnection()) {
    ... // 接続を使って何かを行う
}
```

## 資格情報と設定の提供 {#supplying-credentials-and-settings}

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

// DataSource を使用して接続を作成
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
    ... // 接続を使って何かを行う
}

// DriverManagerを使用した別のアプローチ
try (Connection conn = DriverManager.getConnection(url, info)) {
    ... // 接続を使って何かを行う
}
```

## シンプルステートメント {#simple-statement}

```java showLineNumbers
try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

## 挿入 {#insert}

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("INSERT INTO mytable VALUES (?, ?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // タイムスタンプ
    ps.addBatch();
    ...
    ps.executeBatch(); // 手元のすべてを ClickHouse にストリーム送信
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// 接続プールはパフォーマンスの面であまり役立ちません
// 基盤となる実装には独自のプールがあります。
// 例えば: HttpURLConnection にはソケット用のプールがあります
HikariConfig poolConfig = new HikariConfig();
poolConfig.setConnectionTimeout(5000L);
poolConfig.setMaximumPoolSize(20);
poolConfig.setMaxLifetime(300_000L);
poolConfig.setDataSource(new ClickHouseDataSource(url, properties));

try (HikariDataSource ds = new HikariDataSource(poolConfig);
     Connection conn = ds.getConnection();
     Statement s = conn.createStatement();
     ResultSet rs = s.executeQuery("SELECT * FROM system.numbers LIMIT 3")) {
    while (rs.next()) {
        // 行を処理
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1)); // 同じカラムでも異なる型
    }
}
```

## その他の情報 {#more-information}
詳細については、[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-java) と [Java Client ドキュメント](/integrations/language-clients/java/client.md)をご覧ください。

## トラブルシューティング {#troubleshooting}
### ロギング {#logging}
このドライバーは [slf4j](https://www.slf4j.org/) を使用してロギングを行い、`classpath` 上で最初に見つかった実装を使用します。

### 大規模な挿入時の JDBC タイムアウトの解決 {#resolving-jdbc-timeout-on-large-inserts}

長い実行時間の大規模なデータ挿入を行うと、次のようなJDBCタイムアウトエラーが発生する場合があります：

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
これらのエラーは、データ挿入プロセスを中断させ、システムの安定性に影響を与える可能性があります。この問題を解決するには、クライアントのOS内のいくつかのタイムアウト設定を調整する必要があります。

#### Mac OS {#mac-os}

Mac OSでは、次の設定を調整して問題を解決することができます：

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

Linuxでは、同等の設定だけでは問題を解決できないことがあります。Linuxがソケットのキープアライブ設定を扱う方法の違いにより、追加の手順が必要です。次の手順に従ってください：

1. `/etc/sysctl.conf` または関連する設定ファイルで、以下のLinuxカーネルパラメータを調整します：

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (この値をデフォルトの300秒から低くすることを検討するかもしれません)

2. カーネルパラメータを変更した後、次のコマンドを実行して変更を適用します：

```shell
sudo sysctl -p
```

設定を行った後、クライアントがソケットのKeep Aliveオプションを有効にすることを確認する必要があります：

```java
properties.setProperty("socket_keepalive", "true");
```
