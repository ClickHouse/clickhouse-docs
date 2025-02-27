---
title: Java
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: ClickHouseにJavaから接続するためのオプション
slug: /integrations/java
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Javaクライアントの概要

- [Client 0.8+](./client-v2.md)
- [JDBC 0.8+](./jdbc-v2.md)
- [R2DBCドライバ](./r2dbc.md)

## ClickHouseクライアント {#clickhouse-client}

Javaクライアントは、ClickHouseサーバーとのネットワーク通信の詳細を抽象化する独自APIを実装したライブラリです。現在、HTTPインターフェースのみがサポートされています。このライブラリは、さまざまなClickHouseフォーマットやその他の関連機能を操作するためのユーティリティを提供します。

Javaクライアントは2015年に開発されました。そのコードベースは非常に維持が難しくなり、APIは混乱を引き起こし、さらなる最適化も困難です。したがって、2024年に新しいコンポーネント`client-v2`にリファクタリングしました。それは明確なAPI、軽量なコードベース、より多くのパフォーマンス改善、およびClickHouseフォーマットのサポート（主にRowBinary & Native）が向上しています。JDBCは近い将来にこのクライアントを使用します。

### サポートされているデータ型 {#supported-data-types}

|**データ型**              |**クライアントV2サポート**|**クライアントV1サポート**|
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
- AggregatedFunction - :warning: `SELECT * FROM table ...`はサポートされていません
- Decimal - 一貫性のために21.9+で`SET output_format_decimal_trailing_zeros=1`
- Enum - 文字列と整数の両方として扱うことができます
- UInt64 - client-v1で`long`にマッピングされます
:::

### 機能 {#features}

クライアントの機能の表:

| 名前                                         | クライアントV2 | クライアントV1 | コメント
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP接続                                   |✔       |✔      | |
| HTTP圧縮（LZ4）                              |✔       |✔      | |
| サーバー応答圧縮 - LZ4                      |✔       |✔      | | 
| クライアント要求圧縮 - LZ4                   |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| クライアントSSL証明書（mTLS）                |✔       |✔      | |
| HTTPプロキシ                                 |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| コネクションプール                           |✔       |✔      | Apache HTTPクライアント使用時 |
| 名前付きパラメータ                          |✔       |✔      | |
| エラー時の再試行                           |✔       |✔      | |
| フェイルオーバー                             |✗       |✔      | |
| ロードバランシング                           |✗       |✔      | |
| サーバー自動発見                             |✗       |✔      | |
| ログコメント                                  |✔       |✔      | |
| セッション役割                                |✔       |✔      | |
| SSLクライアント認証                        |✔       |✔      | |
| セッションタイムゾーン                      |✔       |✔      | |

JDBCドライバは、基盤となるクライアント実装と同じ機能を継承します。その他のJDBC機能はその[ページ](/integrations/java/jdbc-driver#features)に記載されています。

### 互換性 {#compatibility}

- このリポジトリの全プロジェクトは、すべての[アクティブなLTSバージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)のClickHouseでテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新機能の改善を逃さないために、クライアントを継続的にアップグレードすることをお勧めします。
- v2 APIへの移行に問題がある場合は、[問題を作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。こちらから対応します！

### ロギング {#logging}

我々のJava言語クライアントは、[SLF4J](https://www.slf4j.org/)をロギングに使用しています。`Logback`や`Log4j`などのSLF4J互換のロギングフレームワークを使用することができます。
たとえば、Mavenを使用している場合は、次の依存関係を`pom.xml`ファイルに追加することができます：

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

    <!-- Logback Classic（SLF4JをLogbackにブリッジする） -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用 -->
    </dependency>
</dependencies>
```

#### ロギングの設定 {#configuring-logging}

これは、使用しているロギングフレームワークによって異なります。たとえば、`Logback`を使用している場合は、`logback.xml`というファイルでロギングを設定できます：

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

    <!-- 特定パッケージのカスタムログレベル -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[変更履歴](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
