---
slug: /sql-reference/statements/select/offset
sidebar_label: OFFSET
title: "OFFSET FETCH Клауза"
---

`OFFSET` и `FETCH` позволяют вам извлекать данные порциями. Они указывают на блок строк, который вы хотите получить с помощью одного запроса.

``` sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

Значение `offset_row_count` или `fetch_row_count` может быть числом или литеральной константой. Вы можете опустить `fetch_row_count`; по умолчанию оно равно 1.

`OFFSET` указывает количество строк, которые следует пропустить перед тем, как начать возвращать строки из набора результатов запроса.

`FETCH` указывает максимальное количество строк, которое может быть в результате запроса.

Опция `ONLY` используется для возврата строк, которые непосредственно следуют за строками, пропущенными с помощью `OFFSET`. В этом случае `FETCH` является альтернативой клауза [LIMIT](../../../sql-reference/statements/select/limit.md). Например, следующий запрос

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

идентичен запросу

``` sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

Опция `WITH TIES` используется для возврата любых дополнительных строк, которые находятся в ничьей позиции в наборе результатов в соответствии с клаузой `ORDER BY`. Например, если `fetch_row_count` установлен в 5, но две дополнительные строки соответствуют значениям столбцов `ORDER BY` в пятой строке, набор результатов будет содержать семь строк.

:::note    
Согласно стандарту, клаузу `OFFSET` необходимо помещать перед клаузой `FETCH`, если обе присутствуют.
:::

:::note    
Фактический сдвиг также может зависеть от настройки [offset](../../../operations/settings/settings.md#offset).
:::

## Примеры {#examples}

Исходная таблица:

``` text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

Использование опции `ONLY`:

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

Результат:

``` text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

Использование опции `WITH TIES`:

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

Результат:

``` text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
