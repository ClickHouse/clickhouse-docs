---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Java から ClickHouse へ接続するための方法'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java クライアントの概要

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC Driver](./r2dbc.md)



## ClickHouse クライアント {#clickhouse-client}

Java クライアントは、ClickHouse サーバーとのネットワーク通信の詳細を抽象化する独自 API を実装したライブラリです。現在サポートされているのは HTTP インターフェイスのみです。このライブラリは、さまざまな ClickHouse フォーマットやその他の関連機能を扱うためのユーティリティを提供します。

Java クライアントは 2015 年に開発されましたが、そのコードベースは保守が非常に困難になり、API も分かりづらく、これ以上の最適化も難しくなっていました。そのため、2024 年に新しいコンポーネント `client-v2` としてリファクタリングしました。`client-v2` は明確な API、より軽量なコードベースと多くのパフォーマンス改善、ClickHouse フォーマット（主に RowBinary と Native）に対するより良いサポートを備えています。JDBC は近い将来このクライアントを利用する予定です。  

### サポートされているデータ型 {#supported-data-types}

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
- AggregatedFunction - :warning: `SELECT * FROM table ...` をサポートしていません
- Decimal - 一貫性のために、21.9+ では `SET output_format_decimal_trailing_zeros=1` を設定してください
- Enum - 文字列と整数の両方として扱うことができます
- UInt64 - client-v1 では `long` にマッピングされます
:::

### 機能 {#features}

クライアントの機能一覧:



| Name                              | Client V2 | Client V1 |        Comments        |
| --------------------------------- | :-------: | :-------: | :--------------------: |
| Http Connection                   |     ✔     |     ✔     |                        |
| Http Compression (LZ4)            |     ✔     |     ✔     |                        |
| Server Response Compression - LZ4 |     ✔     |     ✔     |                        |
| Client Request Compression - LZ4  |     ✔     |     ✔     |                        |
| HTTPS                             |     ✔     |     ✔     |                        |
| Client SSL Cert (mTLS)            |     ✔     |     ✔     |                        |
| Http Proxy                        |     ✔     |     ✔     |                        |
| POJO SerDe                        |     ✔     |     ✗     |                        |
| Connection Pool                   |     ✔     |     ✔     | Apache HTTP Client 使用時 |
| Named Parameters                  |     ✔     |     ✔     |                        |
| Retry on failure                  |     ✔     |     ✔     |                        |
| Failover                          |     ✗     |     ✔     |                        |
| Load-balancing                    |     ✗     |     ✔     |                        |
| Server auto-discovery             |     ✗     |     ✔     |                        |
| Log Comment                       |     ✔     |     ✔     |                        |
| Session Roles                     |     ✔     |     ✔     |                        |
| SSL Client Authentication         |     ✔     |     ✔     |                        |
| Session timezone                  |     ✔     |     ✔     |                        |

JDBC ドライバは、基盤となるクライアント実装と同じ機能を継承します。その他の JDBC 機能については、その[ページ](/integrations/language-clients/java/jdbc)を参照してください。

### Compatibility

* このリポジトリ内のすべてのプロジェクトは、ClickHouse のすべての[アクティブな LTS バージョン](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)に対してテストされています。
* [サポートポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)を参照してください。
* セキュリティ修正と新機能を逃さないよう、クライアントは継続的にアップグレードすることを推奨します。
* v2 API へのマイグレーションで問題がある場合は、[Issue を作成](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=\&labels=v2-feedback\&projects=\&template=v2-feedback.md\&title=)してください。対応します。

### Logging

Java 言語クライアントはログ出力に [SLF4J](https://www.slf4j.org/) を使用します。`Logback` や `Log4j` など、任意の SLF4J 互換ロギングフレームワークを利用できます。
たとえば Maven を使用している場合、`pom.xml` ファイルに次の依存関係を追加できます。

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

    <!-- Logback Classic (SLF4JとLogbackをブリッジ) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 最新バージョンを使用 -->
    </dependency>
</dependencies>
```

#### ロギングの設定

ロギングの設定方法は、使用しているロギングフレームワークによって異なります。たとえば `Logback` を使用している場合は、`logback.xml` というファイルでロギングの設定を行えます。

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
