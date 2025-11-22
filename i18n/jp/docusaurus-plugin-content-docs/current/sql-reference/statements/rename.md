---
description: 'RENAME ステートメントのリファレンス'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: /sql-reference/statements/rename
title: 'RENAME ステートメント'
doc_type: 'reference'
---



# RENAME ステートメント

データベース、テーブル、またはディクショナリの名前を変更します。1つのクエリで複数のエンティティの名前を変更できます。
複数のエンティティを対象とした `RENAME` クエリはアトミックな操作ではないことに注意してください。エンティティ名をアトミックに入れ替えるには、[EXCHANGE](./exchange.md) ステートメントを使用します。

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

テーブルの名前変更は軽量な操作です。`TO`の後に異なるデータベースを指定すると、テーブルはそのデータベースに移動されます。ただし、データベースのディレクトリは同じファイルシステム上に存在する必要があります。そうでない場合、エラーが返されます。
1つのクエリで複数のテーブルの名前を変更する場合、この操作はアトミックではありません。部分的に実行される可能性があり、他のセッションのクエリで`Table ... does not exist ...`エラーが発生することがあります。

**構文**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

また、より簡潔なSQLを使用することもできます:

```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```


## RENAME DICTIONARY {#rename-dictionary}

1つまたは複数のディクショナリの名前を変更します。このクエリを使用して、データベース間でディクショナリを移動することもできます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連項目**

- [ディクショナリ](../../sql-reference/dictionaries/index.md)
