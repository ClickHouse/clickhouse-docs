---
title: データフォーマット
sidebar_label: データフォーマット
slug: /chdb/reference/data-formats
description: chDBのデータフォーマット
keywords: [chdb, data formats]
---

データフォーマットに関して、chDBはClickHouseと100%機能互換です。

入力フォーマットは、`INSERT`および`SELECT`で提供されるデータを解析するために使用されます。ファイルに基づくテーブル（`File`、`URL`、または`S3`など）からデータを取得します。
出力フォーマットは、`SELECT`の結果を整形し、ファイルに基づくテーブルへの`INSERT`を実行するために使用されます。
ClickHouseがサポートするデータフォーマットに加えて、chDBは次のものもサポートします。

- 出力フォーマットとして`ArrowTable`、タイプはPython `pyarrow.Table`
- 入力および出力フォーマットとして`DataFrame`、タイプはPython `pandas.DataFrame`。例については[`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)を参照してください。
- 出力形式として`Debug`（`CSV`のエイリアス）を使用しますが、ClickHouseからのデバッグ詳細出力を有効にします。

ClickHouseからサポートされているデータフォーマットは次のとおりです。

| フォーマット                          | 入力 | 出力 |
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

さらに情報や例については、[ClickHouseの入力および出力データ用フォーマット](/interfaces/formats)を参照してください。
