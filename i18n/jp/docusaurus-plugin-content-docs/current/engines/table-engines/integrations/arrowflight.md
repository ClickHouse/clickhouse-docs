---
description: 'このエンジンを使用すると、Apache Arrow Flight を介してリモートデータセットにクエリを実行できます。'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'ArrowFlight テーブルエンジン'
doc_type: 'reference'
---



# ArrowFlight テーブルエンジン

ArrowFlight テーブルエンジンにより、ClickHouse は [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルを介してリモートデータセットをクエリできます。
この統合により、ClickHouse は外部の Flight 対応サーバーから、カラム指向の Arrow 形式で高い性能でデータを取得できるようになります。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**エンジンパラメータ**

- `host:port` — リモートArrow Flightサーバーのアドレス。
- `dataset_name` — Flightサーバー上のデータセットの識別子。
- `username` - ベーシック認証で使用するユーザー名。
- `password` - ベーシック認証で使用するパスワード。
  `username`と`password`が指定されていない場合は認証が使用されません
  (Arrow Flightサーバーが認証なしのアクセスを許可している場合のみ動作します)。


## 使用例 {#usage-example}

この例では、リモートのArrow Flightサーバーからデータを読み取るテーブルを作成する方法を示します:

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

リモートデータをローカルテーブルと同様にクエリします:

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

- ClickHouseで定義されたスキーマは、Flightサーバーが返すスキーマと一致している必要があります。
- このエンジンは、フェデレーテッドクエリ、データ仮想化、ストレージとコンピュートの分離に適しています。


## 関連項目 {#see-also}

- [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
- [ClickHouseのArrowフォーマット統合](/interfaces/formats/Arrow)
