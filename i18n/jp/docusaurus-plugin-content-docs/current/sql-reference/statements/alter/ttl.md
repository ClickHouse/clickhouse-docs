---
slug: /sql-reference/statements/alter/ttl
sidebar_position: 44
sidebar_label: TTL
---


# テーブルTTLの操作

:::note
古いデータの管理にTTLを使用する詳細については、[Manage Data with TTL](/guides/developer/ttl.md) ユーザーガイドを参照してください。以下のドキュメントでは、既存のTTLルールを変更または削除する方法を示します。
:::

## TTLの変更 {#modify-ttl}

[テーブルTTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)を変更するには、以下の形式のリクエストを使用できます：

``` sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTLの削除 {#remove-ttl}

TTLプロパティは、以下のクエリを使用してテーブルから削除できます：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブル`TTL`を考慮します：

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

`OPTIMIZE`を実行して`TTL`のクリーンアップを強制します：

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

次に、以下のクエリを使用してテーブル`TTL`を削除します：

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除された行を再挿入し、`OPTIMIZE`で再度`TTL`のクリーンアップを強制します：

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
- [TTL](../../../sql-reference/statements/alter/column.md#alter_modify-column)を持つカラムの変更。
