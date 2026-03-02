---
description: 'EXPLAIN SQL 문에 대한 문서'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'EXPLAIN SQL 문'
doc_type: 'reference'
---

SQL 문의 실행 계획을 보여줍니다.

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/hP6G2Nlz_cA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

구문:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

예:

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) UNION ALL SELECT sum(number) FROM numbers(10) ORDER BY sum(number) ASC FORMAT TSV;
```

```sql
Union
  Expression (Projection)
    Expression (Before ORDER BY and SELECT)
      Aggregating
        Expression (Before GROUP BY)
          SettingQuotaAndLimits (Set limits and quota after reading from storage)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (Merge sorted streams for ORDER BY)
      MergeSorting (Merge sorted blocks for ORDER BY)
        PartialSorting (Sort each block for ORDER BY)
          Expression (Before ORDER BY and SELECT)
            Aggregating
              Expression (Before GROUP BY)
                SettingQuotaAndLimits (Set limits and quota after reading from storage)
                  ReadFromStorage (SystemNumbers)
```


## EXPLAIN 유형 \{#explain-types\}

- `AST` — 추상 구문 트리 (Abstract Syntax Tree).
- `SYNTAX` — AST 수준 최적화 이후의 쿼리 텍스트.
- `QUERY TREE` — Query Tree 수준 최적화 이후의 쿼리 트리.
- `PLAN` — 쿼리 실행 계획.
- `PIPELINE` — 쿼리 실행 파이프라인.

### EXPLAIN AST \{#explain-ast\}

쿼리의 AST를 출력합니다. `SELECT`뿐만 아니라 모든 유형의 쿼리를 지원합니다.

설정:

* `graph` – AST를 [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) 그래프 기술 언어로 표현된 그래프로 출력합니다. 기본값: 0.

예시:

```sql
EXPLAIN AST SELECT 1;
```

```sql
SelectWithUnionQuery (children 1)
 ExpressionList (children 1)
  SelectQuery (children 1)
   ExpressionList (children 1)
    Literal UInt64_1
```

```sql
EXPLAIN AST ALTER TABLE t1 DELETE WHERE date = today();
```

```sql
  explain
  AlterQuery  t1 (children 1)
   ExpressionList (children 1)
    AlterCommand 27 (children 1)
     Function equals (children 1)
      ExpressionList (children 2)
       Identifier date
       Function today (children 1)
        ExpressionList
```


### EXPLAIN SYNTAX \{#explain-syntax\}

구문 분석 후 쿼리의 추상 구문 트리(AST)를 표시합니다.

이 과정은 쿼리를 파싱하고 쿼리 AST와 쿼리 트리를 구성한 뒤, 필요에 따라 쿼리 분석기와 최적화 패스를 실행하고, 이후 쿼리 트리를 다시 쿼리 AST로 변환하는 방식으로 수행됩니다.

Settings:

* `oneline` – 쿼리를 한 줄로 출력합니다. 기본값: `0`.
* `run_query_tree_passes` – 쿼리 트리를 덤프하기 전에 쿼리 트리 패스를 실행합니다. 기본값: `0`.
* `query_tree_passes` – `run_query_tree_passes`가 설정된 경우 실행할 패스의 수를 지정합니다. `query_tree_passes`를 지정하지 않으면 모든 패스를 실행합니다.

Examples:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

출력 결과:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

`run_query_tree_passes` 사용 시:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

출력:

```sql
SELECT
    __table1.number AS `a.number`,
    __table2.number AS `b.number`,
    __table3.number AS `c.number`
FROM system.numbers AS __table1
ALL INNER JOIN system.numbers AS __table2 ON __table1.number = __table2.number
ALL INNER JOIN system.numbers AS __table3 ON __table2.number = __table3.number
```


### EXPLAIN QUERY TREE \{#explain-query-tree\}

설정:

* `run_passes` — 쿼리 트리를 덤프하기 전에 모든 쿼리 트리 패스를 실행합니다. 기본값: `1`.
* `dump_passes` — 쿼리 트리를 덤프하기 전에 사용된 패스에 대한 정보를 덤프합니다. 기본값: `0`.
* `passes` — 실행할 패스 개수를 지정합니다. `-1`로 설정하면 모든 패스를 실행합니다. 기본값: `-1`.
* `dump_tree` — 쿼리 트리를 표시합니다. 기본값: `1`.
* `dump_ast` — 쿼리 트리에서 생성된 쿼리 AST를 표시합니다. 기본값: `0`.

예시:

```sql
EXPLAIN QUERY TREE SELECT id, value FROM test_table;
```

```sql
QUERY id: 0
  PROJECTION COLUMNS
    id UInt64
    value String
  PROJECTION
    LIST id: 1, nodes: 2
      COLUMN id: 2, column_name: id, result_type: UInt64, source_id: 3
      COLUMN id: 4, column_name: value, result_type: String, source_id: 3
  JOIN TREE
    TABLE id: 3, table_name: default.test_table
```


### EXPLAIN PLAN \{#explain-plan\}

쿼리 플랜 단계를 출력합니다.

Settings:

* `optimize` — 플랜을 표시하기 전에 쿼리 플랜 최적화를 적용할지 제어합니다. 기본값: 1.
* `header` — 단계에 대한 출력 헤더를 출력합니다. 기본값: 0.
* `description` — 단계 설명을 출력합니다. 기본값: 1.
* `indexes` — 사용된 인덱스, 필터링된 파트 수, 적용된 각 인덱스에 대해 필터링된 그래뉼 수를 표시합니다. 기본값: 0. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서 지원됩니다. ClickHouse &gt;= v25.9부터는 `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0`와 함께 사용할 때에만 이 구문이 의미 있는 출력을 제공합니다.
* `projections` — 분석된 모든 프로젝션과, 프로젝션 기본 키 조건을 기반으로 파트 수준 필터링에 미치는 영향을 표시합니다. 각 프로젝션에 대해 이 섹션에는 프로젝션의 기본 키를 사용하여 평가된 파트 수, 행 수, 마크 수, 범위 수와 같은 통계가 포함됩니다. 또한 프로젝션 자체에서 읽지 않고 이 필터링으로 인해 건너뛴 데이터 파트 수를 표시합니다. 프로젝션이 실제로 읽기에 사용되었는지, 아니면 필터링 분석에만 사용되었는지는 `description` 필드로 판단할 수 있습니다. 기본값: 0. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서 지원됩니다.
* `actions` — 단계 동작에 대한 자세한 정보를 출력합니다. 기본값: 0.
* `sorting` — 정렬된 출력을 생성하는 각 플랜 단계에 대한 정렬 설명을 출력합니다. 기본값: 0.
* `keep_logical_steps` — 조인에 대해 논리 플랜 단계를 유지하고, 이를 물리 조인 구현으로 변환하지 않습니다. 기본값: 0.
* `json` — 쿼리 플랜 단계를 [JSON](/interfaces/formats/JSON) 형식의 행으로 출력합니다. 기본값: 0. 불필요한 이스케이프를 피하기 위해 [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 형식을 사용하는 것이 좋습니다.
* `input_headers` - 단계에 대한 입력 헤더를 출력합니다. 기본값: 0. 주로 입력‑출력 헤더 불일치와 관련된 문제를 디버깅하려는 개발자에게만 유용합니다.
* `column_structure` - 이름과 타입뿐 아니라 헤더에 있는 컬럼의 구조도 함께 출력합니다. 기본값: 0. 주로 입력‑출력 헤더 불일치와 관련된 문제를 디버깅하려는 개발자에게만 유용합니다.
* `distributed` — 분산 테이블 또는 병렬 레플리카에 대해 원격 노드에서 실행된 쿼리 플랜을 표시합니다. 기본값: 0.

`json=1`인 경우 단계 이름에는 고유한 단계 식별자가 접미사로 추가됩니다.

Example:

```sql
EXPLAIN SELECT sum(number) FROM numbers(10) GROUP BY number % 4;
```

```sql
Union
  Expression (Projection)
  Expression (Before ORDER BY and SELECT)
    Aggregating
      Expression (Before GROUP BY)
        SettingQuotaAndLimits (Set limits and quota after reading from storage)
          ReadFromStorage (SystemNumbers)
```

:::note
단계 및 쿼리 비용 추정은 지원되지 않습니다.
:::

`json = 1`인 경우 쿼리 플랜은 JSON 형식으로 표현됩니다. 각 노드는 항상 `Node Type`과 `Plans` 키를 갖는 딕셔너리입니다. `Node Type`은 단계 이름을 나타내는 문자열입니다. `Plans`는 하위 단계에 대한 설명이 담긴 배열입니다. 노드 유형과 설정에 따라 추가적인 선택적 키가 포함될 수 있습니다.

예시:

```sql
EXPLAIN json = 1, description = 0 SELECT 1 UNION ALL SELECT 2 FORMAT TSVRaw;
```

```json
[
  {
    "Plan": {
      "Node Type": "Union",
      "Node Id": "Union_10",
      "Plans": [
        {
          "Node Type": "Expression",
          "Node Id": "Expression_13",
          "Plans": [
            {
              "Node Type": "ReadFromStorage",
              "Node Id": "ReadFromStorage_0"
            }
          ]
        },
        {
          "Node Type": "Expression",
          "Node Id": "Expression_16",
          "Plans": [
            {
              "Node Type": "ReadFromStorage",
              "Node Id": "ReadFromStorage_4"
            }
          ]
        }
      ]
    }
  }
]
```

`description` = 1로 설정하면 해당 단계에 `Description` 키가 추가됩니다.

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

`header` = 1인 경우, `Header` 키가 단계에 컬럼 배열로 추가됩니다.

예시:

```sql
EXPLAIN json = 1, description = 0, header = 1 SELECT 1, 2 + dummy;
```


```json
[
  {
    "Plan": {
      "Node Type": "Expression",
      "Node Id": "Expression_5",
      "Header": [
        {
          "Name": "1",
          "Type": "UInt8"
        },
        {
          "Name": "plus(2, dummy)",
          "Type": "UInt16"
        }
      ],
      "Plans": [
        {
          "Node Type": "ReadFromStorage",
          "Node Id": "ReadFromStorage_0",
          "Header": [
            {
              "Name": "dummy",
              "Type": "UInt8"
            }
          ]
        }
      ]
    }
  }
]
```

`indexes` = 1이면 `Indexes` 키가 추가됩니다. 이 키에는 사용된 인덱스 배열이 포함됩니다. 각 인덱스는 `Type` 키(문자열 `MinMax`, `Partition`, `PrimaryKey`, `Skip` 중 하나)와 다음과 같은 선택적 키를 갖는 JSON 객체로 표현됩니다:

* `Name` — 인덱스 이름(현재는 `Skip` 인덱스에만 사용됨).
* `Keys` — 인덱스에 사용되는 컬럼 배열.
* `Condition` — 적용된 조건.
* `Description` — 인덱스 설명(현재는 `Skip` 인덱스에만 사용됨).
* `Parts` — 인덱스를 적용한 후/전의 파트 개수.
* `Granules` — 인덱스를 적용한 후/전의 그래뉼 개수.
* `Ranges` — 인덱스를 적용한 후의 그래뉼 범위 개수.

예시:

```json
"Node Type": "ReadFromMergeTree",
"Indexes": [
  {
    "Type": "MinMax",
    "Keys": ["y"],
    "Condition": "(y in [1, +inf))",
    "Parts": 4/5,
    "Granules": 11/12
  },
  {
    "Type": "Partition",
    "Keys": ["y", "bitAnd(z, 3)"],
    "Condition": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "Parts": 3/4,
    "Granules": 10/11
  },
  {
    "Type": "PrimaryKey",
    "Keys": ["x", "y"],
    "Condition": "and((x in [11, +inf)), (y in [1, +inf)))",
    "Parts": 2/3,
    "Granules": 6/10,
    "Search Algorithm": "generic exclusion search"
  },
  {
    "Type": "Skip",
    "Name": "t_minmax",
    "Description": "minmax GRANULARITY 2",
    "Parts": 1/2,
    "Granules": 2/6
  },
  {
    "Type": "Skip",
    "Name": "t_set",
    "Description": "set GRANULARITY 2",
    "": 1/1,
    "Granules": 1/2
  }
]
```

`projections` = 1이면 `Projections` 키가 추가됩니다. 이 키에는 분석된 프로젝션 배열이 포함됩니다. 각 프로젝션은 다음 키를 가진 JSON으로 설명됩니다:

* `Name` — 프로젝션 이름.
* `Condition` — 사용된 프로젝션 기본 키 조건.
* `Description` — 프로젝션이 어떻게 사용되는지에 대한 설명(예: 파트 수준 필터링).
* `Selected Parts` — 프로젝션에 의해 선택된 파트 개수.
* `Selected Marks` — 선택된 마크 개수.
* `Selected Ranges` — 선택된 범위 개수.
* `Selected Rows` — 선택된 행 개수.
* `Filtered Parts` — 파트 수준 필터링으로 인해 건너뛴 파트 개수.

예시:

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "Projection has been analyzed and is used for part-level filtering",
    "Condition": "(region in ['us_west', 'us_west'])",
    "Search Algorithm": "binary search",
    "Selected Parts": 3,
    "Selected Marks": 3,
    "Selected Ranges": 3,
    "Selected Rows": 3,
    "Filtered Parts": 2
  },
  {
    "Name": "user_id_proj",
    "Description": "Projection has been analyzed and is used for part-level filtering",
    "Condition": "(user_id in [107, 107])",
    "Search Algorithm": "binary search",
    "Selected Parts": 1,
    "Selected Marks": 1,
    "Selected Ranges": 1,
    "Selected Rows": 1,
    "Filtered Parts": 2
  }
]
```


`actions` = 1인 경우, 추가되는 키는 단계 유형에 따라 달라집니다.

예시:

```sql
EXPLAIN json = 1, actions = 1, description = 0 SELECT 1 FORMAT TSVRaw;
```

```json
[
  {
    "Plan": {
      "Node Type": "Expression",
      "Node Id": "Expression_5",
      "Expression": {
        "Inputs": [
          {
            "Name": "dummy",
            "Type": "UInt8"
          }
        ],
        "Actions": [
          {
            "Node Type": "INPUT",
            "Result Type": "UInt8",
            "Result Name": "dummy",
            "Arguments": [0],
            "Removed Arguments": [0],
            "Result": 0
          },
          {
            "Node Type": "COLUMN",
            "Result Type": "UInt8",
            "Result Name": "1",
            "Column": "Const(UInt8)",
            "Arguments": [],
            "Removed Arguments": [],
            "Result": 1
          }
        ],
        "Outputs": [
          {
            "Name": "1",
            "Type": "UInt8"
          }
        ],
        "Positions": [1]
      },
      "Plans": [
        {
          "Node Type": "ReadFromStorage",
          "Node Id": "ReadFromStorage_0"
        }
      ]
    }
  }
]
```

`distributed` = 1인 경우 출력에는 로컬 쿼리 플랜뿐만 아니라 원격 노드에서 실행될 쿼리 플랜도 포함됩니다. 이는 분산 쿼리를 분석하고 디버깅하는 데 유용합니다.

분산 테이블을 사용한 예:

```sql
EXPLAIN distributed=1 SELECT * FROM remote('127.0.0.{1,2}', numbers(2)) WHERE number = 1;
```

```sql
Union
  Expression ((Project names + (Projection + (Change column names to column identifiers + (Project names + Projection)))))
    Filter ((WHERE + Change column names to column identifiers))
      ReadFromSystemNumbers
  Expression ((Project names + (Projection + Change column names to column identifiers)))
    ReadFromRemote (Read from remote replica)
      Expression ((Project names + Projection))
        Filter ((WHERE + Change column names to column identifiers))
          ReadFromSystemNumbers
```

병렬 레플리카 예제:

```sql
SET enable_parallel_replicas = 2, max_parallel_replicas = 2, cluster_for_parallel_replicas = 'default';

EXPLAIN distributed=1 SELECT sum(number) FROM test_table GROUP BY number % 4;
```

```sql
Expression ((Project names + Projection))
  MergingAggregated
    Union
      Aggregating
        Expression ((Before GROUP BY + Change column names to column identifiers))
          ReadFromMergeTree (default.test_table)
      ReadFromRemoteParallelReplicas
        BlocksMarshalling
          Aggregating
            Expression ((Before GROUP BY + Change column names to column identifiers))
              ReadFromMergeTree (default.test_table)
```

두 예제 모두에서 쿼리 플랜은 로컬 및 원격 단계를 포함한 전체 실행 흐름을 보여줍니다.


### EXPLAIN PIPELINE \{#explain-pipeline\}

설정:

* `header` — 각 출력 포트에 대한 헤더를 출력합니다. 기본값: 0.
* `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) 그래프 설명 언어 형식으로 그래프를 출력합니다. 기본값: 0.
* `compact` — `graph` 설정이 활성화된 경우 그래프를 compact 모드로 출력합니다. 기본값: 1.

`compact=0`이고 `graph=1`인 경우 프로세서 이름에 고유한 프로세서 식별자가 접미사로 추가됩니다.

예:

```sql
EXPLAIN PIPELINE SELECT sum(number) FROM numbers_mt(100000) GROUP BY number % 4;
```

```sql
(Union)
(Expression)
ExpressionTransform
  (Expression)
  ExpressionTransform
    (Aggregating)
    Resize 2 → 1
      AggregatingTransform × 2
        (Expression)
        ExpressionTransform × 2
          (SettingQuotaAndLimits)
            (ReadFromStorage)
            NumbersRange × 2 0 → 1
```


### EXPLAIN ESTIMATE \{#explain-estimate\}

쿼리를 처리하는 동안 테이블에서 읽게 될 행, 마크, 파트의 예상 개수를 보여줍니다. [MergeTree](/engines/table-engines/mergetree-family/mergetree) 패밀리의 테이블에서 동작합니다.

**예시**

테이블 생성:

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

쿼리:

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

결과:

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```


### EXPLAIN TABLE OVERRIDE \{#explain-table-override\}

`table function`을 통해 접근하는 테이블 스키마에 대해 적용된 테이블 오버라이드의 결과를 보여줍니다.
또한 일부 검증을 수행하며, 오버라이드가 어떤 종류의 실패를 유발하게 되는 경우 예외를 발생시킵니다.

**예시**

원격 MySQL 테이블이 다음과 같다고 가정합니다.

```sql
CREATE TABLE db.tbl (
    id INT PRIMARY KEY,
    created DATETIME DEFAULT now()
)
```

```sql
EXPLAIN TABLE OVERRIDE mysql('127.0.0.1:3306', 'db', 'tbl', 'root', 'clickhouse')
PARTITION BY toYYYYMM(assumeNotNull(created))
```

결과:

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
검증이 완전히 끝난 상태가 아니므로, 쿼리가 성공하더라도 해당 override가 문제가 발생하지 않을 것이라고 보장할 수 없습니다.
:::
