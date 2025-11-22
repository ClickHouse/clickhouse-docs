---
description: 'MergeTree テーブルの切り離されたパーツに関する情報を含むシステムテーブル'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの切り離されたパーツに関する情報を保持します。`reason` 列には、そのパーツが切り離された理由が示されます。

ユーザーによって切り離されたパーツの場合、`reason` は空です。このようなパーツは [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) コマンドで再度アタッチできます。

その他の列の説明については [system.parts](../../operations/system-tables/parts.md) を参照してください。

パーツ名が無効な場合、いくつかの列の値が `NULL` になることがあります。このようなパーツは [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) コマンドで削除できます。