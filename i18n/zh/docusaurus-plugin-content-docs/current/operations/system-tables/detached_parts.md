---
'description': '系统表包含关于MergeTree表的分区片段的信息'
'keywords':
- 'system table'
- 'detached_parts'
'slug': '/operations/system-tables/detached_parts'
'title': 'system.detached_parts'
'doc_type': 'reference'
---

包含有关 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的分离部分的信息。`reason` 列指定了部分被分离的原因。

对于用户分离的部分，原因为空。此类部分可以通过 [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 命令附加。

有关其他列的描述，请参见 [system.parts](../../operations/system-tables/parts.md)。

如果部分名称无效，则某些列的值可能为 `NULL`。此类部分可以通过 [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) 命令删除。
