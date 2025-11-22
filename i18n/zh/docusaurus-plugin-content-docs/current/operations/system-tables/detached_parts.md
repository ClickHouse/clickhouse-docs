---
description: '包含 MergeTree 表已分离部件信息的系统表'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

包含 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表已分离部件的信息。`reason` 列指明该部件被分离的原因。

对于由用户手动分离的部件，`reason` 为空。此类部件可以使用 [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 命令重新附加。

其他列的说明参见 [system.parts](../../operations/system-tables/parts.md)。

如果部件名称无效，则某些列的值可能为 `NULL`。此类部件可以使用 [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) 删除。