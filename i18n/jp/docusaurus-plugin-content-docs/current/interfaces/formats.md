description: 'ClickHouseでの入力および出力用にサポートされているデータ形式の概要'
sidebar_label: 'すべての形式を表示...'
sidebar_position: 21
slug: /interfaces/formats
title: 'データの入力と出力のための形式'
```

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# データの入力と出力のための形式 {#formats-for-input-and-output-data}

ClickHouseは、既知のテキストおよびバイナリデータ形式のほとんどをサポートしています。これにより、ClickHouseの利点を活用するために、ほぼすべての作業データパイプラインへの簡単な統合が可能になります。

## 入力形式 {#input-formats}

入力形式は以下のために使用されます：
- `INSERT` ステートメントに提供されたデータのパース
- `File`、`URL`、または `HDFS` などのファイルバックテーブルからの `SELECT` クエリの実行
- 辞書の読み込み

適切な入力形式の選択は、ClickHouseにおける効率的なデータ取り込みのために重要です。70を超えるサポートされている形式の中から最適なオプションを選択することは、挿入速度、CPUやメモリの使用量、全体のシステム効率に大きな影響を与える可能性があります。これらの選択をナビゲートするために、形式ごとの取り込み性能をベンチマークし、重要なポイントを明らかにしました：

- **[Native](formats/Native.md) 形式は最も効率的な入力形式です**。最高の圧縮率、最小のリソース使用量、最小のサーバー側処理オーバーヘッドを提供します。
- **圧縮は不可欠です** - LZ4は最小限のCPUコストでデータサイズを削減し、ZSTDは追加のCPU使用量を伴いながらより高い圧縮率を提供します。
- **前ソートは中程度の影響があります**。ClickHouseはすでに効率的にソートを行います。
- **バッチ処理は効率を大幅に改善します** - 大きなバッチは挿入オーバーヘッドを削減し、スループットを改善します。

結果とベストプラクティスについての詳細は、完全な[ベンチマーク分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)をお読みください。完全なテスト結果については、[FastFormats](https://fastformats.clickhouse.com/)オンラインダッシュボードを探索してください。

## 出力形式 {#output-formats}

出力にサポートされている形式は以下に使用されます：
- `SELECT` クエリの結果を整形する
- ファイルバックテーブルへの `INSERT` 操作を実行する

## 形式の概要 {#formats-overview}

サポートされている形式は以下の通りです：

| 形式                                                                                     | 入力 | 出力 |
|------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                            | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                      | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                          | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                          | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                    | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                    | ✔   | ✔     |
| [Template](#format-template)                                                              | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                            | ✔   | ✗     |
| [CSV](#csv)                                                                              | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                            | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                            | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                               | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                    | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                    | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                  | ✗   | ✔     |
| [Values](#data-format-values)                                                            | ✔   | ✔     |
| [Vertical](#vertical)                                                                    | ✗   | ✔     |
| [JSON](#json)                                                                            | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                            | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                            | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                              | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                              | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                         | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                               | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                              | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                  | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                      | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                        | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                              | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)              | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                    | ✗   | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                  | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes)| ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)     | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                  | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                              | ✔   | ✔     |
| [TSKV](#tskv)                                                                            | ✔   | ✔     |
| [Pretty](#pretty)                                                                          | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                      | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                      | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                    | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                          | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                        | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                        | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                      | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                              | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                            | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                            | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                          | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                  | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                      | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                         | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                              | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                  | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                             | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                            | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                         | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                                | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                  | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                    | ✔   | ✔     |
| [One](#data-format-one)                                                                    | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                    | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                    | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                          | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                 | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                           | ✔   | ✗     |
| [Native](#native)                                                                          | ✔   | ✔     |
| [Null](#null)                                                                              | ✗   | ✔     |
| [XML](#xml)                                                                                | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                    | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                              | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                              | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                        | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                        | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                    | ✔   | ✗     |
| [DWARF](#dwarf)                                                                            | ✔   | ✗     |
| [Markdown](#markdown)                                                                      | ✗   | ✔     |
| [Form](#form)                                                                              | ✔   | ✗     |

ClickHouseの設定を使用して、一部の形式処理パラメータを制御できます。詳細は[設定](/operations/settings/settings-formats.md)セクションをお読みください。

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

`JSONEachRowWithProgress` に類似していますが、`JSONCompactEachRow` 形式のように `row` イベントをコンパクトな形式で出力します。

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

[JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)を参照してください。

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

[JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)を参照してください。

### JSONObjectEachRow {#jsonobjecteachrow}

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)を参照してください。

### JSON 形式の設定 {#json-formats-settings}

[JSON 形式の設定](/operations/settings/formats)を参照してください。

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

## 形式スキーマ {#formatschema}

形式スキーマを含むファイル名は設定 `format_schema` によって設定されます。
`Cap'n Proto` および `Protobuf` のいずれかの形式を使用する場合は、この設定を設定する必要があります。
形式スキーマは、ファイル名とこのファイル内のメッセージタイプの名前の組み合わせであり、コロンで区切られています。
例： `schemafile.proto:MessageType`。
ファイルが形式の標準拡張子（例えば、`Protobuf` の場合は `.proto`）を持つ場合は、省略可能で、この場合の形式スキーマは `schemafile:MessageType` となります。

インタラクティブモードで[クライアント](/interfaces/cli.md)を介してデータを入力または出力する場合、形式スキーマに指定されたファイル名は、絶対パスまたはクライアントのカレントディレクトリに対する相対パスを含むことができます。
[バッチモード](/interfaces/cli.md/#batch-mode)でクライアントを使用する場合、セキュリティ上の理由から、スキーマへのパスは相対的である必要があります。

[HTTP インターフェース](/interfaces/http.md)を介してデータを入力または出力する場合、形式スキーマに指定されたファイル名は、サーバー構成の[format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)で指定されたディレクトリに存在する必要があります。

## エラーのスキップ {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、および `Protobuf` のような一部の形式は、パースエラーが発生した場合に壊れた行をスキップし、次の行の最初からパースを続行することができます。[input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) と
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 設定を参照してください。
制限事項：
- パースエラーが発生した場合、`JSONEachRow` は新しい行（またはEOF）までのすべてのデータをスキップするため、行はエラーを正しくカウントするために `\n` で区切る必要があります。
- `Template` および `CustomSeparated` は最終カラムの後と行間の区切り文字を使用して次の行の開始を見つけるため、エラーをスキップすることは少なくともどちらかの区切り文字が空ではない場合にのみ機能します。
