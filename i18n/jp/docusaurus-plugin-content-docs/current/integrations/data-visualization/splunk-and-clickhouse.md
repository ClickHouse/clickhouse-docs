---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: 'Splunk ダッシュボードを ClickHouse に接続する'
title: 'Splunk を ClickHouse に接続する'
doc_type: 'guide'
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


# Splunk と ClickHouse を接続する

<ClickHouseSupportedBadge/>

:::tip
ClickHouse の監査ログを Splunk に保存したい場合は、「[Storing ClickHouse Cloud Audit logs into Splunk](/integrations/audit-splunk)」ガイドに従ってください。
:::

Splunk は、セキュリティおよびオブザーバビリティ分野で広く利用されているテクノロジーです。強力な検索およびダッシュボードエンジンとしても機能します。さまざまなユースケースに対応する何百種類もの Splunk アプリが提供されています。

ClickHouse 向けには、高性能な ClickHouse JDBC ドライバーと簡単に連携でき、ClickHouse 内のテーブルを直接クエリできる [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686) を活用します。

この連携の理想的なユースケースは、NetFlow、Avro や Protobuf のバイナリデータ、DNS、VPC フローログ、その他の OTEL ログといった大規模なデータソースに ClickHouse を利用し、それらを Splunk 上でチームと共有して検索やダッシュボード作成を行いたい場合です。このアプローチを用いることで、データは Splunk のインデックスレイヤーには取り込まれず、[Metabase](https://www.metabase.com/) や [Superset](https://superset.apache.org/) など他の可視化連携の場合と同様に、ClickHouse から直接クエリされます。



## Goal​ {#goal}

このガイドでは、ClickHouse JDBCドライバーを使用してClickHouseをSplunkに接続します。Splunk Enterpriseのローカル版をインストールしますが、データのインデックス化は行いません。代わりに、DB Connectクエリエンジンを通じて検索機能を使用します。

このガイドに従うことで、次のようなClickHouseに接続されたダッシュボードを作成できます:

<Image
  img={splunk_1}
  size='lg'
  border
  alt='NYCタクシーデータの可視化を表示するSplunkダッシュボード'
/>

:::note
このガイドでは[New York City Taxiデータセット](/getting-started/example-datasets/nyc-taxi)を使用します。[ドキュメント](http://localhost:3000/docs/getting-started/example-datasets)には、他にも使用できる多くのデータセットがあります。
:::


## 前提条件 {#prerequisites}

開始する前に、以下が必要です:

- サーチヘッド機能を使用するためのSplunk Enterprise
- OSまたはコンテナにインストールされた[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)の要件
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者権限またはSSHアクセス
- ClickHouseの接続情報(ClickHouse Cloudを使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照)


## Splunk EnterpriseへのDB Connectのインストールと設定 {#install-and-configure-db-connect-on-splunk-enterprise}

まず、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、`microdnf install java-11-openjdk`コマンドを使用できます。

`java_home`パスをメモしてください:`java -XshowSettings:properties -version`

DB Connect AppがSplunk Enterpriseにインストールされていることを確認してください。Splunk Web UIのAppsセクションで見つけることができます:

- Splunk Webにログインし、Apps > Find More Appsに移動します
- 検索ボックスを使用してDB Connectを検索します
- Splunk DB Connectの横にある緑色の「Install」ボタンをクリックします
- 「Restart Splunk」をクリックします

DB Connect Appのインストールに問題がある場合は、追加の手順について[このリンク](https://splunkbase.splunk.com/app/2686)を参照してください。

DB Connect Appがインストールされていることを確認したら、Configuration -> Settingsでjava_homeパスをDB Connect Appに追加し、保存してからリセットをクリックします。

<Image
  img={splunk_2}
  size='md'
  border
  alt='Java Home設定を表示するSplunk DB Connect設定ページ'
/>


## ClickHouse用JDBCの設定 {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバ](https://github.com/ClickHouse/clickhouse-java)を以下のようなDB Connect Driversフォルダにダウンロードします:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`の接続タイプ設定を編集し、ClickHouse JDBCドライバクラスの詳細を追加する必要があります。

ファイルに以下のスタンザを追加します:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

`$SPLUNK_HOME/bin/splunk restart`を使用してSplunkを再起動します。

DB Connect Appに戻り、Configuration > Settings > Driversに移動します。ClickHouseの横に緑色のチェックマークが表示されます:

<Image
  img={splunk_3}
  size='lg'
  border
  alt='ClickHouseドライバが正常にインストールされたことを示すSplunk DB Connectドライバページ'
/>


## SplunkサーチをClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connect App Configuration -> Databases -> Identities に移動し、ClickHouse用のIdentityを作成します。

Configuration -> Databases -> Connections から ClickHouse への新しい接続を作成し、「New Connection」を選択します。

<Image
  img={splunk_4}
  size='sm'
  border
  alt='Splunk DB Connect の新規接続ボタン'
/>

<br />

ClickHouseホストの詳細を追加し、「Enable SSL」にチェックが入っていることを確認します:

<Image
  img={splunk_5}
  size='md'
  border
  alt='ClickHouse用のSplunk接続設定ページ'
/>

接続を保存すると、SplunkからClickHouseへの接続が正常に完了します!

:::note
エラーが発生した場合は、SplunkインスタンスのIPアドレスがClickHouse CloudのIPアクセスリストに追加されていることを確認してください。詳細については[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::


## SQLクエリの実行 {#run-a-sql-query}

すべてが正常に動作することを確認するため、SQLクエリを実行します。

DB Connect AppのDataLabセクションにあるSQL Explorerで接続詳細を選択します。このデモでは`trips`テーブルを使用します:

<Image
  img={splunk_6}
  size='md'
  border
  alt='ClickHouseへの接続を選択するSplunk SQL Explorer'
/>

`trips`テーブルに対してSQLクエリを実行し、テーブル内の全レコード数を取得します:

<Image
  img={splunk_7}
  size='md'
  border
  alt='tripsテーブルのレコード数を表示するSplunk SQLクエリの実行'
/>

クエリが正常に実行されると、結果が表示されます。


## ダッシュボードの作成 {#create-a-dashboard}

SQLと強力なSplunk Processing Language（SPL）を組み合わせたダッシュボードを作成しましょう。

続行する前に、まず[DPLセーフガードを無効化](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)する必要があります。

乗車回数が最も多い上位10地区を表示する次のクエリを実行します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

可視化タブを選択して、作成された縦棒グラフを表示します：

<Image
  img={splunk_8}
  size='lg'
  border
  alt='上位10の乗車地区を示すSplunk縦棒グラフの可視化'
/>

「名前を付けて保存」>「ダッシュボードに保存」をクリックしてダッシュボードを作成します。

次に、乗客数に基づく平均運賃を表示するクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフの可視化を作成し、先ほどのダッシュボードに保存します。

<Image
  img={splunk_9}
  size='lg'
  border
  alt='乗客数別の平均運賃を示すSplunk棒グラフ'
/>

最後に、乗客数と移動距離の相関関係を示すクエリをもう1つ追加しましょう：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは次のようになります：

<Image
  img={splunk_10}
  size='lg'
  border
  alt='NYCタクシーデータの複数の可視化を含む最終的なSplunkダッシュボード'
/>


## 時系列データ {#time-series-data}

Splunkには、ダッシュボードで時系列データの可視化と表示に使用できる数百の組み込み関数が用意されています。この例では、SQLとSPLを組み合わせて、Splunkで時系列データを処理するクエリを作成します。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```


## 詳細情報 {#learn-more}

Splunk DB Connectおよびダッシュボードの構築方法の詳細については、[Splunkドキュメント](https://docs.splunk.com/Documentation)を参照してください。
