---
title: '数据格式'
sidebar_label: '数据格式'
slug: /chdb/reference/data-formats
description: 'chDB 的数据格式'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

在数据格式方面，chDB 与 ClickHouse 的特性 100% 兼容。

输入格式用于解析提供给 `INSERT` 的数据，以及从诸如 `File`、`URL` 或 `S3` 这类基于文件的表中执行 `SELECT` 时的数据。
输出格式用于组织 `SELECT` 的结果，并用于向基于文件的表执行 `INSERT` 操作。
除了 ClickHouse 支持的数据格式之外，chDB 还支持：

- 将 `ArrowTable` 作为输出格式，其类型为 Python `pyarrow.Table`
- 将 `DataFrame` 作为输入和输出格式，其类型为 Python `pandas.DataFrame`。示例参见 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- 将 `Debug` 作为输出格式（是 `CSV` 的别名），但启用了来自 ClickHouse 的详细调试输出。

ClickHouse 所支持的数据格式包括：

| 格式                                         | 输入 | 输出 |
| ------------------------------------------ | -- | -- |
| 制表符分隔                                      | ✔  | ✔  |
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
| 自定义分隔（包含名称和类型）                             | ✔  | ✔  |
| SQLInsert                                  | ✗  | ✔  |
| 参数                                         | ✔  | ✔  |
| 垂直                                         | ✗  | ✔  |
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
| 美化                                         | ✗  | ✔  |
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

有关更多信息和示例，请参阅 [ClickHouse 输入和输出数据格式](/interfaces/formats)。