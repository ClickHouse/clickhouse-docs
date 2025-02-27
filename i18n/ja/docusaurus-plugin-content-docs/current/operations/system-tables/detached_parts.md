---
description: "MergeTree テーブルのデタッチされたパーツに関する情報を含むシステムテーブル"
slug: /operations/system-tables/detached_parts
title: "detached_parts"
keywords: ["システムテーブル", "detached_parts"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのデタッチされたパーツに関する情報を含みます。`reason` カラムは、パーツがデタッチされた理由を指定します。

ユーザーによってデタッチされたパーツについては、理由は空欄になります。そのようなパーツは、[ALTER TABLE ATTACH PARTITION\|PART](../../sql-reference/statements/alter/partition.md#alter_attach-partition) コマンドを使用してアタッチできます。

他のカラムの説明については、[system.parts](../../operations/system-tables/parts.md) を参照してください。

パーツ名が無効な場合、一部のカラムの値は `NULL` になることがあります。そのようなパーツは、[ALTER TABLE DROP DETACHED PART](../../sql-reference/statements/alter/partition.md#alter_drop-detached) コマンドを使用して削除できます。
