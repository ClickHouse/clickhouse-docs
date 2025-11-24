---
'alias': []
'description': 'JSONCompactStringsEachRowWithProgress 형식에 대한 문서'
'input_format': true
'keywords':
- 'JSONCompactStringsEachRowWithProgress'
'output_format': true
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithProgress'
'title': 'JSONCompactStringsEachRowWithProgress'
'doc_type': 'reference'
---

| Input | Output  | Alias  |
|-------|---------|--------|
| ✗     | ✔       |        |

## 설명 {#description}

[`JSONCompactEachRowWithProgress`](/interfaces/formats/JSONCompactEachRowWithProgress)와 유사하지만, 모든 값이 문자열로 변환됩니다.
이는 모든 데이터 유형에 대해 일관된 문자열 표현이 필요할 때 유용합니다.

주요 기능:
- `JSONCompactEachRowWithProgress`와 동일한 구조
- 모든 값이 문자열로 표현됨 (숫자, 배열 등은 모두 따옴표로 묶인 문자열)
- 진행 상태 업데이트, 총계 및 예외 처리를 포함
- 문자열 기반 데이터를 선호하거나 요구하는 클라이언트에 유용

## 예제 사용법 {#example-usage}

### 데이터 삽입 {#inserting-data}

```sql title="Query"
SELECT *
FROM generateRandom('a Array(Int8), d Decimal32(4), c Tuple(DateTime64(3), UUID)', 1, 10, 2)
LIMIT 5
FORMAT JSONCompactStringsEachRowWithProgress
```

```response title="Response"
{"meta":[{"name":"a","type":"Array(Int8)"},{"name":"d","type":"Decimal(9, 4)"},{"name":"c","type":"Tuple(DateTime64(3), UUID)"}]}
{"row":["[-8]", "46848.5225", "('2064-06-11 14:00:36.578','b06f4fa1-22ff-f84f-a1b7-a5807d983ae6')"]}
{"row":["[-76]", "-85331.598", "('2038-06-16 04:10:27.271','2bb0de60-3a2c-ffc0-d7a7-a5c88ed8177c')"]}
{"row":["[-32]", "-31470.8994", "('2027-07-18 16:58:34.654','1cdbae4c-ceb2-1337-b954-b175f5efbef8')"]}
{"row":["[-116]", "32104.097", "('1979-04-27 21:51:53.321','66903704-3c83-8f8a-648a-da4ac1ffa9fc')"]}
{"row":["[]", "2427.6614", "('1980-04-24 11:30:35.487','fee19be8-0f46-149b-ed98-43e7455ce2b2')"]}
{"progress":{"read_rows":"5","read_bytes":"184","total_rows_to_read":"5","elapsed_ns":"191151"}}
{"rows_before_limit_at_least":5}
```

## 형식 설정 {#format-settings}
