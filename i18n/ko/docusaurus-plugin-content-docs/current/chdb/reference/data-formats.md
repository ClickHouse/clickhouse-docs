---
title: '데이터 형식'
sidebar_label: '데이터 형식'
slug: /chdb/reference/data-formats
description: 'chDB의 데이터 형식'
keywords: ['chdb', '데이터 형식']
doc_type: 'reference'
---

데이터 형식과 관련하여 chDB는 ClickHouse와 100% 기능 호환됩니다.

입력 형식은 `File`, `URL`, `S3`와 같은 파일 기반 테이블에 대해 `INSERT` 및 `SELECT`에 제공되는 데이터를 파싱하는 데 사용됩니다.
출력 형식은 `SELECT` 결과를 구성하고 파일 기반 테이블에 `INSERT`를 수행하는 데 사용됩니다.
ClickHouse가 지원하는 데이터 형식 외에도 chDB는 다음을 추가로 지원합니다.

- 출력 형식으로 `ArrowTable`을 지원하며, 타입은 Python `pyarrow.Table`입니다.
- 입출력 형식으로 `DataFrame`을 지원하며, 타입은 Python `pandas.DataFrame`입니다. 예시는 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)를 참고하십시오.
- 출력 형식으로 `Debug`를 지원하며(`CSV`의 별칭), ClickHouse에서 디버그 상세 출력이 활성화됩니다.

ClickHouse에서 지원되는 데이터 형식은 다음과 같습니다.

| 형식                                         | 입력 | 출력 |
| ------------------------------------------ | -- | -- |
| TabSeparated                               | ✔  | ✔  |
| TabSeparatedRaw                            | ✔  | ✔  |
| TabSeparatedWithNames                      | ✔  | ✔  |
| TabSeparatedWithNamesAndTypes              | ✔  | ✔  |
| TabSeparatedRawWithNames                   | ✔  | ✔  |
| TabSeparatedRawWithNamesAndTypes           | ✔  | ✔  |
| Template                                   | ✔  | ✔  |
| TemplateIgnoreSpaces                       | ✔  | ✗  |
| CSV                                        | ✔  | ✔  |
| CSVWithNames                               | ✔  | ✔  |
| CSVWithNamesAndTypes                       | ✔  | ✔  |
| CustomSeparated                            | ✔  | ✔  |
| CustomSeparatedWithNames                   | ✔  | ✔  |
| CustomSeparatedWithNamesAndTypes           | ✔  | ✔  |
| SQLInsert                                  | ✗  | ✔  |
| Values                                     | ✔  | ✔  |
| Vertical                                   | ✗  | ✔  |
| JSON                                       | ✔  | ✔  |
| JSONAsString                               | ✔  | ✗  |
| JSONAsObject                               | ✔  | ✗  |
| JSONStrings                                | ✔  | ✔  |
| JSONColumns                                | ✔  | ✔  |
| JSONColumnsWithMetadata                    | ✔  | ✔  |
| JSONCompact                                | ✔  | ✔  |
| JSONCompactStrings                         | ✗  | ✔  |
| JSONCompactColumns                         | ✔  | ✔  |
| JSONEachRow                                | ✔  | ✔  |
| PrettyJSONEachRow                          | ✗  | ✔  |
| JSONEachRowWithProgress                    | ✗  | ✔  |
| JSONStringsEachRow                         | ✔  | ✔  |
| JSONStringsEachRowWithProgress             | ✗  | ✔  |
| JSONCompactEachRow                         | ✔  | ✔  |
| JSONCompactEachRowWithNames                | ✔  | ✔  |
| JSONCompactEachRowWithNamesAndTypes        | ✔  | ✔  |
| JSONCompactEachRowWithProgress             | ✗  | ✔  |
| JSONCompactStringsEachRow                  | ✔  | ✔  |
| JSONCompactStringsEachRowWithNames         | ✔  | ✔  |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔  | ✔  |
| JSONCompactStringsEachRowWithProgress      | ✗  | ✔  |
| JSONObjectEachRow                          | ✔  | ✔  |
| BSONEachRow                                | ✔  | ✔  |
| TSKV                                       | ✔  | ✔  |
| Pretty                                     | ✗  | ✔  |
| PrettyNoEscapes                            | ✗  | ✔  |
| PrettyMonoBlock                            | ✗  | ✔  |
| PrettyNoEscapesMonoBlock                   | ✗  | ✔  |
| PrettyCompact                              | ✗  | ✔  |
| PrettyCompactNoEscapes                     | ✗  | ✔  |
| PrettyCompactMonoBlock                     | ✗  | ✔  |
| PrettyCompactNoEscapesMonoBlock            | ✗  | ✔  |
| PrettySpace                                | ✗  | ✔  |
| PrettySpaceNoEscapes                       | ✗  | ✔  |
| PrettySpaceMonoBlock                       | ✗  | ✔  |
| PrettySpaceNoEscapesMonoBlock              | ✗  | ✔  |
| Prometheus                                 | ✗  | ✔  |
| Protobuf                                   | ✔  | ✔  |
| ProtobufSingle                             | ✔  | ✔  |
| ProtobufList                               | ✔  | ✔  |
| Avro                                       | ✔  | ✔  |
| AvroConfluent                              | ✔  | ✗  |
| Parquet                                    | ✔  | ✔  |
| ParquetMetadata                            | ✔  | ✗  |
| Arrow                                      | ✔  | ✔  |
| ArrowStream                                | ✔  | ✔  |
| ORC                                        | ✔  | ✔  |
| One                                        | ✔  | ✗  |
| Npy                                        | ✔  | ✔  |
| RowBinary                                  | ✔  | ✔  |
| RowBinaryWithNames                         | ✔  | ✔  |
| RowBinaryWithNamesAndTypes                 | ✔  | ✔  |
| RowBinaryWithDefaults                      | ✔  | ✗  |
| Native                                     | ✔  | ✔  |
| Null                                       | ✗  | ✔  |
| XML                                        | ✗  | ✔  |
| CapnProto                                  | ✔  | ✔  |
| LineAsString                               | ✔  | ✔  |
| Regexp                                     | ✔  | ✗  |
| RawBLOB                                    | ✔  | ✔  |
| MsgPack                                    | ✔  | ✔  |
| MySQLDump                                  | ✔  | ✗  |
| DWARF                                      | ✔  | ✗  |
| Markdown                                   | ✗  | ✔  |
| Form(양식)                                   | ✔  | ✗  |

자세한 정보와 예시는 [입출력 데이터용 ClickHouse 형식](/interfaces/formats)을 참조하십시오.