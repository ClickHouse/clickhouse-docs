---
description: 'Системная таблица, содержащая информацию о отделённых частях таблиц MergeTree'
keywords: ['системная таблица', 'отделённые_части']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
---

Содержит информацию об отделённых частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Колонка `reason` указывает, почему часть была отделена.

Для отделённых пользователем частей причина пуста. Такие части могут быть присоединены с помощью команды [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart).

Для описания других колонок см. [system.parts](../../operations/system-tables/parts.md).

Если имя части недействительно, значения некоторых колонок могут быть `NULL`. Такие части могут быть удалены с помощью [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/view).
