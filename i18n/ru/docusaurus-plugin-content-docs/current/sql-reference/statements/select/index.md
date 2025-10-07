---
slug: '/sql-reference/statements/select/'
sidebar_label: SELECT
sidebar_position: 32
description: 'SELECT поиск документации'
title: 'Запрос SELECT'
doc_type: reference
---
# SELECT Запрос

`SELECT` запросы выполняют извлечение данных. По умолчанию запрашиваемые данные возвращаются клиенту, в то время как в сочетании с [INSERT INTO](../../../sql-reference/statements/insert-into.md) они могут быть перенаправлены в другую таблицу.

## Синтаксис {#syntax}

```sql
[WITH expr_list(subquery)]
SELECT [DISTINCT [ON (column1, column2, ...)]] expr_list
[FROM [db.]table | (subquery) | table_function] [FINAL]
[SAMPLE sample_coeff]
[ARRAY JOIN ...]
[GLOBAL] [ANY|ALL|ASOF] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI] JOIN (subquery)|table [(alias1 [, alias2 ...])] (ON <expr_list>)|(USING <column_list>)
[PREWHERE expr]
[WHERE expr]
[GROUP BY expr_list] [WITH ROLLUP|WITH CUBE] [WITH TOTALS]
[HAVING expr]
[WINDOW window_expr_list]
[QUALIFY expr]
[ORDER BY expr_list] [WITH FILL] [FROM expr] [TO expr] [STEP expr] [INTERPOLATE [(expr_list)]]
[LIMIT [offset_value, ]n BY columns]
[LIMIT [n, ]m] [WITH TIES]
[SETTINGS ...]
[UNION  ...]
[INTO OUTFILE filename [COMPRESSION type [LEVEL level]] ]
[FORMAT format]
```

Все клаузулы являются необязательными, за исключением обязательного списка выражений, который идет сразу после `SELECT`, что описано более подробно [ниже](#select-clause).

Специфика каждой необязательной клаузулы описана в отдельных разделах, которые перечислены в том же порядке, в котором они выполняются:

- [WITH клаузула](../../../sql-reference/statements/select/with.md)
- [SELECT клаузула](#select-clause)
- [DISTINCT клаузула](../../../sql-reference/statements/select/distinct.md)
- [FROM клаузула](../../../sql-reference/statements/select/from.md)
- [SAMPLE клаузула](../../../sql-reference/statements/select/sample.md)
- [JOIN клаузула](../../../sql-reference/statements/select/join.md)
- [PREWHERE клаузула](../../../sql-reference/statements/select/prewhere.md)
- [WHERE клаузула](../../../sql-reference/statements/select/where.md)
- [WINDOW клаузула](../../../sql-reference/window-functions/index.md)
- [GROUP BY клаузула](/sql-reference/statements/select/group-by)
- [LIMIT BY клаузула](../../../sql-reference/statements/select/limit-by.md)
- [HAVING клаузула](../../../sql-reference/statements/select/having.md)
- [QUALIFY клаузула](../../../sql-reference/statements/select/qualify.md)
- [LIMIT клаузула](../../../sql-reference/statements/select/limit.md)
- [OFFSET клаузула](../../../sql-reference/statements/select/offset.md)
- [UNION клаузула](../../../sql-reference/statements/select/union.md)
- [INTERSECT клаузула](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT клаузула](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE клаузула](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT клаузула](../../../sql-reference/statements/select/format.md)

## SELECT Клаузула {#select-clause}

[Выражения](/sql-reference/syntax#expressions), указанные в клаузуле `SELECT`, вычисляются после завершения всех операций в описанных выше клаузулах. Эти выражения работают так, как если бы они применялись к отдельным строкам в результате. Если выражения в клаузуле `SELECT` содержат агрегатные функции, то ClickHouse обрабатывает агрегатные функции и выражения, используемые в качестве их аргументов, во время агрегации [GROUP BY](/sql-reference/statements/select/group-by).

Если вы хотите включить все столбцы в результат, используйте символ звёздочки (`*`). Например, `SELECT * FROM ...`.

### Динамический выбор столбцов {#dynamic-column-selection}

Динамический выбор столбцов (также известный как выражение COLUMNS) позволяет сопоставить некоторые столбцы в результате с регулярным выражением [re2](https://en.wikipedia.org/wiki/RE2_(software)).

```sql
COLUMNS('regexp')
```

Например, рассмотрим таблицу:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

Следующий запрос выбирает данные из всех столбцов, содержащих символ `a` в своем имени.

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

Выбранные столбцы не возвращаются в алфавитном порядке.

Вы можете использовать несколько выражений `COLUMNS` в запросе и применять к ним функции.

Например:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

Каждый столбец, возвращаемый выражением `COLUMNS`, передается функции в качестве отдельного аргумента. Вы также можете передать другие аргументы функции, если она их поддерживает. Будьте осторожны, используя функции. Если функция не поддерживает количество аргументов, которые вы ей передали, ClickHouse вызывает исключение.

Например:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

В этом примере `COLUMNS('a')` возвращает два столбца: `aa` и `ab`. `COLUMNS('c')` возвращает столбец `bc`. Оператор `+` не может применяться к 3 аргументам, поэтому ClickHouse вызывает исключение с соответствующим сообщением.

Столбцы, которые соответствуют выражению `COLUMNS`, могут иметь разные типы данных. Если `COLUMNS` не соответствует ни одному столбцу и является единственным выражением в `SELECT`, ClickHouse вызывает исключение.

### Звёздочка {#asterisk}

Вы можете вставить звёздочку в любую часть запроса вместо выражения. Когда запрос анализируется, звёздочка заменяется списком всех столбцов таблицы (исключая `MATERIALIZED` и `ALIAS` столбцы). Существуют лишь несколько случаев, когда использование звёздочки оправдано:

- При создании дампа таблицы.
- Для таблиц, содержащих всего несколько столбцов, таких как системные таблицы.
- Для получения информации о том, какие столбцы находятся в таблице. В этом случае установите `LIMIT 1`. Но лучше использовать запрос `DESC TABLE`.
- Когда есть строгая фильтрация по небольшому количеству столбцов с использованием `PREWHERE`.
- В подзапросах (поскольку столбцы, которые не нужны для внешнего запроса, исключаются из подзапросов).

Во всех остальных случаях мы не рекомендуем использовать звёздочку, поскольку она приносит лишь недостатки столбцового СУБД, а не преимущества. Другими словами, использование звёздочки не рекомендуется.

### Экстремальные значения {#extreme-values}

В дополнение к результатам вы также можете получить минимальные и максимальные значения для столбцов результатов. Для этого установите настройку **extremes** в 1. Минимумы и максимумы вычисляются для числовых типов, дат и дат с временем. Для других столбцов выводятся значения по умолчанию.

Вычисляются дополнительные две строки — минимумы и максимумы соответственно. Эти дополнительные две строки выводятся в `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template` и `Pretty*` [форматах](../../../interfaces/formats.md), отдельно от других строк. Они не выводятся для других форматов.

В форматах `JSON*` и `XML` экстремальные значения выводятся в отдельном поле 'extremes'. В форматах `TabSeparated*`, `CSV*` и `Vertical` строка идет после основного результата и после 'totals', если она присутствует. Она предшествуется пустой строкой (после других данных). В `Pretty*` форматах строка выводится как отдельная таблица после основного результата и после `totals`, если она присутствует. В формате `Template` экстремальные значения выводятся согласно заданному шаблону.

Экстремальные значения вычисляются для строк перед `LIMIT`, но после `LIMIT BY`. Однако при использовании `LIMIT offset, size` строки перед `offset` включаются в `extremes`. В потоковых запросах результат также может включать небольшое количество строк, которые прошли через `LIMIT`.

### Примечания {#notes}

Вы можете использовать синонимы (`AS` алиасы) в любой части запроса.

Клаузулы `GROUP BY`, `ORDER BY` и `LIMIT BY` могут поддерживать позиционные аргументы. Чтобы включить это, включите настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments). Тогда, например, `ORDER BY 1,2` будет сортировать строки в таблице по первому, а затем по второму столбцу.

## Подробности реализации {#implementation-details}

Если запрос пропускает клаузулы `DISTINCT`, `GROUP BY` и `ORDER BY`, а также подзапросы `IN` и `JOIN`, запрос будет полностью обрабатываться потоково, используя O(1) объём ОЗУ. В противном случае запрос может потреблять много ОЗУ, если подходящие ограничения не указаны:

- `max_memory_usage`
- `max_rows_to_group_by`
- `max_rows_to_sort`
- `max_rows_in_distinct`
- `max_bytes_in_distinct`
- `max_rows_in_set`
- `max_bytes_in_set`
- `max_rows_in_join`
- `max_bytes_in_join`
- `max_bytes_before_external_sort`
- `max_bytes_ratio_before_external_sort`
- `max_bytes_before_external_group_by`
- `max_bytes_ratio_before_external_group_by`

Для получения дополнительной информации смотрите раздел "Настройки". Также возможно использовать внешнюю сортировку (сохранение временных таблиц на диск) и внешнюю агрегацию.

## Модификаторы SELECT {#select-modifiers}

Вы можете использовать следующие модификаторы в запросах `SELECT`.

| Модификатор                            | Описание                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`APPLY`](./apply_modifier.md)     | Позволяет вам вызвать некоторую функцию для каждой строки, возвращаемой выражением внешней таблицы запроса.                                                                                                                                                                                                                                                                                        |
| [`EXCEPT`](./except_modifier.md)   | Указывает имена одного или нескольких столбцов, которые следует исключить из результата. Все соответствующие имена столбцов опускаются из вывода.                                                                                                                                                                                                                                                            |
| [`REPLACE`](./replace_modifier.md) | Указывает одно или несколько [алиасов выражений](/sql-reference/syntax#expression-aliases). Каждый алиас должен соответствовать имени столбца из оператора `SELECT *`. В выводимом списке столбцов столбец, который соответствует алиасу, заменяется выражением в этом `REPLACE`. Этот модификатор не изменяет имена или порядок столбцов. Однако он может изменить значение и тип значения. |

### Комбинации модификаторов {#modifier-combinations}

Вы можете использовать каждый модификатор отдельно или комбинировать их.

**Примеры:**

Использование одного и того же модификатора несколько раз.

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) FROM columns_transformers;
```

```response
┌─max(length(toString(j)))─┬─max(length(toString(k)))─┐
│                        2 │                        3 │
└──────────────────────────┴──────────────────────────┘
```

Использование нескольких модификаторов в одном запросе.

```sql
SELECT * REPLACE(i + 1 AS i) EXCEPT (j) APPLY(sum) from columns_transformers;
```

```response
┌─sum(plus(i, 1))─┬─sum(k)─┐
│             222 │    347 │
└─────────────────┴────────┘
```

## SETTINGS в SELECT Запросе {#settings-in-select-query}

Вы можете задать необходимые настройки прямо в запросе `SELECT`. Значение настройки применяется только к этому запросу и сбрасывается на значение по умолчанию или предыдущее значение после выполнения запроса.

Другие способы задания настроек смотрите [здесь](/operations/settings/overview).

Для булевых настроек, установленных в true, вы можете использовать сокращённый синтаксис, опуская присвоение значения. Когда указано только имя настройки, оно автоматически устанавливается в `1` (true).

**Пример**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```