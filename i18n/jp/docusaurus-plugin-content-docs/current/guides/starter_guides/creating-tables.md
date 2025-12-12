---
sidebar_position: 1
sidebar_label: 'テーブルの作成'
title: 'ClickHouse でのテーブル作成'
slug: /guides/creating-tables
description: 'ClickHouse でのテーブル作成について学ぶ'
keywords: ['テーブルの作成', 'CREATE TABLE', 'テーブル作成', 'データベースガイド', 'MergeTree エンジン']
doc_type: 'guide'
---

# ClickHouse でテーブルを作成する {#creating-tables-in-clickhouse}

多くのデータベースと同様に、ClickHouse はテーブルを論理的にグループ化し、**データベース** として管理します。ClickHouse で新しいデータベースを作成するには、`CREATE DATABASE` コマンドを使用します。

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、新しいテーブルを定義するには `CREATE TABLE` を使用します。データベース名を指定しない場合、テーブルは
`default` データベース内に作成されます。

以下のテーブル `my_first_table` は、`helloworld` データベース内に作成されます。

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

上記の例では、`my_first_table` は 4 つのカラムを持つ `MergeTree` テーブルです。

* `user_id`:  32 ビットの符号なし整数
* `message`: 他のデータベースシステムにおける `VARCHAR`、`BLOB`、`CLOB` などの型を置き換える `String` データ型
* `timestamp`: ある時点を表す `DateTime` 値
* `metric`: 32 ビットの浮動小数点数

:::note
テーブルエンジンは次の点を決定します。

* データがどのように、どこに保存されるか
* どのクエリが実行できるか
* データがレプリケーションされるかどうか

選択できるエンジンは多数ありますが、単一ノードの ClickHouse サーバー上にシンプルなテーブルを作成する場合は、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) が最も一般的な選択肢となるでしょう。
:::

## プライマリキーの概要 {#a-brief-intro-to-primary-keys}

先に進む前に、ClickHouse におけるプライマリキーの仕組みを理解しておくことが重要です（プライマリキーの実装は
少し意外に思えるかもしれません！）:

- ClickHouse におけるプライマリキーは、テーブル内の各行ごとに **_一意である必要はありません_**

ClickHouse テーブルのプライマリキーは、データがディスクに書き込まれる際のソート方法を決定します。8,192 行ごと、または
10MB ごとのデータ（**インデックス粒度**と呼ばれます）ごとに、プライマリキーインデックスファイルにエントリが作成されます。
この粒度という考え方により、メモリに容易に収まる **疎なインデックス** が構成され、各グラニュールは `SELECT` クエリ実行時に
処理されるカラムデータの最小単位となるストライプを表します。

プライマリキーは `PRIMARY KEY` パラメータを使って定義できます。`PRIMARY KEY` を指定せずにテーブルを定義した場合、
キーは `ORDER BY` 句で指定されたタプルになります。`PRIMARY KEY` と `ORDER BY` の両方を指定する場合、プライマリキーはソート順の
プレフィックスでなければなりません。

プライマリキーはソートキーも兼ねており、ここでは `(user_id, timestamp)` というタプルです。そのため、各カラムファイルに保存されるデータは
まず `user_id` で、次に `timestamp` でソートされます。

:::tip
詳細については、ClickHouse Academy の [Modeling Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs) を参照してください。
:::
