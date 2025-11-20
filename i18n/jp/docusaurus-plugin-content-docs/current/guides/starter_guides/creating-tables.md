---
sidebar_position: 1
sidebar_label: 'テーブルの作成'
title: 'ClickHouse でのテーブル作成'
slug: /guides/creating-tables
description: 'ClickHouse におけるテーブルの作成方法について学びます'
keywords: ['creating tables', 'CREATE TABLE', 'table creation', 'database guide', 'MergeTree engine']
doc_type: 'guide'
---



# ClickHouse でのテーブル作成

ほとんどのデータベースと同様に、ClickHouse ではテーブルは論理的に **データベース** ごとにグループ化されます。ClickHouse で新しいデータベースを作成するには、`CREATE DATABASE` コマンドを使用します。

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、新しいテーブルを定義するには `CREATE TABLE` を使用します。データベース名を指定しない場合、テーブルは
`default` データベースに作成されます。

次の `my_first_table` というテーブルは、`helloworld` データベース内に作成されます。

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

上記の例では、`my_first_table` は 4 列を持つ `MergeTree` テーブルです。

* `user_id`: 32ビット符号なし整数
* `message`: `String` データ型。他のデータベースシステムでの `VARCHAR`、`BLOB`、`CLOB` などの型の代わりになります
* `timestamp`: 時点を表す `DateTime` 型の値
* `metric`: 32ビット浮動小数点数

:::note
テーブルエンジンによって、次の点が決まります。

* データがどのように、どこに保存されるか
* どのクエリがサポートされるか
* データがレプリケートされるかどうか

選択できるエンジンは多数ありますが、単一ノードの ClickHouse サーバー上での単純なテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) を選択するのが一般的です。
:::


## プライマリキーの概要 {#a-brief-intro-to-primary-keys}

先に進む前に、ClickHouseにおけるプライマリキーの動作を理解することが重要です（プライマリキーの実装は予想外に思えるかもしれません！）：

- ClickHouseのプライマリキーは、テーブル内の各行に対して**_一意ではありません_**

ClickHouseテーブルのプライマリキーは、ディスクに書き込まれる際のデータのソート方法を決定します。8,192行または10MBのデータ（**インデックス粒度**と呼ばれます）ごとに、プライマリキーインデックスファイルにエントリが作成されます。この粒度の概念により、メモリに容易に収まる**スパースインデックス**が作成され、各粒度は`SELECT`クエリ中に処理されるカラムデータの最小単位のストライプを表します。

プライマリキーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`を指定せずにテーブルを定義した場合、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定する場合、プライマリキーはソート順のプレフィックスである必要があります。

プライマリキーはソートキーでもあり、`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに格納されるデータは、`user_id`、次に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)をご覧ください。
:::
