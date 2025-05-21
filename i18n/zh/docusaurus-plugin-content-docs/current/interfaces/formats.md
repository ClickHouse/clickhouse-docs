---
'description': 'ClickHouse支持的输入和输出数据格式概览'
'sidebar_label': '查看所有格式...'
'sidebar_position': 21
'slug': '/interfaces/formats'
'title': 'Formats for input and output data'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 输入和输出数据的格式 {#formats-for-input-and-output-data}

ClickHouse 支持大多数已知的文本和二进制数据格式。这使得几乎可以轻松地集成到任何数据管道中，从而利用 ClickHouse 的优势。

## 输入格式 {#input-formats}

输入格式用于：
- 解析提供给 `INSERT` 语句的数据
- 从支持文件的表（如 `File` 、`URL` 或 `HDFS`）执行 `SELECT` 查询
- 读取字典

选择合适的输入格式对于在 ClickHouse 中高效的数据摄取至关重要。目前支持超过 70 种格式，选择性能最佳的选项将显著影响插入速度、CPU 和内存使用情况及整体系统效率。为了帮助您在选择时更有方向，我们对不同格式的摄取性能进行了基准测试，得出了一些关键结论：

- **[Native](formats/Native.md) 格式是最有效的输入格式**，提供最佳的压缩比、最低的资源使用和最小的服务器端处理开销。
- **压缩非常重要** - LZ4 以最小的 CPU 成本减少数据大小，而 ZSTD 在额外的 CPU 使用下提供更高的压缩比。
- **预排序影响中等**，因为 ClickHouse 已经高效地进行排序。
- **批处理显著提高效率** - 较大的批次减少插入开销并提升吞吐量。

有关结果和最佳实践的详细介绍， 
请阅读完整的 [基准分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)。
要查看完整的测试结果，请探索 [FastFormats](https://fastformats.clickhouse.com/) 在线仪表盘。

## 输出格式 {#output-formats}

支持用于输出的格式用于：
- 安排 `SELECT` 查询的结果
- 执行文件支持表的 `INSERT` 操作

## 格式概述 {#formats-overview}

支持的格式包括：

| 格式                                                                                    | 输入 | 输出 |
|-----------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                           | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                    | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                        | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                         | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                  | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                 | ✔   | ✔     |
| [Template](#format-template)                                                            | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                          | ✔   | ✗     |
| [CSV](#csv)                                                                             | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                           | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                           | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                              | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                   | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                   | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                 | ✗   | ✔     |
| [Values](#data-format-values)                                                           | ✔   | ✔     |
| [Vertical](#vertical)                                                                     | ✗   | ✔     |
| [JSON](#json)                                                                           | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                           | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                           | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                             | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                             | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                       | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                             | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                               | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                               | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                             | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                               | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                     | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                             | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                       | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                               | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                             | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)             | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                   | ✗    | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                 | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)               | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes) | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)    | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                 | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                             | ✔   | ✔     |
| [TSKV](#tskv)                                                                           | ✔   | ✔     |
| [Pretty](#pretty)                                                                         | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                   | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                   | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                 | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                         | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                     | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                     | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                   | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                             | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                         | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                         | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                       | ✗   | ✔     |
| [Prometheus](#prometheus)                                                               | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                     | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                       | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                           | ✔   | ✔     |
| [Avro](#data-format-avro)                                                               | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                          | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                         | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                        | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                             | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                 | ✔   | ✔     |
| [One](#data-format-one)                                                                 | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                 | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                 | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnames)                                              | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                              | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                        | ✔   | ✗     |
| [Native](#native)                                                                       | ✔   | ✔     |
| [Null](#null)                                                                           | ✗   | ✔     |
| [XML](#xml)                                                                             | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                 | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                           | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                           | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                     | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                     | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                 | ✔   | ✗     |
| [DWARF](#dwarf)                                                                         | ✔   | ✗     |
| [Markdown](#markdown)                                                                     | ✗   | ✔     |
| [Form](#form)                                                                           | ✔   | ✗     |

您可以通过 ClickHouse 设置控制某些格式处理参数。有关更多信息，请阅读 [设置](/operations/settings/settings-formats.md) 部分。

### TabSeparated {#tabseparated}

请参见 [TabSeparated](/interfaces/formats/TabSeparated)

### TabSeparatedRaw {#tabseparatedraw}

请参见 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)

### TabSeparatedWithNames {#tabseparatedwithnames}

请参见 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

请参见 [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

请参见 [TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

请参见 [TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)

### Template {#format-template}

请参见 [Template](/interfaces/formats/Template)

### TemplateIgnoreSpaces {#templateignorespaces}

请参见 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)

### TSKV {#tskv}

请参见 [TSKV](/interfaces/formats/TSKV)

### CSV {#csv}

请参见 [CSV](../interfaces/formats/CSV)

### CSVWithNames {#csvwithnames}

请参见 [CSVWithNames](/interfaces/formats/CSVWithNames)

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

请参见 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)

### CustomSeparated {#format-customseparated}

请参见 [CustomSeparated](/interfaces/formats/CustomSeparated)

### CustomSeparatedWithNames {#customseparatedwithnames}

请参见 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

请参见 [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

### SQLInsert {#sqlinsert}

请参见 [SQLInsert](/interfaces/formats/SQLInsert)

### JSON {#json}

请参见 [JSON](/interfaces/formats/JSON)

### JSONStrings {#jsonstrings}

请参见 [JSONStrings](/interfaces/formats/JSONStrings)

### JSONColumns {#jsoncolumns}

请参见 [JSONColumns](/interfaces/formats/JSONColumns)

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

请参见 [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)

### JSONAsString {#jsonasstring}

请参见 [JSONAsString](/interfaces/formats/JSONAsString)

### JSONAsObject {#jsonasobject}

请参见 [JSONAsObject](/interfaces/formats/JSONAsObject)

### JSONCompact {#jsoncompact}

请参见 [JSONCompact](/interfaces/formats/JSONCompact)

### JSONCompactStrings {#jsoncompactstrings}

请参见 [JSONCompactStrings](/interfaces/formats/JSONCompactStrings)

### JSONCompactColumns {#jsoncompactcolumns}

请参见 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)

### JSONEachRow {#jsoneachrow}

请参见 [JSONEachRow](/interfaces/formats/JSONEachRow)

### PrettyJSONEachRow {#prettyjsoneachrow}

请参见 [PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)

### JSONStringsEachRow {#jsonstringseachrow}

请参见 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)

### JSONCompactEachRow {#jsoncompacteachrow}

请参见 [JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

请参见 [JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

请参见 [JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

请参见 [JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

请参见 [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

请参见 [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

类似于 `JSONEachRowWithProgress`，但以紧凑形式输出 `row` 事件，就像在 `JSONCompactEachRow` 格式中一样。

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

请参见 [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

请参见 [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)

### JSONObjectEachRow {#jsonobjecteachrow}

请参见 [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)

### JSON 格式设置 {#json-formats-settings}

请参见 [JSON 格式设置](/operations/settings/formats)

### BSONEachRow {#bsoneachrow}

请参见 [BSONEachRow](/interfaces/formats/BSONEachRow)

### Native {#native}

请参见 [Native](/interfaces/formats/Native)

### Null {#null}

请参见 [Null](/interfaces/formats/Null)

### Pretty {#pretty}

请参见 [Pretty](/interfaces/formats/Pretty)

### PrettyNoEscapes {#prettynoescapes}

请参见 [PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)

### PrettyMonoBlock {#prettymonoblock}

请参见 [PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

请参见 [PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)

### PrettyCompact {#prettycompact}

请参见 [PrettyCompact](/interfaces/formats/PrettyCompact)

### PrettyCompactNoEscapes {#prettycompactnoescapes}

请参见 [PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)

### PrettyCompactMonoBlock {#prettycompactmonoblock}

请参见 [PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

请参见 [PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesMonoBlock)

### PrettySpace {#prettyspace}

请参见 [PrettySpace](/interfaces/formats/PrettySpace)

### PrettySpaceNoEscapes {#prettyspacenoescapes}

请参见 [PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)

### PrettySpaceMonoBlock {#prettyspacemonoblock}

请参见 [PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

请参见 [PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)

### RowBinary {#rowbinary}

请参见 [RowBinary](/interfaces/formats/RowBinary)

### RowBinaryWithNames {#rowbinarywithnames}

请参见 [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

请参见 [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)

### RowBinaryWithDefaults {#rowbinarywithdefaults}

请参见 [RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)

### Values {#data-format-values}

请参见 [Values](/interfaces/formats/Values)

### Vertical {#vertical}

请参见 [Vertical](/interfaces/formats/Vertical)

### XML {#xml}

请参见 [XML](/interfaces/formats/XML)

### CapnProto {#capnproto}

请参见 [CapnProto](/interfaces/formats/CapnProto)

### Prometheus {#prometheus}

请参见 [Prometheus](/interfaces/formats/Prometheus)

### Protobuf {#protobuf}

请参见 [Protobuf](/interfaces/formats/Protobuf)

### ProtobufSingle {#protobufsingle}

请参见 [ProtobufSingle](/interfaces/formats/ProtobufSingle)

### ProtobufList {#protobuflist}

请参见 [ProtobufList](/interfaces/formats/ProtobufList)

### Avro {#data-format-avro}

请参见 [Avro](/interfaces/formats/Avro)

### AvroConfluent {#data-format-avro-confluent}

请参见 [AvroConfluent](/interfaces/formats/AvroConfluent)

### Parquet {#data-format-parquet}

请参见 [Parquet](/interfaces/formats/Parquet)

### ParquetMetadata {#data-format-parquet-metadata}

请参见 [ParquetMetadata](/interfaces/formats/ParquetMetadata)

### Arrow {#data-format-arrow}

请参见 [Arrow](/interfaces/formats/ArrowStream)

### ArrowStream {#data-format-arrow-stream}

请参见 [ArrowStream](/interfaces/formats/ArrowStream)

### ORC {#data-format-orc}

请参见 [ORC](/interfaces/formats/ORC)

### One {#data-format-one}

请参见 [One](/interfaces/formats/One)

### Npy {#data-format-npy}

请参见 [Npy](/interfaces/formats/Npy)

### LineAsString {#lineasstring}

参见：
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

请参见 [Regexp](/interfaces/formats/Regexp)

### RawBLOB {#rawblob}

请参见 [RawBLOB](/interfaces/formats/RawBLOB)

### Markdown {#markdown}

请参见 [Markdown](/interfaces/formats/Markdown)

### MsgPack {#msgpack}

请参见 [MsgPack](/interfaces/formats/MsgPack)

### MySQLDump {#mysqldump}

请参见 [MySQLDump](/interfaces/formats/MySQLDump)

### DWARF {#dwarf}

请参见 [Dwarf](/interfaces/formats/DWARF)

### Form {#form}

请参见 [Form](/interfaces/formats/Form)

## 格式模式 {#formatschema}

包含格式模式的文件名由设置 `format_schema` 设置。使用 `Cap'n Proto` 和 `Protobuf` 格式时，必须设置此设置。格式模式由文件名和文件中的消息类型名称组合而成，以冒号分隔，例如 `schemafile.proto:MessageType`。如果文件具有该格式的标准扩展名（例如，对于 `Protobuf` 为 `.proto`），则可以省略该扩展名，此时格式模式看起来像 `schemafile:MessageType`。

如果通过 [client](/interfaces/cli.md) 在交互模式下输入或输出数据，格式模式中指定的文件名可以包含绝对路径或相对于客户端当前目录的路径。如果您在 [batch mode](/interfaces/cli.md/#batch-mode) 中使用客户端，由于安全原因，模式的路径必须是相对的。

如果通过 [HTTP interface](/interfaces/http.md) 输入或输出数据，格式模式中指定的文件名应位于服务器配置中指定的 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path) 目录中。

## 跳过错误 {#skippingerrors}

一些格式，例如 `CSV` 、`TabSeparated` 、`TSKV` 、`JSONEachRow` 、`Template` 、`CustomSeparated` 和 `Protobuf` 在解析错误发生时可以跳过损坏行，并从下一行的开头继续解析。请参见 [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 和 [input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 设置。
限制：
- 在解析错误的情况下，`JSONEachRow` 跳过所有数据直到新行（或 EOF），因此行必须由 `\n` 分隔，以正确计算错误。
- `Template` 和 `CustomSeparated` 在最后一列后和行之间使用分隔符来查找下一行的开头，因此只有在至少有一个分隔符不为空时，跳过错误才有效。
