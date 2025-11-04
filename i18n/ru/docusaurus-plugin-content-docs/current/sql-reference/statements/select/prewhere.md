---
slug: '/sql-reference/statements/select/prewhere'
sidebar_label: PREWHERE
description: 'Документация для PREWHERE Оператора'
title: 'Условие PREWHERE'
doc_type: reference
---
# PREWHERE Оператор

Prewhere — это оптимизация для более эффективного применения фильтрации. Она включена по умолчанию, даже если оператор `PREWHERE` не указан явно. Она работает, автоматически перемещая часть условий [WHERE](../../../sql-reference/statements/select/where.md) на этап prewhere. Роль оператора `PREWHERE` заключается лишь в том, чтобы контролировать эту оптимизацию, если вы считаете, что знаете, как это сделать лучше, чем происходит по умолчанию.

С оптимизацией prewhere сначала читаются только столбцы, необходимые для выполнения выражения prewhere. Затем читаются другие столбцы, которые нужны для выполнения остальной части запроса, но только те блоки, где выражение prewhere равно `true` хотя бы для некоторых строк. Если существует много блоков, в которых выражение prewhere равно `false` для всех строк, и prewhere требует меньше столбцов, чем другие части запроса, это часто позволяет считывать гораздо меньше данных с диска для выполнения запроса.

## Управление Prewhere Вручную {#controlling-prewhere-manually}

Оператор имеет то же значение, что и оператор `WHERE`. Разница заключается в том, какие данные читаются из таблицы. При ручном управлении `PREWHERE` для условий фильтрации, которые используются меньшинством столбцов в запросе, но обеспечивают сильную фильтрацию данных, уменьшается объем читаемых данных.

Запрос может одновременно указывать `PREWHERE` и `WHERE`. В этом случае `PREWHERE` предшествует `WHERE`.

Если настройка [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) установлена в 0, эвристика автоматического перемещения частей выражений из `WHERE` в `PREWHERE` отключается.

Если запрос имеет [FINAL](/sql-reference/statements/select/from#final-modifier) модификатор, оптимизация `PREWHERE` не всегда корректна. Она включается только в том случае, если обе настройки [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) и [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) включены.

:::note    
Секция `PREWHERE` выполняется перед `FINAL`, поэтому результаты запросов `FROM ... FINAL` могут быть искажены при использовании `PREWHERE` с полями, не входящими в секцию `ORDER BY` таблицы.
:::

## Ограничения {#limitations}

`PREWHERE` поддерживается только таблицами из семейства [*MergeTree](../../../engines/table-engines/mergetree-family/index.md).

## Пример {#example}

```sql
CREATE TABLE mydata
(
    `A` Int64,
    `B` Int8,
    `C` String
)
ENGINE = MergeTree
ORDER BY A AS
SELECT
    number,
    0,
    if(number between 1000 and 2000, 'x', toString(number))
FROM numbers(10000000);

SELECT count()
FROM mydata
WHERE (B = 0) AND (C = 'x');

1 row in set. Elapsed: 0.074 sec. Processed 10.00 million rows, 168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- let's enable tracing to see which predicate are moved to PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse moves automatically `B = 0` to PREWHERE, but it has no sense because B is always 0.

-- Let's move other predicate `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- This query with manual `PREWHERE` processes slightly less data: 158.89 MB VS 168.89 MB
```