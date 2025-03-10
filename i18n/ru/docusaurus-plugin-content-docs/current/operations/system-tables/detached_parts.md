---
description: 'Системная таблица, содержащая информацию оDetached части таблиц MergeTree'
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
keywords: ['системная таблица', 'detached_parts']
---

Содержит информацию оDetached частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Колонка `reason` указывает, почему часть была отделена.

Для частей, отделенных пользователем, причина остается пустой. Такие части могут быть присоединены с помощью команды [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart).

Для описания других колонок см. [system.parts](../../operations/system-tables/parts.md).

Если имя части недействительно, значения некоторых колонок могут быть `NULL`. Такие части могут быть удалены с помощью [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/view).
