---
'description': 'JSONStringsEachRowWithProgress 형식에 대한 문서'
'keywords':
- 'JSONStringsEachRowWithProgress'
'slug': '/interfaces/formats/JSONStringsEachRowWithProgress'
'title': 'JSONStringsEachRowWithProgress'
'doc_type': 'reference'
---

## 설명 {#description}

`JSONEachRow`/`JSONStringsEachRow`와 달리 ClickHouse는 진행 정보도 JSON 값으로 제공합니다.

## 예제 사용법 {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## 형식 설정 {#format-settings}
