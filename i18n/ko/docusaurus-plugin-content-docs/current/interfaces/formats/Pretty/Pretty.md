---
'alias': []
'description': 'Pretty 형식에 대한 문서'
'input_format': false
'keywords':
- 'Pretty'
'output_format': true
'slug': '/interfaces/formats/Pretty'
'title': '예쁜'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Description {#description}

`Pretty` 형식은 데이터를 유니코드 아트 테이블로 출력하며, 
단말기에서 색상을 표시하기 위해 ANSI-이스케이프 시퀀스를 사용합니다. 
테이블의 전체 격자가 그려지며, 각 행은 단말기에서 두 줄을 차지합니다. 
각 결과 블록은 별도의 테이블로 출력됩니다. 
이것은 블록이 결과를 버퍼링하지 않고 출력될 수 있도록 필요합니다 (모든 값의 가시 너비를 미리 계산하기 위해 버퍼링이 필요할 수 있습니다).

[NULL](/sql-reference/syntax.md)는 `ᴺᵁᴸᴸ`로 출력됩니다.

## Example usage {#example-usage}

예시 ( [`PrettyCompact`](./PrettyCompact.md) 형식에 대해 보여줌):

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

행은 `Pretty` 형식 중 어떤 것도 이스케이프되지 않습니다. 다음 예시는 [`PrettyCompact`](./PrettyCompact.md) 형식에 대해 보여집니다:

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

단말기로 너무 많은 데이터를 출력하는 것을 피하기 위해, 처음 `10,000` 행만 인쇄됩니다. 
행의 수가 `10,000` 이상인 경우 "첫 번째 10 000을 표시했습니다."라는 메시지가 인쇄됩니다.

:::note
이 형식은 쿼리 결과를 출력하는 데만 적합하며, 데이터를 파싱하는 데는 적합하지 않습니다.
:::

Pretty 형식은 총 값 출력 ( `WITH TOTALS` 사용 시) 및 극단값 출력 ( 'extremes'가 1로 설정된 경우)을 지원합니다. 
이러한 경우 총 값과 극단값은 주요 데이터 이후에 별도의 테이블로 출력됩니다. 
다음 예시는 [`PrettyCompact`](./PrettyCompact.md) 형식을 사용합니다:

```sql title="Query"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="Response"
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1406958 │
│ 2014-03-18 │ 1383658 │
│ 2014-03-19 │ 1405797 │
│ 2014-03-20 │ 1353623 │
│ 2014-03-21 │ 1245779 │
│ 2014-03-22 │ 1031592 │
│ 2014-03-23 │ 1046491 │
└────────────┴─────────┘

Totals:
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

Extremes:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## Format settings {#format-settings}

<PrettyFormatSettings/>
