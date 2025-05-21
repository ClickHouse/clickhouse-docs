---
description: 'RENAME ステートメントのドキュメント'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: /sql-reference/statements/rename
title: 'RENAME ステートメント'
---


# RENAME ステートメント

データベース、テーブル、または辞書の名前を変更します。複数のエンティティを1つのクエリで名称変更できます。
ただし、複数のエンティティを持つ `RENAME` クエリは非アトミック操作であることに注意してください。エンティティの名前をアトミックに交換するには、[EXCHANGE](./exchange.md) ステートメントを使用してください。

**構文**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```

## RENAME DATABASE {#rename-database}

データベースの名前を変更します。

**構文**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE {#rename-table}

1つまたは複数のテーブルの名前を変更します。

テーブルの名前変更は軽量な操作です。`TO` の後に異なるデータベースを指定すると、そのテーブルはこのデータベースに移動されます。ただし、データベースのディレクトリは同じファイルシステムに存在する必要があります。そうでない場合はエラーが返されます。
1つのクエリで複数のテーブルの名前を変更する場合、その操作はアトミックではありません。部分的に実行される可能性があり、他のセッションで `Table ... does not exist ...` エラーが発生することがあります。

**構文**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

より簡単な SQL を使用することもできます:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

1つまたは複数の辞書の名前を変更します。このクエリは、辞書をデータベース間で移動するために使用できます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連情報**

- [Dictionaries](../../sql-reference/dictionaries/index.md)
