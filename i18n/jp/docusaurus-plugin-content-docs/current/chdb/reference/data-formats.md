---
title: 'データフォーマット'
sidebar_label: 'データフォーマット'
slug: /chdb/reference/data-formats
description: 'chDBのデータフォーマット'
keywords: ['chdb', 'データフォーマット']
doc_type: 'reference'
---

データフォーマットに関して、chDBはClickHouseと100%の機能互換性を持ちます。

入力フォーマットは、`INSERT`や`File`、`URL`、`S3`などのファイルベーステーブルからの`SELECT`に提供されるデータを解析するために使用されます。
出力フォーマットは、`SELECT`の結果を整形し、ファイルベーステーブルへの`INSERT`を実行するために使用されます。
ClickHouseがサポートするデータフォーマットに加えて、chDBは以下もサポートしています:

- 出力フォーマットとしての`ArrowTable`。型はPythonの`pyarrow.Table`です
- 入力および出力フォーマットとしての`DataFrame`。型はPythonの`pandas.DataFrame`です。例については、[`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)を参照してください
- 出力としての`Debug`(`CSV`のエイリアス)。ClickHouseからのデバッグ詳細出力が有効になっています

ClickHouseでサポートされているデータフォーマットは以下の通りです:

| フォーマット                                     | 入力 | 出力 |
| ------------------------------------------ | -- | -- |
| TabSeparated                               | ✔  | ✔  |
| TabSeparatedRaw                            | ✔  | ✔  |
| TabSeparatedWithNames                      | ✔  | ✔  |
| TabSeparatedWithNamesAndTypes              | ✔  | ✔  |
| TabSeparatedRawWithNames                   | ✔  | ✔  |
| TabSeparatedRawWithNamesAndTypes           | ✔  | ✔  |
| テンプレート                                     | ✔  | ✔  |
| TemplateIgnoreSpaces                       | ✔  | ✗  |
| CSV                                        | ✔  | ✔  |
| CSVWithNames                               | ✔  | ✔  |
| CSVWithNamesAndTypes                       | ✔  | ✔  |
| CustomSeparated                            | ✔  | ✔  |
| CustomSeparatedWithNames                   | ✔  | ✔  |
| CustomSeparatedWithNamesAndTypes           | ✔  | ✔  |
| SQLInsert                                  | ✗  | ✔  |
| 値                                          | ✔  | ✔  |
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
| 1                                          | ✔  | ✗  |
| Npy                                        | ✔  | ✔  |
| RowBinary                                  | ✔  | ✔  |
| RowBinaryWithNames                         | ✔  | ✔  |
| RowBinaryWithNamesAndTypes                 | ✔  | ✔  |
| RowBinaryWithDefaults                      | ✔  | ✗  |
| ネイティブ                                      | ✔  | ✔  |
| Null                                       | ✗  | ✔  |
| XML                                        | ✗  | ✔  |
| Cap’n Proto                                | ✔  | ✔  |
| LineAsString                               | ✔  | ✔  |
| 正規表現                                       | ✔  | ✗  |
| RawBLOB                                    | ✔  | ✔  |
| MsgPack                                    | ✔  | ✔  |
| mysqldump                                  | ✔  | ✗  |
| DWARF                                      | ✔  | ✗  |
| Markdown                                   | ✗  | ✔  |
| フォーム                                       | ✔  | ✗  |

詳細と使用例については、[ClickHouseの入出力データフォーマット](/interfaces/formats)を参照してください。