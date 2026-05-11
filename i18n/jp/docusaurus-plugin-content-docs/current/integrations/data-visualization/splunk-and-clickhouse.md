---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', '連携', 'データ可視化']
description: 'Splunk ダッシュボードを ClickHouse と接続する'
title: 'Splunk と ClickHouse を接続する'
doc_type: 'ガイド'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import splunk_1 from '@site/static/images/integrations/splunk/splunk-1.png';
import splunk_2 from '@site/static/images/integrations/splunk/splunk-2.png';
import splunk_3 from '@site/static/images/integrations/splunk/splunk-3.png';
import splunk_4 from '@site/static/images/integrations/splunk/splunk-4.png';
import splunk_5 from '@site/static/images/integrations/splunk/splunk-5.png';
import splunk_6 from '@site/static/images/integrations/splunk/splunk-6.png';
import splunk_7 from '@site/static/images/integrations/splunk/splunk-7.png';
import splunk_8 from '@site/static/images/integrations/splunk/splunk-8.png';
import splunk_9 from '@site/static/images/integrations/splunk/splunk-9.png';
import splunk_10 from '@site/static/images/integrations/splunk/splunk-10.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Splunk と ClickHouse の接続 \{#connecting-splunk-to-clickhouse\}

<ClickHouseSupportedBadge/>

:::tip
ClickHouse Cloud の監査ログを Splunk に保存したい場合は、["Storing ClickHouse Cloud Audit logs into Splunk"](/integrations/audit-splunk) ガイドに従ってください。
:::

Splunk は、セキュリティおよびオブザーバビリティ向けに広く利用されているプラットフォームです。また、強力な検索およびダッシュボードエンジンでもあります。さまざまなユースケースに対応する数百もの Splunk アプリが提供されています。

ClickHouse 向けには、[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686) を活用します。これは高性能な ClickHouse JDBC ドライバーと容易に統合でき、ClickHouse のテーブルを直接クエリできます。

この統合の理想的なユースケースは、NetFlow、Avro や Protobuf バイナリデータ、DNS、VPC フローログ、その他の OTel ログといった大規模なデータソースに ClickHouse を使用している場合です。これらを Splunk 上でチームと共有して検索やダッシュボード作成を行えます。このアプローチでは、データは Splunk のインデックス層には取り込まれず、[Metabase](https://www.metabase.com/) や [Superset](https://superset.apache.org/) などの他の可視化ツールとの連携と同様に、単に ClickHouse から直接クエリされます。

## 目標​ \{#goal\}

このガイドでは、ClickHouse JDBC ドライバーを使用して ClickHouse を Splunk に接続します。ローカル環境に Splunk Enterprise をインストールしますが、ここでは Splunk 側でデータをインデックスしません。その代わりに、DB Connect のクエリエンジン経由で検索機能を利用します。

このガイドに従うことで、次のように ClickHouse に接続されたダッシュボードを作成できるようになります。

<Image img={splunk_1} size="lg" border alt="NYC タクシーデータの可視化を表示する Splunk ダッシュボード" />

:::note
このガイドでは [New York City Taxi データセット](/getting-started/example-datasets/nyc-taxi) を使用します。[ドキュメント](http://localhost:3000/docs/getting-started/example-datasets)には、他にも利用可能なデータセットが多数あります。
:::

## 前提条件 \{#prerequisites\}

作業を開始する前に、次のものが必要です:

- Search Head 機能を利用するための Splunk Enterprise
- OS またはコンテナ上に、[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) の要件を満たす環境がインストールされていること
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise が稼働している OS への管理者権限または SSH アクセス
- ClickHouse の接続情報（ClickHouse Cloud を使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照）

## Splunk Enterprise に DB Connect をインストールして設定する \{#install-and-configure-db-connect-on-splunk-enterprise\}

まず、Splunk Enterprise インスタンスに Java ランタイム環境 (Java Runtime Environment) をインストールする必要があります。Docker を使用している場合は、`microdnf install java-11-openjdk` コマンドを使用できます。

`java_home` パスを控えておいてください: `java -XshowSettings:properties -version`。

Splunk Enterprise に DB Connect App がインストールされていることを確認してください。Splunk Web UI の Apps セクションで確認できます。

- Splunk Web にログインし、Apps > Find More Apps に移動します
- 検索ボックスを使用して DB Connect を探します
- Splunk DB Connect の横にある緑色の「Install」ボタンをクリックします
- 「Restart Splunk」をクリックします

DB Connect App のインストールに問題がある場合は、追加の手順について [このリンク](https://splunkbase.splunk.com/app/2686) を参照してください。

DB Connect App がインストールされていることを確認したら、Configuration -> Settings で DB Connect App に java_home パスを追加し、「Save」をクリックしてから「Reset」を実行します。

<Image img={splunk_2} size="md" border alt="Java Home 設定を表示している Splunk DB Connect 設定ページ" />

## ClickHouse 用 JDBC を設定する \{#configure-jdbc-for-clickhouse\}

[ClickHouse JDBC ドライバーの JAR ファイル](https://github.com/ClickHouse/clickhouse-java/releases/) をダウンロードし、次の場所にある DB Connect Drivers フォルダーにコピーします。

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

DB Connect アプリで必須の依存関係をすべて利用可能にするために、次のいずれかをダウンロードします:

```text
- clickhouse-jdbc-<VERSION>-shaded-all.jar (if VERSION < 0.9.0)
- clickhouse-jdbc-<VERSION>-all-dependencies.jar (if VERSION >= 0.9.0)
```

次に、ClickHouse JDBC Driver のクラス情報を追加するために、`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/local/db_connection_types.conf` の接続タイプ設定を編集する必要があります。`db_connection_types.conf` に次のスタンザを追加します：

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

`$SPLUNK_HOME/bin/splunk restart` を実行して Splunk を再起動します。

DB Connect App に戻り、Configuration &gt; Settings &gt; Drivers に移動します。ClickHouse の横に緑色のチェックマークが表示されていることを確認します。

<Image img={splunk_3} size="lg" border alt="ClickHouse ドライバーが正常にインストールされたことを示す Splunk DB Connect drivers ページ" />


## Splunk の検索を ClickHouse に接続する \{#connect-splunk-search-to-clickhouse\}

DB Connect App Configuration -> Databases -> Identities に移動し、ClickHouse 用の Identity を作成します。

Configuration -> Databases -> Connections から ClickHouse への新しい Connection を作成し、"New Connection" を選択します。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect の新しい接続ボタン" />

<br />

ClickHouse ホスト情報を入力し、"Enable SSL" にチェックが入っていることを確認します:

<Image img={splunk_5} size="md" border alt="ClickHouse 用の Splunk 接続設定ページ" />

接続を保存すると、ClickHouse と Splunk の接続が完了します。

:::note
エラーが発生した場合は、Splunk インスタンスの IP アドレスを ClickHouse Cloud の IP Access List に追加していることを確認してください。詳細は [ドキュメント](/cloud/security/setting-ip-filters) を参照してください。
:::

## SQL クエリを実行する \{#run-a-sql-query\}

これから SQL クエリを実行して、すべてが正しく動作していることを確認します。

DB Connect App の DataLab セクションにある SQL Explorer で接続先を選択します。このデモでは `trips` テーブルを使用します:

<Image img={splunk_6} size="md" border alt="ClickHouse への接続を選択している Splunk SQL Explorer" />

`trips` テーブルに対して、テーブル内の全レコード件数を返す SQL クエリを実行します:

<Image img={splunk_7} size="md" border alt="trips テーブルのレコード数を表示する Splunk SQL クエリ実行画面" />

クエリが成功すると、結果が表示されます。

## ダッシュボードを作成する \{#create-a-dashboard\}

SQL と強力な Splunk Processing Language (SPL) を組み合わせて活用するダッシュボードを作成してみましょう。

続行する前に、まず [Deactivate DPL Safeguards](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards) を無効化する必要があります。

次のクエリを実行して、ピックアップ回数が最も多い地区の上位 10 件を表示します。

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

[Visualization] タブを選択して、作成された棒グラフを表示します。

<Image img={splunk_8} size="lg" border alt="上位 10 件の pickup neighborhood を表示している Splunk の棒グラフによるビジュアライゼーション" />

次に、「Save As」&gt;「Save to a Dashboard」をクリックしてダッシュボードを作成します。

乗客数ごとの平均運賃を表示する別のクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフの可視化を作成し、先ほどのダッシュボードに保存します。

<Image img={splunk_9} size="lg" border alt="乗客数別の平均運賃を示す Splunk の棒グラフ" />

最後に、乗客数と乗車距離の相関関係を示すクエリをもう 1 つ追加してみましょう。

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは以下のようになります。

<Image img={splunk_10} size="lg" border alt="NYC タクシーデータに対する複数の可視化を含む最終的な Splunk ダッシュボード" />


## 時系列データ \{#time-series-data\}

Splunk には、ダッシュボードで時系列データの可視化や表示に利用できる数百もの組み込み関数があります。次の例では、Splunk で時系列データを扱うためのクエリを作成するために、SQL と SPL を組み合わせます。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```


## 詳細情報 \{#learn-more\}

Splunk DB Connect の詳細やダッシュボードの作成方法については、[Splunk のドキュメント](https://docs.splunk.com/Documentation)を参照してください。