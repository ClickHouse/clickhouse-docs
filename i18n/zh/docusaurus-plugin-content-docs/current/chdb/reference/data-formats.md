---
title: '数据格式'
sidebar_label: '数据格式'
slug: /chdb/reference/data-formats
description: 'chDB 的数据格式'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

在数据格式方面，chDB 与 ClickHouse 的功能 100% 兼容。

输入格式用于解析提供给 `INSERT` 的数据，以及在对诸如 `File`、`URL` 或 `S3` 等文件表执行 `SELECT` 时解析数据。
输出格式用于组织 `SELECT` 的结果，并通过 `INSERT` 将数据写入文件表。
除了 ClickHouse 支持的数据格式之外，chDB 还额外支持：

- 将 `ArrowTable` 作为输出格式，其类型为 Python `pyarrow.Table`
- 将 `DataFrame` 作为输入和输出格式，其类型为 Python `pandas.DataFrame`。示例参见 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- 将 `Debug` 作为输出格式（为 `CSV` 的别名），但启用了来自 ClickHouse 的详细调试输出。

来自 ClickHouse 的受支持数据格式包括：

| 格式                                         | 输入 | 输出 |
| ------------------------------------------ | -- | -- |
| TabSeparated                               | ✔  | ✔  |
| TabSeparatedRaw                            | ✔  | ✔  |
| TabSeparatedWithNames                      | ✔  | ✔  |
| TabSeparatedWithNamesAndTypes              | ✔  | ✔  |
| TabSeparatedRawWithNames                   | ✔  | ✔  |
| TabSeparatedRawWithNamesAndTypes           | ✔  | ✔  |
| 模板                                         | ✔  | ✔  |
| TemplateIgnoreSpaces                       | ✔  | ✗  |
| CSV                                        | ✔  | ✔  |
| CSVWithNames                               | ✔  | ✔  |
| CSVWithNamesAndTypes                       | ✔  | ✔  |
| CustomSeparated                            | ✔  | ✔  |
| CustomSeparatedWithNames                   | ✔  | ✔  |
| CustomSeparatedWithNamesAndTypes           | ✔  | ✔  |
| SQLInsert                                  | ✗  | ✔  |
| VALUES 子句                                  | ✔  | ✔  |
| 垂直领域                                       | ✗  | ✔  |
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
| 漂亮                                         | ✗  | ✔  |
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
| 一                                          | ✔  | ✗  |
| Npy                                        | ✔  | ✔  |
| RowBinary                                  | ✔  | ✔  |
| RowBinaryWithNames                         | ✔  | ✔  |
| RowBinaryWithNamesAndTypes                 | ✔  | ✔  |
| RowBinaryWithDefaults                      | ✔  | ✗  |
| 原生                                         | ✔  | ✔  |
| Null                                       | ✗  | ✔  |
| XML                                        | ✗  | ✔  |
| CapnProto                                  | ✔  | ✔  |
| LineAsString                               | ✔  | ✔  |
| 正则表达式                                      | ✔  | ✗  |
| RawBLOB                                    | ✔  | ✔  |
| MsgPack                                    | ✔  | ✔  |
| MySQLDump                                  | ✔  | ✗  |
| DWARF                                      | ✔  | ✗  |
| Markdown                                   | ✗  | ✔  |
| 表单                                         | ✔  | ✗  |

有关更多信息和示例，请参阅 [ClickHouse 输入与输出数据格式](/interfaces/formats)。