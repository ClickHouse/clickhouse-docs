---
'description': 'Svg에 대한 문서'
'sidebar_label': 'SVG'
'slug': '/sql-reference/functions/geo/svg'
'title': 'Geo 데이터에서 SVG 이미지를 생성하기 위한 함수'
'doc_type': 'reference'
---

## Svg {#svg}

Geo 데이터로부터 선택된 SVG 요소 태그의 문자열을 반환합니다.

**구문**

```sql
Svg(geometry,[style])
```

별칭: `SVG`, `svg`

**매개변수**

- `geometry` — Geo 데이터. [Geo](../../data-types/geo).
- `style` — 선택적 스타일 이름. [String](../../data-types/string).

**반환 값**

- 기하의 SVG 표현. [String](../../data-types/string).
  - SVG 원
  - SVG 다각형
  - SVG 경로

**예제**

**원**

쿼리:

```sql
SELECT SVG((0., 0.))
```

결과:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**다각형**

쿼리:

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

결과:

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**경로**

쿼리:

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

결과:

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```
