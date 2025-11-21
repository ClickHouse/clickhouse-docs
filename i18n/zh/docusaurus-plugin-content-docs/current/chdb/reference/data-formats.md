---
title: '数据格式'
sidebar_label: '数据格式'
slug: /chdb/reference/data-formats
description: 'chDB 的数据格式'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

在数据格式方面，chDB 与 ClickHouse 的功能实现完全兼容（100%）。

输入格式用于解析提供给 `INSERT` 的数据，以及对诸如 `File`、`URL` 或 `S3` 等基于文件的表执行 `SELECT` 时的数据解析。
输出格式用于组织 `SELECT` 的结果，并将数据通过 `INSERT` 写入基于文件的表。
除了 ClickHouse 支持的数据格式之外，chDB 还额外支持：

- 将 `ArrowTable` 作为输出格式，对应的 Python 类型为 `pyarrow.Table`
- 将 `DataFrame` 作为输入和输出格式，对应的 Python 类型为 `pandas.DataFrame`。示例参见 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- 将 `Debug` 作为输出格式使用（是 `CSV` 的别名），但会启用来自 ClickHouse 的详细调试输出。

ClickHouse 所支持的数据格式包括：

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
| 值                                          | ✔  | ✔  |
| 垂直领域                                       | ✗  | ✔  |
| JSON                                       | ✔  | ✔  |
| JSONAsString                               | ✔  | ✗  |
| JSONAsObject                               | ✔  | ✗  |
| JSON 字符串                                   | ✔  | ✔  |
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
| 美观                                         | ✗  | ✔  |
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
| NULL                                       | ✗  | ✔  |
| XML                                        | ✗  | ✔  |
| CapnProto                                  | ✔  | ✔  |
| LineAsString                               | ✔  | ✔  |
| Regexp（正则表达式）                              | ✔  | ✗  |
| RawBLOB                                    | ✔  | ✔  |
| MsgPack                                    | ✔  | ✔  |
| MySQLDump                                  | ✔  | ✗  |
| DWARF                                      | ✔  | ✗  |
| Markdown                                   | ✗  | ✔  |
| 表单                                         | ✔  | ✗  |

有关更多信息和示例，请参见 [ClickHouse 输入和输出数据格式](/interfaces/formats)。