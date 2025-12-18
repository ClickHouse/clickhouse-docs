---
description: 'ClickHouse における入力および出力でサポートされているデータ形式の概要'
sidebar_label: 'すべての形式を表示...'
sidebar_position: 21
slug: /interfaces/formats
title: 'データ入出力形式'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 入力および出力データのフォーマット {#formats-for-input-and-output-data}

ClickHouse は、一般的なテキスト形式およびバイナリ形式のほとんどをサポートしています。これにより、運用中のほぼあらゆるデータパイプラインに容易に統合し、ClickHouse の利点を活用できます。

## 入力フォーマット {#input-formats}

入力フォーマットは次の用途に使用されます:
- `INSERT` ステートメントに渡されたデータのパース
- `File`、`URL`、`HDFS` などのファイルをバックエンドに持つテーブルに対する `SELECT` クエリの実行
- 辞書の読み取り

ClickHouse にデータを効率的にインジェストするには、適切な入力フォーマットの選択が重要です。70 を超えるフォーマットがサポートされているため、どのフォーマットを選ぶかによって、挿入速度、CPU・メモリ使用量、およびシステム全体の効率が大きく変わります。これらの選択肢を検討しやすくするため、フォーマットごとにインジェスト性能をベンチマークし、次のような主なポイントが明らかになりました:

- **[Native](formats/Native.md) フォーマットは最も効率的な入力フォーマットであり**、最高の圧縮率、最小のリソース使用量、およびサーバー側処理のオーバーヘッドの最小化を実現します。
- **圧縮は不可欠です** - LZ4 は CPU コストをほとんど増やさずにデータサイズを削減し、ZSTD は追加の CPU 使用量と引き換えにより高い圧縮率を提供します。
- **事前のソートの影響は中程度であり**、ClickHouse 自体がすでに効率的なソートを行います。
- **バッチ処理は効率を大きく改善します** - バッチサイズを大きくすることで挿入時のオーバーヘッドが減り、スループットが向上します。

結果とベストプラクティスの詳細については、
完全版の [ベンチマーク分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) を参照してください。
テスト結果の全体像は、[FastFormats](https://fastformats.clickhouse.com/) のオンラインダッシュボードで確認できます。

## 出力形式 {#output-formats}

出力としてサポートされている形式は、次の用途に使用されます:

- `SELECT` クエリ結果の整形
- ファイルベースのテーブルへの `INSERT` 操作の実行

## フォーマットの概要 {#formats-overview}

サポートされているフォーマットは以下のとおりです。

| フォーマット                                                                                                     | 入力 | 出力 |
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
| [値](./formats/Values.md)                                                                                   | ✔  | ✔  |
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
| [正規表現（Regexp）](./formats/Regexp.md)                                                                        | ✔  | ✗  |
| [RawBLOB](./formats/RawBLOB.md)                                                                            | ✔  | ✔  |
| [MsgPack](./formats/MsgPack.md)                                                                            | ✔  | ✔  |
| [MySQLDump](./formats/MySQLDump.md)                                                                        | ✔  | ✗  |
| [DWARF](./formats/DWARF.md)                                                                                | ✔  | ✗  |
| [Markdown](./formats/Markdown.md)                                                                          | ✗  | ✔  |
| [フォーム](./formats/Form.md)                                                                                  | ✔  | ✗  |

ClickHouse の設定を使用して、一部のフォーマット処理パラメータを制御できます。詳細については、[Settings](/operations/settings/settings-formats.md) セクションを参照してください。

## フォーマットスキーマ {#formatschema}

フォーマットスキーマを格納したファイル名は、設定 `format_schema` で指定します。
この設定は、`Cap'n Proto` または `Protobuf` のいずれかのフォーマットを使用する場合に必須です。
フォーマットスキーマは、コロンで区切られた「ファイル名」と、そのファイル内のメッセージ型の名前の組み合わせです。
例: `schemafile.proto:MessageType`。
ファイルがそのフォーマットの標準拡張子（たとえば `Protobuf` の `.proto`）を持つ場合は、拡張子を省略でき、その場合フォーマットスキーマは `schemafile:MessageType` のようになります。

[クライアント](/interfaces/cli.md)を対話モードで使用してデータを入力または出力する場合、フォーマットスキーマに指定するファイル名には、
クライアント側のカレントディレクトリからの相対パス、または絶対パスを指定できます。
クライアントを[バッチモード](/interfaces/cli.md/#batch-mode)で使用する場合、セキュリティ上の理由から、スキーマへのパスは相対パスでなければなりません。

[HTTP インターフェイス](/interfaces/http.md)経由でデータを入力または出力する場合、フォーマットスキーマで指定するファイル名は、
サーバー設定の [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path) で指定されたディレクトリ内に存在している必要があります。

## エラーのスキップ {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、`Protobuf` などの一部の形式では、パースエラーが発生した場合に不正な行をスキップし、次の行の先頭からパースを継続できます。詳細は [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) および
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 設定を参照してください。
制限事項:

- パースエラーが発生した場合、`JSONEachRow` は改行（または EOF）までのすべてのデータをスキップするため、エラーを正しくカウントするには、行を `\n` で区切る必要があります。
- `Template` と `CustomSeparated` は、次の行の先頭を見つけるために、最後の列の後の区切り文字と行間の区切り文字を使用するため、少なくとも一方が空でない場合にのみエラーをスキップできます。