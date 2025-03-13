---
description: "MergeTree テーブルのデタッチされたパーツに関する情報を含むシステムテーブル"
slug: /operations/system-tables/detached_parts
title: "system.detached_parts"
keywords: ["システムテーブル", "detached_parts"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのデタッチされたパーツに関する情報を含みます。`reason` カラムは、パーツがデタッチされた理由を指定します。

ユーザーによってデタッチされたパーツの場合、理由は空です。このようなパーツは、[ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) コマンドでアタッチできます。

他のカラムの説明については、[system.parts](../../operations/system-tables/parts.md) を参照してください。

パーツ名が無効な場合、いくつかのカラムの値は `NULL` になることがあります。このようなパーツは、[ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/view) コマンドで削除できます。
