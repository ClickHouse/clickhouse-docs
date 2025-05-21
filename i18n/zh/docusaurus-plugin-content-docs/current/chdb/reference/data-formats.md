---
'title': '数据格式'
'sidebar_label': '数据格式'
'slug': '/chdb/reference/data-formats'
'description': 'chDB的数据格式'
'keywords':
- 'chdb'
- 'data formats'
---



当谈到数据格式时，chDB 与 ClickHouse 是 100% 特性兼容的。

输入格式用于解析提供给 `INSERT` 和 `SELECT` 的数据，这些数据来自文件支持的表，例如 `File`、`URL` 或 `S3`。
输出格式用于排列 `SELECT` 的结果，以及执行 `INSERT` 到文件支持的表。
除了 ClickHouse 支持的数据格式外，chDB 还支持：

- `ArrowTable` 作为一种输出格式，类型为 Python `pyarrow.Table`
- `DataFrame` 作为输入和输出格式，类型为 Python `pandas.DataFrame`。有关示例，请参见 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` 作为输出（作为 `CSV` 的别名），但启用了 ClickHouse 的调试详细输出。

ClickHouse 支持的数据格式如下：

| 格式                             | 输入  | 输出  |
|----------------------------------|-------|-------|
| TabSeparated                     | ✔     | ✔     |
| TabSeparatedRaw                  | ✔     | ✔     |
| TabSeparatedWithNames            | ✔     | ✔     |
| TabSeparatedWithNamesAndTypes    | ✔     | ✔     |
| TabSeparatedRawWithNames         | ✔     | ✔     |
| TabSeparatedRawWithNamesAndTypes | ✔     | ✔     |
| Template                         | ✔     | ✔     |
| TemplateIgnoreSpaces             | ✔     | ✗     |
| CSV                              | ✔     | ✔     |
| CSVWithNames                     | ✔     | ✔     |
| CSVWithNamesAndTypes             | ✔     | ✔     |
| CustomSeparated                  | ✔     | ✔     |
| CustomSeparatedWithNames         | ✔     | ✔     |
| CustomSeparatedWithNamesAndTypes | ✔     | ✔     |
| SQLInsert                        | ✗     | ✔     |
| Values                           | ✔     | ✔     |
| Vertical                         | ✗     | ✔     |
| JSON                             | ✔     | ✔     |
| JSONAsString                     | ✔     | ✗     |
| JSONStrings                      | ✔     | ✔     |
| JSONColumns                      | ✔     | ✔     |
| JSONColumnsWithMetadata          | ✔     | ✔     |
| JSONCompact                      | ✔     | ✔     |
| JSONCompactStrings               | ✗     | ✔     |
| JSONCompactColumns               | ✔     | ✔     |
| JSONEachRow                      | ✔     | ✔     |
| PrettyJSONEachRow                | ✗     | ✔     |
| JSONEachRowWithProgress          | ✗     | ✔     |
| JSONStringsEachRow               | ✔     | ✔     |
| JSONStringsEachRowWithProgress   | ✗     | ✔     |
| JSONCompactEachRow               | ✔     | ✔     |
| JSONCompactEachRowWithNames      | ✔     | ✔     |
| JSONCompactEachRowWithNamesAndTypes | ✔   | ✔     |
| JSONCompactStringsEachRow        | ✔     | ✔     |
| JSONCompactStringsEachRowWithNames | ✔   | ✔     |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONObjectEachRow                | ✔     | ✔     |
| BSONEachRow                      | ✔     | ✔     |
| TSKV                             | ✔     | ✔     |
| Pretty                           | ✗     | ✔     |
| PrettyNoEscapes                  | ✗     | ✔     |
| PrettyMonoBlock                  | ✗     | ✔     |
| PrettyNoEscapesMonoBlock         | ✗     | ✔     |
| PrettyCompact                    | ✗     | ✔     |
| PrettyCompactNoEscapes           | ✗     | ✔     |
| PrettyCompactMonoBlock           | ✗     | ✔     |
| PrettyCompactNoEscapesMonoBlock  | ✗     | ✔     |
| PrettySpace                      | ✗     | ✔     |
| PrettySpaceNoEscapes             | ✗     | ✔     |
| PrettySpaceMonoBlock             | ✗     | ✔     |
| PrettySpaceNoEscapesMonoBlock    | ✗     | ✔     |
| Prometheus                       | ✗     | ✔     |
| Protobuf                         | ✔     | ✔     |
| ProtobufSingle                   | ✔     | ✔     |
| Avro                             | ✔     | ✔     |
| AvroConfluent                    | ✔     | ✗     |
| Parquet                          | ✔     | ✔     |
| ParquetMetadata                  | ✔     | ✗     |
| Arrow                            | ✔     | ✔     |
| ArrowStream                      | ✔     | ✔     |
| ORC                              | ✔     | ✔     |
| One                              | ✔     | ✗     |
| RowBinary                        | ✔     | ✔     |
| RowBinaryWithNames               | ✔     | ✔     |
| RowBinaryWithNamesAndTypes       | ✔     | ✔     |
| RowBinaryWithDefaults            | ✔     | ✔     |
| Native                           | ✔     | ✔     |
| Null                             | ✗     | ✔     |
| XML                              | ✗     | ✔     |
| CapnProto                        | ✔     | ✔     |
| LineAsString                     | ✔     | ✔     |
| Regexp                           | ✔     | ✗     |
| RawBLOB                          | ✔     | ✔     |
| MsgPack                          | ✔     | ✔     |
| MySQLDump                        | ✔     | ✗     |
| Markdown                         | ✗     | ✔     |

有关更多信息和示例，请参见 [ClickHouse 输入和输出数据格式](/interfaces/formats)。
