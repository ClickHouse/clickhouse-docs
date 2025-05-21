---
sidebar_position: 1
sidebar_label: 'テーブルの作成'
title: 'ClickHouseにおけるテーブルの作成'
slug: /guides/creating-tables
description: 'ClickHouseにおけるテーブルの作成について学ぶ'
---


# ClickHouseにおけるテーブルの作成

ほとんどのデータベースと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。`CREATE DATABASE`コマンドを使用して、ClickHouseに新しいデータベースを作成します：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、`CREATE TABLE`を使用して新しいテーブルを定義します。データベース名を指定しない場合、テーブルは`default`データベースに作成されます。

以下のテーブルは、`helloworld`データベースに作成される`my_first_table`という名前のテーブルです：

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

上記の例では、`my_first_table`は4つのカラムを持つ`MergeTree`テーブルです：

- `user_id`: 32ビットの符号なし整数
- `message`: `String`データ型で、他のデータベースシステムからの`VARCHAR`、`BLOB`、`CLOB`などの型を置き換えます
- `timestamp`: 時間の瞬間を表す`DateTime`値
- `metric`: 32ビットの浮動小数点数

:::note
テーブルエンジンは次のことを決定します：
- データがどのように、どこに保存されるか
- どのクエリがサポートされているか
- データがレプリケートされるかどうか

選択できるエンジンは多数ありますが、単一ノードのClickHouseサーバー上でのシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)が適しているでしょう。
:::

## 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの動作について理解することが重要です（主キーの実装は予想外に見えるかもしれません！）：

- ClickHouseにおける主キーは、テーブル内の各行に対して**_一意ではありません_** 

ClickHouseテーブルの主キーは、データがディスクに書き込まれる際のソート方法を決定します。8192行または10MBのデータごとに（これを**インデックスの粒度**と呼びます）、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに容易に収まる**スパースインデックス**を作成し、粒子は`SELECT`クエリの際に処理される最小のカラムデータのストライプを表します。

主キーは`PRIMARY KEY`パラメータを使用して定義できます。主キーが指定されていないテーブルを定義すると、そのキーは`ORDER BY`句で指定されたタプルになります。両方の`PRIMARY KEY`と`ORDER BY`を指定した場合、主キーはソート順のプレフィックスでなければなりません。

主キーはまたソートキーでもあり、これは`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに保存されるデータは、まず`user_id`で、次に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)をチェックしてください。
:::
