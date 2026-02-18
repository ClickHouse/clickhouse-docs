---
title: '포맷 설정'
sidebar_label: '포맷 설정'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: '입력 및 출력 포맷을 제어하는 설정.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 자동으로 생성됨 */ }

이 설정들은 [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h)에서 자동으로 생성됩니다.


## allow_special_bool_values_inside_variant \{#allow_special_bool_values_inside_variant\}

<SettingsInfoBlock type="Bool" default_value="0" />

Variant 타입 내에서 "on", "off", "enable", "disable" 등의 특수 텍스트 bool 값을 Bool 값으로 해석해 파싱할 수 있도록 허용합니다.

## bool_false_representation \{#bool_false_representation\}

<SettingsInfoBlock type="String" default_value="false" />

TSV/CSV/Vertical/Pretty 포맷에서 bool 유형의 false 값을 표현하는 데 사용하는 텍스트입니다.

## bool_true_representation \{#bool_true_representation\}

<SettingsInfoBlock type="String" default_value="true" />

TSV/CSV/Vertical/Pretty 포맷에서 bool 타입의 `true` 값을 표현하는 텍스트입니다.

## check_conversion_from_numbers_to_enum \{#check_conversion_from_numbers_to_enum\}

<SettingsInfoBlock type="Bool" default_value="1" />

Numbers에서 Enum으로 값을 변환할 때, 해당 값이 Enum에 존재하지 않으면 예외를 발생시킵니다.

가능한 값:

* 0 — 비활성화.
* 1 — 활성화.

**예시**

```text
CREATE TABLE tab (
  val Enum('first' = 1, 'second' = 2, 'third' = 3)
) ENGINE = Memory;

INSERT INTO tab SETTINGS check_conversion_from_numbers_to_enum = 1 VALUES (4); -- returns an error
```


## column_names_for_schema_inference \{#column_names_for_schema_inference\}

컬럼 이름이 없는 형식의 스키마 추론에 사용할 컬럼 이름 목록입니다. 형식은 'column1,column2,column3,...'입니다.

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands \{#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands\}

<SettingsInfoBlock type="Bool" default_value="0" />

datetime64 값의 뒤에 붙은 0을 동적으로 잘라내어 출력 정밀도를 [0, 3, 6]으로 조정합니다.
각각 「초」, 「밀리초」, 「마이크로초」에 해당합니다

## date_time_input_format \{#date_time_input_format\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

날짜와 시간의 텍스트 표현을 해석하는 파서를 선택합니다.

이 설정은 [날짜 및 시간 함수](../../sql-reference/functions/date-time-functions.md)에는 적용되지 않습니다.

가능한 값:

- `'best_effort'` — 확장 파싱을 활성화합니다.

    ClickHouse는 기본 형식인 `YYYY-MM-DD HH:MM:SS`와 모든 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 날짜 및 시간 형식을 파싱할 수 있습니다. 예: `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — `best_effort`와 유사합니다(차이점은 [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS) 참조).

- `'basic'` — 기본 파서를 사용합니다.

    ClickHouse는 기본 형식인 `YYYY-MM-DD HH:MM:SS` 또는 `YYYY-MM-DD`만 파싱할 수 있습니다. 예: `2019-08-20 10:18:56` 또는 `2019-08-20`.

Cloud 기본값: `'best_effort'`.

함께 보기:

- [DateTime 데이터 타입.](../../sql-reference/data-types/datetime.md)
- [날짜 및 시간 처리 함수.](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format \{#date_time_output_format\}

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

날짜와 시간의 텍스트 표현에 대해 서로 다른 출력 형식을 선택할 수 있습니다.

가능한 값:

- `simple` - 단순 출력 형식.

    ClickHouse는 날짜와 시간을 `YYYY-MM-DD hh:mm:ss` 형식으로 출력합니다. 예를 들어 `2019-08-20 10:18:56`과 같습니다. 계산은 데이터 타입의 시간대(존재하는 경우) 또는 서버 시간대를 기준으로 수행됩니다.

- `iso` - ISO 출력 형식.

    ClickHouse는 날짜와 시간을 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ` 형식으로 출력합니다. 예를 들어 `2019-08-20T10:18:56Z`와 같습니다. 출력은 UTC입니다(`Z`는 UTC를 의미합니다).

- `unix_timestamp` - Unix 타임스탬프 출력 형식.

    ClickHouse는 날짜와 시간을 [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time) 형식으로 출력합니다. 예를 들어 `1566285536`과 같습니다.

함께 보기:

- [DateTime 데이터 타입.](../../sql-reference/data-types/datetime.md)
- [날짜와 시간 관련 함수.](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior \{#date_time_overflow_behavior\}

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md) 또는 정수를 Date, Date32, DateTime 또는 DateTime64로 변환할 때, 결과 타입으로 표현할 수 없는 값이 되는 경우의 동작을 정의합니다.

가능한 값:

- `ignore` — 오버플로를 조용히 무시합니다. 결과는 정의되지 않습니다.
- `throw` — 오버플로 발생 시 예외를 발생시킵니다.
- `saturate` — 결과를 포화(saturate)시킵니다. 값이 대상 타입이 표현할 수 있는 최솟값보다 작은 경우 결과는 표현 가능한 최솟값으로 선택됩니다. 값이 대상 타입이 표현할 수 있는 최댓값보다 큰 경우 결과는 표현 가능한 최댓값으로 선택됩니다.

기본값: `ignore`.

## errors_output_format \{#errors_output_format\}

<SettingsInfoBlock type="String" default_value="CSV" />

오류를 텍스트 출력으로 기록하는 방법입니다.

## format_avro_schema_registry_url \{#format_avro_schema_registry_url\}

AvroConfluent 포맷에 사용되는 Confluent Schema Registry URL입니다.

## format_binary_max_array_size \{#format_binary_max_array_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

RowBinary 포맷에서 Array에 허용되는 최대 크기입니다. 손상된 데이터로 인해 과도한 메모리가 할당되는 것을 방지합니다. 0으로 설정하면 제한이 없음을 의미합니다.

## format_binary_max_object_size \{#format_binary_max_object_size\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100000"},{"label": "JSON 타입 이진 역직렬화 중 객체의 최대 크기를 제한하는 새로운 설정"}]}]}/>

JSON 타입 RowBinary 포맷에서 단일 Object에 허용되는 최대 경로 수입니다. 손상된 데이터로 인해 대량의 메모리가 할당되는 것을 방지합니다. 0으로 설정하면 제한이 없습니다.

## format_binary_max_string_size \{#format_binary_max_string_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1073741824"},{"label": "Prevent allocating large amount of memory"}]}]}/>

RowBinary 포맷에서 `String` 값에 허용되는 최대 크기입니다. 손상된 데이터로 인해 메모리가 과도하게 할당되는 것을 방지합니다. 0이면 제한이 없음을 의미합니다.

## format_capn_proto_enum_comparising_mode \{#format_capn_proto_enum_comparising_mode\}

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

ClickHouse Enum과 CapnProto Enum 간 매핑 방법

## format_capn_proto_max_message_size \{#format_capn_proto_max_message_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1073741824"},{"label": "Prevent allocating large amount of memory"}]}]}/>

단일 CapnProto 메시지의 최대 허용 크기를 바이트 단위로 지정합니다. 잘못된 형식이거나 손상된 데이터로 인해 과도한 메모리 할당이 발생하는 것을 방지합니다. 기본값은 1 GiB입니다.

## format_capn_proto_use_autogenerated_schema \{#format_capn_proto_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema가 설정되지 않은 경우 자동으로 생성된 CapnProto 스키마를 사용합니다

## format_csv_allow_double_quotes \{#format_csv_allow_double_quotes\}

<SettingsInfoBlock type="Bool" default_value="1" />

true로 설정하면 큰따옴표로 둘러싸인 문자열을 허용합니다.

## format_csv_allow_single_quotes \{#format_csv_allow_single_quotes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "0"},{"label": "대부분의 도구는 CSV에서 작은따옴표를 별도로 취급하지 않으므로, 이 설정도 기본적으로 그렇게 처리하지 않습니다"}]}]}/>

값을 true로 설정하면 작은따옴표로 감싼 문자열을 허용합니다.

## format_csv_delimiter \{#format_csv_delimiter\}

<SettingsInfoBlock type="Char" default_value="," />

CSV 데이터에서 구분자 역할을 할 문자를 지정합니다. 문자열로 설정하는 경우 문자열의 길이는 1이어야 합니다.

## format_csv_null_representation \{#format_csv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

CSV 포맷에서 NULL의 사용자 정의 표현

## format_custom_escaping_rule \{#format_custom_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

필드 이스케이프 규칙(CustomSeparated 형식용)

## format_custom_field_delimiter \{#format_custom_field_delimiter\}

<SettingsInfoBlock type="String" default_value="	" />

필드 간 구분자(CustomSeparated 포맷용)

## format_custom_result_after_delimiter \{#format_custom_result_after_delimiter\}

결과 집합 뒤에 붙는 접미사 (`CustomSeparated` 포맷용)

## format_custom_result_before_delimiter \{#format_custom_result_before_delimiter\}

결과 집합 앞에 추가되는 접두사(CustomSeparated 포맷용)

## format_custom_row_after_delimiter \{#format_custom_row_after_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

마지막 컬럼 필드 뒤에 오는 구분자(CustomSeparated 형식용)

## format_custom_row_before_delimiter \{#format_custom_row_before_delimiter\}

첫 번째 컬럼의 필드 앞에 오는 구분자(CustomSeparated 포맷용)

## format_custom_row_between_delimiter \{#format_custom_row_between_delimiter\}

행 간 구분자(CustomSeparated 형식용)

## format_display_secrets_in_show_and_select \{#format_display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

테이블, 데이터베이스, 테이블 함수, 딕셔너리에서 `SHOW` 및 `SELECT` 쿼리에 비밀값을 표시할지 여부를 활성화하거나 비활성화합니다.

비밀값을 보려는 사용자는
[`display_secrets_in_show_and_select` 서버 설정](../server-configuration-parameters/settings#display_secrets_in_show_and_select)을
켜 두어야 하며,
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) 권한을 보유해야 합니다.

가능한 값은 다음과 같습니다.

-   0 — 비활성화.
-   1 — 활성화.

## format_json_object_each_row_column_for_object_name \{#format_json_object_each_row_column_for_object_name\}

[JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow) 포맷에서 객체 이름을 저장하거나 쓰는 데 사용되는 컬럼의 이름입니다.
컬럼 타입은 String이어야 합니다. 값이 비어 있으면 객체 이름으로 기본 이름 `row_{i}`가 사용됩니다.

## format_protobuf_use_autogenerated_schema \{#format_protobuf_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

format_schema가 설정되지 않았을 때 자동으로 생성된 Protobuf를 사용합니다.

## format_regexp \{#format_regexp\}

정규 표현식(Regexp 포맷용)

## format_regexp_escaping_rule \{#format_regexp_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.10"},{"label": "Raw"},{"label": "Regexp 형식의 기본 이스케이프 규칙으로 Raw를 사용하여 동작이 사용자가 기대하는 방식에 더 가깝도록 합니다"}]}]}/>

필드 이스케이프 규칙(Regexp 형식용)

## format_regexp_skip_unmatched \{#format_regexp_skip_unmatched\}

<SettingsInfoBlock type="Bool" default_value="0" />

정규 표현식과 일치하지 않는 행을 건너뜁니다(Regexp 형식용)

## format_schema \{#format_schema\}

이 매개변수는 [Cap'n Proto](https://capnproto.org/) 또는 [Protobuf](https://developers.google.com/protocol-buffers/)처럼 스키마 정의가 필요한 포맷을 사용할 때 유용합니다. 값은 사용하는 포맷에 따라 달라집니다.

## format_schema_message_name \{#format_schema_message_name\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "새 설정"}]}]}/>

`format_schema`에 정의된 스키마에서 필요한 메시지 이름을 정의합니다.
레거시 format_schema 형식(`file_name:message_name`)과의 호환성을 유지하기 위해 다음 규칙이 적용됩니다.

- `format_schema_message_name`이 지정되지 않은 경우, 레거시 `format_schema` 값의 `message_name` 부분에서 메시지 이름이 자동으로 추론됩니다.
- 레거시 형식을 사용하는 경우 `format_schema_message_name`을 지정하면 오류가 발생합니다.

## format_schema_source \{#format_schema_source\}

<SettingsInfoBlock type="String" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "file"},{"label": "새 설정"}]}]}/>

`format_schema`의 소스를 정의합니다.
가능한 값:

- 'file' (기본값): `format_schema`는 `format_schemas` 디렉토리에 위치한 스키마 파일의 이름입니다.
- 'string': `format_schema`는 스키마의 리터럴 내용입니다.
- 'query': `format_schema`는 스키마를 조회하기 위한 쿼리입니다.

`format_schema_source`가 'query'로 설정된 경우, 다음 조건이 적용됩니다:
- 쿼리는 정확히 하나의 값, 즉 하나의 문자열 컬럼을 가진 단일 행만 반환해야 합니다.
- 쿼리 결과는 스키마 내용으로 취급됩니다.
- 이 결과는 `format_schemas` 디렉토리에 로컬로 캐시됩니다.
- `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files` 명령을 사용하여 로컬 캐시를 비울 수 있습니다.
- 한 번 캐시되면, 캐시를 명시적으로 삭제하지 않는 한 동일한 쿼리는 스키마를 다시 가져오기 위해 실행되지 않습니다.
- 로컬 캐시 파일 외에도 Protobuf 메시지는 메모리에도 캐시됩니다. 로컬 캐시 파일을 삭제한 후에도 스키마를 완전히 새로 고치려면 `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]`를 사용하여 메모리 캐시를 삭제해야 합니다.
- 캐시 파일과 Protobuf 메시지 스키마에 대한 캐시를 한 번에 모두 삭제하려면 `SYSTEM DROP FORMAT SCHEMA CACHE` 쿼리를 실행합니다.

## format_template_resultset \{#format_template_resultset\}

결과 집합의 포맷 문자열이 포함된 파일 경로입니다 (Template 포맷용).

## format_template_resultset_format \{#format_template_resultset_format\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": ""},{"label": "Template 결과 집합 형식 문자열을 쿼리에서 설정할 수 있습니다"}]}]}/>

결과 집합에 대한 형식 문자열(Template 형식용)

## format_template_row \{#format_template_row\}

행에 대한 형식 문자열(Template 포맷용)을 포함하는 파일의 경로

## format_template_row_format \{#format_template_row_format\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": ""},{"label": "Template 행 형식 문자열은 쿼리에서 직접 설정할 수 있습니다"}]}]}/>

행에 대한 형식 문자열(Template 형식용)

## format_template_rows_between_delimiter \{#format_template_rows_between_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

행 사이의 구분자(Template 형식용)

## format_tsv_null_representation \{#format_tsv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

TSV 형식에서 NULL을 나타낼 사용자 정의 표현입니다.

## input_format_allow_errors_num \{#input_format_allow_errors_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

텍스트 포맷(CSV, TSV 등)에서 데이터를 읽을 때 허용되는 최대 오류 개수를 설정합니다.

기본값은 0입니다.

항상 `input_format_allow_errors_ratio`와 함께 사용하십시오.

행을 읽는 동안 오류가 발생했지만 오류 카운터가 아직 `input_format_allow_errors_num` 미만인 경우, ClickHouse는 해당 행을 무시하고 다음 행으로 넘어갑니다.

`input_format_allow_errors_num`과 `input_format_allow_errors_ratio`가 모두 초과되면 ClickHouse는 예외를 발생시킵니다.

## input_format_allow_errors_ratio \{#input_format_allow_errors_ratio\}

<SettingsInfoBlock type="Float" default_value="0" />

텍스트 형식(CSV, TSV 등)을 읽을 때 허용되는 최대 오류 비율을 설정합니다.  
오류 비율은 0과 1 사이의 부동 소수점 숫자로 설정합니다.

기본값은 0입니다.

항상 `input_format_allow_errors_num`과 함께 사용하십시오.

행을 읽는 동안 오류가 발생했지만, 오류 개수가 아직 `input_format_allow_errors_num` 및 `input_format_allow_errors_ratio`로 설정한 한도를 넘지 않으면 ClickHouse는 해당 행을 무시하고 다음 행으로 진행합니다.

`input_format_allow_errors_num`과 `input_format_allow_errors_ratio`에서 설정한 한도가 모두 초과되면 ClickHouse는 예외를 발생시킵니다.

## input_format_allow_seeks \{#input_format_allow_seeks\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC/Parquet/Arrow 입력 형식을 읽을 때 seek를 허용합니다.

기본적으로 사용하도록 설정되어 있습니다.

## input_format_arrow_allow_missing_columns \{#input_format_arrow_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "1"},{"label": "기본적으로 Arrow 파일에서 누락된 컬럼 허용"}]}]}/>

Arrow 입력 형식을 읽을 때 누락된 컬럼을 허용합니다

## input_format_arrow_case_insensitive_column_matching \{#input_format_arrow_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow 컬럼을 ClickHouse 컬럼과 매칭할 때 대소문자를 구분하지 않습니다.

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Arrow 포맷에서 스키마 추론을 수행할 때 지원되지 않는 타입의 컬럼을 건너뜁니다.

## input_format_avro_allow_missing_fields \{#input_format_avro_allow_missing_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent 형식에서 필드를 스키마에서 찾을 수 없으면 오류 대신 기본값을 사용합니다.

## input_format_avro_null_as_default \{#input_format_avro_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

Avro/AvroConfluent 형식의 경우: null 값이면서 널 허용이 아닌 열에 대해 기본값을 삽입합니다.

## input_format_binary_decode_types_in_binary_format \{#input_format_binary_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "RowBinaryWithNamesAndTypes 입력 포맷에서 타입 이름을 바이너리 형식으로 읽을 수 있도록 하는 새로운 설정이 추가되었습니다"}]}]}/>

RowBinaryWithNamesAndTypes 입력 포맷에서 타입 이름 대신 데이터 타입 정보를 바이너리 형식으로 읽습니다

## input_format_binary_max_type_complexity \{#input_format_binary_max_type_complexity\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1000"},{"label": "바이너리 타입을 디코딩할 때 타입 노드의 최대 개수를 제어하기 위한 새로운 설정입니다. 악의적인 입력으로부터 보호합니다."}]}]}/>

바이너리 타입을 디코딩할 때 허용되는 타입 노드의 최대 개수(깊이가 아니라 전체 개수)입니다. `Map(String, UInt32)` = 3개의 노드로 계산됩니다. 악의적인 입력으로부터 보호합니다. 0 = 무제한입니다.

## input_format_binary_read_json_as_string \{#input_format_binary_read_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "RowBinary 입력 포맷에서 JSON 타입 값을 JSON 문자열로 읽을 수 있는 새 설정 추가"}]}]}/>

RowBinary 입력 포맷에서 [JSON](../../sql-reference/data-types/newjson.md) 데이터 타입의 값을 JSON [String](../../sql-reference/data-types/string.md) 값으로 읽습니다.

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

BSON 포맷에 대해 스키마 추론 시 지원되지 않는 타입의 필드를 건너뜁니다.

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

CapnProto 포맷에 대해 스키마 추론(schema inference)을 수행할 때 지원되지 않는 타입의 컬럼은 건너뜁니다

## input_format_csv_allow_cr_end_of_line \{#input_format_csv_allow_cr_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 값을 true로 설정하면 줄 끝에 \\r이 단독으로 오는 것을 허용합니다 

## input_format_csv_allow_variable_number_of_columns \{#input_format_csv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 입력에서 추가 컬럼(파일에 예상보다 많은 컬럼이 있는 경우)은 무시하고, CSV 입력에서 누락된 필드는 기본값으로 간주합니다

## input_format_csv_allow_whitespace_or_tab_as_delimiter \{#input_format_csv_allow_whitespace_or_tab_as_delimiter\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 문자열에서 공백과 탭(\\t)을 필드 구분자로 사용할 수 있도록 허용합니다.

## input_format_csv_arrays_as_nested_csv \{#input_format_csv_arrays_as_nested_csv\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV에서 Array를 읽을 때, 해당 Array의 요소들이 중첩된 CSV 형식으로 직렬화된 다음 문자열로 들어가 있다고 가정합니다. 예: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\". Array를 둘러싼 대괄호는 생략할 수 있습니다.

## input_format_csv_deserialize_separate_columns_into_tuple \{#input_format_csv_deserialize_separate_columns_into_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "CSV 형식에서 튜플을 해석하는 새로운 방식이 추가되었습니다."}]}, {"id": "row-2","items": [{"label": "24.3"},{"label": "1"},{"label": "CSV 형식에서 튜플을 해석하는 새로운 방식이 추가되었습니다."}]}]}/>

true로 설정하면 CSV 형식으로 기록된 개별 컬럼들을 Tuple 컬럼으로 디시리얼라이즈할 수 있습니다.

## input_format_csv_detect_header \{#input_format_csv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "기본적으로 CSV 형식에서 헤더를 자동으로 감지합니다"}]}]}/>

CSV 형식에서 열 이름과 데이터 타입이 포함된 헤더를 자동으로 감지합니다

## input_format_csv_empty_as_default \{#input_format_csv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 입력에서 빈 필드를 기본값으로 처리합니다.

## input_format_csv_enum_as_number \{#input_format_csv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 형식에서 삽입되는 enum 값을 enum 인덱스로 취급합니다

## input_format_csv_skip_first_lines \{#input_format_csv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

CSV 형식의 데이터에서 시작 부분의 지정된 줄 수를 건너뜁니다.

## input_format_csv_skip_trailing_empty_lines \{#input_format_csv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 형식에서 마지막 부분의 빈 줄을 건너뜁니다

## input_format_csv_trim_whitespaces \{#input_format_csv_trim_whitespaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 문자열 앞뒤에 있는 공백 및 탭(\\t) 문자를 제거합니다.

## input_format_csv_try_infer_numbers_from_strings \{#input_format_csv_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

설정이 활성화되면 스키마 추론 과정에서 ClickHouse가 문자열 필드에서 숫자 값을 추론하려고 시도합니다.
CSV 데이터에 따옴표로 둘러싸인 UInt64 숫자가 포함되어 있는 경우에 유용합니다.

기본값은 비활성화입니다.

## input_format_csv_try_infer_strings_from_quoted_tuples \{#input_format_csv_try_infer_strings_from_quoted_tuples\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "CSV 형식에서 튜플을 해석하는 새로운 방식이 추가되었습니다."}]}, {"id": "row-2","items": [{"label": "24.3"},{"label": "1"},{"label": "CSV 형식에서 튜플을 해석하는 새로운 방식이 추가되었습니다."}]}]}/>

입력 데이터에서 따옴표로 둘러싸인 튜플을 String 타입의 값으로 해석합니다.

## input_format_csv_use_best_effort_in_schema_inference \{#input_format_csv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

CSV 형식에서 스키마를 추론할 때 몇 가지 조정과 휴리스틱을 사용합니다

## input_format_csv_use_default_on_bad_values \{#input_format_csv_use_default_on_bad_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

CSV 필드의 값이 잘못되어 역직렬화에 실패한 경우, 해당 컬럼에 기본값을 사용하도록 허용합니다.

## input_format_custom_allow_variable_number_of_columns \{#input_format_custom_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 입력에서 파일에 예상보다 더 많은 컬럼이 있는 경우 초과 컬럼을 무시하고, 누락된 필드는 기본값으로 처리합니다

## input_format_custom_detect_header \{#input_format_custom_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "Detect header in CustomSeparated format by default"}]}]}/>

CustomSeparated 포맷에서 이름과 타입이 포함된 헤더를 자동으로 감지합니다

## input_format_custom_skip_trailing_empty_lines \{#input_format_custom_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

CustomSeparated 형식에서 후행 빈 줄을 건너뜁니다

## input_format_defaults_for_omitted_fields \{#input_format_defaults_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.12"},{"label": "1"},{"label": "일부 입력 포맷에서 생략된 필드에 대해 복잡한 기본값 표현식의 계산을 활성화합니다. 이는 기대되는 동작입니다"}]}]}/>

`INSERT` 쿼리를 수행할 때 생략된 입력 컬럼 값은 해당 컬럼의 기본값으로 대체됩니다. 이 옵션은 [JSONEachRow](/interfaces/formats/JSONEachRow) (및 기타 JSON 포맷), [CSV](/interfaces/formats/CSV), [TabSeparated](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [Parquet](/interfaces/formats/Parquet), [Arrow](/interfaces/formats/Arrow), [Avro](/interfaces/formats/Avro), [ORC](/interfaces/formats/ORC), [Native](/interfaces/formats/Native) 포맷과 `WithNames`/`WithNamesAndTypes` 접미사가 있는 포맷에 적용됩니다.

:::note
이 옵션이 활성화되면 확장된 테이블 메타데이터가 서버에서 클라이언트로 전송됩니다. 서버에서 추가적인 연산 리소스를 사용하므로 성능이 저하될 수 있습니다.
:::

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## input_format_force_null_for_omitted_fields \{#input_format_force_null_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "필요 시 생략된 필드의 타입 기본값 비활성화"}]}]}/>

생략된 필드를 null 값으로 강제로 초기화합니다

## input_format_hive_text_allow_variable_number_of_columns \{#input_format_hive_text_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Hive Text 입력에서 파일에 예상보다 컬럼이 더 많은 경우 초과 컬럼을 무시하고 누락된 필드는 기본값으로 처리합니다."}]}]}/>

Hive Text 입력에서 파일에 예상보다 컬럼이 더 많은 경우 초과 컬럼을 무시하고 누락된 필드는 기본값으로 처리합니다

## input_format_hive_text_collection_items_delimiter \{#input_format_hive_text_collection_items_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File에서 컬렉션(array 또는 맵)의 각 항목 사이에 사용하는 구분자입니다.

## input_format_hive_text_fields_delimiter \{#input_format_hive_text_fields_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File에서 필드 간에 사용되는 구분자

## input_format_hive_text_map_keys_delimiter \{#input_format_hive_text_map_keys_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Hive Text File에서 맵 키/값 쌍 사이에 사용하는 구분자입니다.

## input_format_import_nested_json \{#input_format_import_nested_json\}

<SettingsInfoBlock type="Bool" default_value="0" />

중첩 객체를 포함하는 JSON 데이터의 삽입을 허용할지 여부를 설정합니다.

지원되는 형식:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

참고:

- `JSONEachRow` 형식에서 [중첩 구조 사용법](/integrations/data-formats/json/other-formats#accessing-nested-json-objects).

## input_format_ipv4_default_on_conversion_error \{#input_format_ipv4_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

IPv4 역직렬화 시 변환 오류가 발생해도 예외를 발생시키지 않고 기본값을 사용합니다.

기본적으로 비활성화되어 있습니다.

## input_format_ipv6_default_on_conversion_error \{#input_format_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

IPv6 역직렬화할 때 변환 오류가 발생하면 예외를 발생시키는 대신 기본값을 사용합니다.

기본적으로 비활성화되어 있습니다.

## input_format_json_compact_allow_variable_number_of_columns \{#input_format_json_compact_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSONCompact/JSONCompactEachRow 입력 포맷에서 행의 컬럼 수가 가변적인 것을 허용합니다.
예상보다 컬럼이 더 많은 행에서는 추가 컬럼을 무시하고, 누락된 컬럼은 기본값으로 처리합니다.

기본적으로 비활성화되어 있습니다.

## input_format_json_defaults_for_missing_elements_in_named_tuple \{#input_format_json_defaults_for_missing_elements_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "기본적으로 named tuple을 읽을 때 JSON 객체에서 누락된 요소를 허용합니다"}]}]}/>

named tuple을 파싱할 때 JSON 객체에서 누락된 요소에는 기본값을 삽입합니다.  
이 설정은 `input_format_json_named_tuples_as_objects` 설정이 활성화된 경우에만 동작합니다.

기본적으로 활성화되어 있습니다.

## input_format_json_empty_as_default \{#input_format_json_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "JSON 입력에서 빈 필드를 기본값으로 처리할 수 있도록 하는 새 설정이 추가되었습니다."}]}]}/>

설정을 활성화하면 JSON에서 비어 있는 입력 필드를 기본값으로 대체합니다. 복잡한 기본값 표현식을 사용하는 경우 `input_format_defaults_for_omitted_fields`도 함께 활성화해야 합니다.

가능한 값:

+ 0 — 비활성화.
+ 1 — 활성화.

## input_format_json_ignore_unknown_keys_in_named_tuple \{#input_format_json_ignore_unknown_keys_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "named tuple로 JSON 객체를 파싱하는 방식 개선"}]}]}/>

named tuple로 JSON 객체를 파싱할 때 알 수 없는 키를 무시합니다.

기본적으로 활성화되어 있습니다.

## input_format_json_ignore_unnecessary_fields \{#input_format_json_ignore_unnecessary_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "불필요한 필드를 무시하고 파싱하지 않습니다. 이를 활성화하면 형식이 잘못되었거나 필드가 중복된 JSON 문자열에 대해 예외가 발생하지 않을 수도 있습니다"}]}]}/>

불필요한 필드를 무시하고 파싱하지 않습니다. 이를 활성화하면 형식이 잘못되었거나 필드가 중복된 JSON 문자열에 대해 예외가 발생하지 않을 수도 있습니다

## input_format_json_infer_array_of_dynamic_from_array_of_different_types \{#input_format_json_infer_array_of_dynamic_from_array_of_different_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "기본적으로 서로 다른 값 유형을 가진 JSON 배열에 Array(Dynamic) 타입을 사용하여 추론합니다"}]}]} />

활성화되면 스키마 추론 시 ClickHouse는 서로 다른 데이터 타입의 값을 포함하는 JSON 배열에 Array(Dynamic) 타입을 사용합니다.

예시:

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

기본적으로 활성화되어 있습니다.


## input_format_json_infer_incomplete_types_as_strings \{#input_format_json_infer_incomplete_types_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "기본적으로 JSON 포맷에서 불완전한 타입을 String으로 추론하도록 허용"}]}]} />

스키마 추론 동안 데이터 샘플에서 `Null`/`{}`/`[]`만 포함하는 JSON 키에 대해 String 타입을 사용할 수 있도록 허용합니다.
JSON 포맷에서는 모든 값을 String으로 읽을 수 있으므로, 타입을 알 수 없는 키에 String 타입을 사용하면
스키마 추론 중에 `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`와 같은 오류를 피할 수 있습니다.

예시:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

결과:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

기본적으로 사용하도록 설정되어 있습니다.


## input_format_json_map_as_array_of_tuples \{#input_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

맵 컬럼을 튜플의 JSON 배열로 역직렬화합니다.

기본적으로 비활성화되어 있습니다.

## input_format_json_max_depth \{#input_format_json_max_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1000"},{"label": "이전 버전에서는 제한이 없었으나, 이는 안전하지 않았습니다."}]}]}/>

JSON에서 필드의 최대 중첩 깊이입니다. 엄격한 한도가 아니므로, 정확하게 적용할 필요는 없습니다.

## input_format_json_named_tuples_as_objects \{#input_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

이름이 지정된 튜플 컬럼을 JSON 객체로 파싱합니다.

기본적으로 사용하도록 설정되어 있습니다.

## input_format_json_read_arrays_as_strings \{#input_format_json_read_arrays_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "기본적으로 JSON 포맷에서 배열을 문자열로 읽는 것을 허용"}]}]} />

JSON 입력 포맷에서 JSON 배열을 문자열로 파싱하도록 허용합니다.

예:

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```

결과:

```
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```

기본적으로 활성화되어 있습니다.


## input_format_json_read_bools_as_numbers \{#input_format_json_read_bools_as_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 입력 형식에서 bool 값을 숫자로 해석하도록 허용합니다.

기본적으로 활성화됩니다.

## input_format_json_read_bools_as_strings \{#input_format_json_read_bools_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "기본적으로 JSON 형식에서 bool 값을 문자열로 읽는 것을 허용"}]}]}/>

JSON 입력 형식에서 bool 값을 문자열로 파싱하도록 허용합니다.

기본적으로 활성화되어 있습니다.

## input_format_json_read_numbers_as_strings \{#input_format_json_read_numbers_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "기본적으로 JSON 형식에서 숫자를 문자열로 읽도록 허용"}]}]}/>

JSON 입력 형식에서 숫자를 문자열로 파싱하도록 허용합니다.

기본적으로 활성화되어 있습니다.

## input_format_json_read_objects_as_strings \{#input_format_json_read_objects_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "Object 타입이 실험 단계인 동안 중첩 JSON 객체를 문자열로 읽도록 활성화합니다"}]}]} />

JSON 입력 포맷에서 JSON 객체를 문자열로 파싱할 수 있도록 허용합니다.

예:

```sql
SET input_format_json_read_objects_as_strings = 1;
CREATE TABLE test (id UInt64, obj String, date Date) ENGINE=Memory();
INSERT INTO test FORMAT JSONEachRow {"id" : 1, "obj" : {"a" : 1, "b" : "Hello"}, "date" : "2020-01-01"};
SELECT * FROM test;
```

결과:

```
┌─id─┬─obj──────────────────────┬───────date─┐
│  1 │ {"a" : 1, "b" : "Hello"} │ 2020-01-01 │
└────┴──────────────────────────┴────────────┘
```

기본적으로 사용하도록 설정되어 있습니다.


## input_format_json_throw_on_bad_escape_sequence \{#input_format_json_throw_on_bad_escape_sequence\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Allow to save JSON strings with bad escape sequences"}]}]}/>

JSON 입력 형식에서 JSON 문자열에 잘못된 이스케이프 시퀀스가 포함되어 있으면 예외를 발생시킵니다. 비활성화하면 잘못된 이스케이프 시퀀스는 데이터에 그대로 남습니다.

기본적으로 활성화되어 있습니다.

## input_format_json_try_infer_named_tuples_from_objects \{#input_format_json_try_infer_named_tuples_from_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "기본적으로 JSON 객체에서 named Tuple을 추론하도록 시도"}]}]} />

사용하도록 설정하면, 스키마 추론(schema inference) 중에 ClickHouse는 JSON 객체에서 이름 튜플(named Tuple)을 추론하려고 시도합니다.
생성된 이름 튜플에는 샘플 데이터의 해당 JSON 객체들에 포함된 모든 요소가 포함됩니다.

예:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

결과:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

기본적으로 활성화되어 있습니다.


## input_format_json_try_infer_numbers_from_strings \{#input_format_json_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "0"},{"label": "기본적으로 JSON 형식에서 문자열을 숫자로 추론하지 않도록 하여 잠재적인 파싱 오류를 방지합니다"}]}]}/>

활성화하면 스키마 추론(schema inference) 중에 ClickHouse가 문자열 필드에서 숫자를 추론하려고 시도합니다.
이는 JSON 데이터에 따옴표로 둘러싸인 UInt64 숫자가 포함된 경우에 유용할 수 있습니다.

기본적으로 비활성화되어 있습니다.

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects \{#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "JSON 객체에서 named tuple을 추론할 때 모호한 경로에 대해 String 타입 사용 허용"}]}]}/>

JSON 객체에서 named tuple을 추론할 때 경로가 모호한 경우 예외를 발생시키는 대신 String 타입을 사용합니다

## input_format_json_validate_types_from_metadata \{#input_format_json_validate_types_from_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON/JSONCompact/JSONColumnsWithMetadata 입력 포맷에서 이 설정이 1이면,
입력 데이터 메타데이터의 데이터 타입을 테이블의 해당 컬럼 데이터 타입과 비교합니다.

기본적으로 활성화되어 있습니다.

## input_format_max_block_size_bytes \{#input_format_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "입력 포맷에서 생성되는 블록의 크기를 바이트 단위로 제한하는 새로운 설정"}]}]}/>

입력 포맷에서 데이터를 파싱할 때 형성되는 블록의 크기를 바이트 단위로 제한합니다. 블록이 ClickHouse 측에서 생성되는 행 기반 입력 포맷에서 사용됩니다.
0은 바이트 단위 크기에 제한이 없음을 의미합니다.

## input_format_max_bytes_to_read_for_schema_inference \{#input_format_max_bytes_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

자동 스키마 추론을 위해 읽을 데이터의 최대 바이트 수입니다.

## input_format_max_rows_to_read_for_schema_inference \{#input_format_max_rows_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="25000" />

자동 스키마 추론 시 읽을 최대 데이터 행 수입니다.

## input_format_msgpack_number_of_columns \{#input_format_msgpack_number_of_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

삽입되는 MsgPack 데이터의 컬럼 수입니다. 데이터로부터 스키마를 자동으로 추론하는 데 사용됩니다.

## input_format_mysql_dump_map_column_names \{#input_format_mysql_dump_map_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

MySQL dump에 있는 테이블의 컬럼과 ClickHouse 테이블의 컬럼을 컬럼 이름으로 매칭합니다

## input_format_mysql_dump_table_name \{#input_format_mysql_dump_table_name\}

데이터를 읽어올 MySQL 덤프의 테이블 이름

## input_format_native_allow_types_conversion \{#input_format_native_allow_types_conversion\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "Native 입력 형식에서 데이터 형식 변환 허용"}]}]}/>

Native 입력 형식에서 데이터 형식 변환을 허용합니다

## input_format_native_decode_types_in_binary_format \{#input_format_native_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Native 출력 포맷에서 타입 이름을 바이너리 형식으로 읽을 수 있도록 하는 새로운 설정이 추가되었습니다"}]}]}/>

Native 입력 포맷에서 타입 이름 대신 데이터 타입을 바이너리 형식으로 읽습니다

## input_format_null_as_default \{#input_format_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "기본적으로 입력 포맷에서 NULL을 기본값으로 삽입할 수 있도록 허용"}]}]}/>

[NULL](/sql-reference/syntax#literals) 필드의 데이터 타입이 [널 허용(Nullable)](/sql-reference/data-types/nullable)이 아닌 경우, 이 필드를 [기본값](/sql-reference/statements/create/table#default_values)으로 초기화할지 여부를 설정합니다.  
컬럼 타입이 널 허용이 아니고 이 설정이 비활성화되어 있으면 `NULL`을 삽입할 때 예외가 발생합니다. 컬럼 타입이 널 허용이면, 이 설정과 관계없이 `NULL` 값이 그대로 삽입됩니다.

이 설정은 대부분의 입력 포맷에 적용됩니다.

복잡한 기본 표현식을 사용하는 경우 `input_format_defaults_for_omitted_fields` 설정도 활성화해야 합니다.

가능한 값:

- 0 — 널 허용이 아닌 컬럼에 `NULL`을 삽입하면 예외가 발생합니다.
- 1 — `NULL` 필드는 컬럼의 기본값으로 초기화됩니다.

## input_format_orc_allow_missing_columns \{#input_format_orc_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "1"},{"label": "기본적으로 ORC 파일에서 누락된 컬럼을 허용합니다"}]}]}/>

ORC 형식 입력을 읽을 때 누락된 컬럼을 허용합니다

## input_format_orc_case_insensitive_column_matching \{#input_format_orc_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

ORC 컬럼을 ClickHouse 컬럼과 일치시킬 때 대소문자를 구분하지 않습니다.

## input_format_orc_dictionary_as_low_cardinality \{#input_format_orc_dictionary_as_low_cardinality\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ORC 파일을 읽을 때 ORC 딕셔너리로 인코딩된 컬럼을 LowCardinality 컬럼으로 처리"}]}]}/>

ORC 파일을 읽을 때 ORC 딕셔너리로 인코딩된 컬럼을 LowCardinality 컬럼으로 처리합니다.

## input_format_orc_filter_push_down \{#input_format_orc_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

ORC 파일을 읽을 때 WHERE/PREWHERE 식, ORC 메타데이터의 최소/최대 통계값 또는 블룸 필터를 기반으로 전체 스트라이프 또는 행 그룹을 건너뜁니다.

## input_format_orc_reader_time_zone_name \{#input_format_orc_reader_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "GMT"},{"label": "ORC row reader에 사용할 표준 시간대 이름입니다. 기본 ORC row reader의 표준 시간대는 GMT입니다."}]}]}/>

ORC row reader에 사용할 표준 시간대 이름입니다. 기본 ORC row reader의 표준 시간대는 GMT입니다.

## input_format_orc_row_batch_size \{#input_format_orc_row_batch_size\}

<SettingsInfoBlock type="Int64" default_value="100000" />

ORC stripe를 읽을 때 사용할 배치 크기입니다.

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

ORC 포맷의 스키마 추론 시 지원되지 않는 타입의 컬럼은 건너뜁니다.

## input_format_orc_use_fast_decoder \{#input_format_orc_use_fast_decoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

더 빠른 ORC 디코더 구현을 사용합니다.

## input_format_parallel_parsing \{#input_format_parallel_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

데이터 포맷에 대해 순서를 보존하는 병렬 파싱을 활성화하거나 비활성화합니다. [TabSeparated (TSV)](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) 및 [JSONEachRow](/interfaces/formats/JSONEachRow) 포맷에서만 지원됩니다.

가능한 값:

- 1 — 활성화됨.
- 0 — 비활성화됨.

## input_format_parquet_allow_geoparquet_parser \{#input_format_parquet_allow_geoparquet_parser\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Parquet 파일에서 geo 컬럼을 사용할 수 있게 해 주는 새로운 설정"}]}]}/>

geo 컬럼 파서를 사용하여 Array(UInt8)을 Point/LineString/Polygon/MultiLineString/MultiPolygon 타입으로 변환합니다

## input_format_parquet_allow_missing_columns \{#input_format_parquet_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "1"},{"label": "기본적으로 Parquet 파일에서 누락된 컬럼 허용"}]}]}/>

Parquet 입력 포맷을 읽을 때 누락된 컬럼을 허용합니다

## input_format_parquet_bloom_filter_push_down \{#input_format_parquet_bloom_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Parquet 파일을 읽을 때 WHERE/PREWHERE 조건과 Parquet 메타데이터의 블룸 필터를 사용해 전체 행 그룹을 건너뜁니다."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Parquet 파일을 읽을 때 WHERE/PREWHERE 조건과 Parquet 메타데이터의 블룸 필터를 사용해 전체 행 그룹을 건너뜁니다."}]}]}/>

Parquet 파일을 읽을 때 WHERE 조건과 Parquet 메타데이터의 블룸 필터를 사용해 전체 행 그룹을 건너뜁니다.

## input_format_parquet_case_insensitive_column_matching \{#input_format_parquet_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet 컬럼을 CH 컬럼과 매칭할 때 컬럼 이름의 대소문자를 구분하지 않습니다.

## input_format_parquet_enable_json_parsing \{#input_format_parquet_enable_json_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Parquet 파일을 읽을 때 JSON 컬럼을 ClickHouse JSON Column 타입으로 파싱합니다."}]}]}/>

Parquet 파일을 읽을 때 JSON 컬럼을 ClickHouse JSON Column 타입으로 파싱합니다.

## input_format_parquet_enable_row_group_prefetch \{#input_format_parquet_enable_row_group_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Parquet 파싱 중 row group 프리페치를 활성화합니다. 현재는 단일 스레드 파싱에서만 프리페치가 가능합니다."}]}]}/>

Parquet 파싱 중 row group 프리페치를 활성화합니다. 현재는 단일 스레드 파싱에서만 프리페치가 가능합니다.

## input_format_parquet_filter_push_down \{#input_format_parquet_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

Parquet 파일을 읽을 때 WHERE/PREWHERE 표현식과 Parquet 메타데이터의 min/max 통계 정보를 기반으로 전체 row group을 건너뜁니다.

## input_format_parquet_local_file_min_bytes_for_seek \{#input_format_parquet_local_file_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

Parquet 입력 포맷에서 「read with ignore」 방식으로 전체를 읽는 대신 seek를 수행하기 위해 로컬 파일을 읽을 때 필요한 최소 바이트 수입니다.

## input_format_parquet_local_time_as_utc \{#input_format_parquet_local_time_as_utc\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Parquet의 'local time without timezone' 타입에 더 적합한 타입인 DateTime64(..., 'UTC')를 사용합니다."}]}]}/>

`isAdjustedToUTC=false`인 Parquet timestamp에 대해 스키마 추론에 사용되는 데이터 타입을 결정합니다. 값이 true이면 `DateTime64(..., 'UTC')`, false이면 `DateTime64(...)`를 사용합니다. ClickHouse에는 로컬 시계 시간(local wall-clock time)을 위한 데이터 타입이 없으므로 어느 동작도 완전히 올바르지는 않습니다. 직관과는 다르게, 'true'가 덜 잘못된 옵션으로 볼 수 있는데, 'UTC' timestamp를 `String`으로 포맷하면 올바른 로컬 시간의 표현이 생성되기 때문입니다.

## input_format_parquet_max_block_size \{#input_format_parquet_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "65409"},{"label": "Parquet 리더의 블록 크기를 늘렸습니다."}]}]}/>

Parquet 리더에서 사용하는 최대 블록 크기입니다.

## input_format_parquet_memory_high_watermark \{#input_format_parquet_memory_high_watermark\}

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4294967296"},{"label": "New setting"}]}]}/>

Parquet reader v3에 대한 대략적인 메모리 상한입니다. 병렬로 읽을 수 있는 row group 또는 컬럼의 개수를 제한합니다. 하나의 쿼리에서 여러 파일을 읽는 경우 이 한도는 해당 파일 전체에 걸친 메모리 사용량 합계에 적용됩니다.

## input_format_parquet_memory_low_watermark \{#input_format_parquet_memory_low_watermark\}

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "2097152"},{"label": "New setting"}]}]}/>

메모리 사용량이 임계값보다 낮으면 프리페치를 더 적극적으로 스케줄링합니다. 예를 들어 네트워크를 통해 읽어야 하는 작은 블룸 필터가 많이 있을 때 유용할 수 있습니다.

## input_format_parquet_page_filter_push_down \{#input_format_parquet_page_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting (no effect when input_format_parquet_use_native_reader_v3 is disabled)"}]}]}/>

컬럼 인덱스에 저장된 최소/최대 값을 사용하여 페이지를 건너뜁니다.

## input_format_parquet_prefer_block_bytes \{#input_format_parquet_prefer_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "16744704"},{"label": "Parquet 리더가 출력하는 평균 블록 크기(바이트)."}]}]}/>

Parquet 리더가 출력하는 평균 블록 크기(바이트)

## input_format_parquet_preserve_order \{#input_format_parquet_preserve_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "0"},{"label": "더 나은 병렬 처리를 위해 Parquet 리더가 행 순서를 재정렬할 수 있도록 허용합니다."}]}]}/>

Parquet 파일을 읽을 때 행 순서를 재정렬하지 않습니다. 행 순서는 일반적으로 보장되지 않으며, 쿼리 파이프라인의 다른 파트에서 변경될 수 있으므로 이 설정 사용은 권장되지 않습니다. 대신 `ORDER BY _row_number`를 사용하십시오.

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Parquet 포맷에서 스키마 추론을 수행할 때 지원되지 않는 타입의 컬럼을 건너뜁니다.

## input_format_parquet_use_native_reader_v3 \{#input_format_parquet_use_native_reader_v3\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "1"},{"label": "Seems stable"}]}]}/>

Parquet reader v3를 사용합니다.

## input_format_parquet_use_offset_index \{#input_format_parquet_use_offset_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "새 설정입니다(input_format_parquet_use_native_reader_v3가 비활성화된 경우에는 효과가 없습니다)."}]}]}/>

페이지 필터링을 사용하지 않을 때 Parquet 파일에서 페이지를 읽는 방식이 소폭 변경되었습니다.

## input_format_parquet_verify_checksums \{#input_format_parquet_verify_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "새로운 설정입니다."}]}]}/>

Parquet 파일을 읽을 때 페이지 체크섬을 검증합니다.

## input_format_protobuf_flatten_google_wrappers \{#input_format_protobuf_flatten_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

일반적인 비중첩 컬럼에 대해 Google wrapper를 활성화합니다. 예를 들어 String 컬럼 'str'에 대해 google.protobuf.StringValue 'str'을 사용합니다. 널 허용 컬럼의 경우 비어 있는 wrapper는 기본값으로, 누락된 wrapper는 null로 인식됩니다.

## input_format_protobuf_oneof_presence \{#input_format_protobuf_oneof_presence\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

특수 컬럼에 enum 값을 설정하여 어떤 protobuf oneof 필드가 발견되었는지 나타냅니다

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Protobuf 포맷에 대한 스키마 추론을 수행할 때 지원되지 않는 타입의 필드를 건너뜁니다.

## input_format_record_errors_file_path \{#input_format_record_errors_file_path\}

텍스트 형식(CSV, TSV)을 읽을 때 발생하는 오류를 기록하는 파일의 경로입니다.

## input_format_skip_unknown_fields \{#input_format_skip_unknown_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.6"},{"label": "1"},{"label": "Optimize reading subset of columns for some input formats"}]}]}/>

추가 데이터 삽입을 건너뛸지 여부를 설정합니다.

데이터를 삽입할 때 입력 데이터에 대상 테이블에 존재하지 않는 컬럼이 포함된 경우 ClickHouse는 예외를 발생시킵니다. 건너뛰기가 활성화되어 있으면 ClickHouse는 추가 데이터를 삽입하지 않고 예외도 발생시키지 않습니다.

지원되는 포맷:

- [JSONEachRow](/interfaces/formats/JSONEachRow) (및 다른 JSON 포맷)
- [BSONEachRow](/interfaces/formats/BSONEachRow) (및 다른 JSON 포맷)
- [TSKV](/interfaces/formats/TSKV)
- WithNames/WithNamesAndTypes 접미사가 있는 모든 포맷
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## input_format_try_infer_dates \{#input_format_try_infer_dates\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정이 활성화되면 ClickHouse는 텍스트 형식에 대한 스키마 추론 시 문자열 필드에서 `Date` 타입을 추론하려고 시도합니다. 입력 데이터의 한 컬럼에 포함된 모든 필드가 날짜로 정상적으로 파싱되면 결과 타입은 `Date`가 되며, 하나라도 날짜로 파싱되지 않은 필드가 있으면 결과 타입은 `String`이 됩니다.

기본적으로 활성화되어 있습니다.

## input_format_try_infer_datetimes \{#input_format_try_infer_datetimes\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정이 활성화되면 ClickHouse는 텍스트 형식에 대한 스키마 추론 시 문자열 필드에서 `DateTime64` 타입을 추론하려고 시도합니다. 입력 데이터에서 하나의 컬럼에 포함된 모든 필드가 날짜·시간 형식으로 성공적으로 파싱되면 결과 타입은 `DateTime64`가 되며, 하나라도 날짜·시간 형식으로 파싱되지 않은 필드가 있으면 결과 타입은 `String`이 됩니다.

기본적으로 활성화되어 있습니다.

## input_format_try_infer_datetimes_only_datetime64 \{#input_format_try_infer_datetimes_only_datetime64\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "데이터 형식에서 DateTime64 대신 DateTime을 추론할 수 있도록 허용"}]}]}/>

input_format_try_infer_datetimes가 활성화되면 DateTime 타입이 아니라 DateTime64 타입만 추론합니다

## input_format_try_infer_exponent_floats \{#input_format_try_infer_exponent_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "기본적으로 지수 표기법의 부동소수 값을 추론하지 않음"}]}]}/>

텍스트 포맷에서 스키마 추론을 수행할 때 지수 표기법으로 표현된 부동소수 값을 추론하도록 합니다(JSON은 제외되며, JSON에서는 지수 표기 숫자가 항상 추론됩니다)

## input_format_try_infer_integers \{#input_format_try_infer_integers\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정을 활성화하면 ClickHouse는 텍스트 형식에 대한 스키마 추론 시 부동소수점 숫자 대신 정수를 추론하려고 합니다. 입력 데이터의 해당 컬럼에 있는 모든 숫자가 정수이면 결과 타입은 `Int64`가 되고, 하나라도 부동소수점 숫자가 있으면 결과 타입은 `Float64`가 됩니다.

기본값은 활성화 상태입니다.

## input_format_try_infer_variants \{#input_format_try_infer_variants\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "텍스트 형식에서 컬럼/배열 요소에 대해 가능한 타입이 둘 이상인 경우 Variant 타입을 추론하려고 시도"}]}]}/>

활성화하면 텍스트 형식에 대한 스키마 추론에서 컬럼/배열 요소에 대해 가능한 타입이 둘 이상인 경우 ClickHouse가 [`Variant`](../../sql-reference/data-types/variant.md) 타입을 추론하려고 시도합니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## input_format_tsv_allow_variable_number_of_columns \{#input_format_tsv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 입력 시 추가 컬럼(파일에 예상보다 더 많은 컬럼이 있는 경우)은 무시하고, TSV 입력에서 누락된 필드는 기본값으로 처리합니다

## input_format_tsv_crlf_end_of_line \{#input_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "TSV 형식에서 CRLF 줄 끝을 읽도록 활성화합니다"}]}]}/>

true로 설정하면 `file` 함수는 TSV 형식을 읽을 때 줄 끝으로 \\n 대신 \\r\\n을 사용합니다.

## input_format_tsv_detect_header \{#input_format_tsv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "기본값으로 TSV 형식의 헤더를 감지합니다"}]}]}/>

TSV 형식에서 열 이름과 타입이 포함된 헤더를 자동으로 감지합니다

## input_format_tsv_empty_as_default \{#input_format_tsv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 형식의 입력에서 비어 있는 필드를 기본값으로 처리합니다.

## input_format_tsv_enum_as_number \{#input_format_tsv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 형식으로 삽입된 enum 값을 enum 인덱스로 처리합니다.

## input_format_tsv_skip_first_lines \{#input_format_tsv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

TSV 형식 데이터의 시작 부분에서 지정된 줄 수만큼 건너뜁니다.

## input_format_tsv_skip_trailing_empty_lines \{#input_format_tsv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

TSV 형식에서 마지막에 오는 빈 줄을 무시합니다

## input_format_tsv_use_best_effort_in_schema_inference \{#input_format_tsv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

TSV 형식에서 스키마를 추론하기 위해 여러 최적화와 휴리스틱 기법을 사용합니다.

## input_format_values_accurate_types_of_literals \{#input_format_values_accurate_types_of_literals\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values 포맷에서 Template을 사용해 식을 파싱하고 해석할 때, 오버플로와 정밀도 문제를 방지하기 위해 리터럴의 실제 유형을 검사합니다.

## input_format_values_deduce_templates_of_expressions \{#input_format_values_deduce_templates_of_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values 형식에서: 스트리밍 파서로 필드를 파싱할 수 없으면 SQL 파서를 실행하고, SQL 표현식의 템플릿을 추론한 다음, 해당 템플릿을 사용해 모든 행을 파싱한 후 모든 행에 대해 표현식을 평가합니다.

## input_format_values_interpret_expressions \{#input_format_values_interpret_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Values 포맷에서 스트리밍 파서가 필드를 파싱하지 못하면 SQL 파서를 실행하여 해당 필드를 SQL 표현식으로 해석하려 시도합니다.

## input_format_with_names_use_header \{#input_format_with_names_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "1"},{"label": "WithNames/WithNamesAndTypes 접미사가 있는 형식에서 이름이 포함된 헤더 사용 활성화"}]}]}/>

데이터를 삽입할 때 컬럼 순서를 검사할지 여부를 설정합니다.

삽입 성능을 향상하기 위해, 입력 데이터의 컬럼 순서가 대상 테이블과 동일하다고 확신할 수 있는 경우에는 이 검사를 비활성화할 것을 권장합니다.

지원되는 형식:

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

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

## input_format_with_types_use_header \{#input_format_with_types_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

포맷 파서가 입력 데이터의 데이터 타입이 대상 테이블의 데이터 타입과 일치하는지 확인할지 여부를 제어합니다.

지원되는 포맷:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

가능한 값:

- 0 — 비활성화됨.
- 1 — 활성화됨.

## insert_distributed_one_random_shard \{#insert_distributed_one_random_shard\}

<SettingsInfoBlock type="Bool" default_value="0" />

분산 키가 없을 때 [Distributed](/engines/table-engines/special/distributed) 테이블에 삽입하는 경우, 하나의 세그먼트를 무작위로 선택해 삽입할지를 설정합니다.

기본적으로 둘 이상의 세그먼트를 가진 `Distributed` 테이블에 데이터를 삽입할 때 분산 키가 없으면 ClickHouse 서버는 모든 삽입 요청을 거부합니다. `insert_distributed_one_random_shard = 1`이면 삽입이 허용되며, 데이터는 모든 세그먼트 중에서 무작위로 선택된 세그먼트로 전달됩니다.

가능한 값:

- 0 — 여러 세그먼트가 있고 분산 키가 제공되지 않은 경우 삽입이 거부됩니다.
- 1 — 분산 키가 제공되지 않은 경우 사용 가능한 모든 세그먼트 중에서 임의의 세그먼트로 삽입이 수행됩니다.

## interval_output_format \{#interval_output_format\}

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

interval 타입의 텍스트 표현에 대해 서로 다른 출력 형식을 선택할 수 있습니다.

사용 가능한 값:

-   `kusto` - KQL 스타일 출력 형식.

    ClickHouse는 interval을 [KQL 형식](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier)으로 출력합니다. 예를 들어 `toIntervalDay(2)`는 `2.00:00:00`으로 포맷됩니다. 길이가 서로 다른 interval 타입(예: `IntervalMonth` 및 `IntervalYear`)의 경우 interval당 평균 초(second) 수를 고려합니다.

-   `numeric` - 숫자형 출력 형식.

    ClickHouse는 interval을 내부 숫자 표현 그대로 출력합니다. 예를 들어 `toIntervalDay(2)`는 `2`로 포맷됩니다.

함께 보기:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories \{#into_outfile_create_parent_directories\}

<SettingsInfoBlock type="Bool" default_value="0" />

INTO OUTFILE을 사용할 때 상위 디렉터리가 존재하지 않으면 자동으로 상위 디렉터리를 생성합니다.

## json_type_escape_dots_in_keys \{#json_type_escape_dots_in_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 JSON 키에 포함된 점(dot)이 파싱하는 동안 이스케이프 처리됩니다.

## max_dynamic_subcolumns_in_json_type_parsing \{#max_dynamic_subcolumns_in_json_type_parsing\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

JSON 컬럼을 파싱할 때 각 컬럼에서 생성될 수 있는 동적 서브컬럼의 최대 개수입니다.
데이터 타입에 지정된 동적 파라미터와 관계없이 파싱 중에 생성되는 동적 서브컬럼 수를 제어할 수 있습니다.

## output_format_arrow_compression_method \{#output_format_arrow_compression_method\}

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "lz4_frame"},{"label": "기본값으로 Arrow 출력 형식에서 lz4 압축을 사용합니다"}]}]}/>

Arrow 출력 형식에 대한 압축 방식입니다. 지원되는 코덱: lz4_frame, zstd, none (압축 안 함)

## output_format_arrow_date_as_uint16 \{#output_format_arrow_date_as_uint16\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.2"},{"label": "0"},{"label": "기본적으로 일반 UInt16이 아니라 Arrow DATE32로 Date를 기록합니다."}]}]}/>

Date 값을 32비트 Arrow DATE32 타입(읽을 때 Date32)으로 변환하지 않고, 일반 16비트 숫자(읽을 때 UInt16)로 기록합니다.

## output_format_arrow_fixed_string_as_fixed_byte_array \{#output_format_arrow_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "FixedString 컬럼에 대해 기본값으로 Arrow FIXED_SIZE_BINARY 타입을 사용합니다"}]}]}/>

FixedString 컬럼에 대해 Binary 대신 Arrow FIXED_SIZE_BINARY 타입을 사용합니다.

## output_format_arrow_low_cardinality_as_dictionary \{#output_format_arrow_low_cardinality_as_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

LowCardinality 타입을 딕셔너리 Arrow 타입으로 출력되도록 설정합니다

## output_format_arrow_string_as_string \{#output_format_arrow_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "ClickHouse에서는 String 데이터 타입에 일반적으로 UTF-8을 사용하지만, 임의의 이진 데이터도 허용합니다. Parquet/ORC/Arrow의 String 타입은 UTF-8만 지원합니다. 따라서 ClickHouse String 데이터 타입에 대해 Arrow의 어떤 데이터 타입(String 또는 Binary)을 사용할지 선택할 수 있습니다. Binary를 사용하는 것이 더 정확하고 호환성이 좋지만, 대부분의 경우 기본값으로 String을 사용하면 사용자 기대와 더 잘 부합합니다."}]}]}/>

String 컬럼에 대해 Binary 대신 Arrow String 타입을 사용하도록 합니다

## output_format_arrow_use_64_bit_indexes_for_dictionary \{#output_format_arrow_use_64_bit_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Arrow 딕셔너리에서 64비트 인덱스 타입 사용 허용"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "0"},{"label": "Arrow 딕셔너리에서 64비트 인덱스 타입 사용 허용"}]}]}/>

Arrow 포맷에서 딕셔너리 인덱스에 항상 64비트 정수형을 사용합니다

## output_format_arrow_use_signed_indexes_for_dictionary \{#output_format_arrow_use_signed_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "권장에 따라 기본적으로 Arrow 딕셔너리에 부호 있는 인덱스 유형을 사용합니다"}]}]}/>

Arrow 형식에서 딕셔너리 인덱스에 부호 있는 정수를 사용합니다

## output_format_avro_codec \{#output_format_avro_codec\}

출력에 사용되는 압축 코덱입니다. 가능한 값은 'null', 'deflate', 'snappy', 'zstd'입니다.

## output_format_avro_rows_in_file \{#output_format_avro_rows_in_file\}

<SettingsInfoBlock type="UInt64" default_value="1" />

파일당 최대 행 수(스토리지가 허용하는 범위 내에서)

## output_format_avro_string_column_pattern \{#output_format_avro_string_column_pattern\}

Avro 형식에서 AVRO string으로 출력할 String 컬럼을 선택하는 정규식입니다.

## output_format_avro_sync_interval \{#output_format_avro_sync_interval\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

바이트 단위로 지정되는 동기화 간격입니다.

## output_format_binary_encode_types_in_binary_format \{#output_format_binary_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "RowBinaryWithNamesAndTypes 출력 형식에서 형식 이름을 바이너리 형식으로 기록할 수 있도록 하는 새 설정이 추가되었습니다"}]}]}/>

RowBinaryWithNamesAndTypes 출력 형식에서 형식 이름 대신 데이터 형식을 바이너리 형식으로 기록합니다

## output_format_binary_write_json_as_string \{#output_format_binary_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "RowBinary 출력 포맷에서 JSON 타입 값을 JSON 문자열로 기록하는 새 설정 추가"}]}]}/>

[JSON](../../sql-reference/data-types/newjson.md) 데이터 타입의 값을 RowBinary 출력 포맷에서 JSON [String](../../sql-reference/data-types/string.md) 값으로 기록합니다.

## output_format_bson_string_as_string \{#output_format_bson_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

String 컬럼에서는 Binary 대신 BSON String 타입을 사용합니다.

## output_format_compression_level \{#output_format_compression_level\}

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "Allow to change compression level in the query output"}]}]}/>

쿼리 결과가 압축되는 경우 기본 압축 수준입니다. 이 설정은 `SELECT` 쿼리에 `INTO OUTFILE`이 있거나, 테이블 함수 `file`, `url`, `hdfs`, `s3`, `azureBlobStorage`로 기록할 때 적용됩니다.

가능한 값: `1`부터 `22`까지

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "zstd 압축이 사용될 때 쿼리 출력에서 zstd window log를 변경할 수 있음"}]}]}/>

출력 압축 방식이 `zstd`일 때 사용할 수 있습니다. 값이 `0`보다 크면 이 설정은 압축 윈도우 크기(2의 거듭제곱)를 명시적으로 지정하고 zstd 압축에 대해 long-range 모드를 활성화합니다. 이는 더 나은 압축률을 달성하는 데 도움이 됩니다.

가능한 값: 0 이상의 수. 값이 너무 작거나 너무 크면 `zstdlib`이 예외를 발생시킨다는 점에 유의하십시오. 일반적인 값 범위는 `20`(윈도우 크기 = `1MB`)에서 `30`(윈도우 크기 = `1GB`)입니다.

## output_format_csv_crlf_end_of_line \{#output_format_csv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

`true`로 설정하면 CSV 형식에서 줄 바꿈이 `\n` 대신 `\r\n`으로 출력됩니다.

## output_format_csv_serialize_tuple_into_separate_columns \{#output_format_csv_serialize_tuple_into_separate_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "CSV 형식의 tuple 해석 방식이 새로 추가되었습니다."}]}, {"id": "row-2","items": [{"label": "24.3"},{"label": "1"},{"label": "CSV 형식의 tuple 해석 방식이 새로 추가되었습니다."}]}]}/>

이 설정을 true로 하면 CSV 형식의 tuple이 개별 컬럼으로 직렬화됩니다(즉, tuple 내부의 중첩 정보가 사라집니다).

## output_format_decimal_trailing_zeros \{#output_format_decimal_trailing_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "0"},{"label": "보기 좋은 출력 결과를 위해 기본적으로 Decimal 타입의 텍스트 표현에서 끝의 0을 출력하지 않도록 함"}]}]}/>

Decimal 값을 출력할 때 끝의 0까지 모두 함께 출력합니다. 예: 1.23 대신 1.230000으로 출력됩니다.

기본적으로 비활성화되어 있습니다.

## output_format_json_array_of_rows \{#output_format_json_array_of_rows\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSONEachRow](/interfaces/formats/JSONEachRow) 형식에서 모든 행을 JSON 배열로 출력할 수 있도록 활성화합니다.

가능한 값은 다음과 같습니다.

* 1 — ClickHouse가 모든 행을 하나의 배열로 출력하며, 각 행은 `JSONEachRow` 형식입니다.
* 0 — ClickHouse가 각 행을 `JSONEachRow` 형식으로 개별적으로 출력합니다.

**설정을 활성화한 쿼리 예시**

쿼리:

```sql
SET output_format_json_array_of_rows = 1;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

결과:

```text
[
{"number":"0"},
{"number":"1"},
{"number":"2"}
]
```

**설정을 비활성화한 상태에서의 쿼리 예시**

쿼리:

```sql
SET output_format_json_array_of_rows = 0;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

결과:

```text
{"number":"0"}
{"number":"1"}
{"number":"2"}
```


## output_format_json_escape_forward_slashes \{#output_format_json_escape_forward_slashes\}

<SettingsInfoBlock type="Bool" default_value="1" />

JSON 출력 형식에서 문자열 출력에 포함된 슬래시(/)를 이스케이프할지 여부를 제어합니다. JavaScript와의 호환성을 위한 설정입니다. 항상 이스케이프되는 역슬래시(\)와 혼동해서는 안 됩니다.

기본적으로 사용하도록 설정되어 있습니다.

## output_format_json_map_as_array_of_tuples \{#output_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

맵 컬럼을 JSON 튜플의 배열 형태로 직렬화합니다.

기본값은 비활성입니다.

## output_format_json_named_tuples_as_objects \{#output_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.6"},{"label": "1"},{"label": "기본적으로 JSON 형식에서 이름이 지정된 튜플을 JSON 객체로 직렬화할 수 있도록 허용합니다"}]}]}/>

이름이 지정된 튜플 컬럼을 JSON 객체로 직렬화합니다.

기본적으로 활성화되어 있습니다.

## output_format_json_pretty_print \{#output_format_json_pretty_print\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "기본적으로 JSON 출력 형식에서 값을 Pretty 형식으로 출력합니다"}]}]} />

이 설정은 JSON 출력 형식을 사용할 때 `data` 배열 안에서 Tuple, 맵(map), Array와 같은 중첩 구조가 어떻게 표시되는지를 결정합니다.

예를 들어, 다음과 같은 출력 대신:

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

출력은 다음과 같은 형식으로 표시됩니다:

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

기본적으로 활성화되어 있습니다.


## output_format_json_quote_64bit_floats \{#output_format_json_quote_64bit_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON* 형식으로 출력할 때 64비트 [floats](../../sql-reference/data-types/float.md) 값에 따옴표를 붙일지 여부를 제어합니다.

기본값은 비활성화입니다.

## output_format_json_quote_64bit_integers \{#output_format_json_quote_64bit_integers\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "기본적으로 JSON에서 64비트 정수에 따옴표 사용 비활성화"}]}]}/>

64비트 이상의 [정수](../../sql-reference/data-types/int-uint.md) (예: `UInt64`, `Int128`)를 [JSON](/interfaces/formats/JSON) 형식으로 출력할 때 따옴표로 감쌀지 여부를 제어합니다.
이러한 정수는 기본적으로 따옴표로 둘러싸여 출력되며, 이 동작은 대부분의 JavaScript 구현과 호환됩니다.

가능한 값:

- 0 — 정수를 따옴표 없이 출력합니다.
- 1 — 정수를 따옴표로 둘러싸서 출력합니다.

## output_format_json_quote_decimals \{#output_format_json_quote_decimals\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 출력 형식에서 십진수 값을 따옴표로 감쌀지 여부를 제어합니다.

기본적으로 비활성화되어 있습니다.

## output_format_json_quote_denormals \{#output_format_json_quote_denormals\}

<SettingsInfoBlock type="Bool" default_value="0" />

[JSON](/interfaces/formats/JSON) 출력 포맷에서 `+nan`, `-nan`, `+inf`, `-inf` 값이 출력되도록 허용합니다.

가능한 값:

* 0 — 비활성화됨.
* 1 — 활성화됨.

**예시**

다음과 같은 `account_orders` 테이블이 있다고 가정합니다:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

`output_format_json_quote_denormals = 0`인 경우, 쿼리 결과에 `null` 값이 포함됩니다:

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

`output_format_json_quote_denormals = 1`일 때, 쿼리는 다음과 같은 결과를 반환합니다:

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

Named Tuple 컬럼을 JSON 객체로 직렬화할 때 null 값을 가진 키-값 쌍을 건너뜁니다. 이 설정은 output_format_json_named_tuples_as_objects가 true일 때만 적용됩니다.

## output_format_json_validate_utf8 \{#output_format_json_validate_utf8\}

<SettingsInfoBlock type="Bool" default_value="0" />

JSON 출력 형식에서 UTF-8 시퀀스 검증 여부를 제어합니다. JSON/JSONCompact/JSONColumnsWithMetadata 형식에는 영향을 주지 않으며, 이 형식들은 항상 UTF-8을 검증합니다.

기본적으로 비활성화되어 있습니다.

## output_format_markdown_escape_special_characters \{#output_format_markdown_escape_special_characters\}

<SettingsInfoBlock type="Bool" default_value="0" />

활성화되면 Markdown에서 특수 문자를 이스케이프합니다.

[Common Mark](https://spec.commonmark.org/0.30/#example-12)는 다음 특수 문자를 이스케이프 가능한 문자로 정의합니다:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

가능한 값:

* 0 — 비활성화
* 1 — 활성화


## output_format_msgpack_uuid_representation \{#output_format_msgpack_uuid_representation\}

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

MsgPack 형식에서 UUID를 출력하는 방법을 설정합니다.

## output_format_native_encode_types_in_binary_format \{#output_format_native_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Native 출력 형식에서 타입 이름을 이진 형식으로 쓸 수 있도록 하는 새 설정을 추가함"}]}]}/>

Native 출력 형식에서 타입 이름 대신 타입 정보를 이진 형식으로 기록합니다

## output_format_native_use_flattened_dynamic_and_json_serialization \{#output_format_native_use_flattened_dynamic_and_json_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Native 포맷에 평탄화된 Dynamic/JSON 직렬화 방식을 추가"}]}]}/>

[JSON](../../sql-reference/data-types/newjson.md) 및 [Dynamic](../../sql-reference/data-types/dynamic.md) 컬럼의 데이터를 평탄화된 형식으로 기록합니다(모든 타입과 경로를 별도의 서브컬럼으로 분리합니다).

## output_format_native_write_json_as_string \{#output_format_native_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Native 형식에서 JSON 컬럼을 단일 String 컬럼으로 기록할 수 있도록 새로운 설정 추가"}]}]}/>

기본 native JSON 직렬화 대신, [JSON](../../sql-reference/data-types/newjson.md) 컬럼의 데이터를 JSON 문자열을 담는 [String](../../sql-reference/data-types/string.md) 컬럼으로 기록합니다.

## output_format_orc_compression_block_size \{#output_format_orc_compression_block_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "262144"},{"label": "New setting"}]}]}/>

ORC 출력 포맷의 압축 블록 크기(바이트 단위)입니다.

## output_format_orc_compression_method \{#output_format_orc_compression_method\}

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "zstd"},{"label": "Parquet/ORC/Arrow는 lz4 및 zstd를 포함하여 많은 압축 방식을 지원합니다. ClickHouse는 이러한 모든 압축 방식을 지원합니다. 「duckdb」와 같은 일부 성능이 떨어지는 도구는 더 빠른 `lz4` 압축 방식을 지원하지 않기 때문에 기본값으로 zstd를 설정합니다."}]}, {"id": "row-2","items": [{"label": "23.3"},{"label": "lz4_frame"},{"label": "기본적으로 ORC 출력 형식에서 lz4 압축을 사용합니다."}]}]}/>

ORC 출력 형식에 사용할 압축 방식입니다. 지원되는 코덱: lz4, snappy, zlib, zstd, none(압축 안 함)

## output_format_orc_dictionary_key_size_threshold \{#output_format_orc_dictionary_key_size_threshold\}

<SettingsInfoBlock type="Double" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "ORC 출력 형식에서 문자열 컬럼의 경우, 서로 다른 값의 개수가 널이 아닌 전체 행 수에서 이 비율보다 크면 딕셔너리 인코딩을 비활성화합니다. 그렇지 않으면 딕셔너리 인코딩을 활성화합니다"}]}]}/>

ORC 출력 형식에서 문자열 컬럼의 경우, 서로 다른 값의 개수가 널이 아닌 전체 행 수에서 이 비율보다 크면 딕셔너리 인코딩을 비활성화합니다. 그렇지 않으면 딕셔너리 인코딩을 활성화합니다

## output_format_orc_row_index_stride \{#output_format_orc_row_index_stride\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ORC 출력 형식에서 목표 행 인덱스 간격

## output_format_orc_string_as_string \{#output_format_orc_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "ClickHouse의 String 데이터 타입은 일반적으로 UTF-8로 인코딩되지만, 임의의 이진 데이터를 허용합니다. Parquet/ORC/Arrow의 String은 UTF-8만 지원합니다. 따라서 ClickHouse String 데이터 타입에 대해 사용할 Arrow 데이터 타입을 String 또는 Binary 중에서 선택할 수 있습니다. Binary를 사용하는 것이 더 정확하고 호환성 면에서도 바람직하지만, 기본값으로 String을 사용하면 대부분의 경우 사용자 기대와 더 잘 부합합니다."}]}]}/>

String 컬럼에는 Binary 대신 ORC String 타입을 사용합니다

## output_format_orc_writer_time_zone_name \{#output_format_orc_writer_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "GMT"},{"label": "ORC writer에 사용할 시간대 이름입니다. 기본 ORC writer의 시간대는 GMT입니다."}]}]}/>

ORC writer에 사용할 시간대 이름입니다. 기본 ORC writer의 시간대는 GMT입니다.

## output_format_parallel_formatting \{#output_format_parallel_formatting\}

<SettingsInfoBlock type="Bool" default_value="1" />

데이터 포맷을 병렬로 포맷팅하는 기능을 활성화하거나 비활성화합니다. [TSV](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV), [JSONEachRow](/interfaces/formats/JSONEachRow) 포맷에서만 지원됩니다.

가능한 값:

- 1 — 활성화.
- 0 — 비활성화.

## output_format_parquet_batch_size \{#output_format_parquet_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

이 개수의 행마다 페이지 크기를 확인합니다. 평균 값 크기가 수 KB를 초과하는 컬럼이 있는 경우 이 값을 줄이는 것을 고려합니다.

## output_format_parquet_bloom_filter_bits_per_value \{#output_format_parquet_bloom_filter_bits_per_value\}

<SettingsInfoBlock type="Double" default_value="10.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "10.5"},{"label": "새로운 설정."}]}]}/>

Parquet 블룸 필터에서 각 고유 값에 사용할 비트 수의 대략적인 값입니다. 추정되는 거짓 양성률은 다음과 같습니다:

*  6   비트 - 10%
  * 10.5 비트 -  1%
  * 16.9 비트 -  0.1%
  * 26.4 비트 -  0.01%
  * 41   비트 -  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes \{#output_format_parquet_bloom_filter_flush_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "134217728"},{"label": "새로운 설정입니다."}]}]}/>

Parquet 파일 내에서 블룸 필터를 어느 위치에 둘지 지정합니다. 블룸 필터는 대략 이 크기(바이트)의 그룹 단위로 기록됩니다. 구체적으로는 다음과 같습니다.

* 0인 경우, 각 row group의 블룸 필터는 해당 row group 바로 뒤에 기록됩니다.
  * 모든 블룸 필터의 전체 크기보다 큰 경우, 모든 row group의 블룸 필터가 메모리에 누적된 후 파일 끝부분 근처에 한 번에 기록됩니다.
  * 그 외의 경우, 블룸 필터는 메모리에 누적되다가 전체 크기가 이 값을 초과할 때마다 기록됩니다.

## output_format_parquet_compliant_nested_types \{#output_format_parquet_compliant_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "출력 Parquet 파일 스키마에서 내부 필드 이름이 변경되었습니다."}]}]}/>

Parquet 파일 스키마에서 리스트 원소의 이름으로 'item' 대신 'element'를 사용합니다. 이는 Arrow 라이브러리 구현에서 비롯된 역사적 유산입니다. 일반적으로 호환성이 향상되지만, 일부 구버전 Arrow와는 예외가 있을 수 있습니다.

## output_format_parquet_compression_method \{#output_format_parquet_compression_method\}

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "zstd"},{"label": "Parquet/ORC/Arrow는 snappy, lz4, zstd를 포함하여 다양한 압축 방식을 지원합니다. ClickHouse는 이러한 모든 압축 방식을 지원합니다. 「duckdb」와 같이 기능이 떨어지는 일부 도구는 더 빠른 `lz4` 압축 방식을 지원하지 않으므로 기본값으로 zstd를 설정합니다."}]}, {"id": "row-2","items": [{"label": "23.3"},{"label": "lz4"},{"label": "기본적으로 Parquet 출력 형식에서 lz4 압축을 사용합니다."}]}]}/>

Parquet 출력 형식에 사용할 압축 방식입니다. 지원되는 코덱: snappy, lz4, brotli, zstd, gzip, none(무압축)

## output_format_parquet_data_page_size \{#output_format_parquet_data_page_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

압축 전 기준 페이지의 목표 크기(바이트 단위)입니다.

## output_format_parquet_date_as_uint16 \{#output_format_parquet_date_as_uint16\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "24.12 버전에서 도입된, 경미하지만 호환성을 깨뜨리는 변경 사항에 대한 호환성 설정을 추가했습니다."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Date를 일반 UInt16 대신 Date32로 기록합니다(이 둘은 Date와 가장 가까운 두 Parquet 타입입니다)."}]}]}/>

Date 값을 32비트 Parquet DATE 타입(다시 읽을 때 Date32)으로 변환하여 기록하는 대신, 순수한 16비트 숫자(다시 읽을 때 UInt16)로 기록합니다.

## output_format_parquet_datetime_as_uint32 \{#output_format_parquet_datetime_as_uint32\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "DateTime을 UInt32 대신 DateTime64(3)으로 기록합니다(이 두 가지 Parquet 타입이 DateTime과 가장 가깝습니다)."}]}]}/>

DateTime 값을 밀리초 단위로 변환하여 기록하고(다시 읽을 때 DateTime64(3)으로 읽음) 대신, 원시 Unix 타임스탬프로 기록합니다(다시 읽을 때 UInt32로 읽음).

## output_format_parquet_enum_as_byte_array \{#output_format_parquet_enum_as_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "기본적으로 Parquet에서 Enum을 바이트 배열로 기록하도록 설정합니다"}]}, {"id": "row-2","items": [{"label": "25.7"},{"label": "0"},{"label": "Parquet 물리 타입 BYTE_ARRAY 및 논리 타입 ENUM을 사용하여 Enum을 기록합니다"}]}]}/>

Parquet 물리 타입 BYTE_ARRAY 및 논리 타입 ENUM을 사용하여 Enum을 기록합니다

## output_format_parquet_fixed_string_as_fixed_byte_array \{#output_format_parquet_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "FixedString에 대해 기본적으로 Parquet FIXED_LENGTH_BYTE_ARRAY 타입을 사용합니다"}]}]}/>

FixedString 컬럼에는 Binary 대신 Parquet FIXED_LEN_BYTE_ARRAY 타입을 사용합니다.

## output_format_parquet_geometadata \{#output_format_parquet_geometadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Parquet 메타데이터에 geo 컬럼 정보를 기록하고 컬럼을 WKB 형식으로 인코딩할 수 있도록 하는 새로운 설정입니다."}]}]}/>

Parquet 메타데이터에 geo 컬럼 정보를 기록하고 컬럼을 WKB 형식으로 인코딩할 수 있도록 합니다.

## output_format_parquet_max_dictionary_size \{#output_format_parquet_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1048576"},{"label": "New setting"}]}]}/>

딕셔너리 크기가 이 값(바이트 단위)을 초과하면 딕셔너리를 사용하지 않는 인코딩으로 전환합니다. 딕셔너리 인코딩을 비활성화하려면 0으로 설정합니다.

## output_format_parquet_parallel_encoding \{#output_format_parquet_parallel_encoding\}

<SettingsInfoBlock type="Bool" default_value="1" />

다중 스레드에서 Parquet 인코딩을 수행합니다. 이 설정을 사용하려면 `output_format_parquet_use_custom_encoder`가 활성화되어 있어야 합니다.

## output_format_parquet_row_group_size \{#output_format_parquet_row_group_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

대상 row 그룹의 목표 크기(행 수 기준)입니다.

## output_format_parquet_row_group_size_bytes \{#output_format_parquet_row_group_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="536870912" />

압축 전에 기준이 되는 대상 row group의 크기(바이트)입니다.

## output_format_parquet_string_as_string \{#output_format_parquet_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "ClickHouse에서는 String 데이터 타입에 임의의 이진 데이터를 허용하며, 이 타입은 보통 UTF-8입니다. Parquet/ORC/Arrow의 String은 UTF-8만 지원합니다. 따라서 ClickHouse String 데이터 타입에 대해 Arrow의 어떤 데이터 타입(String 또는 Binary)을 사용할지 선택할 수 있습니다. Binary를 사용하는 것이 더 정확하고 호환성 측면에서도 바람직하지만, 기본값으로 String을 사용하면 대부분 사용자 기대에 부합합니다."}]}]}/>

String 컬럼에는 Binary 대신 Parquet String 타입을 사용합니다.

## output_format_parquet_use_custom_encoder \{#output_format_parquet_use_custom_encoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1"},{"label": "사용자 지정 Parquet 인코더를 활성화합니다."}]}]}/>

더 빠른 Parquet 인코더 구현을 사용합니다.

## output_format_parquet_version \{#output_format_parquet_version\}

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "2.latest"},{"label": "출력 포맷에서 최신 Parquet 포맷 버전 사용"}]}]}/>

출력 포맷에 사용할 Parquet 포맷 버전입니다. 지원되는 버전은 1.0, 2.4, 2.6 및 2.latest (기본값)입니다.

## output_format_parquet_write_bloom_filter \{#output_format_parquet_write_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Parquet 블룸 필터 기록 지원이 추가되었습니다."}]}]}/>

Parquet 파일에 블룸 필터를 기록합니다. `output_format_parquet_use_custom_encoder = true`로 설정되어 있어야 합니다.

## output_format_parquet_write_checksums \{#output_format_parquet_write_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Parquet 페이지 헤더에 CRC32 체크섬을 포함합니다.

## output_format_parquet_write_page_index \{#output_format_parquet_write_page_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Parquet 파일에 페이지 인덱스를 기록할 수 있는 기능이 추가되었습니다."}]}]}/>

Parquet 파일에 컬럼 인덱스와 오프셋 인덱스(즉, 각 데이터 페이지에 대한 통계로, 읽기 시 filter pushdown에 사용될 수 있음)를 기록합니다.

## output_format_pretty_color \{#output_format_pretty_color\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "auto"},{"label": "설정이 auto 값을 허용하도록 변경되며, 출력 대상이 tty가 아니면 ANSI 이스케이프가 비활성화됩니다"}]}]}/>

Pretty 형식에서 ANSI 이스케이프 시퀀스를 사용합니다. 0 - 비활성화, 1 - 활성화, 'auto' - 출력 대상이 터미널인 경우 활성화됩니다.

## output_format_pretty_display_footer_column_names \{#output_format_pretty_display_footer_column_names\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "행이 많을 때 푸터에 컬럼 이름을 표시하는 설정이 추가되었습니다. 임계값은 output_format_pretty_display_footer_column_names_min_rows로 제어됩니다."}]}]} />

테이블 행이 많을 때 푸터에 컬럼 이름을 표시합니다.

가능한 값:

* 0 — 푸터에 컬럼 이름을 표시하지 않습니다.
* 1 — [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) (기본값 50)에 설정된 임계값보다 행 개수가 크거나 같으면 푸터에 컬럼 이름을 표시합니다.

**예시**

쿼리:

```sql
SELECT *, toTypeName(*) FROM (SELECT * FROM system.numbers LIMIT 1000);
```

결과:

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "50"},{"label": "output_format_pretty_display_footer_column_names_min_rows의 임계값을 제어하기 위한 설정을 추가합니다. 기본값은 50입니다."}]}]}/>

[output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names) 설정이 활성화된 경우, 컬럼 이름이 포함된 푸터를 표시하기 위한 최소 행 개수를 설정합니다.

## output_format_pretty_fallback_to_vertical \{#output_format_pretty_fallback_to_vertical\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

이 설정을 활성화하면, 테이블의 열 수는 많지만 행 수가 적은 경우 Pretty 포맷이 Vertical 포맷과 동일한 방식으로 출력됩니다.  
이 동작을 세부적으로 조정하려면 `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` 및 `output_format_pretty_fallback_to_vertical_min_table_width` 설정을 참조하십시오.

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk \{#output_format_pretty_fallback_to_vertical_max_rows_per_chunk\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "100"},{"label": "A new setting"}]}]}/>

청크에 있는 레코드 수가 지정한 값 이하인 경우에만 Vertical 형식으로의 폴백(자세한 내용은 `output_format_pretty_fallback_to_vertical` 참조)이 활성화됩니다.

## output_format_pretty_fallback_to_vertical_min_columns \{#output_format_pretty_fallback_to_vertical_min_columns\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "새로운 설정"}]}]}/>

`Vertical` 포맷으로의 대체 동작(`output_format_pretty_fallback_to_vertical` 참조)은 컬럼 수가 지정된 값보다 클 때에만 활성화됩니다.

## output_format_pretty_fallback_to_vertical_min_table_width \{#output_format_pretty_fallback_to_vertical_min_table_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "250"},{"label": "A new setting"}]}]}/>

Vertical 형식으로의 폴백( `output_format_pretty_fallback_to_vertical` 참조 )은 테이블의 컬럼 길이의 합이 지정된 값 이상이거나, 값 중 적어도 하나에 줄바꿈 문자가 포함된 경우에만 활성화됩니다.

## output_format_pretty_glue_chunks \{#output_format_pretty_glue_chunks\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "Pretty 포맷을 더 보기 좋게 만드는 새로운 설정입니다."}]}]}/>

Pretty 포맷으로 렌더링되는 데이터가 여러 개의 청크로 도착하며, 지연이 있더라도 다음 청크의 컬럼 너비가 이전 청크와 동일한 경우 ANSI 이스케이프 시퀀스를 사용하여 이전 행으로 이동한 뒤 이전 청크의 푸터를 덮어써 새 청크의 데이터를 이어서 표시합니다. 이렇게 하면 결과가 시각적으로 더 보기 좋아집니다.

0 - 비활성화, 1 - 활성화, 'auto' - 터미널인 경우 활성화됩니다.

## output_format_pretty_grid_charset \{#output_format_pretty_grid_charset\}

<SettingsInfoBlock type="String" default_value="UTF-8" />

그리드 테두리를 출력할 때 사용할 문자 집합입니다. 사용 가능한 문자 집합은 ASCII, UTF-8(기본값)입니다.

## output_format_pretty_highlight_digit_groups \{#output_format_pretty_highlight_digit_groups\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "이 설정이 활성화되어 있고 출력이 터미널인 경우, 천 단위, 백만 단위 등의 자리수를 나타내는 각 숫자에 밑줄을 그어 강조합니다."}]}]}/>

이 설정이 활성화되어 있고 출력이 터미널인 경우, 천 단위, 백만 단위 등의 자리수를 나타내는 각 숫자에 밑줄을 그어 강조합니다.

## output_format_pretty_highlight_trailing_spaces \{#output_format_pretty_highlight_trailing_spaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "새로운 설정입니다."}]}]}/>

이 설정이 활성화되어 있고 출력이 터미널인 경우, 행 끝 공백 문자를 회색으로 표시하고 밑줄을 그어 강조합니다.

## output_format_pretty_max_column_name_width_cut_to \{#output_format_pretty_max_column_name_width_cut_to\}

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "24"},{"label": "새 설정"}]}]}/>

컬럼 이름이 너무 길면 이 길이로 잘립니다.
컬럼 길이가 `output_format_pretty_max_column_name_width_cut_to`와 `output_format_pretty_max_column_name_width_min_chars_to_cut`의 합보다 길면 잘립니다.

## output_format_pretty_max_column_name_width_min_chars_to_cut \{#output_format_pretty_max_column_name_width_min_chars_to_cut\}

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "4"},{"label": "새로운 설정"}]}]}/>

컬럼 이름이 너무 긴 경우 잘라낼 최소 문자 수입니다.
컬럼 이름의 길이가 `output_format_pretty_max_column_name_width_cut_to` 값과 `output_format_pretty_max_column_name_width_min_chars_to_cut` 값을 합한 길이보다 길면 잘립니다.

## output_format_pretty_max_column_pad_width \{#output_format_pretty_max_column_pad_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

Pretty 포맷에서 컬럼의 모든 값을 패딩하여 정렬할 때 사용할 최대 너비입니다.

## output_format_pretty_max_rows \{#output_format_pretty_max_rows\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1000"},{"label": "사용성이 향상됩니다. 스크롤해야 하는 양이 줄어듭니다."}]}]}/>

Pretty 형식의 행 수 제한입니다.

## output_format_pretty_max_value_width \{#output_format_pretty_max_value_width\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Pretty 형식에서 표시할 값의 최대 너비입니다. 이 값을 초과하면 잘려서 표시됩니다.
값이 0이면 값을 절대 자르지 않습니다.

## output_format_pretty_max_value_width_apply_for_single_value \{#output_format_pretty_max_value_width_apply_for_single_value\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Pretty 포맷에서 단일 값은 잘리지 않습니다."}]}]}/>

값은 블록 내에서 단일 값이 아닐 때에만 잘라냅니다(`output_format_pretty_max_value_width` 설정 참조). 블록에 단일 값만 있을 경우에는 전체를 출력하며, 이는 `SHOW CREATE TABLE` 쿼리에 유용합니다.

## output_format_pretty_multiline_fields \{#output_format_pretty_multiline_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

이 설정을 활성화하면 Pretty 포맷에서 여러 줄 필드를 테이블 셀 내부에 렌더링하여 테이블의 형태가 유지됩니다.  
비활성화하면 여러 줄 필드가 있는 그대로 렌더링되어 테이블이 일그러질 수 있습니다(비활성 상태를 유지하는 장점 중 하나는 여러 줄 값을 복사·붙여넣기 하기가 더 쉬워진다는 점입니다).

## output_format_pretty_named_tuples_as_json \{#output_format_pretty_named_tuples_as_json\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Pretty 형식에서 named tuple을 JSON 객체로 출력할지 여부를 제어하는 새로운 설정"}]}]}/>

Pretty 형식에서 named tuple이 사람이 읽기 쉬운 JSON 객체로 출력될지 여부를 제어합니다.

## output_format_pretty_row_numbers \{#output_format_pretty_row_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "사용성이 향상됩니다."}]}]}/>

Pretty 출력 형식에서 각 행 앞에 행 번호를 추가합니다.

## output_format_pretty_single_large_number_tip_threshold \{#output_format_pretty_single_large_number_tip_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1000000"},{"label": "블록이 0을 제외하고 이 값을 초과하는 단일 숫자로만 구성된 경우, 테이블 오른쪽에 읽기 쉬운 숫자 팁을 출력합니다."}]}]}/>

블록이 0을 제외하고 이 값을 초과하는 단일 숫자로만 구성된 경우, 테이블 오른쪽에 읽기 쉬운 숫자 팁을 출력합니다.

## output_format_pretty_squash_consecutive_ms \{#output_format_pretty_squash_consecutive_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "50"},{"label": "새 설정 추가"}]}]}/>

다음 블록을 최대 지정된 밀리초 동안 대기한 후, 기록하기 전에 이전 블록에 병합합니다.
이 설정은 너무 작은 블록이 자주 출력되는 것을 방지하면서도 데이터를 스트리밍 방식으로 표시할 수 있게 합니다.

## output_format_pretty_squash_max_wait_ms \{#output_format_pretty_squash_max_wait_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Add new setting"}]}]}/>

이전 출력 이후 지정된 밀리초 수가 경과하면 Pretty 형식으로 대기 중인 블록을 출력합니다.

## output_format_protobuf_nullables_with_google_wrappers \{#output_format_protobuf_nullables_with_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

Google wrapper를 사용하여 널 허용 컬럼을 직렬화할 때, 기본값을 비어 있는 wrapper로 직렬화하도록 합니다. 이 설정을 비활성화하면 기본값과 null 값은 직렬화되지 않습니다.

## output_format_schema \{#output_format_schema\}

자동으로 생성된 스키마를 [Cap'n Proto](/interfaces/formats/CapnProto) 또는 [Protobuf](/interfaces/formats/Protobuf) 형식으로 저장할 파일의 경로를 지정합니다.

## output_format_sql_insert_include_column_names \{#output_format_sql_insert_include_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

INSERT 쿼리에 컬럼 이름을 포함합니다.

## output_format_sql_insert_max_batch_size \{#output_format_sql_insert_max_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

INSERT 문 하나에 포함될 수 있는 최대 행 수입니다.

## output_format_sql_insert_quote_names \{#output_format_sql_insert_quote_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

컬럼 이름을 ` 문자로 둘러쌉니다

## output_format_sql_insert_table_name \{#output_format_sql_insert_table_name\}

<SettingsInfoBlock type="String" default_value="table" />

출력되는 INSERT 쿼리에서 사용할 테이블 이름입니다.

## output_format_sql_insert_use_replace \{#output_format_sql_insert_use_replace\}

<SettingsInfoBlock type="Bool" default_value="0" />

INSERT 대신 REPLACE 문을 사용합니다

## output_format_tsv_crlf_end_of_line \{#output_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

true로 설정하면 TSV 형식에서 줄 끝이 \\n 대신 \\r\\n으로 사용됩니다.

## output_format_values_escape_quote_with_quote \{#output_format_values_escape_quote_with_quote\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "값이 true이면 '을 ''로 이스케이프하고, 그렇지 않으면 \\'로 감쌉니다"}]}]}/>

값이 true이면 '을 ''로 이스케이프하고, 그렇지 않으면 \\'로 감쌉니다

## output_format_write_statistics \{#output_format_write_statistics\}

<SettingsInfoBlock type="Bool" default_value="1" />

지원되는 출력 형식에서는 읽은 행 수, 바이트 수, 경과 시간에 대한 통계를 기록합니다.

기본적으로 활성화됩니다.

## precise_float_parsing \{#precise_float_parsing\}

<SettingsInfoBlock type="Bool" default_value="0" />

보다 정밀하지만 더 느린 float 파싱 알고리즘을 선호합니다

## schema_inference_hints \{#schema_inference_hints\}

스키마가 없는 형식에서 스키마 추론 시 힌트로 사용할 컬럼 이름과 데이터 타입의 목록입니다.

예:

쿼리:

```sql
desc format(JSONEachRow, '{"x" : 1, "y" : "String", "z" : "0.0.0.0" }') settings schema_inference_hints='x UInt8, z IPv4';
```

결과:

```sql
x   UInt8
y   Nullable(String)
z   IPv4
```

:::note
`schema_inference_hints`의 형식이 올바르지 않거나, 오타 또는 잘못된 데이터 타입 등이 있는 경우 전체 `schema_inference_hints`가 무시됩니다.
:::


## schema_inference_make_columns_nullable \{#schema_inference_make_columns_nullable\}

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

스키마 추론(schema inference) 시 추론된 타입을 `Nullable`로 만들지 여부를 제어합니다.
가능한 값:

* 0 - 추론된 타입은 절대 `Nullable`이 되지 않습니다(이 경우 null 값을 어떻게 처리할지는 input_format_null_as_default 설정으로 제어합니다),
 * 1 - 모든 추론된 타입이 `Nullable`이 됩니다,
 * 2 또는 `auto` - 추론된 타입은 스키마 추론 중에 파싱되는 샘플에서 해당 컬럼에 `NULL`이 포함되거나 파일 메타데이터에 컬럼 널 허용 여부 정보가 있는 경우에만 `Nullable`이 됩니다,
 * 3 - 형식에 파일 메타데이터가 존재하는 경우(예: Parquet)에는 추론된 타입의 널 허용 여부가 파일 메타데이터와 일치하며, 그렇지 않은 경우(예: CSV)에는 항상 `Nullable`이 됩니다.

## schema_inference_make_json_columns_nullable \{#schema_inference_make_json_columns_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

스키마 추론(schema inference) 시 추론된 JSON 타입을 `Nullable`로 만들지 여부를 제어합니다.
이 설정을 schema_inference_make_columns_nullable과 함께 사용하면, 추론된 JSON 타입이 `Nullable`이 됩니다.

## schema_inference_mode \{#schema_inference_mode\}

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

스키마 추론 모드입니다. `default` — 모든 파일이 동일한 스키마를 가진다고 가정하고, 어떤 파일에서든 스키마를 추론합니다. `union` — 파일들이 서로 다른 스키마를 가질 수 있으며, 결과 스키마는 모든 파일의 스키마를 합집합한 형태가 됩니다.

## show_create_query_identifier_quoting_rule \{#show_create_query_identifier_quoting_rule\}

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

SHOW CREATE 쿼리에서 식별자에 사용할 따옴표 규칙을 설정합니다

## show_create_query_identifier_quoting_style \{#show_create_query_identifier_quoting_style\}

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

SHOW CREATE 쿼리에서 식별자에 사용할 인용부호 스타일을 설정합니다.

## type_json_allow_duplicated_key_with_literal_and_nested_object \{#type_json_allow_duplicated_key_with_literal_and_nested_object\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 `{"a" : 42, "a" : {"b" : 42}}`처럼 일부 키가 중복되어 있으나 그중 하나가 중첩된 객체인 JSON도 파싱되도록 허용됩니다.

## type_json_skip_duplicated_paths \{#type_json_skip_duplicated_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면 JSON 객체를 JSON 타입으로 파싱할 때 중복된 경로는 무시되며, 예외가 발생하는 대신 처음 나타난 경로만 삽입됩니다.

## type_json_skip_invalid_typed_paths \{#type_json_skip_invalid_typed_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

이 설정을 활성화하면, typed path가 지정된 JSON 타입 컬럼에서 선언된 타입으로 형 변환할 수 없는 값을 가진 필드는 오류를 발생시키는 대신 건너뜁니다. 건너뛴 필드는 누락된 것으로 처리되며, typed path 정의에 따라 기본값/NULL 값을 사용합니다.

이 SETTING은 특정 경로에 선언된 타입이 있는 JSON 타입 컬럼(예: JSON(a Int64, b String))에만 적용됩니다. 일반적인 typed 컬럼에 데이터를 삽입할 때 사용하는 JSONEachRow와 같은 일반 JSON 입력 포맷에는 적용되지 않습니다.

가능한 값:

+ 0 — 비활성화(타입 불일치 시 오류 발생).
+ 1 — 활성화(타입 불일치 시 필드를 건너뜀).

## type_json_use_partial_match_to_skip_paths_by_regexp \{#type_json_use_partial_match_to_skip_paths_by_regexp\}

<SettingsInfoBlock type="Bool" default_value="1" />

이 설정을 활성화하면 JSON 객체를 JSON 타입으로 파싱할 때, SKIP REGEXP로 지정된 정규 표현식이 경로를 건너뛰는 데 부분 일치를 요구합니다. 비활성화하면 전체 일치가 필요합니다.

## validate_experimental_and_suspicious_types_inside_nested_types \{#validate_experimental_and_suspicious_types_inside_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

Array/Map/Tuple과 같은 중첩 타입 내부에서 실험적이거나 의심스러운 타입의 사용을 검증합니다.