---
slug: '/interfaces/formats/Pretty'
description: 'Документация для формата Pretty'
title: Pretty
keywords: ['Pretty']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Формат `Pretty` выводит данные в виде таблиц на основе искусственного юникода, используя ANSI-escape последовательности для отображения цветов в терминале. 
Полная сетка таблицы рисуется, и каждая строка занимает две строки в терминале. 
Каждый блок результата выводится как отдельная таблица. 
Это необходимо для того, чтобы блоки можно было выводить без буферизации результатов (буферизация была бы необходима для предварительного расчета видимой ширины всех значений).

[NULL](/sql-reference/syntax.md) выводится как `ᴺᵁᴸᴸ`.

## Пример использования {#example-usage}

Пример (показан для формата [`PrettyCompact`](./PrettyCompact.md)):

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

Строки не экранируются ни в одном из форматов `Pretty`. Следующий пример показан для формата [`PrettyCompact`](./PrettyCompact.md):

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

Чтобы избежать слишком объемного вывода данных в терминал, печатаются только первые `10,000` строк. 
Если количество строк больше либо равно `10,000`, появляется сообщение "Показано первых 10 000".

:::note
Этот формат подходит только для вывода результата запроса, но не для разбора данных.
:::

Формат Pretty поддерживает вывод итоговых значений (при использовании `WITH TOTALS`) и крайних значений (когда 'extremes' установлен в 1). 
В этих случаях итоговые значения и крайние значения выводятся после основных данных, в отдельных таблицах. 
Это показано в следующем примере, который использует формат [`PrettyCompact`](./PrettyCompact.md):

```sql title="Query"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="Response"
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1406958 │
│ 2014-03-18 │ 1383658 │
│ 2014-03-19 │ 1405797 │
│ 2014-03-20 │ 1353623 │
│ 2014-03-21 │ 1245779 │
│ 2014-03-22 │ 1031592 │
│ 2014-03-23 │ 1046491 │
└────────────┴─────────┘

Totals:
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

Extremes:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## Настройки формата {#format-settings}

<PrettyFormatSettings/>