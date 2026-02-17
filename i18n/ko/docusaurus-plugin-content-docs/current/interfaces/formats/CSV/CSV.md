---
alias: []
description: 'CSV 형식에 대한 문서'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---

## 설명 \{#description\}

Comma Separated Values 형식([RFC](https://tools.ietf.org/html/rfc4180))입니다.
포맷 시 각 행은 큰따옴표로 둘러싸입니다. 문자열 내부의 큰따옴표는 큰따옴표 두 개를 연속으로 출력합니다.
이외의 문자 이스케이프 규칙은 없습니다.

* 날짜와 날짜-시간 값은 큰따옴표로 둘러싸입니다.
* 숫자는 따옴표 없이 출력됩니다.
* 값은 구분 문자로 분리되며, 기본값은 `,`입니다. 구분 문자는 설정 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)에서 정의합니다.
* 행은 Unix line feed(LF)로 구분합니다.
* 배열은 CSV에서 다음과 같이 직렬화됩니다.
  * 먼저 배열을 TabSeparated 형식과 동일하게 문자열로 직렬화합니다.
  * 그런 다음 해당 문자열을 CSV에 큰따옴표로 둘러싸서 출력합니다.
* CSV 형식에서 튜플은 개별 컬럼으로 직렬화됩니다(즉, 튜플의 중첩 구조 정보는 손실됩니다).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
기본적으로 구분자는 `,`입니다.
자세한 내용은 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 설정을 참조하십시오.
:::

파싱 시 모든 값은 따옴표로 둘러싸거나 둘러싸지 않은 상태 모두로 해석할 수 있습니다. 큰따옴표와 작은따옴표 모두 지원됩니다.

행은 따옴표 없이도 구성할 수 있습니다. 이 경우 구분 문자 또는 줄 바꿈 문자(CR 또는 LF)까지를 하나의 값으로 파싱합니다.
그러나 RFC와 다르게, 따옴표 없이 행을 파싱하는 경우에는 값 앞뒤의 공백과 탭 문자는 무시됩니다.
줄 바꿈 문자는 Unix(LF), Windows(CR LF) 및 Mac OS Classic(CR LF) 형식을 지원합니다.

`NULL`은 설정 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation)에 따라 포맷됩니다(기본값은 `\N`입니다).

입력 데이터에서 `ENUM` 값은 이름 또는 ID로 표현될 수 있습니다.
먼저 입력 값을 ENUM 이름과 매칭하려고 시도합니다.
매칭에 실패하고 입력 값이 숫자인 경우 이 숫자를 ENUM ID와 매칭하려고 시도합니다.
입력 데이터에 ENUM ID만 포함되는 경우, `ENUM` 파싱을 최적화하기 위해 [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 설정을 활성화하는 것이 좋습니다.


## 사용 예 \{#example-usage\}

## 형식 설정 \{#format-settings\}

| Setting                                                                                                                                                            | Description                                                                                                        | Default | Notes                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSV 데이터에서 구분자로 간주할 문자를 지정합니다.                                                                  | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 작은따옴표로 감싼 문자열을 허용합니다.                                                                             | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 큰따옴표로 감싼 문자열을 허용합니다.                                                                               | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 형식에서 사용할 사용자 정의 NULL 표현을 설정합니다.                                                            | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV 입력에서 비어 있는 필드를 기본값으로 처리합니다.                                                              | `true`  | 복잡한 기본 표현식을 사용하는 경우 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 활성화해야 합니다. | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV 형식에서 삽입된 enum 값을 enum 인덱스로 처리합니다.                                                           | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV 형식에서 스키마 추론을 위해 일부 조정 및 휴리스틱을 사용합니다. 비활성화하면 모든 필드는 String으로 추론됩니다. | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSV에서 Array를 읽을 때, 그 요소들이 중첩된 CSV 형식으로 직렬화된 뒤 하나의 문자열로 저장된 것으로 간주합니다.   | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | `true`로 설정하면 CSV 출력 형식에서 줄 끝을 `\n` 대신 `\r\n`으로 사용합니다.                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | 데이터 시작 부분에서 지정한 개수만큼의 행을 건너뜁니다.                                                            | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV 형식에서 이름과 타입이 포함된 헤더를 자동으로 감지합니다.                                                     | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | 데이터 끝부분의 마지막에 있는 빈 행을 건너뜁니다.                                                                  | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 따옴표로 감싸지 않은 CSV 문자열에서 공백과 탭을 제거합니다.                                                       | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV 문자열에서 필드 구분자로 공백 또는 탭을 사용할 수 있도록 허용합니다.                                          | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV 형식에서 컬럼 개수가 가변적인 것을 허용하고, 초과 컬럼은 무시하며 누락된 컬럼에는 기본값을 사용합니다.        | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSV 필드를 역직렬화하는 동안 잘못된 값이 있을 때 해당 컬럼에 기본값을 설정하는 것을 허용합니다.                  | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | 스키마 추론 시 문자열 필드에서 숫자를 추론하려고 시도합니다.                                                       | `false` |                                                                                                                                                                                              |