---
description: 'Документация по предложению PREWHERE'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'Предложение PREWHERE'
doc_type: 'reference'
---



# Оператор PREWHERE

Prewhere — это оптимизация, позволяющая применять фильтрацию более эффективно. Она включена по умолчанию, даже если оператор `PREWHERE` явно не указан. Оптимизация работает за счёт автоматического переноса части условия [WHERE](../../../sql-reference/statements/select/where.md) на этап PREWHERE. Роль оператора `PREWHERE` состоит только в управлении этой оптимизацией, если вы считаете, что можете настроить её лучше, чем это делается по умолчанию.

С оптимизацией PREWHERE сначала считываются только те столбцы, которые необходимы для вычисления выражения PREWHERE. Затем считываются остальные столбцы, которые нужны для выполнения оставшейся части запроса, но только для тех блоков, где выражение PREWHERE равно `true` хотя бы для некоторых строк. Если есть много блоков, где выражение PREWHERE равно `false` для всех строк, и PREWHERE требует меньше столбцов, чем другие части запроса, это часто позволяет считать с диска значительно меньше данных при выполнении запроса.



## Ручное управление PREWHERE {#controlling-prewhere-manually}

Эта конструкция имеет то же значение, что и предложение `WHERE`. Разница заключается в том, какие данные читаются из таблицы. Ручное управление `PREWHERE` целесообразно, когда условия фильтрации используются лишь для небольшой части столбцов в запросе, но обеспечивают сильную фильтрацию данных. Это уменьшает объем читаемых данных.

Запрос может одновременно указывать `PREWHERE` и `WHERE`. В этом случае `PREWHERE` выполняется раньше `WHERE`.

Если настройка [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) установлена в 0, эвристики, автоматически переносящие части выражений из `WHERE` в `PREWHERE`, отключены.

Если в запросе используется модификатор [FINAL](/sql-reference/statements/select/from#final-modifier), оптимизация `PREWHERE` не всегда корректна. Она включена только в том случае, если обе настройки [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) и [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) включены.

:::note    
Часть запроса `PREWHERE` выполняется до `FINAL`, поэтому результаты запросов `FROM ... FINAL` могут быть искажены при использовании `PREWHERE` с полями, которых нет в секции `ORDER BY` таблицы.
:::



## Ограничения {#limitations}

`PREWHERE` можно использовать только с таблицами из семейства [*MergeTree](../../../engines/table-engines/mergetree-family/index.md).



## Пример

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

-- включим трассировку, чтобы увидеть, какие предикаты перемещаются в PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- ClickHouse автоматически перемещает `B = 0` в PREWHERE, но это не имеет смысла, поскольку B всегда равно 0.

-- Переместим другой предикат `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- Этот запрос с явным указанием `PREWHERE` обрабатывает немного меньше данных: 158.89 МБ против 168.89 МБ
```
