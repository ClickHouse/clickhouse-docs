---
slug: /sql-reference/statements/rename
sidebar_position: 48
sidebar_label: RENAME
---


# RENAME ステートメント

データベース、テーブル、または辞書の名前を変更します。複数のエンティティを単一のクエリで名前変更することができます。`RENAME` クエリは非原子的な操作であることに注意してください。エンティティの名前を原子的に入れ替えるには、[EXCHANGE](./exchange.md) ステートメントを使用してください。

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

1つ以上のテーブルの名前を変更します。

テーブルの名前変更は軽い操作です。`TO` の後に異なるデータベースを指定すると、そのテーブルはそのデータベースに移動されます。ただし、データベースのディレクトリは同じファイルシステム内に存在しなければなりません。そうでない場合は、エラーが返されます。1つのクエリで複数のテーブルの名前を変更する場合、その操作は原子的ではありません。部分的に実行される可能性があり、他のセッションのクエリで `Table ... does not exist ...` エラーが発生することがあります。

**構文**

``` sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

そして、よりシンプルな SQL を使用することもできます:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

1つまたは複数の辞書の名前を変更します。このクエリは、辞書をデータベース間で移動するためにも使用できます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連情報**

- [辞書](../../sql-reference/dictionaries/index.md)
