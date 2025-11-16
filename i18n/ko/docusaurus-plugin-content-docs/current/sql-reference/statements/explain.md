---
'description': 'EXPLAIN 的文档'
'sidebar_label': 'EXPLAIN'
'sidebar_position': 39
'slug': '/sql-reference/statements/explain'
'title': 'EXPLAIN 语句'
'doc_type': 'reference'
---

Shows the execution plan of a statement.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/hP6G2Nlz_cA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

Syntax:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

Example:

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

## EXPLAIN Types {#explain-types}

- `AST` — 추상 구문 트리.
- `SYNTAX` — AST 수준 최적화 후의 쿼리 텍스트.
- `QUERY TREE` — 쿼리 트리의 쿼리 트리 수준 최적화 후 상태.
- `PLAN` — 쿼리 실행 계획.
- `PIPELINE` — 쿼리 실행 파이프라인.

### EXPLAIN AST {#explain-ast}

쿼리 AST를 덤프합니다. 모든 유형의 쿼리를 지원하며, `SELECT`만 해당되지 않습니다.

Examples:

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

### EXPLAIN SYNTAX {#explain-syntax}

구문 분석 후 쿼리의 추상 구문 트리 (AST)를 보여줍니다.

쿼리를 파싱하고, 쿼리 AST와 쿼리 트리를 구성하며, 선택적으로 쿼리 분석기 및 최적화 패스를 실행한 다음 쿼리 트리를 다시 쿼리 AST로 변환하는 방식으로 수행됩니다.

Settings:

- `oneline` – 쿼리를 한 줄로 인쇄합니다. 기본값: `0`.
- `run_query_tree_passes` – 쿼리 트리를 덤프하기 전에 쿼리 트리 패스를 실행합니다. 기본값: `0`.
- `query_tree_passes` – `run_query_tree_passes`가 설정되어 있는 경우 실행할 패스의 수를 지정합니다. `query_tree_passes`를 지정하지 않으면 모든 패스를 실행합니다.

Examples:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Output:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

`run_query_tree_passes` 사용 시:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Output:

```sql
SELECT
    __table1.number AS `a.number`,
    __table2.number AS `b.number`,
    __table3.number AS `c.number`
FROM system.numbers AS __table1
ALL INNER JOIN system.numbers AS __table2 ON __table1.number = __table2.number
ALL INNER JOIN system.numbers AS __table3 ON __table2.number = __table3.number
```

### EXPLAIN QUERY TREE {#explain-query-tree}

Settings:

- `run_passes` — 쿼리 트리를 덤프하기 전에 모든 쿼리 트리 패스를 실행합니다. 기본값: `1`.
- `dump_passes` — 쿼리 트리를 덤프하기 전에 사용된 패스에 대한 정보를 덤프합니다. 기본값: `0`.
- `passes` — 실행할 패스의 수를 지정합니다. `-1`로 설정하면 모든 패스를 실행합니다. 기본값: `-1`.
- `dump_tree` — 쿼리 트리를 표시합니다. 기본값: `1`.
- `dump_ast` — 쿼리 트리에서 생성된 쿼리 AST를 표시합니다. 기본값: `0`.

Example:
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

### EXPLAIN PLAN {#explain-plan}

쿼리 계획 단계를 덤프합니다.

Settings:

- `header` — 단계에 대한 출력 헤더를 인쇄합니다. 기본값: 0.
- `description` — 단계 설명을 인쇄합니다. 기본값: 1.
- `indexes` — 적용된 각 인덱스에 대해 사용된 인덱스, 필터링된 파트의 수 및 필터링된 그래뉼의 수를 보여줍니다. 기본값: 0. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대해 지원됩니다. ClickHouse >= v25.9부터, 이 문장은 `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0`와 함께 사용할 때만 합리적인 출력을 표시합니다.
- `projections` — 모든 분석된 프로젝션과 프로젝션 기본 키 조건에 대한 파트 수준 필터링의 효과를 보여줍니다. 각 프로젝션에 대해 이 섹션에는 프로젝션의 기본 키를 사용하여 평가된 파트, 행, 마크 및 범위의 수와 같은 통계가 포함됩니다. 또한 이 필터링으로 인해 스킵된 데이터 파트의 수도 표시됩니다. 프로젝션이 읽기 위해 실제로 사용되었는지 또는 필터링을 위해 만 분석되었는지는 `description` 필드로 판단할 수 있습니다. 기본값: 0. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에 대해 지원됩니다.
- `actions` — 단계 작업에 대한 자세한 정보를 인쇄합니다. 기본값: 0.
- `json` — 쿼리 계획 단계를 [JSON](/interfaces/formats/JSON) 형식으로 출력합니다. 기본값: 0. 불필요한 이스케이핑을 피하기 위해 [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw) 형식을 사용하는 것이 권장됩니다.
- `input_headers` - 단계의 입력 헤더를 인쇄합니다. 기본값: 0. 주로 개발자들이 입력-출력 헤더 불일치 문제를 디버깅하는 데 유용합니다.

`json=1`로 설정하면 단계 이름에 고유한 단계 식별자를 포함하는 추가 접미사를 갖게 됩니다.

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

`json = 1`일 때, 쿼리 계획은 JSON 형식으로 표시됩니다. 각 노드는 항상 `Node Type` 및 `Plans` 키가 있는 사전입니다. `Node Type`은 단계 이름을 가진 문자열입니다. `Plans`는 자식 단계 설명의 배열입니다. 다른 선택적 키는 노드 유형 및 설정에 따라 추가될 수 있습니다.

Example:

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

`description` = 1일 때 `Description` 키가 단계에 추가됩니다:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

`header` = 1일 때, `Header` 키가 열 배열로 단계에 추가됩니다.

Example:

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

`indexes` = 1일 때, `Indexes` 키가 추가됩니다. 이 키는 사용된 인덱스의 배열을 포함합니다. 각 인덱스는 `Type` 키(문자열 `MinMax`, `Partition`, `PrimaryKey` 또는 `Skip`) 및 선택적 키로 설명됩니다:

- `Name` — 인덱스 이름(현재 `Skip` 인덱스에만 사용됨).
- `Keys` — 인덱스에 의해 사용된 컬럼의 배열.
- `Condition` — 사용된 조건.
- `Description` — 인덱스 설명(현재 `Skip` 인덱스에만 사용됨).
- `Parts` — 인덱스가 적용된 후/이전의 파트 수.
- `Granules` — 인덱스가 적용된 후/이전의 그래뉼 수.
- `Ranges` — 인덱스가 적용된 후의 그래뉼 범위 수.

Example:

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

`projections` = 1일 때, `Projections` 키가 추가됩니다. 이 키는 분석된 프로젝션의 배열을 포함합니다. 각 프로젝션은 다음 키가 있는 JSON으로 설명됩니다:

- `Name` — 프로젝션 이름.
- `Condition` — 사용된 프로젝션 기본 키 조건.
- `Description` — 프로젝션이 사용되는 방식에 대한 설명(예: 파트 수준 필터링).
- `Selected Parts` — 프로젝션에 의해 선택된 파트 수.
- `Selected Marks` — 선택된 마크 수.
- `Selected Ranges` — 선택된 범위 수.
- `Selected Rows` — 선택된 행 수.
- `Filtered Parts` — 파트 수준 필터링으로 인해 스킵된 파트 수.

Example:

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

`actions` = 1일 때, 추가된 키는 단계 유형에 따라 다릅니다.

Example:

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

### EXPLAIN PIPELINE {#explain-pipeline}

Settings:

- `header` — 각 출력 포트에 대한 헤더를 인쇄합니다. 기본값: 0.
- `graph` — [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) 그래프 설명 언어로 설명된 그래프를 인쇄합니다. 기본값: 0.
- `compact` — `graph` 설정이 활성화된 경우 압축 모드로 그래프를 인쇄합니다. 기본값: 1.

`compact=0` 및 `graph=1`일 때 프로세서 이름은 고유한 프로세서 식별자를 포함하는 추가 접미사를 갖습니다.

Example:

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

### EXPLAIN ESTIMATE {#explain-estimate}

쿼리를 처리하는 동안 읽어야 할 행, 마크 및 파트의 추정 수를 보여줍니다. [MergeTree](/engines/table-engines/mergetree-family/mergetree) 계열의 테이블과 함께 작동합니다.

**Example**

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

### EXPLAIN TABLE OVERRIDE {#explain-table-override}

테이블 함수로 접근한 테이블 스키마에서 테이블 오버라이드를 보여줍니다.
또한 오버라이드로 인해 어떤 문제가 발생할 것으로 예상될 경우 예외를 발생시키며 검증을 수행합니다.

**Example**

다음과 같은 원격 MySQL 테이블이 있다고 가정합니다:

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
검증이 완료되지 않았으므로 성공적인 쿼리가 오버라이드가 문제가 되지 않는다는 보장은 없습니다.
:::
