---
description: 'このエンジンを使用すると、Apache Arrow Flight 経由でリモートデータセットにクエリを実行できます。'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'ArrowFlight テーブルエンジン'
doc_type: 'reference'
---



# ArrowFlight テーブルエンジン {#arrowflight-table-engine}

ArrowFlight テーブルエンジンを使用すると、ClickHouse は [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコル経由でリモートのデータセットに対してクエリを実行できます。
この統合により、ClickHouse は外部の Flight 対応サーバーから、列指向の Arrow 形式で高いパフォーマンスでデータを取得できます。



## テーブルを作成する {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**エンジンパラメータ**

* `host:port` — リモート Arrow Flight サーバーのアドレス。
* `dataset_name` — Flight サーバー上のデータセットの識別子。
* `username` - HTTP ベーシック認証で使用するユーザー名。
* `password` - HTTP ベーシック認証で使用するパスワード。
  `username` と `password` が指定されていない場合は認証を行わないことを意味します
  （その場合、Arrow Flight サーバー側で未認証アクセスが許可されている必要があります）。


## 使用例 {#usage-example}

この例では、リモートの Arrow Flight サーバーからデータを読み込むテーブルを作成する方法を示します。

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

リモートデータに対して、ローカルテーブルと同じようにクエリを実行します：

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


## 注意事項 {#notes}

* ClickHouseで定義されたスキーマは、Flight サーバーによって返されるスキーマと一致している必要があります。
* このエンジンは、フェデレーションクエリ、データ仮想化、ストレージとコンピュートの分離に適しています。



## 関連情報 {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse における Arrow フォーマットの統合](/interfaces/formats/Arrow)
