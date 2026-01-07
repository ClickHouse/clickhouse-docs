---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', '連携', 'データ可視化']
description: 'Splunk ダッシュボードを ClickHouse に接続する'
title: 'Splunk を ClickHouse に接続する'
doc_type: 'guide'
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

# Splunk を ClickHouse に接続する {#connecting-splunk-to-clickhouse}

<ClickHouseSupportedBadge/>

:::tip
ClickHouse の監査ログを Splunk に保存したい場合は、「[ClickHouse Cloud の監査ログを Splunk に保存する](/integrations/audit-splunk)」ガイドに従ってください。
:::

Splunk は、セキュリティとオブザーバビリティの分野で広く利用されているプラットフォームであり、強力な検索およびダッシュボードエンジンでもあります。さまざまなユースケースに対応する何百もの Splunk アプリが提供されています。

ClickHouse 向けには、[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686) を利用します。これは高性能な ClickHouse JDBC ドライバーとシンプルに連携し、ClickHouse 内のテーブルを直接クエリできます。

この連携の代表的なユースケースは、NetFlow、Avro や Protobuf のバイナリデータ、DNS、VPC フローログ、その他の OTel ログなどの大規模データソースに ClickHouse を利用し、それらを Splunk 上でチームと共有して検索やダッシュボード作成を行う場合です。このアプローチでは、データは Splunk のインデックス層に取り込まれず、[Metabase](https://www.metabase.com/) や [Superset](https://superset.apache.org/) などの他の可視化ツール連携と同様に、ClickHouse から直接クエリされます。

## 目的​ {#goal}

このガイドでは、ClickHouse JDBC ドライバーを使用して ClickHouse を Splunk に接続します。ローカル環境に Splunk Enterprise をインストールしますが、データのインデックス作成は行いません。その代わりに、DB Connect のクエリエンジン経由で検索機能を使用します。

このガイドに従うことで、次のように ClickHouse に接続されたダッシュボードを作成できるようになります。

<Image img={splunk_1} size="lg" border alt="NYC タクシーデータの可視化を表示している Splunk ダッシュボード" />

:::note
このガイドでは [New York City Taxi データセット](/getting-started/example-datasets/nyc-taxi) を使用します。[ドキュメント](http://localhost:3000/docs/getting-started/example-datasets)には、利用できる他の多くのデータセットもあります。
:::

## 前提条件 {#prerequisites}

開始する前に、次のものが必要です:

- サーチヘッド機能を使用するための Splunk Enterprise
- OS またはコンテナ上にインストールされた、[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) の要件を満たす環境
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise を実行している OS インスタンスへの管理者権限または SSH アクセス
- ClickHouse の接続情報（ClickHouse Cloud を使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照）

## Splunk Enterprise で DB Connect をインストールして設定する {#install-and-configure-db-connect-on-splunk-enterprise}

まず、Splunk Enterprise インスタンスに Java Runtime Environment をインストールする必要があります。Docker を使用している場合は、`microdnf install java-11-openjdk` コマンドを実行します。

`java_home` のパスを控えておきます: `java -XshowSettings:properties -version`。

Splunk Enterprise に DB Connect App がインストールされていることを確認します。これは Splunk Web UI の Apps セクションで確認できます:
- Splunk Web にログインし、Apps > Find More Apps に移動する
- 検索ボックスで DB Connect を検索する
- Splunk DB Connect の横にある緑色の「Install」ボタンをクリックする
- 「Restart Splunk」をクリックする

DB Connect App のインストールで問題が発生している場合は、追加の手順については [このリンク](https://splunkbase.splunk.com/app/2686) を参照してください。

DB Connect App がインストールされていることを確認したら、[Configuration] -> [Settings] で DB Connect App に `java_home` のパスを追加し、「Save」をクリックしてから「Reset」を実行します。

<Image img={splunk_2} size="md" border alt="Java Home の設定が表示されている Splunk DB Connect 設定ページ" />

## ClickHouse 向けに JDBC を設定する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) をダウンロードし、次のような DB Connect Drivers フォルダに配置します：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

その後、ClickHouse JDBC Driver クラスの詳細を追加するために、`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` の接続タイプ設定を編集する必要があります。

次のセクションをファイルに追加します:

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

`$SPLUNK_HOME/bin/splunk restart` コマンドを実行して Splunk を再起動します。

DB Connect App に戻り、Configuration &gt; Settings &gt; Drivers に移動します。ClickHouse の横に緑色のチェックマークが表示されているはずです。

<Image img={splunk_3} size="lg" border alt="ClickHouse ドライバーが正常にインストールされていることを示す Splunk DB Connect の Drivers ページ" />


## Splunk の検索を ClickHouse に接続する {#connect-splunk-search-to-clickhouse}

DB Connect App の Configuration から Databases -> Identities に移動し、ClickHouse 用の Identity を作成します。

Configuration -> Databases -> Connections から ClickHouse への新しい Connection を作成し、"New Connection" を選択します。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect の新規接続ボタン" />

<br />

ClickHouse ホストの情報を入力し、"Enable SSL" にチェックが入っていることを確認します。

<Image img={splunk_5} size="md" border alt="ClickHouse 用の Splunk 接続設定ページ" />

接続を保存すると、Splunk から ClickHouse への接続が正常に完了します。

:::note
エラーが発生した場合は、Splunk インスタンスの IP アドレスを ClickHouse Cloud の IP Access List に追加しているか確認してください。詳細は [ドキュメント](/cloud/security/setting-ip-filters) を参照してください。
:::

## SQL クエリを実行する {#run-a-sql-query}

ここでは、すべてが正しく動作していることを確認するために SQL クエリを実行します。

DB Connect App の DataLab セクションにある SQL Explorer で、接続先を選択します。このデモでは `trips` テーブルを使用します。

<Image img={splunk_6} size="md" border alt="ClickHouse への接続を選択している Splunk SQL Explorer" />

`trips` テーブルに対して、テーブル内の全レコード数を返す SQL クエリを実行します。

<Image img={splunk_7} size="md" border alt="trips テーブルのレコード数を表示する Splunk SQL クエリ実行画面" />

クエリが成功すると、結果が表示されます。

## ダッシュボードを作成する {#create-a-dashboard}

SQL と強力な Splunk Processing Language (SPL) を組み合わせて活用するダッシュボードを作成します。

先に進む前に、まず [Deactivate DPL Safeguards](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards) に従って SPL のセーフガードを無効化しておく必要があります。

次のクエリを実行して、最も頻繁にピックアップが行われている上位 10 の地区を表示します。

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

作成された縦棒グラフを表示するには、[Visualization] タブを選択します。

<Image img={splunk_8} size="lg" border alt="上位 10 件の乗車地区（pickup neighborhoods）を示す Splunk の縦棒グラフの可視化" />

次に、[Save As] &gt; [Save to a Dashboard] をクリックして、ダッシュボードを作成します。

続いて、乗客数に基づく平均運賃を表示する別のクエリを追加します。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフの可視化を作成し、先ほどのダッシュボードに保存しましょう。

<Image img={splunk_9} size="lg" border alt="Splunk の棒グラフで、乗客数ごとの平均運賃を表示している例" />

最後に、乗客数と走行距離の相関関係を示すクエリをもう 1 つ追加します。

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは以下のようになります。

<Image img={splunk_10} size="lg" border alt="NYC タクシーデータの複数の可視化を含む最終的な Splunk ダッシュボード" />


## 時系列データ {#time-series-data}

Splunk には、ダッシュボードで時系列データの可視化や表示に利用できる組み込み関数が数百用意されています。ここでは、SQL と SPL を組み合わせて、Splunk で時系列データを扱えるクエリを作成する例を示します。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```


## さらに詳しく知る {#learn-more}

Splunk DB Connect およびダッシュボードの作成方法の詳細については、[Splunk ドキュメント](https://docs.splunk.com/Documentation)を参照してください。