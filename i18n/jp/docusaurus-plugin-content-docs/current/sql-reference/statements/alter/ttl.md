---
description: 'テーブル TTL の操作方法に関するドキュメント'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: 'テーブル TTL の操作'
doc_type: 'reference'
---



# テーブル TTL の操作

:::note
古いデータの管理に TTL を使用する方法の詳細については、ユーザーガイド [Manage Data with TTL](/guides/developer/ttl.md) を参照してください。以下では、既存の TTL ルールを変更または削除する方法を説明します。
:::



## MODIFY TTL {#modify-ttl}

次の形式のリクエストで[テーブルTTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)を変更できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```


## REMOVE TTL {#remove-ttl}

TTLプロパティは次のクエリでテーブルから削除できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブル`TTL`を持つテーブルを考えます:

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

`OPTIMIZE`を実行して`TTL`クリーンアップを強制します:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

2行目がテーブルから削除されました。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

次のクエリでテーブル`TTL`を削除します:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除された行を再挿入し、`OPTIMIZE`で再度`TTL`クリーンアップを強制します:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL`が存在しないため、2行目は削除されません:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連項目**

- [TTL式](../../../sql-reference/statements/create/table.md#ttl-expression)の詳細。
- [TTLを使用した](/sql-reference/statements/alter/ttl)カラムの変更。
