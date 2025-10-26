---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': 'SplunkダッシュボードをClickHouseに接続する'
'title': 'SplunkをClickHouseに接続する'
'doc_type': 'guide'
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

Splunkは、セキュリティと可観測性のための人気技術です。また、強力な検索およびダッシュボードエンジンでもあります。異なるユースケースに対処するための数百のSplunkアプリが存在します。

特にClickHouseに関しては、[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)を利用しており、高性能なClickHouse JDBCドライバとの簡単な統合を通じてClickHouse内のテーブルを直接クエリできます。

この統合の理想的なユースケースは、ClickHouseをNetFlow、AvroまたはProtobufバイナリデータ、DNS、VPCフローログ、そしてSplunkで検索しダッシュボードを作成できる他のOTELログなどの大規模データソースに使用している場合です。このアプローチを使用することにより、データはSplunkのインデックスレイヤに取り込まれず、ClickHouseから直接クエリされます。他の可視化統合（例えば、[Metabase](https://www.metabase.com/)や[Superset](https://superset.apache.org/)）と同様です。

## 目的​ {#goal}

このガイドでは、ClickHouse JDBCドライバを使用してClickHouseをSplunkに接続します。ローカルのSplunk Enterpriseバージョンをインストールしますが、データをインデックスすることはありません。代わりに、DB Connectクエリエンジンを通じて検索機能を使用します。

このガイドを通じて、ClickHouseに接続されたダッシュボードを次のように作成できるようになります：

<Image img={splunk_1} size="lg" border alt="Splunkダッシュボードに表示されるNYCタクシーデータのビジュアライゼーション" />

:::note
このガイドでは、[ニューヨーク市タクシーデータセット](/getting-started/example-datasets/nyc-taxi)を使用します。他にも[私たちのドキュメント](http://localhost:3000/docs/getting-started/example-datasets)から使用できるデータセットが多数あります。
:::

## 前提条件 {#prerequisites}

始める前に次のものが必要です：
- 検索ヘッド機能を使用するためのSplunk Enterprise
- OSまたはコンテナにインストールされた[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)の要件
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者またはSSHアクセス
- ClickHouse接続詳細（ClickHouse Cloudを使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照）

## Splunk EnterpriseにDB Connectをインストールし構成する {#install-and-configure-db-connect-on-splunk-enterprise}

最初に、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、コマンド `microdnf install java-11-openjdk` を使用できます。

`java_home`パスをメモしてください： `java -XshowSettings:properties -version` .

DB Connect AppがSplunk Enterpriseにインストールされていることを確認してください。Splunk Web UIのアプリセクションで見つけることができます：
- Splunk Webにログインし、Apps > Find More Appsに移動
- 検索ボックスを使用してDB Connectを探す
- Splunk DB Connectの隣にある緑の「インストール」ボタンをクリック
- 「Splunkを再起動」をクリック

DB Connect Appのインストールに問題がある場合は、[このリンク](https://splunkbase.splunk.com/app/2686)を参照して追加の指示を確認してください。

DB Connect Appがインストールされていることを確認したら、`java_home`パスをDB Connect Appの設定 -> 設定に追加し、保存をクリックしてリセットします。

<Image img={splunk_2} size="md" border alt="Java Home構成を示すSplunk DB Connect設定ページ" />

## ClickHouse用JDBCを構成する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバ](https://github.com/ClickHouse/clickhouse-java)をDB Connect Driversフォルダーにダウンロードします。

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、ClickHouse JDBCドライバのクラス詳細を追加するために、 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` の接続タイプ設定を編集する必要があります。

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

DB Connect Appに戻り、設定 > 設定 > ドライバに移動します。ClickHouseの隣に緑のチェックマークが表示されるはずです：

<Image img={splunk_3} size="lg" border alt="Splunk DB Connectドライバのページに表示されるClickHouseドライバが正常にインストールされていること" />

## Splunk検索をClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connect App設定 -> データベース -> 身元に移動：ClickHouseのための身元を作成します。

設定 -> データベース -> 接続からClickHouseへの新しい接続を作成し、「新しい接続」を選択します。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect新しい接続ボタン" />

<br />

ClickHouseホストの詳細を追加し、「SSLを有効にする」がチェックされていることを確認します：

<Image img={splunk_5} size="md" border alt="ClickHouse用のSplunk接続構成ページ" />

接続を保存した後、成功裏にClickHouseに接続できました！

:::note
エラーが表示された場合は、ClickHouse Cloud IPアクセスリストにSplunkインスタンスのIPアドレスを追加したことを確認してください。詳細については、[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::

## SQLクエリを実行する {#run-a-sql-query}

すべてが機能するかテストするために、SQLクエリを実行します。

DB Connect AppのDataLabセクションのSQLエクスプローラーで接続詳細を選択します。このデモでは `trips` テーブルを使用します：

<Image img={splunk_6} size="md" border alt="ClickHouseへの接続を選択するSplunk SQLエクスプローラー" />

`trips` テーブルのすべてのレコードのカウントを返すSQLクエリを実行します：

<Image img={splunk_7} size="md" border alt="tripsテーブルのレコード数を示すSplunk SQLクエリ実行" />

クエリが成功すれば、結果が表示されるはずです。

## ダッシュボードを作成する {#create-a-dashboard}

SQLと強力なSplunk処理言語（SPL）の組み合わせを活用したダッシュボードを作成しましょう。

進める前に、最初に[SPLの保護を無効化する](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)必要があります。

最も頻繁にピックアップされる上位10の近隣地域を示す次のクエリを実行します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

作成された列グラフを表示するために視覚化タブを選択します：

<Image img={splunk_8} size="lg" border alt="上位10のピックアップ近隣を表示するSplunk列グラフ視覚化" />

「名前を付けて保存」をクリックし、ダッシュボードに保存することでダッシュボードを作成します。

乗客数に基づく平均運賃を示す別のクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、棒グラフ視覚化を作成し、前のダッシュボードに保存します。

<Image img={splunk_9} size="lg" border alt="乗客数による平均運賃を示すSplunk棒グラフ" />

最後に、乗客数と旅行距離の相関を示すもう1つのクエリを追加します：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

最終的なダッシュボードは次のようになります：

<Image img={splunk_10} size="lg" border alt="複数のNYCタクシーデータ視覚化が含まれる最終的なSplunkダッシュボード" />

## 時系列データ {#time-series-data}

Splunkには、ダッシュボードが時系列データの可視化とプレゼンテーションに使用できる数百の組み込み関数があります。この例では、SQL + SPLを組み合わせて、Splunkで時系列データと連携できるクエリを作成します。

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

Splunk DB Connectやダッシュボードの作り方に関する詳細情報を見つけたい場合は、[Splunkのドキュメント](https://docs.splunk.com/Documentation)をご覧ください。
