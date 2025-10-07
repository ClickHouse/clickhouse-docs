---
'description': 'テーブルのTTL操作に関するドキュメント'
'sidebar_label': 'TTL'
'sidebar_position': 44
'slug': '/sql-reference/statements/alter/ttl'
'title': 'テーブルのTTL操作'
'doc_type': 'reference'
---


# テーブル TTL に関する操作

:::note
古いデータの管理に TTL を使用する詳細については、[TTL を使用したデータ管理](/guides/developer/ttl.md) ユーザー ガイドを確認してください。以下のドキュメントでは、既存の TTL ルールを変更または削除する方法を示しています。
:::

## MODIFY TTL {#modify-ttl}

次の形式のリクエストで [テーブル TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) を変更できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## REMOVE TTL {#remove-ttl}

TTL プロパティは、次のクエリでテーブルから削除できます:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**例**

テーブル `TTL` を考えます:

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

`OPTIMIZE` を実行して `TTL` のクリーンアップを強制します:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```
2 行目はテーブルから削除されました。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

次のクエリでテーブル `TTL` を削除します:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

削除された行を再挿入し、再度 `OPTIMIZE` で `TTL` のクリーンアップを強制します:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` はもはや存在しないため、2 行目は削除されません:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**関連情報**

- [TTL 表現](../../../sql-reference/statements/create/table.md#ttl-expression) についての詳細。
- [TTL を持つカラムの修正](/sql-reference/statements/alter/ttl)。
