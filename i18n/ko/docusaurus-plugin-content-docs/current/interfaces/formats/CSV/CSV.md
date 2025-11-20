---
'alias': []
'description': 'CSV 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'CSV'
'output_format': true
'slug': '/interfaces/formats/CSV'
'title': 'CSV'
'doc_type': 'reference'
---

## 설명 {#description}

쉼표로 구분된 값 형식 ([RFC](https://tools.ietf.org/html/rfc4180)).
형식화할 때, 행은 큰따옴표로 구분됩니다. 문자열 내의 큰따옴표는 연속으로 두 개의 큰따옴표로 출력됩니다. 
문자를 이스케이프하는 다른 규칙은 없습니다.

- 날짜 및 날짜-시간은 큰따옴표로 구분됩니다. 
- 숫자는 큰따옴표 없이 출력됩니다.
- 값은 기본적으로 `,`로 정의된 구분자 문자로 구분됩니다. 구분자 문자는 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 설정에서 정의됩니다. 
- 행은 유닉스 줄 바꿈(LF)으로 구분됩니다. 
- 배열은 CSV로 다음과 같이 직렬화됩니다: 
  - 먼저, 배열은 TabSeparated 형식으로 문자열로 직렬화됩니다.
  - 결과 문자열은 큰따옴표로 CSV에 출력됩니다.
- CSV 형식의 튜플은 별개의 컬럼으로 직렬화됩니다(즉, 튜플에서의 중첩이 사라집니다).

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
기본적으로 구분자는 `,` 입니다.
자세한 내용은 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 설정을 참조하세요.
:::

파싱할 때, 모든 값은 큰따옴표가 있거나 없이 파싱될 수 있습니다. 두 종류의 큰따옴표와 작은따옴표가 모두 지원됩니다.

행은 큰따옴표 없이 배치될 수도 있습니다. 이 경우, 구분자 문자 또는 줄 바꿈(CR 또는 LF)까지 파싱됩니다.
하지만 RFC를 위반하며, 큰따옴표 없이 행을 파싱할 때, 선행 및 후행 공백과 탭은 무시됩니다.
줄 바꿈은 유닉스(LF), 윈도우(CR LF) 및 맥 OS 클래식(CR LF) 유형을 지원합니다.

`NULL`은 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) 설정에 따라 형식화됩니다(기본값은 `\N`입니다).

입력 데이터에서 `ENUM` 값은 이름 또는 ID로 표현될 수 있습니다. 
첫 번째로, 입력 값을 ENUM 이름과 일치시키려 시도합니다. 
실패할 경우 입력 값이 숫자면, 이 숫자를 ENUM ID와 일치시키려 시도합니다.
입력 데이터가 오직 ENUM ID로만 이루어져 있다면, `ENUM` 파싱을 최적화하기 위해 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) 설정을 활성화하는 것이 좋습니다.

## 사용 예제 {#example-usage}

## 형식 설정 {#format-settings}

| 설정                                                                                                                                                            | 설명                                                                                                           | 기본값  | 비고                                                                                                                                                                                        |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSV 데이터에서 구분자로 간주할 문자입니다.                                                                       | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 작은따옴표로 된 문자열 허용.                                                                                    | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 큰따옴표로 된 문자열 허용.                                                                                    | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 형식에서의 사용자 정의 NULL 표현.                                                                           | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV 입력의 빈 필드를 기본값으로 처리.                                                                          | `true`  | 복잡한 기본 표현식의 경우, [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 활성화해야 합니다. | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV 형식에서 입력된 열거형 값을 열거형 인덱스로 처리합니다.                                                     | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV 형식에서 스키마를 추론하기 위한 몇 가지 수정 및 휴리스틱을 사용합니다. 비활성화할 경우, 모든 필드는 문자열로 추론됩니다. | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSV에서 배열을 읽을 때, 그 요소들이 중첩 CSV로 직렬화되었고 문자열로 넣어졌다고 기대합니다.                      | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | 이를 true로 설정하면, CSV 출력 형식의 줄 끝이 `\r\n` 대신 `\n`이 됩니다.                                      | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | 데이터 시작 부분에서 지정된 수의 행을 건너뜁니다.                                                              | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV 형식에서 이름 및 유형이 있는 헤더를 자동으로 감지합니다.                                                   | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | 데이터 끝에서 후행 빈 행을 건너뜁니다.                                                                         | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 비인용 CSV 문자열에서 공백과 탭을 잘라냅니다.                                                                  | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV 문자열에서 공백 또는 탭을 필드 구분자로 사용할 수 있도록 허용합니다.                                     | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV 형식에서 가변적인 수의 열을 허용하고, 여분의 열은 무시하며 누락된 열에는 기본값을 사용합니다.              | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSV 필드 역직렬화가 잘못된 값에서 실패하면 기본값을 열에 설정할 수 있게 합니다.                               | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | 스키마 추론 시 문자열 필드에서 숫자를 유추하려고 합니다.                                                       | `false` |                                                                                                                                                                                              |
