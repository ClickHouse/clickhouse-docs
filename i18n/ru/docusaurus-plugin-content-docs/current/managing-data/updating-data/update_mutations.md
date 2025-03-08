---
slug: /managing-data/update_mutations
sidebar_label: Обновление мутаций
title: Обновление мутаций
hide_title: false
---

Обновление мутаций относится к `ALTER` запросам, которые манипулируют данными в таблице через обновления. Наиболее заметные из них — это запросы, такие как `ALTER TABLE UPDATE` и т.д. Выполнение таких запросов приведет к созданию новых мутированных версий частей данных. Это означает, что такие операторы вызовут перезапись целых частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству записей на запись.

:::info
Для обновлений вы можете избежать таких больших объемов записей на запись, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/guides/replacing-merge-tree) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) вместо стандартного движка таблиц MergeTree.
:::

import UpdateMutations from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

<UpdateMutations/>
