---
title: 'Java'
sidebar_position: 1
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Java から ClickHouse へ接続する方法'
slug: /integrations/java
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java クライアントの概要 \{#java-clients-overview\}

- [クライアント 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC ドライバー](./r2dbc.md)

## ClickHouse client \{#clickhouse-client\}

Java client は、ClickHouse サーバーとのネットワーク通信の詳細を抽象化する独自の API を実装したライブラリです。現在は HTTP Interface のみがサポートされています。このライブラリは、さまざまな ClickHouse フォーマットやその他の関連機能を扱うためのユーティリティを提供します。

Java client は 2015 年に開発が開始されましたが、コードベースは保守が非常に困難になり、API も分かりづらく、さらなる最適化も難しくなっていました。そのため、2024 年にこれをリファクタリングし、新しいコンポーネント `client-v2` にしました。`client-v2` は明確な API、より軽量なコードベース、さらなるパフォーマンス改善に加え、ClickHouse フォーマットのサポートも向上しています（主に RowBinary と Native）。JDBC は近い将来このクライアントを使用する予定です。

### サポートされているデータ型 \{#supported-data-types\}

|**データ型**           |**Client V2 のサポート**|**Client V1 のサポート**|
|-----------------------|------------------------|------------------------|
|Int8                   |✔                       |✔                       |
|Int16                  |✔                       |✔                       |
|Int32                  |✔                       |✔                       |
|Int64                  |✔                       |✔                       |
|Int128                 |✔                       |✔                       |
|Int256                 |✔                       |✔                       |
|UInt8                  |✔                       |✔                       |
|UInt16                 |✔                       |✔                       |
|UInt32                 |✔                       |✔                       |
|UInt64                 |✔                       |✔                       |
|UInt128                |✔                       |✔                       |
|UInt256                |✔                       |✔                       |
|Float32                |✔                       |✔                       |
|Float64                |✔                       |✔                       |
|Decimal                |✔                       |✔                       |
|Decimal32              |✔                       |✔                       |
|Decimal64              |✔                       |✔                       |
|Decimal128             |✔                       |✔                       |
|Decimal256             |✔                       |✔                       |
|Bool                   |✔                       |✔                       |
|String                 |✔                       |✔                       |
|FixedString            |✔                       |✔                       |
|Nullable               |✔                       |✔                       |
|Date                   |✔                       |✔                       |
|Date32                 |✔                       |✔                       |
|DateTime               |✔                       |✔                       |
|DateTime32             |✔                       |✔                       |
|DateTime64             |✔                       |✔                       |
|Interval               |✗                       |✗                       |
|Enum                   |✔                       |✔                       |
|Enum8                  |✔                       |✔                       |
|Enum16                 |✔                       |✔                       |
|Array                  |✔                       |✔                       |
|Map                    |✔                       |✔                       |
|Nested                 |✔                       |✔                       |
|Tuple                  |✔                       |✔                       |
|UUID                   |✔                       |✔                       |
|IPv4                   |✔                       |✔                       |
|IPv6                   |✔                       |✔                       |
|Object                 |✗                       |✔                       |
|Point                  |✔                       |✔                       |
|Nothing                |✔                       |✔                       |
|MultiPolygon           |✔                       |✔                       |
|Ring                   |✔                       |✔                       |
|Polygon                |✔                       |✔                       |
|SimpleAggregateFunction|✔                       |✔                       |
|AggregateFunction      |✗                       |✔                       |
|Variant                |✔                       |✗                       |
|Dynamic                |✔                       |✗                       |
|JSON                   |✔                       |✗                       |

[ClickHouse のデータ型](/sql-reference/data-types)

:::note

- AggregatedFunction - :warning: `SELECT * FROM table ...` をサポートしません
- Decimal - 一貫性を保つため、21.9 以降では `SET output_format_decimal_trailing_zeros=1` を設定してください
- Enum - 文字列型と整数型の両方として扱うことができます
- UInt64 - client-v1 では `long` にマッピングされます
:::

### 機能 \{#features\}

クライアントの機能一覧表:

| Name                                         | Client V2 | Client V1 | Comments
|----------------------------------------------|:---------:|:---------:|:---------:|
| Http Connection                              |✔       |✔      | |
| Http Compression (LZ4)                       |✔       |✔      | |
| Application Controlled Compression           |✔       |✗      | |
| Server Response Compression - LZ4            |✔       |✔      | |
| Client Request Compression - LZ4             |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| Client SSL Cert (mTLS)                       |✔       |✔      | |
| Http Proxy                                   |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| Connection Pool                              |✔       |✔      | Apache HTTP Client 使用時 |
| Named Parameters                             |✔       |✔      | |
| Retry on failure                             |✔       |✔      | |
| Failover                                     |✗       |✔      | |
| Load-balancing                               |✗       |✔      | |
| Server auto-discovery                        |✗       |✔      | |
| Log Comment                                  |✔       |✔      | |
| Session Roles                                |✔       |✔      | |
| SSL Client Authentication                    |✔       |✔      | |
| SNI Configuration                            |✔       |✗      | |
| Session timezone                             |✔       |✔      | |

JDBC ドライバーは、基盤となるクライアント実装と同じ機能を継承します。その他の JDBC 機能は、その[ページ](/integrations/language-clients/java/jdbc)に一覧があります。

### 互換性 \{#compatibility\}

- このリポジトリ内のすべてのプロジェクトは、ClickHouse のすべての[アクティブな LTS バージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)でテストされています。
- [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- セキュリティ修正や新機能・改善を見逃さないよう、クライアントは継続的にアップグレードすることをお勧めします。
- v2 API への移行で問題が発生した場合は、[Issue を作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)してください。こちらで対応します。

### ロギング \{#logging\}

この Java クライアントはロギングに [SLF4J](https://www.slf4j.org/) を使用します。`Logback` や `Log4j` など、任意の SLF4J 互換ロギングフレームワークを利用できます。
たとえば Maven を使用している場合は、`pom.xml` ファイルに次の依存関係を追加できます。

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


#### ログの設定 \{#configuring-logging\}

これは、使用しているログフレームワークによって異なります。例えば、`Logback` を使用している場合は、`logback.xml` というファイルでログを設定できます。

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
