---
description: 'Документация по применению патчей из легковесных обновлений'
sidebar_label: 'APPLY PATCHES'
sidebar_position: 47
slug: /sql-reference/statements/alter/apply-patches
title: 'Применение патчей из легковесных обновлений'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] APPLY PATCHES [IN PARTITION partition_id]
```

Команда вручную запускает физическую материализацию патч-частей, созданных командами [легковесного `UPDATE`](/sql-reference/statements/update). Она принудительно применяет неприменённые патчи к частям данных, перезаписывая только затронутые столбцы.

:::note

* Работает только для таблиц семейства [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) (включая [реплицируемые](../../../engines/table-engines/mergetree-family/replication.md) таблицы).
* Это операция мутации, и она выполняется асинхронно в фоновом режиме.
  :::


## Когда использовать APPLY PATCHES \{#when-to-use\}

:::tip
Как правило, вам не нужно использовать `APPLY PATCHES`
:::

Патч-части обычно применяются автоматически во время слияний, когда настройка [`apply_patches_on_merge`](/operations/settings/merge-tree-settings#apply_patches_on_merge) включена (по умолчанию). Однако вы можете захотеть вручную выполнить применение патчей в следующих сценариях:

- Чтобы уменьшить накладные расходы на применение патчей во время запросов `SELECT`
- Чтобы консолидировать несколько патч-частей, прежде чем они накопятся
- Чтобы подготовить данные к резервному копированию или экспорту с уже материализованными патчами
- Когда `apply_patches_on_merge` отключена и вы хотите контролировать момент применения патчей

## Примеры \{#examples\}

Применить все патчи, ожидающие применения, для таблицы:

```sql
ALTER TABLE my_table APPLY PATCHES;
```

Применяйте патчи только к определённой партиции:

```sql
ALTER TABLE my_table APPLY PATCHES IN PARTITION '2024-01';
```

Совместное использование с другими операциями:

```sql
ALTER TABLE my_table APPLY PATCHES, UPDATE column = value WHERE condition;
```


## Мониторинг применения мутаций \{#monitor\}

Вы можете отслеживать прогресс применения мутаций с помощью таблицы [`system.mutations`](/operations/system-tables/mutations):

```sql
SELECT * FROM system.mutations
WHERE table = 'my_table' AND command LIKE '%APPLY PATCHES%';
```


## См. также \{#see-also\}

- [Легковесное `UPDATE`](/sql-reference/statements/update) — создание частей‑патчей с легковесным обновлением
- [Параметр `apply_patches_on_merge`](/operations/settings/merge-tree-settings#apply_patches_on_merge) — управление автоматическим применением патчей при слияниях