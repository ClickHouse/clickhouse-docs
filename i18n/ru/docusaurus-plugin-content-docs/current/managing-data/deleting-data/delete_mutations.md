---
slug: /managing-data/delete_mutations
sidebar_label: 'Мутации удаления'
title: 'Мутации удаления'
hide_title: false
description: 'Страница, описывающая мутации удаления - запросы ALTER, которые управляют данными таблицы через удаление'
---

Мутации удаления относятся к запросам `ALTER`, которые манипулируют данными таблицы путем удаления. В частности, это такие запросы, как `ALTER TABLE DELETE` и т.д. Выполнение таких запросов приведет к созданию новых мутированных версий частей данных. Это означает, что такие операторы вызовут перезапись целых частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству запросов на запись.

:::info
Для удаления вы можете избежать больших объемов запросов на запись, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/guides/replacing-merge-tree) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree), вместо стандартного движка таблиц MergeTree.
:::

import DeleteMutations from '@site/docs/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
