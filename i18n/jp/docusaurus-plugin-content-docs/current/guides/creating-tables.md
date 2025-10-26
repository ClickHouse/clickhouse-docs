---
'sidebar_position': 1
'sidebar_label': 'テーブル作成'
'title': 'ClickHouseでのテーブル作成'
'slug': '/guides/creating-tables'
'description': 'ClickHouseでのテーブル作成について学ぶ'
'doc_type': 'guide'
---


# ClickHouseでのテーブルの作成

ほとんどのデータベースと同様に、ClickHouseはテーブルを**データベース**に論理的にグループ化します。新しいデータベースをClickHouseに作成するには、`CREATE DATABASE`コマンドを使用します：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同様に、`CREATE TABLE`を使用して新しいテーブルを定義します。データベース名を指定しない場合、テーブルは`default`データベースに作成されます。

次のテーブルは、`helloworld`データベースに`my_first_table`という名前で作成されます：

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
- データがどのように、どこに保存されるか
- サポートされるクエリ
- データが複製されるかどうか

選択できるエンジンは多くありますが、単一ノードのClickHouseサーバー上のシンプルなテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)が最適な選択肢です。
:::

## 主キーの簡単な紹介 {#a-brief-intro-to-primary-keys}

さらに進む前に、ClickHouseにおける主キーの動作を理解することが重要です（主キーの実装は意外なものである可能性があります！）：

- ClickHouseの主キーは、テーブル内の各行に対して**_一意ではありません_**。

ClickHouseテーブルの主キーは、ディスクに書き込まれる際にデータがどのようにソートされるかを決定します。8,192行または10MBのデータ（**インデックス粒度**と呼ばれる）ごとに、主キーインデックスファイルにエントリが作成されます。この粒度の概念は、メモリに簡単に収まる**スパースインデックス**を形成し、グラニュールは`SELECT`クエリの処理中に処理される最小単位のカラムデータを表します。

主キーは`PRIMARY KEY`パラメータを使用して定義できます。`PRIMARY KEY`を指定しないでテーブルを定義した場合、キーは`ORDER BY`句で指定されたタプルになります。`PRIMARY KEY`と`ORDER BY`の両方を指定した場合、主キーはソート順のプレフィックスである必要があります。

主キーはまた、ソートキーでもあり、`(user_id, timestamp)`のタプルです。したがって、各カラムファイルに格納されるデータは、`user_id`でソートされ、次に`timestamp`でソートされます。

:::tip
詳細については、ClickHouse Academyの[データモデリングトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)をご覧ください。
:::
