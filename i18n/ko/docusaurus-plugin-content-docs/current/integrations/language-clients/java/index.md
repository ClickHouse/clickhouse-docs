---
title: 'Java'
sidebar_position: 1
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: 'Java에서 ClickHouse에 연결하는 다양한 옵션'
slug: /integrations/java
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java 클라이언트 개요 \{#java-clients-overview\}

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC Driver](./r2dbc.md)

## ClickHouse client \{#clickhouse-client\}

Java 클라이언트는 ClickHouse 서버와의 네트워크 통신 세부 사항을 추상화하는 독자적인 API를 구현한 라이브러리입니다. 현재는 HTTP 인터페이스만 지원합니다. 이 라이브러리는 다양한 ClickHouse 포맷과 기타 관련 기능을 다루기 위한 유틸리티를 제공합니다.

Java 클라이언트는 이미 2015년에 처음 개발되었으며, 코드베이스를 유지 관리하기 매우 어려워졌고, API가 혼란스러우며 추가 최적화도 어려운 상태가 되었습니다. 이에 2024년에 이를 새로운 컴포넌트인 `client-v2`로 리팩터링했습니다. 이 컴포넌트는 더 명확한 API, 더 가벼운 코드베이스, 향상된 성능, 그리고 더 나은 ClickHouse 포맷 지원(주로 RowBinary 및 Native)을 제공합니다. JDBC는 머지않아 이 클라이언트를 사용하게 될 예정입니다.

### 지원되는 데이터 타입 \{#supported-data-types\}

|**데이터 타입**        |**Client V2 지원**   |**Client V1 지원**   |
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

[ClickHouse 데이터 타입](/sql-reference/data-types)

:::note

- AggregatedFunction - :warning: `SELECT * FROM table ...`을 지원하지 않습니다
- Decimal - 일관성을 위해 21.9+ 버전에서 `SET output_format_decimal_trailing_zeros=1`을 설정하십시오
- Enum - 문자열과 정수 둘 다로 취급될 수 있습니다
- UInt64 - `client-v1`에서 `long` 타입으로 매핑됩니다
:::

### 기능 \{#features\}

클라이언트 기능 표:

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
| Connection Pool                              |✔       |✔      | Apache HTTP Client를 사용하는 경우 |
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

JDBC 드라이버는 하위 클라이언트 구현과 동일한 기능을 제공합니다. 추가 JDBC 기능은 해당 [페이지](/integrations/language-clients/java/jdbc)에 나열되어 있습니다.

### 호환성 \{#compatibility\}

- 이 저장소의 모든 프로젝트는 ClickHouse의 [활성 LTS 버전](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease) 모두에서 테스트됩니다.
- [지원 정책](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- 보안 수정 및 새로운 개선 사항을 놓치지 않도록 클라이언트를 지속적으로 최신 버전으로 업그레이드할 것을 권장합니다.
- v2 API로 마이그레이션하는 과정에서 문제가 발생하면 [이슈를 생성](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)해 주시면 응답하겠습니다.

### 로깅 \{#logging\}

Java 클라이언트는 로깅을 위해 [SLF4J](https://www.slf4j.org/)를 사용합니다. `Logback` 또는 `Log4j`와 같이 SLF4J와 호환되는 로깅 프레임워크를 사용할 수 있습니다.
예를 들어 Maven을 사용하는 경우 `pom.xml` 파일에 다음과 같은 의존성을 추가할 수 있습니다:

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


#### 로깅 설정 \{#configuring-logging\}

이는 사용 중인 로깅 프레임워크에 따라 달라집니다. 예를 들어 `Logback`을 사용하는 경우 `logback.xml`이라는 파일에서 로깅을 설정할 수 있습니다:

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

[변경 내역](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
