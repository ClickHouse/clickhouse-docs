---
description: 'Документация по EXPLAIN'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'Оператор EXPLAIN'
doc_type: 'reference'
---

Показывает план выполнения запроса.

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
          SettingQuotaAndLimits (Установка ограничений и квот после чтения из хранилища)
            ReadFromStorage (SystemNumbers)
  Expression (Projection)
    MergingSorted (Слияние отсортированных потоков для ORDER BY)
      MergeSorting (Слияние отсортированных блоков для ORDER BY)
        PartialSorting (Сортировка каждого блока для ORDER BY)
          Expression (Before ORDER BY and SELECT)
            Aggregating
              Expression (Before GROUP BY)
                SettingQuotaAndLimits (Установка ограничений и квот после чтения из хранилища)
                  ReadFromStorage (SystemNumbers)
```


## Типы EXPLAIN

* `AST` — абстрактное синтаксическое дерево.
* `SYNTAX` — текст запроса после оптимизаций на уровне AST.
* `QUERY TREE` — дерево запроса после оптимизаций на уровне Query Tree.
* `PLAN` — план выполнения запроса.
* `PIPELINE` — конвейер выполнения запроса.

### EXPLAIN AST

Вывод AST запроса. Поддерживаются все типы запросов, не только `SELECT`.

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

### СИНТАКСИС EXPLAIN

Показывает абстрактное синтаксическое дерево (AST) запроса после синтаксического анализа.

Для этого запрос парсится, строятся AST запроса и дерево запроса, при необходимости запускается анализатор запроса и выполняются проходы оптимизации, после чего дерево запроса снова преобразуется в AST запроса.

Настройки:

* `oneline` – Печатать запрос в одну строку. По умолчанию: `0`.
* `run_query_tree_passes` – Выполнять проходы по дереву запроса перед выводом дерева запроса. По умолчанию: `0`.
* `query_tree_passes` – Если задан `run_query_tree_passes`, указывает, сколько проходов выполнять. Без указания `query_tree_passes` выполняются все проходы.

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

При использовании `run_query_tree_passes`:

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

### EXPLAIN QUERY TREE

Настройки:

* `run_passes` — Выполняет все проходы дерева запроса перед выводом дерева запроса. Значение по умолчанию: `1`.
* `dump_passes` — Выводит информацию об использованных проходах перед выводом дерева запроса. Значение по умолчанию: `0`.
* `passes` — Определяет, сколько проходов выполнять. Если задано `-1`, выполняются все проходы. Значение по умолчанию: `-1`.
* `dump_tree` — Отображает дерево запроса. Значение по умолчанию: `1`.
* `dump_ast` — Отображает AST запроса, построенное на основе дерева запроса. Значение по умолчанию: `0`.

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

### EXPLAIN PLAN

Вывести шаги плана выполнения запроса.

Настройки:


* `header` — Выводит заголовок результата для шага. По умолчанию: 0.
* `description` — Выводит описание шага. По умолчанию: 1.
* `indexes` — Показывает используемые индексы, количество отфильтрованных частей и количество отфильтрованных гранул для каждого применённого индекса. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Начиная с ClickHouse версии 25.9 и выше, этот параметр выводит осмысленный результат только при использовании с `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0`.
* `projections` — Показывает все проанализированные проекции и их влияние на фильтрацию на уровне частей на основе условий по первичному ключу проекции. Для каждой проекции этот раздел включает статистику, такую как количество частей, строк, меток и диапазонов, которые были обработаны с использованием первичного ключа проекции. Также показывает, сколько частей данных было пропущено благодаря такой фильтрации без чтения из самой проекции. Была ли проекция фактически использована для чтения или только проанализирована для фильтрации, можно определить по полю `description`. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
* `actions` — Выводит подробную информацию о действиях шага. По умолчанию: 0.
* `json` — Выводит шаги плана запроса одной строкой в формате [JSON](/interfaces/formats/JSON). По умолчанию: 0. Рекомендуется использовать формат [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw), чтобы избежать лишнего экранирования.
* `input_headers` — Выводит входные заголовки для шага. По умолчанию: 0. В основном полезно только для разработчиков для отладки проблем, связанных с несоответствием входных и выходных заголовков.

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
        SettingQuotaAndLimits (Установка лимитов и квот после чтения из хранилища)
          ReadFromStorage (SystemNumbers)
```

:::note
Оценка стоимости шагов и запроса не поддерживается.
:::

Когда `json = 1`, план запроса представлен в формате JSON. Каждый узел — это словарь, который всегда содержит ключи `Node Type` и `Plans`. `Node Type` — это строка с именем шага. `Plans` — это массив с описаниями дочерних шагов. В зависимости от типа узла и настроек могут добавляться другие необязательные ключи.

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

Если `description` = 1, к шагу добавляется ключ `Description`:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

При значении `header` = 1 к шагу добавляется ключ `Header` как массив столбцов.

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


При `indexes` = 1 добавляется ключ `Indexes`. Он содержит массив используемых индексов. Каждый индекс описывается в формате JSON с ключом `Type` (строка `MinMax`, `Partition`, `PrimaryKey` или `Skip`) и необязательными ключами:

* `Name` — имя индекса (в настоящее время используется только для индексов `Skip`).
* `Keys` — массив столбцов, используемых индексом.
* `Condition` — условие, по которому применяется индекс.
* `Description` — описание индекса (в настоящее время используется только для индексов `Skip`).
* `Parts` — количество частей до/после применения индекса.
* `Granules` — количество гранул до/после применения индекса.
* `Ranges` — количество диапазонов гранул после применения индекса.

Пример:

```json
"Тип узла": "ReadFromMergeTree",
"Индексы": [
  {
    "Тип": "MinMax",
    "Ключи": ["y"],
    "Условие": "(y in [1, +inf))",
    "Части": 4/5,
    "Гранулы": 11/12
  },
  {
    "Тип": "Partition",
    "Ключи": ["y", "bitAnd(z, 3)"],
    "Условие": "and((bitAnd(z, 3) not in [1, 1]), and((y in [1, +inf)), (bitAnd(z, 3) not in [1, 1])))",
    "Части": 3/4,
    "Гранулы": 10/11
  },
  {
    "Тип": "PrimaryKey",
    "Ключи": ["x", "y"],
    "Условие": "and((x in [11, +inf)), (y in [1, +inf)))",
    "Части": 2/3,
    "Гранулы": 6/10,
    "Алгоритм поиска": "generic exclusion search"
  },
  {
    "Тип": "Skip",
    "Имя": "t_minmax",
    "Описание": "minmax GRANULARITY 2",
    "Части": 1/2,
    "Гранулы": 2/6
  },
  {
    "Тип": "Skip",
    "Имя": "t_set",
    "Описание": "set GRANULARITY 2",
    "": 1/1,
    "Гранулы": 1/2
  }
]
```

При `projections` = 1 добавляется ключ `Projections`. Он содержит массив проанализированных проекций. Каждая проекция описывается в формате JSON со следующими ключами:

* `Name` — имя проекции.
* `Condition` — используемое условие первичного ключа проекции.
* `Description` — описание того, как используется проекция (например, фильтрация на уровне частей).
* `Selected Parts` — количество частей, выбранных проекцией.
* `Selected Marks` — количество выбранных меток.
* `Selected Ranges` — количество выбранных диапазонов.
* `Selected Rows` — количество выбранных строк.
* `Filtered Parts` — количество частей, пропущенных из-за фильтрации на уровне частей.

Пример:

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "Проекция проанализирована и используется для фильтрации на уровне частей",
    "Condition": "(region in ['us_west', 'us_west'])",
    "Search Algorithm": "двоичный поиск",
    "Selected Parts": 3,
    "Selected Marks": 3,
    "Selected Ranges": 3,
    "Selected Rows": 3,
    "Filtered Parts": 2
  },
  {
    "Name": "user_id_proj",
    "Description": "Проекция проанализирована и используется для фильтрации на уровне частей",
    "Condition": "(user_id in [107, 107])",
    "Search Algorithm": "двоичный поиск",
    "Selected Parts": 1,
    "Selected Marks": 1,
    "Selected Ranges": 1,
    "Selected Rows": 1,
    "Filtered Parts": 2
  }
]
```

Если `actions` = 1, добавляемые ключи зависят от типа шага.

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

### EXPLAIN PIPELINE

Настройки:

* `header` — Выводит заголовок для каждого выходного порта. По умолчанию — 0.
* `graph` — Выводит граф, описанный на языке описания графов [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)). По умолчанию — 0.
* `compact` — Выводит граф в компактном виде, если параметр `graph` включён. По умолчанию — 1.

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

### EXPLAIN ESTIMATE

Показывает примерное количество строк, меток и частей, которые будут прочитаны из таблиц во время обработки запроса. Работает с таблицами семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree).

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

### EXPLAIN TABLE OVERRIDE

Показывает результат переопределения схемы таблицы, к которой обращаются через табличную функцию.
Также выполняет проверку корректности и выбрасывает исключение, если переопределение могло бы привести к какой-либо ошибке.

**Пример**

Предположим, у вас есть удалённая таблица MySQL следующего вида:

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
│ PARTITION BY использует столбцы: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
Проверка неполная, поэтому успешный запрос не гарантирует, что переопределение не приведёт к проблемам.
:::
