---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'クライアント', '連携', 'r2dbc']
description: 'Java から ClickHouse へ接続するためのオプション'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java クライアントの概要

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC ドライバ](./r2dbc.md)



## ClickHouse client {#clickhouse-client}

Javaクライアントは、ClickHouseサーバーとのネットワーク通信の詳細を抽象化する独自のAPIを実装したライブラリです。現在はHTTPインターフェースのみがサポートされています。このライブラリは、さまざまなClickHouseフォーマットを扱うためのユーティリティやその他の関連機能を提供します。

Javaクライアントは2015年に開発されました。そのコードベースは保守が非常に困難になり、APIが分かりにくく、さらなる最適化も難しい状態でした。そのため、2024年に新しいコンポーネント`client-v2`としてリファクタリングを行いました。明確なAPI、軽量なコードベース、パフォーマンスの向上、より優れたClickHouseフォーマットのサポート(主にRowBinaryとNative)を備えています。JDBCは近い将来このクライアントを使用する予定です。

### サポートされるデータ型 {#supported-data-types}

| **データ型**           | **Client V2サポート** | **Client V1サポート** |
| ----------------------- | --------------------- | --------------------- |
| Int8                    | ✔                    | ✔                    |
| Int16                   | ✔                    | ✔                    |
| Int32                   | ✔                    | ✔                    |
| Int64                   | ✔                    | ✔                    |
| Int128                  | ✔                    | ✔                    |
| Int256                  | ✔                    | ✔                    |
| UInt8                   | ✔                    | ✔                    |
| UInt16                  | ✔                    | ✔                    |
| UInt32                  | ✔                    | ✔                    |
| UInt64                  | ✔                    | ✔                    |
| UInt128                 | ✔                    | ✔                    |
| UInt256                 | ✔                    | ✔                    |
| Float32                 | ✔                    | ✔                    |
| Float64                 | ✔                    | ✔                    |
| Decimal                 | ✔                    | ✔                    |
| Decimal32               | ✔                    | ✔                    |
| Decimal64               | ✔                    | ✔                    |
| Decimal128              | ✔                    | ✔                    |
| Decimal256              | ✔                    | ✔                    |
| Bool                    | ✔                    | ✔                    |
| String                  | ✔                    | ✔                    |
| FixedString             | ✔                    | ✔                    |
| Nullable                | ✔                    | ✔                    |
| Date                    | ✔                    | ✔                    |
| Date32                  | ✔                    | ✔                    |
| DateTime                | ✔                    | ✔                    |
| DateTime32              | ✔                    | ✔                    |
| DateTime64              | ✔                    | ✔                    |
| Interval                | ✗                     | ✗                     |
| Enum                    | ✔                    | ✔                    |
| Enum8                   | ✔                    | ✔                    |
| Enum16                  | ✔                    | ✔                    |
| Array                   | ✔                    | ✔                    |
| Map                     | ✔                    | ✔                    |
| Nested                  | ✔                    | ✔                    |
| Tuple                   | ✔                    | ✔                    |
| UUID                    | ✔                    | ✔                    |
| IPv4                    | ✔                    | ✔                    |
| IPv6                    | ✔                    | ✔                    |
| Object                  | ✗                     | ✔                    |
| Point                   | ✔                    | ✔                    |
| Nothing                 | ✔                    | ✔                    |
| MultiPolygon            | ✔                    | ✔                    |
| Ring                    | ✔                    | ✔                    |
| Polygon                 | ✔                    | ✔                    |
| SimpleAggregateFunction | ✔                    | ✔                    |
| AggregateFunction       | ✗                     | ✔                    |
| Variant                 | ✔                    | ✗                     |
| Dynamic                 | ✔                    | ✗                     |
| JSON                    | ✔                    | ✗                     |

[ClickHouseデータ型](/sql-reference/data-types)

:::note

- AggregatedFunction - :warning: `SELECT * FROM table ...`はサポートされていません
- Decimal - 一貫性を保つため、21.9以降では`SET output_format_decimal_trailing_zeros=1`を使用してください
- Enum - 文字列と整数の両方として扱うことができます
- UInt64 - client-v1では`long`にマッピングされます
  :::

### 機能 {#features}

クライアントの機能一覧:


| 名前                              | Client V2 | Client V1 |           コメント           |
| --------------------------------- | :-------: | :-------: | :--------------------------: |
| HTTP接続                          |    ✔     |    ✔     |                              |
| HTTP圧縮 (LZ4)                    |    ✔     |    ✔     |                              |
| サーバーレスポンス圧縮 - LZ4      |    ✔     |    ✔     |                              |
| クライアントリクエスト圧縮 - LZ4  |    ✔     |    ✔     |                              |
| HTTPS                             |    ✔     |    ✔     |                              |
| クライアントSSL証明書 (mTLS)      |    ✔     |    ✔     |                              |
| HTTPプロキシ                      |    ✔     |    ✔     |                              |
| POJO SerDe                        |    ✔     |     ✗     |                              |
| コネクションプール                |    ✔     |    ✔     | Apache HTTP Client使用時 |
| 名前付きパラメータ                |    ✔     |    ✔     |                              |
| 失敗時の再試行                    |    ✔     |    ✔     |                              |
| フェイルオーバー                  |     ✗     |    ✔     |                              |
| 負荷分散                          |     ✗     |    ✔     |                              |
| サーバー自動検出                  |     ✗     |    ✔     |                              |
| ログコメント                      |    ✔     |    ✔     |                              |
| セッションロール                  |    ✔     |    ✔     |                              |
| SSLクライアント認証               |    ✔     |    ✔     |                              |
| セッションタイムゾーン            |    ✔     |    ✔     |                              |

JDBCドライバは、基盤となるクライアント実装と同じ機能を継承します。その他のJDBC機能については、[ページ](/integrations/language-clients/java/jdbc)に記載されています。

### 互換性 {#compatibility}

- このリポジトリ内のすべてのプロジェクトは、ClickHouseのすべての[アクティブなLTSバージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)でテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新しい改善を見逃さないよう、クライアントを継続的にアップグレードすることを推奨します
- v2 APIへの移行に問題がある場合は、[issueを作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。対応いたします。

### ロギング {#logging}

Java言語クライアントは、ロギングに[SLF4J](https://www.slf4j.org/)を使用します。`Logback`や`Log4j`など、SLF4J互換のロギングフレームワークを使用できます。
例えば、Mavenを使用している場合は、`pom.xml`ファイルに以下の依存関係を追加できます。

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- 最新バージョンを使用してください -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用してください -->
    </dependency>

    <!-- Logback Classic (SLF4JとLogbackをブリッジ) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用してください -->
    </dependency>
</dependencies>
```

#### ロギングの設定 {#configuring-logging}

これは使用しているロギングフレームワークによって異なります。例えば、`Logback`を使用している場合は、`logback.xml`というファイルでロギングを設定できます。

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

```


    <!-- 特定パッケージのカスタムログレベル -->
    <logger name="com.clickhouse" level="info" />

</configuration>
```

[変更履歴](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
