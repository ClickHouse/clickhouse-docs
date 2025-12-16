---
description: 'DROP ステートメントに関するドキュメント'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'DROP ステートメント'
doc_type: 'reference'
---

# DROP ステートメント {#drop-statements}

既存のエンティティを削除します。`IF EXISTS` 句が指定されている場合、エンティティが存在しない場合でもクエリはエラーを返しません。`SYNC` 修飾子が指定されている場合、エンティティは即座に削除されます。

## DROP DATABASE {#drop-database}

`db` データベース内のすべてのテーブルを削除してから、`db` データベース自体を削除します。

構文:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

1つ以上のテーブルを削除します。

:::tip
削除したテーブルを元に戻すには、[UNDROP TABLE](/sql-reference/statements/undrop.md) を参照してください。
:::

構文:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

制限事項:

* 句 `IF EMPTY` が指定されている場合、サーバーはクエリを受信したレプリカでのみテーブルが空かどうかを確認します。
* 複数のテーブルを一度に削除する操作はアトミックではありません。つまり、あるテーブルの削除に失敗した場合、その後に続くテーブルは削除されません。

## DROP DICTIONARY {#drop-dictionary}

辞書を削除します。

構文：

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

ユーザーを削除します。

構文：

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

ロールを削除します。削除されたロールは、割り当てられていたすべてのエンティティからの付与が取り消されます。

構文:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

行ポリシーを削除します。削除された行ポリシーは、割り当てられていたすべてのエンティティから自動的に解除されます。

構文:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

クォータを削除します。削除されたクォータは、それが割り当てられていたすべてのエンティティから自動的に解除されます。

構文:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

設定プロファイルを削除します。削除された設定プロファイルは、割り当てられていたすべての対象から取り消されます。

構文:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

ビューを削除します。ビューは `DROP TABLE` コマンドでも削除できますが、`DROP VIEW` では `[db.]name` がビューであることを確認します。

構文:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

[CREATE FUNCTION](./create/function.md) で作成されたユーザー定義関数を削除します。
システム関数は削除できません。

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
