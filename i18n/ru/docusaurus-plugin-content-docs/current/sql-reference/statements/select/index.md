---
slug: /sql-reference/statements/select/
sidebar_position: 32
sidebar_label: SELECT
---


# Запрос SELECT

`SELECT` запросы выполняют извлечение данных. По умолчанию запрашиваемые данные возвращаются клиенту, в то время как в сочетании с [INSERT INTO](../../../sql-reference/statements/insert-into.md) их можно перенаправить в другую таблицу.

## Синтаксис {#syntax}

``` sql
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

Все части являются необязательными, за исключением обязательного списка выражений сразу после `SELECT`, который рассматривается более подробно [ниже](#select-clause).

Специфика каждого необязательного условия рассматривается в отдельных разделах, которые перечислены в том же порядке, в котором они выполняются:

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

## Условие SELECT {#select-clause}

[Выражения](/sql-reference/syntax#expressions), указанные в условии `SELECT`, рассчитываются после завершения всех операций в приведенных выше условиях. Эти выражения работают так, как будто они применяются к отдельным строкам результата. Если выражения в условии `SELECT` содержат агрегатные функции, ClickHouse обрабатывает агрегатные функции и выражения, используемые в качестве их аргументов, во время агрегации [GROUP BY](/sql-reference/statements/select/group-by).

Если вы хотите включить все колонки в результат, используйте символ астериск (`*`). Например, `SELECT * FROM ...`.


### Динамический выбор колонок {#dynamic-column-selection}

Динамический выбор колонок (также известный как выражение COLUMNS) позволяет вам сопоставить некоторые колонки в результате с регулярным выражением [re2](https://en.wikipedia.org/wiki/RE2_(software)).

``` sql
COLUMNS('regexp')
```

Например, рассмотрим таблицу:

``` sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

Следующий запрос выбирает данные из всех колонок, содержащих символ `a` в своем имени.

``` sql
SELECT COLUMNS('a') FROM col_names
```

``` text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

Выбранные колонки возвращаются не в алфавитном порядке.

Вы можете использовать несколько выражений `COLUMNS` в запросе и применять к ним функции.

Например:

``` sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

``` text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

Каждая колонка, возвращаемая выражением `COLUMNS`, передается функции в качестве отдельного аргумента. Кроме того, вы можете передавать другие аргументы функции, если она их поддерживает. Будьте осторожны при использовании функций. Если функция не поддерживает количество аргументов, которые вы передали ей, ClickHouse выбрасывает исключение.

Например:

``` sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

``` text
Получено исключение от сервера (версия 19.14.1):
Код: 42. DB::Exception: Получено от localhost:9000. DB::Exception: Количество аргументов для функции plus не совпадает: передано 3, должно быть 2.
```

В этом примере `COLUMNS('a')` возвращает две колонки: `aa` и `ab`. `COLUMNS('c')` возвращает колонку `bc`. Оператор `+` не может применяться к 3 аргументам, поэтому ClickHouse выбрасывает исключение с соответствующим сообщением.

Колонки, которые соответствуют выражению `COLUMNS`, могут иметь разные типы данных. Если `COLUMNS` не соответствует никаким колонкам и является единственным выражением в `SELECT`, ClickHouse выбрасывает исключение.

### Астериск {#asterisk}

Вы можете поставить астериск в любой части запроса вместо выражения. Когда запрос анализируется, астериск разворачивается в список всех колонок таблицы (исключая колонки `MATERIALIZED` и `ALIAS`). Есть лишь несколько случаев, когда использование астериска оправдано:

- При создании дампа таблицы.
- Для таблиц, содержащих всего несколько колонок, таких как системные таблицы.
- Для получения информации о том, какие колонки есть в таблице. В этом случае установите `LIMIT 1`. Но лучше использовать запрос `DESC TABLE`.
- Когда используется сильная фильтрация по небольшому количеству колонок с помощью `PREWHERE`.
- В подзапросах (так как колонки, которые не нужны для внешнего запроса, исключаются из подзапросов).

Во всех других случаях мы не рекомендуем использовать астериск, так как он принесет вам только недостатки колоночной СУБД вместо преимуществ. Другими словами, использование астериска не рекомендуется.

### Крайние значения {#extreme-values}

Кроме результатов, вы также можете получить минимальные и максимальные значения для колонок результата. Для этого установите настройку **extremes** в 1. Минимумы и максимумы вычисляются для числовых типов, дат и дат с временем. Для других колонок выводятся значения по умолчанию.

Вычисляются дополнительные две строки – минимумы и максимумы, соответственно. Эти дополнительные две строки выводятся в форматах `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template` и `Pretty*`, отдельно от других строк. Они не выводятся для других форматов.

В форматах `JSON*` и `XML` крайние значения выводятся в отдельном поле 'extremes'. В форматах `TabSeparated*`, `CSV*` и `Vertical` строка следует после основного результата, а после 'totals', если он присутствует. Она предшествует пустой строке (после других данных). В форматах `Pretty*` строка выводится как отдельная таблица после основного результата и после `totals`, если он присутствует. В формате `Template` крайние значения выводятся в соответствии с указанным шаблоном.

Крайние значения вычисляются для строк перед `LIMIT`, но после `LIMIT BY`. Однако при использовании `LIMIT offset, size` строки перед `offset` включены в `extremes`. В потоковых запросах результат может также включать небольшое количество строк, которые прошли через `LIMIT`.

### Примечания {#notes}

Вы можете использовать синонимы (`AS` алиасы) в любой части запроса.

Условия `GROUP BY`, `ORDER BY` и `LIMIT BY` могут поддерживать позиционные аргументы. Чтобы включить эту возможность, переключите настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments). Тогда, например, `ORDER BY 1,2` будет сортировать строки в таблице по первому, а затем по второму столбцу.

## Детали реализации {#implementation-details}

Если запрос не содержит условий `DISTINCT`, `GROUP BY` и `ORDER BY`, а также подзапросов `IN` и `JOIN`, запрос будет полностью обработан в потоке, с использованием O(1) объема ОЗУ. В противном случае запрос может потреблять много ОЗУ, если соответствующие ограничения не указаны:

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

Для получения дополнительной информации смотрите раздел "Настройки". Возможно использование внешней сортировки (сохранение временных таблиц на диск) и внешней агрегации.

## Модификаторы SELECT {#select-modifiers}

Вы можете использовать следующие модификаторы в запросах `SELECT`.

### APPLY {#apply}

Позволяет вам вызывать какую-либо функцию для каждой строки, возвращаемой внешним выражением таблицы запроса.

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

Указывает имена одной или нескольких колонок, которые следует исключить из результата. Все совпадающие имена колонок пропускаются в выводе.

**Синтаксис:**

``` sql
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

Указывает одно или несколько [алиасов выражений](/sql-reference/syntax#expression-aliases). Каждый алиас должен соответствовать имени колонки из выражения `SELECT *`. В выводимом списке колонок колонка, соответствующая алиасу, заменяется выражением в этом `REPLACE`.

Этот модификатор не изменяет имена или порядок колонок. Однако он может изменить значение и тип значения.

**Синтаксис:**

``` sql
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

Вы можете указать необходимые настройки прямо в запросе `SELECT`. Значение настройки применяется только к этому запросу и сбрасывается на значение по умолчанию или предыдущее значение после выполнения запроса.

Другие способы установить настройки смотрите [здесь](/operations/settings/overview).

**Пример**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
