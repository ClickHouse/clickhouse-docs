---
description: 'Документация по предложению PREWHERE'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'Предложение PREWHERE'
---


# Предложение PREWHERE

Prewhere — это оптимизация, предназначенная для более эффективного применения фильтрации. Она включена по умолчанию, даже если предложение `PREWHERE` не указано явно. Это происходит путем автоматического перемещения части условия [WHERE](../../../sql-reference/statements/select/where.md) на этап prewhere. Роль предложения `PREWHERE` заключается только в том, чтобы контролировать эту оптимизацию, если вы считаете, что знаете, как это сделать лучше, чем это происходит по умолчанию.

При оптимизации prewhere в первую очередь считываются только те столбцы, которые необходимы для выполнения выражения prewhere. Затем считываются другие столбцы, которые нужны для выполнения остальной части запроса, но только те блоки, где выражение prewhere равно `true` хотя бы для некоторых строк. Если существует много блоков, где выражение prewhere равно `false` для всех строк и prewhere требует меньше столбцов, чем другие части запроса, это часто позволяет считывать гораздо меньше данных с диска для выполнения запроса.

## Ручное управление Prewhere {#controlling-prewhere-manually}

Данное предложение имеет такое же значение, как и предложение `WHERE`. Разница заключается в том, какие данные читаются из таблицы. При ручном управлении `PREWHERE` для фильтрационных условий, которые используются меньшинством столбцов в запросе, но обеспечивают сильную фильтрацию данных. Это уменьшает объем считываемых данных.

Запрос может одновременно указывать и `PREWHERE`, и `WHERE`. В этом случае `PREWHERE` предшествует `WHERE`.

Если настройка [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) установлена в 0, эвристики для автоматического перемещения частей выражений из `WHERE` в `PREWHERE` отключены.

Если запрос имеет модификатор [FINAL](/sql-reference/statements/select/from#final-modifier), оптимизация `PREWHERE` не всегда корректна. Она включается только в том случае, если обе настройки [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) и [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) включены.

:::note    
Секция `PREWHERE` выполняется перед `FINAL`, поэтому результаты запросов `FROM ... FINAL` могут быть искажены при использовании `PREWHERE` с полями, которые не находятся в секции `ORDER BY` таблицы.
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

-- давайте включим трассировку, чтобы увидеть, какие предикаты перемещаются в PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse автоматически перемещает `B = 0` в PREWHERE, но в этом нет смысла, потому что B всегда равно 0.

-- Давайте переместим другой предикат `C = 'x'`

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- Этот запрос с ручным `PREWHERE` обрабатывает немного меньше данных: 158.89 MB против 168.89 MB
```
