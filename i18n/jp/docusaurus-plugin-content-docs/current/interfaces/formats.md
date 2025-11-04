---
'description': 'ClickHouseにおける入力と出力のサポートされているデータフォーマットの概要'
'sidebar_label': 'すべてのフォーマットを見る...'
'sidebar_position': 21
'slug': '/interfaces/formats'
'title': '入力と出力データのフォーマット'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 入力と出力データのフォーマット {#formats-for-input-and-output-data}

ClickHouseは、既知のほとんどのテキストおよびバイナリデータフォーマットをサポートしています。これにより、ClickHouseの利点を活かすためにほぼすべての作業データパイプラインへの簡単な統合が可能になります。

## 入力フォーマット {#input-formats}

入力フォーマットは次の用途に使用されます：
- `INSERT`ステートメントに提供されたデータを解析するため
- `File`、`URL`、または`HDFS`のようなファイルバックテーブルからの`SELECT`クエリを実行するため
- 辞書を読み取るため

適切な入力フォーマットを選択することは、ClickHouseにおける効率的なデータイングestionにとって非常に重要です。70を超えるサポートフォーマットの中から、最もパフォーマンスの高いオプションを選ぶことで、挿入速度、CPUとメモリの使用量、全体的なシステムの効率に大きな影響を与えることができます。これらの選択肢をナビゲートするために、私たちはフォーマット間でのイングestionパフォーマンスをベンチマークし、重要な知見を明らかにしました：

- **[Native](formats/Native.md)フォーマットは最も効率的な入力フォーマットです**。最高の圧縮、最低のリソース使用量、最小のサーバー側処理オーバーヘッドを提供します。
- **圧縮は必須です** - LZ4は最小限のCPUコストでデータサイズを削減し、ZSTDは追加のCPU使用量の代償により高圧縮を提供します。
- **事前ソートには中程度の影響があります**。ClickHouseはすでに効率的にソートを行います。
- **バッチ処理は効率を大幅に改善します** - 大きなバッチは挿入オーバーヘッドを削減し、スループットを改善します。

結果とベストプラクティスについての詳細は、完全な[ベンチマーク分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)をお読みください。完全なテスト結果については、[FastFormats](https://fastformats.clickhouse.com/)オンラインダッシュボードを探検してください。

## 出力フォーマット {#output-formats}

出力にサポートされているフォーマットは次の用途に使用されます：
- `SELECT`クエリの結果を整理するため
- ファイルバックテーブルに対する`INSERT`操作を実行するため

## フォーマットの概要 {#formats-overview}

サポートされているフォーマットは以下の通りです：

| フォーマット                                                                                   | 入力 | 出力 |
|---------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                            | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                      | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                          | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                          | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                    | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                    | ✔   | ✔     |
| [Template](#format-template)                                                             | ✔   | ✔     |
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
| [JSONCompact](#jsoncompact)                                                              | ✔   | ✔     |
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
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes) | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)     | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                  | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                              | ✔   | ✔     |
| [TSKV](#tskv)                                                                            | ✔   | ✔     |
| [Pretty](#pretty)                                                                        | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                      | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                      | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                    | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                          | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                        | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                        | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                     | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                              | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                            | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                            | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                         | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                 | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                    | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                        | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                            | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                             | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                          | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                         | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                                | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                 | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                  | ✔   | ✔     |
| [One](#data-format-one)                                                                  | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                  | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                  | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                        | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                          | ✔   | ✗     |
| [Native](#native)                                                                        | ✔   | ✔     |
| [Null](#null)                                                                            | ✗   | ✔     |
| [Hash](#hash)                                                                            | ✗   | ✔     |
| [XML](#xml)                                                                              | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                  | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                            | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                            | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                      | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                      | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                  | ✔   | ✗     |
| [DWARF](#dwarf)                                                                          | ✔   | ✗     |
| [Markdown](#markdown)                                                                    | ✗   | ✔     |
| [Form](#form)                                                                            | ✔   | ✗     |

ClickHouse設定でフォーマット処理パラメーターの一部を制御できます。詳細については、[設定](/operations/settings/settings-formats.md)セクションをお読みください。

### TabSeparated {#tabseparated}

See [TabSeparated](/interfaces/formats/TabSeparated)

### TabSeparatedRaw {#tabseparatedraw}

See [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)

### TabSeparatedWithNames {#tabseparatedwithnames}

See [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

See [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

See [TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

See [TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)

### Template {#format-template}

See [Template](/interfaces/formats/Template)

### TemplateIgnoreSpaces {#templateignorespaces}

See [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)

### TSKV {#tskv}

See [TSKV](/interfaces/formats/TSKV)

### CSV {#csv}

See [CSV](../interfaces/formats/CSV)

### CSVWithNames {#csvwithnames}

See [CSVWithNames](/interfaces/formats/CSVWithNames)

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

See [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)

### CustomSeparated {#format-customseparated}

See [CustomSeparated](/interfaces/formats/CustomSeparated)

### CustomSeparatedWithNames {#customseparatedwithnames}

See [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

See [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

### SQLInsert {#sqlinsert}

See [SQLInsert](/interfaces/formats/SQLInsert)

### JSON {#json}

See [JSON](/interfaces/formats/JSON)

### JSONStrings {#jsonstrings}

See [JSONStrings](/interfaces/formats/JSONStrings)

### JSONColumns {#jsoncolumns}

See [JSONColumns](/interfaces/formats/JSONColumns)

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

See [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)

### JSONAsString {#jsonasstring}

See [JSONAsString](/interfaces/formats/JSONAsString)

### JSONAsObject {#jsonasobject}

See [JSONAsObject](/interfaces/formats/JSONAsObject)

### JSONCompact {#jsoncompact}

See [JSONCompact](/interfaces/formats/JSONCompact)

### JSONCompactStrings {#jsoncompactstrings}

See [JSONCompactStrings](/interfaces/formats/JSONCompactStrings)

### JSONCompactColumns {#jsoncompactcolumns}

See [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)

### JSONEachRow {#jsoneachrow}

See [JSONEachRow](/interfaces/formats/JSONEachRow)

### PrettyJSONEachRow {#prettyjsoneachrow}

See [PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)

### JSONStringsEachRow {#jsonstringseachrow}

See [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)

### JSONCompactEachRow {#jsoncompacteachrow}

See [JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

See [JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

See [JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

See [JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

See [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

See [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

`JSONEachRowWithProgress`と似ていますが、`JSONCompactEachRow`フォーマットのように、`row`イベントをコンパクトな形式で出力します。

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

See [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

See [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)

### JSONObjectEachRow {#jsonobjecteachrow}

See [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)

### JSONフォーマットの設定 {#json-formats-settings}

See [JSON Format Settings](/operations/settings/formats)

### BSONEachRow {#bsoneachrow}

See [BSONEachRow](/interfaces/formats/BSONEachRow)

### Native {#native}

See [Native](/interfaces/formats/Native)

### Null {#null}

See [Null](/interfaces/formats/Null)

### Hash {#hash}

See [Hash](/interfaces/formats/Hash)

### Pretty {#pretty}

See [Pretty](/interfaces/formats/Pretty)

### PrettyNoEscapes {#prettynoescapes}

See [PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)

### PrettyMonoBlock {#prettymonoblock}

See [PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

See [PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)

### PrettyCompact {#prettycompact}

See [PrettyCompact](/interfaces/formats/PrettyCompact)

### PrettyCompactNoEscapes {#prettycompactnoescapes}

See [PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)

### PrettyCompactMonoBlock {#prettycompactmonoblock}

See [PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

See [PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesMonoBlock)

### PrettySpace {#prettyspace}

See [PrettySpace](/interfaces/formats/PrettySpace)

### PrettySpaceNoEscapes {#prettyspacenoescapes}

See [PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)

### PrettySpaceMonoBlock {#prettyspacemonoblock}

See [PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

See [PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)

### RowBinary {#rowbinary}

See [RowBinary](/interfaces/formats/RowBinary)

### RowBinaryWithNames {#rowbinarywithnames}

See [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

See [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)

### RowBinaryWithDefaults {#rowbinarywithdefaults}

See [RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)

### Values {#data-format-values}

See [Values](/interfaces/formats/Values)

### Vertical {#vertical}

See [Vertical](/interfaces/formats/Vertical)

### XML {#xml}

See [XML](/interfaces/formats/XML)

### CapnProto {#capnproto}

See [CapnProto](/interfaces/formats/CapnProto)

### Prometheus {#prometheus}

See [Prometheus](/interfaces/formats/Prometheus)

### Protobuf {#protobuf}

See [Protobuf](/interfaces/formats/Protobuf)

### ProtobufSingle {#protobufsingle}

See [ProtobufSingle](/interfaces/formats/ProtobufSingle)

### ProtobufList {#protobuflist}

See [ProtobufList](/interfaces/formats/ProtobufList)

### Avro {#data-format-avro}

See [Avro](/interfaces/formats/Avro)

### AvroConfluent {#data-format-avro-confluent}

See [AvroConfluent](/interfaces/formats/AvroConfluent)

### Parquet {#data-format-parquet}

See [Parquet](/interfaces/formats/Parquet)

### ParquetMetadata {#data-format-parquet-metadata}

See [ParquetMetadata](/interfaces/formats/ParquetMetadata)

### Arrow {#data-format-arrow}

See [Arrow](/interfaces/formats/ArrowStream)

### ArrowStream {#data-format-arrow-stream}

See [ArrowStream](/interfaces/formats/ArrowStream)

### ORC {#data-format-orc}

See [ORC](/interfaces/formats/ORC)

### One {#data-format-one}

See [One](/interfaces/formats/One)

### Npy {#data-format-npy}

See [Npy](/interfaces/formats/Npy)

### LineAsString {#lineasstring}

See:
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

See [Regexp](/interfaces/formats/Regexp)

### RawBLOB {#rawblob}

See [RawBLOB](/interfaces/formats/RawBLOB)

### Markdown {#markdown}

See [Markdown](/interfaces/formats/Markdown)

### MsgPack {#msgpack}

See [MsgPack](/interfaces/formats/MsgPack)

### MySQLDump {#mysqldump}

See [MySQLDump](/interfaces/formats/MySQLDump)

### DWARF {#dwarf}

See [Dwarf](/interfaces/formats/DWARF)

### Form {#form}

See [Form](/interfaces/formats/Form)

## フォーマットスキーマ {#formatschema}

フォーマットスキーマを含むファイル名は、`format_schema`設定によって設定されます。
これは、`Cap'n Proto`および`Protobuf`のいずれかのフォーマットが使用される場合には、この設定を設定することが必須です。
フォーマットスキーマは、ファイル名とそのファイル内のメッセージタイプの名前の組み合わせで、コロンで区切られています。
例えば、`schemafile.proto:MessageType`のようにします。
ファイルがフォーマットの標準拡張子を持っている場合（例えば、`Protobuf`の場合は`.proto`）、省略することができ、
この場合、フォーマットスキーマは`schemafile:MessageType`のようになります。

[クライアント](/interfaces/cli.md)を介してインタラクティブモードでデータを入力または出力する場合、フォーマットスキーマで指定されたファイル名には絶対パスまたはクライアントの現在のディレクトリに対する相対パスを含めることができます。
[バッチモード](/interfaces/cli.md/#batch-mode)でクライアントを使用する場合、セキュリティ上の理由から、スキーマへのパスは相対である必要があります。

[HTTPインターフェース](/interfaces/http.md)を介してデータを入力または出力する場合、フォーマットスキーマで指定されたファイル名は、
サーバー設定の[format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)で指定されたディレクトリにある必要があります。

## エラーをスキップする {#skippingerrors}

`CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated`、`Protobuf`などのいくつかのフォーマットは、解析エラーが発生した場合に壊れた行をスキップし、次の行の最初から解析を続行できます。 [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num)および[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio)設定を参照してください。
制限：
- 解析エラーの場合、`JSONEachRow`は新しい行（またはEOF）までの全データをスキップするため、行はエラーを正しくカウントするために`\n`で区切られている必要があります。
- `Template`および`CustomSeparated`は、次の行の開始を見つけるために最後の列の後の区切り記号と行の間の区切り記号を使用するため、いずれかが空でない場合にのみエラーをスキップできます。
