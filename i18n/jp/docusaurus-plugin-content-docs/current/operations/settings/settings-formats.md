---
title: "フォーマット設定"
sidebar_label: "フォーマット設定"
slug: /operations/settings/formats
toc_max_heading_level: 2
description: "入出力フォーマットを制御する設定。"
doc_type: "reference"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

<!-- 自動生成 -->

これらの設定は [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h) から自動的に生成されています。

## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}   

<SettingsInfoBlock type="Bool" default_value="0" />

"on"、"off"、"enable"、"disable" などの特殊なテキスト形式の Bool 値から、Variant 型内の Bool 値をパースできるようにします。

## bool_false_representation {#bool_false_representation}   

<SettingsInfoBlock type="String" default_value="false" />

TSV/CSV/Vertical/Pretty フォーマットで false の bool 値を表すテキスト。

## bool_true_representation {#bool_true_representation}   

<SettingsInfoBlock type="String" default_value="true" />

TSV/CSV/Vertical/Pretty 各フォーマットで、bool 型の true 値を表現する文字列。

## check_conversion_from_numbers_to_enum {#check_conversion_from_numbers_to_enum}   

<SettingsInfoBlock type="Bool" default_value="0" />

数値から Enum への変換の際に、その値が Enum 内に存在しない場合は例外をスローします。

デフォルトでは無効です。

## column_names_for_schema_inference {#column_names_for_schema_inference}   

カラム名を持たないフォーマットに対して、スキーマ推論に使用するカラム名のリストです。書式: 'column1,column2,column3,...'

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}   

<SettingsInfoBlock type="Bool" default_value="0" />

datetime64 の値の末尾の 0 を動的に削除して、出力スケールを [0, 3, 6] に調整します。
それぞれ 'seconds'、'milliseconds'、'microseconds' に対応します。

## date_time_input_format {#date_time_input_format}   

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

日付と時刻のテキスト表現を解析するためのパーサーを選択します。

この設定は[日付と時刻の関数](../../sql-reference/functions/date-time-functions.md)には適用されません。

指定可能な値:

- `'best_effort'` — 拡張的な解析を有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` と、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日付・時刻形式を解析できます。例: `'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — `best_effort` と同様です（違いは [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS) を参照）。

- `'basic'` — 基本的なパーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみを解析できます。例: `2019-08-20 10:18:56` または `2019-08-20`。

Cloud におけるデフォルト値: `'best_effort'`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format {#date_time_output_format}   

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

日付と時刻のテキスト表現の出力形式を選択できます。

指定可能な値:

- `simple` - シンプルな出力形式。

    ClickHouse は日付と時刻を `YYYY-MM-DD hh:mm:ss` の形式で出力します。例: `2019-08-20 10:18:56`。計算は、データ型にタイムゾーンが指定されている場合はそのタイムゾーン、指定されていない場合はサーバーのタイムゾーンに従って行われます。

- `iso` - ISO 出力形式。

    ClickHouse は日付と時刻を [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) の `YYYY-MM-DDThh:mm:ssZ` 形式で出力します。例: `2019-08-20T10:18:56Z`。出力は UTC であることに注意してください（`Z` は UTC を意味します）。

- `unix_timestamp` - UNIX タイムスタンプ出力形式。

    ClickHouse は日付と時刻を [UNIX タイムスタンプ](https://en.wikipedia.org/wiki/Unix_time) 形式で出力します。例: `1566285536`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior {#date_time_overflow_behavior}   

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md) または整数を Date、Date32、DateTime、DateTime64 に変換する際に、その値が結果の型で表現できない場合の動作を定義します。

設定可能な値:

- `ignore` — オーバーフローを静かに無視します。結果は未定義です。
- `throw` — オーバーフローが発生した場合に例外をスローします。
- `saturate` — 結果をサチュレート（飽和）させます。値が対象の型で表現可能な最小値より小さい場合、結果は表現可能な最小値になります。値が対象の型で表現可能な最大値より大きい場合、結果は表現可能な最大値になります。

デフォルト値: `ignore`。

## errors_output_format {#errors_output_format}   

<SettingsInfoBlock type="String" default_value="CSV" />

エラーをテキスト出力する形式。

## format_avro_schema_registry_url {#format_avro_schema_registry_url}   

AvroConfluent 形式用の Confluent Schema Registry の URL。

## format_binary_max_array_size {#format_binary_max_array_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 形式における Array の最大許容サイズです。破損したデータによって大量のメモリが割り当てられることを防ぎます。0 を指定した場合は制限がありません。

## format_binary_max_object_size {#format_binary_max_object_size}   

<SettingsInfoBlock type="UInt64" default_value="100000" />

JSON 型の RowBinary フォーマットで、1 つの Object に含めることができるパスの最大数です。破損したデータにより大量のメモリが割り当てられることを防ぎます。0 を指定すると上限はありません。

## format_binary_max_string_size {#format_binary_max_string_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 形式における String の最大許容サイズです。破損したデータにより大量のメモリが確保されることを防ぎます。0 を指定した場合は上限がないことを意味します。

## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}   

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

ClickHouse の Enum と CapnProto の Enum の対応付け方法

## format_capn_proto_max_message_size {#format_capn_proto_max_message_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

1つの CapnProto メッセージの最大サイズ（バイト単位）。不正な形式または破損したデータによる過剰なメモリ割り当てを防ぎます。デフォルトは 1 GiB です。

## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema が設定されていない場合、自動生成された CapnProto スキーマを使用します

## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合は、二重引用符で囲まれた文字列を許可します。

## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、シングルクォートで囲まれた文字列を許可します。

## format_csv_delimiter {#format_csv_delimiter}   

<SettingsInfoBlock type="Char" default_value="," />

CSV データ内で区切り文字として扱う文字を指定します。文字列で指定する場合、その文字列は 1 文字である必要があります。

## format_csv_null_representation {#format_csv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

CSV フォーマットにおける NULL のカスタム表現

## format_custom_escaping_rule {#format_custom_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

フィールドのエスケープ規則（CustomSeparated 形式用）

## format_custom_field_delimiter {#format_custom_field_delimiter}   

<SettingsInfoBlock type="String" default_value="	" />

フィールド同士の区切り文字（CustomSeparated 形式用）

## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}   

結果セットの末尾に付与するサフィックス（CustomSeparated フォーマット用）

## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}   

結果セットの前に付加されるプレフィックス（CustomSeparated 形式用）

## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

最後のカラムのフィールドの後に置かれるデリミタ（CustomSeparated フォーマット用）

## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}   

先頭カラムのフィールドの前に付与される区切り文字（CustomSeparated フォーマット用）

## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}   

行と行の間の区切り文字（CustomSeparated 形式用）

## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}   

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、ディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを制御します。

シークレットを表示したいユーザーは、
[`display_secrets_in_show_and_select` サーバー設定](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
を有効にし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限も持っている必要があります。

設定可能な値:

-   0 — 無効。
-   1 — 有効。

## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}   

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) フォーマットでオブジェクト名を保存および書き込みするために使用されるカラム名。
カラムの型は String である必要があります。値が空の場合、オブジェクト名にはデフォルト名 `row_{i}` が使用されます。

## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

`format_schema` が設定されていない場合、自動生成された Protobuf スキーマを使用します

## format_regexp {#format_regexp}   

正規表現（Regexp 形式用）

## format_regexp_escaping_rule {#format_regexp_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

Regexp フォーマット用のフィールドエスケープ規則

## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}   

<SettingsInfoBlock type="Bool" default_value="0" />

正規表現にマッチしない行をスキップします（Regexp 形式）

## format_schema {#format_schema}   

このパラメータは、[Cap'n Proto](https://capnproto.org/) や [Protobuf](https://developers.google.com/protocol-buffers/) といったスキーマ定義を必要とするフォーマットを使用する場合に指定します。値はフォーマットに依存します。

## format_schema_message_name {#format_schema_message_name}   

`format_schema` で定義されたスキーマ内で、対象となるメッセージの名前を定義します。
レガシーな format_schema 形式（`file_name:message_name`）との互換性を維持するため、次のように動作します。

- `format_schema_message_name` が指定されていない場合、レガシーな `format_schema` 値の `message_name` 部分からメッセージ名が推論されます。
- レガシー形式を使用している際に `format_schema_message_name` が指定されている場合は、エラーが発生します。

## format_schema_source {#format_schema_source}   

<SettingsInfoBlock type="String" default_value="file" />

`format_schema` のソースを定義します。
指定可能な値:

- 'file' (デフォルト): `format_schema` は `format_schemas` ディレクトリ内にあるスキーマファイルの名前です。
- 'string': `format_schema` はスキーマのリテラルな内容です。
- 'query': `format_schema` はスキーマを取得するためのクエリです。

`format_schema_source` が 'query' に設定されている場合、次の条件が適用されます:
- クエリはちょうど 1 つの値、つまり 1 行 1 つの文字列カラムのみを返さなければなりません。
- クエリの結果はスキーマの内容として扱われます。
- この結果はローカルの `format_schemas` ディレクトリにキャッシュされます。
- 次のコマンドを使用してローカルキャッシュをクリアできます: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`。
- 一度キャッシュされると、キャッシュが明示的にクリアされるまで、同一のクエリはスキーマ取得のために再実行されません。
- ローカルキャッシュファイルに加えて、Protobuf メッセージもメモリ内にキャッシュされます。ローカルキャッシュファイルをクリアした後でも、スキーマを完全にリフレッシュするには `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` を使用してメモリ内キャッシュをクリアする必要があります。
- クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` を実行して、キャッシュファイルと Protobuf メッセージのスキーマの両方のキャッシュを一度にクリアします。

## format_template_resultset {#format_template_resultset}   

結果セットのフォーマット文字列を含むファイルのパス（Template フォーマット用）

## format_template_resultset_format {#format_template_resultset_format}   

Template 形式における結果セット用の書式文字列

## format_template_row {#format_template_row}   

行用のフォーマット文字列（Template フォーマット）を含むファイルへのパス

## format_template_row_format {#format_template_row_format}   

行用のフォーマット文字列（Template フォーマット用）

## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

行同士の区切り文字（Template フォーマット用）

## format_tsv_null_representation {#format_tsv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

TSV 形式における NULL のカスタム表現

## input_format_allow_errors_num {#input_format_allow_errors_num}   

<SettingsInfoBlock type="UInt64" default_value="0" />

テキスト形式（CSV、TSV など）からデータを読み取る際に許容されるエラーの最大数を設定します。

デフォルト値は 0 です。

必ず `input_format_allow_errors_ratio` と組み合わせて使用してください。

行の読み取り中にエラーが発生しても、エラーカウンターがまだ `input_format_allow_errors_num` より小さい場合、ClickHouse はその行を無視して次の行の処理に進みます。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方が上限を超えた場合、ClickHouse は例外を送出します。

## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}   

<SettingsInfoBlock type="Float" default_value="0" />

テキスト形式（CSV、TSV など）から読み取る際に許可されるエラーの最大割合を設定します。
エラーの割合は 0 から 1 の間の浮動小数点数で指定します。

デフォルト値は 0 です。

必ず `input_format_allow_errors_num` と併用してください。

行の読み取り中にエラーが発生しても、エラーカウンターがまだ `input_format_allow_errors_ratio` 未満の場合、ClickHouse はその行を無視して次の行の読み取りを続行します。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方を超えた場合、ClickHouse は例外をスローします。

## input_format_allow_seeks {#input_format_allow_seeks}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC、Parquet、Arrow 形式の入力フォーマットを読み取る際にシークを許可します。

デフォルトでは有効です。

## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 入力フォーマットの読み取り時に、不足しているカラムを許可します

## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow のカラムと CH のカラムを照合する際に大文字・小文字を無視します。

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow フォーマットのスキーマ推論時にサポートされていない型のカラムをスキップする

## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent フォーマットの場合: スキーマ内にフィールドが見つからない場合、エラーではなくデフォルト値を使用します

## input_format_avro_null_as_default {#input_format_avro_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent フォーマットの場合: null が指定された Nullable ではないカラムに対してデフォルト値を挿入します

## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 入力フォーマットで、型名ではなくデータ型をバイナリ形式で読み取ります

## input_format_binary_max_type_complexity {#input_format_binary_max_type_complexity}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

バイナリ型をデコードする際の型ノードの最大数（深さではなく合計数）。`Map(String, UInt32)` = 3 ノード。悪意のある入力から保護するための制限。0 = 無制限。

## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinary 入力フォーマットで、[JSON](../../sql-reference/data-types/newjson.md) データ型の値を、JSON を表現する [String](../../sql-reference/data-types/string.md) 型の値として読み取ります。

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

BSON フォーマットのスキーマ推論時にサポートされていない型のフィールドをスキップします。

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

CapnProto フォーマットのスキーマ推論時に未サポートの型を持つカラムをスキップします

## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、行末に他の文字が続かない \\r が許可されます 

## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 入力では、ファイルに想定より多くのカラムがある場合は余分なカラムを無視し、不足しているフィールドはデフォルト値で補完します

## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 文字列内でフィールド区切り文字としてスペースおよびタブ (\\t) の使用を許可します。

## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV から Array を読み取る際には、その要素がネストされた CSV 形式でシリアライズされ、そのうえで文字列として格納されているものと想定します。例: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。配列を囲む角かっこは省略できます。

## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、CSV 形式で書き込まれた個々のカラムを Tuple カラムとしてデシリアライズできます。

## input_format_csv_detect_header {#input_format_csv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前および型を含む CSV 形式のヘッダーを自動検出します

## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 入力の空フィールドをデフォルト値として解釈します。

## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で挿入された enum 値を enum のインデックスとして解釈します

## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

CSV 形式のデータの先頭から、指定した行数をスキップします

## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で末尾の空行をスキップする

## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 文字列の先頭および末尾にあるスペースとタブ (\\t) 文字をトリミングします

## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論時に ClickHouse は文字列フィールドから数値型を推論しようとします。
CSV データにクォートされた UInt64 の数値が含まれている場合に有用です。

デフォルトでは無効です。

## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}   

<SettingsInfoBlock type="Bool" default_value="1" />

入力データ内の引用符で囲まれたタプルを、String 型の値として解釈します。

## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 形式のスキーマ推論において、いくつかの調整やヒューリスティック手法を用います

## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}   

<SettingsInfoBlock type="Bool" default_value="0" />

不正な値が原因でCSVフィールドのデシリアライズに失敗した場合に、そのカラムにデフォルト値を使用できるようにします

## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 入力で、ファイルに想定より多くのカラムが含まれている場合は余分なカラムを無視し、不足しているフィールドはデフォルト値として扱います

## input_format_custom_detect_header {#input_format_custom_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

CustomSeparated 形式のヘッダー行（名前および型）を自動検出する

## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 形式で末尾の空行をスキップする

## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` クエリを実行する際、省略された入力カラムの値を、それぞれのカラムのデフォルト値で置き換えます。このオプションは [JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native) フォーマットおよび `WithNames`/`WithNamesAndTypes` サフィックスを持つフォーマットに適用されます。

:::note
このオプションを有効にすると、拡張されたテーブルメタデータがサーバーからクライアントに送信されます。これによりサーバー側で追加の計算リソースを消費し、パフォーマンスが低下する可能性があります。
:::

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

省略されたフィールドを強制的に NULL で初期化します

## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Hive Text 入力で、ファイルに想定より多くのカラムがある場合は余分なカラムを無視し、不足しているフィールドはデフォルト値として扱います

## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File 内の collection（array または map）内要素の区切り文字

## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File 内のフィールド区切り文字

## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File におけるマップのキー／値ペア同士の区切り文字

## input_format_import_nested_json {#input_format_import_nested_json}   

<SettingsInfoBlock type="Bool" default_value="0" />

ネストしたオブジェクトを含む JSON データの挿入を有効または無効にします。

サポートされるフォーマット:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

指定可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- `JSONEachRow` フォーマットにおける [ネスト構造の利用](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)。

## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

IPv4 のデシリアライズ時に変換エラーが発生した場合、例外をスローせずデフォルト値を使用します。

デフォルトでは無効です。

## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

IPv6 のデシリアライズ時に変換エラーが発生しても、例外をスローせずにデフォルト値を使用します。

デフォルトでは無効です。

## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSONCompact/JSONCompactEachRow 入力フォーマットで、行内のカラム数の変動を許可します。
想定よりも多いカラムを持つ行に含まれる余分なカラムは無視し、不足しているカラムにはデフォルト値を使用します。

デフォルトでは無効です。

## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルを解析する際に、JSON オブジェクト内で欠落している要素に対してデフォルト値を挿入します。
この設定は、`input_format_json_named_tuples_as_objects` が有効な場合にのみ有効です。

デフォルトで有効です。

## input_format_json_empty_as_default {#input_format_json_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON 内の空の入力フィールドをデフォルト値で置き換えます。複雑なデフォルト値の式を扱うには、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

設定可能な値:

+ 0 — 無効。
+ 1 — 有効。

## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプル用の JSON オブジェクトで、未知のキーを無視します。

デフォルトで有効です。

## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

不要なフィールドを無視し、解析しません。これを有効にすると、形式が不正であったりフィールドが重複している JSON 文字列に対しても、例外がスローされない場合があります。

## input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types {#input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;different&#95;types}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論時に ClickHouse は、異なるデータ型の値を含む JSON 配列に対して Array(Dynamic) 型を使用します。

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

既定で有効です。


## input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings}

<SettingsInfoBlock type="Bool" default_value="1" />

スキーマ推論中に、サンプルデータ内で `Null`/`{}`/`[]` のみを含む JSON キーに対して String 型を使用できるようにします。
JSON 形式では任意の値を String として読み取ることができるため、未知の型を持つキーに対して String 型を使用することで、
スキーマ推論時に `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` のようなエラーを回避できます。

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

<SettingsInfoBlock type="Bool" default_value="0" />

Map 型のカラムを、タプルの JSON 配列としてデシリアライズします。

デフォルトでは無効です。

## input_format_json_max_depth {#input_format_json_max_depth}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

JSON 内のフィールドの最大深度です。これは厳密な上限ではなく、必ずしも厳密に適用されるわけではありません。

## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルのカラムを JSON オブジェクトとして解釈します。

デフォルトで有効になっています。

## input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、JSON 配列を文字列として解析できるようにします。

例：

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```

結果：

```
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```

デフォルトで有効です。


## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、真偽値を数値として解析できるようにします。

デフォルトで有効です。

## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力形式で、bool 値を文字列として解析できるようにします。

デフォルトで有効です。

## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON入力フォーマットで、数値を文字列として解析できるようにします。

デフォルトで有効です。

## input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、JSON オブジェクトを文字列として解析できるようにします。

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

デフォルトで有効


## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON入力フォーマットで、JSON文字列に不正なエスケープシーケンスが含まれている場合は、例外をスローします。無効にすると、不正なエスケープシーケンスはデータ内でそのまま保持されます。

デフォルトで有効です。

## input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論時に ClickHouse は JSONオブジェクトから名前付き Tuple を推論しようとします。
生成される名前付き Tuple には、サンプルデータ中の対応するすべての JSONオブジェクトに含まれる全ての要素が含まれます。

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

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論の際に ClickHouse は文字列フィールドから数値を推論しようとします。
JSON データに引用符で囲まれた UInt64 数値が含まれている場合に有用です。

デフォルトでは無効です。

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}   

<SettingsInfoBlock type="Bool" default_value="0" />

名前付きタプル推論の際に、JSON オブジェクト内でパスがあいまいな場合は、例外を送出せずに String 型を使用します

## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON/JSONCompact/JSONColumnsWithMetadata の入力フォーマットに対して、この設定が 1 に指定されている場合、
入力データ内のメタデータに含まれる型が、テーブル内の対応するカラムの型と照合されます。

デフォルトで有効です。

## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="0" />

入力フォーマットでのデータのパース中に形成されるブロックのサイズを、バイト単位で制限します。ブロックが ClickHouse 側で形成される行ベースの入力フォーマットで使用されます。
0 を指定すると、バイト数に上限はありません。

## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="33554432" />

自動スキーマ推論を行う際に読み取るデータ量の上限（バイト単位）。

## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="25000" />

スキーマの自動推論のために読み取るデータの最大行数です。

## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}   

<SettingsInfoBlock type="UInt64" default_value="0" />

挿入する MsgPack データのカラム数です。データからスキーマを自動推論する際に使用されます。

## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

MySQL ダンプ内のテーブルのカラムと ClickHouse テーブルのカラムをカラム名で対応付けます。

## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}   

MySQL ダンプからデータを読み込む際のテーブル名

## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}   

<SettingsInfoBlock type="Bool" default_value="1" />

Native 入力フォーマットでのデータ型の変換を許可する

## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Native 入力フォーマットで、型名ではなくデータ型をバイナリ形式で読み込みます。

## input_format_null_as_default {#input_format_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

フィールドのデータ型が[Nullable](/sql-reference/data-types/nullable)でない場合に、[NULL](/sql-reference/syntax#literals) フィールドを[デフォルト値](/sql-reference/statements/create/table#default_values)で初期化するかどうかを制御します。
カラムの型が Nullable でなく、この設定が無効な場合には、`NULL` を挿入すると例外が発生します。カラムの型が Nullable の場合、この設定に関係なく、`NULL` 値はそのまま挿入されます。

この設定は、ほとんどの入力フォーマットに適用されます。

複雑なデフォルト式を使用する場合は、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

設定可能な値:

- 0 — Nullable でないカラムに `NULL` を挿入すると例外が発生します。
- 1 — `NULL` フィールドはカラムのデフォルト値で初期化されます。

## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC 入力フォーマットの読み取り時に、欠落しているカラムを許可する

## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

ORC カラムを ClickHouse のカラムに一致させる際に、大文字小文字を区別しません。

## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルを読み込む際、辞書エンコードされた ORC カラムを LowCardinality カラムとして扱います。

## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルを読み込む際、WHERE/PREWHERE 句および ORC メタデータ内の最小/最大の統計情報やブルームフィルターに基づいて、ストライプ全体または行グループをスキップします。

## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 行リーダーで使用するタイムゾーン名です。デフォルトのタイムゾーンは GMT です。

## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}   

<SettingsInfoBlock type="Int64" default_value="100000" />

ORC ストライプを読み込む際のバッチサイズ。

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

ORC フォーマットのスキーマ推論を行う際に、サポートされていない型を持つカラムをスキップします

## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

より高速な ORC デコーダーの実装を使用します。

## input_format_parallel_parsing {#input_format_parallel_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

データ形式の順序を保持した並列パースを有効または無効にします。[TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) 形式でのみサポートされます。

指定可能な値:

- 1 — 有効。
- 0 — 無効。

## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}   

<SettingsInfoBlock type="Bool" default_value="1" />

geo カラム用パーサーを使用して、Array(UInt8) を Point/Linestring/Polygon/MultiLineString/MultiPolygon 型に変換します。

## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet 入力フォーマットの読み込み時に、欠落しているカラムを許可する

## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、Parquet メタデータ内の WHERE 句とブルームフィルタに基づいて、行グループ全体をスキップします。

## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet のカラムを ClickHouse のカラムに照合する際に、大文字と小文字を区別しません。

## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際、JSON カラムを ClickHouse の JSON カラムとして解析します。

## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet の解析中に row group のプリフェッチを有効にします。現在は単一スレッドでの解析時にのみプリフェッチが可能です。

## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際、Parquet メタデータの min/max 統計情報および WHERE/PREWHERE 式に基づいて、行グループ全体をスキップします。

## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}   

<SettingsInfoBlock type="UInt64" default_value="8192" />

Parquet 入力フォーマットで、無視しながら読み込むのではなくシークを行うために、ローカルファイル読み取りに必要な最小バイト数

## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}   

<SettingsInfoBlock type="Bool" default_value="1" />

`isAdjustedToUTC=false` の Parquet タイムスタンプに対して、スキーマ推論で使用されるデータ型を決定します。`true` の場合は `DateTime64(..., 'UTC')`、`false` の場合は `DateTime64(...)` になります。ClickHouse にはローカルのウォールクロック時刻用のデータ型が存在しないため、どちらの挙動も完全に正しいとは言えません。直感に反して、`true` のほうがまだ誤りの少ない選択肢と考えられます。というのも、`'UTC'` タイムスタンプを `String` としてフォーマットすると、結果として正しいローカル時刻の表現が得られるためです。

## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Parquet リーダーの最大ブロックサイズ。

## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}   

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Parquet リーダー v3 用の概算メモリ上限です。並列で読み取ることができる行グループやカラムの数を制限します。1 つのクエリで複数のファイルを読み取る場合、この上限はそれらのファイル全体でのメモリ使用量に対して適用されます。

## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}   

<SettingsInfoBlock type="UInt64" default_value="2097152" />

メモリ使用量がこの閾値を下回っている場合、より積極的にプリフェッチを行います。多数の小さなブルームフィルタをネットワーク越しに読み取る必要がある場合などに有用です。

## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

カラムの索引に含まれる最小値/最大値を使用してページをスキップします。

## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}   

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Parquet リーダーが出力するブロックの平均バイト数

## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet ファイルから読み込む際に行の並び替えを抑制します。行の順序は一般に保証されず、クエリパイプラインの他の部分で変更される可能性があるため、この設定の使用は推奨されません。代わりに `ORDER BY _row_number` を使用してください。

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet 形式のスキーマ推論時にサポートされていない型のカラムをスキップします

## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet リーダー v3 を使用します。

## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

ページフィルタリングを行わない場合の、Parquet ファイルからのページの読み取り方法に対する小さな変更です。

## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際にページチェックサムを検証します。

## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

通常の非ネストカラムに対して Google のラッパー型を有効にします。例えば、String カラム `str` に対して google.protobuf.StringValue `str` を使用します。Nullable カラムについては、空のラッパーはデフォルト値として扱われ、省略されている場合は NULL として扱われます。

## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}   

<SettingsInfoBlock type="Bool" default_value="0" />

専用の列に enum 値を設定することで、どの protobuf oneof フィールドが見つかったかを示します。

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Protobuf フォーマットのスキーマ推論時に、サポートされていない型のフィールドをスキップします。

## input_format_record_errors_file_path {#input_format_record_errors_file_path}   

テキスト形式（CSV、TSV）を読み取る際に発生したエラーを記録するファイルのパス。

## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

余分なデータの挿入をスキップするかどうかを有効化／無効化します。

データを書き込む際、入力データに対象テーブルに存在しないカラムが含まれていると、ClickHouse は例外をスローします。スキップが有効な場合、ClickHouse は余分なデータを挿入せず、例外もスローしません。

サポートされるフォーマット:

- [JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）
- [BSONEachRow](/interfaces/formats/BSONEachRow)（およびその他の JSON フォーマット）
- [TSKV](/interfaces/formats/TSKV)
- 接尾辞 WithNames/WithNamesAndTypes が付くすべてのフォーマット
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

取りうる値:

- 0 — 無効。
- 1 — 有効。

## input_format_try_infer_dates {#input_format_try_infer_dates}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効化されている場合、ClickHouse はテキスト形式のスキーマ推論時に、文字列フィールドから型 `Date` を推論しようとします。入力データ内のあるカラムのすべてのフィールドが日付として正常に解釈できた場合、結果の型は `Date` になり、少なくとも 1 つのフィールドが日付として解釈できなかった場合、結果の型は `String` になります。

デフォルトで有効です。

## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、ClickHouse はテキスト形式のスキーマを推論する際に、文字列フィールドから型 `DateTime64` を推論しようとします。入力データのあるカラム内のすべてのフィールドが日時として正常にパースされた場合、結果の型は `DateTime64` になり、少なくとも 1 つでも日時としてパースできなかったフィールドがある場合、結果の型は `String` になります。

デフォルトで有効です。

## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}   

<SettingsInfoBlock type="Bool" default_value="0" />

input_format_try_infer_datetimes が有効な場合は、DateTime 型ではなく DateTime64 型のみを推論対象とします

## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

テキスト形式でスキーマを推論する際に、指数表記の数値を浮動小数点数として解釈して推論しようとします（ただし、指数表記の数値が常に推論される JSON は除く）。

## input_format_try_infer_integers {#input_format_try_infer_integers}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効化されている場合、ClickHouse はテキスト形式のスキーマ推論時に、float ではなく整数を推論しようとします。入力データのカラム内のすべての数値が整数であれば、結果の型は `Int64` になり、少なくとも 1 つでも float が含まれていれば、結果の型は `Float64` になります。

デフォルトで有効です。

## input_format_try_infer_variants {#input_format_try_infer_variants}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ClickHouse はテキストフォーマットのスキーマ推論時に、カラムや配列要素に対して複数の型が考えられる場合に [`Variant`](../../sql-reference/data-types/variant.md) 型を推論しようとします。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力で余分なカラム（ファイルのカラム数が想定より多い場合）を無視し、不足しているフィールドはデフォルト値として扱います

## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定されている場合、file 関数は `\n` の代わりに `\r\n` を行末とする TSV 形式としてファイルを読み取ります。

## input_format_tsv_detect_header {#input_format_tsv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 形式のヘッダー（名前および型）を自動検出します

## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力の空フィールドをデフォルト値として扱います。

## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で挿入された Enum の値を、Enum のインデックスとして解釈します。

## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

TSV 形式のデータの先頭から指定した行数をスキップします

## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で末尾の空行をスキップする

## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

TSV フォーマットでスキーマを推論する際に、いくつかの調整やヒューリスティック手法を用います

## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values 形式では、Template を使用して式をパースおよび解釈する際に、リテラルの実際の型を検査し、オーバーフローや精度の問題を回避します。

## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values 形式の場合: フィールドがストリーミングパーサーでパースできない場合、SQL パーサーを実行し、SQL 式のテンプレートを推定して、それを用いてすべての行のパースを試みたうえで、すべての行に対して式を解釈します。

## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values 形式の場合、ストリーミングパーサーでフィールドを解析できなかったときは、SQL パーサーを実行して、そのフィールドを SQL 式として解釈しようとします。

## input_format_with_names_use_header {#input_format_with_names_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

データ挿入時にカラムの順序を検証する処理を有効または無効にします。

挿入パフォーマンスを向上させるため、入力データのカラムの順序が対象テーブルと同一であることが確実な場合は、このチェックを無効にすることを推奨します。

サポートされているフォーマット：

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

設定可能な値：

- 0 — 無効。
- 1 — 有効。

## input_format_with_types_use_header {#input_format_with_types_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

フォーマットパーサーが、入力データのデータ型が対象テーブルのデータ型と一致しているかを検証するかどうかを制御します。

サポートされるフォーマット:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

取り得る値:

- 0 — 無効。
- 1 — 有効。

## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}   

<SettingsInfoBlock type="Bool" default_value="0" />

分散キーがない場合に、[Distributed](/engines/table-engines/special/distributed) テーブルへの分片へのランダムな挿入を有効または無効にします。

デフォルトでは、複数の分片を持つ `Distributed` テーブルにデータを挿入する際、分散キーがない場合は ClickHouse サーバーは挿入要求を拒否します。`insert_distributed_one_random_shard = 1` のときは挿入が許可され、データはすべての分片に対してランダムに転送されます。

可能な値:

- 0 — 複数の分片が存在し、かつ分散キーが指定されていない場合、挿入は拒否されます。
- 1 — 分散キーが指定されていない場合、利用可能なすべての分片に対してランダムに挿入が行われます。

## interval_output_format {#interval_output_format}   

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

interval 型のテキスト表現の出力形式を選択できる設定です。

可能な値:

-   `kusto` - KQL スタイルの出力形式。

    ClickHouse は interval を [KQL 形式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier) で出力します。例えば、`toIntervalDay(2)` は `2.00:00:00` のようにフォーマットされます。長さが一定でない interval 型（例: `IntervalMonth` や `IntervalYear`）については、1 interval あたりの平均秒数が出力に使用される点に注意してください。

-   `numeric` - 数値の出力形式。

    ClickHouse は interval を、その基礎となる数値表現として出力します。例えば、`toIntervalDay(2)` は `2` のようにフォーマットされます。

参照:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}   

<SettingsInfoBlock type="Bool" default_value="0" />

INTO OUTFILE を使用する際、親ディレクトリが存在しない場合は自動的に作成します。

## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON キー名に含まれるドットが解析時にエスケープされます。

## output_format_arrow_compression_method {#output_format_arrow_compression_method}   

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Arrow 出力フォーマット用の圧縮方式。サポートされているコーデック: lz4_frame、zstd、none（圧縮なし）

## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 型カラムに対して、Binary 型の代わりに Arrow の FIXED_SIZE_BINARY 型を使用します。

## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

LowCardinality 型を Dictionary Arrow 型として出力するようにします

## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String 型カラムには Binary ではなく Arrow String 型を使用します

## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow 形式における Dictionary の索引には常に 64 ビット整数を使用する

## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 形式では Dictionary の索引に符号付き整数を使用する

## output_format_avro_codec {#output_format_avro_codec}   

出力時に使用する圧縮コーデック。設定可能な値: 'null'、'deflate'、'snappy'、'zstd'。

## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}   

<SettingsInfoBlock type="UInt64" default_value="1" />

（ストレージが許容する場合の）ファイルあたりの最大行数

## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}   

Avro 形式の場合: AVRO の string 型として扱う String カラムを選択するための正規表現。

## output_format_avro_sync_interval {#output_format_avro_sync_interval}   

<SettingsInfoBlock type="UInt64" default_value="16384" />

同期の間隔（バイト単位）。

## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 出力形式において、型名ではなくデータ型をバイナリ形式で出力します

## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinary 出力フォーマットで、[JSON](../../sql-reference/data-types/newjson.md) データ型の値を JSON 形式の [String](../../sql-reference/data-types/string.md) 値として書き出します。

## output_format_bson_string_as_string {#output_format_bson_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

String カラムに対しては、Binary ではなく BSON の String 型を使用します。

## output_format_compression_level {#output_format_compression_level}   

<SettingsInfoBlock type="UInt64" default_value="3" />

クエリ出力が圧縮される場合のデフォルトの圧縮レベルです。`SELECT` クエリに `INTO OUTFILE` が指定されている場合、またはテーブル関数 `file`、`url`、`hdfs`、`s3`、`azureBlobStorage` に書き込む場合に、この設定が適用されます。

可能な値: `1` から `22`

## output_format_compression_zstd_window_log {#output_format_compression_zstd_window_log}   

<SettingsInfoBlock type="UInt64" default_value="0" />

出力時の圧縮メソッドが `zstd` の場合に使用できます。`0` より大きい値を指定すると、この設定によって圧縮ウィンドウサイズ（`2` のべき乗）を明示的に指定し、zstd 圧縮の long-range モードを有効にします。これにより、より高い圧縮率を達成できる可能性があります。

指定可能な値: 0 以上の非負整数。値が小さすぎる、または大きすぎる場合は、`zstdlib` によって例外がスローされます。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）の範囲です。

## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、CSV 形式の行末は \\n ではなく \\r\\n になります。

## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、CSV 形式の Tuple は個別のカラムとしてシリアライズされます（つまり、Tuple 内のネスト構造は失われます）。

## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}   

<SettingsInfoBlock type="Bool" default_value="0" />

Decimal 型の値を出力する際に、末尾のゼロも出力します。例えば、1.23 ではなく 1.230000 を出力します。

デフォルトでは無効です。

## output&#95;format&#95;json&#95;array&#95;of&#95;rows {#output&#95;format&#95;json&#95;array&#95;of&#95;rows}

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットですべての行を 1 つの JSON 配列として出力できます。

設定可能な値:

* 1 — ClickHouse はすべての行を 1 つの配列として出力し、各行は `JSONEachRow` フォーマットになります。
* 0 — ClickHouse は各行を個別に `JSONEachRow` フォーマットで出力します。

**設定を有効にしたクエリの例**

クエリ:

```sql
SET output_format_json_array_of_rows = 1;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

結果：

```text
[
{"number":"0"},
{"number":"1"},
{"number":"2"}
]
```

**設定を無効にした場合のクエリの例**

クエリ:

```sql
SET output_format_json_array_of_rows = 0;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

結果：

```text
{"number":"0"}
{"number":"1"}
{"number":"2"}
```


## output_format_json_escape_forward_slashes {#output_format_json_escape_forward_slashes}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 出力形式において、文字列出力中のスラッシュ `/` をエスケープするかどうかを制御します。これは JavaScript との互換性を目的としています。常にエスケープされるバックスラッシュ `\` と混同しないでください。

デフォルトで有効です。

## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

map 型カラムをタプルの JSON 配列としてシリアライズします。

デフォルトでは無効です。

## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプル型のカラムを JSON オブジェクトとしてシリアライズします。

デフォルトで有効です。

## output&#95;format&#95;json&#95;pretty&#95;print {#output&#95;format&#95;json&#95;pretty&#95;print}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、JSON 形式で出力する際に、`data` 配列内で Tuple、Map、Array などのネストされた構造がどのように表示されるかを決定します。

たとえば、次のような出力ではなく、

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

出力は次のように整形されます：

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

<SettingsInfoBlock type="Bool" default_value="0" />

64 ビット [float](../../sql-reference/data-types/float.md) 型の値が JSON* 形式で出力される際に、値をクオートするかどうかを制御します。

デフォルトでは無効です。

## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}   

<SettingsInfoBlock type="Bool" default_value="0" />

64 ビット以上の[整数](../../sql-reference/data-types/int-uint.md)（`UInt64` や `Int128` など）が [JSON](/interfaces/formats/JSON) 形式で出力される際に、引用符で囲むかどうかを制御します。
このような整数はデフォルトで引用符で囲まれます。この動作は多くの JavaScript 実装と互換性があります。

設定可能な値:

- 0 — 整数を引用符なしで出力します。
- 1 — 整数を引用符で囲んで出力します。

## output_format_json_quote_decimals {#output_format_json_quote_decimals}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットにおける Decimal 型の値のクォートを制御します。

デフォルトでは無効です。

## output&#95;format&#95;json&#95;quote&#95;denormals {#output&#95;format&#95;json&#95;quote&#95;denormals}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](/interfaces/formats/JSON) 出力フォーマットで `+nan`、`-nan`、`+inf`、`-inf` の出力を有効にします。

可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

次のようなテーブル `account_orders` を考えます:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

`output_format_json_quote_denormals = 0` の場合、クエリの出力では `null` 値が返されます。

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

`output_format_json_quote_denormals = 1` の場合、クエリの結果は次のようになります。

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

named tuple カラムを JSON オブジェクトとしてシリアライズする際に、値が null のキーと値のペアをスキップします。これは、output_format_json_named_tuples_as_objects が true の場合にのみ有効です。

## output_format_json_validate_utf8 {#output_format_json_validate_utf8}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットでの UTF-8 シーケンスの検証を制御します。JSON/JSONCompact/JSONColumnsWithMetadata 形式には影響せず、これらでは常に UTF-8 検証が行われます。

デフォルトでは無効です。

## output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters {#output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、Markdown 内の特殊文字をエスケープします。

[Common Mark](https://spec.commonmark.org/0.30/#example-12) では、次の特殊文字がエスケープできる文字として定義されています。

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Possible values:

* 0 — 無効
* 1 — 有効


## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}   

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

MsgPack 形式における UUID の出力表現を指定します。

## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Native 出力形式で、型名ではなくデータ型をバイナリ形式で出力します

## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}   

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) カラムと [Dynamic](../../sql-reference/data-types/dynamic.md) カラムのデータを、フラット化された形式（すべての型やパスを個別のサブカラムとして扱う形式）で書き出します。

## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) カラムのデータを、デフォルトのネイティブな JSON シリアル化ではなく、JSON 文字列を格納した [String](../../sql-reference/data-types/string.md) カラムとして書き込みます。

## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}   

<SettingsInfoBlock type="UInt64" default_value="262144" />

ORC 形式の出力における圧縮ブロックのサイズ（バイト単位）。

## output_format_orc_compression_method {#output_format_orc_compression_method}   

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

ORC 形式の出力に使用する圧縮方式。サポートされているコーデック: lz4、snappy、zlib、zstd、none（非圧縮）

## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}   

<SettingsInfoBlock type="Double" default_value="0" />

ORC出力フォーマットにおける文字列カラムについて、非NULL行の総数に対する異なる値の数の割合がこの値を超える場合は、辞書エンコーディングを無効にします。それ以外の場合は辞書エンコーディングを有効にします。

## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 出力フォーマットにおける行インデックスストライドの目標値。

## output_format_orc_string_as_string {#output_format_orc_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String カラムに対しては Binary ではなく ORC の String 型を使用します

## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC writer が使用するタイムゾーン名です。デフォルトは GMT です。

## output_format_parallel_formatting {#output_format_parallel_formatting}   

<SettingsInfoBlock type="Bool" default_value="1" />

データ形式のフォーマット処理を並列実行するかどうかを制御します。[TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) の各フォーマットでのみサポートされます。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## output_format_parquet_batch_size {#output_format_parquet_batch_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

この行数ごとにページサイズを確認します。平均サイズが数 KB を超えるカラムがある場合は、この値を小さくすることを検討してください。

## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}   

<SettingsInfoBlock type="Double" default_value="10.5" />

Parquet の Bloom filter において、各ユニーク値に対して使用するビット数のおおよその値です。推定される偽陽性率は次のとおりです：

*  6   bits - 10%
  * 10.5 bits -  1%
  * 16.9 bits -  0.1%
  * 26.4 bits -  0.01%
  * 41   bits -  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}   

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Parquet ファイル内の Bloom フィルタをどこに配置するかを指定します。Bloom フィルタはおおよそこのサイズのグループ単位で書き込まれます。具体的には:

* 0 の場合、各行グループの Bloom フィルタは、その行グループの直後に書き込まれます。
  * すべての Bloom フィルタの合計サイズより大きい場合、すべての行グループの Bloom フィルタをメモリ上で集約し、ファイルの終端付近にまとめて書き込みます。
  * それ以外の場合、Bloom フィルタはメモリ上で集約され、その合計サイズがこの値を超えたタイミングで書き込まれます。

## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

parquet ファイルのスキーマにおいて、リスト要素には 'item' ではなく 'element' という名前を用います。これは Arrow ライブラリ実装に由来する歴史的な仕様です。一般的には互換性が向上しますが、一部の古いバージョンの Arrow では互換性が損なわれる場合があります。

## output_format_parquet_compression_method {#output_format_parquet_compression_method}   

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Parquet 出力形式の圧縮方式。サポートされる圧縮コーデック: snappy, lz4, brotli, zstd, gzip, none（非圧縮）

## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

圧縮前のページサイズ（バイト単位）。

## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}   

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` の値を、32 ビットの Parquet `DATE` 型（読み取り時は `Date32`）に変換する代わりに、プレーンな 16 ビット整数（読み取り時は `UInt16`）として書き込みます。

## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}   

<SettingsInfoBlock type="Bool" default_value="0" />

DateTime の値を、ミリ秒に変換して書き込む（読み込み時は DateTime64(3)）のではなく、生の unix タイムスタンプ（読み込み時は UInt32）として書き込みます。

## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

enum を、Parquet の物理型 BYTE_ARRAY および論理型 ENUM として書き出します。

## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 型カラムに対して、Binary ではなく Parquet の FIXED_LEN_BYTE_ARRAY 型を使用します。

## output_format_parquet_geometadata {#output_format_parquet_geometadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

geo カラムに関する情報を Parquet メタデータに書き込み、これらのカラムを WKB 形式でエンコードできるようにします。

## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Dictionary のサイズがこのバイト数を超えた場合、Dictionary を使用しないエンコーディングに切り替えます。Dictionary エンコーディングを無効にするには 0 を設定します。

## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet データのエンコードを複数スレッドで実行します。`output_format_parquet_use_custom_encoder` が必要です。

## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

行数単位でのターゲット行グループサイズ。

## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="536870912" />

圧縮前の行グループの目標サイズ（バイト単位）。

## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String型カラムに対して、Parquet の Binary 型ではなく String 型を使用します。

## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

より高速な Parquet エンコーダ実装を使用します。

## output_format_parquet_version {#output_format_parquet_version}   

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

出力フォーマットで使用する Parquet のバージョン。サポートされているバージョンは 1.0、2.4、2.6、および 2.latest（デフォルト）です。

## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルに Bloom フィルターを書き込みます。output_format_parquet_use_custom_encoder = true が必要です。

## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ページヘッダーに CRC32 チェックサムを書き込みます。

## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルに、カラムインデックスおよびオフセットインデックス（つまり、読み取り時のフィルタープッシュダウンに使用できる各データページに関する統計情報）を書き込みます。

## output_format_pretty_color {#output_format_pretty_color}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty フォーマットで ANSI エスケープシーケンスを使用します。0 - 無効、1 - 有効、'auto' - 端末上で実行されている場合に有効。

## output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names {#output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names}

<SettingsInfoBlock type="UInt64" default_value="1" />

テーブルの行数が多い場合に、フッターにカラム名を表示します。

設定可能な値:

* 0 — フッターにカラム名を表示しません。
* 1 — 行数が [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) で設定されたしきい値以上の場合、フッターにカラム名を表示します（デフォルトは 50）。

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

<SettingsInfoBlock type="UInt64" default_value="50" />

[output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) 設定が有効な場合に、フッターにカラム名を表示するための最低行数を指定します。

## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、テーブルの列数が多く行数が少ない場合、Pretty 形式は Vertical 形式と同様の形式で出力されます。
この動作を詳細に調整するには、`output_format_pretty_fallback_to_vertical_max_rows_per_chunk` および `output_format_pretty_fallback_to_vertical_min_table_width` を参照してください。

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}   

<SettingsInfoBlock type="UInt64" default_value="10" />

`output_format_pretty_fallback_to_vertical`（参照）による Vertical フォーマットへのフォールバックは、chunk 内のレコード数が指定した値以下の場合にのみ有効になります。

## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}   

<SettingsInfoBlock type="UInt64" default_value="5" />

Vertical 形式へのフォールバック（`output_format_pretty_fallback_to_vertical` を参照）は、カラム数が指定した値を超える場合にのみ有効になります。

## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

フォールバック先の Vertical フォーマット（`output_format_pretty_fallback_to_vertical` を参照）は、テーブル内のカラム長の合計がこの設定値以上である場合、または少なくとも 1 つの値に改行文字が含まれている場合にのみ有効になります。

## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty 形式でレンダリングされるデータが複数の chunk に分かれて到着し、遅延があった場合でも、次の chunk のカラム幅が前の chunk と同じであれば、ANSI エスケープシーケンスを使用してカーソルを前の行に戻し、前の chunk のフッターを書き換えて、新しい chunk のデータでその続きとして出力します。これにより、結果がより視覚的に見やすくなります。

0 - 無効、1 - 有効、'auto' - 端末の場合に有効。

## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}   

<SettingsInfoBlock type="String" default_value="UTF-8" />

グリッドの枠線を出力する際に使用する文字セットです。利用可能な文字セットは ASCII と UTF-8（デフォルト）です。

## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効で、出力先がターミナルの場合、数千・数百万などの桁区切りに対応する各数字を下線で強調表示します。

## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

この設定が有効で、出力先がターミナルの場合、行末の空白を灰色の下線付きで強調表示します。

## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}   

<SettingsInfoBlock type="UInt64" default_value="24" />

カラム名が長すぎる場合、この長さまで切り詰めます。
カラム名の長さが、`output_format_pretty_max_column_name_width_cut_to` に `output_format_pretty_max_column_name_width_min_chars_to_cut` を加えた値より長い場合に切り詰められます。

## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}   

<SettingsInfoBlock type="UInt64" default_value="4" />

カラム名が長すぎる場合に切り詰める最小文字数。  
`output_format_pretty_max_column_name_width_cut_to` に `output_format_pretty_max_column_name_width_min_chars_to_cut` を加えた長さより長いカラム名は切り詰められます。

## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Pretty フォーマットで、カラム内のすべての値をパディングする際の最大幅を指定します。

## output_format_pretty_max_rows {#output_format_pretty_max_rows}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Pretty 形式の出力で表示される行数の上限。

## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Pretty 形式で表示する値の最大幅。これを超えた部分は切り詰められます。
値 0 は切り詰めないことを意味します。

## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}   

<SettingsInfoBlock type="UInt64" default_value="0" />

ブロック内に複数の値がある場合にのみ、値を切り詰めます（`output_format_pretty_max_value_width` 設定を参照）。単一の値しかない場合は、その値を完全に出力します。これは `SHOW CREATE TABLE` クエリで有用です。

## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、Pretty フォーマットは複数行のフィールドをテーブルセル内に整形して表示し、テーブルの枠組みが保持されます。
無効にすると、それらはそのまま表示されるためテーブルのレイアウトが崩れる可能性がありますが、その代わり複数行の値をコピー＆ペーストしやすくなるという利点があります。

## output_format_pretty_named_tuples_as_json {#output_format_pretty_named_tuples_as_json}

<SettingsInfoBlock type="Bool" default_value="1" />

Pretty フォーマット内の名前付きタプルを整形済みの JSON オブジェクトとして出力するかどうかを制御します。

## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Pretty 出力形式で、各行の前に行番号を追加します

## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

ブロックが 0 を除くこの値を超える単一の数値だけで構成されている場合、テーブルの右側にその数値を読みやすい形式にしたヒントを表示します。

## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}   

<SettingsInfoBlock type="UInt64" default_value="50" />

次のブロックを指定されたミリ秒数まで待ち、それを直前のブロックにまとめてから書き込みます。
これにより、小さすぎるブロックが頻繁に出力されることを防ぎつつ、データをストリーミング的に表示できます。

## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

前回の出力から指定したミリ秒数を超えて経過した場合、保留中のブロックを Pretty 系フォーマットで出力します。

## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Google wrappers を使用して Nullable カラムをシリアライズする場合、デフォルト値は空の wrapper としてシリアライズされます。オフにすると、デフォルト値と NULL 値はシリアライズされません

## output_format_schema {#output_format_schema}   

自動生成されたスキーマが [Cap'n Proto](/interfaces/formats/CapnProto) または [Protobuf](/interfaces/formats/Protobuf) 形式で保存されるファイルへのパス。

## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

INSERT クエリにカラム名を含める

## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}   

<SettingsInfoBlock type="UInt64" default_value="65409" />

1 回の INSERT ステートメントで挿入できる最大行数。

## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

カラム名をバッククオート（`）で囲みます

## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}   

<SettingsInfoBlock type="String" default_value="table" />

出力される INSERT クエリで使用されるテーブル名

## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}   

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT 文の代わりに REPLACE 文を使用する

## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、TSV 形式の行末が \\n ではなく \\r\\n になります。

## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}   

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は ' を '' でエスケープし、それ以外の場合は \\' で引用します

## output_format_write_statistics {#output_format_write_statistics}   

<SettingsInfoBlock type="Bool" default_value="1" />

読み取った行数、バイト数、経過時間に関する統計を、適切な出力フォーマットで出力します。

既定で有効です

## precise_float_parsing {#precise_float_parsing}   

<SettingsInfoBlock type="Bool" default_value="0" />

より高精度（だが低速）の浮動小数点数パースアルゴリズムを優先的に使用します

## schema&#95;inference&#95;hints {#schema&#95;inference&#95;hints}

スキーマを持たないフォーマットのスキーマ推論で、ヒントとして使用するカラム名とデータ型のリスト。

例:

クエリ:

```sql
desc format(JSONEachRow, '{"x" : 1, "y" : "String", "z" : "0.0.0.0" }') settings schema_inference_hints='x UInt8, z IPv4';
```

結果：

```sql
x   UInt8
y   Nullable(String)
z   IPv4
```

:::note
`schema_inference_hints` が正しくフォーマットされていない場合、あるいはタイプミスや誤ったデータ型などが含まれている場合、`schema_inference_hints` 全体の設定が無視されます。
:::


## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}   

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

スキーマ推論において推論された型を `Nullable` にするかどうかを制御します。
取り得る値：

* 0 - 推論された型は決して `Nullable` になりません（この場合の null 値の扱いは input_format_null_as_default で制御します）。
 * 1 - すべての推論された型が `Nullable` になります。
 * 2 または `auto` - スキーマ推論の途中で解析されるサンプルでそのカラムに `NULL` が含まれている場合、またはファイルメタデータにカラムの Null 許容性に関する情報が含まれている場合にのみ、推論された型は `Nullable` になります。
 * 3 - フォーマットがファイルメタデータとして Null 許容性情報を持つ場合（例: Parquet）は、推論された型の Null 許容性はそのメタデータと一致し、それ以外の場合（例: CSV）は常に `Nullable` になります。

## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}   

<SettingsInfoBlock type="Bool" default_value="0" />

スキーマ推論時に、推論された JSON 型を `Nullable` にするかどうかを制御します。
この設定を schema_inference_make_columns_nullable と併せて有効にすると、推論された JSON 型は `Nullable` になります。

## schema_inference_mode {#schema_inference_mode}   

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

スキーマ推論モード。`default` — すべてのファイルが同じスキーマを持つと見なして、任意のファイルからスキーマを推論する。`union` — ファイルごとに異なるスキーマを持つ可能性があり、最終的なスキーマはすべてのファイルのスキーマの和集合になる。

## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}   

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

SHOW CREATE クエリにおける識別子の引用ルールを設定します

## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}   

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

SHOW CREATE クエリで使用する識別子のクオートスタイルを設定します

## type_json_allow_duplicated_key_with_literal_and_nested_object {#type_json_allow_duplicated_key_with_literal_and_nested_object}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、`{"a" : 42, "a" : {"b" : 42}}` のように、同じキーが重複しており、そのうち一方がネストされたオブジェクトであるような JSON も解析できるようになります。

## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON オブジェクトを JSON 型にパースする際に、重複したパスは無視され、例外が発生するのではなく最初のものだけが挿入されます。

## type_json_skip_invalid_typed_paths {#type_json_skip_invalid_typed_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、型付きパスを持つ JSON 型カラム内で、宣言された型に強制変換できない値を持つフィールドはエラーをスローせずにスキップされます。スキップされたフィールドは存在しないものとして扱われ、型付きパスの定義に基づいてデフォルト値または NULL 値が使用されます。

この設定は、特定のパスに型が宣言されている JSON 型カラム（例: JSON(a Int64, b String)）にのみ適用されます。通常の型付きカラムへ挿入する際の JSONEachRow などの通常の JSON 入力フォーマットには適用されません。

可能な値:

+ 0 — 無効（型の不一致があるとエラーをスローする）。
+ 1 — 有効（型の不一致があるフィールドをスキップする）。

## type_json_use_partial_match_to_skip_paths_by_regexp {#type_json_use_partial_match_to_skip_paths_by_regexp}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、JSON オブジェクトを JSON 型としてパースする際に、SKIP REGEXP で指定した正規表現は、パスをスキップするために部分一致でのマッチを行います。無効にすると、完全一致でのマッチが必要になります。

## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

Array/Map/Tuple などのネストされた型内での実験的な型および疑わしい型の使用を検証します