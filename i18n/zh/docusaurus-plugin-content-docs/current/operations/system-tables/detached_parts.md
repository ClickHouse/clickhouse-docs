---
description: '包含 MergeTree 表已分离部分信息的系统表'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

包含关于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表已分离部分的信息。`reason` 列说明该部分被分离的原因。

对于用户手动分离的部分，该列为空。此类部分可以通过 [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 命令重新附加。

关于其他列的说明，请参阅 [system.parts](../../operations/system-tables/parts.md)。

如果部分名称无效，则某些列的值可能为 `NULL`。此类部分可以通过 [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) 命令删除。