---
slug: '/sql-reference/statements/explain'
sidebar_label: EXPLAIN
sidebar_position: 39
description: 'Документация для Explain'
title: 'Оператор EXPLAIN'
doc_type: reference
---
Показывает план выполнения операции.

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

## EXPLAIN Types {#explain-types}

- `AST` — Абстрактное синтаксическое дерево.
- `SYNTAX` — Текст запроса после оптимизаций на уровне AST.
- `QUERY TREE` — Дерево запроса после оптимизаций на уровне дерева запроса.
- `PLAN` — План выполнения запроса.
- `PIPELINE` — Конвейер выполнения запроса.

### EXPLAIN AST {#explain-ast}

Выводит дерево AST запроса. Поддерживает все типы запросов, а не только `SELECT`.

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

Показывает абстрактное синтаксическое дерево (AST) запроса после синтаксического анализа.

Это происходит путем разбора запроса, построения AST запроса и дерева запроса, опционально запуска анализатора запроса и проходов оптимизации, а затем преобразования дерева запроса обратно в AST запроса.

Настройки:

- `oneline` – Печатает запрос в одной строке. По умолчанию: `0`.
- `run_query_tree_passes` – Запускает проходы дерева запроса перед выводом дерева запроса. По умолчанию: `0`.
- `query_tree_passes` – Если `run_query_tree_passes` установлен, указывает, сколько проходов выполнить. Без указания `query_tree_passes` выполняются все проходы.

Примеры:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Вывод:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

С `run_query_tree_passes`:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Вывод:

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

Настройки:

- `run_passes` — Запускает все проходы дерева запроса перед выводом дерева запроса. По умолчанию: `1`.
- `dump_passes` — Выводит информацию о использованных проходах перед выводом дерева запроса. По умолчанию: `0`.
- `passes` — Указывает, сколько проходов выполнить. Если установлено в `-1`, выполняет все проходы. По умолчанию: `-1`.
- `dump_tree` — Отображает дерево запроса. По умолчанию: `1`.
- `dump_ast` — Отображает AST запроса, генерируемый из дерева запроса. По умолчанию: `0`.

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

Выводит шаги плана запроса.

Настройки:

- `header` — Печатает заголовок вывода для шага. По умолчанию: 0.
- `description` — Печатает описание шага. По умолчанию: 1.
- `indexes` — Показывает использованные индексы, количество отфильтрованных частей и количество отфильтрованных гранул для каждого применённого индекса. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
- `projections` — Показывает все проанализированные проекции и их влияние на фильтрацию на уровне частей на основе условий первичного ключа проекции. Для каждой проекции этот раздел включает статистику, такую как количество частей, строк, меток и диапазонов, которые были оценены с использованием первичного ключа проекции. Также показывается, сколько частей данных было пропущено из-за этой фильтрации, без чтения из самой проекции. Будет ли проекция фактически использоваться для чтения или только анализироваться для фильтрации, может быть определено полем `description`. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
- `actions` — Печатает подробную информацию о действиях шага. По умолчанию: 0.
- `json` — Печатает шаги плана запроса в строковом формате [JSON](../../interfaces/formats.md#json). По умолчанию: 0. Рекомендуется использовать формат [TSVRaw](../../interfaces/formats.md#tabseparatedraw), чтобы избежать ненужного экранирования.

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

Когда `json = 1`, план запроса представлен в формате JSON. Каждый узел является словарем, который всегда имеет ключи `Node Type` и `Plans`. `Node Type` — это строка с именем шага. `Plans` — это массив с описаниями дочерних шагов. Другие опциональные ключи могут быть добавлены в зависимости от типа узла и настроек.

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

С `description` = 1, к шагу добавляется ключ `Description`:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

С `header` = 1, к шагу добавляется ключ `Header` в виде массива столбцов.

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

С `indexes` = 1, добавляется ключ `Indexes`. Он содержит массив использованных индексов. Каждый индекс описан в формате JSON с ключом `Type` (строка `MinMax`, `Partition`, `PrimaryKey` или `Skip`) и опциональными ключами:

- `Name` — Имя индекса (в настоящее время используется только для индексов `Skip`).
- `Keys` — Массив столбцов, используемых индексом.
- `Condition` — Условие, использованное для индекса.
- `Description` — Описание индекса (в настоящее время используется только для индексов `Skip`).
- `Parts` — Количество частей после/до применения индекса.
- `Granules` — Количество гранул после/до применения индекса.
- `Ranges` — Количество диапазонов гранул после применения индекса.

Пример:

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

С `projections` = 1, добавляется ключ `Projections`. Он содержит массив проанализированных проекций. Каждая проекция описана в формате JSON с следующими ключами:

- `Name` — Имя проекции.
- `Condition` — Условие первичного ключа используемой проекции.
- `Description` — Описание того, как используется проекция (например, фильтрация на уровне частей).
- `Selected Parts` — Количество частей, отобранных проекцией.
- `Selected Marks` — Количество выбранных меток.
- `Selected Ranges` — Количество выбранных диапазонов.
- `Selected Rows` — Количество отобранных строк.
- `Filtered Parts` — Количество частей, пропущенных из-за фильтрации на уровне частей.

Пример:

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

С `actions` = 1, добавленные ключи зависят от типа шага.

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

Показывает оценочное количество строк, меток и частей, которые будут прочитаны из таблиц при обработке запроса. Работает с таблицами в семействе [MergeTree](/engines/table-engines/mergetree-family/mergetree).

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

Показывает результат переопределения таблицы в схеме таблицы, доступной через табличную функцию. Также выполняет некоторую проверку, вызывая исключение, если переопределение могло бы вызвать какую-либо ошибку.

**Пример**

Предположим, у вас есть удалённая таблица MySQL, подобная этой:

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
Проверка не завершена, поэтому успешный запрос не гарантирует, что переопределение не вызовет проблем.
:::