---
alias: []
description: 'Pretty 형식에 대한 문서'
input_format: false
keywords: ['Pretty']
output_format: true
slug: /interfaces/formats/Pretty
title: 'Pretty'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 설명 \{#description\}

`Pretty` 포맷은 터미널에서 색상을 표시하기 위해 ANSI 이스케이프 시퀀스를 사용하여, 
데이터를 유니코드 아트(Unicode-art) 스타일의 테이블 형태로 출력합니다.
테이블의 전체 그리드를 그리며, 각 행은 터미널에서 두 줄을 차지합니다.
각 결과 블록은 개별 테이블로 출력됩니다. 
이는 값들의 표시 폭을 미리 계산하기 위해 결과를 버퍼링할 필요 없이, 블록을 바로바로 출력할 수 있도록 하기 위해서입니다.

[NULL](/sql-reference/syntax.md)은 `ᴺᵁᴸᴸ`로 출력됩니다.



## 사용 예시 \{#example-usage\}

예시([`PrettyCompact`](./PrettyCompact.md) 형식의 출력 예시):

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`Pretty` 형식에서는 행이 이스케이프 처리되지 않습니다. 다음 예시는 [`PrettyCompact`](./PrettyCompact.md) 형식의 예시입니다:

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

터미널에 너무 많은 데이터를 출력하지 않도록 처음 `10,000`개의 행만 출력합니다.
행의 개수가 `10,000` 이상이면 &quot;Showed first 10 000&quot;라는 메시지가 출력됩니다.

:::note
이 포맷은 쿼리 결과를 출력하는 데에만 적합하며, 데이터를 파싱하는 용도로는 적합하지 않습니다.
:::

Pretty 포맷은 총합 값(`WITH TOTALS` 사용 시)과 극값(&#39;extremes&#39;가 1로 설정된 경우) 출력도 지원합니다.
이 경우, 총합 값과 극값은 메인 데이터 이후에 별도의 테이블로 출력됩니다.
다음 예시는 [`PrettyCompact`](./PrettyCompact.md) 포맷을 사용하여 이를 보여줍니다:

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


## 형식 설정 \{#format-settings\}

<PrettyFormatSettings/>
