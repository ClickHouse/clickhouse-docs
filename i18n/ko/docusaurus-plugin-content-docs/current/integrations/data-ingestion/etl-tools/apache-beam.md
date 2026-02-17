---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'Apache Beam을 사용하여 ClickHouse로 데이터를 수집할 수 있습니다'
title: 'Apache Beam과 ClickHouse 연동'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', '스트림 처리', '배치 처리', 'JDBC 커넥터', '데이터 파이프라인']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Beam과 ClickHouse 통합 \{#integrating-apache-beam-and-clickhouse\}

<ClickHouseSupportedBadge/>

**Apache Beam**은 오픈 소스 통합 프로그래밍 모델로, 개발자가 배치와 스트림(연속) 데이터 처리 파이프라인을 모두 정의하고 실행할 수 있게 합니다. Apache Beam의 유연성은 ETL(Extract, Transform, Load) 작업부터 복잡한 이벤트 처리와 실시간 분석에 이르기까지 광범위한 데이터 처리 시나리오를 지원하는 데에서 비롯됩니다.
이 통합은 하부 데이터 삽입 계층을 위해 ClickHouse의 공식 [JDBC connector](https://github.com/ClickHouse/clickhouse-java)를 사용합니다.

## 통합 패키지 \{#integration-package\}

Apache Beam과 ClickHouse를 통합하는 데 필요한 통합 패키지는 여러 인기 있는 데이터 저장 시스템과 데이터베이스용 통합 패키지를 모아둔 번들인 [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/)에서 유지·관리 및 개발됩니다.
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 구현체는 [Apache Beam repo](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)에 위치합니다.

## Apache Beam ClickHouse 패키지 설정 \{#setup-of-the-apache-beam-clickhouse-package\}

### 패키지 설치 \{#package-installation\}

다음 의존성을 패키지 관리 도구에 추가합니다:

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 권장 Beam 버전
`ClickHouseIO` 커넥터는 Apache Beam `2.59.0` 버전부터 사용할 것을 권장합니다.
이보다 이전 버전에서는 커넥터의 모든 기능이 완전히 지원되지 않을 수 있습니다.
:::

아티팩트는 [공식 Maven 저장소](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)에서 찾을 수 있습니다.


### 코드 예시 \{#code-example\}

다음 예시는 `input.csv`라는 CSV 파일을 `PCollection`으로 읽은 다음, (정의된 스키마를 사용해) Row 객체로 변환하고 `ClickHouseIO`를 사용하여 로컬 ClickHouse 인스턴스에 삽입합니다.

```java

package org.example;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.io.TextIO;
import org.apache.beam.sdk.io.clickhouse.ClickHouseIO;
import org.apache.beam.sdk.schemas.Schema;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;
import org.apache.beam.sdk.values.Row;
import org.joda.time.DateTime;

public class Main {

    public static void main(String[] args) {
        // Create a Pipeline object.
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // Apply transforms to the pipeline.
        PCollection<String> lines = p.apply("ReadLines", TextIO.read().from("src/main/resources/input.csv"));

        PCollection<Row> rows = lines.apply("ConvertToRow", ParDo.of(new DoFn<String, Row>() {
            @ProcessElement
            public void processElement(@Element String line, OutputReceiver<Row> out) {

                String[] values = line.split(",");
                Row row = Row.withSchema(SCHEMA)
                        .addValues(values[0], Short.parseShort(values[1]), DateTime.now())
                        .build();
                out.output(row);
            }
        })).setRowSchema(SCHEMA);

        rows.apply("Write to ClickHouse",
                        ClickHouseIO.write("jdbc:clickhouse://localhost:8123/default?user=default&password=******", "test_table"));

        // Run the pipeline.
        p.run().waitUntilFinish();
    }
}

```


## 지원되는 데이터 유형 \{#supported-data-types\}

| ClickHouse                         | Apache Beam                | Is Supported | Notes                                                                                                                                       |
|------------------------------------|----------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅            |                                                                                                                                             |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅            | `FixedBytes`는 고정 길이의 <br/> 바이트 배열을 표현하는 `LogicalType`이며, <br/> `org.apache.beam.sdk.schemas.logicaltypes`에 위치합니다. |
|                                    | `Schema.TypeName#DECIMAL`  | ❌            |                                                                                                                                             |
|                                    | `Schema.TypeName#MAP`      | ❌            |                                                                                                                                             |

## ClickHouseIO.Write 매개변수 \{#clickhouseiowrite-parameters\}

다음 setter 함수를 사용하여 `ClickHouseIO.Write` 구성을 설정할 수 있습니다:

| 매개변수 setter 함수         | 인수 타입                    | 기본값                        | 설명                                                              |
|-----------------------------|-----------------------------|-------------------------------|-------------------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 삽입할 행 블록의 최대 크기입니다.                                 |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 삽입 실패 시 재시도할 최대 횟수입니다.                            |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | 재시도에 사용할 누적 백오프 기간의 최대값입니다.                  |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 첫 번째 재시도 전에 사용할 초기 백오프 기간입니다.                |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | `true`인 경우, 분산 테이블에 대한 삽입 작업을 동기화합니다.      |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 삽입 작업을 확인하는 데 필요한 레플리카의 개수입니다.            |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | `true`인 경우, 삽입 작업에 대해 중복 제거가 활성화됩니다.         |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 대상 ClickHouse 테이블의 스키마입니다.                            |

## 제한 사항 \{#limitations\}

커넥터를 사용할 때 다음 제한 사항을 고려하십시오.

* 현재는 Sink 작업만 지원합니다. Source 작업은 지원되지 않습니다.
* ClickHouse는 `ReplicatedMergeTree` 또는 `ReplicatedMergeTree` 위에 구축된 `Distributed` 테이블에 데이터를 삽입할 때 중복 제거를 수행합니다. 복제가 구성되어 있지 않으면, 일반 MergeTree에 삽입하는 경우 삽입이 실패한 뒤 재시도가 성공하면 중복이 발생할 수 있습니다. 그러나 각 블록은 원자적으로 삽입되며, 블록 크기는 `ClickHouseIO.Write.withMaxInsertBlockSize(long)`을 사용하여 구성할 수 있습니다. 중복 제거는 삽입된 블록의 체크섬을 사용하여 수행됩니다. 중복 제거에 대한 자세한 내용은 [Deduplication](/guides/developer/deduplication) 및 [Deduplicate insertion config](/operations/settings/settings#insert_deduplicate)를 참조하십시오.
* 커넥터는 어떤 DDL SQL 문도 실행하지 않으므로, 데이터를 삽입하기 전에 대상 테이블이 미리 존재해야 합니다.

## 관련 콘텐츠 \{#related-content\}

* `ClickHouseIO` 클래스 [문서](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html).
* 예제용 `GitHub` 저장소 [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector).