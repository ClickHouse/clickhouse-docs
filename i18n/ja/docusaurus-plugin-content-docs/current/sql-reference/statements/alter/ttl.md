---
slug: /sql-reference/statements/alter/ttl
sidebar_position: 44
sidebar_label: TTL
---

# テーブルのTTL操作

:::note
古いデータを管理するためのTTLの使用に関する詳細は、[TTLを使ったデータ管理](/guides/developer/ttl.md)のユーザーガイドを参照してください。以下のドキュメントは、既存のTTLルールを変更または削除する方法を示します。
:::

## TTLの変更 {#modify-ttl}

[テーブルのTTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)は、以下の形式のリクエストで変更できます：

``` sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTLの削除 {#remove-ttl}

TTLプロパティは、以下のクエリを使用してテーブルから削除できます：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブル `TTL` を持つテーブルを考えます：

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

`OPTIMIZE`を実行して`TTL`クリーンアップを強制します：

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

次に、以下のクエリでテーブル `TTL` を削除します：

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除した行を再挿入し、再度`OPTIMIZE`で`TTL`クリーンアップを強制します：

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL`はもはや存在しないため、2行目は削除されません：

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連情報**

- [TTL式](../../../sql-reference/statements/create/table.md#ttl-expression)についての詳細。
- [TTLを使用してカラムを変更する](../../../sql-reference/statements/alter/column.md#alter_modify-column)方法。
