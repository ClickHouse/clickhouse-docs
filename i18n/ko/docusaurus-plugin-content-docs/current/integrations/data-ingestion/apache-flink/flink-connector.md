---
sidebar_label: 'Apache Flink'
sidebar_position: 1
slug: /integrations/apache-flink
description: 'ClickHouse와 함께하는 Apache Flink 소개'
keywords: ['clickhouse', 'Apache Flink', '마이그레이션', '데이터', '스트림 처리']
title: 'Flink 커넥터'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Flink Connector \{#flink-connector\}

<ClickHouseSupportedBadge/>

이것은 ClickHouse에서 지원하는 공식 [Apache Flink 싱크 커넥터](https://github.com/ClickHouse/flink-connector-clickhouse)입니다. 이 커넥터는 Flink의 [AsyncSinkBase](https://cwiki.apache.org/confluence/display/FLINK/FLIP-171%3A+Async+Sink)와 공식 ClickHouse [java client](https://github.com/ClickHouse/clickhouse-java)를 사용하여 구축되었습니다.

이 커넥터는 Apache Flink의 DataStream API를 지원합니다. Table API 지원은 [향후 릴리스에서 제공될 예정입니다](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42).

<TOCInline toc={toc}></TOCInline>

## 요구 사항 \{#requirements\}

* Java 11+ (Flink 1.17+용) 또는 17+ (Flink 2.0+용)
* Apache Flink 1.17+

## Flink 버전 호환성 매트릭스 \{#flink-compatibility-matrix\}

이 커넥터는 Flink 1.17+와 Flink 2.0+를 모두 지원할 수 있도록 두 개의 아티팩트로 나뉘어 있습니다. 사용하려는 Flink 버전에 맞는 아티팩트를 선택하십시오:

| Flink 버전 | 아티팩트                             | ClickHouse Java Client 버전 | 필요한 Java |
| -------- | -------------------------------- | ------------------------- | -------- |
| latest   | flink-connector-clickhouse-2.0.0 | 0.9.5                     | Java 17+ |
| 2.0.1    | flink-connector-clickhouse-2.0.0 | 0.9.5                     | Java 17+ |
| 2.0.0    | flink-connector-clickhouse-2.0.0 | 0.9.5                     | Java 17+ |
| 1.20.2   | flink-connector-clickhouse-1.17  | 0.9.5                     | Java 11+ |
| 1.19.3   | flink-connector-clickhouse-1.17  | 0.9.5                     | Java 11+ |
| 1.18.1   | flink-connector-clickhouse-1.17  | 0.9.5                     | Java 11+ |
| 1.17.2   | flink-connector-clickhouse-1.17  | 0.9.5                     | Java 11+ |

:::note
이 커넥터는 Flink 1.17.2 이전 버전에서는 테스트되지 않았습니다.
:::

## 설치 및 설정 \{#installation--setup\}

### 의존성으로 추가하기 \{#import-as-a-dependency\}

#### Flink 2.0+용 \{#flink-2\}

<Tabs>
  <TabItem value="Maven" label="Maven" default>
    ```maven
    <dependency>
        <groupId>com.clickhouse.flink</groupId>
        <artifactId>flink-connector-clickhouse-2.0.0</artifactId>
        <version>{{ stable_version }}</version>
        <classifier>all</classifier>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Gradle" label="Gradle">
    ```gradle
    dependencies {
        implementation("com.clickhouse.flink:flink-connector-clickhouse-2.0.0:{{ stable_version }}")
    }
    ```
  </TabItem>

  <TabItem value="SBT" label="SBT">
    ```sbt
    libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-2.0.0" % {{ stable_version }} classifier "all"
    ```
  </TabItem>
</Tabs>

#### Flink 1.17 이상용 \{#flink-117\}

<Tabs>
  <TabItem value="Maven" label="Maven" default>
    ```maven
    <dependency>
        <groupId>com.clickhouse.flink</groupId>
        <artifactId>flink-connector-clickhouse-1.17</artifactId>
        <version>{{ stable_version }}</version>
        <classifier>all</classifier>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Gradle" label="Gradle">
    ```gradle
    dependencies {
        implementation("com.clickhouse.flink:flink-connector-clickhouse-1.17:{{ stable_version }}")
    }
    ```
  </TabItem>

  <TabItem value="SBT" label="SBT">
    ```sbt
    libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-1.17" % {{ stable_version }} classifier "all"
    ```
  </TabItem>
</Tabs>

### 바이너리 다운로드 \{#download-the-binary\}

바이너리 JAR의 파일명 패턴은 다음과 같습니다:

```bash
flink-connector-clickhouse-${flink_version}-${stable_version}-all.jar
```

여기서:

* `flink_version`은 `2.0.0` 또는 `1.17` 중 하나입니다.
* `stable_version`은 [안정화된 아티팩트 릴리스 버전](https://github.com/ClickHouse/flink-connector-clickhouse/releases)입니다.

사용 가능한 모든 JAR 릴리스 파일은 [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/flink/)에서 확인할 수 있습니다.


## DataStream API 사용 \{#using-the-datastream-api\}

### 스니펫 \{#datastream-snippet\}

원시 CSV 데이터를 ClickHouse에 삽입하려고 한다고 가정하겠습니다:

<Tabs groupId="raw_csv_java_example">
  <TabItem value="Java" label="Java" default>
    ```java
    public static void main(String[] args) {
        // ClickHouseClient 구성
        ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(url, username, password, database, tableName);

        // ElementConverter 생성
        ElementConverter<String, ClickHousePayload> convertorString = new ClickHouseConvertor<>(String.class);

        // sink를 생성하고 `setClickHouseFormat`을 사용해 형식을 설정
        ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
                convertorString,
                MAX_BATCH_SIZE,
                MAX_IN_FLIGHT_REQUESTS,
                MAX_BUFFERED_REQUESTS,
                MAX_BATCH_SIZE_IN_BYTES,
                MAX_TIME_IN_BUFFER_MS,
                MAX_RECORD_SIZE_IN_BYTES,
                clickHouseClientConfig
        );

        csvSink.setClickHouseFormat(ClickHouseFormat.CSV);

        // 마지막으로 DataStream을 sink에 연결
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        Path csvFilePath = new Path(fileFullName);
        FileSource<String> csvSource = FileSource
                .forRecordStreamFormat(new TextLineInputFormat(), csvFilePath)
                .build();

        env.fromSource(
                csvSource,
                WatermarkStrategy.noWatermarks(),
                "GzipCsvSource"
        ).sinkTo(csvSink);
    }
    ```
  </TabItem>
</Tabs>

추가 예시와 스니펫은 테스트 코드에서 확인할 수 있습니다:

* [flink-connector-clickhouse-1.17](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-1.17/src/test/java/org/apache/flink/connector/clickhouse/sink)
* [flink-connector-clickhouse-2.0.0](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-2.0.0/src/test/java/org/apache/flink/connector/clickhouse/sink)

### 빠른 시작 예제 \{#datastream-quick-start\}

ClickHouse 싱크를 쉽게 시작할 수 있도록 Maven 기반 예제를 만들었습니다:

- [Flink 1.17+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v1.7/covid)
- [Flink 2.0.0+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v2/covid)

더 자세한 지침은 [Example Guide](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/examples/README.md)를 참조하십시오.

### DataStream API 연결 옵션 \{#datastream-api-connection-options\}

#### ClickHouse 클라이언트 옵션 \{#client-options\}

| 매개변수                        | 설명                                                                                                                         | 기본값   | 필수 여부 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| `url`                       | 완전한 ClickHouse URL                                                                                                         | 해당 없음 | 예     |
| `username`                  | ClickHouse 데이터베이스 사용자 이름                                                                                                   | 해당 없음 | 예     |
| `password`                  | ClickHouse 데이터베이스 비밀번호                                                                                                     | 해당 없음 | 예     |
| `database`                  | ClickHouse 데이터베이스 이름                                                                                                       | 해당 없음 | 예     |
| `table`                     | ClickHouse 테이블 이름                                                                                                          | 해당 없음 | 예     |
| `options`                   | Java 클라이언트 구성 옵션 맵                                                                                                         | 빈 맵   | 아니요   |
| `serverSettings`            | ClickHouse 서버 세션 설정 맵                                                                                                      | 빈 맵   | 아니요   |
| `enableJsonSupportAsString` | [JSON 데이터 타입](https://clickhouse.com/docs/sql-reference/data-types/newjson)에 대해 JSON 형식의 String을 기대하도록 하는 ClickHouse 서버 설정 | true  | 아니요   |

`options` 및 `serverSettings`는 `Map<String, String>` 형식으로 클라이언트에 전달해야 합니다. 둘 중 하나에 빈 맵을 사용하면 각각 클라이언트 또는 서버의 기본값이 사용됩니다.

:::note
사용 가능한 모든 Java 클라이언트 옵션은 [ClientConfigProperties.java](https://github.com/ClickHouse/clickhouse-java/blob/main/client-v2/src/main/java/com/clickhouse/client/api/ClientConfigProperties.java) 및 [이 문서 페이지](https://clickhouse.com/docs/integrations/language-clients/java/client#configuration)에 나와 있습니다.

사용 가능한 모든 서버 세션 설정은 [이 문서 페이지](https://clickhouse.com/docs/operations/settings/settings)에 나와 있습니다.
:::

예시는 다음과 같습니다:

<Tabs groupId="client_options_example">
  <TabItem value="Java" label="Java" default>
    ```java
    Map<String, String> javaClientOptions = Map.of(
        ClientConfigProperties.CA_CERTIFICATE.getKey(), "<my_CA_cert>",
        ClientConfigProperties.SSL_CERTIFICATE.getKey(), "<my_SSL_cert>",
        ClientConfigProperties.CLIENT_NETWORK_BUFFER_SIZE.getKey(), "30000",
        ClientConfigProperties.HTTP_MAX_OPEN_CONNECTIONS.getKey(), "5"
    );

    Map<String, String> serverSettings = Map.of(
        "insert_deduplicate", "1"
    );

    ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(
        url,
        username,
        password,
        database,
        tableName,
        javaClientOptions,
        serverSettings,
        false // enableJsonSupportAsString
    );
    ```
  </TabItem>
</Tabs>

#### 싱크 옵션 \{#sink-options\}

다음 옵션은 Flink의 `AsyncSinkBase`에서 직접 제공됩니다:

| Parameters             | Description                                                                                                 | Default Value | Required |
|------------------------|-------------------------------------------------------------------------------------------------------------|---------------|----------|
| `maxBatchSize`         | 단일 배치에 삽입되는 최대 레코드 수                                                                         | N/A           | 예       |
| `maxInFlightRequests`  | 싱크가 백프레셔를 적용하기 전에 허용되는 진행 중 요청의 최대 수                                             | N/A           | 예       |
| `maxBufferedRequests`  | 백프레셔가 적용되기 전에 싱크에서 버퍼링할 수 있는 최대 레코드 수                                           | N/A           | 예       |
| `maxBatchSizeInBytes`  | 배치가 가질 수 있는 최대 크기(바이트)입니다. 전송되는 모든 배치는 이 크기보다 작거나 같게 됩니다            | N/A           | 예       |
| `maxTimeInBufferMS`    | 플러시되기 전에 레코드가 싱크에 머무를 수 있는 최대 시간                                                    | N/A           | 예       |
| `maxRecordSizeInBytes` | 싱크가 허용하는 최대 레코드 크기이며, 이를 초과하는 레코드는 자동으로 거부됩니다                            | N/A           | 예       |

## 지원되는 데이터 타입 \{#supported-data-types\}

아래 표는 Flink에서 ClickHouse로 데이터를 삽입할 때의 데이터 타입 변환을 빠르게 참조할 수 있도록 제공합니다.

### Flink에서 ClickHouse로 데이터 삽입하기 \{#inserting-data-from-flink-into-clickhouse\}

[//]: # "TODO: 테이블 API 지원이 추가되면 \"Flink SQL Type\" 컬럼을 추가하기"

| Java 타입             | ClickHouse 타입     | 지원 여부 | 직렬화 방식                        |
| ------------------- | ----------------- | ----- | ----------------------------- |
| `byte`/`Byte`       | `Int8`            | ✅     | `DataWriter.writeInt8`        |
| `short`/`Short`     | `Int16`           | ✅     | `DataWriter.writeInt16`       |
| `int`/`Integer`     | `Int32`           | ✅     | `DataWriter.writeInt32`       |
| `long`/`Long`       | `Int64`           | ✅     | `DataWriter.writeInt64`       |
| `BigInteger`        | `Int128`          | ✅     | `DataWriter.writeInt128`      |
| `BigInteger`        | `Int256`          | ✅     | `DataWriter.writeInt256`      |
| `short`/`Short`     | `UInt8`           | ✅     | `DataWriter.writeUInt8`       |
| `int`/`Integer`     | `UInt8`           | ✅     | `DataWriter.writeUInt8 `      |
| `int`/`Integer`     | `UInt16`          | ✅     | `DataWriter.writeUInt16`      |
| `long`/`Long`       | `UInt32`          | ✅     | `DataWriter.writeUInt32`      |
| `long`/`Long`       | `UInt64`          | ✅     | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt64`          | ✅     | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt128`         | ✅     | `DataWriter.writeUInt128`     |
| `BigInteger`        | `UInt256`         | ✅     | `DataWriter.writeUInt256`     |
| `BigDecimal`        | `Decimal`         | ✅     | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal32`       | ✅     | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal64`       | ✅     | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal128`      | ✅     | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal256`      | ✅     | `DataWriter.writeDecimal`     |
| `float`/`Float`     | `Float`           | ✅     | `DataWriter.writeFloat32`     |
| `double`/`Double`   | `Double`          | ✅     | `DataWriter.writeFloat64`     |
| `boolean`/`Boolean` | `Boolean`         | ✅     | `DataWriter.writeBoolean`     |
| `String`            | `String`          | ✅     | `DataWriter.writeString`      |
| `String`            | `FixedString`     | ✅     | `DataWriter.writeFixedString` |
| `LocalDate`         | `Date`            | ✅     | `DataWriter.writeDate`        |
| `LocalDate`         | `Date32`          | ✅     | `DataWriter.writeDate32`      |
| `LocalDateTime`     | `DateTime`        | ✅     | `DataWriter.writeDateTime`    |
| `ZonedDateTime`     | `DateTime`        | ✅     | `DataWriter.writeDateTime`    |
| `LocalDateTime`     | `DateTime64`      | ✅     | `DataWriter.writeDateTime64`  |
| `ZonedDateTime`     | `DateTime64`      | ✅     | `DataWriter.writeDateTime64`  |
| `int`/`Integer`     | `Time`            | ❌     | 해당 없음                         |
| `long`/`Long`       | `Time64`          | ❌     | 해당 없음                         |
| `byte`/`Byte`       | `Enum8`           | ✅     | `DataWriter.writeInt8`        |
| `int`/`Integer`     | `Enum16`          | ✅     | `DataWriter.writeInt16`       |
| `java.util.UUID`    | `UUID`            | ✅     | `DataWriter.writeIntUUID`     |
| `String`            | `JSON`            | ✅     | `DataWriter.writeJSON`        |
| `Array<Type>`       | `Array<Type>`     | ✅     | `DataWriter.writeArray`       |
| `Map<K,V>`          | `Map<K,V>`        | ✅     | `DataWriter.writeMap`         |
| `Tuple<Type,..>`    | `Tuple<T1,T2,..>` | ✅     | `DataWriter.writeTuple`       |
| `Object`            | `Variant`         | ❌     | 해당 없음                         |

참고:

* 날짜 연산을 수행할 때는 `ZoneId`를 제공해야 합니다.
* decimal 연산을 수행할 때는 [정밀도와 스케일](https://clickhouse.com/docs/sql-reference/data-types/decimal#decimal-value-ranges)을 지정해야 합니다.
* ClickHouse가 Java String을 JSON으로 파싱할 수 있도록 하려면 `ClickHouseClientConfig`에서 `enableJsonSupportAsString`을 활성화해야 합니다.
* 커넥터는 입력 DataStream의 요소를 ClickHouse 페이로드에 매핑하기 위해 `ElementConvertor`가 필요합니다. 이를 위해 커넥터는 `ClickHouseConvertor`와 `POJOConvertor`를 제공하며, 위의 `DataWriter` 직렬화 메서드를 사용해 이 매핑을 구현할 수 있습니다.

## 지원되는 입력 형식 \{#supported-input-formats\}

사용 가능한 ClickHouse 입력 형식 목록은 [이 문서 페이지](https://clickhouse.com/docs/interfaces/formats#formats-overview)와 [ClickHouseFormat.java](https://github.com/ClickHouse/clickhouse-java/blob/main/clickhouse-data/src/main/java/com/clickhouse/data/ClickHouseFormat.java)에서 확인할 수 있습니다.

커넥터가 DataStream을 ClickHouse 페이로드로 직렬화할 때 사용할 형식을 지정하려면 `setClickHouseFormat` 함수를 사용하십시오. 예시는 다음과 같습니다.

```java
ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
        convertorString,
        MAX_BATCH_SIZE,
        MAX_IN_FLIGHT_REQUESTS,
        MAX_BUFFERED_REQUESTS,
        MAX_BATCH_SIZE_IN_BYTES,
        MAX_TIME_IN_BUFFER_MS,
        MAX_RECORD_SIZE_IN_BYTES,
        clickHouseClientConfig
);
csvSink.setClickHouseFormat(ClickHouseFormat.CSV);
```

:::note
기본적으로 커넥터는 `ClickHouseClientConfig`의 `setSupportDefault`가 명시적으로 true 또는 false로 설정된 경우, 각각 [RowBinaryWithDefaults](https://clickhouse.com/docs/interfaces/formats/RowBinaryWithDefaults) 또는 [RowBinary](https://clickhouse.com/docs/interfaces/formats/RowBinary)를 사용합니다.
:::


## 메트릭 \{#metrics\}

이 커넥터는 Flink의 기존 메트릭 외에 다음과 같은 추가 메트릭을 노출합니다:

| Metric                                  | Description                                                                                                                                                                  | Type      | Status |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| `numBytesSend`                          | 요청 페이로드에서 ClickHouse로 전송된 총 바이트 수입니다. *참고: 이 메트릭은 네트워크를 통해 전송된 직렬화 데이터의 크기를 측정하므로, 처리 후 스토리지에 실제로 기록된 바이트 수를 반영하는 `system.query_log`의 ClickHouse `written_bytes`와 다를 수 있습니다* | Counter   | ✅      |
| `numRecordSend`                         | ClickHouse로 전송된 총 레코드 수입니다                                                                                                                                                   | Counter   | ✅      |
| `numRequestSubmitted`                   | 전송된 총 요청 수입니다(실제로 수행된 flush 횟수)                                                                                                                                              | Counter   | ✅      |
| `numOfDroppedBatches`                   | 재시도할 수 없는 실패로 인해 폐기된 총 배치 수입니다                                                                                                                                               | Counter   | ✅      |
| `numOfDroppedRecords`                   | 재시도할 수 없는 실패로 인해 폐기된 총 레코드 수입니다                                                                                                                                              | Counter   | ✅      |
| `totalBatchRetries`                     | 재시도 가능한 실패로 인한 총 배치 재시도 횟수입니다                                                                                                                                                | Counter   | ✅      |
| `writeLatencyHistogram`                 | 쓰기 성공 지연 시간 분포(ms) 히스토그램입니다                                                                                                                                                  | Histogram | ✅      |
| `writeFailureLatencyHistogram`          | 쓰기 실패 지연 시간 분포(ms) 히스토그램입니다                                                                                                                                                  | Histogram | ✅      |
| `triggeredByMaxBatchSizeCounter`        | `maxBatchSize`에 도달해 발생한 총 flush 횟수입니다                                                                                                                                        | Counter   | ✅      |
| `triggeredByMaxBatchSizeInBytesCounter` | `maxBatchSizeInBytes`에 도달해 발생한 총 flush 횟수입니다                                                                                                                                 | Counter   | ✅      |
| `triggeredByMaxTimeInBufferMSCounter`   | `maxTimeInBufferMS`에 도달해 발생한 총 flush 횟수입니다                                                                                                                                   | Counter   | ✅      |
| `actualRecordsPerBatch`                 | 실제 배치 크기 분포 히스토그램입니다                                                                                                                                                         | Histogram | ✅      |
| `actualBytesPerBatch`                   | 배치당 실제 바이트 수 분포 히스토그램입니다                                                                                                                                                     | Histogram | ✅      |

[//]: # "| actualTimeInBuffer           | flush 전 실제 버퍼 체류 시간 분포 히스토그램입니다       | Histogram | ❌      |"

## 제한 사항 \{#limitations\}

* 이 싱크는 현재 at-least-once 전달을 보장합니다. exactly-once semantics 지원 작업은 [여기](https://github.com/ClickHouse/flink-connector-clickhouse/issues/106)에서 진행 상황을 추적하고 있습니다.
* 이 싱크는 아직 처리할 수 없는 레코드를 버퍼링하기 위한 데드 레터 큐(DLQ)를 지원하지 않습니다. 현재로서는 커넥터가 삽입에 실패한 레코드를 다시 삽입하려고 시도하며, 그래도 성공하지 못하면 해당 레코드를 버립니다. 이 기능은 [여기](https://github.com/ClickHouse/flink-connector-clickhouse/issues/105)에서 진행 상황을 추적하고 있습니다.
* 이 싱크는 아직 Flink의 Table API 또는 Flink SQL을 통한 생성을 지원하지 않습니다. 이 기능은 [여기](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42)에서 진행 상황을 추적하고 있습니다.

## ClickHouse 버전 호환성 및 보안 \{#compatibility-and-security\}

* 이 커넥터는 일일 CI 워크플로를 통해 최신 버전과 head를 포함한 여러 최신 ClickHouse 버전에서 테스트됩니다. 테스트 대상 버전은 새로운 ClickHouse 릴리스가 적용됨에 따라 주기적으로 업데이트됩니다. 커넥터가 매일 어떤 버전에서 테스트되는지는 [여기](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/.github/workflows/tests-nightly.yaml#L15)에서 확인하십시오.
* 알려진 보안 취약점과 취약점 보고 방법은 [ClickHouse 보안 정책](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)을 참조하십시오.
* 보안 수정 사항과 새로운 개선 사항을 놓치지 않도록 커넥터를 지속적으로 업그레이드할 것을 권장합니다.
* 마이그레이션 관련 문제가 있으면 GitHub [issue](https://github.com/ClickHouse/flink-connector-clickhouse/issues)를 생성해 주십시오. 확인 후 응답하겠습니다.

## 고급 및 권장 사용법 \{#advanced-and-recommended-usage\}

* 최적의 성능을 위해 DataStream 요소 타입이 **Generic 타입이 아니어야 합니다**. Flink의 타입 구분에 대해서는 [여기](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/dev/datastream/fault-tolerance/serialization/types_serialization/#flinks-typeinformation-class)를 참조하십시오. Generic이 아닌 요소는 Kryo로 인해 발생하는 직렬화 오버헤드를 피할 수 있어 ClickHouse로의 처리량을 향상시킵니다.
* `maxBatchSize`는 최소 1000으로, 이상적으로는 10,000~100,000 범위로 설정하는 것을 권장합니다. 자세한 내용은 [대량 삽입에 대한 이 가이드](/optimize/bulk-inserts)를 참조하십시오.
* ClickHouse에서 OLTP 스타일의 중복 제거 또는 upsert를 수행하려면 [이 문서 페이지](/guides/developer/deduplication#options-for-deduplication)를 참조하십시오. *참고: 이는 재시도 시 발생하는 배치 중복 제거와 혼동하면 안 됩니다.*

## 문제 해결 \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

다음과 같은 오류가 발생할 수 있습니다:

```text
com.clickhouse.client.api.ServerException: Code: 33. DB::Exception: Cannot read all data. Bytes read: 9205. Bytes expected: 1100022.: (at row 9) : While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)
```

**원인**: 일반적으로 CANNOT&#95;READ&#95;ALL&#95;DATA 오류는 ClickHouse 테이블 스키마가 Flink 레코드 스키마와 서로 달라졌음을 의미합니다. 이는 둘 중 하나 또는 둘 다가 하위 호환되지 않는 방식으로 변경될 때 발생할 수 있습니다.

**해결 방법**: ClickHouse 테이블 또는 커넥터 입력 데이터 타입 중 하나(또는 둘 다)의 스키마를 업데이트하여 서로 호환되도록 하십시오. 필요한 경우, Java 타입을 ClickHouse 타입으로 조회하는 방법은 [type mapping](#inserting-data-from-flink-into-clickhouse)을 참조하십시오. *참고: 아직 전송 중인 레코드가 남아 있다면 커넥터를 다시 시작할 때 Flink 상태를 재설정해야 합니다.*


### 낮은 처리량 \{#low_throughput\}

ClickHouse에 쓸 때 커넥터의 처리량이 작업의 병렬성(Flink 태스크 수)에 비례해 확장되지 않을 수 있습니다.

**원인**: ClickHouse의 백그라운드 [파트 머지 프로세스](https://clickhouse.com/docs/merges)로 인해 insert 속도가 느려질 수 있습니다. 이는 구성된 배치 크기가 너무 작거나, 커넥터가 너무 자주 플러시하거나, 또는 이 두 가지가 함께 작용할 때 발생할 수 있습니다.

**해결 방법**: `numRequestSubmitted` 및 `actualRecordsPerBatch` 메트릭을 모니터링하여 배치 크기(`maxBatchSize`)를 어떻게 조정할지, 그리고 얼마나 자주 플러시할지를 판단하십시오. 또한 배치 크기 권장 사항은 [고급 및 권장 사용법](#advanced-and-recommended-usage)도 참조하십시오.

[//]: # "TODO: https://github.com/ClickHouse/flink-connector-clickhouse/issues/121 이 해결되면 이 섹션의 주석을 해제하십시오"

[//]: # "### ClickHouse 테이블에 중복된 행 배치가 표시됩니다 {#duplicate_batches}"

[//]: #

[//]: # "**원인**: 재시도 가능한 실패로 인해 Flink 배치의 하나 이상의 레코드를 ClickHouse에 insert하지 못하면, 커넥터는 **전체 배치**를 재시도합니다. [insert 중복 제거](https://clickhouse.com/docs/guides/developer/deduplicating-inserts-on-retries#query-level-insert-deduplication)가 비활성화되어 있으면 ClickHouse 테이블에 중복 레코드가 저장될 수 있습니다. 그렇지 않은 경우에는 중복 제거 윈도우 또는 윈도우 지속 시간이 너무 짧아 커넥터가 재시도하기 전에 블록이 만료될 수 있습니다."

[//]: #

[//]: # "**해결 방법**:"

[//]: # "- 테이블이 `Replicated*MergeTree` 테이블 엔진을 사용하는 경우:"

[//]: # "  1. 서버 세션 설정 `insert_deduplicate=1`이 설정되어 있는지 확인하십시오 (필요한 경우 설정 방법은 위의 [예시](#client-options)를 참조하십시오). `insert_deduplicate`는 복제된 테이블에서 기본적으로 활성화되어 있습니다."

[//]: # "  2. 필요한 경우 `MergeTree` 테이블 설정 [`replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window) 또는 [`replicated_deduplication_window_seconds`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) 중 하나 또는 둘 다를 늘리십시오."

[//]: # "- 테이블이 비복제 `*MergeTree` 테이블 엔진을 사용하는 경우 `MergeTree` 테이블 설정 [`non_replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#non_replicated_deduplication_window)를 늘리십시오."

[//]: #

[//]: # "_참고 1: 이 해결 방법은 Flink 커넥터와 함께 사용하는 것이 권장되는 [동기식 insert](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)에 의존합니다. 서버 세션 설정 `async_insert=0`인지 확인하십시오._"

[//]: #

[//]: # "_참고 2: `(non_)replicated_deduplication_window` 값을 크게 설정하면 비교해야 하는 엔트리가 많아지므로 insert 속도가 느려질 수 있습니다._"

### ClickHouse 테이블에서 일부 행이 누락됩니다 \{#missing_rows\}

**원인**: 재시도할 수 없는 오류가 발생했거나, 구성된 재시도 횟수(`ClickHouseClientConfig.setNumberOfRetries()`를 통해 설정 가능) 내에 배치를 삽입하지 못해 배치가 폐기되었습니다. *참고: 기본적으로 커넥터는 배치를 폐기하기 전에 최대 3번까지 다시 삽입을 시도합니다.*

**해결 방법**: 근본 원인을 파악하려면 TaskManager 로그 및/또는 스택 추적을 확인하십시오.

## 기여 및 지원 \{#contributing-and-support\}

프로젝트에 기여하거나 문제를 보고하려는 경우, 의견을 보내주시면 감사하겠습니다!
문제를 등록하거나, 개선 사항을 제안하거나, pull request를 제출하려면 [GitHub repository](https://github.com/ClickHouse/flink-connector-clickhouse)를
방문하십시오.

기여를 환영합니다! 시작하기 전에 저장소의 [contribution guide](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/CONTRIBUTING.md)를 확인하십시오.
ClickHouse Flink 커넥터 개선에 도움을 주셔서 감사합니다!