---
sidebar_position: 1
sidebar_label: テーブルの作成
---


# ClickHouseでのテーブルの作成

ほとんどのデータベースと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。新しいデータベースをClickHouseに作成するには、`CREATE DATABASE`コマンドを使用します：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、`CREATE TABLE`を使用して新しいテーブルを定義します。（データベース名を指定しない場合、そのテーブルは`default`データベースに作成されます。）以下のテーブルは`helloworld`データベースに`my_first_table`という名前です：

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

- `user_id`:  32ビットの符号なし整数
- `message`: `String`データ型で、他のデータベースシステムの`VARCHAR`、`BLOB`、`CLOB`などの型を置き換えます
- `timestamp`: 時間の一瞬を表す`DateTime`値
- `metric`: 32ビットの浮動小数点数

:::note
テーブルエンジンは次のことを決定します：
- データがどのように、そしてどこに保存されるか
- どのクエリがサポートされるか
- データがレプリケートされるかどうか

選択できるエンジンは多数ありますが、単一ノードのClickHouseサーバーでのシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)が最適な選択でしょう。
:::

## 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの動作を理解することが重要です（主キーの実装は予想外かもしれません！）：

- ClickHouseの主キーは**_各行に対して一意ではない_**です

ClickHouseテーブルの主キーは、データがディスクに書き込まれる際のソート方法を決定します。8,192行または10MBのデータ（**インデックスの粒度**と呼ばれます）ごとに、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに簡単に収まる**スパースインデックス**を作成し、グラニュールは`SELECT`クエリ中に処理される最小のカラムデータのストライプを表します。

主キーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`が指定されていないテーブルを定義した場合、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定すると、主キーはソート順のプレフィックスでなければなりません。

主キーはソーティングキーでもあり、これは`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに格納されるデータは`user_id`でソートされ、次に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデル化トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)を参照してください。
:::
