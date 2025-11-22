---
title: "フォーマット設定"
sidebar_label: "フォーマット設定"
slug: /operations/settings/formats
toc_max_heading_level: 2
description: "入力および出力フォーマットを制御する設定。"
doc_type: "reference"
---

import ExperimentalBadge from "@theme/badges/ExperimentalBadge"
import BetaBadge from "@theme/badges/BetaBadge"
import SettingsInfoBlock from "@theme/SettingsInfoBlock/SettingsInfoBlock"
import VersionHistory from "@theme/VersionHistory/VersionHistory"

<!-- 自動生成 -->

これらの設定は[ソース](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h)から自動生成されています。


## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}

<SettingsInfoBlock type='Bool' default_value='0' />

Variant型内のBool値を、"on"、"off"、"enable"、"disable"などの特殊なテキストブール値から解析することを許可します。


## bool_false_representation {#bool_false_representation}

<SettingsInfoBlock type='String' default_value='false' />

TSV/CSV/Vertical/Pretty形式でfalseのブール値を表すテキスト。


## bool_true_representation {#bool_true_representation}

<SettingsInfoBlock type='String' default_value='true' />

TSV/CSV/Vertical/Pretty形式でtrueのブール値を表すテキスト。


## column_names_for_schema_inference {#column_names_for_schema_inference}

カラム名を持たないフォーマットに対するスキーマ推論で使用するカラム名のリスト。形式: 'column1,column2,column3,...'


## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}

<SettingsInfoBlock type='UInt64' default_value='1' />

WHERE句に結合式が存在する場合、カンマ結合/クロス結合の代わりに内部結合を使用します。値: 0 - 書き換えなし、1 - カンマ結合/クロス結合で可能な場合に適用、2 - すべてのカンマ結合を強制的に書き換え、クロス結合は可能な場合


## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}

<SettingsInfoBlock type='Bool' default_value='0' />

datetime64値の末尾のゼロを動的に削除し、出力スケールを[0, 3, 6]に調整します。
これらはそれぞれ「秒」、「ミリ秒」、「マイクロ秒」に対応します


## date_time_input_format {#date_time_input_format}

<SettingsInfoBlock type='DateTimeInputFormat' default_value='basic' />

日付と時刻のテキスト表現のパーサーを選択できます。

この設定は[日付と時刻の関数](../../sql-reference/functions/date-time-functions.md)には適用されません。

設定可能な値:

- `'best_effort'` — 拡張パースを有効にします。

  ClickHouseは基本的な`YYYY-MM-DD HH:MM:SS`形式と、すべての[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)日付と時刻の形式を解析できます。例: `'2018-06-08T01:02:03.000Z'`

- `'best_effort_us'` — `best_effort`と同様です(相違点については[parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)を参照してください)

- `'basic'` — 基本パーサーを使用します。

  ClickHouseは基本的な`YYYY-MM-DD HH:MM:SS`または`YYYY-MM-DD`形式のみを解析できます。例: `2019-08-20 10:18:56`または`2019-08-20`

Cloudのデフォルト値: `'best_effort'`

関連項目:

- [DateTimeデータ型](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)


## date_time_output_format {#date_time_output_format}

<SettingsInfoBlock type='DateTimeOutputFormat' default_value='simple' />

日付と時刻のテキスト表現の出力形式を選択できます。

指定可能な値:

- `simple` - シンプルな出力形式。

  ClickHouseは日付と時刻を`YYYY-MM-DD hh:mm:ss`形式で出力します。例:`2019-08-20 10:18:56`。計算はデータ型のタイムゾーン(存在する場合)またはサーバーのタイムゾーンに従って実行されます。

- `iso` - ISO出力形式。

  ClickHouseは日付と時刻を[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)の`YYYY-MM-DDThh:mm:ssZ`形式で出力します。例:`2019-08-20T10:18:56Z`。出力はUTC形式です(`Z`はUTCを意味します)。

- `unix_timestamp` - Unixタイムスタンプ出力形式。

  ClickHouseは日付と時刻を[Unixタイムスタンプ](https://en.wikipedia.org/wiki/Unix_time)形式で出力します。例:`1566285536`。

関連項目:

- [DateTimeデータ型](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)


## date_time_overflow_behavior {#date_time_overflow_behavior}

<SettingsInfoBlock type='DateTimeOverflowBehavior' default_value='ignore' />

[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、または整数をDate、Date32、DateTime、またはDateTime64に変換する際に、結果の型で値を表現できない場合の動作を定義します。

設定可能な値:

- `ignore` — オーバーフローを暗黙的に無視します。結果は未定義です。
- `throw` — オーバーフロー発生時に例外をスローします。
- `saturate` — 結果を飽和させます。値が対象型で表現可能な最小値よりも小さい場合、結果は表現可能な最小値になります。値が対象型で表現可能な最大値よりも大きい場合、結果は表現可能な最大値になります。

デフォルト値: `ignore`


## dictionary_use_async_executor {#dictionary_use_async_executor}

<SettingsInfoBlock type='Bool' default_value='0' />

辞書ソースを読み取るパイプラインを複数のスレッドで実行します。ローカルCLICKHOUSEソースを持つ辞書でのみサポートされています。


## errors_output_format {#errors_output_format}

<SettingsInfoBlock type='String' default_value='CSV' />

エラーをテキスト出力に書き込む方式。


## exact_rows_before_limit {#exact_rows_before_limit}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、ClickHouseは`rows_before_limit_at_least`統計の正確な値を提供しますが、その代償として`LIMIT`前のデータを完全に読み取る必要があります


## format_avro_schema_registry_url {#format_avro_schema_registry_url}

AvroConfluent形式の場合：Confluent Schema RegistryのURL。


## format_binary_max_array_size {#format_binary_max_array_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

RowBinary形式における配列の最大許容サイズ。破損したデータによって大量のメモリが割り当てられることを防ぎます。0は制限なしを意味します


## format_binary_max_string_size {#format_binary_max_string_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

RowBinary形式におけるString型の最大許容サイズ。破損データによる大量のメモリ割り当てを防止します。0は無制限を意味します


## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}

<SettingsInfoBlock
  type='CapnProtoEnumComparingMode'
  default_value='by_values'
/>

ClickHouseのEnumとCapnProtoのEnumをマッピングする方法


## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}

<SettingsInfoBlock type='Bool' default_value='1' />

format_schema が設定されていない場合に自動生成された CapnProto スキーマを使用する


## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}

<SettingsInfoBlock type='Bool' default_value='1' />

trueに設定した場合、ダブルクォーテーションで囲まれた文字列を許可します。


## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}

<SettingsInfoBlock type='Bool' default_value='0' />

trueに設定した場合、シングルクォートで囲まれた文字列が許可されます。


## format_csv_delimiter {#format_csv_delimiter}

<SettingsInfoBlock type='Char' default_value=',' />

CSVデータの区切り文字として使用される文字です。文字列で設定する場合は、長さが1である必要があります。


## format_csv_null_representation {#format_csv_null_representation}

<SettingsInfoBlock type='String' default_value='\N' />

CSV形式でのカスタムNULL表現


## format_custom_escaping_rule {#format_custom_escaping_rule}

<SettingsInfoBlock type='EscapingRule' default_value='Escaped' />

フィールドエスケープルール（CustomSeparated形式用）


## format_custom_field_delimiter {#format_custom_field_delimiter}

<SettingsInfoBlock type='String' default_value='	' />

フィールド間の区切り文字(CustomSeparated形式用)


## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}

結果セット後のサフィックス（CustomSeparated形式用）


## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}

結果セットの前に付けるプレフィックス（CustomSeparated形式用）


## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}

<SettingsInfoBlock
  type='String'
  default_value='
'
/>

最終列のフィールド後の区切り文字（CustomSeparated形式用）


## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}

最初のカラムのフィールドの前の区切り文字（CustomSeparated形式用）


## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}

行間の区切り文字（CustomSeparated形式）


## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}

<SettingsInfoBlock type='Bool' default_value='0' />

テーブル、データベース、テーブル関数、ディクショナリに対する`SHOW`および`SELECT`クエリにおいて、シークレットの表示を有効化または無効化します。

シークレットを表示するには、ユーザーは[`display_secrets_in_show_and_select`サーバー設定](../server-configuration-parameters/settings#display_secrets_in_show_and_select)を有効にし、[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect)権限を持っている必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)形式でオブジェクト名を保存・書き込みする際に使用するカラムの名前。
カラムの型はStringである必要があります。値が空の場合、オブジェクト名にはデフォルトの名前`row_{i}`が使用されます。


## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}

<SettingsInfoBlock type='Bool' default_value='1' />

format_schema が設定されていない場合に自動生成された Protobuf を使用する


## format_regexp {#format_regexp}

正規表現（Regexp形式用）


## format_regexp_escaping_rule {#format_regexp_escaping_rule}

<SettingsInfoBlock type='EscapingRule' default_value='Raw' />

フィールドのエスケープルール（Regexp形式用）


## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}

<SettingsInfoBlock type='Bool' default_value='0' />

正規表現に一致しない行をスキップします（Regexp形式用）


## format_schema {#format_schema}

このパラメータは、[Cap'n Proto](https://capnproto.org/)や[Protobuf](https://developers.google.com/protocol-buffers/)など、スキーマ定義が必要なフォーマットを使用する場合に有用です。値はフォーマットによって異なります。


## format_schema_message_name {#format_schema_message_name}

`format_schema`で定義されたスキーマ内の必要なメッセージの名前を定義します。
レガシー形式の format_schema フォーマット(`file_name:message_name`)との互換性を維持するために:

- `format_schema_message_name`が指定されていない場合、メッセージ名はレガシー形式の`format_schema`値の`message_name`部分から推測されます。
- レガシー形式を使用している場合に`format_schema_message_name`が指定されていると、エラーが発生します。


## format_schema_source {#format_schema_source}

<SettingsInfoBlock type='String' default_value='file' />

`format_schema` のソースを定義します。
設定可能な値:

- 'file' (デフォルト): `format_schema` は `format_schemas` ディレクトリに配置されたスキーマファイルの名前です。
- 'string': `format_schema` はスキーマの内容そのものです。
- 'query': `format_schema` はスキーマを取得するためのクエリです。
  `format_schema_source` が 'query' に設定されている場合、以下の条件が適用されます:
- クエリは正確に1つの値を返す必要があります: 単一の文字列カラムを持つ単一の行。
- クエリの結果はスキーマの内容として扱われます。
- この結果は `format_schemas` ディレクトリにローカルキャッシュされます。
- ローカルキャッシュをクリアするには、次のコマンドを使用します: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`。
- 一度キャッシュされると、キャッシュが明示的にクリアされるまで、同一のクエリはスキーマを再取得するために実行されません。
- ローカルキャッシュファイルに加えて、Protobuf メッセージもメモリにキャッシュされます。ローカルキャッシュファイルをクリアした後でも、スキーマを完全に更新するには `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` を使用してメモリ内キャッシュをクリアする必要があります。
- キャッシュファイルと Protobuf メッセージスキーマの両方のキャッシュを一度にクリアするには、クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` を実行します。


## format_template_resultset {#format_template_resultset}

結果セットのフォーマット文字列を含むファイルへのパス（Templateフォーマット用）


## format_template_resultset_format {#format_template_resultset_format}

結果セットのフォーマット文字列（Templateフォーマット用）


## format_template_row {#format_template_row}

行のフォーマット文字列を含むファイルへのパス（Template形式用）


## format_template_row_format {#format_template_row_format}

行のフォーマット文字列（Template形式用）


## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

<SettingsInfoBlock
  type='String'
  default_value='
'
/>

行間の区切り文字（Template形式用）


## format_tsv_null_representation {#format_tsv_null_representation}

<SettingsInfoBlock type='String' default_value='\N' />

TSV形式でのカスタムNULL表現


## input_format_allow_errors_num {#input_format_allow_errors_num}

<SettingsInfoBlock type='UInt64' default_value='0' />

テキスト形式（CSV、TSVなど）からの読み取り時に許容される最大エラー数を設定します。

デフォルト値は0です。

常に`input_format_allow_errors_ratio`と組み合わせて使用してください。

行の読み取り中にエラーが発生した場合でも、エラーカウンタが`input_format_allow_errors_num`未満であれば、ClickHouseはその行を無視して次の行に進みます。

`input_format_allow_errors_num`と`input_format_allow_errors_ratio`の両方を超過した場合、ClickHouseは例外をスローします。


## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}

<SettingsInfoBlock type='Float' default_value='0' />

テキスト形式（CSV、TSVなど）からの読み取り時に許容されるエラーの最大割合を設定します。
エラーの割合は、0から1の間の浮動小数点数として設定されます。

デフォルト値は0です。

常に`input_format_allow_errors_num`と組み合わせて使用してください。

行の読み取り中にエラーが発生した場合でも、エラーカウンターが`input_format_allow_errors_ratio`未満であれば、ClickHouseはその行を無視して次の行に進みます。

`input_format_allow_errors_num`と`input_format_allow_errors_ratio`の両方を超過した場合、ClickHouseは例外をスローします。


## input_format_allow_seeks {#input_format_allow_seeks}

<SettingsInfoBlock type='Bool' default_value='1' />

ORC/Parquet/Arrow入力形式での読み取り中にシークを許可します。

デフォルトで有効になっています。


## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Arrow入力形式の読み取り時に列の欠落を許可します


## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

Arrow列とClickHouse列を照合する際に、大文字と小文字を区別しません。


## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Arrow形式のスキーマ推論中に、サポートされていない型の列をスキップします


## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}

<SettingsInfoBlock type='Bool' default_value='0' />

Avro/AvroConfluent形式：スキーマにフィールドが見つからない場合、エラーの代わりにデフォルト値を使用します


## input_format_avro_null_as_default {#input_format_avro_null_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

Avro/AvroConfluent形式の場合：nullでかつNullable型でないカラムに対してデフォルト値を挿入します


## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

RowBinaryWithNamesAndTypes入力形式において、型名の代わりにバイナリ形式でデータ型を読み取ります


## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

RowBinary入力形式で、[JSON](../../sql-reference/data-types/newjson.md)データ型の値を[String](../../sql-reference/data-types/string.md)型のJSON値として読み取ります。


## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

BSON形式のスキーマ推論において、サポートされていない型のフィールドをスキップします。


## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

CapnProto形式のスキーマ推論時に、サポートされていない型を持つカラムをスキップします


## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

trueに設定すると、後続文字のない行末の\\rが許可されます


## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

CSV入力において余分な列を無視し(ファイルの列数が期待値より多い場合)、欠落しているフィールドはデフォルト値として扱います


## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}

<SettingsInfoBlock type='Bool' default_value='0' />

CSV文字列でフィールド区切り文字としてスペースとタブ(\\t)を使用できるようにします


## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}

<SettingsInfoBlock type='Bool' default_value='0' />

CSVからArray型を読み取る際、その要素がネストされたCSVとしてシリアル化され、文字列内に格納されていることを前提とします。例: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。配列を囲む角括弧は省略可能です。


## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

trueに設定すると、CSV形式で記述された個別の列をTuple列にデシリアライズできます。


## input_format_csv_detect_header {#input_format_csv_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

CSV形式のヘッダーに含まれる名前と型を自動検出します


## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='1' />

CSV入力の空のフィールドをデフォルト値として扱います。


## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}

<SettingsInfoBlock type='Bool' default_value='0' />

CSV形式で挿入されるenum値をenumインデックスとして扱う


## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}

<SettingsInfoBlock type='UInt64' default_value='0' />

CSV形式のデータの先頭から指定した行数をスキップします


## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

CSV形式の末尾の空行をスキップする


## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}

<SettingsInfoBlock type='Bool' default_value='1' />

CSV文字列の先頭と末尾のスペースおよびタブ(\\t)文字をトリミングします


## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、スキーマ推論時にClickHouseは文字列フィールドから数値の推論を試みます。
CSVデータに引用符で囲まれたUInt64数値が含まれている場合に有用です。

デフォルトでは無効です。


## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}

<SettingsInfoBlock type='Bool' default_value='1' />

入力データ内の引用符で囲まれたタプルをString型の値として解釈します。


## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='1' />

CSV形式のスキーマ推論時に調整とヒューリスティックを使用します


## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}

<SettingsInfoBlock type='Bool' default_value='0' />

CSVフィールドのデシリアライゼーションが不正な値により失敗した場合に、カラムへのデフォルト値の設定を許可します


## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

CustomSeparated形式の入力において余分な列を無視し（ファイルの列数が期待値より多い場合）、欠落しているフィールドをデフォルト値として扱います


## input_format_custom_detect_header {#input_format_custom_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

CustomSeparated形式で名前と型を含むヘッダーを自動検出します


## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

CustomSeparated形式で末尾の空行をスキップする


## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

`INSERT`クエリの実行時に、省略された入力カラムの値を、それぞれのカラムのデフォルト値で置き換えます。このオプションは、[JSONEachRow](/interfaces/formats/JSONEachRow)（および他のJSON形式）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native)形式、および`WithNames`/`WithNamesAndTypes`接尾辞を持つ形式に適用されます。

:::note
このオプションを有効にすると、拡張テーブルメタデータがサーバーからクライアントに送信されます。これによりサーバー上で追加の計算リソースが消費され、パフォーマンスが低下する可能性があります。
:::

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}

<SettingsInfoBlock type='Bool' default_value='0' />

省略されたフィールドを強制的にnull値で初期化します


## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Hiveテキスト入力で余分なカラムを無視し(ファイルのカラム数が期待値より多い場合)、欠落しているフィールドをデフォルト値として扱います


## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Hive Text File内のコレクション（配列またはマップ）の項目間の区切り文字


## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Hive Text File内のフィールド間の区切り文字


## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Hive Text File内のマップのキーと値のペア間の区切り文字


## input_format_import_nested_json {#input_format_import_nested_json}

<SettingsInfoBlock type='Bool' default_value='0' />

ネストされたオブジェクトを含むJSONデータの挿入を有効または無効にします。

サポートされる形式:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

設定可能な値:

- 0 — 無効
- 1 — 有効

関連項目:

- `JSONEachRow`形式における[ネスト構造の使用](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)


## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}

<SettingsInfoBlock type='Bool' default_value='0' />

IPv4のデシリアライゼーション時に変換エラーが発生した場合、例外をスローせずにデフォルト値を使用します。

デフォルトでは無効です。


## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}

<SettingsInfoBlock type='Bool' default_value='0' />

IPv6のデシリアライゼーション時に変換エラーが発生した場合、例外をスローせずにデフォルト値を使用します。

デフォルトでは無効です。


## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

JSONCompact/JSONCompactEachRow入力形式において、行ごとに可変数の列を許可します。
期待される列数より多い列を持つ行では余分な列を無視し、不足している列はデフォルト値として扱います。

デフォルトでは無効です。


## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

名前付きタプルの解析時に、JSONオブジェクト内の欠落している要素にデフォルト値を挿入します。
この設定は、`input_format_json_named_tuples_as_objects`が有効になっている場合にのみ機能します。

デフォルトで有効になっています。


## input_format_json_empty_as_default {#input_format_json_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、JSONの空の入力フィールドをデフォルト値で置き換えます。複雑なデフォルト式を使用する場合は、`input_format_defaults_for_omitted_fields`も有効にする必要があります。

設定可能な値:

- 0 — 無効
- 1 — 有効


## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

名前付きタプルのJSONオブジェクト内の未知のキーを無視します。

デフォルトで有効になっています。


## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

不要なフィールドを無視し、解析しません。これを有効にすると、無効な形式や重複したフィールドを持つJSON文字列に対して例外がスローされなくなる場合があります


## input_format_json_infer_array_of_dynamic_from_array_of_different_types {#input_format_json_infer_array_of_dynamic_from_array_of_different_types}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、スキーマ推論中にClickHouseは異なるデータ型の値を含むJSON配列に対してArray(Dynamic)型を使用します。

例:

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

デフォルトで有効です。


## input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

スキーマ推論時に、データサンプル内で`Null`/`{}`/`[]`のみを含むJSONキーに対してString型の使用を許可します。
JSON形式では任意の値をStringとして読み取ることができるため、型が不明なキーに対してString型を使用することで、スキーマ推論中に`Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`のようなエラーを回避できます。

例:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

結果:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

デフォルトで有効です。


## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

マップカラムをタプルのJSON配列としてデシリアライズします。

デフォルトでは無効です。


## input_format_json_max_depth {#input_format_json_max_depth}

<SettingsInfoBlock type='UInt64' default_value='1000' />

JSONフィールドの最大深度。これは厳密な制限ではなく、厳密に適用される必要はありません。


## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

名前付きタプル列をJSONオブジェクトとして解析します。

デフォルトで有効になっています。


## input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力形式において、JSON配列を文字列として解析できるようにします。

例:

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```

結果:

```
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```

デフォルトで有効になっています。


## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力フォーマットでブール値を数値として解析することを許可します。

デフォルトで有効になっています。


## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力フォーマットでブール値を文字列として解析できるようにします。

デフォルトで有効です。


## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力形式において、数値を文字列として解析することを許可します。

デフォルトで有効になっています。


## input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力フォーマットでJSONオブジェクトを文字列として解析できるようにします。

例:

```sql
SET input_format_json_read_objects_as_strings = 1;
CREATE TABLE test (id UInt64, obj String, date Date) ENGINE=Memory();
INSERT INTO test FORMAT JSONEachRow {"id" : 1, "obj" : {"a" : 1, "b" : "Hello"}, "date" : "2020-01-01"};
SELECT * FROM test;
```

結果:

```
┌─id─┬─obj──────────────────────┬───────date─┐
│  1 │ {"a" : 1, "b" : "Hello"} │ 2020-01-01 │
└────┴──────────────────────────┴────────────┘
```

デフォルトで有効になっています。


## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON入力フォーマットにおいて、JSON文字列に不正なエスケープシーケンスが含まれている場合に例外をスローします。無効にした場合、不正なエスケープシーケンスはデータ内にそのまま保持されます。

デフォルトで有効です。


## input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、スキーマ推論時にClickHouseはJSONオブジェクトから名前付きタプルの推論を試みます。
結果として得られる名前付きタプルには、サンプルデータ内の対応するすべてのJSONオブジェクトの全要素が含まれます。

例:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

結果:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

デフォルトで有効です。


## input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、スキーマ推論時にClickHouseは文字列フィールドから数値の推論を試みます。
JSONデータに引用符で囲まれたUInt64数値が含まれている場合に便利です。

デフォルトでは無効です。


## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

<SettingsInfoBlock type='Bool' default_value='0' />

名前付きタプルの型推論時にJSONオブジェクト内のパスが曖昧な場合、例外をスローする代わりにString型を使用します


## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON/JSONCompact/JSONColumnsWithMetadata入力フォーマットにおいて、この設定が1に設定されている場合、
入力データのメタデータの型が、テーブルの対応するカラムの型と比較されます。

デフォルトで有効です。


## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />

入力フォーマットでのデータ解析時に形成されるブロックのサイズをバイト単位で制限します。ClickHouse側でブロックが形成される行ベースの入力フォーマットで使用されます。
0を指定するとバイト単位の制限なしを意味します。


## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}

<SettingsInfoBlock type='UInt64' default_value='33554432' />

自動スキーマ推論のために読み取るデータの最大量(バイト単位)。


## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}

<SettingsInfoBlock type='UInt64' default_value='25000' />

自動スキーマ推論で読み取るデータの最大行数。


## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}

<SettingsInfoBlock type='UInt64' default_value='0' />

挿入するMsgPackデータのカラム数。データからの自動スキーマ推論に使用されます。


## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}

<SettingsInfoBlock type='Bool' default_value='1' />

MySQLダンプ内のテーブルのカラムとClickHouseテーブルのカラムを名前で対応付けます


## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}

データを読み取るMySQLダンプ内のテーブルの名前


## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}

<SettingsInfoBlock type='Bool' default_value='1' />

Native入力形式でのデータ型変換を許可します


## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Native入力形式において、型名の代わりにバイナリ形式でデータ型を読み取ります


## input_format_null_as_default {#input_format_null_as_default}

<SettingsInfoBlock type='Bool' default_value='1' />

データ型が[nullable](/sql-reference/data-types/nullable)でない場合に、[NULL](/sql-reference/syntax#literals)フィールドを[デフォルト値](/sql-reference/statements/create/table#default_values)で初期化するかどうかを有効または無効にします。
カラムの型がnullableでなく、この設定が無効の場合、`NULL`を挿入すると例外が発生します。カラムの型がnullableの場合、この設定に関係なく`NULL`値はそのまま挿入されます。

この設定はほとんどの入力フォーマットに適用されます。

複雑なデフォルト式の場合、`input_format_defaults_for_omitted_fields`も有効にする必要があります。

設定可能な値:

- 0 — nullableでないカラムに`NULL`を挿入すると例外が発生します。
- 1 — `NULL`フィールドはデフォルトのカラム値で初期化されます。


## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

ORC入力フォーマットの読み取り時に欠落した列を許可します


## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

ORC列とClickHouse列を照合する際に、大文字と小文字を区別しません。


## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}

<SettingsInfoBlock type='Bool' default_value='1' />

ORCファイルの読み取り時に、ORC辞書エンコード列をLowCardinality列として扱います。


## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

ORCファイルの読み取り時に、WHERE/PREWHERE式、最小値/最大値統計、またはORCメタデータ内のブルームフィルタに基づいて、ストライプ全体または行グループ全体をスキップします。


## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}

<SettingsInfoBlock type='String' default_value='GMT' />

ORC行リーダーのタイムゾーン名です。デフォルトのORC行リーダーのタイムゾーンはGMTです。


## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}

<SettingsInfoBlock type='Int64' default_value='100000' />

ORCストライプ読み取り時のバッチサイズ。


## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

ORC形式のスキーマ推論時に、サポートされていない型の列をスキップする


## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}

<SettingsInfoBlock type='Bool' default_value='1' />

より高速なORCデコーダの実装を使用します。


## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}

<SettingsInfoBlock type='Bool' default_value='1' />

geo列パーサーを使用して、Array(UInt8)をPoint/LineString/Polygon/MultiLineString/MultiPolygon型に変換します


## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquet入力フォーマットの読み取り時に列の欠落を許可します


## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルの読み取り時に、WHERE式とParquetメタデータ内のブルームフィルタに基づいて行グループ全体をスキップします。


## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

Parquetカラムとclickhouseカラムをマッチングする際に大文字小文字を区別しません。


## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルの読み取り時に、JSON列をClickHouse JSON列として解析します。


## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquet解析時に行グループのプリフェッチを有効にします。現在、シングルスレッド解析のみプリフェッチが可能です。


## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルの読み取り時に、WHERE/PREWHERE式とParquetメタデータ内のmin/max統計情報に基づいて、行グループ全体をスキップします。


## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}

<SettingsInfoBlock type='UInt64' default_value='8192' />

Parquet入力フォーマットにおいて、データを読み飛ばす代わりにシーク操作を実行するために必要なローカルファイル読み取りの最小バイト数


## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}

<SettingsInfoBlock type='Bool' default_value='1' />

isAdjustedToUTC=falseのParquetタイムスタンプに対して、スキーマ推論で使用されるデータ型を決定します。trueの場合:DateTime64(..., 'UTC')、falseの場合:DateTime64(...)となります。ClickHouseにはローカルウォールクロック時刻を表すデータ型が存在しないため、どちらの動作も完全には正確ではありません。直感に反しますが、'true'の方がより誤りの少ない選択肢と言えます。これは、'UTC'タイムスタンプを文字列としてフォーマットすることで、正しいローカル時刻の表現が生成されるためです。


## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65409' />

Parquetリーダーの最大ブロックサイズ。


## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}

<SettingsInfoBlock type='UInt64' default_value='4294967296' />

Parquetリーダーv3の概算メモリ制限。並列で読み取り可能な行グループまたは列の数を制限します。1つのクエリで複数のファイルを読み取る場合、制限はそれらのファイル全体の合計メモリ使用量に適用されます。


## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}

<SettingsInfoBlock type='UInt64' default_value='2097152' />

メモリ使用量がこの閾値を下回る場合、プリフェッチをより積極的にスケジュールします。ネットワーク経由で読み取る小さなブルームフィルタが多数ある場合などに有用です。


## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

列インデックスの最小値/最大値を使用してページをスキップします。


## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}

<SettingsInfoBlock type='UInt64' default_value='16744704' />

Parquetリーダーが出力する平均ブロックバイト数


## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}

<SettingsInfoBlock type='Bool' default_value='0' />

Parquetファイルから読み取る際の行の並び替えを回避します。行の順序は一般的に保証されておらず、クエリパイプラインの他の部分で順序が崩れる可能性があるため、推奨されません。代わりに`ORDER BY _row_number`を使用してください。


## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Parquet形式のスキーマ推論時に、サポートされていない型の列をスキップする


## input_format_parquet_use_native_reader {#input_format_parquet_use_native_reader}

<SettingsInfoBlock type='Bool' default_value='0' />

ネイティブParquetリーダーv1を使用します。比較的高速ですが、未完成です。非推奨となっています。


## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetリーダーv3を使用します。


## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}

<SettingsInfoBlock type='Bool' default_value='1' />

ページフィルタリングが使用されていない場合の、Parquetファイルからのページ読み取り方法に対する軽微な調整。


## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルの読み取り時にページチェックサムを検証します。


## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}

<SettingsInfoBlock type='Bool' default_value='0' />

通常の非ネストカラムに対してGoogleラッパーを有効にします。例：String型カラム'str'に対してgoogle.protobuf.StringValue 'str'を使用します。Nullable型カラムの場合、空のラッパーはデフォルト値として認識され、ラッパーが欠落している場合はnullとして扱われます


## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}

<SettingsInfoBlock type='Bool' default_value='0' />

特別なカラムにenum値を設定することにより、protobuf oneofのどのフィールドが検出されたかを示します


## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Protobuf形式のスキーマ推論中に、サポートされていない型のフィールドをスキップします


## input_format_record_errors_file_path {#input_format_record_errors_file_path}

テキスト形式（CSV、TSV）の読み取り時にエラーを記録するファイルのパス。


## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

余分なデータの挿入をスキップする機能を有効または無効にします。

データ書き込み時、入力データにターゲットテーブルに存在しないカラムが含まれている場合、ClickHouseは例外をスローします。スキップが有効な場合、ClickHouseは余分なデータを挿入せず、例外もスローしません。

サポートされている形式:

- [JSONEachRow](/interfaces/formats/JSONEachRow) (およびその他のJSON形式)
- [BSONEachRow](/interfaces/formats/BSONEachRow) (およびその他のJSON形式)
- [TSKV](/interfaces/formats/TSKV)
- WithNames/WithNamesAndTypesサフィックスを持つすべての形式
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## input_format_try_infer_dates {#input_format_try_infer_dates}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、文字列フィールドから`Date`型の推論を試みます。入力データの列内のすべてのフィールドが日付として正常に解析された場合、結果の型は`Date`となります。1つでもフィールドが日付として解析されなかった場合、結果の型は`String`となります。

デフォルトで有効です。


## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、文字列フィールドから`DateTime64`型の推論を試みます。入力データの列内のすべてのフィールドが日時として正常に解析された場合、結果の型は`DateTime64`になります。1つでもフィールドが日時として解析されなかった場合、結果の型は`String`になります。

デフォルトで有効になっています。


## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}

<SettingsInfoBlock type='Bool' default_value='0' />

input_format_try_infer_datetimes が有効な場合、DateTime 型ではなく DateTime64 型のみを推論します


## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}

<SettingsInfoBlock type='Bool' default_value='0' />

テキスト形式でのスキーマ推論時に指数表記の浮動小数点数の推論を試みます（JSON形式を除く。JSON形式では指数表記の数値は常に推論されます）


## input_format_try_infer_integers {#input_format_try_infer_integers}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、ClickHouseはテキスト形式のスキーマ推論において、浮動小数点数型ではなく整数型を推論しようとします。入力データの列内のすべての数値が整数である場合、結果の型は`Int64`になります。少なくとも1つの数値が浮動小数点数である場合、結果の型は`Float64`になります。

デフォルトで有効です。


## input_format_try_infer_variants {#input_format_try_infer_variants}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、テキスト形式のスキーマ推論において、カラムまたは配列要素に複数の型候補が存在する場合、ClickHouseは[`Variant`](../../sql-reference/data-types/variant.md)型の推論を試みます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

TSV入力において余分な列を無視し(ファイルの列数が期待値より多い場合)、欠落しているフィールドをデフォルト値として扱います


## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

trueに設定すると、file関数は\\nの代わりに\\r\\nでTSV形式を読み取ります。


## input_format_tsv_detect_header {#input_format_tsv_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

TSV形式で名前と型を含むヘッダーを自動検出します


## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

TSV入力の空のフィールドをデフォルト値として扱います。


## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}

<SettingsInfoBlock type='Bool' default_value='0' />

TSV形式で挿入されるenum値をenumインデックスとして扱います。


## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}

<SettingsInfoBlock type='UInt64' default_value='0' />

TSV形式のデータの先頭から指定した行数をスキップします


## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

TSV形式の末尾の空行をスキップする


## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='1' />

TSV形式のスキーマ推論時に調整とヒューリスティックを使用する


## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}

<SettingsInfoBlock type='Bool' default_value='1' />

Values形式の場合：テンプレートを使用して式を解析・解釈する際に、リテラルの実際の型をチェックして、オーバーフローや精度の問題を回避します。


## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}

<SettingsInfoBlock type='Bool' default_value='1' />

Values形式の場合：ストリーミングパーサーでフィールドを解析できない場合、SQLパーサーを実行してSQL式のテンプレートを推定し、そのテンプレートを使用してすべての行の解析を試み、その後すべての行に対して式を解釈します。


## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}

<SettingsInfoBlock type='Bool' default_value='1' />

Values形式の場合：ストリーミングパーサーでフィールドを解析できなかった場合は、SQLパーサーを実行し、SQL式として解釈を試みます。


## input_format_with_names_use_header {#input_format_with_names_use_header}

<SettingsInfoBlock type='Bool' default_value='1' />

データ挿入時の列順序チェックを有効または無効にします。

入力データの列順序がターゲットテーブルと同じであることが確実な場合は、挿入パフォーマンスを向上させるため、このチェックを無効にすることを推奨します。

サポートされている形式:

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

設定可能な値:

- 0 — 無効
- 1 — 有効


## input_format_with_types_use_header {#input_format_with_types_use_header}

<SettingsInfoBlock type='Bool' default_value='1' />

入力データのデータ型とターゲットテーブルのデータ型が一致するかどうかをフォーマットパーサーが検証するかを制御します。

サポートされているフォーマット:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}

<SettingsInfoBlock type='Bool' default_value='0' />

分散キーが存在しない場合に、[Distributed](/engines/table-engines/special/distributed)テーブルへのランダムシャード挿入を有効または無効にします。

デフォルトでは、複数のシャードを持つ`Distributed`テーブルにデータを挿入する際、分散キーが存在しない場合、ClickHouseサーバーはすべての挿入リクエストを拒否します。`insert_distributed_one_random_shard = 1`に設定すると、挿入が許可され、データはすべてのシャードにランダムに転送されます。

設定可能な値:

- 0 — 複数のシャードが存在し、分散キーが指定されていない場合、挿入は拒否されます。
- 1 — 分散キーが指定されていない場合、利用可能なすべてのシャードにランダムに挿入が実行されます。


## interval_output_format {#interval_output_format}

<SettingsInfoBlock type='IntervalOutputFormat' default_value='numeric' />

interval型のテキスト表現の出力形式を選択できます。

設定可能な値:

- `kusto` - KQL形式の出力フォーマット。

  ClickHouseは[KQL形式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier)でintervalを出力します。例えば、`toIntervalDay(2)`は`2.00:00:00`としてフォーマットされます。可変長のinterval型(例:`IntervalMonth`や`IntervalYear`)については、interval当たりの平均秒数が考慮される点に注意してください。

- `numeric` - 数値形式の出力フォーマット。

  ClickHouseはintervalを内部の数値表現として出力します。例えば、`toIntervalDay(2)`は`2`としてフォーマットされます。

関連項目:

- [Interval](../../sql-reference/data-types/special-data-types/interval.md)


## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}

<SettingsInfoBlock type='Bool' default_value='0' />

INTO OUTFILE使用時に、親ディレクトリが存在しない場合は自動的に作成します。


## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、JSON キー内のドットが解析時にエスケープされます。


## output_format_arrow_compression_method {#output_format_arrow_compression_method}

<SettingsInfoBlock type='ArrowCompression' default_value='lz4_frame' />

Arrow出力形式の圧縮方式。サポートされているコーデック：lz4_frame、zstd、none（非圧縮）


## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

FixedString列に対して、Binary型の代わりにArrow FIXED_SIZE_BINARY型を使用します。


## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}

<SettingsInfoBlock type='Bool' default_value='0' />

LowCardinality型をDictionary Arrow型として出力する機能を有効にします


## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

String列にBinary型の代わりにArrow String型を使用します


## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}

<SettingsInfoBlock type='Bool' default_value='0' />

Arrow形式のディクショナリインデックスに常に64ビット整数を使用する


## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}

<SettingsInfoBlock type='Bool' default_value='1' />

Arrow形式のディクショナリインデックスに符号付き整数を使用する


## output_format_avro_codec {#output_format_avro_codec}

出力に使用する圧縮コーデック。指定可能な値：'null'、'deflate'、'snappy'、'zstd'。


## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}

<SettingsInfoBlock type='UInt64' default_value='1' />

ファイル内の最大行数（ストレージで許可されている場合）


## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}

Avro形式用: AVRO文字列として選択するString型カラムの正規表現パターン。


## output_format_avro_sync_interval {#output_format_avro_sync_interval}

<SettingsInfoBlock type='UInt64' default_value='16384' />

同期間隔（バイト単位）。


## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

RowBinaryWithNamesAndTypes出力形式で、型名の代わりにデータ型をバイナリ形式で書き込みます


## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

RowBinary出力形式で、[JSON](../../sql-reference/data-types/newjson.md)データ型の値を[String](../../sql-reference/data-types/string.md)型のJSON値として書き込みます。


## output_format_bson_string_as_string {#output_format_bson_string_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

String列に対してBinary型の代わりにBSON String型を使用します。


## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

trueに設定した場合、CSV形式の改行文字が\\nではなく\\r\\nになります。


## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

trueに設定すると、CSV形式のタプルは個別の列としてシリアル化されます（つまり、タプル内のネスト構造は失われます）


## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}

<SettingsInfoBlock type='Bool' default_value='0' />

Decimal値を出力する際に末尾のゼロを出力します。例：1.23ではなく1.230000と出力されます。

デフォルトでは無効です。


## output_format_json_array_of_rows {#output_format_json_array_of_rows}

<SettingsInfoBlock type='Bool' default_value='0' />

[JSONEachRow](/interfaces/formats/JSONEachRow)形式で全ての行をJSON配列として出力する機能を有効化します。

設定可能な値:

- 1 — ClickHouseは全ての行を配列として出力します。各行は`JSONEachRow`形式です。
- 0 — ClickHouseは各行を`JSONEachRow`形式で個別に出力します。

**設定を有効化した場合のクエリ例**

クエリ:

```sql
SET output_format_json_array_of_rows = 1;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

結果:

```text
[
{"number":"0"},
{"number":"1"},
{"number":"2"}
]
```

**設定を無効化した場合のクエリ例**

クエリ:

```sql
SET output_format_json_array_of_rows = 0;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

結果:

```text
{"number":"0"}
{"number":"1"}
{"number":"2"}
```


## output_format_json_escape_forward_slashes {#output_format_json_escape_forward_slashes}

<SettingsInfoBlock type='Bool' default_value='1' />

JSON出力形式における文字列出力でのフォワードスラッシュのエスケープを制御します。これはJavaScriptとの互換性のために用意されています。常にエスケープされるバックスラッシュと混同しないように注意してください。

デフォルトで有効になっています。


## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

Map型カラムをタプルのJSON配列としてシリアライズします。

デフォルトでは無効です。


## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

名前付きタプル列をJSONオブジェクトとしてシリアライズします。

デフォルトで有効です。


## output_format_json_pretty_print {#output_format_json_pretty_print}

<SettingsInfoBlock type='Bool' default_value='1' />

この設定は、JSON出力形式を使用する際に、`data`配列内でTuple、Map、Arrayなどのネストされた構造をどのように表示するかを決定します。

例えば、次のような出力:

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

の代わりに、次のようにフォーマットされます:

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

デフォルトで有効です。


## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}

<SettingsInfoBlock type='Bool' default_value='0' />

JSON\* 形式で出力する際に、64ビット[浮動小数点数](../../sql-reference/data-types/float.md)を引用符で囲むかどうかを制御します。

デフォルトでは無効です。


## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}

<SettingsInfoBlock type='Bool' default_value='0' />

[JSON](/interfaces/formats/JSON)形式で出力する際の64ビット以上の[整数型](../../sql-reference/data-types/int-uint.md)（`UInt64`や`Int128`など）に対する引用符の使用を制御します。
デフォルトでは、これらの整数は引用符で囲まれます。この動作は、ほとんどのJavaScript実装と互換性があります。

設定可能な値:

- 0 — 整数は引用符なしで出力されます。
- 1 — 整数は引用符で囲まれます。


## output_format_json_quote_decimals {#output_format_json_quote_decimals}

<SettingsInfoBlock type='Bool' default_value='0' />

JSON出力形式において、小数値を引用符で囲むかどうかを制御します。

デフォルトでは無効になっています。


## output_format_json_quote_denormals {#output_format_json_quote_denormals}

<SettingsInfoBlock type='Bool' default_value='0' />

[JSON](/interfaces/formats/JSON)出力形式において、`+nan`、`-nan`、`+inf`、`-inf`の出力を有効にします。

設定可能な値:

- 0 — 無効
- 1 — 有効

**例**

以下の`account_orders`テーブルを例とします:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

`output_format_json_quote_denormals = 0`の場合、クエリは出力に`null`値を返します:

```sql
SELECT area/period FROM account_orders FORMAT JSON;
```

```json
{
  "meta": [
    {
      "name": "divide(area, period)",
      "type": "Float64"
    }
  ],

  "data": [
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

  "statistics": {
    "elapsed": 0.003648093,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```

`output_format_json_quote_denormals = 1`の場合、クエリは以下を返します:

```json
{
  "meta": [
    {
      "name": "divide(area, period)",
      "type": "Float64"
    }
  ],

  "data": [
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

  "statistics": {
    "elapsed": 0.000070241,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```


## output_format_json_skip_null_value_in_named_tuples {#output_format_json_skip_null_value_in_named_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

名前付きタプルカラムをJSONオブジェクトとしてシリアライズする際に、null値を持つキーと値のペアをスキップします。この設定は、output_format_json_named_tuples_as_objectsがtrueの場合にのみ有効です。


## output_format_json_validate_utf8 {#output_format_json_validate_utf8}

<SettingsInfoBlock type='Bool' default_value='0' />

JSON出力形式におけるUTF-8シーケンスの検証を制御します。JSON/JSONCompact/JSONColumnsWithMetadata形式には影響しません。これらの形式は常にUTF-8を検証します。

デフォルトでは無効です。


## output_format_markdown_escape_special_characters {#output_format_markdown_escape_special_characters}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、Markdown内の特殊文字をエスケープします。

[Common Mark](https://spec.commonmark.org/0.30/#example-12)では、`\`によってエスケープ可能な以下の特殊文字が定義されています:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

設定可能な値:

- 0 — 無効。
- 1 — 有効。


## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}

<SettingsInfoBlock type='MsgPackUUIDRepresentation' default_value='ext' />

MsgPack形式でUUIDを出力する方法を指定します。


## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Native出力形式において、型名の代わりにバイナリ形式でデータ型を書き込みます


## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}

<SettingsInfoBlock type='Bool' default_value='0' />

[JSON](../../sql-reference/data-types/newjson.md)および[Dynamic](../../sql-reference/data-types/dynamic.md)カラムのデータを平坦化された形式で書き込みます(すべての型/パスを個別のサブカラムとして)。


## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

[JSON](../../sql-reference/data-types/newjson.md)カラムのデータを、デフォルトのネイティブJSONシリアライゼーションの代わりに、JSON文字列を含む[String](../../sql-reference/data-types/string.md)カラムとして書き込みます。


## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}

<SettingsInfoBlock type='UInt64' default_value='262144' />

ORC出力形式の圧縮ブロックのサイズ(バイト単位)。


## output_format_orc_compression_method {#output_format_orc_compression_method}

<SettingsInfoBlock type='ORCCompression' default_value='zstd' />

ORC出力形式の圧縮方式。サポートされるコーデック: lz4, snappy, zlib, zstd, none (非圧縮)


## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}

<SettingsInfoBlock type='Double' default_value='0' />

ORC出力形式の文字列カラムにおいて、非NULL行の総数に対する一意な値の数の割合がこのしきい値を超える場合、辞書エンコーディングを無効にします。それ以外の場合は辞書エンコーディングが有効になります


## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}

<SettingsInfoBlock type='UInt64' default_value='10000' />

ORC出力形式における行インデックスのストライド値


## output_format_orc_string_as_string {#output_format_orc_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

String型のカラムに対してBinary型の代わりにORC String型を使用します


## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}

<SettingsInfoBlock type='String' default_value='GMT' />

ORCライターのタイムゾーン名です。デフォルトのORCライターのタイムゾーンはGMTです。


## output_format_parquet_batch_size {#output_format_parquet_batch_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='1024' />

指定した行数ごとにページサイズを確認します。列の平均値サイズが数KB以上の場合は、この値を減らすことを検討してください。


## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}

<SettingsInfoBlock type='Double' default_value='10.5' />

Parquetブルームフィルタの各一意な値に使用するビット数の概算値。推定偽陽性率:

- 6ビット - 10%
- 10.5ビット - 1%
- 16.9ビット - 0.1%
- 26.4ビット - 0.01%
- 41ビット - 0.001%


## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}

<SettingsInfoBlock type='UInt64' default_value='134217728' />

Parquetファイル内でブルームフィルタを配置する位置を指定します。ブルームフィルタは、おおよそこのサイズのグループ単位で書き込まれます。具体的には以下の通りです：

- 0の場合、各行グループのブルームフィルタは、その行グループの直後に書き込まれます。
- すべてのブルームフィルタの合計サイズより大きい場合、すべての行グループのブルームフィルタがメモリに蓄積され、ファイルの終端付近にまとめて書き込まれます。
- それ以外の場合、ブルームフィルタはメモリに蓄積され、その合計サイズがこの値を超えるたびに書き出されます。


## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルスキーマにおいて、リスト要素の名前として'item'の代わりに'element'を使用します。これはArrowライブラリの実装における歴史的な経緯によるものです。一般的には互換性が向上しますが、Arrowの古いバージョンの一部では例外となる場合があります。


## output_format_parquet_compression_method {#output_format_parquet_compression_method}

<SettingsInfoBlock type='ParquetCompression' default_value='zstd' />

Parquet出力形式の圧縮方式。サポートされるコーデック: snappy, lz4, brotli, zstd, gzip, none (非圧縮)


## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

圧縮前の目標ページサイズ（バイト単位）。


## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}

<SettingsInfoBlock type='Bool' default_value='0' />

Date値を32ビットのParquet DATE型（Date32として読み戻される）に変換せず、プレーンな16ビット数値（UInt16として読み戻される）として書き込みます。


## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}

<SettingsInfoBlock type='Bool' default_value='0' />

DateTime値をミリ秒に変換せず、生のUnixタイムスタンプとして書き込みます(UInt32として読み戻されます。ミリ秒に変換した場合はDateTime64(3)として読み戻されます)。


## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquet物理型: BYTE_ARRAY、論理型: ENUMを使用してenum型を書き込みます


## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

FixedString列に対して、Binary型の代わりにParquetのFIXED_LEN_BYTE_ARRAY型を使用します。


## output_format_parquet_geometadata {#output_format_parquet_geometadata}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetメタデータに地理情報列に関する情報を書き込み、列をWKB形式でエンコードすることを許可します。


## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

辞書サイズがこのバイト数より大きくなった場合、辞書を使用しないエンコーディングに切り替えます。辞書エンコーディングを無効にする場合は0に設定してください。


## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}

<SettingsInfoBlock type='Bool' default_value='1' />

複数のスレッドでParquetエンコーディングを実行します。output_format_parquet_use_custom_encoderの設定が必要です。


## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />

行グループの目標サイズ(行数単位)。


## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='536870912' />

圧縮前の目標行グループサイズ（バイト単位）。


## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

String列に対してBinary型の代わりにParquet String型を使用します。


## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}

<SettingsInfoBlock type='Bool' default_value='1' />

より高速なParquetエンコーダー実装を使用します。


## output_format_parquet_version {#output_format_parquet_version}

<SettingsInfoBlock type='ParquetVersion' default_value='2.latest' />

出力形式のParquetフォーマットバージョン。サポートされているバージョン: 1.0、2.4、2.6、および2.latest（デフォルト）


## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetファイルにブルームフィルタを書き込みます。output_format_parquet_use_custom_encoder = true の設定が必要です。


## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}

<SettingsInfoBlock type='Bool' default_value='1' />

Parquetページヘッダーにcrc32チェックサムを含めます。


## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}

<SettingsInfoBlock type='Bool' default_value='1' />

列インデックスとオフセットインデックス（各データページに関する統計情報で、読み取り時のフィルタプッシュダウンに使用できます）をParquetファイルに書き込みます。


## output_format_pretty_color {#output_format_pretty_color}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />

Pretty形式でANSIエスケープシーケンスを使用します。0 - 無効、1 - 有効、'auto' - ターミナルの場合に有効。


## output_format_pretty_display_footer_column_names {#output_format_pretty_display_footer_column_names}

<SettingsInfoBlock type='UInt64' default_value='1' />

テーブルの行数が多い場合、フッターに列名を表示します。

設定可能な値:

- 0 — フッターに列名を表示しません。
- 1 — 行数が [output_format_pretty_display_footer_column_names_min_rows](#output_format_pretty_display_footer_column_names_min_rows) で設定された閾値以上の場合、フッターに列名を表示します(デフォルトは50)。

**例**

クエリ:

```sql
SELECT *, toTypeName(*) FROM (SELECT * FROM system.numbers LIMIT 1000);
```

結果:

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

<SettingsInfoBlock type='UInt64' default_value='50' />

設定 [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) が有効な場合に、列名を含むフッターが表示される最小行数を設定します。


## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、テーブルの幅が広く行数が少ない場合、Pretty形式はVertical形式と同じように出力します。
この動作の詳細な調整については、`output_format_pretty_fallback_to_vertical_max_rows_per_chunk`および`output_format_pretty_fallback_to_vertical_min_table_width`を参照してください。


## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}

<SettingsInfoBlock type='UInt64' default_value='10' />

Vertical形式へのフォールバック(`output_format_pretty_fallback_to_vertical`を参照)は、チャンク内のレコード数が指定された値以下の場合にのみ有効になります。


## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}

<SettingsInfoBlock type='UInt64' default_value='5' />

Vertical形式へのフォールバック(`output_format_pretty_fallback_to_vertical`を参照)は、列数が指定された値を超える場合にのみ有効化されます。


## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}

<SettingsInfoBlock type='UInt64' default_value='250' />

Vertical形式へのフォールバック（`output_format_pretty_fallback_to_vertical`を参照）は、テーブル内の列の長さの合計が指定された値以上である場合、または少なくとも1つの値に改行文字が含まれている場合にのみ有効になります。


## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />

Pretty形式でレンダリングされたデータが複数のチャンクで到着した場合、遅延後であっても、次のチャンクが前のチャンクと同じ列幅である場合、ANSIエスケープシーケンスを使用して前の行に戻り、前のチャンクのフッターを上書きして新しいチャンクのデータで継続します。これにより、結果の視覚的な見やすさが向上します。

0 - 無効、1 - 有効、'auto' - ターミナルの場合に有効


## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}

<SettingsInfoBlock type='String' default_value='UTF-8' />

グリッド罫線を出力する際の文字セット。利用可能な文字セット：ASCII、UTF-8（デフォルト）。


## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にした場合、出力先が端末であるときに、千の位、百万の位などに対応する桁を下線で強調表示します。


## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にした場合、出力先が端末であれば、末尾のスペースを灰色でハイライトし、下線を引きます。


## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}

<SettingsInfoBlock type='UInt64' default_value='24' />

カラム名が長すぎる場合、この長さに切り詰められます。
カラム名は、`output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` の合計よりも長い場合に切り詰められます。


## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}

<SettingsInfoBlock type='UInt64' default_value='4' />

カラム名が長すぎる場合に切り詰める最小文字数。
カラム名が `output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` の合計よりも長い場合に切り詰められます。


## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}

<SettingsInfoBlock type='UInt64' default_value='250' />

Pretty形式で列内のすべての値をパディングする際の最大幅。


## output_format_pretty_max_rows {#output_format_pretty_max_rows}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Pretty形式の最大行数。


## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}

<SettingsInfoBlock type='UInt64' default_value='10000' />

Pretty形式で表示する値の最大幅です。この値を超える場合は切り詰められます。
値が0の場合は切り詰めを行いません。


## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}

<SettingsInfoBlock type='UInt64' default_value='0' />

ブロック内に単一の値でない場合にのみ値を切り詰めます（`output_format_pretty_max_value_width`設定を参照）。単一の値の場合は完全に出力します。これは`SHOW CREATE TABLE`クエリで有用です。


## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

有効にすると、Pretty形式は複数行のフィールドをテーブルセル内にレンダリングし、テーブルの外枠が保持されます。
無効にすると、フィールドはそのままレンダリングされ、テーブルが崩れる可能性があります（無効にする利点の1つは、複数行の値のコピー&ペーストが容易になることです）。


## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}

<SettingsInfoBlock type='Bool' default_value='1' />

Pretty出力形式で各行の前に行番号を追加します


## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />

ブロックがこの値を超える単一の数値で構成されている場合（0を除く）、テーブルの右側に読みやすい形式の数値ヒントを表示します


## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}

<SettingsInfoBlock type='UInt64' default_value='50' />

指定されたミリ秒数まで次のブロックを待機し、書き込み前に前のブロックに結合します。
これにより、小さすぎるブロックが頻繁に出力されることを回避しながら、ストリーミング形式でデータを表示できます。


## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />

前回の出力から指定されたミリ秒数以上が経過した場合、保留中のブロックをprettyフォーマットで出力します。


## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}

<SettingsInfoBlock type='Bool' default_value='0' />

Googleラッパーを使用してNullableカラムをシリアライズする際、デフォルト値を空のラッパーとしてシリアライズします。この設定を無効にすると、デフォルト値とnull値はシリアライズされません


## output_format_schema {#output_format_schema}

[Cap'n Proto](/interfaces/formats/CapnProto)または[Protobuf](/interfaces/formats/Protobuf)形式で自動生成されたスキーマを保存するファイルのパスです。


## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}

<SettingsInfoBlock type='Bool' default_value='1' />

INSERT クエリにカラム名を含める


## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}

<SettingsInfoBlock type='UInt64' default_value='65409' />

1つのINSERT文に含めることができる最大行数。


## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}

<SettingsInfoBlock type='Bool' default_value='1' />

カラム名を '`' 文字で囲む


## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}

<SettingsInfoBlock type='String' default_value='table' />

出力INSERT文のテーブル名


## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}

<SettingsInfoBlock type='Bool' default_value='0' />

INSERT文の代わりにREPLACE文を使用する


## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

trueに設定した場合、TSV形式の行末文字が\\nの代わりに\\r\\nになります。


## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}

<SettingsInfoBlock type='Bool' default_value='0' />

trueの場合、'を''でエスケープします。それ以外の場合は\\'でエスケープします


## output_format_write_statistics {#output_format_write_statistics}

<SettingsInfoBlock type='Bool' default_value='1' />

適切な出力形式で、読み取った行数、バイト数、経過時間に関する統計情報を書き込みます。

デフォルトで有効


## precise_float_parsing {#precise_float_parsing}

<SettingsInfoBlock type='Bool' default_value='0' />

より精密な(ただし低速な)浮動小数点数解析アルゴリズムを優先する


## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}

<SettingsInfoBlock type='Bool' default_value='1' />

Hyperscanライブラリを使用するregexp_tree辞書を許可します。


## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}

<SettingsInfoBlock type='Bool' default_value='0' />

regexp_tree辞書で大文字と小文字を区別しないマッチングを使用します。個別の正規表現で(?i)および(?-i)を使用してオーバーライドできます。


## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}

<SettingsInfoBlock type='Bool' default_value='0' />

regexp_tree辞書において、'.'を改行文字にマッチさせることを許可します。


## rows_before_aggregation {#rows_before_aggregation}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、ClickHouseはrows_before_aggregation統計の正確な値を提供します。これは集計前に読み取られた行数を表します


## schema_inference_hints {#schema_inference_hints}

スキーマを持たない形式におけるスキーマ推論のヒントとして使用するカラム名と型のリスト。

例:

クエリ:

```sql
desc format(JSONEachRow, '{"x" : 1, "y" : "String", "z" : "0.0.0.0" }') settings schema_inference_hints='x UInt8, z IPv4';
```

結果:

```sql
x   UInt8
y   Nullable(String)
z   IPv4
```

:::note
`schema_inference_hints`が適切にフォーマットされていない場合、またはタイプミスや誤ったデータ型などがある場合、`schema_inference_hints`全体が無視されます。
:::


## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}

<SettingsInfoBlock type='UInt64Auto' default_value='3' />

スキーマ推論において、推論された型を`Nullable`にするかどうかを制御します。
設定可能な値:

- 0 - 推論された型は決して`Nullable`になりません(この場合のnull値の扱いについては input_format_null_as_default を使用して制御します)
- 1 - すべての推論された型が`Nullable`になります
- 2 または `auto` - スキーマ推論中に解析されるサンプル内でカラムが`NULL`を含む場合、またはファイルメタデータにカラムのnull許容性に関する情報が含まれる場合のみ、推論された型が`Nullable`になります
- 3 - フォーマットがメタデータを持つ場合(例: Parquet)は推論された型のnull許容性がファイルメタデータと一致し、それ以外の場合(例: CSV)は常にNullableになります


## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}

<SettingsInfoBlock type='Bool' default_value='0' />

スキーマ推論において、推論されたJSON型を`Nullable`にするかどうかを制御します。
この設定をschema_inference_make_columns_nullableと共に有効にすると、推論されたJSON型は`Nullable`になります。


## schema_inference_mode {#schema_inference_mode}

<SettingsInfoBlock type='SchemaInferenceMode' default_value='default' />

スキーマ推論のモード。'default' - すべてのファイルが同じスキーマを持つと仮定し、任意のファイルからスキーマを推論可能、'union' - ファイルごとに異なるスキーマを持つ可能性があり、結果のスキーマはすべてのファイルのスキーマの和集合となる


## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}

<SettingsInfoBlock
  type='IdentifierQuotingRule'
  default_value='when_necessary'
/>

SHOW CREATE クエリにおける識別子の引用符ルールを設定します


## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}

<SettingsInfoBlock type='IdentifierQuotingStyle' default_value='Backticks' />

SHOW CREATE クエリにおける識別子の引用符スタイルを設定します


## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}

<SettingsInfoBlock type='Bool' default_value='0' />

有効にすると、JSONオブジェクトをJSON型に解析する際、重複したパスは無視され、例外をスローする代わりに最初のパスのみが挿入されます


## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}

<SettingsInfoBlock type='Bool' default_value='1' />

Array/Map/Tupleなどのネストされた型内で実験的な型および疑わしい型の使用を検証します
