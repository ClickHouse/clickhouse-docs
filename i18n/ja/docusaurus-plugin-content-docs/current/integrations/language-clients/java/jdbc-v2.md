---
sidebar_label: JDBC 0.8+
sidebar_position: 4
keywords: [clickhouse, java, jdbc, ドライバー, 統合]
description: ClickHouse JDBC ドライバー
slug: /integrations/java/jdbc-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# JDBC ドライバー

`clickhouse-jdbc` は最新の [java client](/integrations/language-clients/java/client-v2.md) を使用して、標準 JDBC インターフェースを実装します。
パフォーマンスや直接アクセスが重要な場合は、最新の [java client](/integrations/language-clients/java/client-v2.md) を直接使用することをお勧めします。

:::note
以前のバージョンの JDBC ドライバーのドキュメントを探している場合は、[こちら](/integrations/language-clients/java/jdbc-v1.md)をご覧ください。
:::

## 0.7.x からの変更点 {#changes-from-07x}
0.8 では、ドライバーが JDBC 仕様に対してより厳密に準拠するように試みたため、影響を与える可能性のあるいくつかの機能が削除されています：

| 古い機能                        | 注意事項                                                                                                                                                                                                                                                                                                      |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| トランザクションサポート        | 早期のバージョンのドライバーはトランザクションサポートを**シミュレート**していましたが、予期しない結果を引き起こす可能性がありました。                                                                                                                                                              |
| レスポンスカラムのリネーミング  | `ResultSet` は可変でした - 効率のために現在は読み取り専用です。                                                                                                                                                                                                                                                |
| マルチステートメント SQL       | マルチステートメントのサポートはのみ**シミュレート**されていましたが、現在は厳密に 1:1 に準拠しています。                                                                                                                                                                                                         |
| 名前付きパラメータ              | JDBC 仕様の一部ではありません。                                                                                                                                                                                                                                                                                 |
| ストリームベースの `PreparedStatement` | ドライバーの早期バージョンでは、非 JDBC 使用の `PreparedStatement` を許可していました - そのようなオプションが必要な場合は、[Java Client](/integrations/language-clients/java/client-v2.md) とその [例](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) を確認することをお勧めします。 |

:::note
`Date` はタイムゾーンなしで保存され、`DateTime` はタイムゾーン付きで保存されます。このため、注意しないと予期しない結果が生じる可能性があります。
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
    <version>0.8.0</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all'
```

</TabItem>
</Tabs>

## 設定 {#configuration}

**ドライバークラス**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL 構文**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]` 例えば:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**接続プロパティ**:

標準 JDBC プロパティに加えて、ドライバーは基盤となる [java client](/integrations/language-clients/java/client-v2.md) によって提供される ClickHouse 特有のプロパティもサポートしています。
サポートされていない機能の場合、可能な限りメソッドは `SQLFeatureNotSupportedException` を返します。他のカスタムプロパティは次の通りです：

| プロパティ                       | デフォルト | 説明                                                     |
|----------------------------------|------------|----------------------------------------------------------|
| `disable_frameworks_detection`   | `true`     | User-Agent に対するフレームワーク検出を無効にする      |
| `jdbc_ignore_unsupported_values` | `false`    | `SQLFeatureNotSupportedException` を抑制する            |
| `clickhouse.jdbc.v1`            | `false`    | 新しい JDBC の代わりに古い JDBC 実装を使用する          |
| `default_query_settings`         | `null`     | クエリ操作にデフォルトのクエリ設定を渡すことを許可する |

## サポートされているデータ型 {#supported-data-types}

JDBC ドライバーは、基盤となる [java client](/integrations/language-clients/java/client-v2.md) と同じデータフォーマットをサポートしています。

### 日付、時刻、タイムゾーンの取り扱い {#handling-dates-times-and-timezones}
`java.sql.Date`、`java.sql.Time`、および `java.sql.Timestamp` は、タイムゾーンの計算を複雑にすることがあります - もちろんサポートされていますが、[java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) パッケージを使用することを検討してもよいでしょう。`ZonedDateTime` および `OffsetDateTime` は、java.sql.Timestamp、java.sql.Date、および java.sql.Time の優れた代替品です。

## 接続の作成 {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties); // DataSource または DriverManager がメインエントリポイントです
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

// DataSource を使用して接続を作成
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
... // 接続で何かをする
}

// 代替アプローチとして DriverManager を使用
try (Connection conn = DriverManager.getConnection(url, info)) {
... // 接続で何かをする
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
    ps.executeBatch(); // 手元にあるすべてを ClickHouse にストリームします
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// コネクションプーリングはパフォーマンスの観点ではあまり役に立ちません、
// なぜなら基盤となる実装には独自のプールがあるからです。
// たとえば: HttpURLConnection はソケット用のプールを持っています
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
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1)); // 同じカラムですが異なる型
    }
}
```

## 詳細情報 {#more-information}
詳細については、[GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-java) と [Java Client ドキュメンテーション](/integrations/language-clients/java/client-v2.md)を参照してください。

## トラブルシューティング {#troubleshooting}
### ロギング {#logging}
ドライバーは [slf4j](https://www.slf4j.org/) を使用してロギングを行い、`classpath` 上の最初に利用可能な実装を使用します。

### 大量挿入時の JDBC タイムアウトの解決 {#resolving-jdbc-timeout-on-large-inserts}

ClickHouse で長時間実行される大量挿入を行うと、次のような JDBC タイムアウトエラーが発生することがあります：

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
これらのエラーは、データ挿入プロセスを中断し、システムの安定性に影響を与える可能性があります。この問題に対処するには、クライアントの OS でいくつかのタイムアウト設定を調整する必要があります。

#### Mac OS {#mac-os}

Mac OS では、次の設定を調整して問題を解決できます：

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

Linux では、同等の設定だけでは問題を解決できない場合があります。Linux がソケットの keep-alive 設定を処理する方法の違いから、追加の手順が必要です。次の手順に従ってください：

1. `/etc/sysctl.conf` または関連する設定ファイルで、次の Linux カーネルパラメータを調整します：

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (デフォルトの300秒からこの値を下げることを検討してもよいでしょう)

2. カーネルパラメータを変更した後、次のコマンドを実行して変更を適用します：

```shell
sudo sysctl -p
```

これらの設定を行った後、クライアントがソケットの Keep Alive オプションを有効にすることを確認する必要があります：

```java
properties.setProperty("socket_keepalive", "true");
```
