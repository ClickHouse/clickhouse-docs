---
title: '数据格式'
sidebar_label: '数据格式'
slug: /chdb/reference/data-formats
description: 'chDB 的数据格式'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

在数据格式方面，chDB 与 ClickHouse 的功能 100% 兼容。

输入格式用于解析提供给 `INSERT` 的数据，以及对诸如 `File`、`URL` 或 `S3` 等基于文件的表执行 `SELECT` 时读取的数据。
输出格式用于组织 `SELECT` 的结果，并用于向基于文件的表执行 `INSERT` 时进行数据写入。
除了 ClickHouse 支持的数据格式之外，chDB 还额外支持：

- 将 `ArrowTable` 作为输出格式，其类型为 Python `pyarrow.Table`
- 将 `DataFrame` 作为输入和输出格式，其类型为 Python `pandas.DataFrame`。示例参见 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- 将 `Debug` 作为输出格式（是 `CSV` 的别名），但会启用来自 ClickHouse 的详细调试输出。

ClickHouse 支持的数据格式包括：

| 格式                                         | 输入 | 输出 |
| ------------------------------------------ | -- | -- |
| 制表符分隔格式                                    | ✔  | ✔  |
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
| 纵向                                         | ✗  | ✔  |
| JSON                                       | ✔  | ✔  |
| JSONAsString                               | ✔  | ✗  |
| JSONAsObject                               | ✔  | ✗  |
| JSON 字符串                                   | ✔  | ✔  |
| JSONColumns（JSON 列）                        | ✔  | ✔  |
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
| Parquet 元数据                                | ✔  | ✗  |
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
| Cap’n Proto                                | ✔  | ✔  |
| LineAsString                               | ✔  | ✔  |
| 正则表达式                                      | ✔  | ✗  |
| RawBLOB                                    | ✔  | ✔  |
| MessagePack（MsgPack）                       | ✔  | ✔  |
| MySQLDump                                  | ✔  | ✗  |
| DWARF                                      | ✔  | ✗  |
| Markdown                                   | ✗  | ✔  |
| 表格                                         | ✔  | ✗  |

更多信息和示例请参见 [ClickHouse 输入和输出数据格式](/interfaces/formats)。