---
description: 'Документация по OFFSET'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'Предложение OFFSET FETCH'
doc_type: 'reference'
---

`OFFSET` и `FETCH` позволяют извлекать данные порциями. Они задают блок строк, который вы хотите получить одним запросом.

```sql
-- SQL Standard style:
[OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]

-- MySQL/PostgreSQL style:
[LIMIT [n, ]m] [OFFSET offset_row_count]
```

Значение `offset_row_count` или `fetch_row_count` может быть числом или литералом. Можно опустить `fetch_row_count`; по умолчанию оно равно 1.

`OFFSET` задаёт количество строк, которые нужно пропустить перед началом возврата строк из результата запроса. `OFFSET n` пропускает первые `n` строк результата.

Поддерживается отрицательный OFFSET: `OFFSET -n` пропускает последние `n` строк результата.

Также поддерживается дробный OFFSET: `OFFSET n` — если 0 &lt; n &lt; 1, то пропускается первая n * 100% результата.

Пример:
• `OFFSET 0.1` — пропускает первые 10% результата.

> **Примечание**
> • Дробь должна быть числом [Float64](../../data-types/float.md), меньшим 1 и большим нуля.
> • Если в результате вычисления получается дробное количество строк, оно округляется вверх до ближайшего целого числа.

`FETCH` задаёт максимальное количество строк, которое может быть в результате запроса.

Опция `ONLY` используется для возврата строк, которые непосредственно следуют за строками, пропущенными с помощью `OFFSET`. В этом случае `FETCH` является альтернативой оператору [LIMIT](../../../sql-reference/statements/select/limit.md). Например, следующий запрос

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

идентичен запросу

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

Опция `WITH TIES` используется для возврата дополнительных строк, которые по значениям сортировки соответствуют последней строке результирующего набора в соответствии с предложением `ORDER BY`. Например, если `fetch_row_count` равен 5, но ещё две строки имеют те же значения столбцов `ORDER BY`, что и пятая строка, результирующий набор будет содержать семь строк.

:::note
Согласно стандарту, предложение `OFFSET` должно идти перед предложением `FETCH`, если оба присутствуют.
:::

:::note
Фактическое смещение также может зависеть от настройки [offset](../../../operations/settings/settings.md#offset).
:::

## Примеры {#examples}

Исходная таблица:

```text
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

Использование параметра `ONLY`:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

Результат:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

Использование параметра `WITH TIES`:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

Результат:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
