---
description: 'Documentation for RENAME Statement'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: '/sql-reference/statements/rename'
title: 'RENAME Statement'
---




# RENAME ステートメント

データベース、テーブル、またはディクショナリの名前を変更します。複数のエンティティは、単一のクエリで名前変更できます。`RENAME` クエリによる複数のエンティティの操作は非原子操作です。エンティティ名を原子的に交換するには、[EXCHANGE](./exchange.md) ステートメントを使用してください。

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

1 つ以上のテーブルの名前を変更します。

テーブルの名前変更は軽量な操作です。`TO` の後に異なるデータベースを指定すると、テーブルはこのデータベースに移動されます。ただし、データベースを含むディレクトリは同じファイルシステム内に存在している必要があります。そうでない場合、エラーが返されます。1つのクエリで複数のテーブルを名前変更すると、その操作は原子的ではありません。部分的に実行される可能性があり、他のセッションのクエリが `Table ... does not exist ...` エラーを受け取ることがあります。

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

1 つまたは複数のディクショナリの名前を変更します。このクエリは、ディクショナリをデータベース間で移動するために使用できます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連情報**

- [Dictionaries](../../sql-reference/dictionaries/index.md)
