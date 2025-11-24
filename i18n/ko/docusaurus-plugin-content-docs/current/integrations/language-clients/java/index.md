---
'title': 'Java'
'keywords':
- 'clickhouse'
- 'java'
- 'jdbc'
- 'client'
- 'integrate'
- 'r2dbc'
'description': 'Java에서 ClickHouse에 연결하는 옵션'
'slug': '/integrations/java'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java 클라이언트 개요

- [클라이언트 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC 드라이버](./r2dbc.md)

## ClickHouse 클라이언트 {#clickhouse-client}

Java 클라이언트는 ClickHouse 서버와의 네트워크 통신 세부 정보를 추상화하는 자체 API를 구현하는 라이브러리입니다. 현재 지원되는 인터페이스는 HTTP만입니다. 이 라이브러리는 다양한 ClickHouse 형식과 관련된 기능을 처리하기 위한 유틸리티를 제공합니다.

Java 클라이언트는 2015년에 개발되었습니다. 그 코드베이스는 유지 관리가 매우 어려워졌고, API가 혼란스럽고, 더 이상 최적화하기 어렵습니다. 그래서 우리는 2024년에 이를 새로운 구성 요소 `client-v2`로 리팩토링했습니다. 이 버전은 명확한 API, 더 가벼운 코드베이스 및 더 나은 성능 향상, ClickHouse 형식 지원(주로 RowBinary 및 Native)을 제공합니다. JDBC는 가까운 미래에 이 클라이언트를 사용할 것입니다.

### 지원되는 데이터 유형 {#supported-data-types}

|**데이터 유형**          |**클라이언트 V2 지원**|**클라이언트 V1 지원**|
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

[ClickHouse 데이터 유형](/sql-reference/data-types)

:::note
- AggregatedFunction - :warning: `SELECT * FROM table ...`를 지원하지 않습니다.
- Decimal - 21.9+에서 일관성을 위해 `SET output_format_decimal_trailing_zeros=1`
- Enum - 문자열과 정수로 모두 처리될 수 있습니다.
- UInt64 - client-v1에서 `long`으로 매핑됨 
:::

### 기능 {#features}

클라이언트의 기능 테이블:

| 이름                                         | 클라이언트 V2 | 클라이언트 V1 | 설명
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP 연결                                   |✔       |✔      | |
| HTTP 압축 (LZ4)                             |✔       |✔      | |
| 서버 응답 압축 - LZ4                       |✔       |✔      | | 
| 클라이언트 요청 압축 - LZ4                 |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| 클라이언트 SSL 인증서 (mTLS)               |✔       |✔      | |
| HTTP 프록시                                  |✔       |✔      | |
| POJO 직렬화/역직렬화                        |✔       |✗      | |
| 연결 풀                                     |✔       |✔      | Apache HTTP 클라이언트를 사용할 때 |
| 명명된 매개변수                             |✔       |✔      | |
| 실패 시 재시도                              |✔       |✔      | |
| 장애 조치                                     |✗       |✔      | |
| 로드 밸런싱                                 |✗       |✔      | |
| 서버 자동 검색                             |✗       |✔      | |
| 로그 주석                                   |✔       |✔      | |
| 세션 역할                                   |✔       |✔      | |
| SSL 클라이언트 인증                        |✔       |✔      | |
| 세션 타임존                                |✔       |✔      | |

JDBC 드라이버는 기본 클라이언트 구현과 동일한 기능을 상속합니다. 기타 JDBC 기능은 [페이지](/integrations/language-clients/java/jdbc)에서 확인할 수 있습니다.

### 호환성 {#compatibility}

- 이 리포지토리의 모든 프로젝트는 ClickHouse의 모든 [활성 LTS 버전](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)에서 테스트되었습니다.
- [지원 정책](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- 보안 수정 및 새로운 개선 사항을 놓치지 않기 위해 클라이언트를 지속적으로 업그레이드할 것을 권장합니다.
- v2 API로의 마이그레이션에 문제가 있는 경우 - [문제 생성](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)해 주시면 응답하겠습니다!

### 로깅 {#logging}

우리의 Java 언어 클라이언트는 [SLF4J](https://www.slf4j.org/)를 사용하여 로깅합니다. `Logback` 또는 `Log4j`와 같이 SLF4J 호환 로깅 프레임워크를 사용할 수 있습니다. 예를 들어, Maven을 사용하는 경우 `pom.xml` 파일에 다음 종속성을 추가할 수 있습니다:

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

#### 로깅 구성 {#configuring-logging}

이는 사용 중인 로깅 프레임워크에 따라 다릅니다. 예를 들어, `Logback`을 사용하는 경우 `logback.xml`이라는 파일에 로깅을 구성할 수 있습니다:

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

[변경 로그](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
