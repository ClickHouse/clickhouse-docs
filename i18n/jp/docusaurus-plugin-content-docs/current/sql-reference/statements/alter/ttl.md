---
description: 'テーブルのTTLを操作するためのドキュメント'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: 'テーブルのTTLを操作する'
---


# テーブルのTTLを操作する

:::note
古いデータの管理にTTLを使用する詳細を探している場合は、[TTLを使用したデータ管理](/guides/developer/ttl.md)のユーザーガイドをご覧ください。以下のドキュメントでは、既存のTTLルールを変更または削除する方法を示します。
:::

## TTLの変更 {#modify-ttl}

次の形式のリクエストで[テーブルTTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)を変更できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTLの削除 {#remove-ttl}

以下のクエリでテーブルからTTLプロパティを削除できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブルに`TTL`が設定されていることを考えます:

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

`OPTIMIZE`を実行して`TTL`のクリーンアップを強制します:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```
二番目の行はテーブルから削除されました。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

次に、以下のクエリでテーブル`TTL`を削除します:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除された行を再挿入し、再度`OPTIMIZE`で`TTL`のクリーンアップを強制します:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL`はもう存在しないため、二番目の行は削除されません:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連項目**

- [TTL式](../../../sql-reference/statements/create/table.md#ttl-expression)についての詳細。
- [TTLを持つカラムを変更する](/sql-reference/statements/alter/ttl)。
