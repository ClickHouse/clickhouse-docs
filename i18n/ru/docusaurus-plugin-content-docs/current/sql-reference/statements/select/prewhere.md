---
slug: /sql-reference/statements/select/prewhere
sidebar_label: PREWHERE
---


# Клаузула PREWHERE

Клаузула PREWHERE является оптимизацией, которая позволяет более эффективно применять фильтрацию. Она включена по умолчанию, даже если клаузула `PREWHERE` не указана явно. Это работает за счет автоматического перемещения части условий из [WHERE](../../../sql-reference/statements/select/where.md) на стадию prewhere. Роль клаузулы `PREWHERE` заключается лишь в контроле этой оптимизации, если вы считаете, что знаете, как это сделать лучше, чем это происходит по умолчанию.

С оптимизацией prewhere сначала считываются только те колонки, которые необходимы для выполнения выражения prewhere. Затем считываются другие колонки, необходимые для выполнения остальной части запроса, но только те блоки, где выражение prewhere равно `true` хотя бы для некоторых строк. Если существует много блоков, где выражение prewhere равно `false` для всех строк, и prewhere требует меньше колонок, чем другие части запроса, это часто позволяет считать значительно меньше данных с диска для выполнения запроса.

## Управление Prewhere Вручную {#controlling-prewhere-manually}

Клаузула имеет то же значение, что и клаузула `WHERE`. Разница заключается в том, какие данные считываются из таблицы. При ручном контроле `PREWHERE` для условий фильтрации, которые используются меньшинством столбцов в запросе, но предоставляют сильную фильтрацию данных, это снижает объем данных для считывания.

Запрос может одновременно указывать `PREWHERE` и `WHERE`. В этом случае `PREWHERE` предшествует `WHERE`.

Если настройка [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) установлена на 0, эвристики для автоматического перемещения частей выражений из `WHERE` в `PREWHERE` отключены.

Если запрос имеет модификатор [FINAL](/sql-reference/statements/select/from#final-modifier), оптимизация `PREWHERE` не всегда корректна. Она включается только в том случае, если обе настройки [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) и [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) включены.

:::note    
Раздел `PREWHERE` выполняется перед `FINAL`, поэтому результаты запросов `FROM ... FINAL` могут быть смещены при использовании `PREWHERE` с полями, не входящими в раздел `ORDER BY` таблицы.
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
-- Clickhouse автоматически перемещает `B = 0` в PREWHERE, но это не имеет смысла, потому что B всегда равно 0.

-- Переместим другой предикат `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- Этот запрос с ручным `PREWHERE` обрабатывает немного меньше данных: 158.89 MB VS 168.89 MB
```
