---
description: 'Документация для Explain'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'Оператор EXPLAIN'
---

Показывает план выполнения оператора.

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

Синтаксис:

```sql
EXPLAIN [AST | SYNTAX | QUERY TREE | PLAN | PIPELINE | ESTIMATE | TABLE OVERRIDE] [setting = value, ...]
    [
      SELECT ... |
      tableFunction(...) [COLUMNS (...)] [ORDER BY ...] [PARTITION BY ...] [PRIMARY KEY] [SAMPLE BY ...] [TTL ...]
    ]
    [FORMAT ...]
```

Пример:

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

## Виды EXPLAIN {#explain-types}

- `AST` — Абстрактное синтаксическое дерево.
- `SYNTAX` — Текст запроса после оптимизаций на уровне AST.
- `QUERY TREE` — Дерево запроса после оптимизаций на уровне дерева запроса.
- `PLAN` — План выполнения запроса.
- `PIPELINE` — Конвейер выполнения запроса.

### EXPLAIN AST {#explain-ast}

Вывод дерева AST запроса. Поддерживает все виды запросов, не только `SELECT`.

Примеры:

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

Возвращает запрос после синтаксических оптимизаций.

Пример:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c;
```

```sql
SELECT
    `--a.number` AS `a.number`,
    `--b.number` AS `b.number`,
    number AS `c.number`
FROM
(
    SELECT
        number AS `--a.number`,
        b.number AS `--b.number`
    FROM system.numbers AS a
    CROSS JOIN system.numbers AS b
) AS `--.s`
CROSS JOIN system.numbers AS c
```

### EXPLAIN QUERY TREE {#explain-query-tree}

Настройки:

- `run_passes` — Запускает все проходы дерева запроса перед выводом дерева запроса. По умолчанию: `1`.
- `dump_passes` — Выводит информацию о использованных проходах перед выводом дерева запроса. По умолчанию: `0`.
- `passes` — Указывает, сколько проходов нужно выполнить. Если установлено значение `-1`, выполняет все проходы. По умолчанию: `-1`.

Пример:
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

Вывод шагов плана запроса.

Настройки:

- `header` — Печатает заголовок вывода для шага. По умолчанию: 0.
- `description` — Печатает описание шага. По умолчанию: 1.
- `indexes` — Показывает использованные индексы, количество отфильтрованных частей и количество отфильтрованных гранул для каждого примененного индекса. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
- `actions` — Печатает подробную информацию о действиях шага. По умолчанию: 0.
- `json` — Печатает шаги плана запроса в виде строки в формате [JSON](../../interfaces/formats.md#json). По умолчанию: 0. Рекомендуется использовать формат [TSVRaw](../../interfaces/formats.md#tabseparatedraw), чтобы избежать ненужного экранирования.

Когда `json=1`, имена шагов будут содержать дополнительный суффикс с уникальным идентификатором шага.

Пример:

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
Оценка стоимости шага и запроса не поддерживается.
:::

Когда `json = 1`, план запроса представлен в формате JSON. Каждый узел является словарем, который всегда содержит ключи `Node Type` и `Plans`. `Node Type` — это строка с именем шага. `Plans` — это массив с описаниями дочерних шагов. Другие необязательные ключи могут быть добавлены в зависимости от типа узла и настроек.

Пример:

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

При `description` = 1 добавляется ключ `Description` к шагу:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

При `header` = 1 добавляется ключ `Header` к шагу в виде массива колонок.

Пример:

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

При `indexes` = 1 добавляется ключ `Indexes`. Он содержит массив использованных индексов. Каждый индекс описывается в формате JSON с ключом `Type` (строка `MinMax`, `Partition`, `PrimaryKey` или `Skip`) и необязательными ключами:

- `Name` — Имя индекса (в настоящее время используется только для индексов `Skip`).
- `Keys` — Массив колонок, используемых индексом.
- `Condition` — Используемое условие.
- `Description` — Описание индекса (в настоящее время используется только для индексов `Skip`).
- `Parts` — Количество частей до/после применения индекса.
- `Granules` — Количество гранул до/после применения индекса.

Пример:

```json
"Node Type": "ReadFromMergeTree",
"Indexes": [
  {
    "Type": "MinMax",
    "Keys": ["y"],
    "Condition": "(y in [1, +inf))",
    "Parts": 5/4,
    "Granules": 12/11
  },
  {
    "Type": "Partition",
    "Keys": ["y", "bitAnd(z, 3)"],
    "Condition": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "Parts": 4/3,
    "Granules": 11/10
  },
  {
    "Type": "PrimaryKey",
    "Keys": ["x", "y"],
    "Condition": "and((x in [11, +inf)), (y in [1, +inf)))",
    "Parts": 3/2,
    "Granules": 10/6
  },
  {
    "Type": "Skip",
    "Name": "t_minmax",
    "Description": "minmax GRANULARITY 2",
    "Parts": 2/1,
    "Granules": 6/2
  },
  {
    "Type": "Skip",
    "Name": "t_set",
    "Description": "set GRANULARITY 2",
    "": 1/1,
    "Granules": 2/1
  }
]
```

При `actions` = 1 добавляются ключи, зависящие от типа шага.

Пример:

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

Настройки:

- `header` — Печатает заголовок для каждого выходного порта. По умолчанию: 0.
- `graph` — Печатает граф, описанный на языке описания графов [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)). По умолчанию: 0.
- `compact` — Печатает граф в компактном режиме, если включена настройка `graph`. По умолчанию: 1.

Когда `compact=0` и `graph=1`, имена процессоров будут содержать дополнительный суффикс с уникальным идентификатором процессора.

Пример:

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

Показывает оценочное количество строк, меток и частей, которые будут прочитаны из таблиц во время обработки запроса. Работает с таблицами из семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree). 

**Пример**

Создание таблицы:

```sql
CREATE TABLE ttt (i Int64) ENGINE = MergeTree() ORDER BY i SETTINGS index_granularity = 16, write_final_mark = 0;
INSERT INTO ttt SELECT number FROM numbers(128);
OPTIMIZE TABLE ttt;
```

Запрос:

```sql
EXPLAIN ESTIMATE SELECT * FROM ttt;
```

Результат:

```text
┌─database─┬─table─┬─parts─┬─rows─┬─marks─┐
│ default  │ ttt   │     1 │  128 │     8 │
└──────────┴───────┴───────┴──────┴───────┘
```

### EXPLAIN TABLE OVERRIDE {#explain-table-override}

Показывает результат переопределения таблицы в схеме таблицы, доступной через табличную функцию.
Также выполняет некоторую проверку, выбрасывая исключение, если переопределение может привести к ошибке.

**Пример**

Предположим, у вас есть удаленная таблица MySQL, подобная этой:

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

Результат:

```text
┌─explain─────────────────────────────────────────────────┐
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note    
Проверка не является полной, поэтому успешный запрос не гарантирует, что переопределение не вызовет проблем.
:::

