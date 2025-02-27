---
sidebar_position: 1
sidebar_label: テーブルの作成
---

# ClickHouseにおけるテーブルの作成

ほとんどのデータベースと同様に、ClickHouseは論理的にテーブルを**データベース**にグループ化します。`CREATE DATABASE`コマンドを使用して、ClickHouseに新しいデータベースを作成します。

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、`CREATE TABLE`を使用して新しいテーブルを定義します。（データベース名を指定しない場合、テーブルは`default`データベースに作成されます。）以下は、`helloworld`データベースに`my_first_table`という名前のテーブルを作成する例です：

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
- `timestamp`: 時間の瞬間を表す`DateTime`値
- `metric`: 32ビットの浮動小数点数

:::note
テーブルエンジンは以下を決定します：
 - データがどのように、どこに格納されるか
 - どのクエリがサポートされるか
 - データがレプリケートされるかどうか

選択肢となるエンジンは多数ありますが、単一ノードのClickHouseサーバーでのシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)が最適だと思われます。
:::

## 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの動作を理解することが重要です（主キーの実装は予期しないものかもしれません！）：

 - ClickHouseの主キーは**_各行で一意ではありません_**。

ClickHouseのテーブルの主キーは、データがディスクに書き込まれる際のソート方法を決定します。8,192行または10MBのデータ（**インデックスの粒度**と呼ばれます）ごとに、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに簡単に収まる**スパースインデックス**を生成し、粒は`SELECT`クエリ中に処理されるカラムデータの最小単位のストライプを表します。

主キーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`を指定しないでテーブルを定義した場合、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定する場合、主キーはソート順序のプレフィックスでなければなりません。

主キーはソートキーでもあり、`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに格納されるデータは`user_id`でソートされ、その後に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)を確認してください。
:::
