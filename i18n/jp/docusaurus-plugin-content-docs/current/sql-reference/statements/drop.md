---
'description': 'DROP ステートメントのドキュメント'
'sidebar_label': 'DROP'
'sidebar_position': 44
'slug': '/sql-reference/statements/drop'
'title': 'DROP ステートメント'
---




# DROPステートメント

既存のエンティティを削除します。`IF EXISTS`句が指定されている場合、エンティティが存在しないときにこれらのクエリはエラーを返しません。`SYNC`修飾子が指定されている場合、エンティティは遅延なく削除されます。

## DROP DATABASE {#drop-database}

`db`データベース内のすべてのテーブルを削除し、その後`db`データベース自体を削除します。

構文:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

1つまたは複数のテーブルを削除します。

:::tip
テーブルの削除を元に戻すには、[UNDROP TABLE](/sql-reference/statements/undrop.md)を参照してください。
:::

構文:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

制限事項:
- `IF EMPTY`句が指定されている場合、サーバーはクエリを受け取ったレプリカでのみテーブルの空であることを確認します。
- 複数のテーブルを同時に削除することは原子操作ではありません。つまり、テーブルの削除に失敗した場合、その後のテーブルは削除されません。

## DROP DICTIONARY {#drop-dictionary}

辞書を削除します。

構文:

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

ユーザーを削除します。

構文:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

ロールを削除します。削除されたロールは、割り当てられていたすべてのエンティティから取り消されます。

構文:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

行ポリシーを削除します。削除された行ポリシーは、割り当てられていたすべてのエンティティから取り消されます。

構文:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

クォータを削除します。削除されたクォータは、割り当てられていたすべてのエンティティから取り消されます。

構文:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

設定プロファイルを削除します。削除された設定プロファイルは、割り当てられていたすべてのエンティティから取り消されます。

構文:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

ビューを削除します。ビューは`DROP TABLE`コマンドでも削除できますが、`DROP VIEW`は`[db.]name`がビューであることを確認します。

構文:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

[CREATE FUNCTION](./create/function.md)によって作成されたユーザー定義関数を削除します。システム関数は削除できません。

**構文**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**例**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION {#drop-named-collection}

名前付きコレクションを削除します。

**構文**

```sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**例**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
