---
slug: /managing-data/delete_mutations
sidebar_label: Удаление мутаций
title: Удаление мутаций
hide_title: false
---

Удаление мутаций относится к `ALTER` запросам, которые манипулируют данными таблицы через удаление. В частности, это такие запросы, как `ALTER TABLE DELETE` и т.д. Выполнение таких запросов создаст новые мутированные версии частей данных. Это означает, что такие операторы вызовут переписывание целых частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству запросов на запись.

:::info
Для удаления вы можете избежать этого большого количества запросов на запись, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/guides/replacing-merge-tree) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) вместо стандартного движка таблиц MergeTree.
:::

import DeleteMutations from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
