---
alias: []
description: 'TemplateIgnoreSpaces 형식에 대한 문서'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✗      |       |



## Description \{#description\}

[`Template`]와 유사하지만, 입력 스트림에서 구분자와 값 사이의 공백 문자를 건너뜁니다. 
단, 포맷 문자열에 공백 문자가 포함되어 있는 경우에는 해당 공백 문자가 입력 스트림에도 존재해야 합니다. 
또한 빈 플레이스홀더(`${}` 또는 `${:None}`)를 지정하여 일부 구분자를 별도의 파트로 분리함으로써 그 사이의 공백을 무시할 수 있습니다. 
이러한 플레이스홀더는 공백 문자를 건너뛰는 용도로만 사용됩니다.
모든 행에서 컬럼 값의 순서가 동일하다면, 이 포맷을 사용해 `JSON`을 읽을 수 있습니다.

:::note
이 포맷은 입력용으로만 적합합니다.
:::



## 사용 예시 \{#example-usage\}

다음 요청은 [JSON](/interfaces/formats/JSON) 형식 출력 예시에서 데이터를 삽입할 때 사용할 수 있습니다:

```sql
INSERT INTO table_name 
SETTINGS
    format_template_resultset = '/some/path/resultset.format',
    format_template_row = '/some/path/row.format',
    format_template_rows_between_delimiter = ','
FORMAT TemplateIgnoreSpaces
```

```text title="/some/path/resultset.format"
{${}"meta"${}:${:JSON},${}"data"${}:${}[${data}]${},${}"totals"${}:${:JSON},${}"extremes"${}:${:JSON},${}"rows"${}:${:JSON},${}"rows_before_limit_at_least"${}:${:JSON}${}}
```

```text title="/some/path/row.format"
{${}"SearchPhrase"${}:${}${phrase:JSON}${},${}"c"${}:${}${cnt:JSON}${}}
```


## 형식 설정 \{#format-settings\}