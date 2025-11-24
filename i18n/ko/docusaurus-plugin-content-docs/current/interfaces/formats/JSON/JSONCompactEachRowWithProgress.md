---
'alias': []
'description': 'JSONCompactEachRowWithProgress 형식에 대한 Documentation'
'input_format': false
'keywords':
- 'JSONCompactEachRowWithProgress'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithProgress'
'title': 'JSONCompactEachRowWithProgress'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

이 형식은 JSONCompactEachRow의 압축된 행별 출력을 스트리밍 진행 정보와 결합합니다.
메타데이터, 개별 행, 진행 업데이트, 합계 및 예외를 위한 별도의 JSON 객체로 데이터를 출력합니다. 값은 원시 타입으로 표현됩니다.

주요 기능:
- 열 이름과 타입으로 메타데이터를 먼저 출력
- 각 행은 값 배열을 포함하는 "row" 키가 있는 별도의 JSON 객체
- 쿼리 실행 중 진행 업데이트 포함 (`{"progress":...}` 객체로)
- 합계 및 극값 지원
- 값은 원시 타입을 유지 (숫자는 숫자로, 문자열은 문자열로)

## 예제 사용법 {#example-usage}

```sql title="Query"
SELECT *
FROM generateRandom('a Array(Int8), d Decimal32(4), c Tuple(DateTime64(3), UUID)', 1, 10, 2)
LIMIT 5
FORMAT JSONCompactEachRowWithProgress
```

```response title="Response"
{"meta":[{"name":"a","type":"Array(Int8)"},{"name":"d","type":"Decimal(9, 4)"},{"name":"c","type":"Tuple(DateTime64(3), UUID)"}]}
{"row":[[-8], 46848.5225, ["2064-06-11 14:00:36.578","b06f4fa1-22ff-f84f-a1b7-a5807d983ae6"]]}
{"row":[[-76], -85331.598, ["2038-06-16 04:10:27.271","2bb0de60-3a2c-ffc0-d7a7-a5c88ed8177c"]]}
{"row":[[-32], -31470.8994, ["2027-07-18 16:58:34.654","1cdbae4c-ceb2-1337-b954-b175f5efbef8"]]}
{"row":[[-116], 32104.097, ["1979-04-27 21:51:53.321","66903704-3c83-8f8a-648a-da4ac1ffa9fc"]]}
{"row":[[], 2427.6614, ["1980-04-24 11:30:35.487","fee19be8-0f46-149b-ed98-43e7455ce2b2"]]}
{"progress":{"read_rows":"5","read_bytes":"184","total_rows_to_read":"5","elapsed_ns":"335771"}}
{"rows_before_limit_at_least":5}
```

## 형식 설정 {#format-settings}
