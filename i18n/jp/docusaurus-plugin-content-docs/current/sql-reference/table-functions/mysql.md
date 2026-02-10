---
description: 'リモート MySQL サーバー上に保存されているデータに対して、`SELECT` および `INSERT` クエリを実行できるようにします。'
sidebar_label: 'mysql'
sidebar_position: 137
slug: /sql-reference/table-functions/mysql
title: 'mysql'
doc_type: 'reference'
---

# mysql テーブル関数 \{#mysql-table-function\}

リモートの MySQL サーバー上のデータに対して、`SELECT` および `INSERT` クエリを実行できるようにします。

## 構文 \{#syntax\}

```sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```

## 引数 \{#arguments\}

| Argument              | Description                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`           | MySQL サーバーのアドレス。                                                                                                                                                                                                                                                                                                                                                                                                  |
| `database`            | リモートデータベース名。                                                                                                                                                                                                                                                                                                                                                                                                      |
| `table`               | リモートテーブル名。                                                                                                                                                                                                                                                                                                                                                                                                        |
| `user`                | MySQL ユーザー。                                                                                                                                                                                                                                                                                                                                                                                                       |
| `password`            | ユーザーパスワード。                                                                                                                                                                                                                                                                                                                                                                                                        |
| `replace_query`       | `INSERT INTO` クエリを `REPLACE INTO` に変換するフラグ。取り得る値:<br />    - `0` - クエリは `INSERT INTO` として実行されます。<br />    - `1` - クエリは `REPLACE INTO` として実行されます。                                                                                                                                                                                                                                                                  |
| `on_duplicate_clause` | `INSERT` クエリに追加される `ON DUPLICATE KEY on_duplicate_clause` 式。`replace_query = 0` の場合にのみ指定できます（`replace_query = 1` と `on_duplicate_clause` を同時に指定した場合、ClickHouse は例外をスローします）。<br />    例: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`<br />    ここでの `on_duplicate_clause` は `UPDATE c2 = c2 + 1` です。`ON DUPLICATE KEY` 句と併用できる `on_duplicate_clause` については MySQL のドキュメントを参照してください。 |

引数は [named collections](operations/named-collections.md) を使って渡すこともできます。この場合、`host` と `port` は別々に指定する必要があります。本番環境ではこの方法を推奨します。

`=, !=, >, >=, <, <=` のような単純な `WHERE` 句は、現在は MySQL サーバー側で実行されます。

それ以外の条件および `LIMIT` 句によるサンプリング制約は、MySQL へのクエリが終了した後に ClickHouse 内でのみ実行されます。

複数のレプリカをサポートしており、`|` で列挙する必要があります。例えば:

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

または

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

## 返される値 \{#returned_value\}

元の MySQL テーブルと同じカラムを持つテーブルオブジェクト。

:::note
MySQL の一部のデータ型は、異なる ClickHouse の型にマッピングされる場合があります。これはクエリレベルの設定 [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level) で制御できます。
:::

:::note
`INSERT` クエリでは、テーブル関数 `mysql(...)` と、カラム名リスト付きのテーブル名を区別するために、キーワード `FUNCTION` または `TABLE FUNCTION` を必ず使用する必要があります。以下の例を参照してください。
:::

## 例 \{#examples\}

MySQL のテーブル:

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));

mysql> INSERT INTO test (`int_id`, `float`) VALUES (1,2);

mysql> SELECT * FROM test;
+--------+-------+
| int_id | float |
+--------+-------+
|      1 |     2 |
+--------+-------+
```

ClickHouse からデータを取得する:

```sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

または、[名前付きコレクション](operations/named-collections.md) を使用します：

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
SELECT * FROM mysql(creds, table='test');
```

```text
┌─int_id─┬─float─┐
│      1 │     2 │
└────────┴───────┘
```

置換および挿入:

```sql
INSERT INTO FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 1) (int_id, float) VALUES (1, 3);
INSERT INTO TABLE FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 0, 'UPDATE int_id = int_id + 1') (int_id, float) VALUES (1, 4);
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

```text
┌─int_id─┬─float─┐
│      1 │     3 │
│      2 │     4 │
└────────┴───────┘
```

MySQL テーブルから ClickHouse テーブルにデータをコピーする:

```sql
CREATE TABLE mysql_copy
(
   `id` UInt64,
   `datetime` DateTime('UTC'),
   `description` String,
)
ENGINE = MergeTree
ORDER BY (id,datetime);

INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');
```

または、現在の最大 ID に基づいて MySQL から増分バッチのみをコピーする場合：

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) FROM mysql_copy);
```

## 関連項目 \{#related\}

- [MySQL テーブルエンジン](../../engines/table-engines/integrations/mysql.md)
- [MySQL をディクショナリのソースとして使用する](/sql-reference/dictionaries#mysql)
- [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](operations/settings/settings.md#mysql_max_rows_to_insert)
