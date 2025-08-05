---
sidebar_position: 1
sidebar_label: 'ClickHouseでのテーブル作成'
title: 'ClickHouseでのテーブル作成'
slug: '/guides/creating-tables'
description: 'ClickHouse でのテーブル作成について学びます'
---




# ClickHouseでのテーブル作成

ほとんどのデータベースと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。新しいデータベースをClickHouseに作成するには、`CREATE DATABASE` コマンドを使用します：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、`CREATE TABLE` を使用して新しいテーブルを定義します。データベース名を指定しない場合、テーブルは `default` データベースに作成されます。

次の `my_first_table` という名前のテーブルは、`helloworld` データベースに作成されます：

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

上記の例では、`my_first_table` は4つのカラムを持つ `MergeTree` テーブルです：

- `user_id`:  32ビットの符号なし整数
- `message`: `String` データ型で、他のデータベースシステムにおける `VARCHAR`、`BLOB`、`CLOB` などの型を置き換えます
- `timestamp`: 時間の瞬間を表す `DateTime` 値
- `metric`: 32ビットの浮動小数点数

:::note
テーブルエンジンは次のことを決定します：
- データがどのように、どこに保存されるか
- サポートされるクエリの種類
- データがレプリケートされるかどうか

選択肢が豊富なエンジンがありますが、単一ノードのClickHouseサーバーでのシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)が適しているでしょう。
:::

## 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの仕組みを理解することが重要です（主キーの実装は予想外かもしれません！）：

- ClickHouseの主キーは、テーブル内の各行で**_一意ではありません_**。

ClickHouseテーブルの主キーは、ディスクに書き込む際にデータがどのようにソートされるかを決定します。8,192行または10MBのデータ（**インデックスの粒度**と呼ばれます）ごとに、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに簡単に収まる**スパースインデックス**を生成し、グラニュールは `SELECT` クエリ中に処理される最小のカラムデータのストライプを表します。

主キーは `PRIMARY KEY` パラメータを使用して定義できます。 `PRIMARY KEY` を指定せずにテーブルを定義した場合、キーは `ORDER BY` 句で指定されたタプルになります。 `PRIMARY KEY` と `ORDER BY` の両方を指定すると、主キーはソート順のプレフィックスでなければなりません。

主キーはまたソーティングキーでもあり、`(user_id, timestamp)` のタプルです。したがって、各カラムファイルに保存されるデータは `user_id` でソートされ、その後 `timestamp` でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)を参照してください。
:::
