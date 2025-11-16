---
'alias': []
'description': 'TemplateIgnoreSpaces 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'TemplateIgnoreSpaces'
'output_format': false
'slug': '/interfaces/formats/TemplateIgnoreSpaces'
'title': 'TemplateIgnoreSpaces'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

[`Template`]와 유사하지만, 입력 스트림의 구분자와 값 사이에 있는 공백 문자를 건너뛰습니다. 
그러나 형식 문자열에 공백 문자가 포함되어 있는 경우, 이러한 문자는 입력 스트림에서 기대됩니다. 
또한, 구분자를 일부 분리된 부분으로 나누기 위해 공백을 무시하기 위한 `empty placeholders` (`${}` 또는 `${:None}`)를 지정할 수 있습니다. 
이러한 자리 표시자는 공백 문자를 건너뛰기 위해서만 사용됩니다.
모든 행에서 컬럼의 값이 동일한 순서를 갖는 경우, 이 형식을 사용하여 `JSON`을 읽는 것이 가능합니다.

:::note
이 형식은 입력에만 적합합니다.
:::

## 형식 설정 {#format-settings}
