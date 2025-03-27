---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: 'Избегайте мутаций'
title: 'Избегайте мутаций'
description: 'Страница, описывающая, почему следует избегать мутаций и запросов ALTER, которые манипулируют данными таблицы путем удаления или обновления.'
---

Мутации относятся к [ALTER](/sql-reference/statements/alter/) запросам, которые манипулируют данными таблицы через удаление или обновление. Наиболее заметно это запросы типа ALTER TABLE ... DELETE, UPDATE и т.д. Выполнение таких запросов создаст новые мутированные версии частей данных. Это означает, что такие операторы вызовут переписывание целых частей данных для всех данных, которые были вставлены до мутации, что приведет к большому количеству записей записей.

Для обновлений вы можете избежать этих больших объемов записей, используя специализированные движки таблиц, такие как [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md) вместо стандартного движка таблиц MergeTree.


## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
