---
'description': 'エンジンは、Apache Arrow Flightを介してリモートデータセットにクエリを実行することを可能にします。'
'sidebar_label': 'ArrowFlight'
'sidebar_position': 186
'slug': '/engines/table-engines/integrations/arrowflight'
'title': 'ArrowFlight'
'doc_type': 'reference'
---


# ArrowFlight

ArrowFlight テーブルエンジンは、ClickHouse が [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルを介してリモートデータセットをクエリできるようにします。
この統合により、ClickHouse は高パフォーマンスで列指向の Arrow 形式で外部の Flight 対応サーバーからデータを取得できます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**エンジンパラメータ**

* `host:port` — リモート Arrow Flight サーバーのアドレス。
* `dataset_name` — Flight サーバー上のデータセットの識別子。
* `username` - 基本的な HTTP スタイルの認証に使用するユーザー名。
* `password` - 基本的な HTTP スタイルの認証に使用するパスワード。
`username` と `password` が指定されていない場合、認証が使用されないことを意味します
（これは Arrow Flight サーバーがそれを許可する場合のみ機能します）。

## 使用例 {#usage-example}

この例では、リモート Arrow Flight サーバーからデータを読み取るテーブルを作成する方法を示します：

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

まるでローカルテーブルのようにリモートデータをクエリします：

```sql
SELECT * FROM remote_flight_data ORDER BY id;
```

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

## ノート {#notes}

* ClickHouse で定義されたスキーマは、Flight サーバーによって返されるスキーマと一致する必要があります。
* このエンジンは、フェデレーテッドクエリ、データバーチャライゼーション、およびストレージとコンピュートのデカップリングに適しています。

## その他の情報 {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse における Arrow 形式の統合](/interfaces/formats/Arrow)
