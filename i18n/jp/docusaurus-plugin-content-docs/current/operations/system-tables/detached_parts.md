---
description: "MergeTreeテーブルの切り離されたパーツに関する情報を含むシステムテーブル"
slug: /operations/system-tables/detached_parts
title: "system.detached_parts"
keywords: ["システムテーブル", "detached_parts"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの切り離されたパーツに関する情報を含みます。 `reason` カラムは、パーツが切り離された理由を指定します。

ユーザーによって切り離されたパーツの場合、理由は空です。そのようなパーツは、[ALTER TABLE ATTACH PARTITION\|PART](../../sql-reference/statements/alter/partition.md#alter_attach-partition) コマンドを使用して再接続できます。

他のカラムの説明については、[system.parts](../../operations/system-tables/parts.md)をご覧ください。

パーツ名が無効な場合、いくつかのカラムの値は `NULL` になることがあります。そのようなパーツは、[ALTER TABLE DROP DETACHED PART](../../sql-reference/statements/alter/partition.md#alter_drop-detached) コマンドを使用して削除できます。
