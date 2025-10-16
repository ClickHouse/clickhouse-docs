---
'title': 'Java'
'keywords':
- 'clickhouse'
- 'java'
- 'jdbc'
- 'client'
- 'integrate'
- 'r2dbc'
'description': 'JavaからClickHouseに接続するためのオプション'
'slug': '/integrations/java'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Javaクライアントの概要

- [クライアント 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC ドライバ](./r2dbc.md)

## ClickHouseクライアント {#clickhouse-client}

Javaクライアントは、ClickHouseサーバーとのネットワーク通信の詳細を抽象化する独自のAPIを実装しているライブラリです。現在、HTTPインターフェースのみがサポートされています。このライブラリは、さまざまなClickHouse形式やその他の関連機能に対応するユーティリティを提供します。

Javaクライアントは、2015年に遡って開発されました。そのコードベースは非常に保守が難しく、APIは混乱を招き、さらなる最適化が困難です。そのため、2024年に新しいコンポーネント `client-v2` にリファクタリングしました。これには明確なAPI、軽量なコードベース、そしてより多くのパフォーマンス改善と、より良いClickHouse形式サポート（主にRowBinaryおよびNative）が含まれています。JDBCは近い将来、このクライアントを使用します。

### サポートされているデータタイプ {#supported-data-types}

|**データタイプ**         |**クライアント V2 サポート**|**クライアント V1 サポート**|
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
|Variant                |✔                    |✗                    |
|Dynamic                |✔                    |✗                    |
|JSON                   |✔                    |✗                    |

[ClickHouse データタイプ](/sql-reference/data-types)

:::note
- AggregateFunction - :warning: `SELECT * FROM table ...` はサポートされていません
- Decimal - 一貫性のために、21.9+では `SET output_format_decimal_trailing_zeros=1` を設定してください
- Enum - 文字列および整数の両方として扱うことができます
- UInt64 - client-v1 で `long` にマッピングされています
:::

### 特徴 {#features}

クライアントの機能の表：

| 名前                                       | クライアント V2 | クライアント V1 | コメント
|--------------------------------------------|:---------------:|:---------------:|:---------:|
| HTTP 接続                                   |✔               |✔               | |
| HTTP 圧縮 (LZ4)                             |✔               |✔               | |
| サーバー応答圧縮 - LZ4                      |✔               |✔               | | 
| クライアントリクエスト圧縮 - LZ4           |✔               |✔               | |
| HTTPS                                       |✔               |✔               | |
| クライアント SSL 証明書 (mTLS)              |✔               |✔               | |
| HTTP プロキシ                               |✔               |✔               | |
| POJO SerDe                                   |✔               |✗               | |
| 接続プール                                   |✔               |✔               | Apache HTTP Client 使用時 |
| 名前付きパラメータ                          |✔               |✔               | |
| 失敗時のリトライ                             |✔               |✔               | |
| フェイルオーバー                             |✗               |✔               | |
| ロードバランシング                           |✗               |✔               | |
| サーバー自動発見                            |✗               |✔               | |
| ログコメント                                 |✔               |✔               | |
| セッションロール                              |✔               |✔               | |
| SSL クライアント認証                       |✔               |✔               | |
| セッションタイムゾーン                      |✔               |✔               | |

JDBCドライバは、基盤となるクライアント実装と同じ機能を継承します。その他のJDBC機能は、その[ページ](/integrations/language-clients/java/jdbc)に一覧されています。

### 互換性 {#compatibility}

- このリポジトリ内のすべてのプロジェクトは、すべての[アクティブなLTSバージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)のClickHouseでテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新しい改善を見逃さないために、クライアントを継続的にアップグレードすることをお勧めします
- v2 APIへの移行の問題がある場合は、[イシューを作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。対応いたします！

### ロギング {#logging}

私たちのJava言語クライアントは、[SLF4J](https://www.slf4j.org/)をロギングに使用しています。 `Logback` や `Log4j` など、SLF4J互換のロギングフレームワークを使用できます。 
例えば、Mavenを使用している場合、`pom.xml`ファイルに次の依存関係を追加することができます：

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Classic (bridges SLF4J to Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>
</dependencies>
```

#### ログの設定 {#configuring-logging}

これは、使用しているロギングフレームワークによって異なります。例えば、`Logback`を使用している場合、`logback.xml`というファイルでロギングを設定できます：

```xml title="logback.xml"
<configuration>
    <!-- Console Appender -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- File Appender -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Root Logger -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- Custom Log Levels for Specific Packages -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[変更履歴](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
