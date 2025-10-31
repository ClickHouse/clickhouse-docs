---
'description': 'システムテーブルは、MergeTree テーブルのデタッチされたパーツに関する情報を含んでいます'
'keywords':
- 'system table'
- 'detached_parts'
'slug': '/operations/system-tables/detached_parts'
'title': 'system.detached_parts'
'doc_type': 'reference'
---

以下は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのデタッチされたパーツに関する情報です。`reason` カラムは、そのパーツがデタッチされた理由を示します。

ユーザーによってデタッチされたパーツの場合、理由は空です。このようなパーツは [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) コマンドを使用してアタッチすることができます。

他のカラムの説明については、[system.parts](../../operations/system-tables/parts.md) を参照してください。

パーツ名が無効な場合、一部のカラムの値は `NULL` になることがあります。このようなパーツは [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) を使用して削除できます。
