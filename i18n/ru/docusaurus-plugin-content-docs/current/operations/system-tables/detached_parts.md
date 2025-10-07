---
slug: '/operations/system-tables/detached_parts'
description: 'Системная таблица, содержащая информацию о детачированных частях таблиц'
title: system.detached_parts
keywords: ['системная таблица', 'отделённые_части']
doc_type: reference
---
Содержит информацию о отсоединённых частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Колонка `reason` указывает, почему часть была отсоединена.

Для пользовательно-отсоединённых частей причина указывается пустой. Такие части могут быть присоединены с помощью команды [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart).

Для описания других колонок смотрите [system.parts](../../operations/system-tables/parts.md).

Если имя части недействительно, значения некоторых колонок могут быть `NULL`. Такие части можно удалить с помощью [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart).