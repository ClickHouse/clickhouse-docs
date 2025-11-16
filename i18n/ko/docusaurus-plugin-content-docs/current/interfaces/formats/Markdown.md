---
'description': 'Markdown 형식에 대한 Documentation'
'keywords':
- 'Markdown'
'slug': '/interfaces/formats/Markdown'
'title': 'Markdown'
'doc_type': 'reference'
---

## 설명 {#description}

결과를 [Markdown](https://en.wikipedia.org/wiki/Markdown) 형식으로 내보낼 수 있어 `.md` 파일에 붙여넣을 준비가 된 출력을 생성할 수 있습니다:

마크다운 테이블은 자동으로 생성되며, Github와 같은 마크다운 지원 플랫폼에서 사용할 수 있습니다. 이 형식은 출력에만 사용됩니다.

## 사용 예 {#example-usage}

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

## 형식 설정 {#format-settings}
