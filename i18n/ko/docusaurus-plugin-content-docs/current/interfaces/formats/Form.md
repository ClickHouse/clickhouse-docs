---
alias: []
description: 'Form 포맷에 대한 문서'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'Form'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 \{#description\}

`Form` 포맷은 application/x-www-form-urlencoded 형식의 단일 레코드를 읽는 데 사용할 수 있습니다. 
이 형식에서는 데이터가 `key1=value1&key2=value2`와 같이 구성됩니다.

## 사용 예시 \{#example-usage\}

`user_files` 경로에 URL로 인코딩된 데이터가 들어 있는 `data.tmp` 파일이 있다고 가정합니다:

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


## 포맷 설정 \{#format-settings\}