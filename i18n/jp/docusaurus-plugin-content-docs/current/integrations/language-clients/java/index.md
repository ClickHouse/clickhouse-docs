---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'ClickHouseへのJavaからの接続オプション'
slug: /integrations/java
---
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java クライアントの概要

- [クライアント 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC ドライバー](./r2dbc.md)

## ClickHouse クライアント {#clickhouse-client}

Java クライアントは、ClickHouse サーバとのネットワーク通信の詳細を抽象化する独自の API を実装したライブラリです。現在、HTTP インターフェースのみがサポートされています。このライブラリは、さまざまな ClickHouse 形式やその他の関連機能を操作するためのユーティリティを提供します。

Java クライアントは、2015年に開発されました。そのコードベースは非常に保守が難しくなり、API は混乱しており、更なる最適化が困難です。そこで、2024年には新しいコンポーネント `client-v2` にリファクタリングしました。これは明確な API を持ち、コードベースが軽量で、パフォーマンスの改善がなされ、ClickHouse 形式のサポートも強化されています (主に RowBinary と Native)。JDBC は近い将来このクライアントを使用します。

### サポートされているデータ型 {#supported-data-types}

|**データ型**           |**クライアント V2 サポート**|**クライアント V1 サポート**|
|-----------------------|-----------------------------|-----------------------------|
|Int8                   |✔                            |✔                            |
|Int16                  |✔                            |✔                            |
|Int32                  |✔                            |✔                            |
|Int64                  |✔                            |✔                            |
|Int128                 |✔                            |✔                            |
|Int256                 |✔                            |✔                            |
|UInt8                  |✔                            |✔                            |
|UInt16                 |✔                            |✔                            |
|UInt32                 |✔                            |✔                            |
|UInt64                 |✔                            |✔                            |
|UInt128                |✔                            |✔                            |
|UInt256                |✔                            |✔                            |
|Float32                |✔                            |✔                            |
|Float64                |✔                            |✔                            |
|Decimal                |✔                            |✔                            |
|Decimal32              |✔                            |✔                            |
|Decimal64              |✔                            |✔                            |
|Decimal128             |✔                            |✔                            |
|Decimal256             |✔                            |✔                            |
|Bool                   |✔                            |✔                            |
|String                 |✔                            |✔                            |
|FixedString            |✔                            |✔                            |
|Nullable               |✔                            |✔                            |
|Date                   |✔                            |✔                            |
|Date32                 |✔                            |✔                            |
|DateTime               |✔                            |✔                            |
|DateTime32             |✔                            |✔                            |
|DateTime64             |✔                            |✔                            |
|Interval               |✗                            |✗                            |
|Enum                   |✔                            |✔                            |
|Enum8                  |✔                            |✔                            |
|Enum16                 |✔                            |✔                            |
|Array                  |✔                            |✔                            |
|Map                    |✔                            |✔                            |
|Nested                 |✔                            |✔                            |
|Tuple                  |✔                            |✔                            |
|UUID                   |✔                            |✔                            |
|IPv4                   |✔                            |✔                            |
|IPv6                   |✔                            |✔                            |
|Object                 |✗                            |✔                            |
|Point                  |✔                            |✔                            |
|Nothing                |✔                            |✔                            |
|MultiPolygon           |✔                            |✔                            |
|Ring                   |✔                            |✔                            |
|Polygon                |✔                            |✔                            |
|SimpleAggregateFunction|✔                            |✔                            |
|AggregateFunction      |✗                            |✔                            |

[ClickHouse データ型](/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: `SELECT * FROM table ...` をサポートしていません
- Decimal - 一貫性のために 21.9+ で `SET output_format_decimal_trailing_zeros=1` 
- Enum - 文字列および整数の両方として扱うことができます
- UInt64 - client-v1 では `long` にマッピングされています 
:::

### 特徴 {#features}

クライアントの特徴の表:

| 名前                                         | クライアント V2 | クライアント V1 | コメント
|----------------------------------------------|:---------------:|:---------------:|:---------:|
| HTTP 接続                                   |✔               |✔               | |
| HTTP 圧縮 (LZ4)                              |✔               |✔               | |
| サーバー応答圧縮 - LZ4                        |✔               |✔               | | 
| クライアントリクエスト圧縮 - LZ4             |✔               |✔               | |
| HTTPS                                        |✔               |✔               | |
| クライアント SSL 証明書 (mTLS)               |✔               |✔               | |
| HTTP プロキシ                                |✔               |✔               | |
| POJO SerDe                                   |✔               |✗               | |
| コネクションプール                           |✔               |✔               | Apache HTTP Client 使用時 |
| 名前付きパラメータ                          |✔               |✔               | |
| 失敗時の再試行                               |✔               |✔               | |
| フェイルオーバー                             |✗               |✔               | |
| 負荷分散                                     |✗               |✔               | |
| サーバーの自動検出                           |✗               |✔               | |
| ログコメント                                  |✔               |✔               | |
| セッションロール                              |✔               |✔               | |
| SSL クライアント認証                        |✔               |✔               | |
| セッションタイムゾーン                       |✔               |✔               | |


JDBC ドライバーは、基盤となるクライアント実装と同じ特徴を継承します。その他の JDBC 特徴については [ページ](/integrations/language-clients/java/jdbc) を参照してください。

### 互換性 {#compatibility}

- このリポジトリ内のすべてのプロジェクトは、すべての [アクティブ LTS バージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) の ClickHouse でテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新しい改善を見逃さないために、クライアントを継続的にアップグレードすることをお勧めします
- v2 API への移行に問題がある場合は、[問題を作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)していただければ、対応いたします！

### ロギング {#logging}

私たちの Java 言語クライアントは、[SLF4J](https://www.slf4j.org/) をロギングに使用しています。`Logback` や `Log4j` など、SLF4J 互換のロギングフレームワークを使用できます。
たとえば、Maven を使用している場合は、`pom.xml` ファイルに以下の依存関係を追加できます：

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

これは、使用しているロギングフレームワークに依存します。たとえば、`Logback` を使用している場合、`logback.xml` というファイルでロギングを設定できます：

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
