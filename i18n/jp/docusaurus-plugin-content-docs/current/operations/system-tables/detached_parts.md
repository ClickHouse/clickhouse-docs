---
description: 'MergeTree テーブルのデタッチされたパーツに関する情報を含むシステムテーブル'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのデタッチされたパーツに関する情報を含みます。`reason` 列は、そのパーツがデタッチされた理由を示します。

ユーザーによってデタッチされたパーツの場合、`reason` 列は空です。このようなパーツは [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) コマンドで再度アタッチできます。

他の列の説明については、[system.parts](../../operations/system-tables/parts.md) を参照してください。

パーツ名が不正な場合、いくつかの列の値は `NULL` になることがあります。このようなパーツは [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) で削除できます。