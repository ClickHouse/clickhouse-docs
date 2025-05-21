---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: 'ClickHouseにSplunkダッシュボードを接続する'
title: 'ClickHouseにSplunkを接続する'
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


# ClickHouseにSplunkを接続する

<ClickHouseSupportedBadge/>

Splunkはセキュリティと可視性のための人気技術です。また、強力な検索およびダッシュボードエンジンでもあります。さまざまなユースケースに対応するために、数百のSplunkアプリが利用可能です。

ClickHouse専用として、迅速なパフォーマンスを持つClickHouse JDBCドライバを使用して直接ClickHouseのテーブルをクエリするシンプルな統合がある[Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)を活用しています。

この統合の理想的なユースケースは、NetFlow、AvroまたはProtobufバイナリデータ、DNS、VPCフローログ、および他のOTELログなどの大規模データソースにClickHouseを使用している場合です。これにより、チームでSplunkを使用して検索およびダッシュボードの作成を共有できます。このアプローチを使用することで、データはSplunkのインデックス層に取り込まれず、ClickHouseから直接クエリされるのは、[Metabase](https://www.metabase.com/)や[Superset](https://superset.apache.org/)などの他の可視化統合と同様です。

## 目標​ {#goal}

このガイドでは、ClickHouse JDBCドライバを使用してClickHouseをSplunkに接続します。ローカル版のSplunk Enterpriseをインストールしますが、データをインデックスすることはありません。代わりに、DB Connectのクエリエンジンを介して検索機能を使用します。

このガイドを使用すると、ClickHouseに接続されたダッシュボードを作成できるようになります。

<Image img={splunk_1} size="lg" border alt="NYC タクシーデータの可視化を示すSplunkダッシュボード" />

:::note
このガイドでは、[ニューヨーク市のタクシーデータセット](/getting-started/example-datasets/nyc-taxi)を使用します。 [当社のドキュメント](http://localhost:3000/docs/getting-started/example-datasets) から他の多くのデータセットを使用できます。
:::

## 前提条件 {#prerequisites}

開始する前に必要なもの：
- 検索ヘッド機能を使用するためのSplunk Enterprise
- オペレーティングシステムまたはコンテナにインストールされた[Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)要件
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- Splunk Enterprise OSインスタンスへの管理者またはSSHアクセス
- ClickHouse接続情報（ ClickHouse Cloudを使用している場合は[こちら](/integrations/metabase#1-gather-your-connection-details)を参照）

## Splunk EnterpriseにDB Connectをインストールして構成する {#install-and-configure-db-connect-on-splunk-enterprise}

まず、Splunk EnterpriseインスタンスにJava Runtime Environmentをインストールする必要があります。Dockerを使用している場合は、次のコマンド`microdnf install java-11-openjdk`を使用できます。

`java_home`パスをメモしてください：`java -XshowSettings:properties -version`。

DB ConnectアプリがSplunk Enterpriseにインストールされていることを確認します。Splunk Web UIのアプリセクションで見つけることができます：
- Splunk Webにログインして、アプリ > 他のアプリを探すに移動する
- 検索ボックスを使用してDB Connectを見つける
- Splunk DB Connectの隣にある緑の「インストール」ボタンをクリックする
- 「Splunkを再起動」をクリックする

DB Connectアプリのインストールに問題がある場合は、追加の指示について[このリンク](https://splunkbase.splunk.com/app/2686)を参照してください。

DB Connectアプリがインストールされていることを確認したら、構成 -> 設定に移動し、DB Connectアプリに`java_home`パスを追加し、保存してからリセットをクリックします。

<Image img={splunk_2} size="md" border alt="Java Homeの設定を示すSplunk DB Connectの設定ページ" />

## ClickHouse用のJDBCを構成する {#configure-jdbc-for-clickhouse}

[ClickHouse JDBCドライバ](https://github.com/ClickHouse/clickhouse-java)をDB Connectドライバフォルダにダウンロードします：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

次に、`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`で接続タイプの構成を編集し、ClickHouse JDBCドライバクラスの詳細を追加します。

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

DB Connectアプリに戻り、構成 > 設定 > ドライバに移動します。ClickHouseの隣に緑のチェックマークが表示されるはずです：

<Image img={splunk_3} size="lg" border alt="ClickHouseドライバが正常にインストールされていることを示すSplunk DB Connectのドライバページ" />

## Splunk検索をClickHouseに接続する {#connect-splunk-search-to-clickhouse}

DB Connectアプリの構成 -> データベース -> 識別子に移動し、ClickHouse用の識別子を作成します。

構成 -> データベース -> 接続からClickHouseへの新しい接続を作成し、「新しい接続」を選択します。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connectの新しい接続ボタン" />

<br />

ClickHouseホストの詳細を追加し、「SSLを有効にする」がチェックされていることを確認します：

<Image img={splunk_5} size="md" border alt="ClickHouse用のSplunk接続構成ページ" />

接続を保存した後、ClickHouseをSplunkに正常に接続しました！

:::note
エラーが発生した場合は、SplunkインスタンスのIPアドレスをClickHouse CloudのIPアクセスリストに追加したことを確認してください。詳細については[ドキュメント](/cloud/security/setting-ip-filters)を参照してください。
:::

## SQLクエリを実行する {#run-a-sql-query}

すべてが正常に動作することを確認するために、SQLクエリを実行します。

DB ConnectアプリのDataLabセクションから接続情報を選択します。このデモでは`trips`テーブルを使用します：

<Image img={splunk_6} size="md" border alt="ClickHouseへの接続を選択するSplunk SQLエクスプローラ" />

`trips`テーブルのすべてのレコードのカウントを返すSQLクエリを実行します：

<Image img={splunk_7} size="md" border alt="tripsテーブルのレコードカウントを示すSplunk SQLクエリの実行" />

クエリが成功する場合、結果が表示されるはずです。

## ダッシュボードを作成する {#create-a-dashboard}

SQLと強力なSplunk処理言語（SPL）を組み合わせて使用するダッシュボードを作成しましょう。

続行する前に、最初に[SPLの保護機能を無効化する](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)必要があります。

最も頻繁にピックアップされる上位10の近隣地域を示す次のクエリを実行します：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

視覚化タブを選択して、作成された列のチャートを表示します：

<Image img={splunk_8} size="lg" border alt="上位10のピックアップ近隣を示すSplunkの列チャート可視化" />

次に、「名前を付けて保存」をクリックしてダッシュボードに保存します。

乗客数に基づく平均運賃を示す別のクエリを追加しましょう。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

今回は、バー チャート ビジュアライゼーションを作成し、前のダッシュボードに保存します。

<Image img={splunk_9} size="lg" border alt="乗客数による平均運賃を示すSplunkの棒グラフ" />

最後に、乗客数と旅行距離との相関関係を示すもう1つのクエリを追加しましょう：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(*) FROM default.trips
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;" connection="chc"
```

最終的なダッシュボードは次のようになります：

<Image img={splunk_10} size="lg" border alt="複数の可視化を持つ最終的なSplunkダッシュボード" />

## 時系列データ {#time-series-data}

Splunkには、ダッシュボードが時系列データの可視化とプレゼンテーションに使用できる数百の組み込み関数があります。この例では、SQLとSPLを組み合わせて、Splunkで時系列データを処理できるクエリを作成します。

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

Splunk DB Connectとダッシュボードの作成方法についての詳細情報を見つけるには、[Splunkのドキュメント](https://docs.splunk.com/Documentation)を参照してください。
