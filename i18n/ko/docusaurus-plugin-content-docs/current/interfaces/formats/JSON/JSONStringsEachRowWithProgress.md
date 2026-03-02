---
description: 'JSONStringsEachRowWithProgress 형식에 대한 문서입니다'
keywords: ['JSONStringsEachRowWithProgress']
slug: /interfaces/formats/JSONStringsEachRowWithProgress
title: 'JSONStringsEachRowWithProgress'
doc_type: 'reference'
---



## 설명 \{#description\}

`JSONEachRow`/`JSONStringsEachRow`와는 달리, ClickHouse는 진행 상태 정보를 JSON 값 형태로도 출력합니다.



## 사용 예제 \{#example-usage\}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```


## 형식 설정 \{#format-settings\}
