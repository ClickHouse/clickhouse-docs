---
sidebar_label: JDBC 0.8+
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: ClickHouse JDBC ドライバ
slug: /integrations/language-clients/java/jdbc
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# JDBC ドライバ (0.8+)

`clickhouse-jdbc` は最新の [java client](/integrations/language-clients/java/client.md) を使用して標準の JDBC インターフェースを実装しています。
パフォーマンスまたは直接アクセスが重要な場合は、最新の [java client](/integrations/language-clients/java/client.md) を直接使用することをお勧めします。

:::note
過去のバージョンの JDBC ドライバのドキュメントをお探しの場合は、[こちら](/integrations/language-clients/java/jdbc-v1.md) をご覧ください。
:::
## 0.7.x からの変更点 {#changes-from-07x}
0.8 ではドライバが JDBC 仕様により厳密に従うようにしたため、いくつかの機能が削除されており、これが影響する可能性があります：

| 古い機能                      | 注記                                                                                                                                                                                                                                                                                                           |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| トランザクションサポート           | ドライバの初期バージョンはトランザクションサポートを**シミュレート**しただけであり、予想外の結果をもたらす可能性がありました。                                                                                                                                                                                           |
| レスポンスカラムのリネーミング     | `ResultSet` は変更可能でしたが、効率を考慮して現在は読み取り専用です。                                                                                                                                                                                                                                                |
| マルチステートメント SQL         | マルチステートメントサポートは単に**シミュレート**されていたもので、現在は厳密に 1:1 に従います。                                                                                                                                                                                                                           |
| 名前付きパラメータ               | JDBC 仕様の一部ではありません。                                                                                                                                                                                                                                                                                       |
| ストリームベースの `PreparedStatement` | ドライバの初期バージョンでは非 JDBC 使用のための `PreparedStatement` が許可されていました - このようなオプションが必要な場合は、[Java Client](/integrations/language-clients/java/client.md) とその [例](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) をご確認ください。 |

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

**ドライバクラス**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL 形式**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]` 例えば:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**接続プロパティ**:

標準の JDBC プロパティに加え、ドライバは基盤となる [java client](/integrations/language-clients/java/client.md) が提供する ClickHouse 専用プロパティをサポートしています。
機能がサポートされていない場合は、可能な限りメソッドが `SQLFeatureNotSupportedException` を返します。他のカスタムプロパティは以下の通りです：

| プロパティ                             | デフォルト | 説明                                                      |
|--------------------------------------|---------|---------------------------------------------------------|
| `disable_frameworks_detection`       | `true`  | User-Agent のためのフレームワーク検出を無効にします。                    |
| `jdbc_ignore_unsupported_values`     | `false` | `SQLFeatureNotSupportedException` を抑制します。                     |
| `clickhouse.jdbc.v1`                 | `false` | 新しい JDBC の代わりに古い JDBC 実装を使用します。                      |
| `default_query_settings`              | `null`  | クエリ操作にデフォルトのクエリ設定を渡すことを許可します。  |
## サポートされているデータ型 {#supported-data-types}

JDBC ドライバは基盤となる [java client](/integrations/language-clients/java/client.md) と同じデータ形式をサポートしています。
### 日付、時間、タイムゾーンの取り扱い {#handling-dates-times-and-timezones}
`java.sql.Date`、`java.sql.Time`、および `java.sql.Timestamp` はタイムゾーンの計算を複雑にする可能性があります - 当然サポートされていますが、
[ java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) パッケージの使用を検討するかもしれません。 `ZonedDateTime` および
`OffsetDateTime` はそれぞれ `java.sql.Timestamp`、`java.sql.Date`、および `java.sql.Time` の優れた代替品です。
## 接続の作成 {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties);//DataSource または DriverManager が主なエントリポイントです
try (Connection conn = dataSource.getConnection()) {
... // 接続で何かを行います
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
... // 接続で何かを行います
}

// DriverManager を使用した別のアプローチ
try (Connection conn = DriverManager.getConnection(url, info)) {
... // 接続で何かを行います
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
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch();
    ...
    ps.executeBatch(); // 手元の全データを ClickHouse にストリームします
}
```
## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// 接続プーリングはパフォーマンスの観点ではあまり役立ちません、
// なぜなら基盤となる実装には独自のプールがあるからです。
// 例えば: HttpURLConnection にはソケットのプールがあります
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
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1));//同じカラムだが異なるタイプ
    }
}
```
## 追加情報 {#more-information}
さらなる詳細については、[GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-java) と [Java Client ドキュメント](/integrations/language-clients/java/client.md) を参照してください。
## トラブルシューティング {#troubleshooting}
### ロギング {#logging}
ドライバは [slf4j](https://www.slf4j.org/) をロギングに使用しており、クラスパスで最初に利用可能な実装を使用します。
### 大量挿入時の JDBC タイムアウトの解決 {#resolving-jdbc-timeout-on-large-inserts}

クリックハウスで長時間実行される大量挿入を行う際、次のような JDBC タイムアウトエラーに遭遇することがあります：

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
これらのエラーはデータ挿入プロセスを妨げ、システムの安定性に影響を与える可能性があります。この問題を解決するには、クライアントの OS でいくつかのタイムアウト設定を調整する必要があります。
#### Mac OS {#mac-os}

Mac OS では、次の設定を調整して問題を解決できます：

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1
#### Linux {#linux}

Linux では、同じ設定だけでは問題を解決できないことがあります。Linux がソケットのキープアライブ設定を処理する方法の違いにより、追加の手順が必要です。次の手順に従ってください：

1. `/etc/sysctl.conf` または関連する設定ファイルで次の Linux カーネルパラメータを調整します：

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (デフォルトの 300 秒からこの値を下げることを検討してください)

2. カーネルパラメータを変更した後、次のコマンドを実行して変更を適用します：

```shell
sudo sysctl -p
```

これらの設定を行った後、クライアントがソケットでキープアライブオプションを有効にすることを確認する必要があります：

```java
properties.setProperty("socket_keepalive", "true");
```
