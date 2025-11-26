---
title: 'フォーマット設定'
sidebar_label: 'フォーマット設定'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: '入力および出力フォーマットを制御する設定。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自動生成 */ }

これらの設定は、[ソースコード](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h) から自動生成されています。


## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}   

<SettingsInfoBlock type="Bool" default_value="0" />

Variant 型内の Bool 値について、"on"、"off"、"enable"、"disable" などの特殊なテキスト表現も Bool 値として解釈できるようにします。



## bool_false_representation {#bool_false_representation}   

<SettingsInfoBlock type="String" default_value="false" />

TSV/CSV/Vertical/Pretty 形式で bool 型の false を表現するための文字列。



## bool_true_representation {#bool_true_representation}   

<SettingsInfoBlock type="String" default_value="true" />

TSV/CSV/Vertical/Pretty 形式での `true` ブール値の表現に使用する文字列。



## column_names_for_schema_inference {#column_names_for_schema_inference}   



列名を含まないフォーマットに対して、スキーマ推論で使用する列名の一覧を指定します。形式: 'column1,column2,column3,...'



## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}   

<SettingsInfoBlock type="UInt64" default_value="1" />

WHERE 句に結合条件が含まれている場合、カンマ結合 / クロス結合を inner join に書き換えて使用します。値: 0 - 書き換えなし、1 - 可能であればカンマ結合 / クロス結合に適用、2 - すべてのカンマ結合を強制的に書き換え、cross - 可能であればクロス結合を書き換え



## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}   

<SettingsInfoBlock type="Bool" default_value="0" />

datetime64 の値の末尾のゼロを動的に切り詰めて、出力スケールを [0, 3, 6] に調整します。
それぞれ 'seconds'、'milliseconds'、'microseconds' に対応します。



## date_time_input_format {#date_time_input_format}   

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

日時のテキスト表現を解析するパーサーを選択できます。

この設定は[日時関数](../../sql-reference/functions/date-time-functions.md)には適用されません。

設定可能な値:

- `'best_effort'` — 拡張された解析を有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` と、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日時形式を解析できます。例えば、`'2018-06-08T01:02:03.000Z'` です。

- `'best_effort_us'` — `best_effort` と同様です（[parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus) との違いを参照）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみを解析できます。例えば、`2019-08-20 10:18:56` や `2019-08-20` です。

Cloud でのデフォルト値: `'best_effort'`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)



## date_time_output_format {#date_time_output_format}   

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

日付と時刻のテキスト表現による出力フォーマットを選択できます。

指定可能な値:

- `simple` - シンプルな出力フォーマット。

    ClickHouse が日付と時刻を `YYYY-MM-DD hh:mm:ss` 形式で出力します。例えば `2019-08-20 10:18:56`。計算はデータ型に設定されたタイムゾーン（存在する場合）またはサーバーのタイムゾーンに従って行われます。

- `iso` - ISO 出力フォーマット。

    ClickHouse が日付と時刻を [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) の `YYYY-MM-DDThh:mm:ssZ` 形式で出力します。例えば `2019-08-20T10:18:56Z`。出力は UTC である点に注意してください（`Z` は UTC を意味します）。

- `unix_timestamp` - Unix タイムスタンプ出力フォーマット。

    ClickHouse が日付と時刻を [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) 形式で出力します。例えば `1566285536`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)



## date_time_overflow_behavior {#date_time_overflow_behavior}   

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md) または整数を Date、Date32、DateTime、DateTime64 に変換する際に、その値が結果の型で表現できない場合の動作を定義します。

指定可能な値:

- `ignore` — オーバーフローを黙って無視します。結果は未定義です。
- `throw` — オーバーフローが発生した場合に例外をスローします。
- `saturate` — 結果を飽和させます。値が対象の型で表現可能な最小値より小さい場合、結果は表現可能な最小値になります。値が対象の型で表現可能な最大値より大きい場合、結果は表現可能な最大値になります。

デフォルト値: `ignore`.



## dictionary_use_async_executor {#dictionary_use_async_executor}   

<SettingsInfoBlock type="Bool" default_value="0" />

辞書ソースの読み取りパイプラインを複数スレッドで実行します。ローカルの ClickHouse ソースを持つ辞書でのみサポートされます。



## errors_output_format {#errors_output_format}   

<SettingsInfoBlock type="String" default_value="CSV" />

Errors をテキスト出力として書き出す方式。



## exact_rows_before_limit {#exact_rows_before_limit}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ClickHouse は `rows_before_limit_at_least` 統計値に対して正確な値を返しますが、その代わりに `LIMIT` より前のデータを完全に読み込む必要があります。



## format_avro_schema_registry_url {#format_avro_schema_registry_url}   



AvroConfluent 形式向けの Confluent Schema Registry の URL。



## format_binary_max_array_size {#format_binary_max_array_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 形式における Array の許可される最大サイズです。破損したデータにより大量のメモリが割り当てられることを防ぎます。0 は上限がないことを意味します。



## format_binary_max_string_size {#format_binary_max_string_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 形式における String の許可される最大サイズです。破損したデータにより大量のメモリが割り当てられることを防ぎます。0 を指定すると上限はありません。



## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}   

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

ClickHouse の Enum 型と CapnProto の Enum 型の対応付け方法



## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema が設定されていない場合は、自動生成された CapnProto スキーマを使用する



## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、二重引用符で囲まれた文字列を許可します。



## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、文字列を単一引用符（シングルクォート）で囲んで指定できるようになります。



## format_csv_delimiter {#format_csv_delimiter}   

<SettingsInfoBlock type="Char" default_value="," />

CSV データ内で区切り文字として使用される文字です。文字列で設定する場合、その文字列の長さは 1 である必要があります。



## format_csv_null_representation {#format_csv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

CSV 形式における NULL の独自表現



## format_custom_escaping_rule {#format_custom_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

フィールドのエスケープ規則（CustomSeparated 形式用）



## format_custom_field_delimiter {#format_custom_field_delimiter}   

<SettingsInfoBlock type="String" default_value="	" />

フィールド間の区切り文字（CustomSeparated 形式用）



## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}   



結果セットの後ろに付与するサフィックス（CustomSeparated 形式用）



## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}   



結果セットの前に付加される接頭辞（CustomSeparated 形式用）



## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

最後の列のフィールドの後ろに付加される区切り文字（`CustomSeparated` 形式用）



## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}   



先頭列のフィールドの前に置かれる区切り文字（CustomSeparated 形式用）



## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}   



行間の区切り文字（CustomSeparated 形式用）



## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}   

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを制御します。

シークレットを表示したいユーザーは、
[`display_secrets_in_show_and_select` server setting](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
を有効にし、さらに
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を持っている必要があります。

設定可能な値:

-   0 — 無効。
-   1 — 有効。



## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}   



[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) フォーマットでオブジェクト名を格納および書き込むために使用される列の名前です。
列の型は String 型である必要があります。値が空の場合、オブジェクト名としてデフォルト名 `row_{i}` が使用されます。



## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema が設定されていない場合に自動生成された Protobuf を使用します



## format_regexp {#format_regexp}   



正規表現（Regexp 形式）



## format_regexp_escaping_rule {#format_regexp_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

フィールドのエスケープルール（Regexp フォーマット用）



## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}   

<SettingsInfoBlock type="Bool" default_value="0" />

正規表現に一致しない行をスキップします（Regexp フォーマット用）



## format_schema {#format_schema}   



このパラメータは、[Cap'n Proto](https://capnproto.org/) や [Protobuf](https://developers.google.com/protocol-buffers/) のような、スキーマ定義を必要とするフォーマットを使用する場合に利用します。パラメータ値はフォーマットによって異なります。



## format_schema_message_name {#format_schema_message_name}   



`format_schema` で定義されたスキーマ内で、対象となるメッセージの名前を定義します。
旧来の `format_schema` 形式（`file_name:message_name`）との互換性を維持するため、次のルールが適用されます：
- `format_schema_message_name` が指定されていない場合、メッセージ名は旧来の `format_schema` の値の `message_name` 部分から自動的に決定されます。
- 旧来の形式を使用しているときに `format_schema_message_name` が指定されている場合は、エラーが発生します。



## format_schema_source {#format_schema_source}   

<SettingsInfoBlock type="String" default_value="file" />

`format_schema` のソースを定義します。
指定可能な値は次のとおりです:
- 'file' (デフォルト): `format_schema` は `format_schemas` ディレクトリ内にあるスキーマファイルの名前です。
- 'string': `format_schema` はスキーマのリテラルな内容です。
- 'query': `format_schema` はスキーマを取得するためのクエリです。
`format_schema_source` が 'query' に設定されている場合、次の条件が適用されます:
- クエリは必ずちょうど 1 つの値を返す必要があります。つまり、1 行かつ 1 つの文字列カラムのみを返します。
- クエリの結果はスキーマの内容として扱われます。
- この結果はローカルで `format_schemas` ディレクトリにキャッシュされます。
- ローカルキャッシュは `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files` コマンドでクリアできます。
- 一度キャッシュされると、キャッシュが明示的にクリアされるまで、同一クエリはスキーマ取得のために再実行されません。
- ローカルキャッシュファイルに加えて、Protobuf メッセージもメモリ内にキャッシュされます。ローカルキャッシュファイルをクリアした後でも、スキーマを完全にリフレッシュするには `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` を使用してメモリ内キャッシュもクリアする必要があります。
- クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` を実行すると、キャッシュファイルと Protobuf メッセージのスキーマの両方のキャッシュを一度にクリアできます。



## format_template_resultset {#format_template_resultset}   



結果セット用のフォーマット文字列を含むファイルのパス（Template フォーマット用）



## format_template_resultset_format {#format_template_resultset_format}   



結果セットのフォーマット文字列（Template 形式）



## format_template_row {#format_template_row}   



行ごとのフォーマット文字列が記述されたファイルへのパス（Template 形式用）



## format_template_row_format {#format_template_row_format}   



Template フォーマット用の行フォーマット文字列



## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

行間の区切り文字（Template フォーマット用）



## format_tsv_null_representation {#format_tsv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

TSV 形式での NULL 表現のカスタマイズ



## input_format_allow_errors_num {#input_format_allow_errors_num}   

<SettingsInfoBlock type="UInt64" default_value="0" />

テキスト形式（CSV、TSV など）から読み込む際に許容されるエラー数の上限を設定します。

デフォルト値は0です。

必ず `input_format_allow_errors_ratio` と併用してください。

行の読み取り中にエラーが発生しても、エラー数カウンタがまだ `input_format_allow_errors_num` 未満であれば、ClickHouse はその行を無視して次の行の処理に進みます。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方で上限を超えた場合、ClickHouse は例外をスローします。



## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}   

<SettingsInfoBlock type="Float" default_value="0" />

テキストフォーマット（CSV、TSV など）から読み取る際に許可されるエラーの最大割合を設定します。
エラーの割合は 0 から 1 までの浮動小数点数で指定します。

デフォルト値は 0 です。

必ず `input_format_allow_errors_num` と組み合わせて使用してください。

行の読み取り中にエラーが発生しても、エラーの割合がまだ `input_format_allow_errors_ratio` 未満であれば、ClickHouse はその行を無視して次の行の読み取りを続行します。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方を超えた場合、ClickHouse は例外を送出します。



## input_format_allow_seeks {#input_format_allow_seeks}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC/Parquet/Arrow 入力フォーマットを読み込む際に、シーク（任意位置へのアクセス）を許可します。

デフォルトで有効になっています。



## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 形式の入力を読み込む際に、欠損している列を許可する



## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow のカラムと ClickHouse のカラムを照合する際に、大文字小文字の違いを無視します。



## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow フォーマットのスキーマ推論時に、サポートされていない型を持つカラムをスキップする



## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent 形式用: スキーマ内に対応するフィールドが存在しない場合は、エラーではなくデフォルト値を使用します



## input_format_avro_null_as_default {#input_format_avro_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent フォーマットの場合: 非 Nullable 列の値が null の場合にデフォルト値を挿入します



## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 入力フォーマットで、型名ではなくデータ型をバイナリ形式で読み取ります



## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinary 入力フォーマットで、[JSON](../../sql-reference/data-types/newjson.md) データ型の値を [String](../../sql-reference/data-types/string.md) 型の JSON 文字列として読み取ります。



## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

BSON 形式のスキーマ推論時に、サポートされていない型のフィールドをスキップします。



## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

CapnProto 形式のスキーマ推論時に、サポートされていない型の列をスキップする



## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、後続がない行末の \\r が許可されます 



## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 入力で余分な列（ファイルに想定より多くの列がある場合）は無視し、CSV 入力で不足しているフィールドにはデフォルト値を使用します



## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 文字列でフィールド区切り文字としてスペースおよびタブ (\\t) の使用を許可します



## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV から Array を読み取る際に、その要素が入れ子の CSV 形式としてシリアル化され、その結果が文字列として格納されていることを想定します。例: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。配列を囲む角括弧は省略可能です。



## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、CSV 形式で書き出された個別の列を Tuple 列としてデシリアライズできます。



## input_format_csv_detect_header {#input_format_csv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 形式の名前と型情報を含むヘッダー行を自動検出します



## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 入力の空フィールドをデフォルト値として扱います。



## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で挿入された enum 値を enum インデックスとして扱います



## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

CSV 形式データの先頭から指定した行数をスキップします



## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で末尾の空行をスキップします



## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 文字列の先頭と末尾にあるスペースおよびタブ (\\t) 文字を除去します



## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論の際に ClickHouse は文字列フィールドから数値を推論しようとします。
CSV データに引用符で囲まれた UInt64 型の数値が含まれている場合に有用です。

デフォルトでは無効です。



## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}   

<SettingsInfoBlock type="Bool" default_value="1" />

入力データ内の引用符で囲まれたタプルを、String 型の値として解釈します。



## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 形式のスキーマを推論する際に、いくつかの調整およびヒューリスティック手法を用います



## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}   

<SettingsInfoBlock type="Bool" default_value="0" />

不正な値により CSV フィールドのデシリアライズが失敗した場合、その列にデフォルト値を設定できるようにします



## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 形式の入力で、ファイルに期待される列数より多い列が含まれている場合は余分な列を無視し、不足しているフィールドはデフォルト値として扱います



## input_format_custom_detect_header {#input_format_custom_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

CustomSeparated 形式で、名前および型を含むヘッダー行を自動検出します



## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 形式で末尾の空行をスキップする



## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` クエリを実行する際、省略された入力カラムの値を対応するカラムのデフォルト値で置き換えます。  
このオプションは、[JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native) フォーマットおよび `WithNames`/`WithNamesAndTypes` サフィックスを持つフォーマットに適用されます。

:::note
このオプションを有効にすると、拡張テーブルメタデータがサーバーからクライアントへ送信されます。これによりサーバー側で追加の計算リソースを消費し、パフォーマンスが低下する可能性があります。
:::

設定可能な値:

- 0 — 無効。
- 1 — 有効。



## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

省略されたフィールドを強制的に `null` 値で初期化する



## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Hive Text 入力で余分な列（ファイルに想定より多くの列がある場合）を無視し、Hive Text 入力で欠損しているフィールドにはデフォルト値を用います



## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File におけるコレクション（array または map）要素間の区切り文字



## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive TextFile 形式でのフィールド区切り文字



## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File において、マップのキー/値ペア間を区切るデリミタ。



## input_format_import_nested_json {#input_format_import_nested_json}   

<SettingsInfoBlock type="Bool" default_value="0" />

ネストされたオブジェクトを含む JSON データの挿入を有効または無効にします。

サポートされているフォーマット:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- `JSONEachRow` フォーマットでの[ネストされた構造の利用](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)。



## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

IPv4 のデシリアライズ時に変換エラーが発生した場合、例外をスローする代わりにデフォルト値を使用します。

デフォルトでは無効です。



## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

IPv6 のデシリアライズ時に変換エラーが発生した場合、例外をスローせずデフォルト値を使用します。

デフォルトでは無効です。



## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSONCompact/JSONCompactEachRow 入力フォーマットで、行ごとに可変数のカラム数を許可します。
想定より多いカラムを持つ行では余分なカラムを無視し、不足しているカラムにはデフォルト値を使用します。

デフォルトでは無効です。



## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルを解析する際、JSON オブジェクトに存在しない要素に対してデフォルト値を挿入します。
この設定は、`input_format_json_named_tuples_as_objects` 設定が有効になっている場合にのみ機能します。

デフォルトで有効です。



## input_format_json_empty_as_default {#input_format_json_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON 内の空の入力フィールドをデフォルト値で置き換えます。複雑なデフォルト値の式を使用する場合は、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

取りうる値:

+ 0 — 無効。
+ 1 — 有効。



## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルに対する JSON オブジェクト内の不明なキーを無視します。

デフォルトで有効です。



## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

不要なフィールドを無視し、それらを解析しません。これを有効にすると、無効な形式や重複したフィールドを含む JSON 文字列に対しても、例外がスローされない場合があります。



## input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論の際に ClickHouse は、異なるデータ型の値を含む JSON 配列に対して Array(Dynamic) 型を使用します。

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


## input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings

<SettingsInfoBlock type="Bool" default_value="1" />

スキーマ推論中に、データサンプル内で `Null` / `{}` / `[]` のみを含む JSON キーを String 型として扱えるようにします。
JSON 形式では任意の値を String 型として読み取ることができるため、スキーマ推論時に `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` のようなエラーが発生するのを、
型が不明なキーに String 型を使用することで回避できます。

例:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

結果：

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

デフォルトで有効になっています。


## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

マップ型の列を、タプルの JSON 配列としてデシリアライズします。

デフォルトでは無効です。



## input_format_json_max_depth {#input_format_json_max_depth}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

JSON 内のフィールド階層の最大深さ。これは厳密な制限ではなく、必ずしも厳密に適用されるわけではありません。



## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプル列を JSON オブジェクトとしてパースします。

デフォルトで有効です。



## input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力形式で、JSON 配列を文字列として解釈できるようにします。

例:

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

JSON 形式の入力で、ブール値を数値として解釈できるようにします。

デフォルトで有効です。



## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 形式の入力で、ブール値を文字列としてパースすることを許可します。

デフォルトで有効です。



## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、数値を文字列として解析することを許可します。

デフォルトで有効です。



## input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、JSON オブジェクトを文字列として解析できるようにします。

例：

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

デフォルトで有効です。


## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットにおいて、JSON 文字列に不正なエスケープシーケンスが含まれている場合に例外をスローします。無効にした場合、不正なエスケープシーケンスはデータ内にそのまま保持されます。

デフォルトで有効です。



## input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論時に ClickHouse は JSON オブジェクトから名前付き Tuple を推論しようとします。
生成される名前付き Tuple には、サンプルデータ中の対応するすべての JSON オブジェクトに含まれる全要素が含まれます。

例:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

結果：

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

デフォルトで有効になっています。


## input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論の際に ClickHouse は文字列フィールドから数値型を推測しようとします。
JSON データに引用符で囲まれた UInt64 の数値が含まれている場合に有用です。

デフォルトでは無効です。



## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}   

<SettingsInfoBlock type="Bool" default_value="0" />

名前付きタプルの推論中に JSON オブジェクト内のパスが曖昧な場合は、例外の代わりに String 型を使用する



## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

JSON/JSONCompact/JSONColumnsWithMetadata の入力形式では、この設定が 1 に設定されている場合、
入力データ内のメタデータに記載されている型と、テーブル内の対応する列の型が照合されます。

デフォルトで有効です。



## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="0" />

入力フォーマットでデータを解析する際に、バイト単位で形成されるブロックのサイズを制限します。ClickHouse 側でブロックが形成される行ベースの入力フォーマットで使用されます。
0 を指定すると、バイト数に上限がないことを意味します。



## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="33554432" />

自動スキーマ推論時に読み取るデータ量の最大値（バイト単位）。



## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="25000" />

自動スキーマ推論時に読み取るデータ行数の上限です。



## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}   

<SettingsInfoBlock type="UInt64" default_value="0" />

挿入される MsgPack データに含まれる列数。データからスキーマを自動推論する際に使用されます。



## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

MySQL ダンプ内のテーブルの列と ClickHouse テーブルの列を列名で対応付けます



## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}   



データを読み取る元となる MySQL ダンプ内のテーブル名



## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}   

<SettingsInfoBlock type="Bool" default_value="1" />

Native 入力フォーマットでデータ型の変換を許可する



## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Native 入力フォーマットで、型名ではなくデータ型をバイナリ形式で読み込みます



## input_format_null_as_default {#input_format_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、[NULL](/sql-reference/syntax#literals) フィールドのデータ型が [nullable](/sql-reference/data-types/nullable) でない場合に、それらのフィールドを[デフォルト値](/sql-reference/statements/create/table#default_values)で初期化するかどうかを制御します。
カラム型が non-nullable でこの設定が無効な場合、`NULL` を挿入すると例外が発生します。カラム型が nullable の場合、この設定に関係なく、`NULL` の値はそのまま挿入されます。

この設定は、ほとんどの入力フォーマットに適用されます。

複雑なデフォルト式を使用する場合は、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

指定可能な値:

- 0 — non-nullable カラムに `NULL` を挿入すると例外が発生します。
- 1 — `NULL` フィールドはカラムのデフォルト値で初期化されます。



## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC 入力フォーマットの読み取り時に、存在しない列を許容する



## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

ORC 列と CH 列を照合する際に大文字小文字の違いを無視します。



## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルの読み込み時に、辞書エンコードされた ORC カラムを LowCardinality カラムとして扱います。



## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルを読み取る際に、`WHERE` / `PREWHERE` 句の条件式、最小値/最大値の統計情報、または ORC メタデータ内のブルームフィルターに基づいて、ストライプ全体または行グループをスキップします。



## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 行リーダー用のタイムゾーン名です。デフォルトの ORC 行リーダーのタイムゾーンは GMT です。



## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}   

<SettingsInfoBlock type="Int64" default_value="100000" />

ORC ストライプを読み取る際のバッチサイズ。



## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

ORC 形式のスキーマ推論時にサポートされていない型の列をスキップする



## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

高速な ORC デコーダー実装を使用します。



## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}   

<SettingsInfoBlock type="Bool" default_value="1" />

`geo` 列用パーサーを使用して、`Array(UInt8)` を `Point` / `Linestring` / `Polygon` / `MultiLineString` / `MultiPolygon` 型に変換します



## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet 形式の入力を読み込む際に、欠落している列を許容する



## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、WHERE 句の条件式と Parquet メタデータ内のブルームフィルターに基づいて、行グループ全体をスキップします。



## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet の列を ClickHouse の列にマッチさせる際、列名の大文字・小文字の違いを無視します。



## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、JSON 列を ClickHouse の JSON 列として解析します。



## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet を解析する際に Row Group のプリフェッチを有効にします。現在は、単一スレッドでの解析でのみプリフェッチを行えます。



## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、Parquet メタデータ内の min/max 統計情報と WHERE/PREWHERE 式に基づいて、行グループ全体をスキップします。



## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}   

<SettingsInfoBlock type="UInt64" default_value="8192" />

Parquet 入力フォーマットで、読み飛ばしによる読み取りではなくシークを行うために、ローカルファイル読み取り時に必要な最小バイト数



## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}   

<SettingsInfoBlock type="Bool" default_value="1" />

`isAdjustedToUTC=false` の Parquet タイムスタンプに対して、スキーマ推論で使用されるデータ型を決定します。true の場合は DateTime64(..., 'UTC')、false の場合は DateTime64(...) になります。ClickHouse にはローカルのウォールクロック時刻を表すデータ型が存在しないため、どちらの挙動も完全に正しいわけではありません。直感に反しますが、「true」の方がまだ誤りが少ないと考えられます。というのも、'UTC' タイムスタンプを String としてフォーマットすると、正しいローカル時刻の表現が得られるためです。



## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Parquet リーダーにおける最大ブロックサイズ。



## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}   

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Parquet リーダー v3 用のおおよそのメモリ上限です。並列に読み取れる行グループまたは列の数を制限します。1 つのクエリで複数ファイルを読み取る場合、この上限はそれらのファイル全体でのメモリ使用量の合計に適用されます。



## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}   

<SettingsInfoBlock type="UInt64" default_value="2097152" />

メモリ使用量がこのしきい値未満の場合、プリフェッチをより積極的に行うようスケジューリングします。たとえば、小さな Bloom フィルタが多数あり、それらをネットワーク越しに読み込む必要がある場合などに有用です。



## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

カラムインデックスに含まれる最小値／最大値を利用してページをスキップします。



## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}   

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Parquet リーダーが出力するブロックの平均サイズ（バイト単位）



## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet ファイルから読み込む際に行の並び替えを行わないようにします。行の順序は一般的に保証されず、クエリパイプラインの他の部分で変更される可能性があるため、この設定の使用は推奨されません。代わりに `ORDER BY _row_number` を使用してください。



## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet 形式のスキーマ推論時に、サポートされていない型の列をスキップする



## input_format_parquet_use_native_reader {#input_format_parquet_use_native_reader}   

<SettingsInfoBlock type="Bool" default_value="0" />

ネイティブ Parquet リーダー v1 を使用します。比較的高速ですが、まだ未完成です。非推奨です。



## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet リーダー v3 を使用します。



## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

ページフィルタリングを使用しない場合の、Parquet ファイルからのページの読み取り方法に対する軽微な調整を行う設定です。



## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際にページのチェックサムを検証します。



## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

通常の非ネスト列に対して Google ラッパーを有効にします。例えば、String 列 `str` に対して google.protobuf.StringValue `str` を使用します。Nullable 列では、空のラッパーはデフォルト値として解釈され、ラッパーが存在しない場合は null として扱われます。



## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}   

<SettingsInfoBlock type="Bool" default_value="0" />

専用の列に enum 値を設定することで、protobuf の oneof フィールドのうちどれが検出されたかを示します。



## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Protobuf 形式のスキーマ推論時に、サポートされていない型を持つフィールドをスキップします



## input_format_record_errors_file_path {#input_format_record_errors_file_path}   



テキスト形式（CSV、TSV）の読み取り時に発生したエラーを記録するファイルのパス。



## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

余分なデータの挿入をスキップするかどうかを切り替えます。

データを書き込むとき、入力データに対象テーブルに存在しない列が含まれている場合、ClickHouse は例外をスローします。スキップが有効な場合、ClickHouse は余分なデータを挿入せず、例外もスローしません。

対応フォーマット:

- [JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）
- [BSONEachRow](/interfaces/formats/BSONEachRow)（およびその他の JSON フォーマット）
- [TSKV](/interfaces/formats/TSKV)
- WithNames/WithNamesAndTypes というサフィックスを持つすべてのフォーマット
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

設定可能な値:

- 0 — 無効。
- 1 — 有効。



## input_format_try_infer_dates {#input_format_try_infer_dates}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効化されている場合、ClickHouse はテキスト形式のスキーマ推論時に、文字列フィールドから `Date` 型を推測しようとします。入力データの 1 つの列に含まれるすべてのフィールドが日付として正常にパースされた場合、その結果の型は `Date` になります。少なくとも 1 つでも日付としてパースされなかったフィールドがある場合、その結果の型は `String` になります。

デフォルトで有効です。



## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、ClickHouse はテキスト形式に対するスキーマ推論時に、文字列フィールドから型 `DateTime64` を推定しようとします。入力データのある列のすべてのフィールドが日時として正常にパースされた場合、その結果の型は `DateTime64` になり、少なくとも 1 つでも日時としてパースされなかったフィールドがある場合、その結果の型は `String` になります。

デフォルトで有効です。



## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}   

<SettingsInfoBlock type="Bool" default_value="0" />

input_format_try_infer_datetimes が有効な場合、DateTime 型は推論せず、DateTime64 型のみを推論します



## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

テキスト形式でスキーマ推論を行う際に、指数表記の数値を浮動小数点数として推論することを試みます（JSON では指数表記の数値は常に浮動小数点数として推論されます）



## input_format_try_infer_integers {#input_format_try_infer_integers}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、ClickHouse はテキスト形式のスキーマ推論時に、浮動小数点数ではなく整数として解釈しようとします。入力データの列内のすべての数値が整数であれば、結果の型は `Int64` になり、少なくとも 1 つでも浮動小数点数の値が含まれていれば、結果の型は `Float64` になります。

デフォルトで有効です。



## input_format_try_infer_variants {#input_format_try_infer_variants}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、テキスト形式のスキーマ推論において、列や配列要素に対して複数の候補となる型が存在する場合に、ClickHouse は型 [`Variant`](../../sql-reference/data-types/variant.md) を推論しようとします。

設定可能な値:

- 0 — 無効。
- 1 — 有効。



## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力で余分な列（ファイルに想定より多くの列がある場合）を無視し、不足しているフィールドにはデフォルト値を使用します



## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、`file` 関数は改行に `\n` ではなく `\r\n` を用いる TSV 形式を読み取ります。



## input_format_tsv_detect_header {#input_format_tsv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 形式の列名および型を含むヘッダー行を自動検出します



## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力の空フィールドをデフォルト値として扱います。



## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で挿入された Enum の値を、Enum のインデックスとして解釈します。



## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

TSV 形式のデータの先頭から指定した行数をスキップします。



## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で末尾の空行を読み飛ばす



## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 形式のスキーマ推論に、いくつかの調整やヒューリスティック手法を用います



## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values フォーマットの場合: template を使用して式を解析および評価する際に、オーバーフローや精度の問題を避けるため、リテラルの実際の型を確認します。



## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values 形式で、フィールドがストリーミングパーサーで解析できなかった場合は、SQL パーサーを実行して SQL 式のテンプレートを推論し、そのテンプレートを使ってすべての行の解析を試みたうえで、すべての行に対して式を評価します。



## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Values 形式の場合、フィールドがストリーミングパーサーで解析できなかった場合に、SQL パーサーを実行し、そのフィールドを SQL 式として解釈しようとします。



## input_format_with_names_use_header {#input_format_with_names_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

データ挿入時に列の順序をチェックするかどうかを制御します。

入力データの列順が対象テーブルと同一であることが確実な場合は、挿入パフォーマンスを向上させるために、このチェックを無効にすることを推奨します。

サポートされるフォーマット:

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

- 0 — 無効。
- 1 — 有効。



## input_format_with_types_use_header {#input_format_with_types_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

フォーマットパーサが、入力データのデータ型が対象テーブルのデータ型と一致しているかどうかをチェックするかを制御します。

対応フォーマット:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

取りうる値:

- 0 — 無効。
- 1 — 有効。



## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}   

<SettingsInfoBlock type="Bool" default_value="0" />

分散キーが存在しない場合に、[Distributed](/engines/table-engines/special/distributed) テーブルへのランダムなシャードへの挿入を有効または無効にします。

既定では、複数のシャードを持つ `Distributed` テーブルにデータを挿入する際、分散キーが存在しない場合は ClickHouse サーバーは挿入要求を拒否します。`insert_distributed_one_random_shard = 1` の場合、挿入が許可され、データはすべてのシャードの中からランダムに選ばれたシャードへルーティングされます。

設定値:

- 0 — 複数のシャードが存在し、かつ分散キーが指定されていない場合は挿入を拒否します。
- 1 — 分散キーが指定されていない場合、利用可能なすべてのシャードの中からランダムに選ばれたシャードへ挿入します。



## interval_output_format {#interval_output_format}   

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

Interval 型の文字列表現に対する出力フォーマットを選択します。

可能な値:

-   `kusto` - KQL 形式の出力フォーマット。

    ClickHouse は interval を [KQL 形式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier) で出力します。例えば、`toIntervalDay(2)` は `2.00:00:00` という形式になります。長さが可変の interval 型（例えば `IntervalMonth` や `IntervalYear`）については、1 つの interval あたりの平均秒数が考慮されます。

-   `numeric` - 数値形式の出力フォーマット。

    ClickHouse は interval を、その内部の数値表現として出力します。例えば、`toIntervalDay(2)` は `2` という形式になります。

参照:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)



## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}   

<SettingsInfoBlock type="Bool" default_value="0" />

INTO OUTFILE を使用する際に、親ディレクトリが存在しない場合は自動的に作成します。



## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}   

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、解析時に JSON キー内のドット文字がエスケープされます。



## output_format_arrow_compression_method {#output_format_arrow_compression_method}   

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Arrow 出力フォーマットの圧縮方式。サポートされているコーデック：lz4_frame、zstd、none（非圧縮）



## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 型の列に対して、Binary 型の代わりに Arrow の FIXED_SIZE_BINARY 型を使用します。



## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、LowCardinality 型を Dictionary Arrow 型として出力します



## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String 型の列に対して Binary ではなく Arrow の String 型を使用する。



## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow 形式では、辞書インデックスに常に 64 ビット整数を使用します



## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 形式で辞書インデックスに符号付き整数を使用します



## output_format_avro_codec {#output_format_avro_codec}   



出力に使用される圧縮コーデックです。指定可能な値は `'null'`, `'deflate'`, `'snappy'`, `'zstd'` です。



## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}   

<SettingsInfoBlock type="UInt64" default_value="1" />

ストレージが許容する場合の1ファイルあたりの最大行数



## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}   



Avro 形式で、AVRO の string として扱う `String` 列を選択するための正規表現。



## output_format_avro_sync_interval {#output_format_avro_sync_interval}   

<SettingsInfoBlock type="UInt64" default_value="16384" />

同期間隔（バイト単位）。



## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 出力形式で、型名ではなくデータ型をバイナリ形式で出力します



## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinary 出力形式では、[JSON](../../sql-reference/data-types/newjson.md) データ型の値を JSON 文字列（[String](../../sql-reference/data-types/string.md) 型）として書き出します。



## output_format_bson_string_as_string {#output_format_bson_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

String カラムには Binary 型ではなく BSON の String 型を使用します。



## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、CSV 形式の改行コードが \\n ではなく \\r\\n になります。



## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、CSV 形式のタプルは別々の列としてシリアライズされます（つまり、タプル内での入れ子構造は失われます）。



## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}   

<SettingsInfoBlock type="Bool" default_value="0" />

Decimal 値を出力する際に、小数点以下の末尾のゼロも出力します。例: 1.23 ではなく 1.230000。

デフォルトでは無効です。



## output&#95;format&#95;json&#95;array&#95;of&#95;rows

<SettingsInfoBlock type="Bool" default_value="0" />

[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットで、すべての行を JSON 配列として出力できるようにする設定です。

設定可能な値:

* 1 — ClickHouse は、すべての行を配列として出力し、それぞれの行は `JSONEachRow` フォーマットになります。
* 0 — ClickHouse は、各行を個別に `JSONEachRow` フォーマットで出力します。

**この設定を有効にしたクエリの例**

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

**設定を無効にした場合のクエリ例**

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

JSON 出力形式での文字列出力におけるスラッシュ `/` のエスケープ有無を制御します。これは JavaScript との互換性を目的としています。常にエスケープされるバックスラッシュ `\` と混同しないでください。

デフォルトで有効です。



## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

`Map` 型カラムを、タプルの配列からなる JSON 配列としてシリアライズします。

デフォルトでは無効です。



## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルの列を JSON オブジェクトとしてシリアライズします。

デフォルトで有効です。



## output&#95;format&#95;json&#95;pretty&#95;print

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、JSON 出力形式を使用する際に、`data` 配列内で Tuple、Map、Array などのネストされた構造をどのように表示するかを制御します。

たとえば、次のような出力ではなく:

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

デフォルトで有効になっています。


## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSON* 形式での出力時に、64 ビット [floats](../../sql-reference/data-types/float.md) をクオートするかどうかを制御します。

デフォルトでは無効です。



## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}   

<SettingsInfoBlock type="Bool" default_value="0" />

[整数](../../sql-reference/data-types/int-uint.md)（`UInt64` や `Int128` など）のうち、64 ビット以上のものを [JSON](/interfaces/formats/JSON) 形式で出力する際に、引用符で囲むかどうかを制御します。
このような整数は、デフォルトでは引用符で囲んで出力されます。この動作は、ほとんどの JavaScript 実装と互換性があります。

指定可能な値:

- 0 — 整数を引用符なしで出力します。
- 1 — 整数を引用符で囲んで出力します。



## output_format_json_quote_decimals {#output_format_json_quote_decimals}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットにおける decimal 型値のクオート有無を制御します。

デフォルトでは無効です。



## output&#95;format&#95;json&#95;quote&#95;denormals

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](/interfaces/formats/JSON) 出力形式で `+nan`、`-nan`、`+inf`、`-inf` の出力を有効化します。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

次のテーブル `account_orders` があるとします。

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

`output_format_json_quote_denormals = 0` の場合、クエリの出力には `null` 値が含まれます。

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

`output_format_json_quote_denormals = 1` の場合、クエリは次のような結果を返します。

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

名前付きタプル列を JSON オブジェクトとしてシリアライズする際、値が null のキーと値のペアをスキップします。これは、output_format_json_named_tuples_as_objects が true の場合にのみ有効です。



## output_format_json_validate_utf8 {#output_format_json_validate_utf8}   

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットでの UTF-8 シーケンスの検証を制御します。`JSON` / `JSONCompact` / `JSONColumnsWithMetadata` フォーマットには影響しません。これらのフォーマットでは常に UTF-8 の検証が行われます。

デフォルトでは無効です。



## output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、Markdown 内の特殊文字をエスケープします。

[CommonMark](https://spec.commonmark.org/0.30/#example-12) では、次の特殊文字をエスケープできると定義しています：

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

指定可能な値:

* 0 — 無効
* 1 — 有効


## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}   

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

UUID を MsgPack 形式で出力する方法を指定します。



## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Native 出力形式で、型名ではなくデータ型をバイナリ形式で出力します



## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}   

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) 列および [Dynamic](../../sql-reference/data-types/dynamic.md) 列のデータを、すべての型やパスを個別のサブカラムとして扱うフラットな形式で出力します。



## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) 列のデータを、デフォルトのネイティブな JSON シリアル化ではなく、JSON 文字列を格納する [String](../../sql-reference/data-types/string.md) 列として書き込みます。



## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}   

<SettingsInfoBlock type="UInt64" default_value="262144" />

ORC 形式の出力における圧縮ブロックのサイズ（バイト単位）。



## output_format_orc_compression_method {#output_format_orc_compression_method}   

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

ORC 形式の出力に使用する圧縮方式。サポートされているコーデック: lz4、snappy、zlib、zstd、none（非圧縮）



## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}   

<SettingsInfoBlock type="Double" default_value="0" />

ORC 出力フォーマットにおける文字列列について、NULL 以外の行数の合計に対する異なる値の個数の割合がこの値を超える場合は辞書エンコーディングを無効にします。超えない場合は辞書エンコーディングを有効にします。



## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 出力形式における行インデックスストライドの目標値



## output_format_orc_string_as_string {#output_format_orc_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String 列には Binary 型ではなく ORC の String 型を使用します



## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

ORC writer のタイムゾーン名です。ORC writer のデフォルトのタイムゾーンは GMT です。



## output_format_parquet_batch_size {#output_format_parquet_batch_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

この行数ごとにページサイズを確認します。各値の平均サイズが数 KB を超える列がある場合は、この値を小さくすることを検討してください。



## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}   

<SettingsInfoBlock type="Double" default_value="10.5" />

Parquet のブルームフィルター内の各ユニーク値に対して使用するビット数のおおよその値。偽陽性率の推定値:
  *  6   ビット - 10%
  * 10.5 ビット -  1%
  * 16.9 ビット -  0.1%
  * 26.4 ビット -  0.01%
  * 41   ビット -  0.001%



## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}   

<SettingsInfoBlock type="UInt64" default_value="134217728" />

parquet ファイル内のどの位置に Bloom filter を配置するかを指定します。Bloom filter は概ねこの値のサイズごとのグループ単位で書き込まれます。具体的には:
  * 0 の場合、各 row group の Bloom filter はその row group の直後に書き込まれます。
  * すべての Bloom filter の合計サイズより大きい場合、すべての row group の Bloom filter はメモリに蓄積され、ファイル末尾付近でまとめて書き込まれます。
  * それ以外の場合、Bloom filter はメモリに蓄積され、その合計サイズがこの値を超えるたびに書き出されます。



## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルスキーマでは、リスト要素に 'item' ではなく 'element' という名前を使用します。これは Arrow ライブラリ実装に由来する歴史的な経緯によるものです。一般的には互換性が向上しますが、一部の古いバージョンの Arrow では互換性の問題が生じる可能性があります。



## output_format_parquet_compression_method {#output_format_parquet_compression_method}   

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Parquet 出力フォーマットの圧縮方式。サポートされているコーデックは次のとおりです: snappy、lz4、brotli、zstd、gzip、none（無圧縮）



## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

圧縮前のページサイズの目標値（バイト単位）。



## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}   

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` の値を、32 ビットの parquet `DATE` 型（読み出し時は `Date32`）に変換する代わりに、16 ビットのプレーンな数値として書き出します（読み出し時は `UInt16` として読み取られます）。



## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}   

<SettingsInfoBlock type="Bool" default_value="0" />

DateTime の値を、ミリ秒に変換して（読み取り時は DateTime64(3) として）書き出すのではなく、生の Unix タイムスタンプ（読み取り時は UInt32）として書き出します。



## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Enum を Parquet の物理型 BYTE_ARRAY および論理型 ENUM として書き込みます



## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 列には Binary 型ではなく、Parquet の FIXED_LEN_BYTE_ARRAY 型を使用します。



## output_format_parquet_geometadata {#output_format_parquet_geometadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet のメタデータに geo 列に関する情報を書き込み、列を WKB 形式でエンコードできるようにします。



## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

辞書サイズがこのバイト数を超えた場合、辞書なしエンコーディングに切り替えます。辞書エンコーディングを無効にするには 0 を設定します。



## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet のエンコードを複数スレッドで実行します。使用するには output_format_parquet_use_custom_encoder の有効化が必要です。



## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

ターゲットとする行グループのサイズ（行数）。



## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="536870912" />

圧縮前の、目標とする行グループサイズ（バイト単位）。



## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

String 列に Binary 型ではなく Parquet の String 型を使用します。



## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

より高速な Parquet エンコーダー実装を使用します。



## output_format_parquet_version {#output_format_parquet_version}   

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

出力フォーマットに使用する Parquet フォーマットのバージョン。サポートされているバージョン: 1.0、2.4、2.6、および 2.latest（既定）



## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}   

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルにブルームフィルタを書き込みます。output_format_parquet_use_custom_encoder = true を設定している必要があります。



## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

CRC32 チェックサムを Parquet のページヘッダーに書き込みます。



## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

カラムインデックスとオフセットインデックス（各データページに関する統計情報であり、読み取り時のフィルタープッシュダウンに利用される場合があります）を Parquet ファイルに書き込みます。



## output_format_pretty_color {#output_format_pretty_color}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty 形式で ANSI エスケープシーケンスを使用します。0 - 無効、1 - 有効、'auto' - 出力先がターミナルの場合に有効。



## output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names

<SettingsInfoBlock type="UInt64" default_value="1" />

テーブルの行数が多い場合に、フッターに列名を表示します。

可能な値:

* 0 — フッターに列名を表示しません。
* 1 — 行数が [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows)（デフォルトは 50）で設定されたしきい値以上の場合に、フッターに列名を表示します。

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

設定 [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) が有効な場合に、列名を含むフッターが表示される最小行数を指定します。



## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、テーブルが横に広く行数が少ない場合に、Pretty 形式は Vertical 形式と同様の形式で出力します。
この動作を詳細に調整するには、`output_format_pretty_fallback_to_vertical_max_rows_per_chunk` と `output_format_pretty_fallback_to_vertical_min_table_width` を参照してください。



## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}   

<SettingsInfoBlock type="UInt64" default_value="10" />

フォールバック先の Vertical 形式（`output_format_pretty_fallback_to_vertical` を参照）は、チャンク内のレコード数が指定された値以下の場合にのみ有効になります。



## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}   

<SettingsInfoBlock type="UInt64" default_value="5" />

Vertical 形式へのフォールバック（`output_format_pretty_fallback_to_vertical` を参照）は、列数が指定した値を超える場合にのみ行われます。



## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

フォールバック先の Vertical 形式（`output_format_pretty_fallback_to_vertical` を参照）は、テーブル内の列幅の合計が指定された値以上である場合、または少なくとも 1 つの値に改行文字が含まれている場合にのみ有効化されます。



## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty 形式でレンダリングされるデータが、遅延を伴って複数のチャンクに分かれて到着した場合でも、次のチャンクの列幅が前のチャンクと同じであれば、ANSI エスケープシーケンスを使用して前の行に戻り、前のチャンクのフッターを上書きして、新しいチャンクのデータを続きとして表示します。これにより、結果の見た目が向上します。

0 - 無効、1 - 有効、'auto' - 端末上で実行されている場合に有効。



## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}   

<SettingsInfoBlock type="String" default_value="UTF-8" />

グリッドの枠線を出力する際の文字セットです。利用可能な文字セット: ASCII, UTF-8（デフォルト）。



## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、出力先がターミナルの場合、千や百万などの桁を表す数字を下線付きで強調表示します。



## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、出力先がターミナルの場合、行末の空白文字をグレーと下線で強調表示します。



## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}   

<SettingsInfoBlock type="UInt64" default_value="24" />

列名が長すぎる場合、この値の長さに切り詰めます。
列名は、`output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` を合計した長さを超える場合に切り詰められます。



## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}   

<SettingsInfoBlock type="UInt64" default_value="4" />

カラム名が長すぎる場合に切り詰める際の最小文字数。
カラム名の長さが `output_format_pretty_max_column_name_width_cut_to` に `output_format_pretty_max_column_name_width_min_chars_to_cut` を加えた値より長い場合、切り詰められます。



## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Pretty 形式において、列内のすべての値に適用されるパディングの最大幅。



## output_format_pretty_max_rows {#output_format_pretty_max_rows}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Pretty フォーマットで表示する行数の上限。



## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Pretty フォーマットで表示する値の最大幅。これを超えると値は切り詰められます。
値 0 は「一切切り詰めない」ことを意味します。



## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}   

<SettingsInfoBlock type="UInt64" default_value="0" />

ブロック内の値が単一の値でない場合にのみ、値を切り詰めます（`output_format_pretty_max_value_width` 設定を参照）。それ以外の場合は値を省略せずに出力します。これは `SHOW CREATE TABLE` クエリに役立ちます。



## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

有効な場合、Pretty 形式ではテーブルセル内の複数行フィールドをセル内に収めて表示し、テーブルの枠線が保たれるようにします。
無効な場合、それらはそのまま表示されるため、テーブルが変形する可能性があります（オフにしておく利点としては、複数行の値をコピー＆ペーストしやすくなることが挙げられます）。



## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Pretty 出力形式で各行の前に行番号を追加します



## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

ブロックが単一の数値のみで構成され、その値がこの閾値（0 を除く）を超える場合、テーブルの右側に読みやすい形式に変換した数値の注釈を表示します。



## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}   

<SettingsInfoBlock type="UInt64" default_value="50" />

次のブロックを指定したミリ秒数間待機し、書き込み前に前のブロックにまとめます。
これにより、小さすぎるブロックが頻繁に出力されることを防ぎつつ、ストリーミング形式でデータを表示できます。



## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

前回の出力から指定したミリ秒数を超えて経過している場合、pretty 系フォーマットで保留中のブロックを出力します。



## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Google の wrapper 型を使用して Nullable 列をシリアライズする場合、デフォルト値を空の wrapper としてシリアライズします。オフにすると、デフォルト値と null 値はシリアライズされません。



## output_format_schema {#output_format_schema}   



自動生成されたスキーマが [Cap'n Proto](/interfaces/formats/CapnProto) または [Protobuf](/interfaces/formats/Protobuf) 形式で保存されるファイルのパス。



## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

INSERT クエリに列名を含める



## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}   

<SettingsInfoBlock type="UInt64" default_value="65409" />

1つの INSERT 文で挿入できる最大行数。



## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

カラム名を `（バッククォート）で囲みます



## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}   

<SettingsInfoBlock type="String" default_value="table" />

出力される INSERT クエリ内で使用されるテーブルの名前



## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}   

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT 文ではなく REPLACE 文を使用する



## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

`true` に設定すると、TSV 形式の行末は `\n` ではなく `\r\n` になります。



## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}   

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は ' を '' でエスケープし、それ以外の場合は \' でクオートします。



## output_format_write_statistics {#output_format_write_statistics}   

<SettingsInfoBlock type="Bool" default_value="1" />

読み取られた行数、バイト数、経過時間に関する統計情報を、適切な出力フォーマットで書き出します。

既定で有効です



## precise_float_parsing {#precise_float_parsing}   

<SettingsInfoBlock type="Bool" default_value="0" />

より高精度だが低速な浮動小数点数解析アルゴリズムを優先して使用する



## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}   

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを使用する `regexp_tree` 辞書を許可します。



## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}   

<SettingsInfoBlock type="Bool" default_value="0" />

regexp_tree 辞書に対して大文字・小文字を区別しないマッチングを行います。個々の式ごとに `(?i)` または `(?-i)` を指定して上書きできます。



## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}   

<SettingsInfoBlock type="Bool" default_value="0" />

`.` が `regexp_tree` 辞書で改行文字にもマッチすることを許可します。



## rows_before_aggregation {#rows_before_aggregation}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ClickHouse は rows_before_aggregation という統計情報の正確な値を提供します。これは、集約処理を行う前に読み取られた行数を表します。



## schema&#95;inference&#95;hints

スキーマを持たないフォーマットに対して、スキーマ推論のヒントとして使用する列名と型の一覧です。

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
`schema_inference_hints` が正しくフォーマットされていない場合、または入力ミスや誤ったデータ型などが含まれている場合は、`schema_inference_hints` 全体が無視されます。
:::


## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}   

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

スキーマ推論において、推論された型を `Nullable` にするかどうかを制御します。
指定可能な値:
 * 0 - 推論された型は決して `Nullable` になりません（この場合の null 値の扱いは input_format_null_as_default で制御します）。
 * 1 - すべての推論された型が `Nullable` になります。
 * 2 または `auto` - スキーマ推論中に解析されるサンプル内で、その列に `NULL` が含まれている場合、またはファイルメタデータに列の Nullable 情報が含まれている場合にのみ、推論された型は `Nullable` になります。
 * 3 - フォーマットがファイルメタデータに null 許容性情報を持つ場合（例: Parquet）は、そのメタデータに従って推論された型が `Nullable` かどうかが決まり、それ以外の場合（例: CSV）は常に `Nullable` になります。



## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}   

<SettingsInfoBlock type="Bool" default_value="0" />

スキーマ推論時に、推論された JSON 型を `Nullable` として扱うかどうかを制御します。
この設定を `schema_inference_make_columns_nullable` と併せて有効にした場合、推論される JSON 型は `Nullable` として扱われます。



## schema_inference_mode {#schema_inference_mode}   

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

スキーマ推論のモード。`default` — すべてのファイルが同一のスキーマを持つと仮定し、任意のファイルからスキーマを推論できるモード。`union` — ファイルごとに異なるスキーマを持ち得るものとし、結果のスキーマをすべてのファイルのスキーマの和集合とするモード。



## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}   

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

SHOW CREATE クエリで使用される識別子のクォート規則を設定します



## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}   

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

SHOW CREATE クエリで識別子に使用する引用符のスタイルを設定します



## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON オブジェクトを JSON 型に解析する際に、重複するパスは無視され、例外は送出されず最初のものだけが挿入されます。



## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

Array/Map/Tuple などのネストされた型内での experimental および suspicious 型の使用を検証する


