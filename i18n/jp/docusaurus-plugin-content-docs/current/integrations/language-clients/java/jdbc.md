---
sidebar_label: 'JDBC 0.8+'
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: 'ClickHouse JDBC ドライバー'
slug: /integrations/language-clients/java/jdbc
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';



# JDBC Driver (0.8+)

`clickhouse-jdbc` は最新の [java client](/integrations/language-clients/java/client.md) を使用して標準的なJDBCインターフェースを実装しています。
パフォーマンスや直接アクセスが重要な場合は、最新の [java client](/integrations/language-clients/java/client.md) を直接使用することをお勧めします。

:::note
以前のバージョンのJDBCドライバーのドキュメントをお探しの場合は、[こちら](/integrations/language-clients/java/jdbc-v1.md)をご覧ください。
:::

## Changes from 0.7.x {#changes-from-07x}
0.8では、ドライバーをJDBC仕様により厳密に従うようにしました。そのため、いくつかの機能が削除されており、あなたに影響を及ぼす可能性があります：

| 古い機能                       | 注釈                                                                                                                                                                                                                                                                                                           |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| トランザクションサポート      | 初期バージョンのドライバーはトランザクションサポートを **シミュレート** していただけで、予期しない結果を引き起こす可能性がありました。                                                                                                                                                                       |
| レスポンスカラムのリネーム    | `ResultSet` は可変でした - 効率のために現在は読み取り専用です。                                                                                                                                                                                                                                             |
| マルチステートメントSQL       | マルチステートメントサポートは **シミュレート** されていただけで、現在は1:1に厳密に従います。                                                                                                                                                                                                                  |
| 名前付きパラメータ            | JDBC仕様の一部ではありません。                                                                                                                                                                                                                                                                               |
| ストリームベースの `PreparedStatement` | 初期バージョンのドライバーでは `PreparedStatement` の非jdbc使用が許可されていました - このようなオプションが必要な場合は、[Java Client](/integrations/language-clients/java/client.md) とその [例](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) を確認することをお勧めします。 |

:::note
`Date` はタイムゾーンなしで保存され、`DateTime` はタイムゾーン付きで保存されます。注意しないと予期しない結果を引き起こす可能性があります。
:::

## 環境要件 {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) バージョン >= 8

### セットアップ {#setup}

<Tabs groupId="jdbc-base-dependencies">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.8.2</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all'
```

</TabItem>
</Tabs>

## 設定 {#configuration}

**ドライバークラス**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL構文**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`、例えば:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**接続プロパティ**:

標準JDBCプロパティの他に、ドライバーは基盤の [java client](/integrations/language-clients/java/client.md) が提供するClickHouse特有のプロパティもサポートします。サポートされていない機能がある場合、可能な限り `SQLFeatureNotSupportedException` が返されます。他のカスタムプロパティには以下が含まれます：

| プロパティ                        | デフォルト | 説明                                                            |
|----------------------------------|---------|-----------------------------------------------------------------|
| `disable_frameworks_detection`   | `true`  | User-Agentのフレームワーク検出を無効にする                     |
| `jdbc_ignore_unsupported_values` | `false` | `SQLFeatureNotSupportedException` を抑制                      |
| `clickhouse.jdbc.v1`             | `false` | 新しいJDBCの代わりに古いJDBC実装を使用する                    |
| `default_query_settings`         | `null`  | クエリ操作にデフォルトのクエリ設定を渡すことを可能にする      |

## サポートされているデータ型 {#supported-data-types}

JDBCドライバーは、基盤の [java client](/integrations/language-clients/java/client.md) と同じデータ形式をサポートしています。

### 日付、時間、タイムゾーンの取り扱い {#handling-dates-times-and-timezones}
`java.sql.Date`、`java.sql.Time`、および `java.sql.Timestamp` は、タイムゾーンの計算を複雑にする可能性があります - これらはもちろんサポートされていますが、[java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) パッケージの使用を検討することをお勧めします。`ZonedDateTime` と `OffsetDateTime` は、java.sql.Timestamp、java.sql.Date、および java.sql.Timeの素晴らしい代替品です。

## 接続の作成 {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties); // DataSource または DriverManager が主なエントリーポイント
try (Connection conn = dataSource.getConnection()) {
    ... // 接続で何かをする
```

## 資格情報と設定の提供 {#supplying-credentials-and-settings}

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

// DataSourceを用いて接続を作成
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
    ... // 接続で何かをする
}

// DriverManagerを使用した代替アプローチ
try (Connection conn = DriverManager.getConnection(url, info)) {
    ... // 接続で何かをする
}
```

## シンプルステートメント {#simple-statement}

```java showLineNumbers

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while (rs.next()) {
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
    ps.executeBatch(); // ClickHouseにすべてをストリーム
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// コネクションプーリングは性能面であまり役に立たないでしょう、
// なぜなら基盤の実装が独自のプールを持っているからです。
// 例えば: HttpURLConnection はソケット用のプールがあります
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
        // 行を処理する
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1)); // 同じカラムですが異なる型
    }
}
```

## その他の情報 {#more-information}
詳細については、[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-java) と [Java Client ドキュメント](/integrations/language-clients/java/client.md) をご覧ください。

## トラブルシューティング {#troubleshooting}
### ロギング {#logging}
ドライバーは [slf4j](https://www.slf4j.org/) を使用してロギングを行い、`classpath` 上の最初の利用可能な実装を使用します。

### 大規模な挿入時のJDBCタイムアウトの解決 {#resolving-jdbc-timeout-on-large-inserts}

長時間実行される大規模な挿入をClickHouseで行う場合、次のようなJDBCタイムアウトエラーに遭遇することがあります：

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
これらのエラーはデータ挿入プロセスを中断させ、システムの安定性に影響を与える可能性があります。この問題を解決するには、クライアントのOSでいくつかのタイムアウト設定を調整する必要があります。

#### Mac OS {#mac-os}

Mac OSでは、次の設定を調整して問題を解決できます。

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

Linuxでは、同等の設定だけでは問題が解決しない場合があります。Linuxがソケットのキープアライブ設定を処理する方法の違いにより、追加の手順が必要です。次の手順に従ってください。

1. `/etc/sysctl.conf` または関連する設定ファイルで次のLinuxカーネルパラメータを調整します：

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (デフォルトの300秒からこの値を下げることを検討します)

2. カーネルパラメータを変更した後、次のコマンドを実行して変更を適用します：

```shell
sudo sysctl -p
```

これらの設定を行った後、クライアントがソケットのキープアライブオプションを有効にすることを確認する必要があります：

```java
properties.setProperty("socket_keepalive", "true");
```
