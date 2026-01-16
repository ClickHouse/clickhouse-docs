---
description: 'テーブル TTL の操作に関するリファレンス'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: 'テーブル TTL の操作方法'
doc_type: 'reference'
---

# テーブル TTL の操作 \{#manipulations-with-table-ttl\}

:::note
古いデータを管理するための TTL の使い方についての詳細をお探しの場合は、ユーザーガイドの [Manage Data with TTL](/guides/developer/ttl.md) を参照してください。以下では、既存の TTL ルールを変更または削除する方法を示します。
:::

## TTL の変更 \{#modify-ttl\}

次の形式のクエリを使用して、[テーブルの TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) を変更できます。

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTL の削除 \{#remove-ttl\}

TTL プロパティは、次のクエリを使用してテーブルから削除できます。

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

`TTL` が設定されたテーブルを考えます:

```sql
CREATE TABLE table_with_ttl
(
    event_time DateTime,
    UserID UInt64,
    Comment String
)
ENGINE MergeTree()
ORDER BY tuple()
TTL event_time + INTERVAL 3 MONTH
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO table_with_ttl VALUES (now(), 1, 'username1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
```

`TTL` のクリーンアップを強制的に実行するには、`OPTIMIZE` を実行します:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

テーブルの 2 行目が削除されました。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

次のクエリでテーブルの `TTL` 設定を削除します。

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除した行を再挿入し、`OPTIMIZE` を実行して `TTL` のクリーンアップを再度強制します:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` がなくなったため、2 行目は削除されません：

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連項目**

* [TTL 式](../../../sql-reference/statements/create/table.md#ttl-expression) の詳細について。
* 列を [TTL 付きで変更する](/sql-reference/statements/alter/ttl)。
