---
description: 'RENAME ステートメントのリファレンス'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: /sql-reference/statements/rename
title: 'RENAME ステートメント'
doc_type: 'reference'
---



# RENAME ステートメント

データベース、テーブル、またはディクショナリの名前を変更します。1 つのクエリで複数のエンティティの名前を変更できます。
複数のエンティティを対象とした `RENAME` クエリはアトミックな操作ではないことに注意してください。エンティティ名をアトミックに入れ替えるには、[EXCHANGE](./exchange.md) ステートメントを使用してください。

**構文**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```


## RENAME DATABASE

データベースの名前を変更します。

**構文**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```


## RENAME TABLE

1 つ以上のテーブルの名前を変更します。

テーブル名の変更は軽量な処理です。`TO` の後に別のデータベースを指定した場合、テーブルはそのデータベースに移動されます。ただし、データベースのディレクトリは同一のファイルシステム上に存在している必要があります。そうでない場合はエラーが返されます。
1 つのクエリで複数のテーブル名を変更する場合、この操作はアトミックではありません。部分的にのみ実行される可能性があり、別のセッションで実行されるクエリが `Table ... does not exist ...` エラーを受け取る場合があります。

**構文**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

また、より簡潔な SQL を使うこともできます：

```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```


## RENAME DICTIONARY

1つまたは複数の辞書の名前を変更します。このクエリは、辞書を別のデータベースに移動するためにも使用できます。

**構文**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**関連項目**

* [辞書](../../sql-reference/dictionaries/index.md)
