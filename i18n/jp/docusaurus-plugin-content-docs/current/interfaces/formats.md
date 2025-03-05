---
slug: /interfaces/formats
sidebar_position: 21
sidebar_label: フォーマットのすべてを見る...
title: 入力および出力データのフォーマット
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 入力および出力データのフォーマット {#formats-for-input-and-output-data}

ClickHouseは、ほとんどの既知のテキストおよびバイナリデータフォーマットをサポートしています。これにより、ClickHouseのメリットを活用するための作業データパイプラインへの統合が容易になります。

## 入力フォーマット {#input-formats}

入力フォーマットは以下の目的で使用されます：
- `INSERT`ステートメントに提供されるデータの解析
- `File`、`URL`、または`HDFS`のようなファイルバックテーブルからの`SELECT`クエリの実行
- 辞書の読み込み

適切な入力フォーマットを選択することは、ClickHouseにおける効率的なデータ取り込みにとって重要です。70以上のサポートされているフォーマットの中で、最もパフォーマンスの良いオプションを選択することは、挿入速度、CPUやメモリの使用、全体的なシステム効率に大きな影響を与えることがあります。これらの選択肢をナビゲートするために、フォーマット間の取り込みパフォーマンスをベンチマークし、主要なポイントを明らかにしました：

- **[Native](formats/Native.md)フォーマットは最も効率的な入力フォーマット**であり、最高の圧縮、最低のリソース使用量、および最小のサーバー側処理オーバーヘッドを提供します。
- **圧縮は重要です** - LZ4はデータサイズを最小限のCPUコストで削減しますが、ZSTDは追加のCPU使用量の代償に高い圧縮を提供します。
- **事前ソートは中程度の影響があります** - ClickHouseはすでに効率的にソートを行います。
- **バッチ処理は効率を大幅に改善します** - 大きなバッチは挿入オーバーヘッドを減少させ、スループットを改善します。

結果とベストプラクティスの詳細については、フルな[ベンチマーク分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)をお読みください。完全なテスト結果は、[FastFormats](https://fastformats.clickhouse.com/)オンラインダッシュボードをチェックしてください。

## 出力フォーマット {#output-formats}

出力にサポートされているフォーマットは以下の目的で使用されます：
- `SELECT`クエリの結果を整理する
- ファイルバックテーブルへの`INSERT`操作の実行

## フォーマットの概要 {#formats-overview}

サポートされているフォーマットは以下の通りです：

| フォーマット                                                                                      | 入力 | 出力 |
|---------------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                                     | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                               | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                                   | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                                   | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                             | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                             | ✔   | ✔     |
| [Template](#format-template)                                                                        | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                                      | ✔   | ✗     |
| [CSV](#csv)                                                                                       | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                                     | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                                     | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                                        | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                             | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                             | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                           | ✗   | ✔     |
| [Values](#data-format-values)                                                                     | ✔   | ✔     |
| [Vertical](#vertical)                                                                               | ✗   | ✔     |
| [JSON](#json)                                                                                     | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                                     | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                                     | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                                       | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                                       | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                                  | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                                       | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                          | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                          | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                                       | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                           | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                               | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                         | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                                 | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                         | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                                       | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)                       | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                             | ✗   | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                           | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                         | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes)         | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)              | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                           | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                                       | ✔   | ✔     |
| [TSKV](#tskv)                                                                                     | ✔   | ✔     |
| [Pretty](#pretty)                                                                                 | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                               | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                               | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                            | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                                   | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                                 | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                                | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                               | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                                       | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                                    | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                                    | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                                  | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                         | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                             | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                                 | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                                     | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                         | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                                      | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                                   | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                                  | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                                       | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                          | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                           | ✔   | ✔     |
| [One](#data-format-one)                                                                           | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                           | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                           | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                                 | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                         | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                                   | ✔   | ✗     |
| [Native](#native)                                                                                 | ✔   | ✔     |
| [Null](#null)                                                                                     | ✗   | ✔     |
| [XML](#xml)                                                                                       | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                           | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                                     | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                                     | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                               | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                               | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                           | ✔   | ✗     |
| [DWARF](#dwarf)                                                                                   | ✔   | ✗     |
| [Markdown](#markdown)                                                                               | ✗   | ✔     |
| [Form](#form)                                                                                     | ✔   | ✗     |


ClickHouseの設定を使用して、いくつかのフォーマット処理パラメータを制御できます。詳細については、[設定](/operations/settings/settings-formats.md)セクションをお読みください。

### TabSeparated {#tabseparated}

[TabSeparated](/interfaces/formats/TabSeparated)を参照してください。

### TabSeparatedRaw {#tabseparatedraw}

[TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)を参照してください。

### TabSeparatedWithNames {#tabseparatedwithnames}

[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)を参照してください。

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

[TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)を参照してください。

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

[TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)を参照してください。

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

[TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)を参照してください。

### Template {#format-template}

[Template](/interfaces/formats/Template)を参照してください。

### TemplateIgnoreSpaces {#templateignorespaces}

[TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)を参照してください。

### TSKV {#tskv}

[TSKV](/interfaces/formats/TSKV)を参照してください。

### CSV {#csv}

[CSV](../interfaces/formats/CSV)を参照してください。

### CSVWithNames {#csvwithnames}

[CSVWithNames](/interfaces/formats/CSVWithNames)を参照してください。

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

[CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)を参照してください。

### CustomSeparated {#format-customseparated}

[CustomSeparated](/interfaces/formats/CustomSeparated)を参照してください。

### CustomSeparatedWithNames {#customseparatedwithnames}

[CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)を参照してください。

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

[CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)を参照してください。

### SQLInsert {#sqlinsert}

[SQLInsert](/interfaces/formats/SQLInsert)を参照してください。

### JSON {#json}

[JSON](/interfaces/formats/JSON)を参照してください。

### JSONStrings {#jsonstrings}

[JSONStrings](/interfaces/formats/JSONStrings)を参照してください。

### JSONColumns {#jsoncolumns}

[JSONColumns](/interfaces/formats/JSONColumns)を参照してください。

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

[JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)を参照してください。

### JSONAsString {#jsonasstring}

[JSONAsString](/interfaces/formats/JSONAsString)を参照してください。

### JSONAsObject {#jsonasobject}

[JSONAsObject](/interfaces/formats/JSONAsObject)を参照してください。

### JSONCompact {#jsoncompact}

[JSONCompact](/interfaces/formats/JSONCompact)を参照してください。

### JSONCompactStrings {#jsoncompactstrings}

[JSONCompactStrings](/interfaces/formats/JSONCompactStrings)を参照してください。

### JSONCompactColumns {#jsoncompactcolumns}

[JSONCompactColumns](/interfaces/formats/JSONCompactColumns)を参照してください。

### JSONEachRow {#jsoneachrow}

[JSONEachRow](/interfaces/formats/JSONEachRow)を参照してください。

### PrettyJSONEachRow {#prettyjsoneachrow}

[PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)を参照してください。

### JSONStringsEachRow {#jsonstringseachrow}

[JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)を参照してください。

### JSONCompactEachRow {#jsoncompacteachrow}

[JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)を参照してください。

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

[JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)を参照してください。

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

[JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)を参照してください。

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

[JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)を参照してください。

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

[JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)を参照してください。

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

[JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)を参照してください。

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

`JSONEachRowWithProgress`に似ていますが、`JSONCompactEachRow`フォーマットのようにコンパクトな形式で`row`イベントを出力します。

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

[JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)を参照してください。

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

[JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)を参照してください。

### JSONObjectEachRow {#jsonobjecteachrow}

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)を参照してください。

### JSON フォーマット設定 {#json-formats-settings}

[JSON フォーマット設定](/operations/settings/formats)を参照してください。

### BSONEachRow {#bsoneachrow}

[BSONEachRow](/interfaces/formats/BSONEachRow)を参照してください。

### Native {#native}

[Native](/interfaces/formats/Native)を参照してください。

### Null {#null}

[Null](/interfaces/formats/Null)を参照してください。

### Pretty {#pretty}

[Pretty](/interfaces/formats/Pretty)を参照してください。

### PrettyNoEscapes {#prettynoescapes}

[PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)を参照してください。

### PrettyMonoBlock {#prettymonoblock}

[PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)を参照してください。

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

[PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)を参照してください。

### PrettyCompact {#prettycompact}

[PrettyCompact](/interfaces/formats/PrettyCompact)を参照してください。

### PrettyCompactNoEscapes {#prettycompactnoescapes}

[PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)を参照してください。

### PrettyCompactMonoBlock {#prettycompactmonoblock}

[PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)を参照してください。

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

[PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesMonoBlock)を参照してください。

### PrettySpace {#prettyspace}

[PrettySpace](/interfaces/formats/PrettySpace)を参照してください。

### PrettySpaceNoEscapes {#prettyspacenoescapes}

[PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)を参照してください。

### PrettySpaceMonoBlock {#prettyspacemonoblock}

[PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)を参照してください。

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

[PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)を参照してください。

### RowBinary {#rowbinary}

[RowBinary](/interfaces/formats/RowBinary)を参照してください。

### RowBinaryWithNames {#rowbinarywithnames}

[RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)を参照してください。

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

[RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)を参照してください。

### RowBinaryWithDefaults {#rowbinarywithdefaults}

[RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)を参照してください。

### Values {#data-format-values}

[Values](/interfaces/formats/Values)を参照してください。

### Vertical {#vertical}

[Vertical](/interfaces/formats/Vertical)を参照してください。

### XML {#xml}

[XML](/interfaces/formats/XML)を参照してください。

### CapnProto {#capnproto}

[CapnProto](/interfaces/formats/CapnProto)を参照してください。

### Prometheus {#prometheus}

[Prometheus](/interfaces/formats/Prometheus)を参照してください。

### Protobuf {#protobuf}

[Protobuf](/interfaces/formats/Protobuf)を参照してください。

### ProtobufSingle {#protobufsingle}

[ProtobufSingle](/interfaces/formats/ProtobufSingle)を参照してください。

### ProtobufList {#protobuflist}

[ProtobufList](/interfaces/formats/ProtobufList)を参照してください。

### Avro {#data-format-avro}

[Avro](/interfaces/formats/Avro)を参照してください。

### AvroConfluent {#data-format-avro-confluent}

[AvroConfluent](/interfaces/formats/AvroConfluent)を参照してください。

### Parquet {#data-format-parquet}

[Parquet](/interfaces/formats/Parquet)を参照してください。

### ParquetMetadata {#data-format-parquet-metadata}

[ParquetMetadata](/interfaces/formats/ParquetMetadata)を参照してください。

### Arrow {#data-format-arrow}

[Arrow](/interfaces/formats/ArrowStream)を参照してください。

### ArrowStream {#data-format-arrow-stream}

[ArrowStream](/interfaces/formats/ArrowStream)を参照してください。

### ORC {#data-format-orc}

[ORC](/interfaces/formats/ORC)を参照してください。

### One {#data-format-one}

[One](/interfaces/formats/One)を参照してください。

### Npy {#data-format-npy}

[Npy](/interfaces/formats/Npy)を参照してください。

### LineAsString {#lineasstring}

次を参照してください：
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

[Regexp](/interfaces/formats/Regexp)を参照してください。

### RawBLOB {#rawblob}

[RawBLOB](/interfaces/formats/RawBLOB)を参照してください。

### Markdown {#markdown}

[Markdown](/interfaces/formats/Markdown)を参照してください。

### MsgPack {#msgpack}

[MsgPack](/interfaces/formats/MsgPack)を参照してください。

### MySQLDump {#mysqldump}

[MySQLDump](/interfaces/formats/MySQLDump)を参照してください。

### DWARF {#dwarf}

[Dwarf](/interfaces/formats/DWARF)を参照してください。

### Form {#form}

[Form](/interfaces/formats/Form)を参照してください。

## フォーマットスキーマ {#formatschema}

フォーマットスキーマを含むファイル名は設定`format_schema`によって設定されます。
この設定は、`Cap'n Proto`および`Protobuf`のフォーマットのいずれかが使用されるときに設定する必要があります。
フォーマットスキーマは、ファイル名とこのファイル内のメッセージタイプの名前の組み合わせであり、コロンで区切られています。
例：`schemafile.proto:MessageType`。
ファイルがそのフォーマットの標準拡張子を持っている場合（例えば、`Protobuf`の場合は`.proto`）、省略することができ、この場合のフォーマットスキーマは`schemafile:MessageType`のようになります。

[client](/interfaces/cli.md)を使ってインタラクティブモードでデータを入力または出力する場合、フォーマットスキーマに指定されたファイル名には、絶対パスまたはクライアントの現在のディレクトリに対する相対パスを含めることができます。
[バッチモード](/interfaces/cli.md/#batch-mode)でクライアントを使用する場合、セキュリティ上の理由からスキーマへのパスは相対でなければなりません。

[HTTPインターフェース](/interfaces/http.md)を介してデータを入力または出力する場合、フォーマットスキーマに指定されたファイル名は、サーバー設定の[format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)で指定されたディレクトリ内に存在する必要があります。

## エラーをスキップする {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、`Protobuf`などの一部のフォーマットは、解析エラーが発生した場合に壊れた行をスキップし、次の行の先頭から解析を続行できます。[input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num)および[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio)設定を参照してください。
制限事項：
- 解析エラーが発生した場合、`JSONEachRow`は新しい行（またはEOF）までのすべてのデータをスキップするため、行は正しくエラーをカウントするために` \n `で区切られる必要があります。
- `Template`と`CustomSeparated`は次の行の始まりを見つけるために最後のカラムの後と行間で区切り文字を使用するため、少なくともどちらかが空でない場合にのみエラーをスキップできます。
