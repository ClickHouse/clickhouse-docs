---
description: 'Документация по запросу SELECT'
sidebar_label: 'SELECT'
sidebar_position: 32
slug: /sql-reference/statements/select/
title: 'Запрос SELECT'
doc_type: 'reference'
---

# Запрос SELECT

Запросы `SELECT` выполняют извлечение данных. По умолчанию запрошенные данные возвращаются клиенту, а в сочетании с [INSERT INTO](../../../sql-reference/statements/insert-into.md) могут быть перенаправлены в другую таблицу.

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

Все секции необязательны, за исключением обязательного списка выражений непосредственно после `SELECT`, который подробно рассматривается [ниже](#select-clause).

Особенности каждой необязательной секции рассматриваются в отдельных разделах, которые перечислены в том же порядке, в котором они выполняются:

- [Секция WITH](../../../sql-reference/statements/select/with.md)
- [Секция SELECT](#select-clause)
- [Секция DISTINCT](../../../sql-reference/statements/select/distinct.md)
- [Секция FROM](../../../sql-reference/statements/select/from.md)
- [Секция SAMPLE](../../../sql-reference/statements/select/sample.md)
- [Секция JOIN](../../../sql-reference/statements/select/join.md)
- [Секция PREWHERE](../../../sql-reference/statements/select/prewhere.md)
- [Секция WHERE](../../../sql-reference/statements/select/where.md)
- [Секция WINDOW](../../../sql-reference/window-functions/index.md)
- [Секция GROUP BY](/sql-reference/statements/select/group-by)
- [Секция LIMIT BY](../../../sql-reference/statements/select/limit-by.md)
- [Секция HAVING](../../../sql-reference/statements/select/having.md)
- [Секция QUALIFY](../../../sql-reference/statements/select/qualify.md)
- [Секция LIMIT](../../../sql-reference/statements/select/limit.md)
- [Секция OFFSET](../../../sql-reference/statements/select/offset.md)
- [Секция UNION](../../../sql-reference/statements/select/union.md)
- [Секция INTERSECT](../../../sql-reference/statements/select/intersect.md)
- [Секция EXCEPT](../../../sql-reference/statements/select/except.md)
- [Секция INTO OUTFILE](../../../sql-reference/statements/select/into-outfile.md)
- [Секция FORMAT](../../../sql-reference/statements/select/format.md)

## Секция SELECT {#select-clause}

[Выражения](/sql-reference/syntax#expressions), указанные в секции `SELECT`, вычисляются после завершения всех операций в секциях, описанных выше. Эти выражения работают так, как если бы они применялись к отдельным строкам результата. Если выражения в секции `SELECT` содержат агрегатные функции, то ClickHouse обрабатывает агрегатные функции и выражения, используемые в качестве их аргументов, во время агрегации [GROUP BY](/sql-reference/statements/select/group-by).

Чтобы включить все столбцы в результат, используйте символ звездочки (`*`). Например, `SELECT * FROM ...`.

### Динамический выбор столбцов {#dynamic-column-selection}

Динамический выбор столбцов (также известный как выражение COLUMNS) позволяет выбрать столбцы в результате с помощью регулярного выражения [re2](<https://en.wikipedia.org/wiki/RE2_(software)>).

```sql
COLUMNS('regexp')
```

Например, рассмотрим таблицу:

```sql
CREATE TABLE default.col_names (aa Int8, ab Int8, bc Int8) ENGINE = TinyLog
```

Следующий запрос выбирает данные из всех столбцов, содержащих символ `a` в имени.

```sql
SELECT COLUMNS('a') FROM col_names
```

```text
┌─aa─┬─ab─┐
│  1 │  1 │
└────┴────┘
```

Выбранные столбцы возвращаются не в алфавитном порядке.

В запросе можно использовать несколько выражений `COLUMNS` и применять к ним функции.

Например:

```sql
SELECT COLUMNS('a'), COLUMNS('c'), toTypeName(COLUMNS('c')) FROM col_names
```

```text
┌─aa─┬─ab─┬─bc─┬─toTypeName(bc)─┐
│  1 │  1 │  1 │ Int8           │
└────┴────┴────┴────────────────┘
```

Каждый столбец, возвращаемый выражением `COLUMNS`, передается функции в качестве отдельного аргумента. Также можно передавать функции другие аргументы, если она их поддерживает. Будьте осторожны при использовании функций. Если функция не поддерживает переданное ей количество аргументов, ClickHouse выбрасывает исключение.

Например:

```sql
SELECT COLUMNS('a') + COLUMNS('c') FROM col_names
```

```text
Received exception from server (version 19.14.1):
Code: 42. DB::Exception: Received from localhost:9000. DB::Exception: Number of arguments for function plus does not match: passed 3, should be 2.
```

В этом примере `COLUMNS('a')` возвращает два столбца: `aa` и `ab`. `COLUMNS('c')` возвращает столбец `bc`. Оператор `+` не может применяться к 3 аргументам, поэтому ClickHouse выбрасывает исключение с соответствующим сообщением.

Столбцы, соответствующие выражению `COLUMNS`, могут иметь различные типы данных. Если `COLUMNS` не соответствует ни одному столбцу и является единственным выражением в `SELECT`, ClickHouse выбрасывает исключение.

### Звездочка {#asterisk}

Звездочку можно поставить в любой части запроса вместо выражения. При анализе запроса звездочка раскрывается в список всех столбцов таблицы (за исключением столбцов `MATERIALIZED` и `ALIAS`). Существует лишь несколько случаев, когда использование звездочки оправдано:

- При создании дампа таблицы.
- Для таблиц, содержащих всего несколько столбцов, таких как системные таблицы.
- Для получения информации о том, какие столбцы есть в таблице. В этом случае установите `LIMIT 1`. Но лучше использовать запрос `DESC TABLE`.
- Когда применяется сильная фильтрация по небольшому количеству столбцов с использованием `PREWHERE`.
- В подзапросах (поскольку столбцы, которые не нужны для внешнего запроса, исключаются из подзапросов).

Во всех остальных случаях не рекомендуется использовать звездочку, поскольку она дает только недостатки колоночной СУБД вместо преимуществ. Другими словами, использование звездочки не рекомендуется.

### Экстремальные значения {#extreme-values}

Помимо результатов, можно также получить минимальные и максимальные значения для столбцов результата. Для этого установите настройку **extremes** в 1. Минимумы и максимумы вычисляются для числовых типов, дат и дат со временем. Для остальных столбцов выводятся значения по умолчанию.


Вычисляются две дополнительные строки — минимумы и максимумы соответственно. Эти две дополнительные строки выводятся в [форматах](../../../interfaces/formats.md) `XML`, `JSON*`, `TabSeparated*`, `CSV*`, `Vertical`, `Template` и `Pretty*` отдельно от остальных строк. В других форматах они не выводятся.

В форматах `JSON*` и `XML` экстремальные значения выводятся в отдельном поле 'extremes'. В форматах `TabSeparated*`, `CSV*` и `Vertical` строка следует после основного результата и после 'totals', если он присутствует. Перед ней идёт пустая строка (после остальных данных). В форматах `Pretty*` строка выводится в виде отдельной таблицы после основного результата и после `totals`, если он присутствует. В формате `Template` экстремальные значения выводятся согласно указанному шаблону.

Экстремальные значения вычисляются для строк до применения `LIMIT`, но после `LIMIT BY`. Однако при использовании `LIMIT offset, size` строки до `offset` включаются в `extremes`. В потоковых запросах результат также может включать небольшое количество строк, прошедших через `LIMIT`.

### Примечания {#notes}

Синонимы (псевдонимы `AS`) можно использовать в любой части запроса.

Конструкции `GROUP BY`, `ORDER BY` и `LIMIT BY` могут поддерживать позиционные аргументы. Чтобы включить эту возможность, активируйте настройку [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments). Тогда, например, `ORDER BY 1,2` будет сортировать строки в таблице сначала по первому, затем по второму столбцу.


## Детали реализации {#implementation-details}

Если в запросе отсутствуют конструкции `DISTINCT`, `GROUP BY` и `ORDER BY`, а также подзапросы `IN` и `JOIN`, то запрос будет полностью обработан в потоковом режиме с использованием O(1) объёма оперативной памяти. В противном случае запрос может потреблять большой объём оперативной памяти, если не заданы соответствующие ограничения:

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

Дополнительную информацию см. в разделе «Настройки». Возможно использование внешней сортировки (сохранение временных таблиц на диск) и внешней агрегации.

## Модификаторы SELECT {#select-modifiers}

В запросах `SELECT` можно использовать следующие модификаторы.

| Модификатор                        | Описание                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`APPLY`](./apply_modifier.md)     | Позволяет вызвать функцию для каждой строки, возвращаемой внешним табличным выражением запроса.                                                                                                                                                                                                                                                                                          |
| [`EXCEPT`](./except_modifier.md)   | Указывает имена одного или нескольких столбцов для исключения из результата. Все совпадающие имена столбцов исключаются из вывода.                                                                                                                                                                                                                                                        |
| [`REPLACE`](./replace_modifier.md) | Указывает один или несколько [псевдонимов выражений](/sql-reference/syntax#expression-aliases). Каждый псевдоним должен соответствовать имени столбца из инструкции `SELECT *`. В списке выходных столбцов столбец, соответствующий псевдониму, заменяется выражением из `REPLACE`. Этот модификатор не изменяет имена или порядок столбцов, однако может изменить значение и тип значения. |

### Комбинации модификаторов {#modifier-combinations}

Каждый модификатор можно использовать отдельно или комбинировать их.

**Примеры:**

Многократное использование одного и того же модификатора.

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

## SETTINGS в запросе SELECT {#settings-in-select-query}

Необходимые настройки можно указать непосредственно в запросе `SELECT`. Значение настройки применяется только к этому запросу и сбрасывается до значения по умолчанию или предыдущего значения после выполнения запроса.

Другие способы установки настроек см. [здесь](/operations/settings/overview).

Для булевых настроек, устанавливаемых в true, можно использовать сокращённый синтаксис, опуская присваивание значения. Если указано только имя настройки, она автоматически устанавливается в `1` (true).

**Пример**

```sql
SELECT * FROM some_table SETTINGS optimize_read_in_order=1, cast_keep_nullable=1;
```
