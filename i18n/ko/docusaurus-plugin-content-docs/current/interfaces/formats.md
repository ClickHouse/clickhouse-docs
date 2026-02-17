---
description: 'ClickHouse에서 입력 및 출력용으로 지원되는 데이터 형식 개요'
sidebar_label: '모든 형식 보기...'
sidebar_position: 21
slug: /interfaces/formats
title: '입력 및 출력 데이터 형식'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 입력 및 출력 데이터 형식 \{#formats-for-input-and-output-data\}

ClickHouse는 대부분의 일반적인 텍스트 및 바이너리 데이터 형식을 지원합니다. 이를 통해 거의 모든 사용 중인 데이터 파이프라인에 쉽게 통합하여 ClickHouse의 이점을 활용할 수 있습니다.

## Input formats \{#input-formats\}

입력 포맷은 다음과 같은 경우에 사용됩니다.

- `INSERT` SQL 문에 제공되는 데이터를 파싱할 때
- `File`, `URL`, `HDFS`와 같은 파일 기반 테이블에 대해 `SELECT` 쿼리를 수행할 때
- 딕셔너리를 읽을 때

적절한 입력 포맷을 선택하는 것은 ClickHouse에서 데이터를 효율적으로 수집하는 데 매우 중요합니다. 70개가 넘는 포맷을 지원하므로, 가장 성능이 좋은 옵션을 선택하는 것은 INSERT 속도, CPU 및 메모리 사용량, 전체 시스템 효율성에 큰 영향을 미칠 수 있습니다. 이러한 선택을 돕기 위해 포맷별 수집 성능을 벤치마크했으며, 이를 통해 다음과 같은 핵심 사항을 확인했습니다.

- **[Native](formats/Native.md) 포맷은 가장 효율적인 입력 포맷입니다.** 최고 수준의 압축률, 가장 낮은 리소스 사용량, 최소한의 서버 측 처리 오버헤드를 제공합니다.
- **압축은 필수적입니다.** LZ4는 CPU 비용을 거의 늘리지 않고 데이터 크기를 줄여 주며, ZSTD는 더 높은 압축률을 제공하는 대신 추가 CPU 사용량이 필요합니다.
- **사전 정렬의 영향은 중간 수준입니다.** ClickHouse 자체가 이미 효율적으로 정렬을 수행하기 때문입니다.
- **배치는 효율성을 크게 향상시킵니다.** 배치 크기가 클수록 INSERT 오버헤드가 줄어들고 처리량이 향상됩니다.

자세한 결과와 모범 사례는 전체 [벤치마크 분석](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)을 참조하십시오. 전체 테스트 결과는 [FastFormats](https://fastformats.clickhouse.com/) 온라인 대시보드에서 확인할 수 있습니다.

## 출력 포맷 \{#output-formats\}

출력용으로 지원되는 포맷은 다음과 같은 용도로 사용됩니다:

- `SELECT` 쿼리 결과를 구성할 때
- 파일 기반 테이블에 대해 `INSERT` 작업을 수행할 때

## 형식 개요 \{#formats-overview\}

지원되는 형식은 다음과 같습니다.

| 형식                                                                                                         | 입력 | 출력 |
| ---------------------------------------------------------------------------------------------------------- | -- | -- |
| [TabSeparated](./formats/TabSeparated/TabSeparated.md)                                                     | ✔  | ✔  |
| [TabSeparatedRaw](./formats/TabSeparated/TabSeparatedRaw.md)                                               | ✔  | ✔  |
| [TabSeparatedWithNames](./formats/TabSeparated/TabSeparatedWithNames.md)                                   | ✔  | ✔  |
| [TabSeparatedWithNamesAndTypes](./formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)                   | ✔  | ✔  |
| [TabSeparatedRawWithNames](./formats/TabSeparated/TabSeparatedRawWithNames.md)                             | ✔  | ✔  |
| [TabSeparatedRawWithNamesAndTypes](./formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)             | ✔  | ✔  |
| [Template](./formats/Template/Template.md)                                                                 | ✔  | ✔  |
| [TemplateIgnoreSpaces](./formats/Template/TemplateIgnoreSpaces.md)                                         | ✔  | ✗  |
| [CSV](./formats/CSV/CSV.md)                                                                                | ✔  | ✔  |
| [CSVWithNames](./formats/CSV/CSVWithNames.md)                                                              | ✔  | ✔  |
| [CSVWithNamesAndTypes](./formats/CSV/CSVWithNamesAndTypes.md)                                              | ✔  | ✔  |
| [CustomSeparated](./formats/CustomSeparated/CustomSeparated.md)                                            | ✔  | ✔  |
| [CustomSeparatedWithNames](./formats/CustomSeparated/CustomSeparatedWithNames.md)                          | ✔  | ✔  |
| [CustomSeparatedWithNamesAndTypes](./formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)          | ✔  | ✔  |
| [SQLInsert](./formats/SQLInsert.md)                                                                        | ✗  | ✔  |
| [Values](./formats/Values.md)                                                                              | ✔  | ✔  |
| [Vertical](./formats/Vertical.md)                                                                          | ✗  | ✔  |
| [JSON](./formats/JSON/JSON.md)                                                                             | ✔  | ✔  |
| [JSONAsString](./formats/JSON/JSONAsString.md)                                                             | ✔  | ✗  |
| [JSONAsObject](./formats/JSON/JSONAsObject.md)                                                             | ✔  | ✗  |
| [JSONStrings](./formats/JSON/JSONStrings.md)                                                               | ✔  | ✔  |
| [JSONColumns](./formats/JSON/JSONColumns.md)                                                               | ✔  | ✔  |
| [JSONColumnsWithMetadata](./formats/JSON/JSONColumnsWithMetadata.md)                                       | ✔  | ✔  |
| [JSONCompact](./formats/JSON/JSONCompact.md)                                                               | ✔  | ✔  |
| [JSONCompactStrings](./formats/JSON/JSONCompactStrings.md)                                                 | ✗  | ✔  |
| [JSONCompactColumns](./formats/JSON/JSONCompactColumns.md)                                                 | ✔  | ✔  |
| [JSONEachRow](./formats/JSON/JSONEachRow.md)                                                               | ✔  | ✔  |
| [PrettyJSONEachRow](./formats/JSON/PrettyJSONEachRow.md)                                                   | ✗  | ✔  |
| [JSONEachRowWithProgress](./formats/JSON/JSONEachRowWithProgress.md)                                       | ✗  | ✔  |
| [JSONStringsEachRow](./formats/JSON/JSONStringsEachRow.md)                                                 | ✔  | ✔  |
| [JSONStringsEachRowWithProgress](./formats/JSON/JSONStringsEachRowWithProgress.md)                         | ✗  | ✔  |
| [JSONCompactEachRow](./formats/JSON/JSONCompactEachRow.md)                                                 | ✔  | ✔  |
| [JSONCompactEachRowWithNames](./formats/JSON/JSONCompactEachRowWithNames.md)                               | ✔  | ✔  |
| [JSONCompactEachRowWithNamesAndTypes](./formats/JSON/JSONCompactEachRowWithNamesAndTypes.md)               | ✔  | ✔  |
| [JSONCompactEachRowWithProgress](./formats/JSON/JSONCompactEachRowWithProgress.md)                         | ✗  | ✔  |
| [JSONCompactStringsEachRow](./formats/JSON/JSONCompactStringsEachRow.md)                                   | ✔  | ✔  |
| [JSONCompactStringsEachRowWithNames](./formats/JSON/JSONCompactStringsEachRowWithNames.md)                 | ✔  | ✔  |
| [JSONCompactStringsEachRowWithNamesAndTypes](./formats/JSON/JSONCompactStringsEachRowWithNamesAndTypes.md) | ✔  | ✔  |
| [JSONCompactStringsEachRowWithProgress](./formats/JSON/JSONCompactStringsEachRowWithProgress.md)           | ✗  | ✔  |
| [JSONObjectEachRow](./formats/JSON/JSONObjectEachRow.md)                                                   | ✔  | ✔  |
| [BSONEachRow](./formats/BSONEachRow.md)                                                                    | ✔  | ✔  |
| [TSKV](./formats/TabSeparated/TSKV.md)                                                                     | ✔  | ✔  |
| [Pretty](./formats/Pretty/Pretty.md)                                                                       | ✗  | ✔  |
| [PrettyNoEscapes](./formats/Pretty/PrettyNoEscapes.md)                                                     | ✗  | ✔  |
| [PrettyMonoBlock](./formats/Pretty/PrettyMonoBlock.md)                                                     | ✗  | ✔  |
| [PrettyNoEscapesMonoBlock](./formats/Pretty/PrettyNoEscapesMonoBlock.md)                                   | ✗  | ✔  |
| [PrettyCompact](./formats/Pretty/PrettyCompact.md)                                                         | ✗  | ✔  |
| [PrettyCompactNoEscapes](./formats/Pretty/PrettyCompactNoEscapes.md)                                       | ✗  | ✔  |
| [PrettyCompactMonoBlock](./formats/Pretty/PrettyCompactMonoBlock.md)                                       | ✗  | ✔  |
| [PrettyCompactNoEscapesMonoBlock](./formats/Pretty/PrettyCompactNoEscapesMonoBlock.md)                     | ✗  | ✔  |
| [PrettySpace](./formats/Pretty/PrettySpace.md)                                                             | ✗  | ✔  |
| [PrettySpaceNoEscapes](./formats/Pretty/PrettySpaceNoEscapes.md)                                           | ✗  | ✔  |
| [PrettySpaceMonoBlock](./formats/Pretty/PrettySpaceMonoBlock.md)                                           | ✗  | ✔  |
| [PrettySpaceNoEscapesMonoBlock](./formats/Pretty/PrettySpaceNoEscapesMonoBlock.md)                         | ✗  | ✔  |
| [Prometheus](./formats/Prometheus.md)                                                                      | ✗  | ✔  |
| [Protobuf](./formats/Protobuf/Protobuf.md)                                                                 | ✔  | ✔  |
| [ProtobufSingle](./formats/Protobuf/ProtobufSingle.md)                                                     | ✔  | ✔  |
| [ProtobufList](./formats/Protobuf/ProtobufList.md)                                                         | ✔  | ✔  |
| [Avro](./formats/Avro/Avro.md)                                                                             | ✔  | ✔  |
| [AvroConfluent](./formats/Avro/AvroConfluent.md)                                                           | ✔  | ✗  |
| [Parquet](./formats/Parquet/Parquet.md)                                                                    | ✔  | ✔  |
| [ParquetMetadata](./formats/Parquet/ParquetMetadata.md)                                                    | ✔  | ✗  |
| [Arrow](./formats/Arrow/Arrow.md)                                                                          | ✔  | ✔  |
| [ArrowStream](./formats/Arrow/ArrowStream.md)                                                              | ✔  | ✔  |
| [ORC](./formats/ORC.md)                                                                                    | ✔  | ✔  |
| [One](./formats/One.md)                                                                                    | ✔  | ✗  |
| [Npy](./formats/Npy.md)                                                                                    | ✔  | ✔  |
| [RowBinary](./formats/RowBinary/RowBinary.md)                                                              | ✔  | ✔  |
| [RowBinaryWithNames](./formats/RowBinary/RowBinaryWithNames.md)                                            | ✔  | ✔  |
| [RowBinaryWithNamesAndTypes](./formats/RowBinary/RowBinaryWithNamesAndTypes.md)                            | ✔  | ✔  |
| [RowBinaryWithDefaults](./formats/RowBinary/RowBinaryWithDefaults.md)                                      | ✔  | ✗  |
| [Native](./formats/Native.md)                                                                              | ✔  | ✔  |
| [Buffers](./formats/Buffers.md)                                                                            | ✔  | ✔  |
| [Null](./formats/Null.md)                                                                                  | ✗  | ✔  |
| [Hash](./formats/Hash.md)                                                                                  | ✗  | ✔  |
| [XML](./formats/XML.md)                                                                                    | ✗  | ✔  |
| [CapnProto](./formats/CapnProto.md)                                                                        | ✔  | ✔  |
| [LineAsString](./formats/LineAsString/LineAsString.md)                                                     | ✔  | ✔  |
| [LineAsStringWithNames](./formats/LineAsString/LineAsStringWithNames.md)                                   | ✔  | ✔  |
| [LineAsStringWithNamesAndTypes](./formats/LineAsString/LineAsStringWithNamesAndTypes.md)                   | ✔  | ✔  |
| [Regexp](./formats/Regexp.md)                                                                              | ✔  | ✗  |
| [RawBLOB](./formats/RawBLOB.md)                                                                            | ✔  | ✔  |
| [MsgPack](./formats/MsgPack.md)                                                                            | ✔  | ✔  |
| [MySQLDump](./formats/MySQLDump.md)                                                                        | ✔  | ✗  |
| [DWARF](./formats/DWARF.md)                                                                                | ✔  | ✗  |
| [Markdown](./formats/Markdown.md)                                                                          | ✗  | ✔  |
| [Form](./formats/Form.md)                                                                                  | ✔  | ✗  |

일부 포맷 처리 매개변수는 ClickHouse 설정을 통해 제어할 수 있습니다. 자세한 내용은 [Settings](/operations/settings/settings-formats.md) 섹션을 참조하십시오.

## Format schema \{#formatschema\}

포맷 스키마를 포함하는 파일 이름은 `format_schema` SETTING으로 설정합니다.
`Cap'n Proto` 및 `Protobuf` 포맷을 사용할 때는 이 SETTING을 반드시 설정해야 합니다.
포맷 스키마는 파일 이름과 이 파일 내 메시지 타입 이름을 콜론(`:`)으로 구분해 결합한 값입니다.
예: `schemafile.proto:MessageType`.
파일이 해당 포맷의 표준 확장자(예: `Protobuf`의 `.proto`)를 갖는 경우 이 확장자는 생략할 수 있으며,
이 경우 포맷 스키마는 `schemafile:MessageType`과 같은 형태가 됩니다.

대화형 모드에서 [client](/interfaces/cli.md)를 통해 데이터를 입력하거나 출력하는 경우,
포맷 스키마에 지정된 파일 이름에는 클라이언트의 현재 디렉터리를 기준으로 한 상대 경로나 절대 경로를 사용할 수 있습니다.
[batch mode](/interfaces/cli.md/#batch-mode)에서 client를 사용하는 경우, 보안상의 이유로 스키마에 대한 경로는 상대 경로여야 합니다.

[HTTP 인터페이스](/interfaces/http)를 통해 데이터를 입력하거나 출력하는 경우,
포맷 스키마에 지정된 파일 이름은 서버 설정에서 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)
로 지정된 디렉터리에 위치해야 합니다.

## 오류 건너뛰기 \{#skippingerrors\}

`CSV`, `TabSeparated`, `TSKV`, `JSONEachRow`, `Template`, `CustomSeparated`, `Protobuf` 같은 일부 포맷은 파싱 오류가 발생했을 때 손상된 행을 건너뛰고, 다음 행의 시작 지점부터 파싱을 계속할 수 있습니다. [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 및
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 설정을 참고하십시오.
제한 사항:

- 파싱 오류가 발생하면 `JSONEachRow`는 새 줄 문자(또는 EOF)까지의 모든 데이터를 건너뛰므로, 오류를 정확히 계수하려면 행이 `\n`으로 구분되어 있어야 합니다.
- `Template` 및 `CustomSeparated`는 다음 행의 시작을 찾기 위해 마지막 컬럼 뒤 구분자와 행 간 구분자를 사용하므로, 둘 중 적어도 하나가 비어 있지 않은 경우에만 오류 건너뛰기가 동작합니다.