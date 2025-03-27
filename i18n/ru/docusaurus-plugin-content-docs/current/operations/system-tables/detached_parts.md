---
description: 'Системная таблица, содержащая информацию о вынутых частях таблиц MergeTree'
keywords: ['системная таблица', 'вынутые_части']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
---

Содержит информацию о вынутых частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Столбец `reason` указывает, почему часть была вынута.

Для частей, вынутых пользователем, причина пуста. Такие части могут быть прикреплены с помощью команды [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart).

Для описания других столбцов см. [system.parts](../../operations/system-tables/parts.md).

Если имя части недействительно, значения некоторых столбцов могут быть `NULL`. Такие части могут быть удалены с помощью [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/view).
