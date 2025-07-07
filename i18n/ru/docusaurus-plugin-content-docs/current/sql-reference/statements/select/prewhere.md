---
description: 'Документация по условию PREWHERE'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'Условие PREWHERE'
---


# Условие PREWHERE

PREWHERE — это оптимизация, позволяющая более эффективно применять фильтрацию. Она включена по умолчанию, даже если условие `PREWHERE` не указано явно. Это работает за счет автоматического перемещения части условий [WHERE](../../../sql-reference/statements/select/where.md) на этап prewhere. Роль условия `PREWHERE` заключается исключительно в контроле этой оптимизации, если вы думаете, что можете сделать это лучше, чем происходит по умолчанию.

С оптимизацией prewhere вначале читаются только те колонки, которые необходимы для выполнения выражения prewhere. Затем читаются другие колонки, которые нужны для выполнения оставшейся части запроса, но только те блоки, где выражение prewhere истинно хотя бы для некоторых строк. Если есть много блоков, где выражение prewhere ложно для всех строк, и для prewhere требуется меньше колонок, чем для других частей запроса, это часто позволяет значительно уменьшить объем данных, считываемых с диска для выполнения запроса.

## Ручное управление Prewhere {#controlling-prewhere-manually}

Условие имеет такое же значение, как и условие `WHERE`. Разница заключается в том, какие данные читаются из таблицы. При ручном управлении `PREWHERE` для условий фильтрации, которые используются меньшинством колонок в запросе, но которые обеспечивают сильную фильтрацию данных. Это снижает объем данных для чтения.

Запрос может одновременно указывать `PREWHERE` и `WHERE`. В этом случае `PREWHERE` предшествует `WHERE`.

Если настройка [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) установлена в 0, эвристика для автоматического перемещения частей выражений из `WHERE` в `PREWHERE` отключена.

Если запрос имеет [FINAL](/sql-reference/statements/select/from#final-modifier) модификатор, оптимизация `PREWHERE` не всегда корректна. Она включает только в том случае, если обе настройки [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) и [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) включены.

:::note    
Секция `PREWHERE` выполняется до `FINAL`, поэтому результаты запросов `FROM ... FINAL` могут быть искажены при использовании `PREWHERE` с полями, которые не находятся в секции `ORDER BY` таблицы.
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
-- Clickhouse автоматически перемещает `B = 0` в PREWHERE, но это не имеет смысла, так как B всегда равно 0.

-- Давайте переместим другой предикат `C = 'x'`

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- Этот запрос с ручным `PREWHERE` обрабатывает немного меньше данных: 158.89 MB по сравнению с 168.89 MB
```
