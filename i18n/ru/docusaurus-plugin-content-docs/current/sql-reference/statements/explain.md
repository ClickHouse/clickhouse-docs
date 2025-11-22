---
description: 'Документация по оператору EXPLAIN'
sidebar_label: 'EXPLAIN'
sidebar_position: 39
slug: /sql-reference/statements/explain
title: 'Оператор EXPLAIN'
doc_type: 'reference'
---

Показывает план выполнения оператора.

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
  Expression (Проекция)
    Expression (До ORDER BY и SELECT)
      Aggregating (Агрегирование)
        Expression (До GROUP BY)
          SettingQuotaAndLimits (Установка лимитов и квот после чтения из хранилища)
            ReadFromStorage (SystemNumbers)
  Expression (Проекция)
    MergingSorted (Слияние отсортированных потоков для ORDER BY)
      MergeSorting (Слияние отсортированных блоков для ORDER BY)
        PartialSorting (Сортировка каждого блока для ORDER BY)
          Expression (До ORDER BY и SELECT)
            Aggregating (Агрегирование)
              Expression (До GROUP BY)
                SettingQuotaAndLimits (Установка лимитов и квот после чтения из хранилища)
                  ReadFromStorage (SystemNumbers)
```


## Типы EXPLAIN {#explain-types}

- `AST` — Абстрактное синтаксическое дерево.
- `SYNTAX` — Текст запроса после оптимизаций на уровне AST.
- `QUERY TREE` — Дерево запроса после оптимизаций на уровне дерева запроса.
- `PLAN` — План выполнения запроса.
- `PIPELINE` — Конвейер выполнения запроса.

### EXPLAIN AST {#explain-ast}

Выводит AST запроса. Поддерживает все типы запросов, не только `SELECT`.

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

Это выполняется путем разбора запроса, построения AST запроса и дерева запроса, опционального запуска анализатора запросов и проходов оптимизации с последующим преобразованием дерева запроса обратно в AST запроса.

Настройки:

- `oneline` – Вывести запрос в одну строку. По умолчанию: `0`.
- `run_query_tree_passes` – Выполнить проходы дерева запроса перед выводом дерева запроса. По умолчанию: `0`.
- `query_tree_passes` – Если установлен параметр `run_query_tree_passes`, указывает количество проходов для выполнения. Без указания `query_tree_passes` выполняются все проходы.

Примеры:

```sql
EXPLAIN SYNTAX SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Результат:

```sql
SELECT *
FROM system.numbers AS a, system.numbers AS b, system.numbers AS c
WHERE (a.number = b.number) AND (b.number = c.number)
```

С параметром `run_query_tree_passes`:

```sql
EXPLAIN SYNTAX run_query_tree_passes = 1 SELECT * FROM system.numbers AS a, system.numbers AS b, system.numbers AS c WHERE a.number = b.number AND b.number = c.number;
```

Результат:

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

- `run_passes` — Выполнить все проходы дерева запроса перед выводом дерева запроса. По умолчанию: `1`.
- `dump_passes` — Вывести информацию об использованных проходах перед выводом дерева запроса. По умолчанию: `0`.
- `passes` — Указывает количество проходов для выполнения. Если установлено значение `-1`, выполняются все проходы. По умолчанию: `-1`.
- `dump_tree` — Отобразить дерево запроса. По умолчанию: `1`.
- `dump_ast` — Отобразить AST запроса, сгенерированный из дерева запроса. По умолчанию: `0`.

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


* `header` — Выводит заголовок шага. По умолчанию: 0.
* `description` — Выводит описание шага. По умолчанию: 1.
* `indexes` — Показывает используемые индексы, число отфильтрованных кусков (parts) и число отфильтрованных гранул для каждого применённого индекса. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Начиная с ClickHouse &gt;= v25.9, этот параметр даёт осмысленный вывод только при использовании с `SETTINGS use_query_condition_cache = 0, use_skip_indexes_on_data_read = 0`.
* `projections` — Показывает все проанализированные проекции и их влияние на фильтрацию на уровне кусков (part-level) на основе условий по первичному ключу проекции. Для каждой проекции этот раздел включает статистику, такую как количество кусков, строк, меток и диапазонов, которые были обработаны с использованием первичного ключа проекции. Также показывает, сколько кусков данных было пропущено из‑за такой фильтрации без чтения самой проекции. Было ли чтение фактически выполнено из проекции или она использовалась только для фильтрации, можно определить по полю `description`. По умолчанию: 0. Поддерживается для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).
* `actions` — Выводит подробную информацию о действиях шага. По умолчанию: 0.
* `json` — Выводит шаги плана запроса в виде строки в формате [JSON](/interfaces/formats/JSON). По умолчанию: 0. Рекомендуется использовать формат [TabSeparatedRaw (TSVRaw)](/interfaces/formats/TabSeparatedRaw), чтобы избежать лишнего экранирования.
* `input_headers` — Выводит входные заголовки шага. По умолчанию: 0. В основном полезно разработчикам для отладки проблем, связанных с несоответствием входных и выходных заголовков.

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
        SettingQuotaAndLimits (Установка ограничений и квот после чтения из хранилища)
          ReadFromStorage (SystemNumbers)
```

:::note
Оценка стоимости выполнения шагов и запросов не поддерживается.
:::

Когда `json = 1`, план запроса представляется в формате JSON. Каждый узел — это словарь, который всегда содержит ключи `Node Type` и `Plans`. `Node Type` — это строка с именем шага. `Plans` — это массив с описаниями дочерних шагов. В зависимости от типа узла и настроек могут быть добавлены другие необязательные ключи.

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

При значении `description` = 1 к шагу добавляется ключ `Description`:

```json
{
  "Node Type": "ReadFromStorage",
  "Description": "SystemOne"
}
```

При `header` = 1 к шагу добавляется ключ `Header` в виде массива столбцов.

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


При значении `indexes` = 1 добавляется ключ `Indexes`. Он содержит массив использованных индексов. Каждый индекс описывается JSON-объектом с ключом `Type` (строка `MinMax`, `Partition`, `PrimaryKey` или `Skip`) и дополнительными необязательными ключами:

* `Name` — имя индекса (в настоящее время используется только для индексов `Skip`).
* `Keys` — массив столбцов, используемых индексом.
* `Condition` — применённое условие.
* `Description` — описание индекса (в настоящее время используется только для индексов `Skip`).
* `Parts` — количество партиций до/после применения индекса.
* `Granules` — количество гранул до/после применения индекса.
* `Ranges` — количество диапазонов гранул после применения индекса.

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

При `projections` = 1 добавляется ключ `Projections`. Он содержит массив проанализированных проекций. Каждая проекция описывается в формате JSON со следующими ключами:

* `Name` — имя проекции.
* `Condition` — условие по первичному ключу, используемое проекцией.
* `Description` — описание того, как используется проекция (например, фильтрация на уровне кусков данных).
* `Selected Parts` — число кусков данных, выбранных проекцией.
* `Selected Marks` — число выбранных меток.
* `Selected Ranges` — число выбранных диапазонов.
* `Selected Rows` — число выбранных строк.
* `Filtered Parts` — число кусков данных, пропущенных из‑за фильтрации на уровне кусков.

Пример:

```json
"Node Type": "ReadFromMergeTree",
"Projections": [
  {
    "Name": "region_proj",
    "Description": "Проекция проанализирована и используется для фильтрации на уровне партов",
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
    "Description": "Проекция проанализирована и используется для фильтрации на уровне партов",
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

При `actions` = 1 добавляемые ключи зависят от типа шага.

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

- `header` — выводит заголовок для каждого выходного порта. Значение по умолчанию: 0.
- `graph` — выводит граф, описанный на языке описания графов [DOT](<https://en.wikipedia.org/wiki/DOT_(graph_description_language)>). Значение по умолчанию: 0.
- `compact` — выводит граф в компактном режиме, если включена настройка `graph`. Значение по умолчанию: 1.

При `compact=0` и `graph=1` имена процессоров будут содержать дополнительный суффикс с уникальным идентификатором процессора.

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

Показывает оценочное количество строк, засечек и кусков данных, которые будут прочитаны из таблиц при выполнении запроса. Работает с таблицами семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree).

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

Показывает результат переопределения таблицы для схемы таблицы, доступной через табличную функцию.
Также выполняет проверку корректности, выбрасывая исключение, если переопределение могло бы привести к ошибке.

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
│ PARTITION BY uses columns: `created` Nullable(DateTime) │
└─────────────────────────────────────────────────────────┘
```

:::note
Проверка не является полной, поэтому успешное выполнение запроса не гарантирует, что переопределение не вызовет проблем.
:::
