---
description: 'Документация для запроса SELECT'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'Запрос SELECT'
---


# Запрос SELECT

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

Все клаузулы являются необязательными, за исключением обязательного списка выражений, который находится сразу после `SELECT` и который рассматривается более подробно [ниже](#select-clause).

Специфика каждой необязательной клаузулы рассматривается в отдельных разделах, которые перечислены в том порядке, в котором они выполняются:

- [WITH clause](../../../sql-reference/statements/select/with.md)
- [SELECT clause](#select-clause)
- [DISTINCT clause](../../../sql-reference/statements/select/distinct.md)
- [FROM clause](../../../sql-reference/statements/select/from.md)
- [SAMPLE clause](../../../sql-reference/statements/select/sample.md)
- [JOIN clause](../../../sql-reference/statements/select/join.md)
- [PREWHERE clause](../../../sql-reference/statements/select/prewhere.md)
- [WHERE clause](../../../sql-reference/statements/select/where.md)
- [WINDOW clause](../../../sql-reference/window-functions/index.md)
- [GROUP BY clause](/sql-reference/statements/select/group-by)
- [LIMIT BY clause](../../../sql-reference/statements/select/limit-by.md)
- [HAVING clause](../../../sql-reference/statements/select/having.md)
- [QUALIFY clause](../../../sql-reference/statements/select/qualify.md)
- [LIMIT clause](../../../sql-reference/statements/select/limit.md)
- [OFFSET clause](../../../sql-reference/statements/select/offset.md)
- [UNION clause](../../../sql-reference/statements/select/union.md)
- [INTERSECT clause](../../../sql-reference/statements/select/intersect.md)
- [EXCEPT clause](../../../sql-reference/statements/select/except.md)
- [INTO OUTFILE clause](../../../sql-reference/statements/select/into-outfile.md)
- [FORMAT clause](../../../sql-reference/statements/select/format.md)

## Клаузула SELECT {#select-clause}

[Выражения](/sql-reference/syntax#expressions), указанные в клаузуле `SELECT`, вычисляются после завершения всех операций в описанных выше клаузах. Эти выражения работают так, как если бы они применялись к отдельным строкам в результате. Если выражения в клаузуле `SELECT` содержат агрегатные функции, то ClickHouse обрабатывает агрегатные функции и выражения, используемые в качестве их аргументов, во время агрегации [GROUP BY](/sql-reference/statements/select/group-by).

Если вы хотите включить все колонки в результат, используйте символ звёздочки (`*`). Например, `SELECT * FROM ...`.

### Динамический выбор колонок {#dynamic-column-selection}

Динамический выбор колонок (также известный как выражение COLUMNS) позволяет вам сопоставить некоторые колонки в результате с регулярным выражением [re2](https://en.wikipedia.org/wiki/RE2_(software)).

```sql
COLUMNS('regexp')
```

Например, рассмотрим таблицу:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

Следующий запрос выбирает данные из всех колонок, содержащих символ `a` в своем имени.

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

Выбранные колонки возвращаются не в алфавитном порядке.

Вы можете использовать несколько выражений `COLUMNS` в запросе и применять функции к ним.

Например:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

Каждая колонка, возвращаемая выражением `COLUMNS`, передается функции как отдельный аргумент. Также вы можете передавать другие аргументы функции, если она их поддерживает. Будьте осторожны при использовании функций. Если функция не поддерживает количество аргументов, которые вы ей передали, ClickHouse выбросит исключение.

Например:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Получено исключение от сервера (версия 19.14.1):
Код: 42. DB::Exception: Получено от localhost:9000. DB::Exception: Число аргументов для функции plus не соответствует: передано 3, должно быть 2.
```

В этом примере `COLUMNS('a')` возвращает две колонки: `aa` и `ab`. `COLUMNS('c')` возвращает колонку `bc`. Оператор `+` не может применяться к 3 аргументам, поэтому ClickHouse выбрасывает исключение с соответствующим сообщением.

Колонки, которые соответствуют выражению `COLUMNS`, могут иметь разные типы данных. Если `COLUMNS` не соответствует ни одной колонке и является единственным выражением в `SELECT`, ClickHouse выбрасывает исключение.

### Звёздочка {#asterisk}

Вы можете помещать звёздочку в любую часть запроса вместо выражения. Когда запрос анализируется, звёздочка расширяется в список всех колонок таблицы (исключая колонки `MATERIALIZED` и `ALIAS`). Существуют лишь несколько случаев, когда использование звёздочки оправдано:

- При создании дампа таблицы.
- Для таблиц, содержащих всего несколько колонок, таких как системные таблицы.
- Для получения информации о том, какие колонки содержатся в таблице. В этом случае установите `LIMIT 1`. Но лучше использовать запрос `DESC TABLE`.
- Когда есть сильная фильтрация по небольшому количеству колонок с использованием `PREWHERE`.
- В подзапросах (так как колонки, которые не нужны для внешнего запроса, исключаются из подзапросов).

Во всех остальных случаях мы не рекомендуем использовать звёздочку, так как она приносит только недостатки столбцовой СУБД вместо преимуществ. Другими словами, использование звёздочки не рекомендуется.

### Экстремальные значения {#extreme-values}

В дополнение к результатам вы также можете получить минимальные и максимальные значения для колонок результатов. Для этого установите настройку **extremes** в 1. Минимумы и максимумы рассчитываются для числовых типов, дат и дат с временем. Для других колонок выводятся значения по умолчанию.

Дополнительно рассчитываются две строки – минимумы и максимумы соответственно. Эти дополнительные две строки выводятся в `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template` и `Pretty*` [форматах](../../../interfaces/formats.md), отделенные от других строк. Они не выводятся для других форматов.

В форматах `JSON*` и `XML` экстремальные значения выводятся в отдельном поле 'extremes'. В форматах `TabSeparated*`, `CSV*` и `Vertical` строка идет после основного результата, и после 'totals', если они присутствуют. Она предшествуется пустой строкой (после остальных данных). В `Pretty*` форматах строка выводится как отдельная таблица после основного результата и после `totals`, если они присутствуют. В формате `Template` экстремальные значения выводятся согласно указанному шаблону.

Экстремальные значения рассчитываются для строк перед `LIMIT`, но после `LIMIT BY`. Тем не менее, при использовании `LIMIT offset, size` строки перед `offset` включаются в `extremes`. В стрим-запросах результат также может включать небольшое количество строк, которые прошли через `LIMIT`.

### Заметки {#notes}

Вы можете использовать синонимы (`AS` псевдонимы) в любой части запроса.

Клаузы `GROUP BY`, `ORDER BY` и `LIMIT BY` могут поддерживать позиционные аргументы. Чтобы включить эту возможность, включите настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments). Тогда, например, `ORDER BY 1,2` будет сортировать строки в таблице по первой, а затем по второй колонне.

## Подробности реализации {#implementation-details}

Если запрос не включает клаузы `DISTINCT`, `GROUP BY` и `ORDER BY`, а также подзапросы `IN` и `JOIN`, запрос будет полностью обрабатываться в потоке, используя O(1) объем ОП. В противном случае запрос может потреблять много ОП, если не указаны соответствующие ограничения:

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

Для получения дополнительной информации см. раздел "Настройки". Возможна также внешняя сортировка (сохранение временных таблиц на диск) и внешняя агрегация.

## Модификаторы SELECT {#select-modifiers}

Вы можете использовать следующие модификаторы в запросах `SELECT`.

### APPLY {#apply}

Позволяет вам вызвать какую-либо функцию для каждой строки, возвращаемой внешним табличным выражением запроса.

**Синтаксис:**

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

**Пример:**

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```

### EXCEPT {#except}

Указывает имена одной или нескольких колонок, которые следует исключить из результата. Все совпадающие имена колонок будут пропущены в выводе.

**Синтаксис:**

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

**Пример:**

```sql
SELECT * EXCEPT (i) from columns_transformers;
```

```response
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```

### REPLACE {#replace}

Указывает одну или несколько [псевдонимов выражений](/sql-reference/syntax#expression-aliases). Каждый псевдоним должен совпадать с именем колонки из оператора `SELECT *`. В списке выходных колонок колонка, которая совпадает с псевдонимом, заменяется выражением в этом `REPLACE`.

Этот модификатор не изменяет имена или порядок колонок. Однако он может изменить значение и тип значения.

**Синтаксис:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**Пример:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```

### Комбинации модификаторов {#modifier-combinations}

Вы можете использовать каждый модификатор отдельно или комбинировать их.

**Примеры:**

Использование одного и того же модификатора несколько раз.

```sql
SELECT COLUMNS('[jk]') APPLY(toString) APPLY(length) APPLY(max) from columns_transformers;
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

## НАСТРОЙКИ в запросе SELECT {#settings-in-select-query}

Вы можете указать необходимые настройки прямо в запросе `SELECT`. Значение настройки применяется только к этому запросу и сбрасывается к значению по умолчанию или предыдущему значению после выполнения запроса.

Другие способы установки настроек смотрите [здесь](/operations/settings/overview).

**Пример**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
