---
slug: /managing-data/update_mutations
sidebar_label: 'Мутации обновления'
title: 'Мутации обновления'
hide_title: false
description: 'Страница, описывающая мутации обновления - запросы ALTER, которые манипулируют данными таблицы через обновления'
---

Мутации обновления относятся к `ALTER` запросам, которые манипулируют данными таблицы через обновления. В частности, это такие запросы, как `ALTER TABLE UPDATE` и т.д. Выполнение таких запросов приведет к созданию новых измененных версий частей данных. Это означает, что такие операторы вызовут переписывание целых частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству операций записи.

:::info
Для обновлений вы можете избежать этих больших объемов операций записи, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/guides/replacing-merge-tree) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) вместо стандартного движка таблиц MergeTree.
:::

import UpdateMutations from '@site/docs/sql-reference/statements/alter/update.md';

<UpdateMutations/>
