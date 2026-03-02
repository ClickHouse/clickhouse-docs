---
alias: []
description: 'Values 형식에 대한 문서'
input_format: true
keywords: ['Values']
output_format: true
slug: /interfaces/formats/Values
title: 'Values'
doc_type: 'guide'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description \{#description\}

`Values` 형식은 각 행을 괄호로 감싸서 출력합니다. 

- 행은 서로 콤마로 구분되며, 마지막 행 뒤에는 콤마가 없습니다. 
- 괄호 안의 값들도 콤마로 구분됩니다. 
- 숫자는 따옴표 없이 10진수 형식으로 출력됩니다. 
- 배열은 대괄호로 출력됩니다. 
- 문자열, 날짜, 날짜와 시간이 포함된 값은 따옴표로 출력됩니다. 
- 이스케이프 규칙과 파싱 방식은 [TabSeparated](TabSeparated/TabSeparated.md) 형식과 유사합니다.

서식 지정 시에는 불필요한 공백이 삽입되지 않지만, 파싱 시에는 공백이 허용되며 무시됩니다(배열 값 내부의 공백은 허용되지 않습니다). 
[`NULL`](/sql-reference/syntax.md)은 `NULL`로 표현됩니다.

`Values` 형식으로 데이터를 전달할 때 이스케이프해야 하는 최소 문자 집합은 다음과 같습니다: 
- 작은따옴표
- 백슬래시

이 형식은 `INSERT INTO t VALUES ...`에서 사용되지만, 쿼리 결과를 서식 지정하는 데에도 사용할 수 있습니다.



## 사용 예 \{#example-usage\}



## Format settings \{#format-settings\}

| Setting                                                                                                                                                     | Description                                                                                                                                                                                   | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | 필드를 스트리밍 파서로 파싱할 수 없을 경우 SQL 파서를 실행하여 해당 값을 SQL 표현식으로 해석하려고 시도합니다.                                                                                 | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | 필드를 스트리밍 파서로 파싱할 수 없을 경우 SQL 파서를 실행하여 SQL 표현식의 템플릿을 유추한 뒤, 이 템플릿을 사용해 모든 행을 파싱하고 모든 행에 대한 표현식을 해석하려고 시도합니다.          | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | 템플릿을 사용해 표현식을 파싱하고 해석할 때, 잠재적인 오버플로 및 정밀도 문제를 피하기 위해 리터럴의 실제 타입을 확인합니다.                                                                   | `true`  |
