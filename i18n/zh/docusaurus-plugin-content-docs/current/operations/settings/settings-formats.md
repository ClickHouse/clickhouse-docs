---
title: '格式设置'
sidebar_label: '格式设置'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: '用于控制输入和输出格式的设置。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自动生成 */ }

这些设置是根据[源代码](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h)自动生成的。


## allow_special_bool_values_inside_variant \{#allow_special_bool_values_inside_variant\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 Variant 类型中将诸如 "on"、"off"、"enable"、"disable" 等特殊文本布尔值解析为 Bool 值。

## bool_false_representation \{#bool_false_representation\}

<SettingsInfoBlock type="String" default_value="false" />

用于在 TSV/CSV/Vertical/Pretty 格式中表示布尔值 false 的文本。

## bool_true_representation \{#bool_true_representation\}

<SettingsInfoBlock type="String" default_value="true" />

在 TSV/CSV/Vertical/Pretty 格式中用于表示布尔值 true 的文本形式。

## check_conversion_from_numbers_to_enum \{#check_conversion_from_numbers_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

在将 Numbers 转换为 Enum 类型时，如果对应的值在 Enum 中不存在，则抛出异常。

默认情况下禁用。

## column_names_for_schema_inference \{#column_names_for_schema_inference\}

用于对不包含列名的格式进行 schema 推断的列名列表。格式：'column1,column2,column3,...'

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands \{#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands\}

<SettingsInfoBlock type="Bool" default_value="0" />

动态截去 datetime64 值末尾的零，将输出小数位数调整为 [0, 3, 6]，
分别对应“秒”、“毫秒”和“微秒”

## date_time_input_format \{#date_time_input_format\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

允许选择用于解析日期和时间文本表示形式的解析器。

该设置不适用于[日期和时间函数](../../sql-reference/functions/date-time-functions.md)。

可能的取值：

- `'best_effort'` — 启用扩展解析。

    ClickHouse 可以解析基本格式 `YYYY-MM-DD HH:MM:SS` 以及所有 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日期和时间格式。例如，`'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — 与 `best_effort` 类似（差异见 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS)）。

- `'basic'` — 使用基本解析器。

    ClickHouse 只能解析基本格式 `YYYY-MM-DD HH:MM:SS` 或 `YYYY-MM-DD`。例如，`2019-08-20 10:18:56` 或 `2019-08-20`。

Cloud 默认值：`'best_effort'`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format \{#date_time_output_format\}

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

允许选择日期和时间文本表示形式的不同输出格式。

可能的取值：

- `simple` - 简单输出格式。

    ClickHouse 以 `YYYY-MM-DD hh:mm:ss` 格式输出日期和时间。例如：`2019-08-20 10:18:56`。计算依据数据类型自身的时区（如果存在）或服务器时区进行。

- `iso` - ISO 输出格式。

    ClickHouse 以 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ` 格式输出日期和时间。例如：`2019-08-20T10:18:56Z`。注意输出为 UTC（`Z` 表示 UTC）。

- `unix_timestamp` - Unix 时间戳输出格式。

    ClickHouse 以 [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) 格式输出日期和时间。例如：`1566285536`。

另请参阅：

- [DateTime 数据类型。](../../sql-reference/data-types/datetime.md)
- [用于处理日期和时间的函数。](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior \{#date_time_overflow_behavior\}

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

定义当 [Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md) 或整数被转换为 Date、Date32、DateTime 或 DateTime64 时，如果该值无法在结果类型中表示，应采用的处理行为。

可能的取值：

- `ignore` — 静默忽略溢出，结果未定义。
- `throw` — 在发生溢出时抛出异常。
- `saturate` — 对结果进行饱和处理。如果该值小于目标类型可表示的最小值，则结果设为该类型可表示的最小值；如果该值大于目标类型可表示的最大值，则结果设为该类型可表示的最大值。

默认值：`ignore`。

## errors_output_format \{#errors_output_format\}

<SettingsInfoBlock type="String" default_value="CSV" />

用于将错误写入文本输出的格式。

## format_avro_schema_registry_url \{#format_avro_schema_registry_url\}

适用于 AvroConfluent 格式的 Confluent Schema Registry URL。

## format_binary_max_array_size \{#format_binary_max_array_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 格式中 Array 允许的最大大小。用于防止在数据损坏时分配大量内存。0 表示没有限制。

## format_binary_max_object_size \{#format_binary_max_object_size\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

JSON 类型 RowBinary 格式中，单个 Object 中允许的最大路径数。用于防止在数据损坏时分配大量内存。0 表示不限制。

## format_binary_max_string_size \{#format_binary_max_string_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

在 RowBinary 格式中允许的 String 类型的最大长度。用于防止在数据损坏时分配大量内存。0 表示不限制。

## format_capn_proto_enum_comparising_mode \{#format_capn_proto_enum_comparising_mode\}

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

如何在 ClickHouse Enum 与 CapnProto Enum 之间进行映射

## format_capn_proto_max_message_size \{#format_capn_proto_max_message_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

单个 CapnProto 消息的最大大小（以字节为单位）。用于防止格式错误或损坏的数据导致过度的内存分配。默认值为 1 GiB。

## format_capn_proto_use_autogenerated_schema \{#format_capn_proto_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果未设置 `format_schema`，则使用自动生成的 CapnProto 模式

## format_csv_allow_double_quotes \{#format_csv_allow_double_quotes\}

<SettingsInfoBlock type="Bool" default_value="1" />

当设置为 true 时，允许使用双引号括起字符串。

## format_csv_allow_single_quotes \{#format_csv_allow_single_quotes\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，则允许使用单引号括起的字符串。

## format_csv_delimiter \{#format_csv_delimiter\}

<SettingsInfoBlock type="Char" default_value="," />

在 CSV 数据中用作分隔符的字符。如果通过字符串进行设置，则该字符串的长度必须为 1。

## format_csv_null_representation \{#format_csv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

在 CSV 格式中自定义 NULL 的表示形式

## format_custom_escaping_rule \{#format_custom_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

字段转义规则（适用于 CustomSeparated 格式）

## format_custom_field_delimiter \{#format_custom_field_delimiter\}

<SettingsInfoBlock type="String" default_value="	" />

字段分隔符（用于 CustomSeparated 格式）

## format_custom_result_after_delimiter \{#format_custom_result_after_delimiter\}

结果集后缀（适用于 CustomSeparated 格式）

## format_custom_result_before_delimiter \{#format_custom_result_before_delimiter\}

结果集前的前缀（用于 CustomSeparated 格式）

## format_custom_row_after_delimiter \{#format_custom_row_after_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

最后一列之后的分隔符（用于 CustomSeparated 格式）

## format_custom_row_before_delimiter \{#format_custom_row_before_delimiter\}

第一列字段前的分隔符（适用于 CustomSeparated 格式）

## format_custom_row_between_delimiter \{#format_custom_row_between_delimiter\}

行之间的分隔符（用于 CustomSeparated 格式）

## format_display_secrets_in_show_and_select \{#format_display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用在针对表、数据库、表函数和字典执行的 `SHOW` 和 `SELECT` 查询中显示机密信息。

希望查看机密信息的用户还必须同时开启
[`display_secrets_in_show_and_select` 服务器设置](../server-configuration-parameters/settings#display_secrets_in_show_and_select)，
并且拥有
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 权限。

可能的取值：

-   0 — 禁用。
-   1 — 启用。

## format_json_object_each_row_column_for_object_name \{#format_json_object_each_row_column_for_object_name\}

在 [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) 格式中，用于存储/写入对象名称的列的名称。
该列类型应为 String。若该值为空，则会为对象名称使用默认名称 `row_{i}`。

## format_protobuf_use_autogenerated_schema \{#format_protobuf_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

当未设置 format_schema 时，使用自动生成的 Protobuf

## format_regexp \{#format_regexp\}

正则表达式（适用于 Regexp 格式）

## format_regexp_escaping_rule \{#format_regexp_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

字段转义规则（适用于 Regexp 格式）

## format_regexp_skip_unmatched \{#format_regexp_skip_unmatched\}

<SettingsInfoBlock type="Bool" default_value="0" />

跳过未被正则表达式匹配到的行（适用于 Regexp 格式）

## format_schema \{#format_schema\}

在使用需要 schema 定义的格式（例如 [Cap'n Proto](https://capnproto.org/) 或 [Protobuf](https://developers.google.com/protocol-buffers/)）时，此参数非常有用。其取值取决于所使用的具体格式。

## format_schema_message_name \{#format_schema_message_name\}

在 `format_schema` 定义的 schema 中指定所需的 message 名称。

为了与旧版 format_schema 格式（`file_name:message_name`）保持兼容：

- 如果未指定 `format_schema_message_name`，则 message 名称将从旧版 `format_schema` 值中的 `message_name` 部分推断。
- 如果在使用旧版格式时指定了 `format_schema_message_name`，则会报错。

## format_schema_source \{#format_schema_source\}

<SettingsInfoBlock type="String" default_value="file" />

定义 `format_schema` 的来源。
可选值：

- 'file'（默认）：`format_schema` 是位于 `format_schemas` 目录中的 schema 文件名。
- 'string'：`format_schema` 是 schema 的字面内容。
- 'query'：`format_schema` 是用于获取 schema 的查询。
当 `format_schema_source` 被设置为 'query' 时，适用以下条件：
- 查询必须精确返回一个值：一行且只有一个字符串列。
- 查询结果会被视为 schema 内容。
- 此结果会在本地 `format_schemas` 目录中进行缓存。
- 可以使用以下命令清除本地缓存：`SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`。
- 一旦被缓存，在缓存被显式清除之前，相同的查询不会再次执行以获取 schema。
- 除了本地缓存文件，Protobuf 消息也会缓存在内存中。即便清除了本地缓存文件，也必须使用 `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` 清除内存缓存，才能完全刷新 schema。
- 运行查询 `SYSTEM DROP FORMAT SCHEMA CACHE` 可以一次性清除缓存文件和 Protobuf 消息 schema 的缓存。

## format_template_resultset \{#format_template_resultset\}

包含结果集格式字符串的文件路径（用于 Template 格式）

## format_template_resultset_format \{#format_template_resultset_format\}

用于 Template 格式的结果集格式字符串

## format_template_row \{#format_template_row\}

包含行格式字符串的文件路径（用于 Template 格式）

## format_template_row_format \{#format_template_row_format\}

行格式字符串（用于 Template 格式）

## format_template_rows_between_delimiter \{#format_template_rows_between_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

行之间的分隔符（适用于 Template 格式）

## format_tsv_null_representation \{#format_tsv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

TSV 格式中 NULL 的自定义表示形式

## input_format_allow_errors_num \{#input_format_allow_errors_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

设置从文本格式（CSV、TSV 等）读取数据时可接受的最大错误数。

默认值为 0。

始终与 `input_format_allow_errors_ratio` 搭配使用。

如果在读取行时发生错误，但错误计数器仍小于 `input_format_allow_errors_num`，ClickHouse 会忽略该行并继续处理下一行。

如果同时超过 `input_format_allow_errors_num` 和 `input_format_allow_errors_ratio`，ClickHouse 会抛出异常。

## input_format_allow_errors_ratio \{#input_format_allow_errors_ratio\}

<SettingsInfoBlock type="Float" default_value="0" />

设置从文本格式（CSV、TSV 等）读取数据时允许的最大错误百分比。
错误百分比被设置为介于 0 和 1 之间的浮点数。

默认值为 0。

应始终与 `input_format_allow_errors_num` 搭配使用。

如果在读取行时发生错误，但错误计数器仍小于 `input_format_allow_errors_ratio`，ClickHouse 会忽略该行并继续处理下一行。

如果同时超过 `input_format_allow_errors_num` 和 `input_format_allow_errors_ratio`，ClickHouse 会抛出异常。

## input_format_allow_seeks \{#input_format_allow_seeks\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在读取 ORC/Parquet/Arrow 输入格式的数据时进行随机访问（seek）。

默认启用。

## input_format_arrow_allow_missing_columns \{#input_format_arrow_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在读取 Arrow 输入格式时存在缺失列

## input_format_arrow_case_insensitive_column_matching \{#input_format_arrow_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

在匹配 Arrow 列与 ClickHouse 列时忽略列名大小写。

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 Arrow 格式进行 schema 推断时，跳过类型不受支持的列

## input_format_avro_allow_missing_fields \{#input_format_avro_allow_missing_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

对于 Avro/AvroConfluent 格式：当在模式（schema）中找不到字段时，使用默认值而不是报错。

## input_format_avro_null_as_default \{#input_format_avro_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

对于 Avro/AvroConfluent 格式：当遇到 null 值且目标列为非 Nullable 列时，插入默认值

## input_format_binary_decode_types_in_binary_format \{#input_format_binary_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinaryWithNamesAndTypes 输入格式中，以二进制格式而非类型名称的形式读取数据类型

## input_format_binary_max_type_complexity \{#input_format_binary_max_type_complexity\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

解码二进制类型时允许的最大类型节点数量（按总数计，不是深度）。`Map(String, UInt32)` = 3 个节点。用于防范恶意输入。0 = 不限制。

## input_format_binary_read_json_as_string \{#input_format_binary_read_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinary 输入格式中，将 [JSON](../../sql-reference/data-types/newjson.md) 数据类型的值读取为 JSON [String](../../sql-reference/data-types/string.md) 字符串值。

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在为 BSON 格式进行模式推断时，跳过类型不受支持的字段。

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 CapnProto 格式进行模式推断时，跳过具有不受支持类型的列

## input_format_csv_allow_cr_end_of_line \{#input_format_csv_allow_cr_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果将其设置为 true，则允许在行尾出现 \\r，且其后不再跟随 

## input_format_csv_allow_variable_number_of_columns \{#input_format_csv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

忽略 CSV 输入中的多余列（当文件中的列数多于预期时），并将 CSV 输入中缺失的字段按默认值处理。

## input_format_csv_allow_whitespace_or_tab_as_delimiter \{#input_format_csv_allow_whitespace_or_tab_as_delimiter\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 CSV 字符串中使用空格和制表符（\\t）作为字段分隔符

## input_format_csv_arrays_as_nested_csv \{#input_format_csv_arrays_as_nested_csv\}

<SettingsInfoBlock type="Bool" default_value="0" />

从 CSV 中读取 `Array` 时，假定其元素先被序列化为嵌套 CSV，然后再整体作为一个字符串写入。例如：\"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。数组外层的括号可以省略。

## input_format_csv_deserialize_separate_columns_into_tuple \{#input_format_csv_deserialize_separate_columns_into_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

当其设置为 true 时，以 CSV 格式写入的独立列可以反序列化为 Tuple 类型的列。

## input_format_csv_detect_header \{#input_format_csv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 CSV 格式中自动检测包含名称和类型的表头行

## input_format_csv_empty_as_default \{#input_format_csv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

将 CSV 输入中的空字段按默认值处理。

## input_format_csv_enum_as_number \{#input_format_csv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 CSV 格式中将插入的 enum 值按 enum 索引处理

## input_format_csv_skip_first_lines \{#input_format_csv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

跳过 CSV 格式数据开头的指定行数

## input_format_csv_skip_trailing_empty_lines \{#input_format_csv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

忽略 CSV 格式中末尾的空行

## input_format_csv_trim_whitespaces \{#input_format_csv_trim_whitespaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

去除 CSV 字符串首尾的空格和制表符（\\t）字符

## input_format_csv_try_infer_numbers_from_strings \{#input_format_csv_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，在进行模式推断时，ClickHouse 会尝试从字符串字段中推断数值。
如果 CSV 数据中包含带引号的 UInt64 数值，这会很有用。

默认情况下为禁用。

## input_format_csv_try_infer_strings_from_quoted_tuples \{#input_format_csv_try_infer_strings_from_quoted_tuples\}

<SettingsInfoBlock type="Bool" default_value="1" />

将输入数据中带引号的元组视为 String 类型的值。

## input_format_csv_use_best_effort_in_schema_inference \{#input_format_csv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

在推断 CSV 格式的 schema 时，使用一些调整和启发式规则

## input_format_csv_use_default_on_bad_values \{#input_format_csv_use_default_on_bad_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 CSV 字段因无效值导致反序列化失败时，为该列设置默认值

## input_format_custom_allow_variable_number_of_columns \{#input_format_custom_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 CustomSeparated 输入中忽略多余的列（如果文件中的列数多于预期），并将 CustomSeparated 输入中缺失的字段按默认值处理

## input_format_custom_detect_header \{#input_format_custom_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

自动识别 CustomSeparated 格式中包含名称和类型的表头

## input_format_custom_skip_trailing_empty_lines \{#input_format_custom_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 `CustomSeparated` 格式中跳过结尾的空行

## input_format_defaults_for_omitted_fields \{#input_format_defaults_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

在执行 `INSERT` 查询时，将被省略的输入列的值替换为对应列的默认值。此选项适用于 [JSONEachRow](/interfaces/formats/JSONEachRow)（以及其他 JSON 格式）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native) 格式，以及带有 `WithNames`/`WithNamesAndTypes` 后缀的格式。

:::note
启用此选项时，扩展表元数据会从服务器发送到客户端。这会消耗服务器的额外计算资源，并可能降低性能。
:::

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## input_format_force_null_for_omitted_fields \{#input_format_force_null_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

强制将省略的字段初始化为 NULL

## input_format_hive_text_allow_variable_number_of_columns \{#input_format_hive_text_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 Hive Text 输入中忽略多余的列（如果文件中的列数多于预期），并将 Hive Text 输入中缺失的字段按默认值处理

## input_format_hive_text_collection_items_delimiter \{#input_format_hive_text_collection_items_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive Text 文件中集合（array 或 map）元素之间的分隔符

## input_format_hive_text_fields_delimiter \{#input_format_hive_text_fields_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive 文本文件中字段之间的分隔符

## input_format_hive_text_map_keys_delimiter \{#input_format_hive_text_map_keys_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive 文本文件中 Map 键值对之间的分隔符

## input_format_import_nested_json \{#input_format_import_nested_json\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用或禁用插入包含嵌套对象的 JSON 数据。

支持的格式：

- [JSONEachRow](/interfaces/formats/JSONEachRow)

可能的取值：

- 0 — 禁用。
- 1 — 启用。

另请参阅：

- [`JSONEachRow` 格式中嵌套结构的使用](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)。

## input_format_ipv4_default_on_conversion_error \{#input_format_ipv4_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

在反序列化 IPv4 数据时，如果发生转换错误，将使用默认值而不是抛出异常。

默认情况下为禁用状态。

## input_format_ipv6_default_on_conversion_error \{#input_format_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

在反序列化 IPv6 地址时，如果发生转换错误，将使用默认值而不是抛出异常。

默认禁用。

## input_format_json_compact_allow_variable_number_of_columns \{#input_format_json_compact_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

允许在 JSONCompact/JSONCompactEachRow 输入格式中，每行包含可变数量的列。
对于列数多于预期的行，忽略多余的列；对于缺失的列，按默认值处理。

默认禁用。

## input_format_json_defaults_for_missing_elements_in_named_tuple \{#input_format_json_defaults_for_missing_elements_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

在解析 named tuple 时，如果 JSON 对象中缺少某些元素，则会插入默认值。
仅在启用 `input_format_json_named_tuples_as_objects` 设置时生效。

默认启用。

## input_format_json_empty_as_default \{#input_format_json_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，会将 JSON 中为空的输入字段替换为默认值。对于复杂的默认表达式，还必须同时启用 `input_format_defaults_for_omitted_fields`。

可能的取值：

+ 0 — 禁用。
+ 1 — 启用。

## input_format_json_ignore_unknown_keys_in_named_tuple \{#input_format_json_ignore_unknown_keys_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

在命名元组中，忽略 JSON 对象中未知的键。

默认启用。

## input_format_json_ignore_unnecessary_fields \{#input_format_json_ignore_unnecessary_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

忽略不必要的字段并且不对这些字段进行解析。启用该选项后，对于格式无效或包含重复字段的 JSON 字符串，可能不会抛出异常。

## input_format_json_infer_array_of_dynamic_from_array_of_different_types \{#input_format_json_infer_array_of_dynamic_from_array_of_different_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用该设置，在进行模式推断时，ClickHouse 会对包含不同数据类型值的 JSON 数组使用 Array(Dynamic) 类型。

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

默认启用。


## input_format_json_infer_incomplete_types_as_strings \{#input_format_json_infer_incomplete_types_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在模式推断期间，对在数据样本中只包含 `Null`/`{}`/`[]` 的 JSON 键使用 String 类型。
在 JSON 格式中，任何值都可以被读取为 String，通过对类型未知的键使用 String 类型，我们可以在模式推断期间避免出现类似 `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` 的错误。

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


## input_format_json_map_as_array_of_tuples \{#input_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 Map 列反序列化为由元组组成的 JSON 数组。

默认禁用。

## input_format_json_max_depth \{#input_format_json_max_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

JSON 中字段的最大嵌套深度。这不是严格意义上的限制，不一定会被精确地执行。

## input_format_json_named_tuples_as_objects \{#input_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

将命名元组列解析为 JSON 对象。

默认启用。

## input_format_json_read_arrays_as_strings \{#input_format_json_read_arrays_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将 JSON 数组解析为字符串。

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

默认情况下启用。


## input_format_json_read_bools_as_numbers \{#input_format_json_read_bools_as_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将布尔值解析为数字。

默认启用。

## input_format_json_read_bools_as_strings \{#input_format_json_read_bools_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将布尔值作为字符串进行解析。

默认启用。

## input_format_json_read_numbers_as_strings \{#input_format_json_read_numbers_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将数字以字符串形式进行解析。

默认启用。

## input_format_json_read_objects_as_strings \{#input_format_json_read_objects_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 JSON 输入格式中将 JSON 对象解析为字符串。

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


## input_format_json_throw_on_bad_escape_sequence \{#input_format_json_throw_on_bad_escape_sequence\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果 JSON 字符串在 JSON 输入格式中包含无效的转义序列，则抛出异常。若禁用，这些无效的转义序列将在数据中按原样保留。

默认启用。

## input_format_json_try_infer_named_tuples_from_objects \{#input_format_json_try_infer_named_tuples_from_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，在进行模式推断时，ClickHouse 会尝试从 JSON 对象推断命名 Tuple。
生成的命名 Tuple 将包含样本数据中所有对应 JSON 对象里的所有元素。

示例：

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

输出结果：

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

默认启用。


## input_format_json_try_infer_numbers_from_strings \{#input_format_json_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用该设置，在进行模式推断时，ClickHouse 会尝试从字符串字段中推断数值。
当 JSON 数据中包含带引号的 UInt64 数字时，这会很有用。

默认禁用。

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects \{#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects\}

<SettingsInfoBlock type="Bool" default_value="0" />

在从 JSON 对象推断 named tuple 时，如果存在路径歧义，则使用 String 类型，而不是抛出异常

## input_format_json_validate_types_from_metadata \{#input_format_json_validate_types_from_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

对于 JSON/JSONCompact/JSONColumnsWithMetadata 输入格式，如果此设置为 1，
则会将输入数据的元数据中的类型与表中对应列的类型进行比较。

默认启用。

## input_format_max_block_size_bytes \{#input_format_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

限制在解析输入格式数据时生成的数据块大小（以字节为单位）。当在 ClickHouse 端构建数据块时，适用于基于行的输入格式。
0 表示在字节数上不设上限。

## input_format_max_bytes_to_read_for_schema_inference \{#input_format_max_bytes_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

自动推断表结构时允许读取的最大数据量（以字节为单位）。

## input_format_max_rows_to_read_for_schema_inference \{#input_format_max_rows_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="25000" />

为自动推断表结构而读取的最大数据行数。

## input_format_msgpack_number_of_columns \{#input_format_msgpack_number_of_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

插入的 MsgPack 数据中的列数。用于根据数据自动推断表结构。

## input_format_mysql_dump_map_column_names \{#input_format_mysql_dump_map_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

根据列名将 MySQL dump 中表的列与 ClickHouse 表中的列进行匹配

## input_format_mysql_dump_table_name \{#input_format_mysql_dump_table_name\}

MySQL dump 中要读取数据的表名

## input_format_native_allow_types_conversion \{#input_format_native_allow_types_conversion\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 Native 输入格式中转换数据类型

## input_format_native_decode_types_in_binary_format \{#input_format_native_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 Native 输入格式中，以二进制格式读取数据类型，而不是以类型名称的形式读取

## input_format_null_as_default \{#input_format_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用以下行为：当这些字段的数据类型不是 [Nullable](/sql-reference/data-types/nullable) 时，使用[默认值](/sql-reference/statements/create/table#default_values)初始化 [NULL](/sql-reference/syntax#literals) 字段。  
如果列类型不是 Nullable 且此设置被禁用，则插入 `NULL` 会导致异常。如果列类型是 Nullable，则无论此设置如何，`NULL` 值都会按原样插入。

此设置适用于大多数输入格式。

对于复杂的默认表达式，还必须启用 `input_format_defaults_for_omitted_fields`。

可能的取值：

- 0 — 向非 Nullable 列插入 `NULL` 会导致异常。
- 1 — `NULL` 字段使用列的默认值进行初始化。

## input_format_orc_allow_missing_columns \{#input_format_orc_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 ORC 输入格式时允许列缺失

## input_format_orc_case_insensitive_column_matching \{#input_format_orc_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

在匹配 ORC 列与 ClickHouse 列时忽略大小写。

## input_format_orc_dictionary_as_low_cardinality \{#input_format_orc_dictionary_as_low_cardinality\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 ORC 文件时，将采用字典编码的 ORC 列视为 LowCardinality 列。

## input_format_orc_filter_push_down \{#input_format_orc_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

读取 ORC 文件时，可根据 WHERE/PREWHERE 表达式、最小/最大值统计信息或 ORC 元数据中的 Bloom 过滤器，跳过整个 stripe 或 row group。

## input_format_orc_reader_time_zone_name \{#input_format_orc_reader_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 行读取器使用的时区名称，默认 ORC 行读取器的时区为 GMT。

## input_format_orc_row_batch_size \{#input_format_orc_row_batch_size\}

<SettingsInfoBlock type="Int64" default_value="100000" />

读取 ORC stripe 时的行批大小。

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 ORC 格式进行模式推断时，跳过包含不受支持类型的列

## input_format_orc_use_fast_decoder \{#input_format_orc_use_fast_decoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

使用更快的 ORC 解码器实现。

## input_format_parallel_parsing \{#input_format_parallel_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对数据格式的保序并行解析。仅支持 [TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV) 和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

## input_format_parquet_allow_geoparquet_parser \{#input_format_parquet_allow_geoparquet_parser\}

<SettingsInfoBlock type="Bool" default_value="1" />

使用地理列解析器将 Array(UInt8) 解析为 Point/Linestring/Polygon/MultiLineString/MultiPolygon 类型

## input_format_parquet_allow_missing_columns \{#input_format_parquet_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 格式输入数据时允许列缺失

## input_format_parquet_bloom_filter_push_down \{#input_format_parquet_bloom_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

读取 Parquet 文件时，根据 `WHERE` 子句和 Parquet 元数据中的 Bloom 过滤器跳过整个行组。

## input_format_parquet_case_insensitive_column_matching \{#input_format_parquet_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

匹配 Parquet 列与 ClickHouse 列时忽略大小写。

## input_format_parquet_enable_json_parsing \{#input_format_parquet_enable_json_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

读取 Parquet 文件时，将 JSON 列解析为 ClickHouse 的 JSON 列。

## input_format_parquet_enable_row_group_prefetch \{#input_format_parquet_enable_row_group_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

在解析 Parquet 时启用行组预取。目前只有单线程解析支持预取。

## input_format_parquet_filter_push_down \{#input_format_parquet_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时，根据 WHERE/PREWHERE 表达式以及 Parquet 元数据中的最小/最大统计信息跳过整个行组（row group）。

## input_format_parquet_local_file_min_bytes_for_seek \{#input_format_parquet_local_file_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

在 Parquet 输入格式中，对本地文件进行读取时，执行 seek 而不是通过读取并忽略数据的方式所需的最小字节数

## input_format_parquet_local_time_as_utc \{#input_format_parquet_local_time_as_utc\}

<SettingsInfoBlock type="Bool" default_value="1" />

确定在 `isAdjustedToUTC=false` 时，schema 在推断 Parquet 时间戳时所使用的数据类型。若为 true：`DateTime64(..., 'UTC')`；若为 false：`DateTime64(...)`。两种行为都并不完全正确，因为 ClickHouse 没有用于本地挂钟时间（local wall-clock time）的数据类型。与直觉相反，`true` 可能是相对“没那么错误”的选项，因为将带有 `'UTC'` 的时间戳格式化为 `String` 时，会得到正确本地时间的字符串表示。

## input_format_parquet_max_block_size \{#input_format_parquet_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Parquet 读取器的最大数据块大小。

## input_format_parquet_memory_high_watermark \{#input_format_parquet_memory_high_watermark\}

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Parquet 读取器 v3 的近似内存使用上限。用于限制可并行读取的行组或列的数量。在一次查询中读取多个文件时，该上限作用于这些文件的总内存使用量。

## input_format_parquet_memory_low_watermark \{#input_format_parquet_memory_low_watermark\}

<SettingsInfoBlock type="UInt64" default_value="2097152" />

如果内存使用量低于该阈值，则会更积极地调度预取任务。例如在需要通过网络读取大量小型布隆过滤器时，这可能会很有用。

## input_format_parquet_page_filter_push_down \{#input_format_parquet_page_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

利用列索引中的最小值和最大值来跳过数据页。

## input_format_parquet_prefer_block_bytes \{#input_format_parquet_prefer_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Parquet 读取器输出的平均块大小（字节）

## input_format_parquet_preserve_order \{#input_format_parquet_preserve_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

从 Parquet 文件读取数据时避免更改行的顺序。由于通常无法保证行顺序，并且查询管道的其他部分也可能打乱该顺序，因此不推荐启用该设置。请改用 `ORDER BY _row_number`。

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 Parquet 格式进行模式推断时，跳过所有类型不受支持的列

## input_format_parquet_use_native_reader_v3 \{#input_format_parquet_use_native_reader_v3\}

<SettingsInfoBlock type="Bool" default_value="1" />

使用 Parquet v3 读取器。

## input_format_parquet_use_offset_index \{#input_format_parquet_use_offset_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

在未使用页过滤时，略微调整从 Parquet 文件读取页的方式。

## input_format_parquet_verify_checksums \{#input_format_parquet_verify_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

在读取 Parquet 文件时验证页校验和。

## input_format_protobuf_flatten_google_wrappers \{#input_format_protobuf_flatten_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

为常规的非嵌套列启用 Google wrappers，例如对 String 列 `str` 使用 `google.protobuf.StringValue` 字段 `str`。对于 Nullable 列，空的 wrapper 会被识别为默认值，缺失的 wrapper 会被识别为 null。

## input_format_protobuf_oneof_presence \{#input_format_protobuf_oneof_presence\}

<SettingsInfoBlock type="Bool" default_value="0" />

通过在一个特殊列中设置枚举值，指示已找到 protobuf oneof 中的哪个字段

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对 Protobuf 格式进行模式推断时，跳过类型不受支持的字段

## input_format_record_errors_file_path \{#input_format_record_errors_file_path\}

用于记录在读取文本格式（CSV、TSV）时出现错误的文件路径。

## input_format_skip_unknown_fields \{#input_format_skip_unknown_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用在插入时跳过包含多余列的数据。

写入数据时，如果输入数据包含目标表中不存在的列，ClickHouse 会抛出异常。若启用了跳过功能，ClickHouse 不会插入这些多余列的数据，也不会抛出异常。

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

## input_format_try_infer_dates \{#input_format_try_infer_dates\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，ClickHouse 会在对文本格式的数据执行 schema 推断时，尝试从字符串字段中推断出 `Date` 类型。如果输入数据中某一列的所有字段都成功解析为日期，则结果类型为 `Date`；如果至少有一个字段未能解析为日期，则结果类型为 `String`。

默认启用。

## input_format_try_infer_datetimes \{#input_format_try_infer_datetimes\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用此设置，ClickHouse 会在文本格式的模式推断中尝试将字符串字段推断为 `DateTime64` 类型。如果输入数据中某一列的所有字段都能成功解析为 DateTime，则结果类型为 `DateTime64`；如果至少有一个字段无法解析为 DateTime，则结果类型为 `String`。

默认启用。

## input_format_try_infer_datetimes_only_datetime64 \{#input_format_try_infer_datetimes_only_datetime64\}

<SettingsInfoBlock type="Bool" default_value="0" />

当启用 `input_format_try_infer_datetimes` 时，仅推断为 `DateTime64` 类型，而不推断为 `DateTime` 类型。

## input_format_try_infer_exponent_floats \{#input_format_try_infer_exponent_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

在对文本格式进行模式推断时，尝试将指数表示法的数值识别为浮点数（JSON 除外，其中带指数的数字始终会被推断）

## input_format_try_infer_integers \{#input_format_try_infer_integers\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用后，ClickHouse 会在文本格式的模式推断中尝试将数值推断为整数而不是浮点数。如果输入数据中该列的所有数字都是整数，则结果类型为 `Int64`；如果至少有一个数字是浮点数，则结果类型为 `Float64`。

默认启用。

## input_format_try_infer_variants \{#input_format_try_infer_variants\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果启用，ClickHouse 会在文本格式的 schema 推断中，当某个列或数组元素存在多个可能类型时，尝试将其推断为 [`Variant`](../../sql-reference/data-types/variant.md) 类型。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

## input_format_tsv_allow_variable_number_of_columns \{#input_format_tsv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 TSV 输入中忽略多余的列（当文件中的列多于预期时），并将 TSV 输入中缺失的字段按默认值处理

## input_format_tsv_crlf_end_of_line \{#input_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果将其设置为 true，`file` 函数将按使用 \\r\\n 而不是 \\n 作为行结束符的 TSV 格式进行读取。

## input_format_tsv_detect_header \{#input_format_tsv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 TSV 格式中自动检测包含列名和类型的表头行

## input_format_tsv_empty_as_default \{#input_format_tsv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 TSV 格式输入中的空字段按默认值处理。

## input_format_tsv_enum_as_number \{#input_format_tsv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 TSV 格式中，将插入的枚举值按枚举索引处理。

## input_format_tsv_skip_first_lines \{#input_format_tsv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

跳过 TSV 格式数据开头的指定数量的行

## input_format_tsv_skip_trailing_empty_lines \{#input_format_tsv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 TSV 格式中跳过末尾空行

## input_format_tsv_use_best_effort_in_schema_inference \{#input_format_tsv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 TSV 格式中使用一些优化和启发式方法来推断表结构

## input_format_values_accurate_types_of_literals \{#input_format_values_accurate_types_of_literals\}

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式：在使用模板解析和求值表达式时，检查字面量的实际类型，以避免可能的溢出和精度问题。

## input_format_values_deduce_templates_of_expressions \{#input_format_values_deduce_templates_of_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式：如果字段无法由流式解析器解析，则运行 SQL 解析器，推断该 SQL 表达式的 Template，然后尝试使用该 Template 解析所有行，并对所有行执行表达式求值。

## input_format_values_interpret_expressions \{#input_format_values_interpret_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

对于 Values 格式：如果流式解析器无法解析该字段，则运行 SQL 解析器并尝试将其解释为 SQL 表达式。

## input_format_with_names_use_header \{#input_format_with_names_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对插入数据的列顺序进行检查。

为了提升插入性能，如果可以确保输入数据的列顺序与目标表相同，建议禁用此检查。

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

## input_format_with_types_use_header \{#input_format_with_types_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制格式解析器是否检查输入数据中的数据类型与目标表中的数据类型是否匹配。

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

## insert_distributed_one_random_shard \{#insert_distributed_one_random_shard\}

<SettingsInfoBlock type="Bool" default_value="0" />

在没有分布键时，启用或禁用向 [Distributed](/engines/table-engines/special/distributed) 表随机选择分片进行插入。

默认情况下，当向包含多个分片的 `Distributed` 表插入数据且未指定分布键时，ClickHouse 服务器会拒绝该插入请求。当 `insert_distributed_one_random_shard = 1` 时，则允许插入，数据会在所有分片之间随机转发。

可能的取值：

- 0 — 如果存在多个分片且未提供分布键，则拒绝插入。
- 1 — 在未提供分布键时，在所有可用分片之间随机执行插入。

## interval_output_format \{#interval_output_format\}

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

允许为区间类型的文本表示选择不同的输出格式。

可能的取值：

-   `kusto` - KQL 风格的输出格式。

    ClickHouse 以 [KQL 格式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier) 输出区间。例如，`toIntervalDay(2)` 会被格式化为 `2.00:00:00`。请注意，对于长度可变的区间类型（即 `IntervalMonth` 和 `IntervalYear`），会考虑每个区间对应的平均秒数。

-   `numeric` - 数值输出格式。

    ClickHouse 将区间输出为其底层的数值表示。例如，`toIntervalDay(2)` 会被格式化为 `2`。

另请参阅：

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories \{#into_outfile_create_parent_directories\}

<SettingsInfoBlock type="Bool" default_value="0" />

在使用 INTO OUTFILE 时，如果父目录尚不存在，则会自动创建父目录。

## json_type_escape_dots_in_keys \{#json_type_escape_dots_in_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，在解析过程中会对 JSON 键名中的点号进行转义。

## output_format_arrow_compression_method \{#output_format_arrow_compression_method\}

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Arrow 输出格式使用的压缩算法。支持的编解码器：lz4_frame、zstd、none（不压缩）

## output_format_arrow_fixed_string_as_fixed_byte_array \{#output_format_arrow_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

对 FixedString 列使用 Arrow 的 FIXED_SIZE_BINARY 类型，而不是 Binary 类型。

## output_format_arrow_low_cardinality_as_dictionary \{#output_format_arrow_low_cardinality_as_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用将 LowCardinality 类型以 Arrow 的 Dictionary 类型输出

## output_format_arrow_string_as_string \{#output_format_arrow_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

对 String 列使用 Arrow String 类型而非 Binary 类型

## output_format_arrow_use_64_bit_indexes_for_dictionary \{#output_format_arrow_use_64_bit_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 Arrow 格式中对字典索引一律使用 64 位整数

## output_format_arrow_use_signed_indexes_for_dictionary \{#output_format_arrow_use_signed_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 Arrow 格式中对字典索引使用有符号整数

## output_format_avro_codec \{#output_format_avro_codec\}

输出时使用的压缩编解码器。可选值：'null'、'deflate'、'snappy'、'zstd'。

## output_format_avro_rows_in_file \{#output_format_avro_rows_in_file\}

<SettingsInfoBlock type="UInt64" default_value="1" />

文件中的最大行数（如果存储允许）

## output_format_avro_string_column_pattern \{#output_format_avro_string_column_pattern\}

对于 Avro 格式：用于匹配要作为 AVRO 字符串处理的 String 列的正则表达式。

## output_format_avro_sync_interval \{#output_format_avro_sync_interval\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

同步间隔，单位为字节。

## output_format_binary_encode_types_in_binary_format \{#output_format_binary_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinaryWithNamesAndTypes 输出格式中，将数据类型写成二进制格式，而不是类型名称

## output_format_binary_write_json_as_string \{#output_format_binary_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 RowBinary 输出格式中，将 [JSON](../../sql-reference/data-types/newjson.md) 数据类型的值写出为 JSON [String](../../sql-reference/data-types/string.md) 值。

## output_format_bson_string_as_string \{#output_format_bson_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

对于 String 列，使用 BSON String 类型而不是 Binary 类型。

## output_format_compression_level \{#output_format_compression_level\}

<SettingsInfoBlock type="UInt64" default_value="3" />

当查询输出启用压缩时使用的默认压缩级别。该设置在 `SELECT` 查询带有 `INTO OUTFILE` 子句时，或在向表函数 `file`、`url`、`hdfs`、`s3` 或 `azureBlobStorage` 写入数据时生效。

可选值：从 `1` 到 `22`

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\}

<SettingsInfoBlock type="UInt64" default_value="0" />

可在输出压缩方法为 `zstd` 时使用。若值大于 `0`，此设置会显式指定压缩窗口大小（`2` 的幂），并为 zstd 压缩启用 long-range 模式，从而有助于获得更高的压缩比。

可能的取值：非负数。注意如果该值过小或过大，`zstdlib` 将抛出异常。典型取值范围为 `20`（窗口大小 = `1MB`）到 `30`（窗口大小 = `1GB`）。

## output_format_csv_crlf_end_of_line \{#output_format_csv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

当将其设置为 true 时，CSV 格式中的行尾将使用 \\r\\n 而不是 \\n。

## output_format_csv_serialize_tuple_into_separate_columns \{#output_format_csv_serialize_tuple_into_separate_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果将其设为 true，则在 CSV 格式中，元组会被序列化为独立的列（即其在元组中的嵌套结构会丢失）。

## output_format_decimal_trailing_zeros \{#output_format_decimal_trailing_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

在输出 Decimal 值时保留末尾的零。例如将 1.23 输出为 1.230000。

默认禁用。

## output_format_json_array_of_rows \{#output_format_json_array_of_rows\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用将所有行以 JSON 数组形式输出（使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式）。

可能的取值：

* 1 — ClickHouse 将所有行作为一个数组输出，其中每一行使用 `JSONEachRow` 格式。
* 0 — ClickHouse 将每一行分别输出，使用 `JSONEachRow` 格式。

**启用该设置的查询示例**

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

**设置禁用时的查询示例**

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


## output_format_json_escape_forward_slashes \{#output_format_json_escape_forward_slashes\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制在 JSON 输出格式中，对字符串输出中的正斜杠进行转义。此选项用于与 JavaScript 保持兼容性。不要与始终会被转义的反斜杠混淆。

默认启用。

## output_format_json_map_as_array_of_tuples \{#output_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 Map 类型列序列化为由元组组成的 JSON 数组。

默认禁用。

## output_format_json_named_tuples_as_objects \{#output_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

将具名元组列序列化为 JSON 对象。

默认情况下启用。

## output_format_json_pretty_print \{#output_format_json_pretty_print\}

<SettingsInfoBlock type="Bool" default_value="1" />

此设置用于控制在使用 JSON 输出格式时，`data` 数组中 Tuples、Maps 和 Arrays 等嵌套结构的显示方式。

例如，输出不会是：

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

输出将被格式化为：

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


## output_format_json_quote_64bit_floats \{#output_format_json_quote_64bit_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在以 JSON* 格式输出时是否对 64 位 [浮点数](../../sql-reference/data-types/float.md) 使用引号。

默认情况下禁用。

## output_format_json_quote_64bit_integers \{#output_format_json_quote_64bit_integers\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制在以 [JSON](/interfaces/formats/JSON) 格式输出时，是否对 64 位或更大[整数](../../sql-reference/data-types/int-uint.md)（如 `UInt64` 或 `Int128`）加引号。  
默认情况下，此类整数会被包裹在引号中。该行为与大多数 JavaScript 实现兼容。

可能的取值：

- 0 — 整数输出时不加引号。
- 1 — 整数输出时包裹在引号中。

## output_format_json_quote_decimals \{#output_format_json_quote_decimals\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 JSON 输出格式中为小数加引号。

默认禁用。

## output_format_json_quote_denormals \{#output_format_json_quote_denormals\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 [JSON](/interfaces/formats/JSON) 输出格式中启用对 `+nan`、`-nan`、`+inf`、`-inf` 的输出。

可能的取值：

* 0 — 关闭。
* 1 — 开启。

**示例**

考虑下列表 `account_orders`：

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

当 `output_format_json_quote_denormals = 0` 时，查询在输出结果中返回 `null` 值：

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

当 `output_format_json_quote_denormals = 1` 时，该查询返回：

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


## output_format_json_skip_null_value_in_named_tuples \{#output_format_json_skip_null_value_in_named_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

在将命名元组列序列化为 JSON 对象时，忽略值为 null 的键值对。仅在 `output_format_json_named_tuples_as_objects` 为 true 时生效。

## output_format_json_validate_utf8 \{#output_format_json_validate_utf8\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 JSON 输出格式中验证 UTF-8 序列，不影响 JSON/JSONCompact/JSONColumnsWithMetadata 格式，这些格式始终会验证 UTF-8。

默认禁用。

## output_format_markdown_escape_special_characters \{#output_format_markdown_escape_special_characters\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，会在 Markdown 中对特殊字符进行转义。

[CommonMark](https://spec.commonmark.org/0.30/#example-12) 定义了以下可以被转义的特殊字符：

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

可选值：

* 0 — 禁用。
* 1 — 启用。


## output_format_msgpack_uuid_representation \{#output_format_msgpack_uuid_representation\}

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

指定在 MsgPack 格式中输出 UUID 的方式。

## output_format_native_encode_types_in_binary_format \{#output_format_native_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

在 Native 输出格式中，以二进制格式输出数据类型，而不是输出类型名称

## output_format_native_use_flattened_dynamic_and_json_serialization \{#output_format_native_use_flattened_dynamic_and_json_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

以扁平化格式写入 [JSON](../../sql-reference/data-types/newjson.md) 和 [Dynamic](../../sql-reference/data-types/dynamic.md) 列的数据（将所有类型和路径作为独立的子列）。

## output_format_native_write_json_as_string \{#output_format_native_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 [JSON](../../sql-reference/data-types/newjson.md) 列的数据写入为包含 JSON 字符串的 [String](../../sql-reference/data-types/string.md) 列，而不是采用默认的原生 JSON 序列化方式。

## output_format_orc_compression_block_size \{#output_format_orc_compression_block_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

ORC 输出格式的压缩块大小（字节）。

## output_format_orc_compression_method \{#output_format_orc_compression_method\}

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

ORC 输出格式的压缩方法。支持的编解码器：lz4、snappy、zlib、zstd、none（不压缩）

## output_format_orc_dictionary_key_size_threshold \{#output_format_orc_dictionary_key_size_threshold\}

<SettingsInfoBlock type="Double" default_value="0" />

对于 ORC 输出格式中的字符串列，如果不同取值的数量大于非空行总数中该参数所设定的比例，则关闭字典编码；否则启用字典编码。

## output_format_orc_row_index_stride \{#output_format_orc_row_index_stride\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 输出格式中的目标行索引步长

## output_format_orc_string_as_string \{#output_format_orc_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

对 String 列使用 ORC String 类型而非 Binary 类型

## output_format_orc_writer_time_zone_name \{#output_format_orc_writer_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 写入器使用的时区名称，默认时区为 GMT。

## output_format_parallel_formatting \{#output_format_parallel_formatting\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用或禁用对数据的并行格式化。仅支持 [TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV) 和 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式。

可能的取值：

- 1 — 启用。
- 0 — 禁用。

## output_format_parquet_batch_size \{#output_format_parquet_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

每处理指定数量的行后检查一次页大小。如果某些列的平均数据大小超过数 KB，建议相应减小该值。

## output_format_parquet_bloom_filter_bits_per_value \{#output_format_parquet_bloom_filter_bits_per_value\}

<SettingsInfoBlock type="Double" default_value="10.5" />

在 Parquet 布隆过滤器中为每个不同的值使用的大致比特数。估算的误报率为：

*  6   bits - 10%
  * 10.5 bits -  1%
  * 16.9 bits -  0.1%
  * 26.4 bits -  0.01%
  * 41   bits -  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes \{#output_format_parquet_bloom_filter_flush_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

在 parquet 文件中的哪个位置放置 Bloom 过滤器。Bloom 过滤器将按大致该大小分组写入。具体来说：

* 如果为 0，则每个行组的 Bloom 过滤器会在该行组之后立即写入，
  * 如果大于所有 Bloom 过滤器的总大小，则会在内存中累积所有行组的 Bloom 过滤器，然后在文件接近末尾的位置一次性写入，
  * 否则，会在内存中累积 Bloom 过滤器，并在其总大小超过该值时写入。

## output_format_parquet_compliant_nested_types \{#output_format_parquet_compliant_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 parquet 文件的 schema 中，对列表元素使用名称 `element` 而不是 `item`。这是 Arrow 库实现遗留下来的历史产物。通常会提升兼容性，但在某些旧版本的 Arrow 上可能例外。

## output_format_parquet_compression_method \{#output_format_parquet_compression_method\}

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Parquet 输出格式的压缩方法。支持的编解码器：snappy、lz4、brotli、zstd、gzip、none（不压缩）

## output_format_parquet_data_page_size \{#output_format_parquet_data_page_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

压缩前的目标页大小（以字节为单位）。

## output_format_parquet_date_as_uint16 \{#output_format_parquet_date_as_uint16\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 Date 值写入为普通的 16 位整数（读取时为 UInt16），而不是转换为 32 位的 Parquet DATE 类型（读取时为 Date32）。

## output_format_parquet_datetime_as_uint32 \{#output_format_parquet_datetime_as_uint32\}

<SettingsInfoBlock type="Bool" default_value="0" />

将 DateTime 值写为原始 Unix 时间戳（读取时为 UInt32），而不是转换为毫秒（读取时为 DateTime64(3)）。

## output_format_parquet_enum_as_byte_array \{#output_format_parquet_enum_as_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

写出枚举值时使用 Parquet 物理类型 BYTE_ARRAY 和逻辑类型 ENUM

## output_format_parquet_fixed_string_as_fixed_byte_array \{#output_format_parquet_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

对于 FixedString 列，使用 Parquet 的 FIXED_LEN_BYTE_ARRAY 类型，而非 Binary 类型。

## output_format_parquet_geometadata \{#output_format_parquet_geometadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

允许在 Parquet 元数据中写入地理空间列的信息，并将这些列编码为 WKB 格式。

## output_format_parquet_max_dictionary_size \{#output_format_parquet_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

如果字典大小增长超过此字节数，则切换为不使用字典的编码方式。将其设置为 0 可禁用字典编码。

## output_format_parquet_parallel_encoding \{#output_format_parquet_parallel_encoding\}

<SettingsInfoBlock type="Bool" default_value="1" />

在多个线程中进行 Parquet 编码。需要启用 `output_format_parquet_use_custom_encoder`。

## output_format_parquet_row_group_size \{#output_format_parquet_row_group_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

目标 row group 大小（以行数为单位）。

## output_format_parquet_row_group_size_bytes \{#output_format_parquet_row_group_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="536870912" />

目标 row group 的大小（字节），按压缩前的数据计算。

## output_format_parquet_string_as_string \{#output_format_parquet_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

对 String 列使用 Parquet 的 String 类型，而不是 Binary 类型。

## output_format_parquet_use_custom_encoder \{#output_format_parquet_use_custom_encoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

使用更高效的 Parquet 编码器实现。

## output_format_parquet_version \{#output_format_parquet_version\}

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

Parquet 输出格式所使用的版本。支持的版本：1.0、2.4、2.6 和 2.latest（默认）。

## output_format_parquet_write_bloom_filter \{#output_format_parquet_write_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 parquet 文件中写入布隆过滤器。需要 output_format_parquet_use_custom_encoder = true。

## output_format_parquet_write_checksums \{#output_format_parquet_write_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

将 crc32 校验和写入 Parquet 页头。

## output_format_parquet_write_page_index \{#output_format_parquet_write_page_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

将列索引和偏移索引（即每个数据页的统计信息，可在读取时用于过滤下推）写入 Parquet 文件。

## output_format_pretty_color \{#output_format_pretty_color\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

在 Pretty 格式中使用 ANSI 转义码。0 - 禁用，1 - 启用，'auto' - 在终端环境下启用。

## output_format_pretty_display_footer_column_names \{#output_format_pretty_display_footer_column_names\}

<SettingsInfoBlock type="UInt64" default_value="1" />

当表中有很多行时，在页脚显示列名。

可能的取值：

* 0 — 在页脚中不显示列名。
* 1 — 当行数大于或等于由 [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) 设置的阈值时（默认 50），在页脚显示列名。

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


## output_format_pretty_display_footer_column_names_min_rows \{#output_format_pretty_display_footer_column_names_min_rows\}

<SettingsInfoBlock type="UInt64" default_value="50" />

设置在启用 [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) 时显示包含列名页脚所需的最小行数。

## output_format_pretty_fallback_to_vertical \{#output_format_pretty_fallback_to_vertical\}

<SettingsInfoBlock type="Bool" default_value="1" />

当启用该设置且表很宽但行数较少时，Pretty 格式会按 Vertical 格式的方式输出表数据。
有关该行为的精细调整，请参阅 `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` 和 `output_format_pretty_fallback_to_vertical_min_table_width`。

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk \{#output_format_pretty_fallback_to_vertical_max_rows_per_chunk\}

<SettingsInfoBlock type="UInt64" default_value="10" />

仅当一个 chunk 中的行数不超过指定值时，才会回退到 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_fallback_to_vertical_min_columns \{#output_format_pretty_fallback_to_vertical_min_columns\}

<SettingsInfoBlock type="UInt64" default_value="5" />

仅当列数大于指定值时，才会触发回退为 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_fallback_to_vertical_min_table_width \{#output_format_pretty_fallback_to_vertical_min_table_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

仅当表中所有列的长度之和至少达到指定值，或者至少有一个值包含换行符时，才会启用回退为 Vertical 格式（参见 `output_format_pretty_fallback_to_vertical`）。

## output_format_pretty_glue_chunks \{#output_format_pretty_glue_chunks\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

如果以 Pretty 格式渲染的数据是分多个数据块到达的，即使中间有延迟，但下一个数据块的列宽与前一个相同，则使用 ANSI 转义序列回到上一行并覆盖前一个数据块的尾部，将其与新数据块的数据衔接起来。这样可以让结果在视觉上更友好。

0 - 禁用，1 - 启用，'auto' - 在终端环境中启用。

## output_format_pretty_grid_charset \{#output_format_pretty_grid_charset\}

<SettingsInfoBlock type="String" default_value="UTF-8" />

用于输出网格边框的字符集。可用字符集：ASCII、UTF-8（默认）。

## output_format_pretty_highlight_digit_groups \{#output_format_pretty_highlight_digit_groups\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，并且输出目标是终端，则将每个表示千、百万等数量级的数字用下划线高亮显示。

## output_format_pretty_highlight_trailing_spaces \{#output_format_pretty_highlight_trailing_spaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用且输出为终端，则会以灰色下划线高亮显示行尾空格。

## output_format_pretty_max_column_name_width_cut_to \{#output_format_pretty_max_column_name_width_cut_to\}

<SettingsInfoBlock type="UInt64" default_value="24" />

如果列名太长，将其截断为此长度。  
当列名长度大于 `output_format_pretty_max_column_name_width_cut_to` 加上 `output_format_pretty_max_column_name_width_min_chars_to_cut` 时，将会被截断。

## output_format_pretty_max_column_name_width_min_chars_to_cut \{#output_format_pretty_max_column_name_width_min_chars_to_cut\}

<SettingsInfoBlock type="UInt64" default_value="4" />

当列名过长时至少要截断的字符数。  
如果列名长度大于 `output_format_pretty_max_column_name_width_cut_to` 加上 `output_format_pretty_max_column_name_width_min_chars_to_cut`，则该列名会被截断。

## output_format_pretty_max_column_pad_width \{#output_format_pretty_max_column_pad_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

在 Pretty 格式中，为列中所有值填充时允许的最大宽度。

## output_format_pretty_max_rows \{#output_format_pretty_max_rows\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Pretty 格式的行数上限。

## output_format_pretty_max_value_width \{#output_format_pretty_max_value_width\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

在 Pretty 格式中显示的值的最大显示宽度。如果超过该宽度，值将被截断。
值 0 表示永不截断。

## output_format_pretty_max_value_width_apply_for_single_value \{#output_format_pretty_max_value_width_apply_for_single_value\}

<SettingsInfoBlock type="UInt64" default_value="0" />

仅当块中包含不止一个值时才截断值（参见 `output_format_pretty_max_value_width` 设置）。否则应完整输出，这对于 `SHOW CREATE TABLE` 查询非常有用。

## output_format_pretty_multiline_fields \{#output_format_pretty_multiline_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

如果启用，Pretty 格式会在表格单元格内渲染多行字段，从而保持表格的整体结构。
如果未启用，它们将按原样渲染，可能会使表格变形（关闭该选项的一个好处是复制粘贴多行值会更方便）。

## output_format_pretty_named_tuples_as_json \{#output_format_pretty_named_tuples_as_json\}

<SettingsInfoBlock type="Bool" default_value="1" />

控制是否将 Pretty 格式中的命名元组以格式化的 JSON 对象形式输出。

## output_format_pretty_row_numbers \{#output_format_pretty_row_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 Pretty 输出格式中为每一行添加行号

## output_format_pretty_single_large_number_tip_threshold \{#output_format_pretty_single_large_number_tip_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

当数据块仅包含一个数值且该数值超过此阈值（不包括 0）时，会在表格右侧输出一个更易读的数字提示。

## output_format_pretty_squash_consecutive_ms \{#output_format_pretty_squash_consecutive_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

在写入之前，最多等待指定的毫秒数以获取下一个数据块，并将其与前一个数据块合并。
这可以避免过于频繁地输出过小的数据块，同时仍然允许以流式方式显示数据。

## output_format_pretty_squash_max_wait_ms \{#output_format_pretty_squash_max_wait_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

如果自上一次输出以来经过的时间超过指定的毫秒数，则以 Pretty 格式输出当前等待输出的数据块。

## output_format_protobuf_nullables_with_google_wrappers \{#output_format_protobuf_nullables_with_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

在使用 Google 包装类型（wrapper）序列化 Nullable 列时，将默认值序列化为空包装器。若关闭该选项，则默认值和 null 值都不会被序列化。

## output_format_schema \{#output_format_schema\}

指定以 [Cap'n Proto](/interfaces/formats/CapnProto) 或 [Protobuf](/interfaces/formats/Protobuf) 格式自动生成的 schema 所保存的文件路径。

## output_format_sql_insert_include_column_names \{#output_format_sql_insert_include_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

在 INSERT 查询中包含列名

## output_format_sql_insert_max_batch_size \{#output_format_sql_insert_max_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

一条 INSERT 语句中包含的最大行数。

## output_format_sql_insert_quote_names \{#output_format_sql_insert_quote_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

使用 '`' 字符括起列名

## output_format_sql_insert_table_name \{#output_format_sql_insert_table_name\}

<SettingsInfoBlock type="String" default_value="table" />

输出 INSERT 查询中使用的表的名称

## output_format_sql_insert_use_replace \{#output_format_sql_insert_use_replace\}

<SettingsInfoBlock type="Bool" default_value="0" />

使用 REPLACE 语句替代 INSERT

## output_format_tsv_crlf_end_of_line \{#output_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果设置为 true，TSV 格式中的行尾将使用 \\r\\n 而不是 \\n。

## output_format_values_escape_quote_with_quote \{#output_format_values_escape_quote_with_quote\}

<SettingsInfoBlock type="Bool" default_value="0" />

如果为 true，则使用 `''` 对 `'` 进行转义，否则使用 `\\'`。

## output_format_write_statistics \{#output_format_write_statistics\}

<SettingsInfoBlock type="Bool" default_value="1" />

在支持的输出格式中写入关于读取行数、字节数以及耗时的统计信息。

默认启用

## precise_float_parsing \{#precise_float_parsing\}

<SettingsInfoBlock type="Bool" default_value="0" />

优先采用更精确（但更慢）的浮点数解析算法

## schema_inference_hints \{#schema_inference_hints\}

在对无 schema 的格式进行 schema 推断时，用作提示的列名和类型列表。

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
如果 `schema_inference_hints` 的格式不正确，或者其中存在拼写错误、错误的数据类型等问题，整个 `schema_inference_hints` 都会被忽略。
:::


## schema_inference_make_columns_nullable \{#schema_inference_make_columns_nullable\}

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

控制是否在模式推断（schema inference）中将推断出的类型设置为 `Nullable`。
可能的取值：

* 0 - 推断出的类型永远不会是 `Nullable`（在这种情况下，使用 input_format_null_as_default 来控制如何处理空值），
 * 1 - 所有推断出的类型都将是 `Nullable`，
 * 2 或 `auto` - 只有当在模式推断期间解析的样本数据中该列包含 `NULL`，或文件元数据中包含关于列可空性的相关信息时，推断出的类型才会是 `Nullable`，
 * 3 - 如果格式具有文件元数据（例如 Parquet），则推断出的类型可空性将与文件元数据一致，否则（例如 CSV）始终为 `Nullable`。

## schema_inference_make_json_columns_nullable \{#schema_inference_make_json_columns_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

控制是否在 schema 推断中将推断得到的 JSON 类型设为 `Nullable`。
如果此设置与 schema_inference_make_columns_nullable 一同启用，则推断得到的 JSON 类型将为 `Nullable`。

## schema_inference_mode \{#schema_inference_mode\}

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

推断表结构的模式。`default` —— 假定所有文件都具有相同的表结构，并且可以从任意一个文件推断出表结构；`union` —— 各文件可以具有不同的表结构，最终的表结构应为所有文件表结构的并集。

## show_create_query_identifier_quoting_rule \{#show_create_query_identifier_quoting_rule\}

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

设置 SHOW CREATE 查询中标识符的引号规则

## show_create_query_identifier_quoting_style \{#show_create_query_identifier_quoting_style\}

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

设置 SHOW CREATE 查询中标识符的引用风格

## type_json_allow_duplicated_key_with_literal_and_nested_object \{#type_json_allow_duplicated_key_with_literal_and_nested_object\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，将允许解析类似 `{"a" : 42, "a" : {"b" : 42}}` 的 JSON，即某个键被重复使用，但其中一个对应的值是嵌套对象的情况。

## type_json_skip_duplicated_paths \{#type_json_skip_duplicated_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，在将 JSON 对象解析为 JSON 类型时，会忽略重复的路径，只插入第一个出现的路径，而不是抛出异常。

## type_json_skip_invalid_typed_paths \{#type_json_skip_invalid_typed_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

启用后，在带有 typed path 的 JSON 类型列中，对于那些其值无法转换为声明类型的字段，将被跳过，而不是抛出错误。被跳过的字段会被视为缺失，并会根据 typed path 定义使用默认值或 NULL 值。

此设置仅适用于 JSON 类型列（例如，JSON(a Int64, b String)），即为特定路径显式声明了类型的情况。当插入到常规显式类型列中时，它不适用于诸如 JSONEachRow 之类的常规 JSON 输入格式。

可能的取值：

+ 0 — 禁用（在类型不匹配时抛出错误）。
+ 1 — 启用（在类型不匹配时跳过字段）。

## type_json_use_partial_match_to_skip_paths_by_regexp \{#type_json_use_partial_match_to_skip_paths_by_regexp\}

<SettingsInfoBlock type="Bool" default_value="1" />

启用时，在将 JSON 对象解析为 JSON 类型期间，使用 SKIP REGEXP 指定的正则表达式只需部分匹配即可跳过某个路径。禁用时，则需要完全匹配才能跳过路径。

## validate_experimental_and_suspicious_types_inside_nested_types \{#validate_experimental_and_suspicious_types_inside_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

验证在 Array/Map/Tuple 等嵌套类型中使用实验性或可疑类型的情况