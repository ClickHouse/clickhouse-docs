---
alias: ['MD']
description: 'Markdown 형식에 대한 문서'
keywords: ['Markdown']
slug: /interfaces/formats/Markdown
title: 'Markdown'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✗     | ✔      | `MD`  |



## 설명 \{#description\}

결과를 [Markdown](https://en.wikipedia.org/wiki/Markdown) 형식으로 내보내면 `.md` 파일에 바로 붙여넣을 수 있는 출력이 생성됩니다:

Markdown 테이블은 자동으로 생성되며 GitHub와 같이 Markdown을 지원하는 플랫폼에서 사용할 수 있습니다. 이 형식은 출력에만 사용됩니다.



## 사용 예 \{#example-usage\}

```sql
SELECT
    number,
    number * 2
FROM numbers(5)
FORMAT Markdown
```

```results
| number | multiply(number, 2) |
|-:|-:|
| 0 | 0 |
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 4 | 8 |
```


## 형식 설정 \{#format-settings\}