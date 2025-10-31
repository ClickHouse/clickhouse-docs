---
'sidebar_label': 'Airbyte'
'sidebar_position': 11
'keywords':
- 'clickhouse'
- 'Airbyte'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'slug': '/integrations/airbyte'
'description': 'Airbyteデータパイプラインを使用してClickHouseにデータをストリーミングする'
'title': 'AirbyteをClickHouseに接続'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import airbyte01 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_01.png';
import airbyte02 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_02.png';
import airbyte03 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_03.png';
import airbyte04 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_04.png';
import airbyte05 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_05.png';
import airbyte06 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_06.png';
import airbyte07 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_07.png';
import airbyte08 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_08.png';
import airbyte09 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# AirbyteをClickHouseに接続する

<CommunityMaintainedBadge/>

:::note
AirbyteのClickHouse用のソースとデスティネーションは現在Alphaステータスであり、大規模セット (> 1000万行) を移動するのには適していないことに注意してください。
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a>は、オープンソースのデータ統合プラットフォームです。これにより、<a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a>データパイプラインを作成でき、140以上の標準コネクタが付属しています。このステップバイステップのチュートリアルでは、AirbyteをClickHouseにデスティネーションとして接続し、サンプルデータセットをロードする方法を示します。

## 1. Airbyteをダウンロードして実行する {#1-download-and-run-airbyte}

1. AirbyteはDocker上で実行され、`docker-compose`を使用します。最新のDockerバージョンをダウンロードしてインストールしてください。

2. 公式Githubリポジトリをクローンし、お好みのターミナルで`docker-compose up`を実行してAirbyteをデプロイします：

```bash
git clone https://github.com/airbytehq/airbyte.git --depth=1
cd airbyte
./run-ab-platform.sh
```

4. ターミナルにAirbyteバナーが表示されたら、<a href="http://localhost:8000" target="_blank">localhost:8000</a>に接続できます。

    <Image img={airbyte01} size="lg" border alt="Airbyteバナー" />

        :::note
        代わりに、サインアップして<a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>を使用することもできます。
        :::

## 2. ClickHouseをデスティネーションとして追加する {#2-add-clickhouse-as-a-destination}

このセクションでは、ClickHouseインスタンスをデスティネーションとして追加する方法を示します。

1. ClickHouseサーバーを起動します（AirbyteはClickHouseバージョン`21.8.10.19`以上と互換性があります）またはClickHouseクラウドアカウントにログインします：

```bash
clickhouse-server start
```

2. Airbyte内で「Destinations」ページを選択し、新しいデスティネーションを追加します：

    <Image img={airbyte02} size="lg" border alt="Airbyteにデスティネーションを追加" />

3. 「Destination type」のドロップダウンリストからClickHouseを選択し、ClickHouseのホスト名とポート、データベース名、ユーザー名、パスワードを提供して「Set up the destination」フォームに記入し、SSL接続かどうかを選択します（`clickhouse-client`の`--secure`フラグに相当します）：

    <Image img={airbyte03} size="lg" border alt="AirbyteでのClickHouseデスティネーション作成" />

4. おめでとうございます！ AirbyteにClickHouseをデスティネーションとして追加しました。

:::note
ClickHouseをデスティネーションとして使用するためには、使用するユーザーがデータベース、テーブルの作成、および行の挿入の権限を持っている必要があります。Airbyte用に専用のユーザー（例：`my_airbyte_user`）を作成し、以下の権限を付与することをお勧めします：

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::

## 3. データセットをソースとして追加する {#3-add-a-dataset-as-a-source}

使用するサンプルデータセットは<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">ニューヨーク市タクシーデータ</a> (こちらは<a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a>にあります)です。このチュートリアルでは、このデータセットの2022年1月のサブセットを使用します。

1. Airbyte内で「Sources」ページを選択し、ファイルタイプの新しいソースを追加します。

    <Image img={airbyte04} size="lg" border alt="Airbyteにソースを追加" />

2. ソースに名前を付け、NYCタクシー2022年1月のファイルのURLを提供して「Set up the source」フォームを記入します（下記参照）。ファイル形式に`parquet`を選択し、ストレージプロバイダーとして`HTTPS Public Web`を、データセット名に`nyc_taxi_2022`を選択することを確認してください。

```text
https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
```

    <Image img={airbyte05} size="lg" border alt="AirbyteでのClickHouseソース作成" />

3. おめでとうございます！ Airbyteにソースファイルを追加しました。

## 4. 接続を作成しデータセットをClickHouseにロードする {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. Airbyte内で「Connections」ページを選択し、新しい接続を追加します。

<Image img={airbyte06} size="lg" border alt="Airbyteに接続を追加" />

2. 「Use existing source」を選択し、ニューヨーク市タクシーデータを選択、その後「Use existing destination」を選択し、ClickHouseインスタンスを選択します。

3. 「Set up the connection」フォームに記入し、レプリケーションの頻度を選択します（このチュートリアルでは`manual`を使用します）の後、同期したいストリームとして`nyc_taxi_2022`を選択します。正規化として`Normalized Tabular Data`を選択することを確認してください。

<Image img={airbyte07} size="lg" border alt="Airbyteでの接続作成" />

4. 接続が作成されたら、「Sync now」をクリックしてデータロードをトリガーします（`Manual`をレプリケーションの頻度として選択したため）。

<Image img={airbyte08} size="lg" border alt="Airbyteでの今すぐ同期" />

5. データがロードを開始します。Airbyteのログと進捗を表示するために、ビューを拡張できます。処理が完了すると、ログに「Completed successfully」というメッセージが表示されます：

<Image img={airbyte09} size="lg" border alt="正常に完了" />

6. お好みのSQLクライアントを使用してClickHouseインスタンスに接続し、結果テーブルをチェックします：

```sql
SELECT *
FROM nyc_taxi_2022
LIMIT 10
```

        応答は以下のようになります：
```response
Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
│     0 │     0.5 │        2 │          1 │          0 │           0 │        11.5 │           68 │          170 │            2 │            0 │         14.8 │           2.2 │               1 │ N                  │                  2.5 │ 2022-01-25T13:19:26  │                   0.3 │ 2022-01-25T13:36:19   │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │    2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
│   2.5 │     0.5 │        1 │          1 │       0.88 │           0 │         5.5 │           79 │          137 │            1 │            0 │         9.68 │           1.1 │               1 │ N                  │                  2.5 │ 2022-01-22T15:45:09  │                   0.3 │ 2022-01-22T15:50:16   │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │    2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
│  1.75 │     0.5 │        1 │          1 │        7.5 │        1.25 │        27.5 │           17 │          138 │            1 │            0 │        37.55 │             9 │               1 │ N                  │                    0 │ 2022-01-30T21:58:19  │                   0.3 │ 2022-01-30T22:19:30   │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │    2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │          13 │           79 │          140 │            2 │            0 │         16.8 │          3.19 │               1 │ N                  │                  2.5 │ 2022-01-26T20:43:14  │                   0.3 │ 2022-01-26T20:58:08   │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │    2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
```

```sql
SELECT count(*)
FROM nyc_taxi_2022
```

        応答は：
```response
Query id: a9172d39-50f7-421e-8330-296de0baa67e

┌─count()─┐
│ 2392428 │
└─────────┘
```

7. Airbyteが自動的にデータ型を推測し、デスティネーションテーブルに4つのカラムを追加したことに注意してください。これらのカラムは、Airbyteがレプリケーションロジックを管理し、操作をログするために使用されます。詳細は、<a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyteの公式文書</a>で確認できます。

```sql
`_airbyte_ab_id` String,
`_airbyte_emitted_at` DateTime64(3, 'GMT'),
`_airbyte_normalized_at` DateTime,
`_airbyte_nyc_taxi_072021_hashid` String
```

        データセットがClickHouseインスタンスにロードされたので、新しいテーブルを作成し、より適切なClickHouseデータ型を使用できます（<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">詳細はこちら</a>）。

8. おめでとうございます！ Airbyteを使って、ニューヨーク市のタクシーデータをClickHouseに正常にロードしました！
