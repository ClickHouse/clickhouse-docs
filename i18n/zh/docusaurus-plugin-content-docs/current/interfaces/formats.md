---
description: 'ClickHouse 中输入和输出数据格式概览'
sidebar_label: '查看所有格式...'
sidebar_position: 21
slug: /interfaces/formats
title: '输入和输出数据格式'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 输入和输出数据的格式 {#formats-for-input-and-output-data}

ClickHouse 支持大多数已知的文本和二进制数据格式，从而可以轻松集成到几乎任何现有的数据管道中，充分发挥 ClickHouse 的优势。

## 输入格式 {#input-formats}

输入格式用于：
- 解析提供给 `INSERT` 语句的数据
- 对诸如 `File`、`URL` 或 `HDFS` 等文件后端表执行 `SELECT` 查询
- 读取字典

为 ClickHouse 选择合适的输入格式对高效数据摄取至关重要。ClickHouse 支持 70 多种格式，选择性能最佳的选项会显著影响插入速度、CPU 与内存使用率以及整体系统效率。为帮助你在这些选项中进行选择，我们对不同格式的摄取性能进行了基准测试，并得出了以下关键结论：

- **[Native](formats/Native.md) 格式是最高效的输入格式**，提供最佳压缩率、最低资源占用以及最小的服务器端处理开销。
- **压缩至关重要** —— LZ4 能在较低 CPU 开销下减小数据体积，而 ZSTD 则以更高压缩率为代价增加了 CPU 开销。
- **预排序的影响中等**，因为 ClickHouse 本身就能高效完成排序。
- **批量写入显著提高效率** —— 更大的批次可以减少插入开销并提升吞吐量。

如需深入了解测试结果和最佳实践，
请阅读完整的[基准分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)。
要查看完整测试结果，请访问 [FastFormats](https://fastformats.clickhouse.com/) 在线仪表盘。

## 输出格式 {#output-formats}

支持的输出格式用于：
- 组织 `SELECT` 查询的结果
- 向以文件为后端的表执行 `INSERT` 操作

## 格式概览 {#formats-overview}

受支持的格式有：

| 格式                                                                                                         | 输入 | 输出 |
| ---------------------------------------------------------------------------------------------------------- | -- | -- |
| [TabSeparated](./formats/TabSeparated/TabSeparated.md)                                                     | ✔  | ✔  |
| [TabSeparatedRaw](./formats/TabSeparated/TabSeparatedRaw.md)                                               | ✔  | ✔  |
| [TabSeparatedWithNames](./formats/TabSeparated/TabSeparatedWithNames.md)                                   | ✔  | ✔  |
| [TabSeparatedWithNamesAndTypes](./formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)                   | ✔  | ✔  |
| [TabSeparatedRawWithNames](./formats/TabSeparated/TabSeparatedRawWithNames.md)                             | ✔  | ✔  |
| [TabSeparatedRawWithNamesAndTypes](./formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)             | ✔  | ✔  |
| [模板](./formats/Template/Template.md)                                                                       | ✔  | ✔  |
| [TemplateIgnoreSpaces](./formats/Template/TemplateIgnoreSpaces.md)                                         | ✔  | ✗  |
| [CSV](./formats/CSV/CSV.md)                                                                                | ✔  | ✔  |
| [CSVWithNames](./formats/CSV/CSVWithNames.md)                                                              | ✔  | ✔  |
| [CSVWithNamesAndTypes](./formats/CSV/CSVWithNamesAndTypes.md)                                              | ✔  | ✔  |
| [CustomSeparated](./formats/CustomSeparated/CustomSeparated.md)                                            | ✔  | ✔  |
| [CustomSeparatedWithNames](./formats/CustomSeparated/CustomSeparatedWithNames.md)                          | ✔  | ✔  |
| [CustomSeparatedWithNamesAndTypes](./formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)          | ✔  | ✔  |
| [SQLInsert](./formats/SQLInsert.md)                                                                        | ✗  | ✔  |
| [值](./formats/Values.md)                                                                                   | ✔  | ✔  |
| [垂直](./formats/Vertical.md)                                                                                | ✗  | ✔  |
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
| [正则表达式（Regexp）](./formats/Regexp.md)                                                                       | ✔  | ✗  |
| [RawBLOB](./formats/RawBLOB.md)                                                                            | ✔  | ✔  |
| [MsgPack](./formats/MsgPack.md)                                                                            | ✔  | ✔  |
| [MySQLDump](./formats/MySQLDump.md)                                                                        | ✔  | ✗  |
| [DWARF](./formats/DWARF.md)                                                                                | ✔  | ✗  |
| [Markdown](./formats/Markdown.md)                                                                          | ✗  | ✔  |
| [表单](./formats/Form.md)                                                                                    | ✔  | ✗  |

你可以通过 ClickHouse 的设置来控制某些格式处理参数。欲了解更多信息，请参阅[设置](/operations/settings/settings-formats.md)部分。

## 格式模式 {#formatschema}

包含格式模式的文件名由设置 `format_schema` 指定。
在使用 `Cap'n Proto` 或 `Protobuf` 任一格式时，必须设置该配置。
格式模式由文件名和该文件中消息类型的名称组成，两者以冒号分隔，
例如：`schemafile.proto:MessageType`。
如果文件具有该格式的标准扩展名（例如 `Protobuf` 的 `.proto`），
则扩展名可以省略，此时格式模式为 `schemafile:MessageType`。

如果通过交互模式下的[客户端](/interfaces/cli.md)进行数据输入或输出，格式模式中指定的文件名
可以是绝对路径，也可以是相对于客户端当前目录的相对路径。
如果在[批处理模式](/interfaces/cli.md/#batch-mode)下使用客户端，出于安全考虑，模式文件的路径必须是相对路径。

如果通过 [HTTP 接口](/interfaces/http.md) 进行数据输入或输出，则格式模式中指定的文件名
必须位于服务器配置中由 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path) 指定的目录中。

## 跳过错误 {#skippingerrors}

某些格式，例如 `CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated` 和 `Protobuf`，在发生解析错误时可以跳过有问题的行，并从下一行的开头继续解析。参见 [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 和
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 设置。
限制条件：
- 在发生解析错误的情况下，`JSONEachRow` 会跳过直到换行符（或 EOF）之前的所有数据，因此行必须由 `\n` 分隔，才能正确统计错误数量。
- `Template` 和 `CustomSeparated` 使用最后一列之后的分隔符以及行与行之间的分隔符来查找下一行的开头，因此仅当这两类分隔符中至少有一个非空时，错误跳过机制才会生效。
