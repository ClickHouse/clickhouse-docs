---
'description': '关于 ClickHouse 支持的输入和输出数据格式的概述'
'sidebar_label': '查看所有格式...'
'sidebar_position': 21
'slug': '/interfaces/formats'
'title': '输入和输出数据的格式'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 输入和输出数据格式 {#formats-for-input-and-output-data}

ClickHouse 支持大多数已知的文本和二进制数据格式。这使得几乎可以轻松地集成到任何工作数据管道中，利用 ClickHouse 的优势。

## 输入格式 {#input-formats}

输入格式用于：
- 解析提供给 `INSERT` 语句的数据
- 从文件支持的表（如 `File`、`URL` 或 `HDFS`）执行 `SELECT` 查询
- 读取字典

选择正确的输入格式对于 ClickHouse 中高效的数据摄取至关重要。支持超过 70 种格式，选择性能最优的选项可以显著影响插入速度、CPU 和内存使用以及整体系统效率。为了帮助用户了解这些选择，我们对不同格式的摄取性能进行了基准测试，得出了关键结论：

- **[Native](formats/Native.md) 格式是最高效的输入格式**，提供最佳压缩、最低资源使用和最小的服务器端处理开销。
- **压缩是至关重要的** - LZ4 使用最小的 CPU 成本减少数据大小，而 ZSTD 提供更高的压缩比，但需额外的 CPU 使用。
- **预排序的影响适中**，因为 ClickHouse 本身已经高效地进行了排序。
- **批处理显著提高了效率** - 较大的批次减少了插入开销并提高了吞吐量。

有关结果和最佳实践的详细研究，请阅读完整的 [基准分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)。要查看完整测试结果，请浏览 [FastFormats](https://fastformats.clickhouse.com/) 在线仪表板。

## 输出格式 {#output-formats}

支持的输出格式用于：
- 安排 `SELECT` 查询的结果
- 执行对文件支持的表的 `INSERT` 操作

## 格式概述 {#formats-overview}

支持的格式如下：

| 格式                                                                                       | 输入 | 输出 |
|------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                             | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                      | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                          | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                          | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                    | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                    | ✔   | ✔     |
| [Template](#format-template)                                                               | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                            | ✔   | ✗     |
| [CSV](#csv)                                                                               | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                            | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                            | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                               | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                     | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                     | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                   | ✗   | ✔     |
| [Values](#data-format-values)                                                             | ✔   | ✔     |
| [Vertical](#vertical)                                                                     | ✗   | ✔     |
| [JSON](#json)                                                                             | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                             | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                             | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                               | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                               | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                          | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                               | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                 | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                 | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                               | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                  | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                       | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                 | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                         | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                 | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                               | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)               | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                     | ✗   | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                   | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                 | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes) | ✔   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                   | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                               | ✔   | ✔     |
| [TSKV](#tskv)                                                                             | ✔   | ✔     |
| [Pretty](#pretty)                                                                         | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                     | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                      | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                    | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                           | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                        | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                        | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                      | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                               | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                            | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                            | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                          | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                 | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                     | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                         | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                             | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                 | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                              | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                           | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                          | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                               | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                  | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                   | ✔   | ✔     |
| [One](#data-format-one)                                                                   | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                   | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                   | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnames)                                                 | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                 | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                           | ✔   | ✗     |
| [Native](#native)                                                                         | ✔   | ✔     |
| [Null](#null)                                                                             | ✗   | ✔     |
| [Hash](#hash)                                                                             | ✗   | ✔     |
| [XML](#xml)                                                                               | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                   | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                             | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                             | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                       | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                       | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                   | ✔   | ✗     |
| [DWARF](#dwarf)                                                                           | ✔   | ✗     |
| [Markdown](#markdown)                                                                     | ✗   | ✔     |
| [Form](#form)                                                                             | ✔   | ✗     |

您可以通过 ClickHouse 设置控制一些格式处理参数。有关更多信息，请阅读 [设置](/operations/settings/settings-formats.md) 部分。

### TabSeparated {#tabseparated}

请参阅 [TabSeparated](/interfaces/formats/TabSeparated)

### TabSeparatedRaw {#tabseparatedraw}

请参阅 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)

### TabSeparatedWithNames {#tabseparatedwithnames}

请参阅 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

请参阅 [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

请参阅 [TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

请参阅 [TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)

### Template {#format-template}

请参阅 [Template](/interfaces/formats/Template)

### TemplateIgnoreSpaces {#templateignorespaces}

请参阅 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)

### TSKV {#tskv}

请参阅 [TSKV](/interfaces/formats/TSKV)

### CSV {#csv}

请参阅 [CSV](../interfaces/formats/CSV)

### CSVWithNames {#csvwithnames}

请参阅 [CSVWithNames](/interfaces/formats/CSVWithNames)

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

请参阅 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)

### CustomSeparated {#format-customseparated}

请参阅 [CustomSeparated](/interfaces/formats/CustomSeparated)

### CustomSeparatedWithNames {#customseparatedwithnames}

请参阅 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

请参阅 [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

### SQLInsert {#sqlinsert}

请参阅 [SQLInsert](/interfaces/formats/SQLInsert)

### JSON {#json}

请参阅 [JSON](/interfaces/formats/JSON)

### JSONStrings {#jsonstrings}

请参阅 [JSONStrings](/interfaces/formats/JSONStrings)

### JSONColumns {#jsoncolumns}

请参阅 [JSONColumns](/interfaces/formats/JSONColumns)

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

请参阅 [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)

### JSONAsString {#jsonasstring}

请参阅 [JSONAsString](/interfaces/formats/JSONAsString)

### JSONAsObject {#jsonasobject}

请参阅 [JSONAsObject](/interfaces/formats/JSONAsObject)

### JSONCompact {#jsoncompact}

请参阅 [JSONCompact](/interfaces/formats/JSONCompact)

### JSONCompactStrings {#jsoncompactstrings}

请参阅 [JSONCompactStrings](/interfaces/formats/JSONCompactStrings)

### JSONCompactColumns {#jsoncompactcolumns}

请参阅 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)

### JSONEachRow {#jsoneachrow}

请参阅 [JSONEachRow](/interfaces/formats/JSONEachRow)

### PrettyJSONEachRow {#prettyjsoneachrow}

请参阅 [PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)

### JSONStringsEachRow {#jsonstringseachrow}

请参阅 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)

### JSONCompactEachRow {#jsoncompacteachrow}

请参阅 [JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

请参阅 [JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

请参阅 [JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

请参阅 [JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

请参阅 [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

请参阅 [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

类似于 `JSONEachRowWithProgress`，但以紧凑形式输出 `row` 事件，如同在 `JSONCompactEachRow` 格式中。

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

请参阅 [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

请参阅 [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)

### JSONObjectEachRow {#jsonobjecteachrow}

请参阅 [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)

### JSON 格式设置 {#json-formats-settings}

请参阅 [JSON 格式设置](/operations/settings/formats)

### BSONEachRow {#bsoneachrow}

请参阅 [BSONEachRow](/interfaces/formats/BSONEachRow)

### Native {#native}

请参阅 [Native](/interfaces/formats/Native)

### Null {#null}

请参阅 [Null](/interfaces/formats/Null)

### Hash {#hash}

请参阅 [Hash](/interfaces/formats/Hash)

### Pretty {#pretty}

请参阅 [Pretty](/interfaces/formats/Pretty)

### PrettyNoEscapes {#prettynoescapes}

请参阅 [PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)

### PrettyMonoBlock {#prettymonoblock}

请参阅 [PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

请参阅 [PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)

### PrettyCompact {#prettycompact}

请参阅 [PrettyCompact](/interfaces/formats/PrettyCompact)

### PrettyCompactNoEscapes {#prettycompactnoescapes}

请参阅 [PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)

### PrettyCompactMonoBlock {#prettycompactmonoblock}

请参阅 [PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

请参阅 [PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesMonoBlock)

### PrettySpace {#prettyspace}

请参阅 [PrettySpace](/interfaces/formats/PrettySpace)

### PrettySpaceNoEscapes {#prettyspacenoescapes}

请参阅 [PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)

### PrettySpaceMonoBlock {#prettyspacemonoblock}

请参阅 [PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

请参阅 [PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)

### RowBinary {#rowbinary}

请参阅 [RowBinary](/interfaces/formats/RowBinary)

### RowBinaryWithNames {#rowbinarywithnames}

请参阅 [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

请参阅 [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)

### RowBinaryWithDefaults {#rowbinarywithdefaults}

请参阅 [RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)

### Values {#data-format-values}

请参阅 [Values](/interfaces/formats/Values)

### Vertical {#vertical}

请参阅 [Vertical](/interfaces/formats/Vertical)

### XML {#xml}

请参阅 [XML](/interfaces/formats/XML)

### CapnProto {#capnproto}

请参阅 [CapnProto](/interfaces/formats/CapnProto)

### Prometheus {#prometheus}

请参阅 [Prometheus](/interfaces/formats/Prometheus)

### Protobuf {#protobuf}

请参阅 [Protobuf](/interfaces/formats/Protobuf)

### ProtobufSingle {#protobufsingle}

请参阅 [ProtobufSingle](/interfaces/formats/ProtobufSingle)

### ProtobufList {#protobuflist}

请参阅 [ProtobufList](/interfaces/formats/ProtobufList)

### Avro {#data-format-avro}

请参阅 [Avro](/interfaces/formats/Avro)

### AvroConfluent {#data-format-avro-confluent}

请参阅 [AvroConfluent](/interfaces/formats/AvroConfluent)

### Parquet {#data-format-parquet}

请参阅 [Parquet](/interfaces/formats/Parquet)

### ParquetMetadata {#data-format-parquet-metadata}

请参阅 [ParquetMetadata](/interfaces/formats/ParquetMetadata)

### Arrow {#data-format-arrow}

请参阅 [Arrow](/interfaces/formats/ArrowStream)

### ArrowStream {#data-format-arrow-stream}

请参阅 [ArrowStream](/interfaces/formats/ArrowStream)

### ORC {#data-format-orc}

请参阅 [ORC](/interfaces/formats/ORC)

### One {#data-format-one}

请参阅 [One](/interfaces/formats/One)

### Npy {#data-format-npy}

请参阅 [Npy](/interfaces/formats/Npy)

### LineAsString {#lineasstring}

请参阅：
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

请参阅 [Regexp](/interfaces/formats/Regexp)

### RawBLOB {#rawblob}

请参阅 [RawBLOB](/interfaces/formats/RawBLOB)

### Markdown {#markdown}

请参阅 [Markdown](/interfaces/formats/Markdown)

### MsgPack {#msgpack}

请参阅 [MsgPack](/interfaces/formats/MsgPack)

### MySQLDump {#mysqldump}

请参阅 [MySQLDump](/interfaces/formats/MySQLDump)

### DWARF {#dwarf}

请参阅 [Dwarf](/interfaces/formats/DWARF)

### Form {#form}

请参阅 [Form](/interfaces/formats/Form)

## 格式模式 {#formatschema}

包含格式模式的文件名由设置 `format_schema` 设置。
在使用 `Cap'n Proto` 和 `Protobuf` 格式之一时，必须设置此选项。
格式模式是文件名和该文件中消息类型名称的组合，以冒号分隔，例如 `schemafile.proto:MessageType`。
如果文件具有格式的标准扩展名（例如，`.proto` 用于 `Protobuf`），则可以省略，在这种情况下，格式模式看起来像 `schemafile:MessageType`。

如果您通过 [客户端](/interfaces/cli.md) 在交互模式下输入或输出数据，则在格式模式中指定的文件名可以包含绝对路径或客户端当前目录的相对路径。
如果您在 [批处理模式](/interfaces/cli.md/#batch-mode) 下使用客户端，出于安全原因，模式的路径必须是相对的。

如果您通过 [HTTP 接口](/interfaces/http.md) 输入或输出数据，则格式模式中指定的文件名应位于 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path) 中指定的目录下。

## 跳过错误 {#skippingerrors}

某些格式，如 `CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated` 和 `Protobuf`，如果发生解析错误，则可以跳过损坏的行，并继续从下一行的开头解析。请参见 [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 和 [input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 设置。
限制：
- 在发生解析错误时，`JSONEachRow` 跳过所有数据，直到新行（或 EOF），因此行之间必须用 `\n` 分隔，以便正确计算错误。
- `Template` 和 `CustomSeparated` 使用最后一列之后的分隔符和行之间的分隔符来查找下一行的开头，因此只有在至少其中一个不为空的情况下，才会跳过错误。
