---
slug: /sql-reference/statements/rename
sidebar_position: 48
sidebar_label: RENAME
---

# RENAME ステートメント

データベース、テーブル、または辞書の名前を変更します。複数のエンティティを一つのクエリで名前変更できます。
ただし、複数のエンティティを含む `RENAME` クエリは非原子的操作であることに注意してください。エンティティの名前を原子的に入れ替えるには、[EXCHANGE](./exchange.md) ステートメントを使用してください。

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

テーブルの名前を変更することは軽量な操作です。`TO` の後に異なるデータベースを指定した場合、そのテーブルはこのデータベースに移動します。ただし、データベースを含むディレクトリは同じファイルシステム上に存在する必要があります。そうでない場合、エラーが返されます。
1つのクエリで複数のテーブルの名前を変更する場合、操作は原子的ではありません。部分的に実行される可能性があり、他のセッションで `Table ... does not exist ...` エラーが発生する場合があります。

**構文**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

より簡単な SQL を使うこともできます:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

1つまたは複数の辞書の名前を変更します。このクエリは、辞書を別のデータベースに移動するためにも使用できます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連情報**

- [辞書](../../sql-reference/dictionaries/index.md)
