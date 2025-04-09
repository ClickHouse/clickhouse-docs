---
sidebar_label: Splunk
sidebar_position: 198
slug: /integrations/splunk
keywords: [Splunk, integration, data visualization]
description: SplunkダッシュボードをClickHouseに接続する
---

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


# SplunkをClickHouseに接続する

Splunkは、セキュリティおよび可観測性に関する人気のある技術です。また、強力な検索およびダッシュボードエンジンでもあります。さまざまなユースケースに対応する数百のSplunkアプリが利用可能です。

ClickHouseに関しては、[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)を活用しており、高性能なClickHouse JDBCドライバーとのシンプルな統合を提供しており、ClickHouseのテーブルに直接クエリを実行できます。

この統合の理想的なユースケースは、ClickHouseをNetFlow、AvroまたはProtobufバイナリデータ、DNS、VPCフローログ、その他のOTELログなどの大規模データソースに使用している場合です。これにより、データがSplunkのインデックス層に取り込まれることはなく、ClickHouseから直接クエリが実行され、[Metabase](https://www.metabase.com/)や[Superset](https://superset.apache.org/)などの他の可視化統合と同様になります。

## 目標​ {#goal}

このガイドでは、ClickHouse JDBCドライバーを使用してClickHouseをSplunkに接続します。ローカルバージョンのSplunk Enterpriseをインストールしますが、データのインデックスは行いません。代わりに、DB Connectクエリエンジンを介して検索機能を使用します。

このガイドを使用することで、次のようなClickHouseに接続されたダッシュボードを作成できるようになります。

<img src={splunk_1} class="image" alt="Splunk"/>

:::note
このガイドでは、[New York City Taxi dataset](/getting-started/example-datasets/nyc-taxi)を使用しています。他にも[当社のドキュメント](http://localhost:3000/docs/getting-started/example-datasets)から使用できるデータセットが多数あります。
:::

## 前提条件 {#prerequisites}

始める前に、次のものが必要です:
- 検索ヘッド機能を使用するためのSplunk Enterprise
- OSまたはコンテナに[JAVAランタイム環境 (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)の要件をインストールする
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者またはSSHアクセス
- ClickHouse接続の詳細 (ClickHouse Cloudを使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照)

## Splunk EnterpriseにDB Connectをインストールおよび構成する {#install-and-configure-db-connect-on-splunk-enterprise}

最初に、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、コマンド `microdnf install java-11-openjdk`を使用できます。

`java_home`パスをメモしてください: `java -XshowSettings:properties -version`。

DB Connect AppがSplunk Enterpriseにインストールされていることを確認してください。Splunk Web UIのアプリセクションで見つけることができます：
- Splunk Webにログインし、「Apps」>「Find More Apps」に移動
- 検索ボックスでDB Connectを検索
- Splunk DB Connectの隣にある緑の「Install」ボタンをクリック
- 「Restart Splunk」をクリック

DB Connect Appのインストールで問題が発生した場合は、[こちらのリンク](https://splunkbase.splunk.com/app/2686)を参照して追加の指示を確認してください。

DB Connect Appがインストールされていることを確認したら、java_homeパスをDB Connect AppのConfiguration -> Settingsに追加し、保存してからリセットします。

<img src={splunk_2} class="image" alt="Splunk 2"/>

## ClickHouseのためにJDBCを構成する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)をDB Connect Driversフォルダーにダウンロードします。例：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`で接続タイプの構成を編集し、ClickHouse JDBCドライバーのクラス詳細を追加する必要があります。

ファイルに次のスタンザを追加します：

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

DB Connect Appに戻り、Configuration > Settings > Driversに移動します。ClickHouseの隣に緑のチェックマークが表示されるはずです：

<img src={splunk_3} class="image" alt="Splunk 3"/>

## Splunk検索をClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connect AppのConfiguration -> Databases -> Identitiesに移動し、ClickHouseのためのIdentityを作成します。

Configuration -> Databases -> ConnectionsからClickHouseへの新しい接続を作成し、「New Connection」を選択します。

<img width="100" style={{width: '250px'}} src={splunk_4} class="image"/>

<br />

ClickHouseホストの詳細を追加し、「Enable SSL」にチェックが入っていることを確認します：

<img src={splunk_5} class="image" alt="Splunk 5"/>

接続を保存すると、ClickHouseとSplunkが正常に接続されます！

:::note
エラーが表示された場合は、SplunkインスタンスのIPアドレスをClickHouse CloudのIPアクセスリストに追加したことを確認してください。詳しくは[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::

## SQLクエリを実行する {#run-a-sql-query}

すべてが正常に動作するかを確認するために、SQLクエリを実行します。

DB Connect AppのDataLabセクションから接続詳細を選択します。デモでは`trips`テーブルを使用しています：

<img src={splunk_6} class="image" alt="Splunk 6"/>

`trips`テーブルに対して、テーブル内のすべてのレコードのカウントを返すSQLクエリを実行します：

<img src={splunk_7} class="image" alt="Splunk 7"/>

クエリが成功すると、結果が表示されるはずです。

## ダッシュボードを作成する {#create-a-dashboard}

SQLと強力なSplunk Processing Language (SPL)を組み合わせたダッシュボードを作成しましょう。

続行する前に、最初に[DPLのセーフガードを無効にする](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)必要があります。

最も頻繁にピックアップされる上位10の地域を示すクエリを実行します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

視覚化タブを選択して作成されたカラムチャートを表示します：

<img src={splunk_8} class="image" alt="Splunk 8"/>

「Save As > Save to a Dashboard」をクリックしてダッシュボードを作成します。

乗客数に基づく平均運賃を示す別のクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフの視覚化を作成して以前のダッシュボードに保存します。

<img src={splunk_9} class="image" alt="Splunk 9"/>

最後に、乗客数と旅行距離の相関関係を示すもう1つのクエリを追加します：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(*) FROM default.trips
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは次のようになります：

<img src={splunk_10} class="image" alt="Splunk 10"/>

## 時系列データ {#time-series-data}

Splunkには、時系列データの視覚化や表示に使用できる数百の組み込み関数があります。この例では、SQL + SPLを組み合わせて、Splunkの時系列データに対応できるクエリを作成します。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## さらに学ぶ {#learn-more}

Splunk DB Connectやダッシュボードの作成方法についての詳細情報を知りたい場合は、[Splunkのドキュメント](https://docs.splunk.com/Documentation)を訪れてください。
