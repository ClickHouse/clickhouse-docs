---
'alias': []
'description': 'Form 형식에 대한 문서'
'input_format': true
'keywords':
- 'Form'
'output_format': false
'slug': '/interfaces/formats/Form'
'title': '양식'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

`Form` 형식은 데이터가 `key1=value1&key2=value2` 형식으로 포맷된 application/x-www-form-urlencoded 형식의 단일 레코드를 읽는 데 사용할 수 있습니다.

## 예제 사용법 {#example-usage}

URL 인코딩된 데이터가 포함된 `user_files` 경로에 위치한 파일 `data.tmp`가 주어졌습니다:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Query"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Response"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## 형식 설정 {#format-settings}
