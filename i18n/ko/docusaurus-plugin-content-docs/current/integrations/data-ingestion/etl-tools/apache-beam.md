---
'sidebar_label': 'Apache Beam'
'slug': '/integrations/apache-beam'
'description': '사용자는 Apache Beam을 사용하여 ClickHouse에 데이터를 삽입할 수 있습니다.'
'title': 'Apache Beam과 ClickHouse 통합'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
'keywords':
- 'apache beam'
- 'stream processing'
- 'batch processing'
- 'jdbc connector'
- 'data pipeline'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Beam과 ClickHouse 통합하기

<ClickHouseSupportedBadge/>

**Apache Beam**은 개발자가 배치 및 스트림(연속) 데이터 처리 파이프라인을 정의하고 실행할 수 있도록 해주는 오픈 소스 통합 프로그래밍 모델입니다. Apache Beam의 유연성은 ETL(Extract, Transform, Load) 작업에서 복잡한 이벤트 처리 및 실시간 분석에 이르기까지 다양한 데이터 처리 시나리오를 지원할 수 있는 능력에 있습니다. 이 통합은 기본 삽입 계층을 위해 ClickHouse의 공식 [JDBC 커넥터](https://github.com/ClickHouse/clickhouse-java)를 활용합니다.

## 통합 패키지 {#integration-package}

Apache Beam과 ClickHouse를 통합하는 데 필요한 통합 패키지는 [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) 하에 유지 및 개발됩니다. 이는 여러 인기 데이터 저장 시스템 및 데이터베이스의 통합 번들입니다. `org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 구현은 [Apache Beam 저장소](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse) 내에 위치합니다.

## Apache Beam ClickHouse 패키지 설정 {#setup-of-the-apache-beam-clickhouse-package}

### 패키지 설치 {#package-installation}

다음 종속성을 패키지 관리 프레임워크에 추가하세요:
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 권장 Beam 버전
`ClickHouseIO` 커넥터는 Apache Beam 버전 `2.59.0`부터 사용하는 것이 권장됩니다. 이전 버전은 커넥터의 기능을 완전히 지원하지 않을 수 있습니다.
:::

아티팩트는 [공식 Maven 리포지토리](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)에서 찾을 수 있습니다.

### 코드 예제 {#code-example}

다음 예제는 `input.csv`라는 CSV 파일을 `PCollection`으로 읽고, 정의된 스키마를 사용하여 이를 Row 객체로 변환한 후, `ClickHouseIO`를 사용하여 로컬 ClickHouse 인스턴스에 삽입합니다:

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

## 지원되는 데이터 유형 {#supported-data-types}

| ClickHouse                         | Apache Beam                | 지원됨 | 비고                                                                                                                                    |
|------------------------------------|----------------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅      |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅      | `FixedBytes`는 고정 길이 <br/> 바이트 배열을 나타내는 `LogicalType`입니다. <br/> `org.apache.beam.sdk.schemas.logicaltypes`에 위치합니다. |
|                                    | `Schema.TypeName#DECIMAL`  | ❌      |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌      |                                                                                                                                          |

## ClickHouseIO.Write 매개변수 {#clickhouseiowrite-parameters}

다음 설정자 함수를 사용하여 `ClickHouseIO.Write` 구성을 조정할 수 있습니다:

| 매개변수 설정자 함수          | 인수 유형                  | 기본값                        | 설명                                                       |
|-------------------------------|---------------------------|-------------------------------|------------------------------------------------------------|
| `withMaxInsertBlockSize`      | `(long maxInsertBlockSize)` | `1000000`                     | 삽입할 행 블록의 최대 크기.                               |
| `withMaxRetries`              | `(int maxRetries)`        | `5`                           | 실패한 삽입에 대한 최대 재시도 횟수.                      |
| `withMaxCumulativeBackoff`    | `(Duration maxBackoff)`    | `Duration.standardDays(1000)` | 재시도를 위한 최대 누적 백오프 기간.                      |
| `withInitialBackoff`          | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 최초 재시도 전의 초기 백오프 기간.                        |
| `withInsertDistributedSync`   | `(Boolean sync)`          | `true`                        | true일 경우 분산 테이블의 삽입 작업을 동기화합니다.       |
| `withInsertQuorum`            | `(Long quorum)`           | `null`                        | 삽입 작업을 확인하기 위해 필요한 복제본의 수.             |
| `withInsertDeduplicate`       | `(Boolean deduplicate)`   | `true`                        | true일 경우 삽입 작업에 대한 중복 제거가 활성화됩니다.     |
| `withTableSchema`             | `(TableSchema schema)`    | `null`                        | 대상 ClickHouse 테이블의 스키마.                          |

## 한계 사항 {#limitations}

커넥터를 사용할 때 다음 한계 사항을 고려하십시오:
* 현재까지는 Sink 작업만 지원됩니다. 커넥터는 Source 작업을 지원하지 않습니다.
* ClickHouse는 `ReplicatedMergeTree` 또는 `ReplicatedMergeTree` 위에 구축된 `Distributed` 테이블에 삽입할 때 중복 제거를 수행합니다. 복제가 없는 경우, 정상 MergeTree에 삽입을 시도하면 중복이 발생할 수 있습니다. 그러나 각 블록은 원자적으로 삽입되고, 블록 크기는 `ClickHouseIO.Write.withMaxInsertBlockSize(long)`을 사용하여 구성할 수 있습니다. 중복 제거는 삽입된 블록의 체크섬을 사용하여 수행됩니다. 중복 제거에 대한 자세한 정보는 [중복 제거](/guides/developer/deduplication) 및 [중복 제거 삽입 구성](/operations/settings/settings#insert_deduplicate)을 참조하십시오.
* 커넥터는 DDL 문을 수행하지 않으므로, 삽입 전 대상 테이블이 존재해야 합니다.

## 관련 콘텐츠 {#related-content}
* `ClickHouseIO` 클래스 [문서](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html).
* 예제의 `Github` 저장소 [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector).
