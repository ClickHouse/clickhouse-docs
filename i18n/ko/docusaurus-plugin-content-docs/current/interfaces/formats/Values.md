---
'alias': []
'description': 'Values 형식에 대한 문서'
'input_format': true
'keywords':
- 'Values'
'output_format': true
'slug': '/interfaces/formats/Values'
'title': '값'
'doc_type': 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

`Values` 형식은 모든 행을 괄호로 출력합니다.

- 행은 마지막 행 뒤에 쉼표 없이 쉼표로 구분됩니다.
- 괄호 안의 값들도 쉼표로 구분됩니다.
- 숫자는 따옴표 없이 소수점 형식으로 출력됩니다.
- 배열은 대괄호로 출력됩니다.
- 문자열, 날짜 및 시간을 포함한 날짜는 따옴표로 출력됩니다.
- 이스케이프 규칙과 구문 분석은 [TabSeparated](TabSeparated/TabSeparated.md) 형식과 유사합니다.

형식화된 과정에서는 여분의 공백이 삽입되지 않지만, 구문 분석 과정에서는 허용되며 건너뛰어집니다(단, 배열 값 내부의 공백은 허용되지 않습니다).
[`NULL`](/sql-reference/syntax.md)는 `NULL`로 표현됩니다.

`Values` 형식으로 데이터를 전달할 때 이스케이프해야 하는 문자 최소 집합:
- 작은따옴표
- 백슬래시

이 형식은 `INSERT INTO t VALUES ...`에서 사용되지만, 쿼리 결과를 형식화하는 데에도 사용할 수 있습니다.

## 사용 예시 {#example-usage}

## 형식 설정 {#format-settings}

| 설정                                                                                                                                                     | 설명                                                                                                                                                                                     | 기본값 |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                | 필드를 스트리밍 파서로 구문 분석할 수 없는 경우, SQL 파서를 실행하고 SQL 표현식으로 해석하려고 시도합니다.                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 필드를 스트리밍 파서로 구문 분석할 수 없는 경우, SQL 파서를 실행하고 SQL 표현식의 템플릿을 유추하며 모든 행을 템플릿을 사용하여 구문 분석한 후 모든 행에 대한 표현식을 해석하려고 시도합니다. | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)       | 템플릿을 사용하여 표현식을 구문 분석하고 해석할 때, 가능한 오버플로우 및 정밀도 문제를 피하기 위해 리터럴의 실제 유형을 확인합니다.                                                    | `true`  |
