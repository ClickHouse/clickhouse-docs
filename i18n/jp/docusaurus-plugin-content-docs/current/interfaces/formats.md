---
description: 'ClickHouse で入出力にサポートされているデータ形式の概要'
sidebar_label: 'すべての形式を表示...'
sidebar_position: 21
slug: /interfaces/formats
title: '入出力データ形式'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 入力および出力データのフォーマット {#formats-for-input-and-output-data}

ClickHouseは、主要なテキストおよびバイナリデータフォーマットのほとんどをサポートしています。これにより、ClickHouseの利点を活用するため、ほぼすべての既存のデータパイプラインに容易に統合できます。


## 入力フォーマット {#input-formats}

入力フォーマットは以下の用途で使用されます:

- `INSERT`文に提供されるデータの解析
- `File`、`URL`、`HDFS`などのファイルベーステーブルからの`SELECT`クエリの実行
- 辞書の読み込み

ClickHouseで効率的にデータを取り込むには、適切な入力フォーマットの選択が重要です。70種類以上のサポートされているフォーマットの中から、最もパフォーマンスの高いオプションを選択することで、挿入速度、CPUおよびメモリ使用量、システム全体の効率に大きな影響を与えることができます。これらの選択を支援するため、フォーマット間での取り込みパフォーマンスをベンチマークし、以下の重要な知見を明らかにしました:

- **[Native](formats/Native.md)フォーマットが最も効率的な入力フォーマットです**。最高の圧縮率、最小のリソース使用量、最小限のサーバー側処理オーバーヘッドを提供します。
- **圧縮は必須です** - LZ4は最小限のCPUコストでデータサイズを削減し、ZSTDは追加のCPU使用量を犠牲にしてより高い圧縮率を提供します。
- **事前ソートの影響は中程度です**。ClickHouseはすでに効率的にソートを行うためです。
- **バッチ処理は効率を大幅に向上させます** - より大きなバッチは挿入オーバーヘッドを削減し、スループットを向上させます。

結果とベストプラクティスの詳細については、完全な[ベンチマーク分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)をお読みください。
完全なテスト結果については、[FastFormats](https://fastformats.clickhouse.com/)オンラインダッシュボードをご覧ください。


## 出力フォーマット {#output-formats}

出力用にサポートされているフォーマットは、以下の用途で使用されます:

- `SELECT`クエリの結果を整形する
- ファイルベースのテーブルへの`INSERT`操作を実行する


## フォーマットの概要 {#formats-overview}

サポートされているフォーマットは次のとおりです:


| 形式                                                                                                         | 入力 | 出力 |
| ---------------------------------------------------------------------------------------------------------- | -- | -- |
| [TabSeparated](./formats/TabSeparated/TabSeparated.md)                                                     | ✔  | ✔  |
| [TabSeparatedRaw](./formats/TabSeparated/TabSeparatedRaw.md)                                               | ✔  | ✔  |
| [TabSeparatedWithNames](./formats/TabSeparated/TabSeparatedWithNames.md)                                   | ✔  | ✔  |
| [TabSeparatedWithNamesAndTypes](./formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)                   | ✔  | ✔  |
| [TabSeparatedRawWithNames](./formats/TabSeparated/TabSeparatedRawWithNames.md)                             | ✔  | ✔  |
| [TabSeparatedRawWithNamesAndTypes](./formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)             | ✔  | ✔  |
| [テンプレート](./formats/Template/Template.md)                                                                   | ✔  | ✔  |
| [TemplateIgnoreSpaces](./formats/Template/TemplateIgnoreSpaces.md)                                         | ✔  | ✗  |
| [CSV](./formats/CSV/CSV.md)                                                                                | ✔  | ✔  |
| [CSVWithNames](./formats/CSV/CSVWithNames.md)                                                              | ✔  | ✔  |
| [CSVWithNamesAndTypes](./formats/CSV/CSVWithNamesAndTypes.md)                                              | ✔  | ✔  |
| [CustomSeparated](./formats/CustomSeparated/CustomSeparated.md)                                            | ✔  | ✔  |
| [CustomSeparatedWithNames](./formats/CustomSeparated/CustomSeparatedWithNames.md)                          | ✔  | ✔  |
| [CustomSeparatedWithNamesAndTypes](./formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)          | ✔  | ✔  |
| [SQLInsert](./formats/SQLInsert.md)                                                                        | ✗  | ✔  |
| [Values](./formats/Values.md)                                                                              | ✔  | ✔  |
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
| [Null](./formats/Null.md)                                                                                  | ✗  | ✔  |
| [Hash](./formats/Hash.md)                                                                                  | ✗  | ✔  |
| [XML](./formats/XML.md)                                                                                    | ✗  | ✔  |
| [CapnProto](./formats/CapnProto.md)                                                                        | ✔  | ✔  |
| [LineAsString](./formats/LineAsString/LineAsString.md)                                                     | ✔  | ✔  |
| [LineAsStringWithNames](./formats/LineAsString/LineAsStringWithNames.md)                                   | ✔  | ✔  |
| [LineAsStringWithNamesAndTypes](./formats/LineAsString/LineAsStringWithNamesAndTypes.md)                   | ✔  | ✔  |
| [Regexp](./formats/Regexp.md)                                                                              | ✔  | ✗  |
| [RawBLOB](./formats/RawBLOB.md)                                                                            | ✔  | ✔  |
| [MsgPack](./formats/MsgPack.md)                                                                            | ✔  | ✔  |
| [MySQLDump](./formats/MySQLDump.md)                                                                        | ✔  | ✗  |
| [DWARF](./formats/DWARF.md)                                                                                | ✔  | ✗  |
| [Markdown](./formats/Markdown.md)                                                                          | ✗  | ✔  |
| [フォーム](./formats/Form.md)                                                                                  | ✔  | ✗  |



ClickHouse の設定を使用して、一部のフォーマット処理パラメータを制御できます。詳しくは、[Settings](/operations/settings/settings-formats.md) セクションを参照してください。



## フォーマットスキーマ {#formatschema}

フォーマットスキーマを含むファイル名は、`format_schema`設定で指定します。
`Cap'n Proto`または`Protobuf`のいずれかのフォーマットを使用する場合、この設定が必須です。
フォーマットスキーマは、ファイル名とそのファイル内のメッセージタイプ名をコロンで区切って組み合わせたものです。
例: `schemafile.proto:MessageType`
ファイルがそのフォーマットの標準的な拡張子を持つ場合(例えば、`Protobuf`の場合は`.proto`)、
拡張子を省略でき、その場合フォーマットスキーマは`schemafile:MessageType`のようになります。

対話モードで[クライアント](/interfaces/cli.md)を介してデータを入出力する場合、フォーマットスキーマで指定するファイル名には、
絶対パスまたはクライアント上の現在のディレクトリからの相対パスを指定できます。
[バッチモード](/interfaces/cli.md/#batch-mode)でクライアントを使用する場合、セキュリティ上の理由により、スキーマへのパスは相対パスである必要があります。

[HTTPインターフェース](/interfaces/http.md)を介してデータを入出力する場合、フォーマットスキーマで指定するファイル名は、
サーバー設定の[format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)で指定されたディレクトリに配置する必要があります。


## エラーのスキップ {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、`Protobuf`などの一部のフォーマットでは、解析エラーが発生した場合に破損した行をスキップし、次の行の先頭から解析を継続できます。[input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num)および[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio)設定を参照してください。
制限事項:

- 解析エラーが発生した場合、`JSONEachRow`は改行(またはEOF)までのすべてのデータをスキップするため、エラーを正確にカウントするには行を`\n`で区切る必要があります。
- `Template`と`CustomSeparated`は、最後の列の後の区切り文字と行間の区切り文字を使用して次の行の先頭を特定するため、エラーのスキップは少なくともいずれか一方が空でない場合にのみ機能します。
