---
sidebar_position: 1
sidebar_label: 'テーブルの作成'
title: 'ClickHouse でのテーブル作成'
slug: /guides/creating-tables
description: 'ClickHouse におけるテーブルの作成方法について学びます'
keywords: ['テーブルの作成', 'CREATE TABLE', 'テーブル作成', 'データベースガイド', 'MergeTree エンジン']
doc_type: 'guide'
---



# ClickHouse におけるテーブルの作成

多くのデータベースと同様に、ClickHouse ではテーブルは論理的に **データベース** にグループ化されます。ClickHouse で新しいデータベースを作成するには、`CREATE DATABASE` コマンドを使用します。

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、新しいテーブルを定義するには `CREATE TABLE` を使用します。データベース名を指定しない場合、テーブルは
`default` データベース内に作成されます。

次の `my_first_table` という名前のテーブルが、`helloworld` データベース内に作成されます。

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

上記の例では、`my_first_table` は 4 つのカラムを持つ `MergeTree` テーブルです:

* `user_id`:  32 ビットの符号なし整数型
* `message`: 他のデータベースシステムにおける `VARCHAR`、`BLOB`、`CLOB` などの型を置き換える `String` 型
* `timestamp`: 時点を表す `DateTime` 型の値
* `metric`: 32 ビットの浮動小数点数型

:::note
テーブルエンジンは次の点を決定します:

* データがどのように、どこに保存されるか
* どのようなクエリがサポートされるか
* データがレプリケートされるかどうか

選択できるエンジンは多数ありますが、単一ノードの ClickHouse サーバー上のシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) が第一候補となるでしょう。
:::


## プライマリキーの概要 {#a-brief-intro-to-primary-keys}

先に進む前に、ClickHouseにおけるプライマリキーの動作を理解することが重要です(プライマリキーの実装は予想外に思えるかもしれません!):

- ClickHouseのプライマリキーは、テーブル内の各行に対して**_一意ではありません_**

ClickHouseテーブルのプライマリキーは、ディスクに書き込まれる際のデータのソート方法を決定します。8,192行または10MBのデータ(**インデックス粒度**と呼ばれます)ごとに、プライマリキーインデックスファイルにエントリが作成されます。この粒度の概念により、メモリに容易に収まる**疎インデックス**が作成され、粒度は`SELECT`クエリ実行時に処理されるカラムデータの最小単位のストライプを表します。

プライマリキーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`を指定せずにテーブルを定義した場合、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定する場合、プライマリキーはソート順のプレフィックスである必要があります。

プライマリキーはソートキーでもあり、`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに格納されるデータは、まず`user_id`でソートされ、次に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)をご覧ください。
:::
