---
sidebar_label: Airbyte
sidebar_position: 11
keywords: [clickhouse, Airbyte, 接続, 統合, etl, データ統合]
slug: /integrations/airbyte
description: Airbyteデータパイプラインを使用してClickHouseにデータをストリームします
---

# AirbyteをClickHouseに接続する

:::note
AirbyteのClickHouse用のソースとデスティネーションは現在アルファ版で、大規模なデータセット (> 1000万行) の移動には適していません。
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a>はオープンソースのデータ統合プラットフォームです。これにより、<a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a>データパイプラインを作成でき、140以上の標準コネクタが備わっています。このステップバイステップチュートリアルでは、AirbyteをClickHouseのデスティネーションとして接続し、サンプルデータセットを読み込む方法を示します。

## 1. Airbyteをダウンロードして実行する {#1-download-and-run-airbyte}

1. AirbyteはDockerで実行され、`docker-compose`を使用します。最新のDockerをダウンロードしてインストールしてください。

2. 公式のGitHubリポジトリをクローンして、好きなターミナルで`docker-compose up`を実行してAirbyteをデプロイします:

	```bash
	git clone https://github.com/airbytehq/airbyte.git --depth=1
	cd airbyte
	./run-ab-platform.sh
	```

4. ターミナルにAirbyteのバナーが表示されたら、<a href="http://localhost:8000" target="_blank">localhost:8000</a>に接続できます。

    <img src={require('./images/airbyte_01.png').default} class="image" alt="Airbyte banner" style={{width: '100%'}}/>

	:::note
	また、サインアップして<a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>を使用することもできます。
	:::

## 2. ClickHouseをデスティネーションとして追加する {#2-add-clickhouse-as-a-destination}

このセクションでは、ClickHouseインスタンスをデスティネーションとして追加する方法を説明します。

1. ClickHouseサーバーを起動します（AirbyteはClickHouseバージョン`21.8.10.19`以上に対応しています）またはClickHouseクラウドアカウントにログインします:

    ```bash
    clickhouse-server start
    ```

2. Airbyte内で「Destinations」ページを選択し、新しいデスティネーションを追加します:

    <img src={require('./images/airbyte_02.png').default} class="image" alt="Airbyteでのデスティネーションの追加" style={{width: '100%'}}/>

3. ドロップダウンリストからClickHouseを「Destination type」として選択し、「Set up the destination」フォームにClickHouseのホスト名とポート、データベース名、ユーザー名、パスワードを入力し、SSL接続であるかどうかを選択します（これは`clickhouse-client`の`--secure`フラグに相当します）:

    <img src={require('./images/airbyte_03.png').default} class="image" alt="AirbyteでのClickHouseデスティネーションの作成"/>

4. おめでとうございます！これでAirbyteにClickHouseをデスティネーションとして追加しました。

:::note
ClickHouseをデスティネーションとして使用するには、使用するユーザーにデータベース、テーブルの作成や行の挿入の権限が必要です。Airbyte用の専用ユーザー（例: `my_airbyte_user`）を作成し、次の権限を付与することをお勧めします:

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::

## 3. データセットをソースとして追加する {#3-add-a-dataset-as-a-source}

使用するサンプルデータセットは<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">ニューヨーク市タクシーデータ</a>（<a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">GitHub</a>上）です。このチュートリアルでは、2022年1月のこのデータセットのサブセットを使用します。

1. Airbyte内で「Sources」ページを選択し、ファイルタイプの新しいソースを追加します。

    <img src={require('./images/airbyte_04.png').default} class="image" alt="Airbyteでのソースの追加" style={{width: '100%'}}/>

2. 「Set up the source」フォームを記入し、ソースに名前を付け、2022年1月のNYCタクシーファイルのURLを提供します（下記参照）。ファイル形式として`parquet`、ストレージプロバイダーとして`HTTPS Public Web`、データセット名として`nyc_taxi_2022`を選択してください。

	```text
	https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
	```

    <img src={require('./images/airbyte_05.png').default} class="image" alt="AirbyteでのClickHouseソースの作成"/>

3. おめでとうございます！これでAirbyteにソースファイルが追加されました。

## 4. 接続を作成し、データセットをClickHouseにロードする {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. Airbyte内で「Connections」ページを選択し、新しい接続を追加します。

	<img src={require('./images/airbyte_06.png').default} class="image" alt="Airbyteでの接続の追加" style={{width: '100%'}}/>

2. 「Use existing source」を選択し、ニューヨーク市タクシーデータを選択します。その後、「Use existing destination」を選択し、ClickHouseインスタンスを選択します。

3. 「Set up the connection」フォームを記入し、Replication Frequency（このチュートリアルでは`manual`を使用します）を選択し、同期したいストリームとして`nyc_taxi_2022`を選択します。Normalizationとして`Normalized Tabular Data`を選択してください。

	<img src={require('./images/airbyte_07.png').default} class="image" alt="Airbyteでの接続の作成"/>

4. 接続が作成されたら、「Sync now」をクリックしてデータのロードをトリガーします（Replication Frequencyに`Manual`を選択したため）。

	<img src={require('./images/airbyte_08.png').default} class="image" alt="AirbyteでのSync now" style={{width: '100%'}}/>

5. データのロードが開始され、Airbyteのログと進捗を表示することができます。操作が完了すると、ログに`Completed successfully`メッセージが表示されます:

	<img src={require('./images/airbyte_09.png').default} class="image" alt="完了メッセージ" style={{width: '100%'}}/>

6. お好みのSQLクライアントを使用してClickHouseインスタンスに接続し、結果のテーブルを確認します:

	```sql
	SELECT *
	FROM nyc_taxi_2022
	LIMIT 10
	```

	応答は次のようになります:
	```response
	Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

	┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
	│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
	│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
	│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
	│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
	│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
	│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
	└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
	```

	```sql
	SELECT count(*)
	FROM nyc_taxi_2022
	```

	応答は次のようになります:
	```response
	Query id: a9172d39-50f7-421e-8330-296de0baa67e

	┌─count()─┐
	│ 2392428 │
	└─────────┘
	```

7. Airbyteは自動的にデータ型を推測し、デスティネーションテーブルに4つのカラムを追加したことに注意してください。これらのカラムは、Airbyteがレプリケーションロジックを管理し、操作をログするために使用されています。詳細は<a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyte公式ドキュメント</a>を参照してください。

	```sql
	    `_airbyte_ab_id` String,
	    `_airbyte_emitted_at` DateTime64(3, 'GMT'),
	    `_airbyte_normalized_at` DateTime,
	    `_airbyte_nyc_taxi_072021_hashid` String
	```

	データセットがClickHouseインスタンスに読み込まれたので、新しいテーブルを作成し、より適切なClickHouseデータ型を使用できます（<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">詳細はこちら</a>）。

8. おめでとうございます。Airbyteを使用してNYCタクシーデータをClickHouseに正常にロードしました！
