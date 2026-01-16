---
description: 'Облегчённые обновления упрощают процесс обновления данных в базе данных с помощью патч-частей.'
keywords: ['update']
sidebar_label: 'UPDATE'
sidebar_position: 39
slug: /sql-reference/statements/update
title: 'Оператор облегчённого UPDATE'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Облегчённые обновления в данный момент находятся на стадии бета-тестирования.
Если вы столкнётесь с проблемами, пожалуйста, создайте issue в [репозитории ClickHouse](https://github.com/clickhouse/clickhouse/issues).
:::

Оператор облегчённого `UPDATE` обновляет строки в таблице `[db.]table`, которые соответствуют выражению `filter_expr`.
Он называется «облегчённым обновлением», чтобы противопоставить его запросу [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update), который является ресурсоёмким процессом и полностью перезаписывает столбцы в частях данных.
Он доступен только для семейства движков таблиц [`MergeTree`](/engines/table-engines/mergetree-family/mergetree).

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` должен иметь тип `UInt8`. Этот запрос обновляет значения указанных столбцов, устанавливая их равными значениям соответствующих выражений в строках, для которых `filter_expr` принимает ненулевое значение.
Значения приводятся к типу столбца с помощью оператора `CAST`. Обновление столбцов, используемых при вычислении первичного ключа или ключа партиционирования, не поддерживается.

## Примеры \\{#examples\\}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## Облегчённые обновления не обновляют данные немедленно \\{#lightweight-update-does-not-update-data-immediately\\}

Облегчённый `UPDATE` реализован с использованием **патч‑частей** (patch parts) — специального типа частей данных, которые содержат только обновлённые столбцы и строки.
Облегчённый `UPDATE` создаёт патч‑части, но не изменяет исходные данные физически в хранилище немедленно.
Процесс обновления аналогичен запросу `INSERT ... SELECT ...`, но запрос `UPDATE` возвращается только после завершения создания патч‑частей.

Обновлённые значения:
- **Сразу видны** в запросах `SELECT` благодаря применению патчей
- **Физически материализуются** только во время последующих слияний и мутаций
- **Автоматически удаляются**, когда во всех активных частях патчи материализованы
## Требования к лёгким обновлениям \\{#lightweight-update-requirements\\}

Лёгкие обновления поддерживаются для движков [`MergeTree`](/engines/table-engines/mergetree-family/mergetree), [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree), [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) и их вариантов [`Replicated`](/engines/table-engines/mergetree-family/replication.md) и [`Shared`](/cloud/reference/shared-merge-tree).

Чтобы использовать лёгкие обновления, необходимо включить материализацию столбцов `_block_number` и `_block_offset` с помощью настроек таблицы [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) и [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column).

## Легковесные операции удаления \\{#lightweight-delete\\}

Запрос [легковесного `DELETE`](/sql-reference/statements/delete) может быть выполнен как легковесный `UPDATE` вместо мутации `ALTER UPDATE`. Поведение легковесного `DELETE` определяется настройкой [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode).

## Особенности производительности \\{#performance-considerations\\}

**Преимущества легковесных обновлений:**
- Задержка обновления сопоставима с задержкой запроса `INSERT ... SELECT ...`
- Записываются только обновлённые столбцы и значения, а не целые столбцы в частях данных
- Нет необходимости ждать завершения текущих слияний/мутаций, поэтому задержка обновления предсказуема
- Возможна параллельная обработка легковесных обновлений

**Потенциальное влияние на производительность:**
- Создаёт накладные расходы для запросов `SELECT`, которым необходимо применять патчи
- [Пропускающие индексы](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) не будут использоваться для столбцов в частях данных, к которым должны быть применены патчи. [Проекции](/engines/table-engines/mergetree-family/mergetree.md/#projections) не будут использоваться, если для таблицы есть части-патчи, включая части данных, к которым не нужно применять патчи.
- Слишком частые небольшие обновления могут привести к ошибке «too many parts» («слишком много частей»). Рекомендуется объединять несколько обновлений в один запрос, например, поместив идентификаторы для обновления в один оператор `IN` в условии `WHERE`
- Легковесные обновления предназначены для обновления небольшого количества строк (до примерно 10% таблицы). Если необходимо обновить больший объём, рекомендуется использовать мутацию [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update)

## Одновременные операции \\{#concurrent-operations\\}

Легковесные обновления не дожидаются завершения уже выполняющихся слияний и мутаций, в отличие от тяжёлых мутаций.
Согласованность одновременных легковесных обновлений контролируется настройками [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) и [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode).

## Права на выполнение UPDATE \\{#update-permissions\\}

`UPDATE` требует привилегии `ALTER UPDATE`. Чтобы разрешить выполнение операторов `UPDATE` для конкретной таблицы определённому пользователю, выполните:

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## Подробности реализации \\{#details-of-the-implementation\\}

Patch parts аналогичны обычным партам, но содержат только обновлённые столбцы и несколько системных столбцов:
- `_part` — имя исходного парта
- `_part_offset` — номер строки в исходном парте
- `_block_number` — номер блока строки в исходном парте
- `_block_offset` — смещение блока строки в исходном парте
- `_data_version` — версия обновлённых данных (номер блока, выделенный для запроса `UPDATE`)

В среднем это даёт около 40 байт (несжатых данных) накладных расходов на обновлённую строку в patch parts.
Системные столбцы помогают находить строки в исходном парте, которые должны быть обновлены.
Системные столбцы связаны с [виртуальными столбцами](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns) в исходном парте, которые добавляются при чтении, если patch parts должны быть применены.
Patch parts сортируются по `_part` и `_part_offset`.

Patch parts принадлежат другим партициям, чем исходный парт.
Идентификатор партиции patch part — `patch-<hash of column names in patch part>-<original_partition_id>`.
Таким образом, patch parts с разными столбцами хранятся в разных партициях.
Например, три обновления `SET x = 1 WHERE <cond>`, `SET y = 1 WHERE <cond>` и `SET x = 1, y = 1 WHERE <cond>` создадут три patch parts в трёх разных партициях.

Patch parts могут сливаться друг с другом, чтобы уменьшить количество применяемых патчей при запросах `SELECT` и снизить накладные расходы. Слияние patch parts использует алгоритм слияния [replacing](/engines/table-engines/mergetree-family/replacingmergetree) с `_data_version` в качестве столбца версии.
Таким образом, patch parts всегда хранят последнюю версию для каждой обновлённой строки в парте.

Лёгкие обновления (lightweight updates) не ждут завершения текущих слияний (merges) и мутаций (mutations) и всегда используют текущий снепшот data parts для выполнения обновления и формирования patch part.
Из‑за этого возможны два варианта применения patch parts.

Например, если мы читаем парт `A`, нам нужно применить patch part `X`:
- если `X` содержит сам парт `A`. Это происходит, если `A` не участвовал в merge в момент выполнения `UPDATE`;
- если `X` содержит парты `B` и `C`, которые покрываются партом `A`. Это происходит, если merge (`B`, `C`) -> `A` выполнялся в момент выполнения `UPDATE`.

Для этих двух случаев, соответственно, есть два способа применения patch parts:
- слияние по отсортированным столбцам `_part`, `_part_offset`;
- join по столбцам `_block_number`, `_block_offset`.

Режим join медленнее и требует больше памяти, чем режим merge, но используется реже.

## Связанные материалы \\{#related-content\\}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) — «тяжёлые» операции `UPDATE`
- [Lightweight `DELETE`](/sql-reference/statements/delete) — «лёгкие» операции `DELETE`
