---
description: 'Системная таблица, содержащая информацию об отсоединённых частях таблиц
  MergeTree'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

Содержит информацию об отсоединённых частях таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Столбец `reason` указывает, по какой причине часть была отсоединена.

Для частей, отсоединённых пользователем, причина не указана (значение пустое). Такие части можно снова присоединить с помощью команды [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart).

Описание остальных столбцов см. в разделе [system.parts](../../operations/system-tables/parts.md).

Если имя части некорректно, значения некоторых столбцов могут быть `NULL`. Такие части можно удалить с помощью команды [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart).