---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 최적화'
'sidebar_position': 21
'description': 'PREWHERE는 불필요한 컬럼 데이터를 읽지 않음으로써 I/O를 줄입니다.'
'title': 'PREWHERE 최적화는 어떻게 작동합니까?'
'doc_type': 'guide'
'keywords':
- 'prewhere'
- 'query optimization'
- 'performance'
- 'filtering'
- 'best practices'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';


# PREWHERE 최적화 작동 방식은?

[PREWHERE 절](/sql-reference/statements/select/prewhere)은 ClickHouse에서 쿼리 실행을 최적화하는 기능입니다. 불필요한 데이터 읽기를 피하고 비필터 컬럼을 디스크에서 읽기 전에 관련 없는 데이터를 필터링하여 I/O를 줄이고 쿼리 속도를 향상시킵니다.

이 가이드는 PREWHERE가 어떻게 작동하는지, 그 영향을 측정하는 방법, 최상의 성능을 위해 이를 조정하는 방법을 설명합니다.

## PREWHERE 최적화 없이 쿼리 처리 {#query-processing-without-prewhere-optimization}

아래 예시를 통해 [uk_price_paid_simple](/parts) 테이블에 대한 쿼리가 PREWHERE를 사용하지 않고 어떻게 처리되는지를 보여주겠습니다:

<Image img={visual01} size="md" alt="PREWHERE 최적화 없이 쿼리 처리"/>

<br/><br/>
① 쿼리에 `town` 컬럼에 대한 필터가 포함되어 있는데, 이는 테이블의 기본 키의 일부이며 따라서 기본 인덱스의 일부이기도 합니다.

② 쿼리를 가속화하기 위해 ClickHouse는 테이블의 기본 인덱스를 메모리에 로드합니다.

③ 인덱스 항목을 스캔하여 `town` 컬럼에서 어떤 그래뉼이 조건에 맞는 행을 포함할 수 있는지를 식별합니다.

④ 이 잠재적으로 관련 있는 그래뉼들이 메모리에 로드되며, 쿼리 실행을 위해 필요한 다른 컬럼의 위치 정렬된 그래뉼과 함께 로드됩니다.

⑤ 나머지 필터는 쿼리 실행 중에 적용됩니다.

보시다시피, PREWHERE 없이 모든 잠재적으로 관련된 컬럼이 필터링 전에 로드되며, 실제로는 몇 개의 행만이 매칭됩니다.

## PREWHERE가 쿼리 효율성을 향상시키는 방법 {#how-prewhere-improves-query-efficiency}

다음 애니메이션은 모든 쿼리 조건에 PREWHERE 절이 적용된 경우 위의 쿼리가 어떻게 처리되는지를 보여줍니다.

처리의 처음 세 단계는 이전과 동일합니다:

<Image img={visual02} size="md" alt="PREWHERE 최적화를 통한 쿼리 처리"/>

<br/><br/>
① 쿼리에 `town` 컬럼에 대한 필터가 포함되어 있는데, 이는 테이블의 기본 키의 일부이자 기본 인덱스의 일부입니다.

② PREWHERE 절이 없는 실행과 유사하게, 쿼리를 가속화하기 위해 ClickHouse는 기본 인덱스를 메모리에 로드합니다.

③ 그런 다음 인덱스 항목을 스캔하여 `town` 컬럼에서 어떤 그래뉼이 조건에 맞는 행을 포함할 수 있는지를 식별합니다.

이제 PREWHERE 절 덕분에 다음 단계가 다릅니다: 모든 관련 컬럼을 미리 읽는 대신 ClickHouse는 컬럼별로 데이터를 필터링하여 진정으로 필요한 것만 로드합니다. 이는 특히 넓은 테이블에서 I/O를 대폭 줄입니다.

각 단계에서, ClickHouse는 이전 필터를 통과한 행을 포함하는 최소한의 그래뉼만 로드합니다. 그 결과, 각 필터를 위해 로드하고 평가해야 할 그래뉼의 수가 점진적으로 감소합니다:

**단계 1: 도시로 필터링**<br/>
ClickHouse는 ① `town` 컬럼에서 선택된 그래뉼을 읽고 어떤 그래뉼이 실제로 `London`과 매칭되는지를 확인하는 것으로 PREWHERE 처리를 시작합니다.

우리 예시에서는 선택된 모든 그래뉼이 일치하므로 ② 다음 필터 컬럼인 `date`에 대한 해당 위치 정렬된 그래뉼이 처리도록 선택됩니다:

<Image img={visual03} size="md" alt="단계 1: 도시로 필터링"/>

<br/><br/>
**단계 2: 날짜로 필터링**<br/>
다음으로 ClickHouse는 ① 선택된 `date` 컬럼 그래뉼을 읽고 필터 `date > '2024-12-31'`을 평가합니다.

이 경우, 세 개의 그래뉼 중 두 개가 일치하는 행을 포함하므로 ② 오직 그들의 위치 정렬된 그래뉼만이 다음 필터 컬럼인 `price`에 대한 처리에 선택됩니다:

<Image img={visual04} size="md" alt="단계 2: 날짜로 필터링"/>

<br/><br/>
**단계 3: 가격으로 필터링**<br/>
마지막으로, ClickHouse는 ① `price` 컬럼에서 선택한 두 개의 그래뉼을 읽어 마지막 필터 `price > 10_000`을 평가합니다.

두 개의 그래뉼 중 오직 하나만 일치하는 행을 포함하므로 ② 해당 위치 정렬된 그래뉼이 `SELECT` 컬럼인 `street`에 대해 추가 처리를 위해 로드되어야만 합니다:

<Image img={visual05} size="md" alt="단계 2: 가격으로 필터링"/>

<br/><br/>
최종 단계에서는 단지 매칭된 행을 포함하는 최소한의 컬럼 그래뉼 세트만 로드됩니다. 이는 메모리 사용량 감소, 디스크 I/O 감소 및 쿼리 실행 속도를 높이는 결과를 가져옵니다.

:::note PREWHERE는 읽는 데이터가 아닌 처리되는 행을 줄입니다
ClickHouse는 PREWHERE와 비PREWHERE 버전 모두에서 동일한 수의 행을 처리합니다. 그러나 PREWHERE 최적화가 적용된 경우, 처리되는 모든 행에 필요한 컬럼 값이 로드될 필요는 없습니다.
:::

## PREWHERE 최적화는 자동으로 적용됩니다 {#prewhere-optimization-is-automatically-applied}

위의 예시와 같이 PREWHERE 절을 수동으로 추가할 수 있습니다. 그러나 PREWHERE를 수동으로 작성할 필요는 없습니다. [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) 설정이 활성화되면(기본값: true), ClickHouse는 필터 조건을 WHERE에서 PREWHERE로 자동으로 이동합니다. 이는 가장 많은 읽기 볼륨을 줄이는 조건의 우선순위를 매깁니다.

작은 컬럼이 더 빠르게 스캔될 수 있으며, 큰 컬럼이 처리될 때 대부분의 그래뉼이 이미 필터링되었기 때문에 이러한 접근 방식이 유효합니다. 모든 컬럼은 동일한 수의 행을 가지므로, 컬럼의 크기는 주로 데이터 타입에 의해 결정되며, 예를 들어 `UInt8` 컬럼은 일반적으로 `String` 컬럼보다 훨씬 작습니다.

ClickHouse는 23.2 버전부터 기본적으로 이 전략을 따르며, 압축되지 않은 크기로 정렬된 다단계 처리에 대한 PREWHERE 필터 컬럼을 정렬합니다.

23.11 버전부터는 필수적인 컬럼 통계를 통해 이 점을 더욱 향상시킬 수 있으며, 단순히 컬럼 크기뿐만 아니라 실제 데이터 선택도에 따라 필터 처리 순서를 결정할 수 있습니다.

## PREWHERE 영향 측정 방법 {#how-to-measure-prewhere-impact}

PREWHERE가 쿼리를 도와주고 있는지를 검증하기 위해서는 `optimize_move_to_prewhere` 설정이 활성화된 경우와 비활성화된 경우의 쿼리 성능을 비교할 수 있습니다.

우리는 먼저 `optimize_move_to_prewhere` 설정이 비활성화된 상태에서 쿼리를 실행합니다:

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
SETTINGS optimize_move_to_prewhere = false;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.056 sec. Processed 2.31 million rows, 23.36 MB (41.09 million rows/s., 415.43 MB/s.)
Peak memory usage: 132.10 MiB.
```

ClickHouse는 쿼리 처리 중 **23.36 MB**의 컬럼 데이터를 읽했습니다.

그 다음, `optimize_move_to_prewhere` 설정이 활성화된 상태에서 쿼리를 실행합니다. (이 설정은 기본적으로 활성화되어 있어 선택적입니다):
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
SETTINGS optimize_move_to_prewhere = true;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.017 sec. Processed 2.31 million rows, 6.74 MB (135.29 million rows/s., 394.44 MB/s.)
Peak memory usage: 132.11 MiB.
```

처리된 행의 수는 동일했습니다(2.31 백만), 그러나 PREWHERE 덕분에 ClickHouse는 컬럼 데이터를 3배 이상 덜 읽었습니다—단 6.74 MB만 읽었고, 이전의 23.36 MB가 아닙니다—이는 총 런타임을 3배 줄였습니다.

ClickHouse가 PREWHERE를 뒤에서 어떻게 적용하는지 더 깊이 이해하려면 EXPLAIN 및 추적 로그를 사용할 수 있습니다.

우리는 [EXPLAIN](/sql-reference/statements/explain#explain-plan) 절을 사용하여 쿼리의 논리 계획을 검사합니다:
```sql
EXPLAIN PLAN actions = 1
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000;
```

```txt
...
Prewhere info                                                                                                                                                                                                                                          
  Prewhere filter column: 
    and(greater(__table1.date, '2024-12-31'_String), 
    less(__table1.price, 10000_UInt16), 
    equals(__table1.town, 'LONDON'_String)) 
...
```

여기서 대부분의 계획 출력은 생략하며 그 이유는 꽤 장황하기 때문입니다. 본질적으로 모든 세 개의 컬럼 조건이 자동으로 PREWHERE로 옮겨졌다는 것을 보여줍니다.

이 과정을 스스로 재현할 때, 쿼리 계획에서 이러한 조건의 순서가 컬럼의 데이터 타입 크기 기반으로 정렬되어 있다는 것을 확인할 수 있습니다. 우리는 컬럼 통계를 활성화하지 않았기 때문에 ClickHouse는 PREWHERE 처리 순서를 결정하는 대체 방법으로 크기를 사용합니다.

더욱 깊이 들어가고 싶다면 ClickHouse에 쿼리 실행 중 모든 테스트 수준 로그 항목을 반환하도록 지시하여 각 개별 PREWHERE 처리 단계를 관찰할 수 있습니다:
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
SETTINGS send_logs_level = 'test';
```

```txt
...
<Trace> ... Condition greater(date, '2024-12-31'_String) moved to PREWHERE
<Trace> ... Condition less(price, 10000_UInt16) moved to PREWHERE
<Trace> ... Condition equals(town, 'LONDON'_String) moved to PREWHERE
...
<Test> ... Executing prewhere actions on block: greater(__table1.date, '2024-12-31'_String)
<Test> ... Executing prewhere actions on block: less(__table1.price, 10000_UInt16)
...
```

## 주요 요점 {#key-takeaways}

* PREWHERE는 나중에 필터링될 컬럼 데이터를 읽지 않도록 하여 I/O 및 메모리를 절약합니다.
* `optimize_move_to_prewhere`가 활성화되어 있을 때 자동으로 작동합니다(기본값).
* 필터링 순서가 중요합니다: 작고 선택적인 컬럼이 먼저 배치되어야 합니다.
* `EXPLAIN` 및 로그를 사용하여 PREWHERE가 적용되었는지 확인하고 그 효과를 이해합니다.
* PREWHERE는 넓은 테이블과 선택적 필터를 적용한 대규모 스캔에 가장 큰 영향을 미칩니다.
