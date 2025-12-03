---
title: '格式设置'
sidebar_label: '格式设置'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: '控制输入和输出格式的设置。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自动生成的 */ }

这些设置是从[源文件](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h)自动生成的。

## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}   

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 Variant 类型中，将诸如 "on"、"off"、"enable"、"disable" 等特殊文本布尔值解析为 Bool 值。

## bool_false_representation {#bool_false_representation}   

<SettingsInfoBlock type="String" default_value="false" />

用于在 TSV/CSV/Vertical/Pretty 格式中表示布尔值 false 的文本。

## bool_true_representation {#bool_true_representation}   

<SettingsInfoBlock type="String" default_value="true" />

在 TSV/CSV/Vertical/Pretty 格式中用于表示 `true` 布尔值的文本。

## column_names_for_schema_inference {#column_names_for_schema_inference}   



在缺少列名的格式中用于模式推断的列名列表。格式：'column1,column2,column3,...'

## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}   

<SettingsInfoBlock type="UInt64" default_value="1" />

如果在 WHERE 子句中存在连接表达式，则使用 INNER JOIN 替代逗号连接/CROSS JOIN。取值：0 - 不重写，1 - 若可能则对逗号连接/CROSS JOIN 进行重写，2 - 强制重写所有逗号连接，对 CROSS JOIN 则在可行时重写。

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}   

<SettingsInfoBlock type="Bool" default_value="0" />

动态去除 datetime64 值末尾的零，将输出精度动态调整为 [0, 3, 6]，
分别对应 'seconds'、'milliseconds' 和 'microseconds'

## date_time_input_format {#date_time_input_format}   

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

允许选择日期和时间文本表示形式的解析器。

该设置不适用于[日期和时间函数](../../sql-reference/functions/date-time-functions.md)。

可能的取值：

- `'best_effort'` — 启用扩展解析。

    ClickHouse 可以解析基本的 `YYYY-MM-DD HH:MM:SS` 格式以及所有 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日期和时间格式。例如，`'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — 与 `best_effort` 类似（差异见 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)）。

- `'basic'` — 使用基本解析器。

    ClickHouse 只能解析基本的 `YYYY-MM-DD HH:MM:SS` 或 `YYYY-MM-DD` 格式。例如，`2019-08-20 10:18:56` 或 `2019-08-20`。

Cloud 中的默认值：`'best_effort'`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format {#date_time_output_format}   

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

允许选择日期和时间文本表示的不同输出格式。

可能的取值：

- `simple` - 简单输出格式。

    ClickHouse 以 `YYYY-MM-DD hh:mm:ss` 格式输出日期和时间。例如：`2019-08-20 10:18:56`。时间计算基于该数据类型的时区（如果存在）或服务器时区。

- `iso` - ISO 输出格式。

    ClickHouse 以 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ` 格式输出日期和时间。例如：`2019-08-20T10:18:56Z`。注意，输出为 UTC（`Z` 表示 UTC）。

- `unix_timestamp` - Unix 时间戳输出格式。

    ClickHouse 以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 格式输出日期和时间。例如：`1566285536`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior {#date_time_overflow_behavior}   

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

定义在将 [Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md) 或整数转换为 Date、Date32、DateTime 或 DateTime64 时，当该值无法在结果类型中表示时的处理行为。

可能的取值：

- `ignore` — 静默忽略溢出，结果未定义。
- `throw` — 在发生溢出时抛出异常。
- `saturate` — 对结果进行饱和处理。如果该值小于目标类型可表示的最小值，则结果取该类型可表示的最小值；如果该值大于目标类型可表示的最大值，则结果取该类型可表示的最大值。

默认值：`ignore`。

## dictionary_use_async_executor {#dictionary_use_async_executor}   

<SettingsInfoBlock type="Bool" default_value="0" />

在多个线程中执行用于读取字典源的管道。仅适用于以本地 ClickHouse 为源的字典。

## errors_output_format {#errors_output_format}   

<SettingsInfoBlock type="String" default_value="CSV" />

将错误写入文本输出时使用的格式。

## exact_rows_before_limit {#exact_rows_before_limit}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，ClickHouse 将会为 `rows_before_limit_at_least` 统计信息提供精确值，但这意味着必须完整读取 LIMIT 之前的所有数据。

## format_avro_schema_registry_url {#format_avro_schema_registry_url}   



对于 AvroConfluent 格式：Confluent Schema Registry 的 URL 地址。

## format_binary_max_array_size {#format_binary_max_array_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

在 RowBinary 格式中允许的数组的最大大小。该设置可防止在数据损坏时分配过多内存。0 表示不作限制。

## format_binary_max_string_size {#format_binary_max_string_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 格式中 `String` 类型允许的最大大小。用于在数据损坏时防止分配过多内存。`0` 表示不设限制。

## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}   

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

如何在 ClickHouse Enum 和 CapnProto Enum 之间建立映射

## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

在未设置 format_schema 时，使用自动生成的 CapnProto 模式

## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}   

<SettingsInfoBlock type="Bool" default_value="1" />

当该设置为 `true` 时，将允许使用双引号括起的字符串。

## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}   

<SettingsInfoBlock type="Bool" default_value="0" />

当设置为 true 时，允许使用单引号括起的字符串。

## format_csv_delimiter {#format_csv_delimiter}   

<SettingsInfoBlock type="Char" default_value="," />

在 CSV 数据中被视为分隔符的字符。如果通过字符串进行设置，则该字符串的长度必须为 1。

## format_csv_null_representation {#format_csv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

自定义 CSV 格式中的 NULL 表示

## format_custom_escaping_rule {#format_custom_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

字段转义规则（适用于 CustomSeparated 格式）

## format_custom_field_delimiter {#format_custom_field_delimiter}   

<SettingsInfoBlock type="String" default_value="	" />

字段分隔符（用于 CustomSeparated 格式）

## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}   



结果集结束后追加的后缀（用于 CustomSeparated 格式）

## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}   



结果集前的前缀（用于 CustomSeparated 格式）

## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

最后一列字段后的分隔符（用于 `CustomSeparated` 格式）

## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}   



第一列字段前使用的分隔符（用于 `CustomSeparated` 格式）

## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}   



行与行之间的分隔符（用于 CustomSeparated 格式）

## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在针对表、数据库、表函数和字典的 `SHOW` 和 `SELECT` 查询中显示机密信息。

要查看机密信息的用户还必须在服务器端启用
[`display_secrets_in_show_and_select` 设置](../server-configuration-parameters/settings#display_secrets_in_show_and_select)，
并拥有
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的取值：

-   0 — 禁用。
-   1 — 启用。

## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}   



在 [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) 格式中，用于存储或写入对象名的列名。
列类型必须为 String 类型。若值为空，将使用默认名称 `row_{i}` 作为对象名。

## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

当未设置 format_schema 时，使用自动生成的 Protobuf 架构

## format_regexp {#format_regexp}   



正则表达式（用于 Regexp 格式）

## format_regexp_escaping_rule {#format_regexp_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

字段转义规则（适用于 Regexp 格式）

## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}   

<SettingsInfoBlock type="Bool" default_value="0" />

跳过正则表达式未匹配的行（用于 Regexp 格式）

## format_schema {#format_schema}   



当你使用需要模式定义的格式（例如 [Cap'n Proto](https://capnproto.org/) 或 [Protobuf](https://developers.google.com/protocol-buffers/)）时，此参数非常有用。其值取决于具体的格式。

## format_schema_message_name {#format_schema_message_name}   



指定在 `format_schema` 中定义的 schema 里所需消息的名称。
为保持与旧版 format_schema 格式（`file_name:message_name`）的兼容性：
- 如果未指定 `format_schema_message_name`，则消息名称将从旧版 `format_schema` 值中的 `message_name` 部分推断。
- 如果在使用旧版格式时指定了 `format_schema_message_name`，则会报错。

## format_schema_source {#format_schema_source}   

<SettingsInfoBlock type="String" default_value="file" />

定义 `format_schema` 的来源。
可选值：
- 'file'（默认）：`format_schema` 是位于 `format_schemas` 目录中的一个 schema 文件名。
- 'string'：`format_schema` 是 schema 的字面内容。
- 'query'：`format_schema` 是一个用于获取 schema 的查询。
当 `format_schema_source` 设置为 'query' 时，适用以下条件：
- 查询必须严格只返回一个值：一行且仅包含一个字符串列。
- 查询结果被视为 schema 内容。
- 该结果会在本地 `format_schemas` 目录中进行缓存。
- 可以使用以下命令清除本地缓存：`SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`。
- 一旦被缓存，在缓存被显式清除之前，相同的查询不会再次执行以重新获取 schema。
- 除了本地缓存文件，Protobuf 消息也会缓存在内存中。即使清除了本地缓存文件，也必须使用 `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` 清除内存缓存，才能完全刷新 schema。
- 运行查询 `SYSTEM DROP FORMAT SCHEMA CACHE` 可以一次性清除缓存文件和 Protobuf 消息 schema 的缓存。

## format_template_resultset {#format_template_resultset}   



包含结果集格式字符串的文件的路径（适用于 Template 格式）

## format_template_resultset_format {#format_template_resultset_format}   



结果集格式字符串（用于 Template 格式）

## format_template_row {#format_template_row}   



包含行的格式字符串的文件路径（用于 Template 格式）

## format_template_row_format {#format_template_row_format}   



行格式字符串（用于 Template 格式）

## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

行与行之间的分隔符（用于 Template 格式）

## format_tsv_null_representation {#format_tsv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

在 TSV 格式中自定义 NULL 的表示方式

## input_format_allow_errors_num {#input_format_allow_errors_num}   

<SettingsInfoBlock type="UInt64" default_value="0" />

设置从文本格式（CSV、TSV 等）读取时允许的最大错误数量。

默认值为 0。

始终将其与 `input_format_allow_errors_ratio` 搭配使用。

如果在读取行时发生错误，但错误计数器仍小于 `input_format_allow_errors_num`，ClickHouse 会忽略该行并继续处理下一行。

如果 `input_format_allow_errors_num` 和 `input_format_allow_errors_ratio` 都被超出，ClickHouse 会抛出异常。

## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}   

<SettingsInfoBlock type="Float" default_value="0" />

设置从文本格式（CSV、TSV 等）读取数据时允许的最大错误比例。
错误比例以 0 到 1 之间的浮点数形式设置。

默认值为 0。

应始终与 `input_format_allow_errors_num` 搭配使用。

如果在读取行时发生错误，但错误计数仍小于 `input_format_allow_errors_ratio`，ClickHouse 会忽略该行并继续处理下一行。

如果同时超过了 `input_format_allow_errors_num` 和 `input_format_allow_errors_ratio`，ClickHouse 会抛出异常。

## input_format_allow_seeks {#input_format_allow_seeks}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在读取 ORC/Parquet/Arrow 输入格式时执行定位（seek）操作。

默认启用。

## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Arrow 输入格式时允许存在缺失列

## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

在匹配 Arrow 列与 ClickHouse 列时忽略大小写。

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对 Arrow 格式进行模式推断时，跳过数据类型不受支持的列

## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

对于 Avro/AvroConfluent 格式：当在模式中找不到字段时，使用默认值而不是抛出错误

## input_format_avro_null_as_default {#input_format_avro_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

对于 Avro/AvroConfluent 格式：当值为 `NULL` 且目标列为非 `Nullable` 时插入默认值

## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinaryWithNamesAndTypes 输入格式中，以二进制格式读取数据类型，而非以类型名称的形式读取。

## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinary 输入格式中，将 [JSON](../../sql-reference/data-types/newjson.md) 数据类型的值读取为 JSON [String](../../sql-reference/data-types/string.md) 类型的值。

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对 BSON 格式进行模式推断时，跳过类型不受支持的字段。

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对 CapnProto 格式进行模式推断时，跳过类型不受支持的列

## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则允许在行尾出现未被后续内容跟随的 \\r。 

## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 CSV 输入中忽略多余列（当文件的列数多于预期的列数时），并将 CSV 输入中缺失的字段按默认值处理

## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}   

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 CSV 字符串中使用空格或制表符（\\t）作为字段分隔符

## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}   

<SettingsInfoBlock type="Bool" default_value="0" />

从 CSV 中读取 `Array` 时，假设其元素先以嵌套 CSV 的形式序列化，然后再封装为字符串。示例：\"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。数组外围的括号可以省略。

## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果将其设置为 true，则以 CSV 格式写入的多个独立列可以反序列化为一个 Tuple 类型的列。

## input_format_csv_detect_header {#input_format_csv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 CSV 格式数据中自动检测包含列名和类型的表头

## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

将 CSV 输入中的空字段按默认值处理。

## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 CSV 格式中将插入的 enum 值视为其枚举索引

## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

在 CSV 格式的数据中跳过开头指定数量的行

## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 CSV 格式中忽略末尾的空行

## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

去除 CSV 字符串开头和结尾的空格和制表符（\\t）字符

## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在进行模式推断时，ClickHouse 会尝试从字符串字段中推断数值类型。
当 CSV 数据包含用引号括起来的 `UInt64` 数值时，这会非常有用。

默认关闭。

## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}   

<SettingsInfoBlock type="Bool" default_value="1" />

将输入数据中带引号的元组视为 String 类型的值。

## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

在推断 CSV 格式的表结构时使用一些优化和启发式策略

## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}   

<SettingsInfoBlock type="Bool" default_value="0" />

当 CSV 字段因包含非法值而反序列化失败时，允许为该列使用默认值

## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 CustomSeparated 输入中忽略多余的列（如果文件中的列数多于预期），并使用默认值填充 CustomSeparated 输入中缺失的字段

## input_format_custom_detect_header {#input_format_custom_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 CustomSeparated 格式中自动检测包含字段名和类型的标题行

## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 CustomSeparated 格式中跳过末尾空行

## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

在执行 `INSERT` 查询时，将输入中缺失的列值替换为对应列的默认值。此选项适用于 [JSONEachRow](/interfaces/formats/JSONEachRow)（以及其他 JSON 格式）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native) 格式以及带有 `WithNames`/`WithNamesAndTypes` 后缀的格式。

:::note
启用此选项时，扩展的表元数据会从服务器发送到客户端。这会消耗服务器上的额外计算资源，并可能降低性能。
:::

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

强制将省略的字段初始化为 null 值

## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Hive Text 输入中忽略多余的列（当文件列数多于预期时），并将 Hive Text 输入中缺失的字段填充为默认值

## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive 文本文件中集合（array 或 map）项之间的分隔符

## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive 文本文件中的字段分隔符

## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive 文本文件中 map 键值对之间的分隔符

## input_format_import_nested_json {#input_format_import_nested_json}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用对包含嵌套对象的 JSON 数据的插入。

支持的格式：

- [JSONEachRow](/interfaces/formats/JSONEachRow)

可选值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- 在 `JSONEachRow` 格式下[使用嵌套结构](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)。

## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

在反序列化 IPv4 的过程中，如果发生转换错误，将使用默认值而不是抛出异常。

该设置默认关闭。

## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

在反序列化 IPv6 时，如果发生转换错误，将使用默认值而不是抛出异常。

默认情况下禁用。

## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 JSONCompact/JSONCompactEachRow 输入格式中，行的列数可变。
对于列数多于预期的行，会忽略多余的列；对于缺失的列，则使用默认值。

默认禁用。

## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

在解析命名元组时，为 JSON 对象中缺失的元素插入默认值。
此设置仅在 `input_format_json_named_tuples_as_objects` 被启用时生效。

默认情况下为启用状态。

## input_format_json_empty_as_default {#input_format_json_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，会将 JSON 中的空字段替换为默认值。对于复杂的默认表达式，还必须同时启用 `input_format_defaults_for_omitted_fields`。

可能的取值：

+ 0 — 禁用。
+ 1 — 启用。

## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

在处理命名元组的 JSON 对象时忽略未知键。

默认启用。

## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

忽略不必要的字段而不解析它们。启用此选项后，对于格式无效或包含重复字段的 JSON 字符串，可能不会抛出异常。

## input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types {#input_format_json_infer_array_of_dynamic_from_array_of_different_types}

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，在进行 schema 推断时，ClickHouse 会将包含不同数据类型值的 JSON 数组推断为 Array(Dynamic) 类型。

示例：

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"a" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┐
│ a    │ Array(Dynamic) │
└──────┴────────────────┘
```

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
DESC format(JSONEachRow, '{"a" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type─────────────────────────────────────────────────────────────┐
│ a    │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │
└──────┴──────────────────────────────────────────────────────────────────┘
```

默认已启用。

## input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input_format_json_infer_incomplete_types_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在模式推断期间，将在数据样本中仅包含 `Null`/`{}`/`[]` 的 JSON 键推断为 String 类型。
在 JSON 格式中，任何值都可以按 String 类型读取。通过对类型未知的键使用 String 类型，我们可以在模式推断期间避免出现类似 `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` 的错误。

示例：

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

结果：

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

默认已启用。

## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 Map 类型列反序列化为由元组组成的 JSON 数组。

默认关闭。

## input_format_json_max_depth {#input_format_json_max_depth}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

JSON 中字段的最大嵌套深度。这不是一个严格限制，无需精确遵守。

## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

将命名元组列解析为 JSON 对象。

默认启用。

## input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input_format_json_read_arrays_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将 JSON 数组作为字符串进行解析。

示例：

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```

结果：

```
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```

默认开启。

## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将布尔值解析为数值。

默认启用。

## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将布尔值解析为字符串。

默认启用。

## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将数字以字符串形式进行解析。

默认启用。

## input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input_format_json_read_objects_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将 JSON 对象解析为字符串值。

示例：

```sql
SET input_format_json_read_objects_as_strings = 1;
CREATE TABLE test (id UInt64, obj String, date Date) ENGINE=Memory();
INSERT INTO test FORMAT JSONEachRow {"id" : 1, "obj" : {"a" : 1, "b" : "Hello"}, "date" : "2020-01-01"};
SELECT * FROM test;
```

结果：

```
┌─id─┬─obj──────────────────────┬───────date─┐
│  1 │ {"a" : 1, "b" : "Hello"} │ 2020-01-01 │
└────┴──────────────────────────┴────────────┘
```

默认已启用。

## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果在 JSON 输入格式中，JSON 字符串包含无效的转义序列，则抛出异常。若禁用该设置，无效的转义序列将在数据中保持原样。

默认启用。

## input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input_format_json_try_infer_named_tuples_from_objects}

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，在进行表结构推断时，ClickHouse 会尝试从 JSON 对象推断命名 `Tuple`。
生成的命名 `Tuple` 将包含样本数据中所有对应 JSON 对象里的全部元素。

示例：

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

结果：

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

默认已启用。

## input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在进行 schema 推断时，ClickHouse 会尝试将字符串字段解析为数字。
当 JSON 数据包含以引号括起的 UInt64 数值时，这会很有用。

默认情况下为禁用。

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}   

<SettingsInfoBlock type="Bool" default_value="0" />

在从 JSON 对象推断 named tuple 时，如果路径存在歧义，则使用 String 类型而不是引发异常

## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

对于 JSON/JSONCompact/JSONColumnsWithMetadata 输入格式，当此设置为 1 时，
输入数据中元数据指定的类型会与表中对应列的类型进行比较。

默认启用。

## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在解析输入数据格式时形成的数据块大小（以字节为单位）。在基于行的输入格式中，当由 ClickHouse 端形成数据块时使用。
0 表示不限制字节大小。

## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="33554432" />

自动推断表结构时最多读取的数据字节数。

## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="25000" />

用于自动推断表结构时可读取的最大行数。

## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}   

<SettingsInfoBlock type="UInt64" default_value="0" />

插入的 MsgPack 数据中的列数。用于根据数据自动推断表结构。

## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

根据列名将 MySQL 转储中的表列与 ClickHouse 表中的列进行匹配

## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}   



要从中读取数据的 MySQL 转储文件中的表名

## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 Native 输入格式中进行数据类型转换

## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 Native 输入格式中，以二进制格式读取数据类型，而不是以类型名称的形式读取

## input_format_null_as_default {#input_format_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在这些字段的数据类型不是 [Nullable](/sql-reference/data-types/nullable) 时，使用[默认值](/sql-reference/statements/create/table#default_values)初始化 [NULL](/sql-reference/syntax#literals) 字段。
如果列类型不是 Nullable 且此设置被禁用，则插入 `NULL` 会导致异常。如果列类型是 Nullable，则无论此设置如何，`NULL` 值都会按原样插入。

此设置适用于大多数输入格式。

对于复杂的默认表达式，还必须启用 `input_format_defaults_for_omitted_fields`。

可能的取值：

- 0 — 向非 Nullable 列插入 `NULL` 时会导致异常。
- 1 — 将 `NULL` 字段初始化为列的默认值。

## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在读取 ORC 输入格式时缺失列

## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

在将 ORC 列与 ClickHouse 列进行匹配时忽略大小写。

## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 ORC 文件时，将使用字典编码的 ORC 列视为 LowCardinality 列。

## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 ORC 文件时，根据 WHERE/PREWHERE 表达式，以及 ORC 元数据中的最小/最大值统计信息或布隆过滤器跳过整个 stripe 或行组。

## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 行读取器所使用的时区名称，默认值为 GMT。

## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}   

<SettingsInfoBlock type="Int64" default_value="100000" />

读取 ORC stripe 时的批量大小。

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对 ORC 格式进行模式推断时，跳过包含不支持类型的列

## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用更快的 ORC 解码器实现。

## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用 geo 列解析器，将 Array(UInt8) 转换为 Point/LineString/Polygon/MultiLineString/MultiPolygon 类型

## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在读取 Parquet 输入格式时存在缺失列

## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时，根据 WHERE 表达式和 Parquet 元数据中的布隆过滤器跳过整个行组。

## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

在将 Parquet 列与 ClickHouse 列进行匹配时忽略大小写。

## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时，将 JSON 列解析为 ClickHouse JSON 列类型。

## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}   

<SettingsInfoBlock type="Bool" default_value="1" />

在解析 Parquet 时启用行组预取。目前仅支持在单线程解析时进行预取。

## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时，基于 WHERE/PREWHERE 表达式以及 Parquet 元数据中的最小值/最大值统计信息跳过整个行组。

## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}   

<SettingsInfoBlock type="UInt64" default_value="8192" />

在 Parquet 输入格式中，本地读取（文件）时，为执行 seek 而不是读取并忽略数据所需的最小字节数

## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}   

<SettingsInfoBlock type="Bool" default_value="1" />

确定在对 `isAdjustedToUTC=false` 的 Parquet 时间戳进行 schema 推断时所使用的数据类型。若为 true：DateTime64(..., 'UTC')，若为 false：DateTime64(...)。两种行为都不完全正确，因为 ClickHouse 没有用于表示本地实际时间的数据类型。违背直觉的是，将其设为 'true' 可能是更不容易出错的选项，因为把带有 'UTC' 的时间戳格式化为 String 时，会得到正确本地时间的表示。

## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Parquet 读取器的最大块大小。

## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}   

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Parquet 读取器 v3 的近似内存限制。用于限制可并行读取的行组或列的数量。在单个查询中读取多个文件时，该限制作用于这些文件的总内存占用。

## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}   

<SettingsInfoBlock type="UInt64" default_value="2097152" />

如果内存使用量低于该阈值，则更积极地调度预取。在需要通过网络读取大量小型 Bloom 过滤器时，这可能会很有用。

## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

利用列索引中的最小值/最大值跳过数据页。

## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}   

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Parquet 读取器输出的平均块字节数

## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}   

<SettingsInfoBlock type="Bool" default_value="0" />

从 Parquet 文件读取数据时避免对行进行重新排序。一般不推荐启用此设置，因为行的顺序通常无法保证，而且查询管道的其他部分也可能打乱该顺序。请改用 `ORDER BY _row_number`。

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在进行 Parquet 格式的模式推断时，跳过包含不支持类型的列

## input_format_parquet_use_native_reader {#input_format_parquet_use_native_reader}   

<SettingsInfoBlock type="Bool" default_value="0" />

使用原生 Parquet 读取器 v1。速度相对较快，但功能尚不完善。已弃用。

## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用 Parquet 读取器 v3。

## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

在未使用页过滤时，对从 Parquet 文件读取数据页的方式进行了小幅调整。

## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时校验页校验和。

## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

为常规的非嵌套列启用 Google wrapper 类型，例如对 String 列 `str` 使用 `google.protobuf.StringValue 'str'`。对于 Nullable 列，空的 wrapper 被识别为默认值，缺失则被识别为 null。

## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}   

<SettingsInfoBlock type="Bool" default_value="0" />

通过在专用列中设置枚举值，指示检测到 protobuf oneof 中的哪个字段。

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对 Protobuf 格式进行模式推断时，跳过所有包含不受支持数据类型的字段

## input_format_record_errors_file_path {#input_format_record_errors_file_path}   



用于在读取文本格式（CSV、TSV）数据时记录错误的文件路径。

## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在插入数据时跳过额外数据。

写入数据时，如果输入数据中包含目标表中不存在的列，ClickHouse 会抛出异常。若启用了跳过功能，ClickHouse 不会插入这些额外数据，也不会抛出异常。

支持的格式：

- [JSONEachRow](/interfaces/formats/JSONEachRow)（以及其他 JSON 格式）
- [BSONEachRow](/interfaces/formats/BSONEachRow)（以及其他 JSON 格式）
- [TSKV](/interfaces/formats/TSKV)
- 所有带有后缀 WithNames/WithNamesAndTypes 的格式
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

可选值：

- 0 — 禁用。
- 1 — 启用。

## input_format_try_infer_dates {#input_format_try_infer_dates}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，ClickHouse 会在文本格式的模式推断过程中尝试将字符串字段推断为 `Date` 类型。如果输入数据中某一列的所有值都能成功解析为日期，则结果类型为 `Date`；如果至少有一个值无法解析为日期，则结果类型为 `String`。

默认启用。

## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，ClickHouse 会在对文本格式进行模式推断时，尝试从字符串字段推断出 `DateTime64` 类型。若输入数据中某一列的所有值都成功解析为日期时间，则该列的结果类型为 `DateTime64`；如果至少有一个值未能解析为日期时间，则结果类型为 `String`。

默认启用。

## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}   

<SettingsInfoBlock type="Bool" default_value="0" />

当启用 `input_format_try_infer_datetimes` 时，只推断 `DateTime64` 类型，而不推断 `DateTime` 类型。

## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

在对文本格式进行模式推断时，尝试将以指数表示法表示的数值推断为浮点数（JSON 除外，在 JSON 中带指数的数字始终会被推断为浮点数）

## input_format_try_infer_integers {#input_format_try_infer_integers}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，ClickHouse 会在对文本格式进行模式推断时，尝试将数值推断为整数而不是浮点数。如果输入数据中该列的所有数字都是整数，则结果类型为 `Int64`；如果至少有一个数字是浮点数，则结果类型为 `Float64`。

默认启用。

## input_format_try_infer_variants {#input_format_try_infer_variants}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，ClickHouse 会在文本格式的模式推断中，当某列或数组元素存在多个可能的类型时，尝试将其推断为 [`Variant`](../../sql-reference/data-types/variant.md) 类型。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 TSV 输入中忽略多余的列（当文件的列数多于预期时），并将 TSV 输入中缺失的字段视为其默认值

## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

将此项设置为 true 时，`file` 函数会读取使用 `\\r\\n` 而非 `\\n` 作为行结束符的 TSV 格式。

## input_format_tsv_detect_header {#input_format_tsv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

自动检测 TSV 格式中包含名称和类型的表头

## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 TSV 输入中的空字段按默认值处理。

## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 TSV 格式中插入的枚举值按枚举索引处理。

## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

跳过 TSV 格式数据开头的指定行数

## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 TSV 格式中跳过末尾的空行

## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 TSV 格式下使用一定的优化和启发式方法来推断表结构

## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}   

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式，在使用模板解析和评估表达式时，会检查字面量的实际类型，以避免可能的溢出和精度问题。

## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式：如果字段无法被流式解析器解析，则运行 SQL 解析器，推断 SQL 表达式模板，尝试使用该模板解析所有行，然后对所有行进行表达式求值。

## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式：如果流式解析器无法解析该字段，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。

## input_format_with_names_use_header {#input_format_with_names_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在插入数据时对列顺序的检查。

为提升插入性能，如果确信输入数据的列顺序与目标表一致，建议禁用此检查。

支持的格式：

- [CSVWithNames](/interfaces/formats/CSVWithNames)
- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## input_format_with_types_use_header {#input_format_with_types_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否让格式解析器检查输入数据中的数据类型是否与目标表中的数据类型匹配。

支持的格式：

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}   

<SettingsInfoBlock type="Bool" default_value="0" />

在没有分布键时，控制是否向 [Distributed](/engines/table-engines/special/distributed) 表的某个分片随机插入数据。

默认情况下，当向具有多个分片的 `Distributed` 表插入数据且未指定分布键时，ClickHouse 服务器会拒绝任何插入请求。当 `insert_distributed_one_random_shard = 1` 时，允许插入，数据会随机转发到所有分片中的一个。

可能的取值：

- 0 — 如果存在多个分片且未指定分布键，则拒绝插入。
- 1 — 在未指定分布键时，从所有可用分片中随机选择一个进行插入。

## interval_output_format {#interval_output_format}   

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

允许为 `Interval` 类型的文本表示选择不同的输出格式。

可选值：

-   `kusto` - KQL 风格的输出格式。

    ClickHouse 以 [KQL 格式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier)输出 interval。例如，`toIntervalDay(2)` 会被格式化为 `2.00:00:00`。请注意，对于长度不固定的 interval 类型（例如 `IntervalMonth` 和 `IntervalYear`），会根据每个 interval 的平均秒数进行换算。

-   `numeric` - 数值输出格式。

    ClickHouse 会按 interval 底层的数值表示进行输出。例如，`toIntervalDay(2)` 会被格式化为 `2`。

另请参阅：

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}   

<SettingsInfoBlock type="Bool" default_value="0" />

在使用 INTO OUTFILE 时，如果父目录不存在，则自动创建。

## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，JSON 键中的点号在解析过程中将被转义。

## output_format_arrow_compression_method {#output_format_arrow_compression_method}   

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

用于 Arrow 输出格式的压缩算法。支持的压缩编解码器：lz4_frame、zstd、none（不压缩）

## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

对 `FixedString` 列使用 Arrow 的 `FIXED_SIZE_BINARY` 类型，而不是 `Binary` 类型。

## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用将 LowCardinality 类型输出为 Arrow 的 Dictionary 类型

## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

为 `String` 列使用 Arrow `String` 类型，而不是 `Binary` 类型

## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 Arrow 格式中始终对字典索引使用 64 位整数

## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Arrow 格式中为字典索引使用有符号整数

## output_format_avro_codec {#output_format_avro_codec}   



输出时使用的压缩编解码器。可选值：'null'、'deflate'、'snappy'、'zstd'。

## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}   

<SettingsInfoBlock type="UInt64" default_value="1" />

单个文件中的最大行数（在存储允许的情况下）

## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}   



对于 Avro 格式：用于匹配并选择作为 AVRO string 处理的 String 列的正则表达式。

## output_format_avro_sync_interval {#output_format_avro_sync_interval}   

<SettingsInfoBlock type="UInt64" default_value="16384" />

同步间隔（以字节为单位）。

## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 `RowBinaryWithNamesAndTypes` 输出格式中，将数据类型编码为二进制格式，而不是使用类型名称

## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinary 输出格式中，将 [JSON](../../sql-reference/data-types/newjson.md) 数据类型的值以 JSON 文本形式写入为 [String](../../sql-reference/data-types/string.md) 类型的值。

## output_format_bson_string_as_string {#output_format_bson_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

对 `String` 列使用 BSON `String` 类型而不是 `Binary` 类型。

## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则 CSV 格式中的行结束符为 \\r\\n 而不是 \\n。

## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果设置为 true，则 CSV 格式中的 Tuple 会被序列化为多个独立的列（也就是说，它们在 Tuple 中的嵌套结构会丢失）。

## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}   

<SettingsInfoBlock type="Bool" default_value="0" />

在输出 `Decimal` 值时保留末尾的零。例如显示 1.230000 而不是 1.23。

默认禁用。

## output&#95;format&#95;json&#95;array&#95;of&#95;rows {#output_format_json_array_of_rows}

<SettingsInfoBlock type="Bool" default_value="0" />

启用将所有行以 JSON 数组形式输出的功能，数组中每个元素使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。

可能的取值：

* 1 — ClickHouse 将所有行作为一个数组输出，每一行都采用 `JSONEachRow` 格式。
* 0 — ClickHouse 将每一行分别输出，格式为 `JSONEachRow`。

**启用该设置时的查询示例**

查询：

```sql
SET output_format_json_array_of_rows = 1;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

结果：

```text
[
{"number":"0"},
{"number":"1"},
{"number":"2"}
]
```

**禁用此设置时的查询示例**

查询：

```sql
SET output_format_json_array_of_rows = 0;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

结果：

```text
{"number":"0"}
{"number":"1"}
{"number":"2"}
```

## output_format_json_escape_forward_slashes {#output_format_json_escape_forward_slashes}   

<SettingsInfoBlock type="Bool" default_value="1" />

控制在 JSON 输出格式中字符串中的正斜杠是否进行转义。此设置旨在与 JavaScript 保持兼容。不要与始终会被转义的反斜杠混淆。

默认启用。

## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 `Map` 类型列序列化为由元组组成的 JSON 数组。

默认禁用。

## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

将命名元组列序列化为 JSON 对象。

默认开启。

## output&#95;format&#95;json&#95;pretty&#95;print {#output_format_json_pretty_print}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置用于控制在使用 JSON 输出格式时，`data` 数组中嵌套结构（如 Tuple、Map 和 Array）的显示方式。

例如，输出不会是下面这样：

```json
"data":
[
  {
    "tuple": {"a":1,"b":2,"c":3},
    "array": [1,2,3],
    "map": {"a":1,"b":2,"c":3}
  }
],
```

输出格式如下：

```json
"data":
[
    {
        "tuple": {
            "a": 1,
            "b": 2,
            "c": 3
        },
        "array": [
            1,
            2,
            3
        ],
        "map": {
            "a": 1,
            "b": 2,
            "c": 3
        }
    }
],
```

默认已启用。

## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

控制在以 JSON* 格式输出时，是否对 64 位 [浮点数](../../sql-reference/data-types/float.md) 添加引号。

默认禁用。

## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}   

<SettingsInfoBlock type="Bool" default_value="0" />

控制在以 [JSON](/interfaces/formats/JSON) 格式输出时，是否对 64 位或更大[整数](../../sql-reference/data-types/int-uint.md)（例如 `UInt64` 或 `Int128`）加上引号。
默认情况下，此类整数会被用引号括起来。此行为与大多数 JavaScript 实现兼容。

可能的取值：

- 0 — 整数输出时不加引号。
- 1 — 整数输出时加引号。

## output_format_json_quote_decimals {#output_format_json_quote_decimals}   

<SettingsInfoBlock type="Bool" default_value="0" />

控制 JSON 输出格式中是否对 decimal 类型数值加引号。

默认禁用。

## output&#95;format&#95;json&#95;quote&#95;denormals {#output_format_json_quote_denormals}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 [JSON](/interfaces/formats/JSON) 输出格式中输出 `+nan`、`-nan`、`+inf`、`-inf`。

可能取值：

* 0 — 禁用。
* 1 — 启用。

**示例**

考虑如下表 `account_orders`：

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

当 `output_format_json_quote_denormals = 0` 时，查询会在结果中返回 `null` 值：

```sql
SELECT area/period FROM account_orders FORMAT JSON;
```

```json
{
        "meta":
        [
                {
                        "name": "divide(area, period)",
                        "type": "Float64"
                }
        ],

        "data":
        [
                {
                        "divide(area, period)": null
                },
                {
                        "divide(area, period)": null
                },
                {
                        "divide(area, period)": null
                }
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.003648093,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

当 `output_format_json_quote_denormals = 1` 时，查询返回：

```json
{
        "meta":
        [
                {
                        "name": "divide(area, period)",
                        "type": "Float64"
                }
        ],

        "data":
        [
                {
                        "divide(area, period)": "inf"
                },
                {
                        "divide(area, period)": "-nan"
                },
                {
                        "divide(area, period)": "-inf"
                }
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.000070241,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

## output_format_json_skip_null_value_in_named_tuples {#output_format_json_skip_null_value_in_named_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

在将 named tuple 类型的列序列化为 JSON 对象时，跳过值为 null 的键值对。仅当 `output_format_json_named_tuples_as_objects` 设置为 true 时有效。

## output_format_json_validate_utf8 {#output_format_json_validate_utf8}   

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 JSON 输出格式中校验 UTF-8 序列。不影响 JSON/JSONCompact/JSONColumnsWithMetadata 格式，这些格式始终会进行 UTF-8 校验。

默认禁用。

## output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters {#output_format_markdown_escape_special_characters}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，会对 Markdown 中的特殊字符进行转义。

[CommonMark](https://spec.commonmark.org/0.30/#example-12) 定义了以下可以进行转义的特殊字符：

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

可选值：

* 0 — 禁用。
* 1 — 启用。

## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}   

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

控制在 MsgPack 格式中输出 UUID 的方式。

## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

在 Native 输出格式中，将数据类型写为二进制格式而不是类型名称

## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 [JSON](../../sql-reference/data-types/newjson.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 列的数据以扁平化格式写入（将所有类型和路径作为单独的子列）。

## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 [JSON](../../sql-reference/data-types/newjson.md) 列的数据写入为包含 JSON 字符串的 [String](../../sql-reference/data-types/string.md) 列，而不是使用默认的原生 JSON 序列化方式。

## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}   

<SettingsInfoBlock type="UInt64" default_value="262144" />

ORC 输出格式的压缩块大小，单位为字节。

## output_format_orc_compression_method {#output_format_orc_compression_method}   

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

用于 ORC 输出格式的压缩方式。支持的编解码器：lz4、snappy、zlib、zstd、none（无压缩）

## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}   

<SettingsInfoBlock type="Double" default_value="0" />

对于 ORC 输出格式中的字符串列，如果不同值的数量大于非空行总数的该比例，则关闭字典编码；否则启用字典编码。

## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 输出格式中的目标行索引间隔

## output_format_orc_string_as_string {#output_format_orc_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

对 String 列使用 ORC 的 String 类型而不是 Binary 类型

## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC writer 使用的时区名称，默认值为 GMT。

## output_format_parquet_batch_size {#output_format_parquet_batch_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

每处理这么多行时检查一次页大小。如果某些列的平均值大小超过几 KB，建议适当减小该值。

## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}   

<SettingsInfoBlock type="Double" default_value="10.5" />

在 Parquet 布隆过滤器中，每个唯一值所使用的近似位数。估计的误报率如下：
  *  6   位 - 10%
  * 10.5 位 -  1%
  * 16.9 位 -  0.1%
  * 26.4 位 -  0.01%
  * 41   位 -  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}   

<SettingsInfoBlock type="UInt64" default_value="134217728" />

控制在 Parquet 文件中写入 Bloom 过滤器的位置。Bloom 过滤器会按大约该大小分组写入。具体而言：
  * 如果为 0，则每个行组的 Bloom 过滤器会在该行组之后立即写入；
  * 如果大于所有 Bloom 过滤器的总大小，则所有行组的 Bloom 过滤器会先在内存中累积，然后在文件末尾附近一次性写入；
  * 否则，Bloom 过滤器会在内存中累积，并在其总大小超过该值时被写出。

## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Parquet 文件的 schema 中，将列表元素的名称使用 `element` 而不是 `item`。这是 Arrow 库实现上的历史遗留问题。通常可以提高兼容性，但某些旧版本的 Arrow 可能不是这样。

## output_format_parquet_compression_method {#output_format_parquet_compression_method}   

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Parquet 输出格式所使用的压缩方式。支持的编解码器：snappy、lz4、brotli、zstd、gzip、none（不压缩）

## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

压缩前的目标页大小（字节）。

## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}   

<SettingsInfoBlock type="Bool" default_value="0" />

将 Date 值写为普通的 16 位无符号整数（读取时为 UInt16），而不是将其转换为 32 位的 Parquet DATE 类型（读取时为 Date32）。

## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}   

<SettingsInfoBlock type="Bool" default_value="0" />

以原始 Unix 时间戳形式写入 DateTime 值（读取时为 UInt32），而不是转换为毫秒（读取时为 DateTime64(3)）。

## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用 Parquet 物理类型 BYTE_ARRAY 和逻辑类型 ENUM 写出枚举值

## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

对 `FixedString` 列，使用 Parquet 的 `FIXED_LEN_BYTE_ARRAY` 类型而非 `Binary` 类型。

## output_format_parquet_geometadata {#output_format_parquet_geometadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 Parquet 元数据中写入关于地理空间列的信息，并以 WKB 格式对这些列进行编码。

## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

如果字典大小超过此字节数，则切换为非字典编码。将其设置为 0 可禁用字典编码。

## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用多个线程执行 Parquet 编码。需要启用 output_format_parquet_use_custom_encoder。

## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

目标行组大小（行数）。

## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="536870912" />

压缩前的目标行组大小（字节）。

## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

对 `String` 列使用 Parquet 的 `String` 类型而不是 `Binary` 类型。

## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用更快的 Parquet 编码器实现。

## output_format_parquet_version {#output_format_parquet_version}   

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

输出格式所使用的 Parquet 版本。支持的版本：1.0、2.4、2.6 和 2.latest（默认）

## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Parquet 文件中写入布隆过滤器。需要将 `output_format_parquet_use_custom_encoder` 设置为 `true`。

## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Parquet 数据页的页头写入 CRC32 校验和。

## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

将列索引和偏移量索引（即每个数据页的统计信息，可在读取时用于过滤下推）写入 Parquet 文件。

## output_format_pretty_color {#output_format_pretty_color}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

在 Pretty 格式中使用 ANSI 转义序列。0 - 禁用，1 - 启用，'auto' - 在终端环境中启用。

## output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names {#output_format_pretty_display_footer_column_names}

<SettingsInfoBlock type="UInt64" default_value="1" />

当表行数较多时，在页脚中显示列名。

可能的取值：

* 0 — 在页脚中不显示列名。
* 1 — 如果行数大于等于由 [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) 设置的阈值（默认 50），则在页脚中显示列名。

**示例**

查询：

```sql
SELECT *, toTypeName(*) FROM (SELECT * FROM system.numbers LIMIT 1000);
```

结果：

```response
      ┌─number─┬─toTypeName(number)─┐
   1. │      0 │ UInt64             │
   2. │      1 │ UInt64             │
   3. │      2 │ UInt64             │
   ...
 999. │    998 │ UInt64             │
1000. │    999 │ UInt64             │
      └─number─┴─toTypeName(number)─┘
```

## output_format_pretty_display_footer_column_names_min_rows {#output_format_pretty_display_footer_column_names_min_rows}   

<SettingsInfoBlock type="UInt64" default_value="50" />

设置在启用 [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) 时，显示包含列名的页脚所需的最小行数。

## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，并且表比较宽但行数较少，`Pretty` 格式会像 `Vertical` 格式那样输出该表。
有关此行为的精细调节，请参阅 `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` 和 `output_format_pretty_fallback_to_vertical_min_table_width`。

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}   

<SettingsInfoBlock type="UInt64" default_value="10" />

仅当一个数据块中的记录数不超过指定值时，才会启用回退为 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}   

<SettingsInfoBlock type="UInt64" default_value="5" />

仅当列数大于指定值时，才会启用回退到 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

仅当表中各列长度之和至少达到指定值，或至少有一个值包含换行符时，才会启用回退到 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

如果以 Pretty 格式渲染的数据是分成多个数据块到达的，即使中间有延迟，只要下一个数据块的列宽与前一个相同，就会使用 ANSI 转义序列将光标移回上一行，并覆盖前一个数据块的页脚，以便用新数据块继续输出。这样可以使结果在视觉上更美观。

0 - 禁用，1 - 启用，'auto' - 在终端中启用。

## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}   

<SettingsInfoBlock type="String" default_value="UTF-8" />

用于打印表格边框的字符集。可用字符集：ASCII、UTF-8（默认）。

## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用且输出为终端，则会使用下划线高亮显示每个表示千位、百万位等的数字。

## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用且输出为终端，则会使用灰色下划线高亮显示行尾空格。

## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}   

<SettingsInfoBlock type="UInt64" default_value="24" />

如果列名过长，则会被截断为该长度。
当列名长度大于 `output_format_pretty_max_column_name_width_cut_to` 加上 `output_format_pretty_max_column_name_width_min_chars_to_cut` 时，将会被截断。

## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}   

<SettingsInfoBlock type="UInt64" default_value="4" />

当列名过长时，至少需要截断的字符数。
当列名长度大于 `output_format_pretty_max_column_name_width_cut_to` 与 `output_format_pretty_max_column_name_width_min_chars_to_cut` 之和时，将会被截断。

## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

在 Pretty 格式中，用于对列中所有值进行填充对齐的最大宽度。

## output_format_pretty_max_rows {#output_format_pretty_max_rows}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Pretty 系列格式的行数上限。

## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

用于 Pretty 格式显示的值的最大宽度。如果超过该宽度，显示内容将被截断。
值为 0 表示不截断。

## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}   

<SettingsInfoBlock type="UInt64" default_value="0" />

仅在数据块中不是单个值时才裁剪该值（参见 `output_format_pretty_max_value_width` 设置）。否则将其完整输出，这对于 `SHOW CREATE TABLE` 查询非常有用。

## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，Pretty 格式会将多行字段渲染在表格单元格内，从而保持表格的整体结构。
如果禁用，则会按原样渲染它们，可能会导致表格变形（关闭该选项的一个好处是可以更方便地复制粘贴多行值）。

## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 Pretty 输出格式中为每一行添加行号

## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

如果数据块仅包含一个超过该值的数字（0 除外），则在表格右侧显示一条易读的数字提示。

## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}   

<SettingsInfoBlock type="UInt64" default_value="50" />

在写入之前，最多等待指定毫秒数以获取下一个数据块，并将其与前一个数据块合并。
这样可以避免频繁输出过小的数据块，同时仍然可以以流式方式显示数据。

## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果自上次输出以来经过的毫秒数超过指定值，则以 pretty 格式输出当前待处理的数据块。

## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

在使用 Google wrappers 序列化 `Nullable` 列时，将默认值序列化为空的 wrapper。若关闭此设置，则默认值和 null 值都不会被序列化。

## output_format_schema {#output_format_schema}   



自动生成的 schema 将以 [Cap'n Proto](/interfaces/formats/CapnProto) 或 [Protobuf](/interfaces/formats/Protobuf) 格式保存到该文件中时所使用的文件路径。

## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

在 INSERT 查询中包含列名

## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}   

<SettingsInfoBlock type="UInt64" default_value="65409" />

单个 INSERT 语句中包含的最大行数。

## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

使用 '`' 字符包裹列名

## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}   

<SettingsInfoBlock type="String" default_value="table" />

输出的 INSERT 查询中的表名

## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}   

<SettingsInfoBlock type="Bool" default_value="0" />

使用 REPLACE 语句而不是 INSERT

## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果将其设置为 true，TSV 格式的行结束符将使用 \\r\\n 而不是 \\n。

## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}   

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则将 ' 转义为 ''，否则使用 \\' 将其括起来。

## output_format_write_statistics {#output_format_write_statistics}   

<SettingsInfoBlock type="Bool" default_value="1" />

在支持的输出格式中写入关于读取行数、字节数和耗时的统计信息。

默认启用

## precise_float_parsing {#precise_float_parsing}   

<SettingsInfoBlock type="Bool" default_value="0" />

首选更精确（但更慢）的浮点数解析算法

## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}   

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 `regexp_tree` 字典中使用 Hyperscan 库。

## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}   

<SettingsInfoBlock type="Bool" default_value="0" />

对 `regexp_tree` 字典使用不区分大小写的匹配。可以在单个表达式中通过 `(?i)` 和 `(?-i)` 覆写此设置。

## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}   

<SettingsInfoBlock type="Bool" default_value="0" />

针对 `regexp_tree` 字典，允许 `.` 匹配换行符字符。

## rows_before_aggregation {#rows_before_aggregation}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，ClickHouse 会提供 `rows_before_aggregation` 指标的精确值，表示在聚合之前读取的行数。

## schema&#95;inference&#95;hints {#schema_inference_hints}

用于在对无模式的格式进行模式推断时作为提示的一组列名和类型列表。

示例：

查询：

```sql
desc format(JSONEachRow, '{"x" : 1, "y" : "String", "z" : "0.0.0.0" }') settings schema_inference_hints='x UInt8, z IPv4';
```

结果：

```sql
x   UInt8
y   Nullable(String)
z   IPv4
```

:::note
如果 `schema_inference_hints` 的格式不正确，或者存在拼写错误、错误的数据类型等问题，整个 schema&#95;inference&#95;hints 都会被忽略。
:::

## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}   

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

控制在模式推断中是否将推断出的类型设为 `Nullable`。
可能的取值：
 * 0 - 推断出的类型永远不会是 `Nullable`（在这种情况下，请使用 `input_format_null_as_default` 控制如何处理 null 值），
 * 1 - 所有推断出的类型都将是 `Nullable`，
 * 2 或 `auto` - 只有当在模式推断期间解析的样本中该列包含 `NULL`，或文件元数据中包含该列是否可为空的信息时，推断出的类型才会是 `Nullable`，
 * 3 - 如果格式包含文件元数据（例如 Parquet），则推断出的类型是否可为空将与文件元数据一致，否则（例如 CSV）一律为 Nullable。

## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}   

<SettingsInfoBlock type="Bool" default_value="0" />

控制在模式推断过程中是否将推断出的 JSON 类型设为 `Nullable`。
如果此设置与 schema_inference_make_columns_nullable 同时启用，则推断出的 JSON 类型将为 `Nullable`。

## schema_inference_mode {#schema_inference_mode}   

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

schema 推断模式。`default` —— 假定所有文件具有相同的 schema，并且可以从任意一个文件推断出 schema；`union` —— 允许文件具有不同的 schema，最终的 schema 应为所有文件 schema 的并集。

## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}   

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

设置 `SHOW CREATE` 查询中标识符的引用（加引号）规则

## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}   

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

设置 `SHOW CREATE` 查询中标识符的引用风格

## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，在将 JSON 对象解析为 JSON 类型时，会忽略重复的路径，仅插入首次出现的路径对应的值，而不会抛出异常。

## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

验证在 Array/Map/Tuple 等嵌套类型中使用实验性和可疑数据类型


