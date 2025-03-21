---
slug: '/sql-reference/statements/alter/ttl'
sidebar_position: 44
sidebar_label: '有効期限 (TTL)'
keywords: ['有効期限', 'TTL', ClickHouse']
description: 'ClickHouseのテーブルに対するTTL操作についての説明。'
---


# テーブル TTL の操作

:::note
古いデータの管理にTTLを使用する方法の詳細を探している場合は、[Manage Data with TTL](/guides/developer/ttl.md)ユーザーガイドをご覧ください。以下のドキュメントでは、既存のTTLルールを変更または削除する方法を示しています。
:::

## TTLの変更 {#modify-ttl}

次の形式のリクエストで[テーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)を変更できます：

``` sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTLの削除 {#remove-ttl}

TTLプロパティは、次のクエリでテーブルから削除できます：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブル `TTL` を持つテーブルを考えてみましょう：

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

`OPTIMIZE` を実行して `TTL` のクリーンアップを強制します：

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

2行目はテーブルから削除されました。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

次に、次のクエリでテーブル `TTL` を削除します：

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除された行を再挿入し、再度 `OPTIMIZE` で `TTL` のクリーンアップを強制します：

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` はもはや存在しないため、2行目は削除されません：

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連情報**

- [TTL-expressions](../../../sql-reference/statements/create/table.md#ttl-expression)についての詳細。
- [TTLを使用してカラムを変更する](/sql-reference/statements/alter/ttl)。
