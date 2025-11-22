---
description: 'ClickHouse 中用于数据输入和输出的受支持格式概览'
sidebar_label: '查看所有格式...'
sidebar_position: 21
slug: /interfaces/formats
title: '输入和输出数据的格式'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 输入和输出数据格式 {#formats-for-input-and-output-data}

ClickHouse 支持大多数常见的文本和二进制数据格式。这使得它可以轻松集成到几乎任何现有的数据管道中,充分发挥 ClickHouse 的优势。


## 输入格式 {#input-formats}

输入格式用于：

- 解析提供给 `INSERT` 语句的数据
- 对基于文件的表（如 `File`、`URL` 或 `HDFS`）执行 `SELECT` 查询
- 读取字典

选择正确的输入格式对于 ClickHouse 中的高效数据摄取至关重要。在超过 70 种支持的格式中，
选择性能最佳的选项可以显著影响插入速度、CPU 和内存使用以及整体系统
效率。为了帮助您做出选择，我们对各种格式的摄取性能进行了基准测试，得出以下关键结论：

- **[Native](formats/Native.md) 格式是最高效的输入格式**，提供最佳压缩、最低
  资源使用和最小的服务器端处理开销。
- **压缩至关重要** - LZ4 以最小的 CPU 成本减少数据大小，而 ZSTD 以额外的 CPU 使用为代价提供更高的压缩率。
- **预排序的影响适中**，因为 ClickHouse 本身已经能够高效地进行排序。
- **批处理显著提高效率** - 更大的批次可以减少插入开销并提高吞吐量。

如需深入了解结果和最佳实践，
请阅读完整的[基准测试分析](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)。
如需查看完整的测试结果，请访问 [FastFormats](https://fastformats.clickhouse.com/) 在线仪表板。


## 输出格式 {#output-formats}

支持的输出格式用于:

- 组织 `SELECT` 查询的结果
- 向文件表执行 `INSERT` 操作


## 格式概述 {#formats-overview}

支持的格式包括：


| 格式                                                                                                         | 输入 | 输出 |
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
| [表单](./formats/Form.md)                                                                                    | ✔  | ✗  |



您可以通过 ClickHouse 设置来控制部分格式处理参数。更多信息请参阅 [设置](/operations/settings/settings-formats.md) 一节。



## 格式架构 {#formatschema}

包含格式架构的文件名通过 `format_schema` 设置指定。
当使用 `Cap'n Proto` 和 `Protobuf` 格式时,必须设置此配置项。
格式架构由文件名和该文件中的消息类型名称组合而成,以冒号分隔,
例如 `schemafile.proto:MessageType`。
如果文件使用该格式的标准扩展名(例如 `Protobuf` 的 `.proto`),
则可以省略扩展名,此时格式架构形如 `schemafile:MessageType`。

如果在交互模式下通过[客户端](/interfaces/cli.md)输入或输出数据,格式架构中指定的文件名
可以包含绝对路径或相对于客户端当前目录的相对路径。
如果在[批处理模式](/interfaces/cli.md/#batch-mode)下使用客户端,出于安全考虑,架构路径必须使用相对路径。

如果通过 [HTTP 接口](/interfaces/http.md)输入或输出数据,格式架构中指定的文件名
应位于服务器配置中 [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)
所指定的目录中。


## 跳过错误 {#skippingerrors}

某些格式(如 `CSV`、`TabSeparated`、`TSKV`、`JSONEachRow`、`Template`、`CustomSeparated` 和 `Protobuf`)可以在发生解析错误时跳过损坏的行,并从下一行的开头继续解析。请参阅 [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) 和 [input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio) 设置。

限制条件:

- 当发生解析错误时,`JSONEachRow` 会跳过所有数据直到遇到换行符(或 EOF),因此行必须使用 `\n` 分隔才能正确统计错误数量。
- `Template` 和 `CustomSeparated` 使用最后一列之后的分隔符以及行之间的分隔符来定位下一行的起始位置,因此只有当至少其中一个分隔符不为空时,跳过错误功能才能正常工作。
