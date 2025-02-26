---
title: データフォーマット
sidebar_label: データフォーマット
slug: /chdb/reference/data-formats
description: chDBのデータフォーマット
keywords: [chdb, データフォーマット]
---

データフォーマットに関して、chDBはClickHouseと100%機能互換です。

入力フォーマットは、`INSERT`や`SELECT`に提供されるデータを解析するために使用されます。ファイルバックテーブル（`File`、`URL`、または`S3`など）からのデータです。
出力フォーマットは、`SELECT`の結果を整形し、ファイルバックテーブルへの`INSERT`を行うために使用されます。
ClickHouseがサポートするデータフォーマットに加えて、chDBは以下もサポートしています：

- `ArrowTable`を出力フォーマットとして、型はPythonの`pyarrow.Table`
- `DataFrame`を入力および出力フォーマットとして、型はPythonの`pandas.DataFrame`。詳細は[`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)を参照してください。
- `Debug`を出力フォーマット（`CSV`のエイリアス）として、ClickHouseからのデバッグ詳細出力が有効になっています。

ClickHouseがサポートするデータフォーマットは次の通りです：

| フォーマット                     | 入力 | 出力 |
|---------------------------------|-------|--------|
| TabSeparated                    | ✔     | ✔      |
| TabSeparatedRaw                 | ✔     | ✔      |
| TabSeparatedWithNames           | ✔     | ✔      |
| TabSeparatedWithNamesAndTypes   | ✔     | ✔      |
| TabSeparatedRawWithNames        | ✔     | ✔      |
| TabSeparatedRawWithNamesAndTypes| ✔     | ✔      |
| Template                        | ✔     | ✔      |
| TemplateIgnoreSpaces            | ✔     | ✗      |
| CSV                             | ✔     | ✔      |
| CSVWithNames                    | ✔     | ✔      |
| CSVWithNamesAndTypes            | ✔     | ✔      |
| CustomSeparated                 | ✔     | ✔      |
| CustomSeparatedWithNames        | ✔     | ✔      |
| CustomSeparatedWithNamesAndTypes| ✔     | ✔      |
| SQLInsert                       | ✗     | ✔      |
| Values                          | ✔     | ✔      |
| Vertical                        | ✗     | ✔      |
| JSON                            | ✔     | ✔      |
| JSONAsString                    | ✔     | ✗      |
| JSONStrings                     | ✔     | ✔      |
| JSONColumns                     | ✔     | ✔      |
| JSONColumnsWithMetadata         | ✔     | ✔      |
| JSONCompact                     | ✔     | ✔      |
| JSONCompactStrings              | ✗     | ✔      |
| JSONCompactColumns              | ✔     | ✔      |
| JSONEachRow                     | ✔     | ✔      |
| PrettyJSONEachRow               | ✗     | ✔      |
| JSONEachRowWithProgress         | ✗     | ✔      |
| JSONStringsEachRow              | ✔     | ✔      |
| JSONStringsEachRowWithProgress  | ✗     | ✔      |
| JSONCompactEachRow              | ✔     | ✔      |
| JSONCompactEachRowWithNames     | ✔     | ✔      |
| JSONCompactEachRowWithNamesAndTypes | ✔  | ✔      |
| JSONCompactStringsEachRow       | ✔     | ✔      |
| JSONCompactStringsEachRowWithNames | ✔  | ✔      |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONObjectEachRow               | ✔     | ✔      |
| BSONEachRow                     | ✔     | ✔      |
| TSKV                            | ✔     | ✔      |
| Pretty                          | ✗     | ✔      |
| PrettyNoEscapes                 | ✗     | ✔      |
| PrettyMonoBlock                 | ✗     | ✔      |
| PrettyNoEscapesMonoBlock        | ✗     | ✔      |
| PrettyCompact                   | ✗     | ✔      |
| PrettyCompactNoEscapes          | ✗     | ✔      |
| PrettyCompactMonoBlock          | ✗     | ✔      |
| PrettyCompactNoEscapesMonoBlock | ✗     | ✔      |
| PrettySpace                     | ✗     | ✔      |
| PrettySpaceNoEscapes            | ✗     | ✔      |
| PrettySpaceMonoBlock            | ✗     | ✔      |
| PrettySpaceNoEscapesMonoBlock   | ✗     | ✔      |
| Prometheus                      | ✗     | ✔      |
| Protobuf                        | ✔     | ✔      |
| ProtobufSingle                  | ✔     | ✔      |
| Avro                            | ✔     | ✔      |
| AvroConfluent                   | ✔     | ✗      |
| Parquet                         | ✔     | ✔      |
| ParquetMetadata                 | ✔     | ✗      |
| Arrow                           | ✔     | ✔      |
| ArrowStream                     | ✔     | ✔      |
| ORC                             | ✔     | ✔      |
| One                             | ✔     | ✗      |
| RowBinary                       | ✔     | ✔      |
| RowBinaryWithNames              | ✔     | ✔      |
| RowBinaryWithNamesAndTypes      | ✔     | ✔      |
| RowBinaryWithDefaults           | ✔     | ✔      |
| Native                          | ✔     | ✔      |
| Null                            | ✗     | ✔      |
| XML                             | ✗     | ✔      |
| CapnProto                       | ✔     | ✔      |
| LineAsString                    | ✔     | ✔      |
| Regexp                          | ✔     | ✗      |
| RawBLOB                         | ✔     | ✔      |
| MsgPack                         | ✔     | ✔      |
| MySQLDump                       | ✔     | ✗      |
| Markdown                        | ✗     | ✔      |

さらなる情報や例については、[ClickHouseの入力および出力データフォーマット](/interfaces/formats)を参照してください。
