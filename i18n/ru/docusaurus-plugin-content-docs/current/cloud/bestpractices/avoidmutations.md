---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: Избегайте мутаций
title: Избегайте мутаций
---

Мутации относятся к запросам [ALTER](/sql-reference/statements/alter/), которые манипулируют данными таблицы через удаление или обновления. Прежде всего, это такие запросы, как ALTER TABLE … DELETE, UPDATE и т. д. Выполнение таких запросов приведет к созданию новых мутированных версий частей данных. Это означает, что такие операторы вызовут переписывание всех частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству запросов на запись.

Для обновлений вы можете избежать этих больших объемов запросов на запись, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md) вместо стандартного движка таблиц MergeTree.


## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
