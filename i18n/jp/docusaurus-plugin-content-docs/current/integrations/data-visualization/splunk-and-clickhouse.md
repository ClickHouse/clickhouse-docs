---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': 'Connect Splunk dashboards to ClickHouse'
'title': 'Connecting Splunk to ClickHouse'
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


# SplunkをClickHouseに接続する

<ClickHouseSupportedBadge/>

Splunkは、セキュリティとオブザーバビリティのための人気のある技術です。また、強力な検索とダッシュボードエンジンでもあります。さまざまなユースケースに対応する数百のSplunkアプリがあります。

特にClickHouseの場合、非常に高性能なClickHouse JDBCドライバを使用して、ClickHouse内のテーブルを直接クエリできるシンプルな統合を提供する[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)を活用しています。

この統合の理想的なユースケースは、NetFlow、AvroまたはProtobufバイナリデータ、DNS、VPCフローログ、その他のOTELログといった大規模なデータソースにClickHouseを使用している時です。データはSplunkのインデックス層には取り込まれず、[Metabase](https://www.metabase.com/)や[Superset](https://superset.apache.org/)などの他のビジュアライゼーション統合と同様に、ClickHouseから直接クエリされます。

## 目的​ {#goal}

このガイドでは、ClickHouse JDBCドライバを使用してClickHouseをSplunkに接続します。ローカルのSplunk Enterpriseをインストールしますが、データはインデックスしません。代わりに、DB Connectクエリエンジンを介して検索機能を使用しています。

このガイドを使えば、次のようなClickHouseに接続したダッシュボードを作成できるようになります：

<Image img={splunk_1} size="lg" border alt="Splunk dashboard showing NYC taxi data visualizations" />

:::note
このガイドでは[ニューヨーク市のタクシーデータセット](/getting-started/example-datasets/nyc-taxi)を使用しています。他にも[私たちのドキュメント](http://localhost:3000/docs/getting-started/example-datasets)から使用できるデータセットがたくさんあります。
:::

## 前提条件 {#prerequisites}

始める前に、以下が必要です：
- 検索ヘッド機能を使用するためのSplunk Enterprise
- OSまたはコンテナにインストールされた[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)要件
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者またはSSHアクセス
- ClickHouse接続詳細（ClickHouse Cloudを使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照）

## Splunk EnterpriseにDB Connectをインストールして構成する {#install-and-configure-db-connect-on-splunk-enterprise}

まず、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、`microdnf install java-11-openjdk`コマンドを使用できます。

`java_home`パスをメモしてください：`java -XshowSettings:properties -version`。

DB Connect AppがSplunk Enterpriseにインストールされていることを確認してください。Splunk Web UIのアプリセクションで見つけることができます：
- Splunk Webにログインし、Apps > Find More Appsに移動
- 検索ボックスを使用してDB Connectを検索
- Splunk DB Connectの横にある緑の「インストール」ボタンをクリック
- 「Splunkを再起動」をクリック

DB Connect Appのインストールに問題がある場合は、追加の手順について[こちらのリンク](https://splunkbase.splunk.com/app/2686)を参照してください。

DB Connect Appがインストールされていることを確認したら、DB Connect AppのConfiguration -> Settingsにjava_homeパスを追加し、保存してリセットをクリックします。

<Image img={splunk_2} size="md" border alt="Splunk DB Connect settings page showing Java Home configuration" />

## ClickHouse用にJDBCを構成する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバ](https://github.com/ClickHouse/clickhouse-java)をDB Connect Driversフォルダにダウンロードします。例えば：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、接続タイプ構成を編集し、ClickHouse JDBCドライバクラスの詳細を`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`に追加します。

次のスタンザをファイルに追加します：

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

再度DB Connect Appに移動し、Configuration > Settings > Driversに移動します。ClickHouseの横に緑のチェックマークが表示されるはずです：

<Image img={splunk_3} size="lg" border alt="Splunk DB Connect drivers page showing ClickHouse driver successfully installed" />

## Splunk検索をClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connect App Configuration -> Databases -> Identitiesに移動し、ClickHouse用のアイデンティティを作成します。

Configuration -> Databases -> ConnectionsからClickHouseへの新しい接続を作成し、「新しい接続」を選択します。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect new connection button" />

<br />

ClickHouseホストの詳細を追加し、「SSLを有効にする」がチェックされていることを確認します：

<Image img={splunk_5} size="md" border alt="Splunk connection configuration page for ClickHouse" />

接続を保存した後、ClickHouseにSplunkを接続できたことになります！

:::note
エラーが発生した場合は、SplunkインスタンスのIPアドレスをClickHouse Cloud IPアクセスリストに追加したことを確認してください。詳細については[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::

## SQLクエリを実行する {#run-a-sql-query}

すべてが正常に機能するか確認するために、SQLクエリを実行します。

DB Connect AppのDataLabセクションから接続詳細をSQLエクスプローラーで選択します。このデモでは`trips`テーブルを使用しています：

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer selecting connection to ClickHouse" />

`trips`テーブルのすべてのレコードの数を返すSQLクエリを実行します：

<Image img={splunk_7} size="md" border alt="Splunk SQL query execution showing count of records in trips table" />

クエリが成功すれば、結果が表示されるはずです。

## ダッシュボードを作成する {#create-a-dashboard}

SQLと強力なSplunk Processing Language (SPL)を組み合わせたダッシュボードを作成しましょう。

続行する前に、最初に[SPL保護を無効にする](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)必要があります。

最も頻繁にピックアップされる上位10の地域を示す以下のクエリを実行します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

ビジュアライゼーションタブを選択して作成されたカラムチャートを表示します：

<Image img={splunk_8} size="lg" border alt="Splunk column chart visualization showing top 10 pickup neighborhoods" />

「名前を付けて保存」>「ダッシュボードに保存」をクリックしてダッシュボードを作成します。

乗客数に基づいて平均料金を示す別のクエリを追加します。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回はバー チャートビジュアライゼーションを作成し、以前のダッシュボードに保存します。

<Image img={splunk_9} size="lg" border alt="Splunk bar chart showing average fare by passenger count" />

最後に、乗客数と移動距離の相関関係を示すもう1つのクエリを追加します：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは次のようになります：

<Image img={splunk_10} size="lg" border alt="Final Splunk dashboard with multiple visualizations of NYC taxi data" />

## 時系列データ {#time-series-data}

Splunkには、ダッシュボードが時系列データの視覚化とプレゼンテーションに使用できる数百の組み込み関数があります。この例では、SQL + SPLを組み合わせて、Splunkの時系列データで機能するクエリを作成します。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## 詳細を学ぶ {#learn-more}

Splunk DB Connectとダッシュボードを作成する方法について詳しく知りたい場合は、[Splunkドキュメント](https://docs.splunk.com/Documentation)を訪問してください。
