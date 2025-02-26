---
slug: /interfaces/formats
sidebar_position: 21
sidebar_label: フォーマットをすべて見る...
title: 入力および出力データのフォーマット
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

ClickHouseは、さまざまなフォーマットのデータを受け入れ、返すことができます。入力用にサポートされているフォーマットは、`INSERT`で提供されたデータを解析したり、ファイルバックテーブル（File、URL、HDFSなど）から`SELECT`を実行したり、辞書を読み込んだりするのに使用できます。出力用にサポートされているフォーマットは、`SELECT`の結果を整形したり、ファイルバックテーブルに対して`INSERT`を実行したりするのに使用できます。すべてのフォーマット名は大文字と小文字を区別しません。

サポートされているフォーマットは以下の通りです：

| フォーマット                                                                                        | 入力 | 出力 |
|-----------------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                                       | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                                 | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                                     | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                                     | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                               | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                               | ✔   | ✔     |
| [Template](#format-template)                                                                          | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                                        | ✔   | ✗     |
| [CSV](#csv)                                                                                         | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                                        | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                                        | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                                           | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                                | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                                | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                             | ✗   | ✔     |
| [Values](#data-format-values)                                                                         | ✔   | ✔     |
| [Vertical](#vertical)                                                                                 | ✗   | ✔     |
| [JSON](#json)                                                                                       | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                                         | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                                         | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                                           | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                                           | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                                    | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                                           | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                            | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                            | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                                          | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                              | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                                  | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                            | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                                    | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                            | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                                          | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)                          | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrowwithprogress)                                    | ✗   | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                              | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                            | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes)            | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)                 | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                              | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                                           | ✔   | ✔     |
| [TSKV](#tskv)                                                                                       | ✔   | ✔     |
| [Pretty](#pretty)                                                                                   | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                                  | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                                  | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                              | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                                      | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                                  | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                                  | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                                | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                                          | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                                        | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                                        | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                                    | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                             | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                                | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                                    | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                                        | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                            | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                                        | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                                      | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                                   | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                                          | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                             | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                              | ✔   | ✔     |
| [One](#data-format-one)                                                                              | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                              | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                              | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                                    | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                          | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                                    | ✔   | ✗     |
| [Native](#native)                                                                                    | ✔   | ✔     |
| [Null](#null)                                                                                        | ✗   | ✔     |
| [XML](#xml)                                                                                          | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                              | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                                        | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                                        | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                                  | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                                  | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                              | ✔   | ✗     |
| [DWARF](#dwarf)                                                                                      | ✔   | ✗     |
| [Markdown](#markdown)                                                                                 | ✗   | ✔     |
| [Form](#form)                                                                                        | ✔   | ✗     |

ClickHouseの設定を使用して、いくつかのフォーマット処理パラメータを制御できます。詳細については、[設定](/operations/settings/settings-formats.md)セクションを参照してください。

## TabSeparated {#tabseparated}

[TabSeparated](../interfaces/formats/TabSeparated/TabSeparated.md)を参照してください。

## TabSeparatedRaw {#tabseparatedraw}

[TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)を参照してください。

## TabSeparatedWithNames {#tabseparatedwithnames}

[TabSeparatedWithNames](../interfaces/formats/TabSeparated/TabSeparatedWithNames.md)を参照してください。

## TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

[TabSeparatedWithNamesAndTypes](../interfaces/formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)を参照してください。

## TabSeparatedRawWithNames {#tabseparatedrawwithnames}

[TabSeparatedRawWithNames](../interfaces/formats/TabSeparated/TabSeparatedRawWithNames.md)を参照してください。

## TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

[TabSeparatedRawWithNamesAndTypes](../interfaces/formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)を参照してください。

## Template {#format-template}

[Template](../interfaces/formats/Template)を参照してください。

## TemplateIgnoreSpaces {#templateignorespaces}

[TemplateIgnoreSpaces](../interfaces/formats/Template/TemplateIgnoreSpaces.md)を参照してください。

## TSKV {#tskv}

[TSKV](formats/TabSeparated/TSKV.md)を参照してください。

## CSV {#csv}

[CSV](../interfaces/formats/CSV/CSV.md)を参照してください。

## CSVWithNames {#csvwithnames}

[CSVWithNames](formats/CSV/CSVWithNames.md)を参照してください。

## CSVWithNamesAndTypes {#csvwithnamesandtypes}

[CSVWithNamesAndTypes](formats/CSV/CSVWithNamesAndTypes.md)を参照してください。

## CustomSeparated {#format-customseparated}

[CustomSeparated](formats/CustomSeparated/CustomSeparated.md)を参照してください。

## CustomSeparatedWithNames {#customseparatedwithnames}

[CustomSeparatedWithNames](formats/CustomSeparated/CustomSeparatedWithNames.md)を参照してください。

## CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

[CustomSeparatedWithNamesAndTypes](formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)を参照してください。

## SQLInsert {#sqlinsert}

[SQLInsert](formats/SQLInsert.md)を参照してください。

## JSON {#json}

[JSON](formats/JSON/JSON.md)を参照してください。

## JSONStrings {#jsonstrings}

[JSONStrings](formats/JSON/JSONStrings.md)を参照してください。

## JSONColumns {#jsoncolumns}

[JSONColumns](formats/JSON/JSONColumns.md)を参照してください。

## JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

[JSONColumnsWithMetadata](formats/JSON/JSONColumnsWithMetadata.md)を参照してください。

## JSONAsString {#jsonasstring}

[JSONAsString](formats/JSON/JSONAsString.md)を参照してください。

## JSONAsObject {#jsonasobject}

[JSONAsObject](formats/JSON/JSONAsObject.md)を参照してください。

## JSONCompact {#jsoncompact}

[JSONCompact](formats/JSON/JSONCompact.md)を参照してください。

## JSONCompactStrings {#jsoncompactstrings}

[JSONCompactStrings](formats/JSON/JSONCompactStrings.md)を参照してください。

## JSONCompactColumns {#jsoncompactcolumns}

[JSONCompactColumns](formats/JSON/JSONCompactColumns.md)を参照してください。

## JSONEachRow {#jsoneachrow}

[JSONEachRow](formats/JSON/JSONEachRow.md)を参照してください。

## PrettyJSONEachRow {#prettyjsoneachrow}

[PrettyJSONEachRow](formats/JSON/PrettyJSONEachRow.md)を参照してください。

## JSONStringsEachRow {#jsonstringseachrow}

[JSONStringsEachRow](formats/JSON/JSONStringsEachRow.md)を参照してください。

## JSONCompactEachRow {#jsoncompacteachrow}

[JSONCompactEachRow](formats/JSON/JSONCompactEachRow.md)を参照してください。

## JSONCompactStringsEachRow {#jsoncompactstringseachrow}

[JSONCompactStringsEachRow](formats/JSON/JSONCompactStringsEachRow.md)を参照してください。

## JSONEachRowWithProgress {#jsoneachrowwithprogress}

[JSONEachRowWithProgress](formats/JSON/JSONEachRowWithProgress.md)を参照してください。

## JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

[JSONStringsEachRowWithProgress](formats/JSON/JSONStringsEachRowWithProgress.md)を参照してください。

## JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

[JSONCompactEachRowWithNames](formats/JSON/JSONCompactEachRowWithNames.md)を参照してください。

## JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

[JSONCompactEachRowWithNamesAndTypes](formats/JSON/JSONCompactEachRowWithNamesAndTypes.md)を参照してください。

## JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

`JSONEachRowWithProgress`に似ていますが、`JSONCompactEachRow`フォーマットに似た形で`row`イベントをコンパクトな形式で出力します。

## JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

[JSONCompactStringsEachRowWithNames](formats/JSON/JSONCompactStringsEachRowWithNames.md)を参照してください。

## JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

[JSONCompactStringsEachRowWithNamesAndTypes](formats/JSON/JSONCompactStringsEachRowWithNamesAndTypes.md)を参照してください。

## JSONObjectEachRow {#jsonobjecteachrow}

[JSONObjectEachRow](formats/JSON/JSONObjectEachRow.md)を参照してください。

### JSONフォーマット設定 {#json-formats-settings}

[JSONフォーマット設定](formats/JSON/format-settings.md)を参照してください。

## BSONEachRow {#bsoneachrow}

[BSONEachRow](formats/BSONEachRow.md)を参照してください。

## Native {#native}

[Native](formats/Native.md)を参照してください。

## Null {#null}

[Null](formats/Null.md)を参照してください。

## Pretty {#pretty}

[Pretty](formats/Pretty/Pretty.md)を参照してください。

## PrettyNoEscapes {#prettynoescapes}

[PrettyNoEscapes](formats/Pretty/PrettyNoEscapes.md)を参照してください。

## PrettyMonoBlock {#prettymonoblock}

[PrettyMonoBlock](formats/Pretty/PrettyMonoBlock.md)を参照してください。

## PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

[PrettyNoEscapesMonoBlock](formats/Pretty/PrettyNoEscapesMonoBlock.md)を参照してください。

## PrettyCompact {#prettycompact}

[PrettyCompact](formats/Pretty/PrettyCompact.md)を参照してください。

## PrettyCompactNoEscapes {#prettycompactnoescapes}

[PrettyCompactNoEscapes](formats/Pretty/PrettyCompactNoEscapes.md)を参照してください。

## PrettyCompactMonoBlock {#prettycompactmonoblock}

[PrettyCompactMonoBlock](formats/Pretty/PrettyCompactMonoBlock.md)を参照してください。

## PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

[PrettyCompactNoEscapesMonoBlock](formats/Pretty/PrettyCompactNoEscapesMonoBlock.md)を参照してください。

## PrettySpace {#prettyspace}

[PrettySpace](formats/Pretty/PrettySpace.md)を参照してください。

## PrettySpaceNoEscapes {#prettyspacenoescapes}

[PrettySpaceNoEscapes](formats/Pretty/PrettySpaceNoEscapes)を参照してください。

## PrettySpaceMonoBlock {#prettyspacemonoblock}

[PrettySpaceMonoBlock](formats/Pretty/PrettySpaceMonoBlock.md)を参照してください。

## PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

[PrettySpaceNoEscapesMonoBlock](formats/Pretty/PrettySpaceNoEscapesMonoBlock.md)を参照してください。

## RowBinary {#rowbinary}

[RowBinary](formats/RowBinary/RowBinary.md)を参照してください。

## RowBinaryWithNames {#rowbinarywithnames}

[RowBinaryWithNames](formats/RowBinary/RowBinaryWithNames.md)を参照してください。

## RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

[RowBinaryWithNamesAndTypes](formats/RowBinary/RowBinaryWithNamesAndTypes.md)を参照してください。

## RowBinaryWithDefaults {#rowbinarywithdefaults}

[RowBinaryWithDefaults](formats/RowBinary/RowBinaryWithDefaults.md)を参照してください。

## Values {#data-format-values}

[Values](formats/Values.md)を参照してください。

## Vertical {#vertical}

[Vertical](formats/Vertical.md)を参照してください。

## XML {#xml}

[XML](formats/XML.md)を参照してください。

## CapnProto {#capnproto}

[CapnProto](formats/CapnProto.md)を参照してください。

## Prometheus {#prometheus}

[Prometheus](formats/Prometheus.md)を参照してください。

## Protobuf {#protobuf}

[Protobuf](formats/Protobuf/Protobuf.md)を参照してください。

## ProtobufSingle {#protobufsingle}

[ProtobufSingle](formats/Protobuf/ProtobufSingle.md)を参照してください。

## ProtobufList {#protobuflist}

[ProtobufList](formats/Protobuf/ProtobufList.md)を参照してください。

## Avro {#data-format-avro}

[Avro](formats/Avro/Avro.md)を参照してください。

## AvroConfluent {#data-format-avro-confluent}

[AvroConfluent](formats/Avro/AvroConfluent.md)を参照してください。

## Parquet {#data-format-parquet}

[Parquet](formats/Parquet/Parquet.md)を参照してください。

## ParquetMetadata {#data-format-parquet-metadata}

[ParquetMetadata](formats/Parquet/ParquetMetadata.md)を参照してください。

## Arrow {#data-format-arrow}

[Arrow](formats/Arrow/ArrowStream.md)を参照してください。

## ArrowStream {#data-format-arrow-stream}

[ArrowStream](formats/Arrow/ArrowStream.md)を参照してください。

## ORC {#data-format-orc}

[ORC](formats/ORC.md)を参照してください。

## One {#data-format-one}

[One](formats/One.md)を参照してください。

## Npy {#data-format-npy}

[Npy](formats/Npy.md)を参照してください。

## LineAsString {#lineasstring}

[LineAsString](formats/LineAsString/LineAsString.md)を参照してください。

また、次も参照してください: [LineAsStringWithNames](formats/LineAsString/LineAsStringWithNames.md)、[LineAsStringWithNamesAndTypes](formats/LineAsString/LineAsStringWithNamesAndTypes.md)

## Regexp {#data-format-regexp}

[Regexp](formats/Regexp.md)を参照してください。

## フォーマットスキーマ {#formatschema}

フォーマットスキーマを含むファイル名は、設定`format_schema`によって設定されます。これらのフォーマットの1つである`Cap'n Proto`または`Protobuf`を使用する場合、この設定を設定する必要があります。フォーマットスキーマは、ファイル名とそのファイル内のメッセージタイプ名の組み合わせで、コロンで区切られています。例えば、`schemafile.proto:MessageType`です。このファイルがフォーマットの標準拡張子（例えば、`Protobuf`用の`.proto`）を持っている場合は、省略でき、フォーマットスキーマは`schemafile:MessageType`のようになります。

[クライアント](/interfaces/cli.md)を使用して対話モードでデータを入力または出力する場合、フォーマットスキーマで指定されたファイル名には絶対パスまたは現在のディレクトリに対する相対パスを含めることができます。[バッチモード](/interfaces/cli.md/#batch-mode)でクライアントを使用する場合、スキーマのパスはセキュリティ上の理由から相対的である必要があります。

[HTTPインターフェース](/interfaces/http.md)を介してデータを入力または出力する場合、フォーマットスキーマで指定されたファイル名は、サーバー構成で[format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)で指定されたディレクトリに存在する必要があります。

## エラーのスキップ {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、および`Protobuf`などの一部のフォーマットは、解析エラーが発生した場合に壊れた行をスキップし、次の行の最初から解析を続けることができます。[input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num)および[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio)設定を参照してください。制限事項：
- 解析エラーが発生した場合、`JSONEachRow`は新しい行（またはEOF）までのすべてのデータをスキップしますので、行は`\n`で区切られている必要があります。
- `Template`および`CustomSeparated`は、次の行の開始を見つけるために、最後のカラムの後と行の間の区切り文字を使用するため、少なくとも一方が空でない場合にのみエラーのスキップが機能します。

## RawBLOB {#rawblob}

[RawBLOB](formats/RawBLOB.md)を参照してください。

## Markdown {#markdown}

[Markdown](formats/Markdown.md)を参照してください。

## MsgPack {#msgpack}

[MsgPack](formats/MsgPack.md)を参照してください。

## MySQLDump {#mysqldump}

[MySQLDump](formats/MySQLDump.md)を参照してください。

## DWARF {#dwarf}

[DWARF](formats/DWARF.md)を参照してください。

## Form {#form}

[Form](formats/Form.md)を参照してください。
