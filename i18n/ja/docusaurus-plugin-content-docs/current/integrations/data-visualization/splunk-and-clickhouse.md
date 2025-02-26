---
sidebar_label: Splunk
sidebar_position: 198
slug: /integrations/splunk
keywords: [Splunk, integration, data visualization]
description: ClickHouseにSplunkのダッシュボードを接続する
---

# SplunkをClickHouseに接続する

Splunkはセキュリティや監視に人気のある技術であり、強力な検索およびダッシュボードエンジンです。さまざまなユースケースに対応するために数百のSplunkアプリが利用可能です。

特にClickHouseに関しては、高速なClickHouse JDBCドライバーを利用して、ClickHouse内のテーブルに直接クエリを投げるシンプルな統合を提供する[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)を活用しています。

この統合の理想的なユースケースは、NetFlow、AvroまたはProtobufのバイナリデータ、DNS、VPCフローログ、その他のOTELログなどの大規模データソースにClickHouseを使用する場合です。このデータをSplunkで検索し、ダッシュボードを作成することができます。このアプローチを使用することで、データはSplunkのインデックス層に取り込まれず、他の視覚化統合（[Metabase](https://www.metabase.com/)や[Superset](https://superset.apache.org/)など）と同様にClickHouseから直接クエリを実行します。

## 目標​ {#goal}

このガイドでは、ClickHouse JDBCドライバーを使用してClickHouseをSplunkに接続します。ローカル版のSplunk Enterpriseをインストールしますが、データをインデックス化することはありません。代わりに、DB Connectクエリエンジンを通じて検索機能を使用します。

このガイドを使用すると、次のようにClickHouseに接続されたダッシュボードを作成することができます：

![Splunk 1](../images/splunk/splunk-1.png)

:::note
このガイドでは、[ニューヨーク市タクシーデータセット](/getting-started/example-datasets/nyc-taxi)を使用しています。他にも[ドキュメント](http://localhost:3000/docs/getting-started/example-datasets)から使えるデータセットが多数あります。
:::

## 必要条件 {#prerequisites}

始める前に必要なもの：
- 検索ヘッド機能を使用するためのSplunk Enterprise
- OSまたはコンテナにインストールされた[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)の要件
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者またはSSHアクセス
- ClickHouse接続の詳細（[こちら](/integrations/metabase#1-gather-your-connection-details)を参照、ClickHouse Cloudを使用している場合）

## Splunk EnterpriseにDB Connectをインストールして構成する {#install-and-configure-db-connect-on-splunk-enterprise}

まず、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、`microdnf install java-11-openjdk`コマンドを使用できます。

`java_home`パスをメモしてください：`java -XshowSettings:properties -version`。

DB Connect AppがSplunk Enterpriseにインストールされていることを確認してください。Splunk Web UIのAppsセクションに見つかります。
- Splunk Webにログインし、Apps > Find More Appsに移動します
- 検索ボックスを使用してDB Connectを探します
- Splunk DB Connectの隣にある緑の「Install」ボタンをクリックします
- 「Restart Splunk」をクリックします

DB Connect Appのインストールに問題がある場合は、[こちらのリンク](https://splunkbase.splunk.com/app/2686)を参照して追加の指示を確認してください。

DB Connect Appがインストールされていることを確認したら、Configuration -> Settingsで`java_home`パスをDB Connect Appに追加し、保存してリセットをクリックします。

![Splunk 2](../images/splunk/splunk-2.png)

## ClickHouseのためのJDBCを構成する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)をDB Connect Driversフォルダにダウンロードします。場所は以下の通りです：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、接続タイプの設定を`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`で編集し、ClickHouse JDBCドライバーのクラス詳細を追加します。

ファイルに以下のセクションを追加します：

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

DB Connect Appに戻り、Configuration > Settings > Driversに移動します。ClickHouseの隣に緑のチェックマークが表示されます：

![Splunk 3](../images/splunk/splunk-3.png)

## Splunk検索をClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connect AppのConfiguration -> Databases -> Identitiesに移動し、ClickHouse用のアイデンティティを作成します。

Configuration -> Databases -> ConnectionsからClickHouseへの新しい接続を作成し、「New Connection」を選択します。

<img width="100" style={{width: '250px'}} src={require('../images/splunk/splunk-4.png').default} class="image"/>

<br />

ClickHouseのホスト詳細を追加し、「Enable SSL」が選択されていることを確認します：

![Splunk 5](../images/splunk/splunk-5.png)

接続を保存すると、ClickHouseとSplunkの接続に成功します！

:::note
エラーが発生した場合は、ClickHouse Cloud IPアクセスリストにSplunkインスタンスのIPアドレスを追加していることを確認してください。詳細は[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::

## SQLクエリを実行する {#run-a-sql-query}

すべてが機能していることを確認するために、SQLクエリを実行します。

DB Connect AppのDataLabセクションから接続詳細を選択します。このデモでは`trips`テーブルを使用します：

![Splunk 6](../images/splunk/splunk-6.png)

`trips`テーブルに対して全レコードのカウントを返すSQLクエリを実行します：

![Splunk 7](../images/splunk/splunk-7.png)

クエリが成功すると、結果が表示されます。

## ダッシュボードを作成する {#create-a-dashboard}

SQLと強力なSplunk処理言語(SPL)を組み合わせたダッシュボードを作成します。

進める前に、まず[デフォルトのDPL保護を無効化](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)する必要があります。

次のクエリを実行して、最も頻繁にピックアップされるトップ10の地域を表示します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

可視化タブを選択して、作成されたカラムチャートを表示します：

![Splunk 8](../images/splunk/splunk-8.png)

「Save As > Save to a Dashboard」をクリックしてダッシュボードを作成します。

次に、乗客の数に基づいて平均運賃を示す別のクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount) 
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフの可視化を作成して、前のダッシュボードに保存します。

![Splunk 9](../images/splunk/splunk-9.png)

最後に、乗客の数と旅行距離の相関を示すもう一つのクエリを追加します：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(*) FROM default.trips
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;" connection="chc"
```

最終的なダッシュボードは次のようになります：

![Splunk 10](../images/splunk/splunk-10.png)

## 時系列データ {#time-series-data}

Splunkには、ダッシュボードが時系列データの視覚化やプレゼンテーションに使用できる数百の組み込み関数があります。この例では、SQL + SPLを組み合わせて、Splunk内で時系列データを扱えるクエリを作成します。

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

Splunk DB Connectに関する詳細やダッシュボードの作成方法については、[Splunkのドキュメント](https://docs.splunk.com/Documentation)をご覧ください。
