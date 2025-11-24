---
'slug': '/guides/developer/understanding-query-execution-with-the-analyzer'
'sidebar_label': '쿼리 실행 이해하기 분석기로'
'title': '쿼리 실행 이해하기 분석기로'
'description': 'ClickHouse가 쿼리를 실행하는 방식을 이해하기 위해 분석기를 사용하는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'query execution'
- 'analyzer'
- 'query optimization'
- 'explain'
- 'performance'
---

import analyzer1 from '@site/static/images/guides/developer/analyzer1.png';
import analyzer2 from '@site/static/images/guides/developer/analyzer2.png';
import analyzer3 from '@site/static/images/guides/developer/analyzer3.png';
import analyzer4 from '@site/static/images/guides/developer/analyzer4.png';
import analyzer5 from '@site/static/images/guides/developer/analyzer5.png';
import Image from '@theme/IdealImage';


# 쿼리 실행 이해하기

ClickHouse는 쿼리를 매우 빠르게 처리하지만 쿼리 실행은 간단한 이야기가 아닙니다. `SELECT` 쿼리가 어떻게 실행되는지 이해해 보겠습니다. 이를 설명하기 위해 ClickHouse의 테이블에 데이터를 추가해 보겠습니다:

```sql
CREATE TABLE session_events(
   clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type String
) ORDER BY (timestamp);

INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000;
```

이제 ClickHouse에 데이터가 있으므로 몇 가지 쿼리를 실행하고 그 실행을 이해하고자 합니다. 쿼리 실행은 여러 단계로 분해됩니다. 쿼리 실행의 각 단계는 해당하는 `EXPLAIN` 쿼리를 사용하여 분석하고 문제를 해결할 수 있습니다. 이 단계들은 아래 차트에 요약되어 있습니다:

<Image img={analyzer1} alt="Explain query steps" size="md"/>

쿼리 실행 중 각 엔티티가 어떻게 작동하는지 살펴보겠습니다. 우리는 몇 가지 쿼리를 실행한 후 `EXPLAIN` 문을 사용하여 이를 검사할 것입니다.

## 파서 {#parser}

파서의 목표는 쿼리 텍스트를 AST (추상 구문 트리)로 변환하는 것입니다. 이 단계는 `EXPLAIN AST`를 사용하여 시각화할 수 있습니다:

```sql
EXPLAIN AST SELECT min(timestamp), max(timestamp) FROM session_events;

┌─explain────────────────────────────────────────────┐
│ SelectWithUnionQuery (children 1)                  │
│  ExpressionList (children 1)                       │
│   SelectQuery (children 2)                         │
│    ExpressionList (children 2)                     │
│     Function min (alias minimum_date) (children 1) │
│      ExpressionList (children 1)                   │
│       Identifier timestamp                         │
│     Function max (alias maximum_date) (children 1) │
│      ExpressionList (children 1)                   │
│       Identifier timestamp                         │
│    TablesInSelectQuery (children 1)                │
│     TablesInSelectQueryElement (children 1)        │
│      TableExpression (children 1)                  │
│       TableIdentifier session_events               │
└────────────────────────────────────────────────────┘
```

출력은 아래와 같이 시각화할 수 있는 추상 구문 트리입니다:

<Image img={analyzer2} alt="AST output" size="md"/>

각 노드는 해당하는 자식을 가지고 있으며 전체 트리는 쿼리의 전체 구조를 나타냅니다. 이는 쿼리 처리를 돕기 위한 논리적 구조입니다. 최종 사용자 관점에서는 (쿼리 실행에 관심이 없는 경우) 그다지 유용하지 않으며, 이 도구는 주로 개발자에 의해 사용됩니다.

## 분석기 {#analyzer}

ClickHouse는 현재 분석기에 대해 두 가지 아키텍처를 가지고 있습니다. `enable_analyzer=0`을 설정하여 이전 아키텍처를 사용할 수 있습니다. 새로운 아키텍처는 기본적으로 활성화되어 있습니다. 기존의 아키텍처는 새로운 분석기가 일반적으로 사용 가능해지는 대로 사용 중단될 것이므로 여기서는 새로운 아키텍처만 설명할 것입니다.

:::note
새 아키텍처는 ClickHouse의 성능을 개선하기 위한 더 나은 프레임워크를 제공해야 합니다. 하지만 쿼리 처리 단계의 기본 구성 요소이기 때문에 일부 쿼리에 부정적인 영향을 미칠 수도 있으며, [알려진 불일치](/operations/analyzer#known-incompatibilities)가 있습니다. 쿼리 또는 사용자 수준에서 `enable_analyzer` 설정을 변경하여 이전 분석기로 되돌릴 수 있습니다.
:::

분석기는 쿼리 실행의 중요한 단계입니다. AST를 쿼리 트리로 변환합니다. AST에 대한 쿼리 트리의 주요 이점은 많은 구성 요소가 해결된다는 것입니다. 예를 들어, 어떤 테이블에서 읽어야 할지, 별칭도 해결되며, 트리는 사용되는 다양한 데이터 유형을 알고 있습니다. 이러한 모든 이점을 통해 분석기는 최적화를 적용할 수 있습니다. 이러한 최적화는 "패스"를 통해 작동하며, 각 패스는 다른 최적화를 찾습니다. 모든 패스를 [여기](https://github.com/ClickHouse/ClickHouse/blob/76578ebf92af3be917cd2e0e17fea2965716d958/src/Analyzer/QueryTreePassManager.cpp#L249)에서 볼 수 있으며, 이전 쿼리를 사용하여 이를 실제로 살펴봅시다:

```sql
EXPLAIN QUERY TREE passes=0 SELECT min(timestamp) AS minimum_date, max(timestamp) AS maximum_date FROM session_events SETTINGS allow_experimental_analyzer=1;

┌─explain────────────────────────────────────────────────────────────────────────────────┐
│ QUERY id: 0                                                                            │
│   PROJECTION                                                                           │
│     LIST id: 1, nodes: 2                                                               │
│       FUNCTION id: 2, alias: minimum_date, function_name: min, function_type: ordinary │
│         ARGUMENTS                                                                      │
│           LIST id: 3, nodes: 1                                                         │
│             IDENTIFIER id: 4, identifier: timestamp                                    │
│       FUNCTION id: 5, alias: maximum_date, function_name: max, function_type: ordinary │
│         ARGUMENTS                                                                      │
│           LIST id: 6, nodes: 1                                                         │
│             IDENTIFIER id: 7, identifier: timestamp                                    │
│   JOIN TREE                                                                            │
│     IDENTIFIER id: 8, identifier: session_events                                       │
│   SETTINGS allow_experimental_analyzer=1                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
EXPLAIN QUERY TREE passes=20 SELECT min(timestamp) AS minimum_date, max(timestamp) AS maximum_date FROM session_events SETTINGS allow_experimental_analyzer=1;

┌─explain───────────────────────────────────────────────────────────────────────────────────┐
│ QUERY id: 0                                                                               │
│   PROJECTION COLUMNS                                                                      │
│     minimum_date DateTime                                                                 │
│     maximum_date DateTime                                                                 │
│   PROJECTION                                                                              │
│     LIST id: 1, nodes: 2                                                                  │
│       FUNCTION id: 2, function_name: min, function_type: aggregate, result_type: DateTime │
│         ARGUMENTS                                                                         │
│           LIST id: 3, nodes: 1                                                            │
│             COLUMN id: 4, column_name: timestamp, result_type: DateTime, source_id: 5     │
│       FUNCTION id: 6, function_name: max, function_type: aggregate, result_type: DateTime │
│         ARGUMENTS                                                                         │
│           LIST id: 7, nodes: 1                                                            │
│             COLUMN id: 4, column_name: timestamp, result_type: DateTime, source_id: 5     │
│   JOIN TREE                                                                               │
│     TABLE id: 5, alias: __table1, table_name: default.session_events                      │
│   SETTINGS allow_experimental_analyzer=1                                                  │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

두 실행 사이에서 별칭과 프로젝션의 해결을 볼 수 있습니다.

## 플래너 {#planner}

플래너는 쿼리 트리를 가져와서 쿼리 계획을 생성합니다. 쿼리 트리는 특정 쿼리로 무엇을 하고 싶은지를 알려주고, 쿼리 계획은 이를 어떻게 할 것인지를 알려줍니다. 추가 최적화는 쿼리 계획의 일부로 수행됩니다. `EXPLAIN PLAN` 또는 `EXPLAIN`을 사용하여 쿼리 계획을 볼 수 있습니다 (`EXPLAIN`은 `EXPLAIN PLAN`을 실행합니다).

```sql
EXPLAIN PLAN WITH
   (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT type, min(timestamp) AS minimum_date, max(timestamp) AS maximum_date, count(*) /total_rows * 100 AS percentage FROM session_events GROUP BY type

┌─explain──────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))      │
│   Aggregating                                    │
│     Expression (Before GROUP BY)                 │
│       ReadFromMergeTree (default.session_events) │
└──────────────────────────────────────────────────┘
```

비록 이것이 일부 정보를 제공하지만, 더 많은 정보를 얻을 수 있습니다. 예를 들어, 우리가 프로젝션을 적용해야 할 컬럼의 이름을 알고 싶을 수도 있습니다. 쿼리에 헤더를 추가할 수 있습니다:

```SQL
EXPLAIN header = 1
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type

┌─explain──────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))      │
│ Header: type String                              │
│         minimum_date DateTime                    │
│         maximum_date DateTime                    │
│         percentage Nullable(Float64)             │
│   Aggregating                                    │
│   Header: type String                            │
│           min(timestamp) DateTime                │
│           max(timestamp) DateTime                │
│           count() UInt64                         │
│     Expression (Before GROUP BY)                 │
│     Header: timestamp DateTime                   │
│             type String                          │
│       ReadFromMergeTree (default.session_events) │
│       Header: timestamp DateTime                 │
│               type String                        │
└──────────────────────────────────────────────────┘
```

이제 마지막 프로젝션(`minimum_date`, `maximum_date`, `percentage`)을 생성해야 할 컬럼 이름을 알게 되었지만, 실행해야 할 모든 작업의 세부 정보도 알고 싶을 수 있습니다. 이를 위해 `actions=1`로 설정할 수 있습니다.

```sql
EXPLAIN actions = 1
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type

┌─explain────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))                                                                                                │
│ Actions: INPUT :: 0 -> type String : 0                                                                                                     │
│          INPUT : 1 -> min(timestamp) DateTime : 1                                                                                          │
│          INPUT : 2 -> max(timestamp) DateTime : 2                                                                                          │
│          INPUT : 3 -> count() UInt64 : 3                                                                                                   │
│          COLUMN Const(Nullable(UInt64)) -> total_rows Nullable(UInt64) : 4                                                                 │
│          COLUMN Const(UInt8) -> 100 UInt8 : 5                                                                                              │
│          ALIAS min(timestamp) :: 1 -> minimum_date DateTime : 6                                                                            │
│          ALIAS max(timestamp) :: 2 -> maximum_date DateTime : 1                                                                            │
│          FUNCTION divide(count() :: 3, total_rows :: 4) -> divide(count(), total_rows) Nullable(Float64) : 2                               │
│          FUNCTION multiply(divide(count(), total_rows) :: 2, 100 :: 5) -> multiply(divide(count(), total_rows), 100) Nullable(Float64) : 4 │
│          ALIAS multiply(divide(count(), total_rows), 100) :: 4 -> percentage Nullable(Float64) : 5                                         │
│ Positions: 0 6 1 5                                                                                                                         │
│   Aggregating                                                                                                                              │
│   Keys: type                                                                                                                               │
│   Aggregates:                                                                                                                              │
│       min(timestamp)                                                                                                                       │
│         Function: min(DateTime) → DateTime                                                                                                 │
│         Arguments: timestamp                                                                                                               │
│       max(timestamp)                                                                                                                       │
│         Function: max(DateTime) → DateTime                                                                                                 │
│         Arguments: timestamp                                                                                                               │
│       count()                                                                                                                              │
│         Function: count() → UInt64                                                                                                         │
│         Arguments: none                                                                                                                    │
│   Skip merging: 0                                                                                                                          │
│     Expression (Before GROUP BY)                                                                                                           │
│     Actions: INPUT :: 0 -> timestamp DateTime : 0                                                                                          │
│              INPUT :: 1 -> type String : 1                                                                                                 │
│     Positions: 0 1                                                                                                                         │
│       ReadFromMergeTree (default.session_events)                                                                                           │
│       ReadType: Default                                                                                                                    │
│       Parts: 1                                                                                                                             │
│       Granules: 1                                                                                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

이제 사용 중인 모든 입력, 함수, 별칭 및 데이터 유형을 볼 수 있습니다. 플래너가 적용할 최적화의 일부는 [여기](https://github.com/ClickHouse/ClickHouse/blob/master/src/Processors/QueryPlan/Optimizations/Optimizations.h)에서 볼 수 있습니다.

## 쿼리 파이프라인 {#query-pipeline}

쿼리 파이프라인은 쿼리 계획에서 생성됩니다. 쿼리 파이프라인은 쿼리 계획과 매우 유사하지만, 트리가 아닌 그래프입니다. ClickHouse가 쿼리를 어떻게 실행할 것인지와 어떤 자원이 사용될 것인지 강조합니다. 쿼리 파이프라인을 분석하는 것은 입력/출력 측면에서 병목 현상이 발생하는 위치를 파악하는 데 매우 유용합니다. 이전 쿼리를 사용하여 쿼리 파이프라인 실행을 살펴보겠습니다:

```sql
EXPLAIN PIPELINE
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type;

┌─explain────────────────────────────────────────────────────────────────────┐
│ (Expression)                                                               │
│ ExpressionTransform × 2                                                    │
│   (Aggregating)                                                            │
│   Resize 1 → 2                                                             │
│     AggregatingTransform                                                   │
│       (Expression)                                                         │
│       ExpressionTransform                                                  │
│         (ReadFromMergeTree)                                                │
│         MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) 0 → 1 │
└────────────────────────────────────────────────────────────────────────────┘
```

괄호 안에는 쿼리 계획 단계가 있고, 그 옆에는 프로세서가 있습니다. 이것은 좋은 정보이나 그래프이므로 이를 시각화하면 좋을 것입니다. `graph` 설정을 1로 설정하고 출력 형식을 TSV로 지정할 수 있습니다:

```sql
EXPLAIN PIPELINE graph=1 WITH
   (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT type, min(timestamp) AS minimum_date, max(timestamp) AS maximum_date, count(*) /total_rows * 100 AS percentage FROM session_events GROUP BY type FORMAT TSV;
```

```response
digraph
{
 rankdir="LR";
 { node [shape = rect]
   subgraph cluster_0 {
     label ="Expression";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n5 [label="ExpressionTransform × 2"];
     }
   }
   subgraph cluster_1 {
     label ="Aggregating";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n3 [label="AggregatingTransform"];
       n4 [label="Resize"];
     }
   }
   subgraph cluster_2 {
     label ="Expression";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n2 [label="ExpressionTransform"];
     }
   }
   subgraph cluster_3 {
     label ="ReadFromMergeTree";
     style=filled;
     color=lightgrey;
     node [style=filled,color=white];
     { rank = same;
       n1 [label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
     }
   }
 }
 n3 -> n4 [label=""];
 n4 -> n5 [label="× 2"];
 n2 -> n3 [label=""];
 n1 -> n2 [label=""];
}
```

출력 결과를 복사하여 [여기](https://dreampuf.github.io/GraphvizOnline) 붙여넣으면 다음 그래프를 생성할 수 있습니다:

<Image img={analyzer3} alt="Graph output" size="md"/>

흰색 직사각형은 파이프라인 노드에 해당하고, 회색 직사각형은 쿼리 계획 단계에 해당하며, `x` 뒤에 오는 숫자는 사용되는 입력/출력 수에 해당합니다. 콤팩트 형태로 보지 않으려면 항상 `compact=0`을 추가할 수 있습니다:

```sql
EXPLAIN PIPELINE graph = 1, compact = 0
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type
FORMAT TSV
```

```response
digraph
{
 rankdir="LR";
 { node [shape = rect]
   n0[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
   n1[label="ExpressionTransform"];
   n2[label="AggregatingTransform"];
   n3[label="Resize"];
   n4[label="ExpressionTransform"];
   n5[label="ExpressionTransform"];
 }
 n0 -> n1;
 n1 -> n2;
 n2 -> n3;
 n3 -> n4;
 n3 -> n5;
}
```

<Image img={analyzer4} alt="Compact graph output" size="md" />

ClickHouse가 왜 테이블에서 여러 스레드를 사용하여 읽지 않는지 살펴보겠습니다. 테이블에 더 많은 데이터를 추가해 보겠습니다:

```sql
INSERT INTO session_events SELECT * FROM generateRandom('clientId UUID,
   sessionId UUID,
   pageId UUID,
   timestamp DateTime,
   type Enum(\'type1\', \'type2\')', 1, 10, 2) LIMIT 1000000;
```

이제 우리의 `EXPLAIN` 쿼리를 다시 실행해 보겠습니다:

```sql
EXPLAIN PIPELINE graph = 1, compact = 0
WITH (
       SELECT count(*)
       FROM session_events
   ) AS total_rows
SELECT
   type,
   min(timestamp) AS minimum_date,
   max(timestamp) AS maximum_date,
   (count(*) / total_rows) * 100 AS percentage
FROM session_events
GROUP BY type
FORMAT TSV
```

```response
digraph
{
  rankdir="LR";
  { node [shape = rect]
    n0[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
    n1[label="MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread)"];
    n2[label="ExpressionTransform"];
    n3[label="ExpressionTransform"];
    n4[label="StrictResize"];
    n5[label="AggregatingTransform"];
    n6[label="AggregatingTransform"];
    n7[label="Resize"];
    n8[label="ExpressionTransform"];
    n9[label="ExpressionTransform"];
  }
  n0 -> n2;
  n1 -> n3;
  n2 -> n4;
  n3 -> n4;
  n4 -> n5;
  n4 -> n6;
  n5 -> n7;
  n6 -> n7;
  n7 -> n8;
  n7 -> n9;
}
```

<Image img={analyzer5} alt="Parallel graph output" size="md" />

따라서 실행기는 데이터 양이 충분히 높지 않기 때문에 작업을 병렬화하지 않기로 결정했습니다. 더 많은 행을 추가하면 실행기는 그래프에 표시된 대로 여러 스레드를 사용하기로 결정했습니다.

## 실행기 {#executor}

마지막으로, 쿼리 실행의 마지막 단계는 실행기가 수행합니다. 실행기는 쿼리 파이프라인을 가져와 실행합니다. `SELECT`, `INSERT`, 또는 `INSERT SELECT`를 수행하는지에 따라 다양한 유형의 실행기가 있습니다.
