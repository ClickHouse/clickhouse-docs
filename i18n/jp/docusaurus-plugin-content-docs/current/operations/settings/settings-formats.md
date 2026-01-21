---
title: 'フォーマット設定'
sidebar_label: 'フォーマット設定'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: '入出力フォーマットを制御する設定。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自動生成 */ }

これらの設定は、[source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h) から自動生成されたものです。


## allow_special_bool_values_inside_variant \{#allow_special_bool_values_inside_variant\}

<SettingsInfoBlock type="Bool" default_value="0" />

"on"、"off"、"enable"、"disable" などの特殊なテキスト形式の bool 値から、Variant 型内の Bool 値を解析できるようにします。

## bool_false_representation \{#bool_false_representation\}

<SettingsInfoBlock type="String" default_value="false" />

TSV/CSV/Vertical/Pretty 形式で、bool 型の `false` 値を表現するために使用される文字列。

## bool_true_representation \{#bool_true_representation\}

<SettingsInfoBlock type="String" default_value="true" />

TSV/CSV/Vertical/Pretty フォーマットで、真のブール値を表す文字列。

## check_conversion_from_numbers_to_enum \{#check_conversion_from_numbers_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

Numbers から Enum への変換時に、その値が Enum に存在しない場合は例外を送出します。

デフォルトでは無効です。

## column_names_for_schema_inference \{#column_names_for_schema_inference\}

カラム名を持たないフォーマットのスキーマ推論に使用するカラム名のリストです。形式: 'column1,column2,column3,...'

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands \{#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands\}

<SettingsInfoBlock type="Bool" default_value="0" />

datetime64 の値の末尾のゼロを動的に削除し、出力の小数桁数を [0, 3, 6] に調整します。
それぞれ「seconds」「milliseconds」「microseconds」に対応します。

## date_time_input_format \{#date_time_input_format\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

日付と時刻のテキスト表現に対するパーサーを選択します。

この設定は[日付および時刻関数](../../sql-reference/functions/date-time-functions.md)には適用されません。

指定可能な値:

- `'best_effort'` — 拡張パースを有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` と、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日付および時刻形式をパースできます。たとえば `'2018-06-08T01:02:03.000Z'` です。

- `'best_effort_us'` — `best_effort` とほぼ同様です（[parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS) との違いを参照）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみをパースできます。たとえば `2019-08-20 10:18:56` または `2019-08-20` です。

Cloud でのデフォルト値: `'best_effort'`。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付および時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format \{#date_time_output_format\}

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

日付・時刻のテキスト表現について、出力形式を切り替えることができます。

指定可能な値:

- `simple` - シンプルな出力形式。

    ClickHouse は日付と時刻を `YYYY-MM-DD hh:mm:ss` 形式で出力します。例: `2019-08-20 10:18:56`。変換は、データ型に設定されたタイムゾーン (存在する場合) またはサーバーのタイムゾーンに従って行われます。

- `iso` - ISO 出力形式。

    ClickHouse は日付と時刻を [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) の `YYYY-MM-DDThh:mm:ssZ` 形式で出力します。例: `2019-08-20T10:18:56Z`。出力は UTC (`Z` は UTC を意味します) であることに注意してください。

- `unix_timestamp` - Unix タイムスタンプ出力形式。

    ClickHouse は日付と時刻を [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) 形式で出力します。例: `1566285536`。

こちらも参照:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior \{#date_time_overflow_behavior\}

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md) または整数を Date、Date32、DateTime、DateTime64 に変換する際に、その値が結果の型で表現できない場合の動作を定義します。

設定可能な値:

- `ignore` — オーバーフローを黙って無視します。結果は未定義です。
- `throw` — オーバーフローが発生した場合に例外をスローします。
- `saturate` — 結果をサチュレートします。値が対象の型で表現可能な最小値より小さい場合、結果はその型で表現可能な最小値になります。値が対象の型で表現可能な最大値より大きい場合、結果はその型で表現可能な最大値になります。

デフォルト値: `ignore`。

## errors_output_format \{#errors_output_format\}

<SettingsInfoBlock type="String" default_value="CSV" />

エラーをテキスト出力する際のフォーマット。

## format_avro_schema_registry_url \{#format_avro_schema_registry_url\}

AvroConfluent 形式用: Confluent Schema Registry の URL。

## format_binary_max_array_size \{#format_binary_max_array_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 形式における Array の許容される最大サイズです。破損したデータが原因で大量のメモリが割り当てられてしまうことを防ぎます。0 の場合は上限がありません。

## format_binary_max_object_size \{#format_binary_max_object_size\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

JSON 型 RowBinary フォーマットにおいて、1 つの Object 内で許可されるパス数の上限です。破損したデータによって大量のメモリが割り当てられることを防ぎます。0 を指定すると上限はありません。

## format_binary_max_string_size \{#format_binary_max_string_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary フォーマットにおける String の最大許容サイズ。破損したデータによって大量のメモリが割り当てられてしまうのを防ぎます。0 を指定すると、制限がないことを意味します。

## format_capn_proto_enum_comparising_mode \{#format_capn_proto_enum_comparising_mode\}

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

ClickHouse の Enum と CapnProto の Enum を対応付ける方法

## format_capn_proto_max_message_size \{#format_capn_proto_max_message_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

1つの CapnProto メッセージの最大サイズ（バイト単位）。誤った形式または破損したデータによる過剰なメモリ割り当てを防ぎます。デフォルトは 1 GiB です。

## format_capn_proto_use_autogenerated_schema \{#format_capn_proto_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema が設定されていない場合は、自動生成された CapnProto スキーマを使用します

## format_csv_allow_double_quotes \{#format_csv_allow_double_quotes\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合は、ダブルクォーテーションで囲まれた文字列を許可します。

## format_csv_allow_single_quotes \{#format_csv_allow_single_quotes\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定されている場合、文字列をシングルクォートで囲むことを許可します。

## format_csv_delimiter \{#format_csv_delimiter\}

<SettingsInfoBlock type="Char" default_value="," />

CSV データの区切り文字として扱う文字を指定します。文字列で設定する場合、その文字列の長さは 1 でなければなりません。

## format_csv_null_representation \{#format_csv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

CSV 形式での NULL のカスタム表現

## format_custom_escaping_rule \{#format_custom_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

フィールドのエスケープルール（CustomSeparated フォーマット用）

## format_custom_field_delimiter \{#format_custom_field_delimiter\}

<SettingsInfoBlock type="String" default_value="	" />

フィールド間の区切り文字（CustomSeparated 形式用）

## format_custom_result_after_delimiter \{#format_custom_result_after_delimiter\}

結果セットの後に付加されるサフィックス（CustomSeparated フォーマット用）

## format_custom_result_before_delimiter \{#format_custom_result_before_delimiter\}

CustomSeparated フォーマットにおいて、結果セットの前に付与するプレフィックス。

## format_custom_row_after_delimiter \{#format_custom_row_after_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

最後のカラムのフィールドの後に付与される区切り文字（CustomSeparated フォーマット用）

## format_custom_row_before_delimiter \{#format_custom_row_before_delimiter\}

最初のカラムのフィールドの前に置かれるデリミタ（CustomSeparated フォーマット用）

## format_custom_row_between_delimiter \{#format_custom_row_between_delimiter\}

行と行の間の区切り文字（CustomSeparated フォーマット用）

## format_display_secrets_in_show_and_select \{#format_display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

テーブル、データベース、テーブル関数、およびディクショナリに対する `SHOW` および `SELECT` クエリでシークレットを表示するかどうかを制御します。

シークレットを表示したいユーザーは、
[`display_secrets_in_show_and_select` サーバー設定](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
を有効にし、
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 権限を付与されている必要があります。

取り得る値:

-   0 — 無効。
-   1 — 有効。

## format_json_object_each_row_column_for_object_name \{#format_json_object_each_row_column_for_object_name\}

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) フォーマットでオブジェクト名を保存および書き込むために使用されるカラムの名前です。
カラムの型は String 型である必要があります。値が空の場合、オブジェクト名にはデフォルト名 `row_{i}` が使用されます。

## format_protobuf_use_autogenerated_schema \{#format_protobuf_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema が設定されていない場合は、自動生成された Protobuf を使用します

## format_regexp \{#format_regexp\}

正規表現（Regexp 形式用）

## format_regexp_escaping_rule \{#format_regexp_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

フィールドのエスケープ規則（Regexp フォーマット用）

## format_regexp_skip_unmatched \{#format_regexp_skip_unmatched\}

<SettingsInfoBlock type="Bool" default_value="0" />

正規表現に一致しない行をスキップします（Regexp フォーマット用）

## format_schema \{#format_schema\}

このパラメータは、[Cap'n Proto](https://capnproto.org/) や [Protobuf](https://developers.google.com/protocol-buffers/) のようにスキーマ定義を必要とするフォーマットを使用する場合に使用します。値はフォーマットによって異なります。

## format_schema_message_name \{#format_schema_message_name\}

`format_schema` で定義されたスキーマ内で、対象とするメッセージ名を定義します。
レガシーな format_schema 形式（`file_name:message_name`）との互換性を維持するため、動作は次のとおりです。

- `format_schema_message_name` が指定されていない場合、レガシーな `format_schema` の値の `message_name` 部分からメッセージ名が推測されます。
- レガシー形式を使用している状態で `format_schema_message_name` が指定されている場合は、エラーが発生します。

## format_schema_source \{#format_schema_source\}

<SettingsInfoBlock type="String" default_value="file" />

`format_schema` のソースを定義します。
指定可能な値は次のとおりです:

- 'file' (デフォルト): `format_schema` は `format_schemas` ディレクトリ内にあるスキーマファイルの名前です。
- 'string': `format_schema` はスキーマのリテラルな内容です。
- 'query': `format_schema` はスキーマを取得するためのクエリです。

`format_schema_source` が 'query' に設定されている場合、次の条件が適用されます:
- クエリはちょうど 1 つの値、つまり 1 つの文字列カラムを持つ 1 行だけを返さなければなりません。
- クエリの結果はスキーマの内容として扱われます。
- この結果はローカルの `format_schemas` ディレクトリにキャッシュされます。
- 次のコマンドを使用してローカルキャッシュをクリアできます: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`。
- 一度キャッシュされると、キャッシュが明示的にクリアされるまで、同一のクエリはスキーマを再取得するために再実行されません。
- ローカルキャッシュファイルに加えて、Protobuf メッセージもメモリ内にキャッシュされます。ローカルキャッシュファイルをクリアした後でも、スキーマを完全に更新するには `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` を使用してメモリ内キャッシュをクリアする必要があります。
- クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` を実行すると、キャッシュファイルと Protobuf メッセージのスキーマ両方のキャッシュを一度にクリアできます。

## format_template_resultset \{#format_template_resultset\}

結果セット用のフォーマット文字列を含むファイルへのパス（Template フォーマット用）

## format_template_resultset_format \{#format_template_resultset_format\}

結果セット用のフォーマット文字列（Template フォーマットで使用）

## format_template_row \{#format_template_row\}

行のフォーマット文字列が格納されたファイルへのパス（Template フォーマット用）

## format_template_row_format \{#format_template_row_format\}

行用フォーマット文字列（Template フォーマット用）

## format_template_rows_between_delimiter \{#format_template_rows_between_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

行の区切り文字（Template フォーマット用）

## format_tsv_null_representation \{#format_tsv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

TSV 形式での NULL のカスタム表現

## input_format_allow_errors_num \{#input_format_allow_errors_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

テキスト形式（CSV、TSV など）から読み込む際に許容できるエラー数の最大値を設定します。

デフォルト値は 0 です。

必ず `input_format_allow_errors_ratio` と組み合わせて使用してください。

行の読み込み中にエラーが発生しても、エラーのカウンターがまだ `input_format_allow_errors_num` より小さい場合、ClickHouse はその行を無視して次の行に進みます。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方が上限を超えた場合、ClickHouse は例外をスローします。

## input_format_allow_errors_ratio \{#input_format_allow_errors_ratio\}

<SettingsInfoBlock type="Float" default_value="0" />

テキスト形式（CSV、TSV など）から読み込む際に許容されるエラーの最大割合を設定します。
エラーの割合は 0 から 1 の間の浮動小数点数で指定します。

デフォルト値は 0 です。

必ず `input_format_allow_errors_num` と組み合わせて使用してください。

行の読み込み中にエラーが発生しても、エラーの割合がまだ `input_format_allow_errors_ratio` 未満であれば、ClickHouse はその行を無視して次の行に進みます。

`input_format_allow_errors_num` と `input_format_allow_errors_ratio` の両方を超過した場合、ClickHouse は例外をスローします。

## input_format_allow_seeks \{#input_format_allow_seeks\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC/Parquet/Arrow 形式の入力フォーマットで読み取り時にシークを許可します。

デフォルトで有効です。

## input_format_arrow_allow_missing_columns \{#input_format_arrow_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 入力フォーマットの読み取り時に、欠落しているカラムを許容する

## input_format_arrow_case_insensitive_column_matching \{#input_format_arrow_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow のカラムを ClickHouse のカラムと照合する際に大文字と小文字を区別しません。

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow フォーマットのスキーマ推論時に、未サポートの型を持つカラムをスキップします

## input_format_avro_allow_missing_fields \{#input_format_avro_allow_missing_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent フォーマットの場合: スキーマ内にフィールドが存在しない場合は、エラーではなくデフォルト値を使用します

## input_format_avro_null_as_default \{#input_format_avro_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent フォーマットの場合: NULL 値を持つ Nullable ではないカラムに対してデフォルト値を挿入します

## input_format_binary_decode_types_in_binary_format \{#input_format_binary_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 入力フォーマットで、型名ではなくデータ型をバイナリ形式で読み取ります

## input_format_binary_max_type_complexity \{#input_format_binary_max_type_complexity\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

バイナリ形式の型をデコードする際の型ノードの最大数（深さではなく総数）。`Map(String, UInt32)` は 3 ノードとなります。悪意のある入力から保護するための設定です。0 の場合は無制限です。

## input_format_binary_read_json_as_string \{#input_format_binary_read_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinary 入力フォーマットで、[JSON](../../sql-reference/data-types/newjson.md) データ型の値を JSON の [String](../../sql-reference/data-types/string.md) 型の値として読み取ります。

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

BSON 形式のスキーマ推論を行う際に、サポートされていない型を持つフィールドをスキップします。

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

CapnProto フォーマットでスキーマ推論を行う際に、サポートされていない型のカラムをスキップする

## input_format_csv_allow_cr_end_of_line \{#input_format_csv_allow_cr_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

これを true に設定すると、その後に何も続かない行末での \\r が許可されます 

## input_format_csv_allow_variable_number_of_columns \{#input_format_csv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 入力で余分なカラム（ファイルのカラム数が想定より多い場合）は無視し、欠落しているフィールドはデフォルト値として扱います

## input_format_csv_allow_whitespace_or_tab_as_delimiter \{#input_format_csv_allow_whitespace_or_tab_as_delimiter\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 文字列でフィールド区切り文字としてスペースおよびタブ (\\t) の使用を許可します

## input_format_csv_arrays_as_nested_csv \{#input_format_csv_arrays_as_nested_csv\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV から `Array` を読み込む際に、その要素が入れ子の CSV 形式としてシリアライズされ、その結果が文字列として格納されていることを想定します。例: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\"。配列を囲む角括弧は省略可能です。

## input_format_csv_deserialize_separate_columns_into_tuple \{#input_format_csv_deserialize_separate_columns_into_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、CSV 形式で書き込まれた個々のカラムを 1 つの Tuple カラムにデシリアライズできます。

## input_format_csv_detect_header \{#input_format_csv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 形式の入力から、カラム名および型を含むヘッダー行を自動検出します

## input_format_csv_empty_as_default \{#input_format_csv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 入力の空フィールドをデフォルト値として扱います。

## input_format_csv_enum_as_number \{#input_format_csv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で挿入された enum 値を enum のインデックスとして扱います

## input_format_csv_skip_first_lines \{#input_format_csv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

CSV 形式のデータの先頭から指定した行数をスキップします

## input_format_csv_skip_trailing_empty_lines \{#input_format_csv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 形式で末尾の空行をスキップする

## input_format_csv_trim_whitespaces \{#input_format_csv_trim_whitespaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 文字列の先頭および末尾にあるスペースとタブ (\\t) 文字を削除します

## input_format_csv_try_infer_numbers_from_strings \{#input_format_csv_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論時に ClickHouse は文字列フィールドから数値を推論しようとします。
CSV データに引用符付きの UInt64 数値が含まれている場合に有用です。

デフォルトでは無効です。

## input_format_csv_try_infer_strings_from_quoted_tuples \{#input_format_csv_try_infer_strings_from_quoted_tuples\}

<SettingsInfoBlock type="Bool" default_value="1" />

入力データ内の引用符で囲まれたタプルを、String 型の値として解釈します。

## input_format_csv_use_best_effort_in_schema_inference \{#input_format_csv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 形式のスキーマ推論に、ヒューリスティックや各種調整を用います

## input_format_csv_use_default_on_bad_values \{#input_format_csv_use_default_on_bad_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV フィールドのデシリアライズが不正な値により失敗した場合に、そのカラムにデフォルト値を設定することを許可します

## input_format_custom_allow_variable_number_of_columns \{#input_format_custom_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 形式の入力で余分なカラム（ファイル側のカラム数が想定より多い場合）を無視し、CustomSeparated 形式の入力で不足しているフィールドはデフォルト値で補完します。

## input_format_custom_detect_header \{#input_format_custom_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

CustomSeparated 形式で、名前および型を含むヘッダー行を自動検出します

## input_format_custom_skip_trailing_empty_lines \{#input_format_custom_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated フォーマットで末尾の空行をスキップする

## input_format_defaults_for_omitted_fields \{#input_format_defaults_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` クエリを実行する際に、省略された入力カラムの値を、それぞれのカラムのデフォルト値で置き換えます。このオプションは [JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）、[CSV](/interfaces/formats/CSV)、[TabSeparated](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[Parquet](/interfaces/formats/Parquet)、[Arrow](/interfaces/formats/Arrow)、[Avro](/interfaces/formats/Avro)、[ORC](/interfaces/formats/ORC)、[Native](/interfaces/formats/Native) フォーマットおよび `WithNames`/`WithNamesAndTypes` サフィックスを持つフォーマットに適用されます。

:::note
このオプションが有効な場合、拡張されたテーブルのメタデータがサーバーからクライアントに送信されます。これはサーバー側の追加の計算リソースを消費し、パフォーマンスを低下させる可能性があります。
:::

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## input_format_force_null_for_omitted_fields \{#input_format_force_null_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

省略されたフィールドを NULL で強制初期化します

## input_format_hive_text_allow_variable_number_of_columns \{#input_format_hive_text_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Hive Text 形式の入力で余分なカラム（ファイル側のカラム数が想定より多い場合）を無視し、Hive Text 形式の入力で不足しているフィールドはデフォルト値として処理します

## input_format_hive_text_collection_items_delimiter \{#input_format_hive_text_collection_items_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File におけるコレクション（array または map）要素間の区切り文字

## input_format_hive_text_fields_delimiter \{#input_format_hive_text_fields_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive テキストファイルにおけるフィールド間の区切り文字

## input_format_hive_text_map_keys_delimiter \{#input_format_hive_text_map_keys_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive テキストファイルにおける map キー／値ペア間の区切り文字

## input_format_import_nested_json \{#input_format_import_nested_json\}

<SettingsInfoBlock type="Bool" default_value="0" />

ネストされたオブジェクトを含む JSON データの挿入を有効または無効にします。

サポートされている形式:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

設定可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- `JSONEachRow` 形式での [入れ子構造の使用](/integrations/data-formats/json/other-formats#accessing-nested-json-objects)。

## input_format_ipv4_default_on_conversion_error \{#input_format_ipv4_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

IPv4 のデシリアライズ時に、変換エラーで例外をスローする代わりにデフォルト値を使用します。

既定では無効です。

## input_format_ipv6_default_on_conversion_error \{#input_format_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

IPv6 のデシリアライズ時に、変換エラーで例外をスローする代わりにデフォルト値を使用します。

デフォルトでは無効です。

## input_format_json_compact_allow_variable_number_of_columns \{#input_format_json_compact_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSONCompact/JSONCompactEachRow 入力フォーマットで、行ごとのカラム数の違いを許可します。
期待されるより多いカラムを含む行では余分なカラムを無視し、不足しているカラムにはデフォルト値を適用します。

デフォルトでは無効です。

## input_format_json_defaults_for_missing_elements_in_named_tuple \{#input_format_json_defaults_for_missing_elements_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルを解析する際に、JSON オブジェクト内で欠落している要素に対してデフォルト値を挿入します。
この設定は、`input_format_json_named_tuples_as_objects` 設定が有効な場合にのみ機能します。

デフォルトで有効です。

## input_format_json_empty_as_default \{#input_format_json_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON 内の空の入力フィールドをデフォルト値に置き換えます。複雑なデフォルト式を使用する場合は、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

設定可能な値:

+ 0 — 無効。
+ 1 — 有効。

## input_format_json_ignore_unknown_keys_in_named_tuple \{#input_format_json_ignore_unknown_keys_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプル用の JSON オブジェクト内に含まれる未知のキーを無視します。

デフォルトで有効です。

## input_format_json_ignore_unnecessary_fields \{#input_format_json_ignore_unnecessary_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

不要なフィールドを無視し、それらをパースしません。これを有効にすると、形式が不正であったりフィールドが重複していたりする JSON 文字列に対しても、例外がスローされない場合があります。

## input_format_json_infer_array_of_dynamic_from_array_of_different_types \{#input_format_json_infer_array_of_dynamic_from_array_of_different_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論中に ClickHouse は、異なるデータ型の値を含む JSON 配列に対して Array(Dynamic) 型を使用します。

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


## input_format_json_infer_incomplete_types_as_strings \{#input_format_json_infer_incomplete_types_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

スキーマ推論の際に、データサンプル中で `Null`/`{}`/`[]` のみを含む JSON キーに対して String 型を使用できるようにします。
JSON フォーマットでは任意の値を String として読み取ることができるため、スキーマ推論時に `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` のようなエラーを、
型が不明なキーに対して String 型を使用することで回避できます。

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

デフォルトで有効です。


## input_format_json_map_as_array_of_tuples \{#input_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

Map 型カラムをタプルの JSON 配列としてデシリアライズします。

デフォルトでは無効です。

## input_format_json_max_depth \{#input_format_json_max_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

JSON 内のフィールドの最大深度です。これは厳密な上限ではなく、必ずしも厳密に適用されるとは限りません。

## input_format_json_named_tuples_as_objects \{#input_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルのカラムを JSON オブジェクトとして解釈します。

デフォルトで有効です。

## input_format_json_read_arrays_as_strings \{#input_format_json_read_arrays_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、JSON 配列を文字列として解釈できるようにします。

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

デフォルトで有効です。


## input_format_json_read_bools_as_numbers \{#input_format_json_read_bools_as_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットでブール値を数値として解析することを許可します。

デフォルトで有効です。

## input_format_json_read_bools_as_strings \{#input_format_json_read_bools_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、ブール値を文字列として解析することを許可します。

デフォルトで有効です。

## input_format_json_read_numbers_as_strings \{#input_format_json_read_numbers_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 形式の入力で、数値を文字列として読み取ることを許可します。

デフォルトで有効です。

## input_format_json_read_objects_as_strings \{#input_format_json_read_objects_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットにおいて、JSON オブジェクトを文字列としてパースすることを許可します。

例:

```sql
SET input_format_json_read_objects_as_strings = 1;
CREATE TABLE test (id UInt64, obj String, date Date) ENGINE=Memory();
INSERT INTO test FORMAT JSONEachRow {"id" : 1, "obj" : {"a" : 1, "b" : "Hello"}, "date" : "2020-01-01"};
SELECT * FROM test;
```

結果：

```
┌─id─┬─obj──────────────────────┬───────date─┐
│  1 │ {"a" : 1, "b" : "Hello"} │ 2020-01-01 │
└────┴──────────────────────────┴────────────┘
```

デフォルトで有効になっています。


## input_format_json_throw_on_bad_escape_sequence \{#input_format_json_throw_on_bad_escape_sequence\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 入力フォーマットで、不正なエスケープシーケンスを含む JSON 文字列があった場合に、例外をスローします。無効にすると、不正なエスケープシーケンスはデータ内にそのまま残ります。

デフォルトで有効です。

## input_format_json_try_infer_named_tuples_from_objects \{#input_format_json_try_infer_named_tuples_from_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、スキーマ推論の際に ClickHouse は JSON オブジェクトから名前付き Tuple を推論しようとします。
生成される名前付き Tuple には、サンプルデータ内の対応するすべての JSON オブジェクトに含まれるすべての要素が含まれます。

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

デフォルトで有効です。


## input_format_json_try_infer_numbers_from_strings \{#input_format_json_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、スキーマ推論中に ClickHouse は文字列フィールドの値から数値を推論しようとします。
JSON データに引用符付きの UInt64 数値が含まれている場合に有用です。

デフォルトでは無効です。

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects \{#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects\}

<SettingsInfoBlock type="Bool" default_value="0" />

名前付きタプルの推論中に、JSON オブジェクト内のパスがあいまいな場合は、例外を送出する代わりに String 型として扱います

## input_format_json_validate_types_from_metadata \{#input_format_json_validate_types_from_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON / JSONCompact / JSONColumnsWithMetadata 入力フォーマットに対して、この設定を 1 にすると、
入力データ内のメタデータに含まれる型が、テーブル内の対応するカラムの型と照合されます。

デフォルトで有効です。

## input_format_max_block_size_bytes \{#input_format_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

入力フォーマットでデータを解析する際に生成されるブロックのサイズを、バイト単位で制限します。ClickHouse 側でブロックを生成する行ベースの入力フォーマットで使用されます。
0 はバイト数に制限がないことを意味します。

## input_format_max_bytes_to_read_for_schema_inference \{#input_format_max_bytes_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

自動スキーマ推論のために読み取るデータ量の上限（バイト数）。

## input_format_max_rows_to_read_for_schema_inference \{#input_format_max_rows_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="25000" />

自動スキーマ推論のために読み取るデータ行の最大数。

## input_format_msgpack_number_of_columns \{#input_format_msgpack_number_of_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

挿入される MsgPack データ内のカラム数です。データからスキーマを自動推論する際に使用されます。

## input_format_mysql_dump_map_column_names \{#input_format_mysql_dump_map_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

MySQL ダンプ内のテーブルのカラムと ClickHouse テーブルのカラムを名前に基づいて対応付けます。

## input_format_mysql_dump_table_name \{#input_format_mysql_dump_table_name\}

データを読み取る元となる MySQL ダンプ内のテーブル名

## input_format_native_allow_types_conversion \{#input_format_native_allow_types_conversion\}

<SettingsInfoBlock type="Bool" default_value="1" />

Native 入力フォーマットでのデータ型の変換を許可する

## input_format_native_decode_types_in_binary_format \{#input_format_native_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Native 入力フォーマットで、型名ではなくバイナリ形式としてデータ型を読み取ります

## input_format_null_as_default \{#input_format_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

[NULL](/sql-reference/syntax#literals) フィールドのデータ型が [nullable](/sql-reference/data-types/nullable) ではない場合に、これらのフィールドを [デフォルト値](/sql-reference/statements/create/table#default_values) で初期化するかどうかを制御します。
カラム型が nullable ではなく、この設定が無効な場合、`NULL` を挿入すると例外が発生します。カラム型が nullable の場合、この設定に関係なく、`NULL` 値はそのまま挿入されます。

この設定は、ほとんどの入力フォーマットに適用されます。

複雑なデフォルト式を使用する場合は、`input_format_defaults_for_omitted_fields` も有効にする必要があります。

取りうる値:

- 0 — nullable ではないカラムに `NULL` を挿入すると例外が発生します。
- 1 — `NULL` フィールドはカラムのデフォルト値で初期化されます。

## input_format_orc_allow_missing_columns \{#input_format_orc_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC 入力フォーマットの読み取り時に、欠落しているカラムを許容する

## input_format_orc_case_insensitive_column_matching \{#input_format_orc_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

ORC カラムと ClickHouse のカラムを照合する際に、大文字と小文字を区別しません。

## input_format_orc_dictionary_as_low_cardinality \{#input_format_orc_dictionary_as_low_cardinality\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルを読み取る際に、Dictionary エンコードされた ORC カラムを LowCardinality 型のカラムとして扱います。

## input_format_orc_filter_push_down \{#input_format_orc_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC ファイルを読み取る際に、WHERE / PREWHERE 句、min/max 統計情報、または ORC メタデータに含まれるブルームフィルターに基づいて、ストライプ全体または行グループをスキップします。

## input_format_orc_reader_time_zone_name \{#input_format_orc_reader_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

ORC 行リーダーのタイムゾーン名です。デフォルトの ORC 行リーダーのタイムゾーンは GMT です。

## input_format_orc_row_batch_size \{#input_format_orc_row_batch_size\}

<SettingsInfoBlock type="Int64" default_value="100000" />

ORC ストライプを読み込む際のバッチサイズ（行数）。

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

ORC 形式のスキーマ推論時にサポートされていない型のカラムをスキップします

## input_format_orc_use_fast_decoder \{#input_format_orc_use_fast_decoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

高速な ORC デコーダー実装を使用します。

## input_format_parallel_parsing \{#input_format_parallel_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

データフォーマットの順序を保持した並列パースを有効または無効にします。[TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) の各フォーマットでのみサポートされます。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## input_format_parquet_allow_geoparquet_parser \{#input_format_parquet_allow_geoparquet_parser\}

<SettingsInfoBlock type="Bool" default_value="1" />

geo カラムパーサーを使用して、Array(UInt8) 型を Point/Linestring/Polygon/MultiLineString/MultiPolygon 型に変換します

## input_format_parquet_allow_missing_columns \{#input_format_parquet_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet 入力フォーマットの読み込み時に、欠落しているカラムを許可する

## input_format_parquet_bloom_filter_push_down \{#input_format_parquet_bloom_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み取る際に、WHERE 句と Parquet のメタデータ内のブルームフィルターに基づいて、行グループ全体をスキップします。

## input_format_parquet_case_insensitive_column_matching \{#input_format_parquet_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet のカラムを CH のカラムと照合する際に、大文字小文字を区別せずに処理します。

## input_format_parquet_enable_json_parsing \{#input_format_parquet_enable_json_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際、JSON カラムを ClickHouse の JSON カラムとして扱います。

## input_format_parquet_enable_row_group_prefetch \{#input_format_parquet_enable_row_group_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

parquet のパース時に row group のプリフェッチを有効にします。現在は、単一スレッドでのパース時にのみプリフェッチが可能です。

## input_format_parquet_filter_push_down \{#input_format_parquet_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、WHERE/PREWHERE 句と Parquet メタデータ内の最小値/最大値の統計情報に基づいて、行グループ全体をスキップします。

## input_format_parquet_local_file_min_bytes_for_seek \{#input_format_parquet_local_file_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

Parquet input format で、読み飛ばし読み込みではなくシークを行うために、ローカル読み取り（ファイル）に必要な最小バイト数

## input_format_parquet_local_time_as_utc \{#input_format_parquet_local_time_as_utc\}

<SettingsInfoBlock type="Bool" default_value="1" />

isAdjustedToUTC=false の Parquet タイムスタンプに対して、スキーマ推論時に使用されるデータ型を決定します。true の場合は DateTime64(..., 'UTC')、false の場合は DateTime64(...) となります。ClickHouse にはローカルのウォールクロック時刻用のデータ型が存在しないため、どちらの挙動も完全に正しいわけではありません。直感に反して、'true' の方がまだ誤りが少ない選択肢と考えられます。というのも、'UTC' タイムスタンプを String としてフォーマットすると、結果として正しいローカル時刻の表現が得られるためです。

## input_format_parquet_max_block_size \{#input_format_parquet_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Parquet リーダー用の最大ブロックサイズ。

## input_format_parquet_memory_high_watermark \{#input_format_parquet_memory_high_watermark\}

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Parquet reader v3 の概略的なメモリ上限です。並列に読み込める row group やカラムの数を制限します。1 回のクエリで複数ファイルを読み込む場合、この制限はそれらのファイル全体でのメモリ使用量の合計に適用されます。

## input_format_parquet_memory_low_watermark \{#input_format_parquet_memory_low_watermark\}

<SettingsInfoBlock type="UInt64" default_value="2097152" />

メモリ使用量がこのしきい値を下回っている場合に、より積極的にプリフェッチをスケジューリングします。多数の小さなブルームフィルタをネットワーク経由で読み取る必要がある場合などに有用となることがあります。

## input_format_parquet_page_filter_push_down \{#input_format_parquet_page_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

カラム索引に格納された最小値および最大値に基づいてページをスキップします。

## input_format_parquet_prefer_block_bytes \{#input_format_parquet_prefer_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Parquet リーダーが出力するブロックの平均バイト数

## input_format_parquet_preserve_order \{#input_format_parquet_preserve_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet ファイルから読み取る際に行の並び順が変わらないようにします。行の順序は一般的に保証されておらず、クエリパイプラインの他のパーツによっても崩される可能性があるため、推奨されません。代わりに `ORDER BY _row_number` を使用してください。

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet フォーマットのスキーマ推論を行う際に、サポートされていない型のカラムをスキップする

## input_format_parquet_use_native_reader_v3 \{#input_format_parquet_use_native_reader_v3\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet リーダー v3 を使用します。

## input_format_parquet_use_offset_index \{#input_format_parquet_use_offset_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

ページフィルタリングを行わない場合における、parquet ファイルからのページの読み取り方法に関する軽微な調整です。

## input_format_parquet_verify_checksums \{#input_format_parquet_verify_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルを読み込む際に、ページチェックサムを検証します。

## input_format_protobuf_flatten_google_wrappers \{#input_format_protobuf_flatten_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

通常の非ネストカラムに対して Google ラッパーを有効にします。例えば、String カラム 'str' に対して google.protobuf.StringValue 'str' を使用します。Nullable カラムでは、空のラッパーはデフォルト値として認識され、ラッパーが存在しない場合は NULL として扱われます。

## input_format_protobuf_oneof_presence \{#input_format_protobuf_oneof_presence\}

<SettingsInfoBlock type="Bool" default_value="0" />

専用の列に `enum` 値を設定することで、`protobuf oneof` のどのフィールドが検出されたかを示します。

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Protobuf フォーマットのスキーマ推論時にサポートされていない型のフィールドをスキップする

## input_format_record_errors_file_path \{#input_format_record_errors_file_path\}

テキストフォーマット（CSV、TSV）を読み込み時に発生したエラーを記録するために使用されるファイルのパス。

## input_format_skip_unknown_fields \{#input_format_skip_unknown_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

余分なデータの挿入をスキップするかどうかを切り替えます。

データを書き込む際、入力データに対象テーブルに存在しないカラムが含まれている場合、ClickHouse は例外をスローします。この設定が有効な場合、ClickHouse はそのような余分なデータは挿入せず、例外もスローしません。

対応フォーマット:

- [JSONEachRow](/interfaces/formats/JSONEachRow)（およびその他の JSON フォーマット）
- [BSONEachRow](/interfaces/formats/BSONEachRow)（およびその他の JSON フォーマット）
- [TSKV](/interfaces/formats/TSKV)
- 接尾辞 WithNames/WithNamesAndTypes を持つすべてのフォーマット
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

可能な値:

- 0 — 無効。
- 1 — 有効。

## input_format_try_infer_dates \{#input_format_try_infer_dates\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、ClickHouse はテキスト形式のスキーマ推論において、文字列フィールドから型 `Date` を推論しようとします。入力データ内のあるカラムで、すべてのフィールドが日付として正常にパースされた場合、その結果型は `Date` になります。少なくとも 1 つでも日付としてパースできないフィールドがある場合、その結果型は `String` になります。

デフォルトで有効です。

## input_format_try_infer_datetimes \{#input_format_try_infer_datetimes\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、ClickHouse はテキスト形式のスキーマ推論時に、文字列フィールドから型 `DateTime64` を推論しようとします。入力データ内のあるカラムのすべてのフィールドが日時として正常にパースされた場合、結果の型は `DateTime64` になります。少なくとも 1 つのフィールドでも日時としてパースできなかった場合、結果の型は `String` になります。

デフォルトで有効です。

## input_format_try_infer_datetimes_only_datetime64 \{#input_format_try_infer_datetimes_only_datetime64\}

<SettingsInfoBlock type="Bool" default_value="0" />

input_format_try_infer_datetimes が有効な場合、DateTime 型ではなく DateTime64 型のみを推論対象とします

## input_format_try_infer_exponent_floats \{#input_format_try_infer_exponent_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

テキスト形式でスキーマ推論を行う際に（指数表記の数値が常に推論される JSON を除き）、指数表記の浮動小数点数を推論しようとします

## input_format_try_infer_integers \{#input_format_try_infer_integers\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、テキスト形式のスキーマ推論を行う際に、ClickHouse は浮動小数点数ではなく整数として推論しようとします。入力データのカラム内のすべての数値が整数であれば、結果の型は `Int64` になり、少なくとも 1 つでも浮動小数点数が含まれている場合、結果の型は `Float64` になります。

デフォルトで有効です。

## input_format_try_infer_variants \{#input_format_try_infer_variants\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効化すると、ClickHouse はテキストフォーマットに対するスキーマ推論において、カラム/配列要素に複数の型候補が存在する場合に、[`Variant`](../../sql-reference/data-types/variant.md) 型を推論しようとします。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## input_format_tsv_allow_variable_number_of_columns \{#input_format_tsv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力で、ファイルに含まれるカラム数が想定より多い場合は余分なカラムを無視し、TSV 入力で不足しているフィールドにはデフォルト値を適用します

## input_format_tsv_crlf_end_of_line \{#input_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、file 関数は行末に \\n ではなく \\r\\n を用いる TSV 形式として読み取ります。

## input_format_tsv_detect_header \{#input_format_tsv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 形式で、名前と型が記載されたヘッダーを自動検出します

## input_format_tsv_empty_as_default \{#input_format_tsv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 入力の空フィールドをデフォルト値として扱います。

## input_format_tsv_enum_as_number \{#input_format_tsv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で挿入された enum 値を、その列挙型のインデックスとして解釈します。

## input_format_tsv_skip_first_lines \{#input_format_tsv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

TSV 形式のデータの先頭から指定した行数をスキップします

## input_format_tsv_skip_trailing_empty_lines \{#input_format_tsv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 形式で末尾の空行をスキップする

## input_format_tsv_use_best_effort_in_schema_inference \{#input_format_tsv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 形式のスキーマを推論する際に、いくつかの調整やヒューリスティックを用いて推論を行います

## input_format_values_accurate_types_of_literals \{#input_format_values_accurate_types_of_literals\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values フォーマット用の設定です。template を用いて式をパースおよび解釈する際に、リテラルの実際の型を検査し、オーバーフローや精度低下といった問題が発生しないようにします。

## input_format_values_deduce_templates_of_expressions \{#input_format_values_deduce_templates_of_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values フォーマットの場合: フィールドがストリーミングパーサーで解析できなかったとき、SQL パーサーを実行して SQL 式のテンプレートを推論し、そのテンプレートを使ってすべての行の解析を試み、その後すべての行について式を評価します。

## input_format_values_interpret_expressions \{#input_format_values_interpret_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values フォーマットの場合: ストリーミングパーサーでフィールドを解析できなかった場合、SQL パーサーを実行し、SQL 式として解釈を試みます。

## input_format_with_names_use_header \{#input_format_with_names_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

データを挿入する際に、カラムの順序を検証するかどうかを有効／無効にします。

入力データのカラム順が対象テーブルと完全に一致していると確信できる場合は、この検証を無効化することで挿入性能を向上させることを推奨します。

対応フォーマット:

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

取り得る値:

- 0 — 無効。
- 1 — 有効。

## input_format_with_types_use_header \{#input_format_with_types_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

フォーマットパーサーが、入力データのデータ型が対象テーブルのデータ型と一致しているかどうかをチェックするかを制御します。

サポートされているフォーマット:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

取りうる値:

- 0 — 無効。
- 1 — 有効。

## insert_distributed_one_random_shard \{#insert_distributed_one_random_shard\}

<SettingsInfoBlock type="Bool" default_value="0" />

Distributed テーブルにディストリビュートキーが存在しない場合に、ランダムな分片への挿入を有効または無効にします。([Distributed](/engines/table-engines/special/distributed))

デフォルトでは、複数の分片を持つ `Distributed` テーブルにデータを挿入する際、ディストリビュートキーがない場合は ClickHouse サーバーは挿入リクエストを拒否します。`insert_distributed_one_random_shard = 1` の場合は挿入が許可され、データはすべての分片の中からランダムに選択された分片へ転送されます。

設定可能な値:

- 0 — 分片が複数あり、ディストリビュートキーが指定されていない場合、挿入は拒否されます。
- 1 — ディストリビュートキーが指定されていない場合、利用可能なすべての分片の中からランダムに選択された分片へ挿入が行われます。

## interval_output_format \{#interval_output_format\}

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

interval 型のテキスト表現の出力形式を選択できます。

指定可能な値:

-   `kusto` - KQL 形式の出力フォーマット。

    ClickHouse は interval を [KQL 形式](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier) で出力します。たとえば、`toIntervalDay(2)` は `2.00:00:00` という形式で出力されます。長さが可変な interval 型（例: `IntervalMonth` や `IntervalYear`）については、interval 1 つあたりの平均秒数が考慮される点に注意してください。

-   `numeric` - 数値形式での出力。

    ClickHouse は interval を、その基となる数値表現として出力します。たとえば、`toIntervalDay(2)` は `2` という形式で出力されます。

関連項目:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories \{#into_outfile_create_parent_directories\}

<SettingsInfoBlock type="Bool" default_value="0" />

INTO OUTFILE を使用する際に、存在しない親ディレクトリを自動的に作成します。

## json_type_escape_dots_in_keys \{#json_type_escape_dots_in_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON キー内に含まれるドットは、解析時にエスケープされます。

## output_format_arrow_compression_method \{#output_format_arrow_compression_method\}

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Arrow 出力フォーマット用の圧縮方式。サポートされるコーデック：lz4_frame、zstd、none（非圧縮）

## output_format_arrow_fixed_string_as_fixed_byte_array \{#output_format_arrow_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 型のカラムに対して、Binary の代わりに Arrow の FIXED_SIZE_BINARY 型を使用します。

## output_format_arrow_low_cardinality_as_dictionary \{#output_format_arrow_low_cardinality_as_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

LowCardinality 型を Dictionary Arrow 型として出力します

## output_format_arrow_string_as_string \{#output_format_arrow_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

String カラムには Binary ではなく Arrow String 型を使用します。

## output_format_arrow_use_64_bit_indexes_for_dictionary \{#output_format_arrow_use_64_bit_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow 形式の Dictionary の索引には常に 64 ビット整数を使用します

## output_format_arrow_use_signed_indexes_for_dictionary \{#output_format_arrow_use_signed_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="1" />

Arrow 形式で Dictionary の索引に符号付き整数を使用する

## output_format_avro_codec \{#output_format_avro_codec\}

出力に使用される圧縮コーデック。指定可能な値は 'null', 'deflate', 'snappy', 'zstd' です。

## output_format_avro_rows_in_file \{#output_format_avro_rows_in_file\}

<SettingsInfoBlock type="UInt64" default_value="1" />

ストレージが許容する場合の1ファイルあたりの最大行数

## output_format_avro_string_column_pattern \{#output_format_avro_string_column_pattern\}

Avro 形式の場合: AVRO string として扱う String 型カラムを選択するための正規表現。

## output_format_avro_sync_interval \{#output_format_avro_sync_interval\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

同期する間隔（バイト単位）。

## output_format_binary_encode_types_in_binary_format \{#output_format_binary_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

RowBinaryWithNamesAndTypes 出力フォーマットで、型名ではなくデータ型をバイナリ形式で出力します

## output_format_binary_write_json_as_string \{#output_format_binary_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) データ型の値を、RowBinary 出力フォーマットで JSON の [String](../../sql-reference/data-types/string.md) 値として書き出します。

## output_format_bson_string_as_string \{#output_format_bson_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

String カラムには Binary ではなく BSON String 型を使用します。

## output_format_compression_level \{#output_format_compression_level\}

<SettingsInfoBlock type="UInt64" default_value="3" />

クエリ出力が圧縮される場合のデフォルトの圧縮レベルです。`SELECT` クエリに `INTO OUTFILE` が含まれている場合、またはテーブル関数 `file`、`url`、`hdfs`、`s3`、`azureBlobStorage` に書き込む場合に、この設定が適用されます。

使用可能な値: `1` から `22` まで

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\}

<SettingsInfoBlock type="UInt64" default_value="0" />

出力圧縮方式が `zstd` のときに使用できます。`0` より大きい場合、この SETTING は圧縮ウィンドウサイズ（`2` のべき乗）を明示的に設定し、zstd 圧縮のロングレンジモードを有効にします。これにより、より高い圧縮率を達成できる場合があります。

設定可能な値: 非負の数値。値が小さすぎる、または大きすぎる場合、`zstdlib` が例外をスローします。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）までです。

## output_format_csv_crlf_end_of_line \{#output_format_csv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、CSV 形式の行末が \\n ではなく \\r\\n になります。

## output_format_csv_serialize_tuple_into_separate_columns \{#output_format_csv_serialize_tuple_into_separate_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、CSV 形式内の Tuple は個別のカラムとしてシリアライズされます（つまり、Tuple 内での入れ子構造は失われます）。

## output_format_decimal_trailing_zeros \{#output_format_decimal_trailing_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

Decimal 値を出力する際に末尾のゼロも出力します。例: 1.23 ではなく 1.230000 と表示します。

デフォルトでは無効です。

## output_format_json_array_of_rows \{#output_format_json_array_of_rows\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットで、すべての行を 1 つの JSON 配列として出力できるようにする設定です。

可能な値:

* 1 — ClickHouse は、すべての行を配列として出力し、各行は `JSONEachRow` フォーマットになります。
* 0 — ClickHouse は、各行を個別に `JSONEachRow` フォーマットで出力します。

**この設定を有効にしたクエリの例**

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

**設定を無効にした場合のクエリ例**

クエリ：

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


## output_format_json_escape_forward_slashes \{#output_format_json_escape_forward_slashes\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 出力形式において、文字列出力中のスラッシュ（/）をエスケープするかどうかを制御します。これは JavaScript との互換性を目的としています。常にエスケープされるバックスラッシュ（\）と混同しないでください。

デフォルトで有効です。

## output_format_json_map_as_array_of_tuples \{#output_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

Map 型のカラムをタプルの JSON 配列としてシリアライズします。

デフォルトでは無効です。

## output_format_json_named_tuples_as_objects \{#output_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きタプルカラムを JSON オブジェクトとしてシリアライズします。

デフォルトで有効です。

## output_format_json_pretty_print \{#output_format_json_pretty_print\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定は、JSON出力フォーマットを使用する際に、`data` 配列の中で Tuples、Maps、Arrays などの入れ子構造がどのように表示されるかを決定します。

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

デフォルトで有効です。


## output_format_json_quote_64bit_floats \{#output_format_json_quote_64bit_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

64 ビットの [floats](../../sql-reference/data-types/float.md) が JSON* フォーマットで出力される際に、値をクォートするかどうかを制御します。

デフォルトでは無効です。

## output_format_json_quote_64bit_integers \{#output_format_json_quote_64bit_integers\}

<SettingsInfoBlock type="Bool" default_value="0" />

[整数](../../sql-reference/data-types/int-uint.md)（`UInt64` や `Int128` など）のうち 64 ビット以上のものが [JSON](/interfaces/formats/JSON) 形式で出力される際に、引用符で囲むかどうかを制御します。
これらの整数はデフォルトで引用符で囲まれます。この挙動は、ほとんどの JavaScript 実装と互換性があります。

指定可能な値:

- 0 — 整数を引用符なしで出力します。
- 1 — 整数を引用符で囲んで出力します。

## output_format_json_quote_decimals \{#output_format_json_quote_decimals\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットで小数値を引用符で囲むかどうかを制御します。

デフォルトでは無効です。

## output_format_json_quote_denormals \{#output_format_json_quote_denormals\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](/interfaces/formats/JSON) 出力形式で、`+nan`、`-nan`、`+inf`、`-inf` の出力を有効にします。

指定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

次のテーブル `account_orders` を考えます。

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

`output_format_json_quote_denormals = 0` の場合、出力には `null` 値が含まれます。

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

`output_format_json_quote_denormals = 1` の場合、クエリ結果は次のようになります。

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

名前付きタプルのカラムを JSON オブジェクトとしてシリアライズする際に、値が null のキーと値のペアをスキップします。これは、output_format_json_named_tuples_as_objects が true に設定されている場合にのみ有効です。

## output_format_json_validate_utf8 \{#output_format_json_validate_utf8\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 出力フォーマットでの UTF-8 シーケンスの検証を制御します。`JSON` / `JSONCompact` / `JSONColumnsWithMetadata` フォーマットには影響せず、これらは常に UTF-8 を検証します。

デフォルトでは無効です。

## output_format_markdown_escape_special_characters \{#output_format_markdown_escape_special_characters\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、Markdown 内の特殊文字をエスケープします。

[CommonMark](https://spec.commonmark.org/0.30/#example-12) は、エスケープ可能な特殊文字を次のように定義しています：

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Possible values:

* 0 — 無効
* 1 — 有効


## output_format_msgpack_uuid_representation \{#output_format_msgpack_uuid_representation\}

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

MsgPack 形式で UUID をどのように出力するかを指定します。

## output_format_native_encode_types_in_binary_format \{#output_format_native_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Native 出力フォーマットで、型名ではなくデータ型をバイナリ形式で出力します

## output_format_native_use_flattened_dynamic_and_json_serialization \{#output_format_native_use_flattened_dynamic_and_json_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) および [Dynamic](../../sql-reference/data-types/dynamic.md) カラムのデータを、すべての型やパスを個別のサブカラムとして扱うフラットな形式で書き出します。

## output_format_native_write_json_as_string \{#output_format_native_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](../../sql-reference/data-types/newjson.md) カラムのデータを、デフォルトのネイティブな JSON シリアライゼーションではなく、JSON 文字列を含む [String](../../sql-reference/data-types/string.md) カラムとして書き出します。

## output_format_orc_compression_block_size \{#output_format_orc_compression_block_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

ORC 出力形式で使用する圧縮ブロックのサイズ（バイト単位）。

## output_format_orc_compression_method \{#output_format_orc_compression_method\}

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

ORC 出力形式の圧縮方式。サポートされているコーデック: lz4, snappy, zlib, zstd, none (非圧縮)

## output_format_orc_dictionary_key_size_threshold \{#output_format_orc_dictionary_key_size_threshold\}

<SettingsInfoBlock type="Double" default_value="0" />

ORC 出力形式における文字列カラムについて、異なる値（ユニーク値）の数が、NULL でない行の総数に対してこの割合を超える場合は、Dictionary エンコーディングを無効にします。それ以外の場合は、Dictionary エンコーディングを有効にします。

## output_format_orc_row_index_stride \{#output_format_orc_row_index_stride\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 出力フォーマットにおける行インデックスストライドの目標値

## output_format_orc_string_as_string \{#output_format_orc_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

String 型カラムには Binary ではなく ORC String 型を使用します

## output_format_orc_writer_time_zone_name \{#output_format_orc_writer_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

ORC writer に使用するタイムゾーン名。ORC writer のデフォルトのタイムゾーンは GMT です。

## output_format_parallel_formatting \{#output_format_parallel_formatting\}

<SettingsInfoBlock type="Bool" default_value="1" />

データ形式の並列フォーマット処理を有効または無効にします。[TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) 形式でのみサポートされます。

指定可能な値:

- 1 — 有効。
- 0 — 無効。

## output_format_parquet_batch_size \{#output_format_parquet_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

この行数ごとにページサイズを確認します。平均的な値のサイズが数KBを超えるカラムがある場合は、この値を小さくすることを検討してください。

## output_format_parquet_bloom_filter_bits_per_value \{#output_format_parquet_bloom_filter_bits_per_value\}

<SettingsInfoBlock type="Double" default_value="10.5" />

Parquet 形式のブルームフィルタで、各ユニーク値あたりに使用するビット数のおおよその値です。想定される偽陽性率は次のとおりです:

*  6   bits - 10%
  * 10.5 bits -  1%
  * 16.9 bits -  0.1%
  * 26.4 bits -  0.01%
  * 41   bits -  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes \{#output_format_parquet_bloom_filter_flush_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

parquet ファイル内のどこに Bloom filter を配置するかを制御します。Bloom filter は概ねこのサイズ程度のグループ単位で書き込まれます。具体的には次のとおりです:

* 0 の場合、各 row group の Bloom filter は、その row group の直後に書き込まれます
  * すべての Bloom filter の合計サイズよりも大きい場合、すべての row group の Bloom filter はメモリ上に蓄積され、その後ファイルの末尾付近でまとめて書き込まれます
  * それ以外の場合、Bloom filter はメモリ上に蓄積され、その合計サイズがこの値を上回るたびに書き出されます。

## output_format_parquet_compliant_nested_types \{#output_format_parquet_compliant_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

parquet ファイルスキーマでは、リスト要素に対して 'item' ではなく 'element' という名前を使用します。これは Arrow ライブラリ実装上の歴史的な経緯によるものです。一般的には互換性が向上しますが、一部の古いバージョンの Arrow とは互換性がない場合があります。

## output_format_parquet_compression_method \{#output_format_parquet_compression_method\}

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Parquet 出力形式で使用する圧縮方式。サポートされるコーデック: snappy、lz4、brotli、zstd、gzip、none（非圧縮）

## output_format_parquet_data_page_size \{#output_format_parquet_data_page_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

圧縮前のページサイズの目標値（バイト単位）。

## output_format_parquet_date_as_uint16 \{#output_format_parquet_date_as_uint16\}

<SettingsInfoBlock type="Bool" default_value="0" />

Date 型の値を、32ビットの Parquet DATE 型（読み込み時は Date32）に変換する代わりに、16ビットのプレーンな数値（読み込み時は UInt16）として書き込みます。

## output_format_parquet_datetime_as_uint32 \{#output_format_parquet_datetime_as_uint32\}

<SettingsInfoBlock type="Bool" default_value="0" />

DateTime の値を、ミリ秒に変換して（読み出し時は DateTime64(3)）書き込むのではなく、生の Unix タイムスタンプ（読み出し時は UInt32）として書き込みます。

## output_format_parquet_enum_as_byte_array \{#output_format_parquet_enum_as_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

enum を Parquet の物理型 BYTE_ARRAY および論理型 ENUM として書き出します。

## output_format_parquet_fixed_string_as_fixed_byte_array \{#output_format_parquet_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

FixedString 型カラムには、Binary ではなく Parquet の FIXED_LEN_BYTE_ARRAY 型を使用します。

## output_format_parquet_geometadata \{#output_format_parquet_geometadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

geoカラムに関する情報をParquetメタデータに書き込み、カラムをWKB形式でエンコードできるようにします。

## output_format_parquet_max_dictionary_size \{#output_format_parquet_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Dictionary のサイズがこのバイト数を超えた場合、Dictionary を使用しないエンコーディング方式に切り替えます。Dictionary エンコーディングを無効にするには、0 を設定します。

## output_format_parquet_parallel_encoding \{#output_format_parquet_parallel_encoding\}

<SettingsInfoBlock type="Bool" default_value="1" />

複数スレッドで Parquet のエンコードを実行します。`output_format_parquet_use_custom_encoder` が必要です。

## output_format_parquet_row_group_size \{#output_format_parquet_row_group_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

対象となる行グループのサイズ（行数）。

## output_format_parquet_row_group_size_bytes \{#output_format_parquet_row_group_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="536870912" />

圧縮前のターゲット行グループサイズ（バイト単位）。

## output_format_parquet_string_as_string \{#output_format_parquet_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

String 型のカラムには、Binary 型ではなく Parquet の String 型を使用します。

## output_format_parquet_use_custom_encoder \{#output_format_parquet_use_custom_encoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

より高速な Parquet エンコーダー実装を使用します。

## output_format_parquet_version \{#output_format_parquet_version\}

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

出力フォーマットで使用する Parquet フォーマットのバージョン。サポートされているバージョンは 1.0、2.4、2.6、および 2.latest（デフォルト）です。

## output_format_parquet_write_bloom_filter \{#output_format_parquet_write_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルに Bloom フィルターを書き込みます。使用するには output_format_parquet_use_custom_encoder = true である必要があります。

## output_format_parquet_write_checksums \{#output_format_parquet_write_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

CRC32 チェックサムを Parquet のページヘッダーに出力します。

## output_format_parquet_write_page_index \{#output_format_parquet_write_page_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet ファイルにカラム索引およびオフセット索引（各データページに関する統計情報で、読み取り時のフィルタープッシュダウンとして利用される場合があります）を書き込みます。

## output_format_pretty_color \{#output_format_pretty_color\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty フォーマットで ANSI エスケープシーケンスを使用します。0 - 無効、1 - 有効、'auto' - 端末上で実行されている場合に有効。

## output_format_pretty_display_footer_column_names \{#output_format_pretty_display_footer_column_names\}

<SettingsInfoBlock type="UInt64" default_value="1" />

テーブルの行数が多い場合に、フッターにカラム名を表示します。

設定可能な値:

* 0 — フッターにカラム名を表示しません。
* 1 — [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows)（デフォルトは 50）で設定された閾値以上の場合に、フッターにカラム名を表示します。

**例**

クエリ:

```sql
SELECT *, toTypeName(*) FROM (SELECT * FROM system.numbers LIMIT 1000);
```

結果：

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

[output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) 設定が有効な場合に、カラム名を含むフッターを表示するための最小行数を設定します。

## output_format_pretty_fallback_to_vertical \{#output_format_pretty_fallback_to_vertical\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効化されている場合、テーブルが横に広く行数が少ないとき、Pretty 形式は Vertical 形式と同様に出力します。
この挙動を詳細に調整するには、`output_format_pretty_fallback_to_vertical_max_rows_per_chunk` と `output_format_pretty_fallback_to_vertical_min_table_width` を参照してください。

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk \{#output_format_pretty_fallback_to_vertical_max_rows_per_chunk\}

<SettingsInfoBlock type="UInt64" default_value="10" />

chunk 内の行数が指定した値以下の場合にのみ、Vertical 形式へのフォールバック（`output_format_pretty_fallback_to_vertical` を参照）が有効になります。

## output_format_pretty_fallback_to_vertical_min_columns \{#output_format_pretty_fallback_to_vertical_min_columns\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Vertical フォーマットへのフォールバック（`output_format_pretty_fallback_to_vertical` を参照）は、カラム数が指定した値より大きい場合にのみ有効化されます。

## output_format_pretty_fallback_to_vertical_min_table_width \{#output_format_pretty_fallback_to_vertical_min_table_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

Vertical 形式へのフォールバック（`output_format_pretty_fallback_to_vertical` を参照）は、テーブル内のカラムの長さの合計が指定された値以上である場合、または少なくとも 1 つの値に改行文字が含まれている場合にのみ有効になります。

## output_format_pretty_glue_chunks \{#output_format_pretty_glue_chunks\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Pretty フォーマットでレンダリングされるデータが、複数の chunk に分かれて（間に遅延があっても）到着し、かつ次の chunk のカラム幅が前の chunk と同じである場合、ANSI エスケープシーケンスを使用して前の行に戻り、前の chunk のフッターを上書きして、新しい chunk のデータを続けて表示します。これにより、出力結果の視認性が向上します。

0 - 無効、1 - 有効、'auto' - 端末の場合に有効。

## output_format_pretty_grid_charset \{#output_format_pretty_grid_charset\}

<SettingsInfoBlock type="String" default_value="UTF-8" />

グリッド境界線を出力する際に使用する文字セットです。使用可能な文字セット: ASCII、UTF-8（デフォルト）。

## output_format_pretty_highlight_digit_groups \{#output_format_pretty_highlight_digit_groups\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定が有効で、かつ出力先がターミナルの場合、千、百万などの桁区切りに相当する各数字を下線で強調表示します。

## output_format_pretty_highlight_trailing_spaces \{#output_format_pretty_highlight_trailing_spaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

この設定が有効で、かつ出力先がターミナルの場合、行末のスペースを灰色で強調表示し、下線を付けます。

## output_format_pretty_max_column_name_width_cut_to \{#output_format_pretty_max_column_name_width_cut_to\}

<SettingsInfoBlock type="UInt64" default_value="24" />

カラム名が長すぎる場合、この長さまで切り詰めます。
カラム名の長さが `output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` の合計より長い場合に、切り詰めが行われます。

## output_format_pretty_max_column_name_width_min_chars_to_cut \{#output_format_pretty_max_column_name_width_min_chars_to_cut\}

<SettingsInfoBlock type="UInt64" default_value="4" />

カラム名が長すぎる場合に切り詰める際の最小文字数。
カラム名の長さが `output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` を合計した値より長い場合に切り詰められます。

## output_format_pretty_max_column_pad_width \{#output_format_pretty_max_column_pad_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

Pretty フォーマットにおいて、カラム内のすべての値をパディングする際の最大幅。

## output_format_pretty_max_rows \{#output_format_pretty_max_rows\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Pretty フォーマットの行数上限。

## output_format_pretty_max_value_width \{#output_format_pretty_max_value_width\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Pretty フォーマットで表示する値の幅の上限。これを超える部分は切り捨てられます。
値 0 は、決して切り捨てないことを意味します。

## output_format_pretty_max_value_width_apply_for_single_value \{#output_format_pretty_max_value_width_apply_for_single_value\}

<SettingsInfoBlock type="UInt64" default_value="0" />

ブロック内に複数の値がある場合にのみ値を切り詰めます（`output_format_pretty_max_value_width` 設定を参照）。単一の値しかない場合は切り詰めずに全体を出力します。これは `SHOW CREATE TABLE` クエリに対して便利です。

## output_format_pretty_multiline_fields \{#output_format_pretty_multiline_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効な場合、Pretty フォーマットはテーブルセル内の複数行フィールドを折り返して表示し、テーブルのレイアウトが保たれるようにします。
無効な場合は、そのまま出力されるためテーブルの体裁が崩れる可能性があります（オフのままにする利点のひとつとして、複数行の値をコピー＆ペーストしやすくなります）。

## output_format_pretty_named_tuples_as_json \{#output_format_pretty_named_tuples_as_json\}

<SettingsInfoBlock type="Bool" default_value="1" />

Pretty 形式で、名前付きタプルを整形された JSON オブジェクトとして出力するかどうかを制御します。

## output_format_pretty_row_numbers \{#output_format_pretty_row_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

Pretty 出力フォーマットでは、各行の先頭に行番号を付加します

## output_format_pretty_single_large_number_tip_threshold \{#output_format_pretty_single_large_number_tip_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

ブロックが単一の数値で構成され、その数値がこの値（0 を除く）を超える場合、テーブルの右側に読みやすい形式の数値のヒントを表示します。

## output_format_pretty_squash_consecutive_ms \{#output_format_pretty_squash_consecutive_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

次のブロックを、最大で指定されたミリ秒数だけ待機してから、書き込み前に直前のブロックにまとめます。
これにより、小さすぎるブロックが頻繁に出力されるのを防ぎつつ、データをストリーミング形式で表示できるようにします。

## output_format_pretty_squash_max_wait_ms \{#output_format_pretty_squash_max_wait_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

前回の出力から指定したミリ秒数以上経過している場合、Pretty 系フォーマットで保留中のブロックを出力します。

## output_format_protobuf_nullables_with_google_wrappers \{#output_format_protobuf_nullables_with_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

Nullable カラムを Google の wrapper 型を使ってシリアライズする際、デフォルト値を空の wrapper としてシリアライズします。オフの場合、デフォルト値と NULL 値はシリアライズされません。

## output_format_schema \{#output_format_schema\}

自動生成されたスキーマを [Cap'n Proto](/interfaces/formats/CapnProto) または [Protobuf](/interfaces/formats/Protobuf) 形式で保存するファイルのパス。

## output_format_sql_insert_include_column_names \{#output_format_sql_insert_include_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

INSERT クエリにカラム名を含める

## output_format_sql_insert_max_batch_size \{#output_format_sql_insert_max_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

1つの INSERT 文に含めることができる行数の上限。

## output_format_sql_insert_quote_names \{#output_format_sql_insert_quote_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

カラム名をバッククォート文字（`）で囲みます

## output_format_sql_insert_table_name \{#output_format_sql_insert_table_name\}

<SettingsInfoBlock type="String" default_value="table" />

出力される INSERT クエリで使用されるテーブル名

## output_format_sql_insert_use_replace \{#output_format_sql_insert_use_replace\}

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT の代わりに REPLACE 文を使用する

## output_format_tsv_crlf_end_of_line \{#output_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定した場合、TSV 形式での行末は \\n ではなく \\r\\n になります。

## output_format_values_escape_quote_with_quote \{#output_format_values_escape_quote_with_quote\}

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は ' を '' でエスケープし、それ以外の場合は \\' でクォートします。

## output_format_write_statistics \{#output_format_write_statistics\}

<SettingsInfoBlock type="Bool" default_value="1" />

適切な出力形式で、読み取った行数、バイト数、経過時間に関する統計情報を書き出します。

デフォルトで有効です

## precise_float_parsing \{#precise_float_parsing\}

<SettingsInfoBlock type="Bool" default_value="0" />

より高精度（ただし低速）の浮動小数点数解析アルゴリズムを優先的に使用する

## schema_inference_hints \{#schema_inference_hints\}

スキーマを持たないフォーマットに対するスキーマ推論で、ヒントとして使用するカラム名と型の一覧。

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
`schema_inference_hints` が正しくフォーマットされていない場合や、タイプミスや誤ったデータ型などがある場合は、`schema_inference_hints` 全体が無視されます。
:::


## schema_inference_make_columns_nullable \{#schema_inference_make_columns_nullable\}

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

スキーマ推論において推論された型を `Nullable` にするかどうかを制御します。
設定可能な値:

* 0 - 推論された型は決して `Nullable` になりません（この場合の NULL 値の扱いは input_format_null_as_default で制御します）,
 * 1 - すべての推論された型が `Nullable` になります,
 * 2 または `auto` - スキーマ推論中に解析されるサンプルで、そのカラムに `NULL` が含まれている場合、またはファイルメタデータにカラムの null 許容性に関する情報が含まれている場合にのみ、そのカラムの推論された型は `Nullable` になります,
 * 3 - フォーマットがファイルメタデータとして null 許容性を持っている場合（例: Parquet）は、そのメタデータの null 許容性に一致させ、それ以外の場合（例: CSV）は常に `Nullable` になります。

## schema_inference_make_json_columns_nullable \{#schema_inference_make_json_columns_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

スキーマ推論時に、推論された JSON 型を `Nullable` にするかどうかを制御します。
この設定が schema_inference_make_columns_nullable と同時に有効になっている場合、推論された JSON 型は `Nullable` になります。

## schema_inference_mode \{#schema_inference_mode\}

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

スキーマ推論モード。`default` - すべてのファイルが同じスキーマを持ち、任意のファイルからスキーマを推論できるとみなします。`union` - ファイルごとに異なるスキーマを持つことができ、その場合、最終的なスキーマはすべてのファイルのスキーマの和集合になります。

## show_create_query_identifier_quoting_rule \{#show_create_query_identifier_quoting_rule\}

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

SHOW CREATE クエリにおける識別子の引用ルールを設定します

## show_create_query_identifier_quoting_style \{#show_create_query_identifier_quoting_style\}

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

SHOW CREATE クエリで使用する識別子の引用スタイルを設定します

## type_json_allow_duplicated_key_with_literal_and_nested_object \{#type_json_allow_duplicated_key_with_literal_and_nested_object\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、`{"a" : 42, "a" : {"b" : 42}}` のように同じキーが重複しており、その一方がネストされたオブジェクトである JSON もパースが許可されます。

## type_json_skip_duplicated_paths \{#type_json_skip_duplicated_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、JSON オブジェクトを JSON 型にパースする際に、重複したパスは無視され、例外をスローする代わりに最初に出現したものだけが挿入されます。

## type_json_skip_invalid_typed_paths \{#type_json_skip_invalid_typed_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、型付きパスを持つ JSON 型カラム内で、宣言された型に強制変換できない値を持つフィールドはエラーを発生させる代わりにスキップされます。スキップされたフィールドは欠損として扱われ、型付きパスの定義に基づいてデフォルト値 / null 値が使用されます。

この設定は、特定のパスに対して型が宣言されている JSON 型カラム（例: JSON(a Int64, b String)）にのみ適用されます。通常の型付きカラムに挿入する際の JSONEachRow など、通常の JSON 入力フォーマットには適用されません。

可能な値:

+ 0 — 無効（型不一致時にエラーを発生させる）。
+ 1 — 有効（型不一致時にフィールドをスキップする）。

## type_json_use_partial_match_to_skip_paths_by_regexp \{#type_json_use_partial_match_to_skip_paths_by_regexp\}

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、JSON オブジェクトを JSON 型にパースする際に、`SKIP REGEXP` で指定された正規表現は、パスをスキップするために部分一致していればよいものとして扱われます。無効にすると、完全一致が必要になります。

## validate_experimental_and_suspicious_types_inside_nested_types \{#validate_experimental_and_suspicious_types_inside_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

Array/Map/Tuple などのネストされた型内での、experimental および suspicious な型の使用を検証します。