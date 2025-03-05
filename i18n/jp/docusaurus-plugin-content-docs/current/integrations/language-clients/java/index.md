---
title: Java
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: ClickHouseへのJavaからの接続オプション
slug: /integrations/java
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Javaクライアントの概要

- [Client 0.8+](./client.md)
- [JDBC 0.8+](./jdbc.md)
- [R2DBC Driver](./r2dbc.md)

## ClickHouseクライアント {#clickhouse-client}

Javaクライアントは、ClickHouseサーバーとのネットワーク通信の詳細を抽象化する独自のAPIを実装したライブラリです。現在、HTTPインターフェースのみがサポートされています。このライブラリは、異なるClickHouseフォーマットおよびその他の関連機能を処理するためのユーティリティを提供します。

Javaクライアントは2015年に開発されました。そのコードベースはメンテナンスが非常に困難になり、APIもわかりにくく、さらに最適化することが難しくなっています。そのため、2024年に新しいコンポーネント `client-v2` にリファクタリングしました。これにより、明確なAPI、軽量なコードベース、パフォーマンスの向上、ClickHouseフォーマット（主にRowBinaryおよびNative）のサポートが強化されました。JDBCは近い将来、このクライアントを使用します。

### サポートされているデータ型 {#supported-data-types}

|**データ型**          |**Client V2 サポート**|**Client V1 サポート**|
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

[ClickHouseデータ型](/sql-reference/data-types)

:::note
- AggregateFunction - :warning: `SELECT * FROM table ...` をサポートしていません
- Decimal - 一貫性のために、21.9+では `SET output_format_decimal_trailing_zeros=1` を設定
- Enum - 文字列および整数の両方として処理できます
- UInt64 - client-v1では `long` にマッピングされます
:::

### 機能 {#features}

クライアントの機能一覧:

| 名前                                         | Client V2 | Client V1 | コメント
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP接続                                   |✔       |✔      | |
| HTTP圧縮（LZ4）                       |✔       |✔      | |
| サーバー応答圧縮 - LZ4            |✔       |✔      | | 
| クライアントリクエスト圧縮 - LZ4             |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| クライアントSSL証明書（mTLS）                       |✔       |✔      | |
| HTTPプロキシ                                   |✔       |✔      | |
| POJOシリアライズ・デシリアライズ                                   |✔       |✗      | |
| コネクションプール                              |✔       |✔      | Apache HTTP Client使用時 |
| Named Parameters                             |✔       |✔      | |
| 失敗時の再試行                             |✔       |✔      | |
| フェイルオーバー                                     |✗       |✔      | |
| 負荷分散                               |✗       |✔      | |
| サーバー自動検出                        |✗       |✔      | |
| ログコメント                                  |✔       |✔      | |
| セッションロール                                |✔       |✔      | |
| SSLクライアント認証                    |✔       |✔      | |
| セッションタイムゾーン                             |✔       |✔      | |


JDBCドライバは、基盤となるクライアントの実装と同じ機能を引き継ぎます。他のJDBC機能はその[ページ](/integrations/language-clients/java/jdbc)にリストされています。

### 互換性 {#compatibility}

- このリポジトリ内のすべてのプロジェクトは、すべての[アクティブなLTSバージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)のClickHouseでテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新しい改善を見逃さないよう、クライアントのアップグレードを継続することをお勧めします
- v2 APIへの移行について問題がある場合は、[issueを作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。お返事いたします！

### ロギング {#logging}

私たちのJava言語クライアントは、[SLF4J](https://www.slf4j.org/)をロギングに使用します。`Logback`や`Log4j`など、任意のSLF4J互換ロギングフレームワークを使用できます。
例えば、Mavenを使用している場合は、次の依存関係を`pom.xml`ファイルに追加できます。

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- 最新バージョンを使用 -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用 -->
    </dependency>

    <!-- Logback Classic (SLF4JをLogbackにブリッジ) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用 -->
    </dependency>
</dependencies>
```

#### ロギングの設定 {#configuring-logging}

これは、使用しているロギングフレームワークによって異なります。例えば、`Logback`を使用している場合、`logback.xml`というファイルでロギングを設定できます。

```xml title="logback.xml"
<configuration>
    <!-- コンソールアペンダ -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- ファイルアペンダ -->
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

    <!-- 特定のパッケージのカスタムログレベル -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[変更履歴](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
