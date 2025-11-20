---
'alias': []
'description': 'JSONEachRowWithProgress 형식에 대한 Documentation'
'input_format': false
'keywords':
- 'JSONEachRowWithProgress'
'output_format': true
'slug': '/interfaces/formats/JSONEachRowWithProgress'
'title': 'JSONEachRowWithProgress'
'doc_type': 'reference'
---

| 입력    | 출력    | 별칭  |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

[`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md)와 다른 점은 ClickHouse가 JSON 값으로 진행 정보를 추가로 출력한다는 것입니다.

## 예제 사용법 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## 형식 설정 {#format-settings}
