---
'title': 'Java'
'keywords':
- 'clickhouse'
- 'java'
- 'jdbc'
- 'client'
- 'integrate'
- 'r2dbc'
'description': 'Options for connecting to ClickHouse from Java'
'slug': '/integrations/java'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';



# Java クライアントの概要

- [クライアント 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC ドライバ](./r2dbc.md)

## ClickHouse クライアント {#clickhouse-client}

Java クライアントは、ClickHouse サーバーとのネットワーク通信の詳細を抽象化する独自の API を実装したライブラリです。現在、HTTP インターフェースのみがサポートされています。このライブラリは、さまざまな ClickHouse フォーマットおよびその他の関連機能を操作するためのユーティリティを提供します。

Java クライアントは 2015 年に開発されました。そのコードベースは非常にメンテナンスが難しく、API は混乱を招くものであり、さらなる最適化が困難でした。そこで、私たちは 2024 年に新しいコンポーネント `client-v2` にリファクタリングしました。これにより、明確な API、より軽量なコードベース、パフォーマンスの向上、ClickHouse フォーマットのサポート（主に RowBinary と Native）が改善されました。JDBC は近い将来にこのクライアントを使用します。

### サポートされているデータ型 {#supported-data-types}

|**データ型**          |**クライアント V2 サポート**|**クライアント V1 サポート**|
|-----------------------|---------------------|---------------------|
|Int8                   |✔                    |✔                    |
|Int16                  |✔                    |✔                    |
|Int32                  |✔                    |✔                    |
|Int64                  |✔                    |✔                    |
|Int128                 |✔                    |✔                    |
|Int256                 |✔                    |✔                    |
|UInt8                  |✔                    |✔                    |
|UInt16                 |✔                    |✔                    |
|UInt32                 |✔                    |✔                    |
|UInt64                 |✔                    |✔                    |
|UInt128                |✔                    |✔                    |
|UInt256                |✔                    |✔                    |
|Float32                |✔                    |✔                    |
|Float64                |✔                    |✔                    |
|Decimal                |✔                    |✔                    |
|Decimal32              |✔                    |✔                    |
|Decimal64              |✔                    |✔                    |
|Decimal128             |✔                    |✔                    |
|Decimal256             |✔                    |✔                    |
|Bool                   |✔                    |✔                    |
|String                 |✔                    |✔                    |
|FixedString            |✔                    |✔                    |
|Nullable               |✔                    |✔                    |
|Date                   |✔                    |✔                    |
|Date32                 |✔                    |✔                    |
|DateTime               |✔                    |✔                    |
|DateTime32             |✔                    |✔                    |
|DateTime64             |✔                    |✔                    |
|Interval               |✗                    |✗                    |
|Enum                   |✔                    |✔                    |
|Enum8                  |✔                    |✔                    |
|Enum16                 |✔                    |✔                    |
|Array                  |✔                    |✔                    |
|Map                    |✔                    |✔                    |
|Nested                 |✔                    |✔                    |
|Tuple                  |✔                    |✔                    |
|UUID                   |✔                    |✔                    |
|IPv4                   |✔                    |✔                    |
|IPv6                   |✔                    |✔                    |
|Object                 |✗                    |✔                    |
|Point                  |✔                    |✔                    |
|Nothing                |✔                    |✔                    |
|MultiPolygon           |✔                    |✔                    |
|Ring                   |✔                    |✔                    |
|Polygon                |✔                    |✔                    |
|SimpleAggregateFunction|✔                    |✔                    |
|AggregateFunction      |✗                    |✔                    |

[ClickHouse データ型](/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: `SELECT * FROM table ...` はサポートされていません
- Decimal - 一貫性のために 21.9+ で `SET output_format_decimal_trailing_zeros=1` 
- Enum - 文字列および整数の両方として扱うことができます
- UInt64 - client-v1 では `long` にマッピングされています 
:::

### 機能 {#features}

クライアントの機能一覧:

| 名称                                          | クライアント V2 | クライアント V1 | コメント
|----------------------------------------------|:---------:|:---------:|:---------:|
| Http 接続                                   |✔       |✔      | |
| Http 圧縮 (LZ4)                             |✔       |✔      | |
| サーバー応答圧縮 - LZ4                      |✔       |✔      | | 
| クライアントリクエスト圧縮 - LZ4           |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| クライアント SSL 証明書 (mTLS)             |✔       |✔      | |
| Http プロキシ                               |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| 接続プール                                   |✔       |✔      | Apache HTTP Client 使用時 |
| 名前付きパラメータ                          |✔       |✔      | |
| 失敗時の再試行                             |✔       |✔      | |
| フェイルオーバー                             |✗       |✔      | |
| ロードバランシング                          |✗       |✔      | |
| サーバーの自動発見                         |✗       |✔      | |
| ログコメント                                 |✔       |✔      | |
| セッションロール                             |✔       |✔      | |
| SSL クライアント認証                        |✔       |✔      | |
| セッションタイムゾーン                      |✔       |✔      | |


JDBC ドライバは、基盤となるクライアント実装と同じ機能を継承しています。他の JDBC 機能はその [ページ](/integrations/language-clients/java/jdbc) に記載されています。

### 互換性 {#compatibility}

- このリポジトリのすべてのプロジェクトは、すべての [アクティブな LTS バージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) の ClickHouse でテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新しい改善を見逃さないために、クライアントは継続的にアップグレードすることをお勧めします。
- v2 API への移行に関する問題がある場合は、[問題を作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。私たちが対応します！

### ロギング {#logging}

私たちの Java 言語クライアントは、[SLF4J](https://www.slf4j.org/)を使用してロギングを行います。`Logback` や `Log4j` などの SLF4J に互換性のあるロギングフレームワークを使用できます。
例えば、Maven を使用している場合、以下の依存関係を `pom.xml` ファイルに追加できます。

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- 最新のバージョンを使用 -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- 最新のバージョンを使用 -->
    </dependency>

    <!-- Logback Classic (SLF4J を Logback にブリッジします) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 最新のバージョンを使用 -->
    </dependency>
</dependencies>
```

#### ロギングの設定 {#configuring-logging}

これは、使用しているロギングフレームワークによって異なります。例えば、`Logback` を使用している場合、`logback.xml` というファイルにロギングを設定できます。

```xml title="logback.xml"
<configuration>
    <!-- コンソールアペンダー -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- ファイルアペンダー -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- ルートロガー -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- 特定パッケージのカスタムログレベル -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[変更履歴](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
