---
'description': 'ClickHouse에서 입력 및 출력에 대해 지원되는 데이터 형식 개요'
'sidebar_label': '모든 형식 보기...'
'sidebar_position': 21
'slug': '/interfaces/formats'
'title': '입력 및 출력 데이터 형식'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 입력 및 출력 데이터 형식 {#formats-for-input-and-output-data}

ClickHouse는 대부분의 알려진 텍스트 및 이진 데이터 형식을 지원합니다. 이는 ClickHouse의 장점을 활용하기 위해 거의 모든 작업 데이터 파이프라인에 쉽게 통합할 수 있도록 합니다.

## 입력 형식 {#input-formats}

입력 형식은 다음과 같은 용도로 사용됩니다:
- `INSERT` 문에 제공된 데이터 파싱
- `File`, `URL`, 또는 `HDFS`와 같은 파일 기반 테이블에서 `SELECT` 쿼리 수행
- 딕셔너리 읽기

적절한 입력 형식을 선택하는 것은 ClickHouse에서 효율적인 데이터 수집에 매우 중요합니다. 70가지 이상의 지원 형식이 있는 상황에서, 가장 성능이 좋은 옵션을 선택하는 것은 삽입 속도, CPU 및 메모리 사용량, 전체 시스템 효율성에 상당한 영향을 미칠 수 있습니다. 이러한 선택을 안내하기 위해, 우리는 형식 간의 수집 성능을 벤치마킹하여 주요 결과를 도출했습니다:

- **[Native](formats/Native.md) 형식은 가장 효율적인 입력 형식**으로, 최고의 압축, 가장 낮은 자원 사용량, 최소한의 서버 측 프로세싱 오버헤드를 제공합니다.
- **압축은 필수적입니다** - LZ4는 최소한의 CPU 비용으로 데이터 크기를 줄이고, ZSTD는 추가 CPU 사용량 비용으로 더 높은 압축을 제공합니다.
- **프리 정렬은 중간 정도의 영향을 미칩니다**, ClickHouse는 이미 효율적으로 정렬하기 때문입니다.
- **배치 처리는 효율성을 크게 향상시킵니다** - 더 큰 배치는 삽입 오버헤드를 줄이고 처리량을 향상시킵니다.

결과 및 모범 사례에 대한 깊이 있는 분석을 보려면, 전체 [벤치마크 분석](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)을 읽어보세요. 전체 테스트 결과는 [FastFormats](https://fastformats.clickhouse.com/) 온라인 대시보드를 탐색하십시오.

## 출력 형식 {#output-formats}

출력에 지원되는 형식은 다음과 같은 용도로 사용됩니다:
- `SELECT` 쿼리의 결과 정렬
- 파일 기반 테이블에 `INSERT` 작업 수행

## 형식 개요 {#formats-overview}

지원되는 형식은 다음과 같습니다:

| 형식                                                                                                     | 입력 | 출력 |
|----------------------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](./formats/TabSeparated/TabSeparated.md)                                                 | ✔   | ✔     |
| [TabSeparatedRaw](./formats/TabSeparated/TabSeparatedRaw.md)                                           | ✔   | ✔     |
| [TabSeparatedWithNames](./formats/TabSeparated/TabSeparatedWithNames.md)                               | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](./formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)               | ✔   | ✔     |
| [TabSeparatedRawWithNames](./formats/TabSeparated/TabSeparatedRawWithNames.md)                         | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](./formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)         | ✔   | ✔     |
| [Template](./formats/Template/Template.md)                                                             | ✔   | ✔     |
| [TemplateIgnoreSpaces](./formats/Template/TemplateIgnoreSpaces.md)                                     | ✔   | ✗     |
| [CSV](./formats/CSV/CSV.md)                                                                            | ✔   | ✔     |
| [CSVWithNames](./formats/CSV/CSVWithNames.md)                                                          | ✔   | ✔     |
| [CSVWithNamesAndTypes](./formats/CSV/CSVWithNamesAndTypes.md)                                          | ✔   | ✔     |
| [CustomSeparated](./formats/CustomSeparated/CustomSeparated.md)                                         | ✔   | ✔     |
| [CustomSeparatedWithNames](./formats/CustomSeparated/CustomSeparatedWithNames.md)                      | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](./formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)      | ✔   | ✔     |
| [SQLInsert](./formats/SQLInsert.md)                                                                    | ✗   | ✔     |
| [Values](./formats/Values.md)                                                                          | ✔   | ✔     |
| [Vertical](./formats/Vertical.md)                                                                      | ✗   | ✔     |
| [JSON](./formats/JSON/JSON.md)                                                                         | ✔   | ✔     |
| [JSONAsString](./formats/JSON/JSONAsString.md)                                                         | ✔   | ✗     |
| [JSONAsObject](./formats/JSON/JSONAsObject.md)                                                         | ✔   | ✗     |
| [JSONStrings](./formats/JSON/JSONStrings.md)                                                           | ✔   | ✔     |
| [JSONColumns](./formats/JSON/JSONColumns.md)                                                           | ✔   | ✔     |
| [JSONColumnsWithMetadata](./formats/JSON/JSONColumnsWithMetadata.md)                                   | ✔   | ✔     |
| [JSONCompact](./formats/JSON/JSONCompact.md)                                                           | ✔   | ✔     |
| [JSONCompactStrings](./formats/JSON/JSONCompactStrings.md)                                             | ✗   | ✔     |
| [JSONCompactColumns](./formats/JSON/JSONCompactColumns.md)                                             | ✔   | ✔     |
| [JSONEachRow](./formats/JSON/JSONEachRow.md)                                                           | ✔   | ✔     |
| [PrettyJSONEachRow](./formats/JSON/PrettyJSONEachRow.md)                                             | ✗   | ✔     |
| [JSONEachRowWithProgress](./formats/JSON/JSONEachRowWithProgress.md)                                   | ✗   | ✔     |
| [JSONStringsEachRow](./formats/JSON/JSONStringsEachRow.md)                                             | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](./formats/JSON/JSONStringsEachRowWithProgress.md)                     | ✗   | ✔     |
| [JSONCompactEachRow](./formats/JSON/JSONCompactEachRow.md)                                             | ✔   | ✔     |
| [JSONCompactEachRowWithNames](./formats/JSON/JSONCompactEachRowWithNames.md)                           | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](./formats/JSON/JSONCompactEachRowWithNamesAndTypes.md)           | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](./formats/JSON/JSONCompactEachRowWithProgress.md)                     | ✗   | ✔     |
| [JSONCompactStringsEachRow](./formats/JSON/JSONCompactStringsEachRow.md)                               | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](./formats/JSON/JSONCompactStringsEachRowWithNames.md)             | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](./formats/JSON/JSONCompactStringsEachRowWithNamesAndTypes.md) | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](./formats/JSON/JSONCompactStringsEachRowWithProgress.md)       | ✗   | ✔     |
| [JSONObjectEachRow](./formats/JSON/JSONObjectEachRow.md)                                               | ✔   | ✔     |
| [BSONEachRow](./formats/BSONEachRow.md)                                                                | ✔   | ✔     |
| [TSKV](./formats/TabSeparated/TSKV.md)                                                                 | ✔   | ✔     |
| [Pretty](./formats/Pretty/Pretty.md)                                                                   | ✗   | ✔     |
| [PrettyNoEscapes](./formats/Pretty/PrettyNoEscapes.md)                                               | ✗   | ✔     |
| [PrettyMonoBlock](./formats/Pretty/PrettyMonoBlock.md)                                               | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](./formats/Pretty/PrettyNoEscapesMonoBlock.md)                             | ✗   | ✔     |
| [PrettyCompact](./formats/Pretty/PrettyCompact.md)                                                     | ✗   | ✔     |
| [PrettyCompactNoEscapes](./formats/Pretty/PrettyCompactNoEscapes.md)                                 | ✗   | ✔     |
| [PrettyCompactMonoBlock](./formats/Pretty/PrettyCompactMonoBlock.md)                                   | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](./formats/Pretty/PrettyCompactNoEscapesMonoBlock.md)               | ✗   | ✔     |
| [PrettySpace](./formats/Pretty/PrettySpace.md)                                                        | ✗   | ✔     |
| [PrettySpaceNoEscapes](./formats/Pretty/PrettySpaceNoEscapes.md)                                     | ✗   | ✔     |
| [PrettySpaceMonoBlock](./formats/Pretty/PrettySpaceMonoBlock.md)                                     | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](./formats/Pretty/PrettySpaceNoEscapesMonoBlock.md)                   | ✗   | ✔     |
| [Prometheus](./formats/Prometheus.md)                                                                  | ✗   | ✔     |
| [Protobuf](./formats/Protobuf/Protobuf.md)                                                             | ✔   | ✔     |
| [ProtobufSingle](./formats/Protobuf/ProtobufSingle.md)                                               | ✔   | ✔     |
| [ProtobufList](./formats/Protobuf/ProtobufList.md)                                                   | ✔   | ✔     |
| [Avro](./formats/Avro/Avro.md)                                                                         | ✔   | ✔     |
| [AvroConfluent](./formats/Avro/AvroConfluent.md)                                                     | ✔   | ✗     |
| [Parquet](./formats/Parquet/Parquet.md)                                                                | ✔   | ✔     |
| [ParquetMetadata](./formats/Parquet/ParquetMetadata.md)                                              | ✔   | ✗     |
| [Arrow](./formats/Arrow/Arrow.md)                                                                      | ✔   | ✔     |
| [ArrowStream](./formats/Arrow/ArrowStream.md)                                                          | ✔   | ✔     |
| [ORC](./formats/ORC.md)                                                                                | ✔   | ✔     |
| [One](./formats/One.md)                                                                                | ✔   | ✗     |
| [Npy](./formats/Npy.md)                                                                                 | ✔   | ✔     |
| [RowBinary](./formats/RowBinary/RowBinary.md)                                                          | ✔   | ✔     |
| [RowBinaryWithNames](./formats/RowBinary/RowBinaryWithNames.md)                                       | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](./formats/RowBinary/RowBinaryWithNamesAndTypes.md)                       | ✔   | ✔     |
| [RowBinaryWithDefaults](./formats/RowBinary/RowBinaryWithDefaults.md)                                  | ✔   | ✗     |
| [Native](./formats/Native.md)                                                                           | ✔   | ✔     |
| [Null](./formats/Null.md)                                                                               | ✗   | ✔     |
| [Hash](./formats/Hash.md)                                                                               | ✗   | ✔     |
| [XML](./formats/XML.md)                                                                                 | ✗   | ✔     |
| [CapnProto](./formats/CapnProto.md)                                                                    | ✔   | ✔     |
| [LineAsString](./formats/LineAsString/LineAsString.md)                                               | ✔   | ✔     |
| [LineAsStringWithNames](./formats/LineAsString/LineAsStringWithNames.md)                             | ✔   | ✔     |
| [LineAsStringWithNamesAndTypes](./formats/LineAsString/LineAsStringWithNamesAndTypes.md)             | ✔   | ✔     |
| [Regexp](./formats/Regexp.md)                                                                          | ✔   | ✗     |
| [RawBLOB](./formats/RawBLOB.md)                                                                        | ✔   | ✔     |
| [MsgPack](./formats/MsgPack.md)                                                                        | ✔   | ✔     |
| [MySQLDump](./formats/MySQLDump.md)                                                                    | ✔   | ✗     |
| [DWARF](./formats/DWARF.md)                                                                            | ✔   | ✗     |
| [Markdown](./formats/Markdown.md)                                                                      | ✗   | ✔     |
| [Form](./formats/Form.md)                                                                                | ✔   | ✗     |

ClickHouse 설정을 통해 일부 형식 처리 매개변수를 제어할 수 있습니다. 자세한 내용은 [설정](/operations/settings/settings-formats.md) 섹션을 읽어보세요.

## 형식 스키마 {#formatschema}

형식 스키마를 포함하는 파일 이름은 `format_schema` 설정에 의해 설정됩니다.
`Cap'n Proto` 및 `Protobuf` 중 하나의 형식이 사용될 때 이 설정을 설정하는 것이 필요합니다.
형식 스키마는 파일 이름과 이 파일의 메시지 유형 이름의 조합으로, 콜론(:)으로 구분됩니다,
예를 들어 `schemafile.proto:MessageType`.
파일이 형식에 대한 표준 확장자를 가진 경우(예: `Protobuf`의 경우 `.proto`), 생략할 수 있으며 이 경우 형식 스키마는 `schemafile:MessageType`으로 보입니다.

클라이언트를 통해 [클라이언트](/interfaces/cli.md)에서 대화형 모드로 데이터를 입력하거나 출력하는 경우, 형식 스키마에 지정된 파일 이름은 절대 경로 또는 클라이언트의 현재 디렉토리에 상대적인 경로를 포함할 수 있습니다.
[배치 모드](/interfaces/cli.md/#batch-mode)에서 클라이언트를 사용하는 경우, 보안상의 이유로 스키마에 대한 경로는 상대적이어야 합니다.

[HTTP 인터페이스](/interfaces/http.md)를 통해 데이터를 입력하거나 출력하는 경우, 형식 스키마에 지정된 파일 이름은 서버 구성에서 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)에서 지정된 디렉토리에 위치해야 합니다.

## 오류 건너뛰기 {#skippingerrors}

`CSV`, `TabSeparated`, `TSKV`, `JSONEachRow`, `Template`, `CustomSeparated`, 및 `Protobuf`와 같은 일부 형식은 파싱 오류가 발생할 경우 손상된 행을 건너뛰고 다음 행의 시작에서 파싱을 계속할 수 있습니다. [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 및 [input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 설정을 확인하세요.
제한 사항:
- 파싱 오류가 발생할 경우 `JSONEachRow`는 새 줄(또는 EOF)까지의 모든 데이터를 건너뛰므로 행이 오류를 정확하게 계산하려면 `\n`으로 구분되어야 합니다.
- `Template` 및 `CustomSeparated`는 마지막 컬럼 이후의 구분자와 행 사이의 구분자를 사용하여 다음 행의 시작을 찾기 때문에, 적어도 하나가 비어있지 않을 때만 오류 건너뛰기가 작동합니다.
