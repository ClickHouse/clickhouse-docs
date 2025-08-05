---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: '/integrations/emqx'
description: 'ClickHouse との EMQX 統合についての紹介'
title: 'ClickHouse との EMQX 統合'
---

import emqx_cloud_artitecture from '@site/static/images/integrations/data-ingestion/emqx/emqx-cloud-artitecture.png';
import clickhouse_cloud_1 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_1.png';
import clickhouse_cloud_2 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_2.png';
import clickhouse_cloud_3 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_3.png';
import clickhouse_cloud_4 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_4.png';
import clickhouse_cloud_5 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_5.png';
import clickhouse_cloud_6 from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_cloud_6.png';
import emqx_cloud_sign_up from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_sign_up.png';
import emqx_cloud_create_1 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_1.png';
import emqx_cloud_create_2 from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_create_2.png';
import emqx_cloud_overview from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_overview.png';
import emqx_cloud_auth from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_auth.png';
import emqx_cloud_nat_gateway from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_nat_gateway.png';
import emqx_cloud_data_integration from '@site/static/images/integrations/data-ingestion/emqx/emqx_cloud_data_integration.png';
import data_integration_clickhouse from '@site/static/images/integrations/data-ingestion/emqx/data_integration_clickhouse.png';
import data_integration_resource from '@site/static/images/integrations/data-ingestion/emqx/data_integration_resource.png';
import data_integration_rule_1 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_1.png';
import data_integration_rule_2 from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_2.png';
import data_integration_rule_action from '@site/static/images/integrations/data-ingestion/emqx/data_integration_rule_action.png';
import data_integration_details from '@site/static/images/integrations/data-ingestion/emqx/data_integration_details.png';
import work_flow from '@site/static/images/integrations/data-ingestion/emqx/work-flow.png';
import mqttx_overview from '@site/static/images/integrations/data-ingestion/emqx/mqttx-overview.png';
import mqttx_new from '@site/static/images/integrations/data-ingestion/emqx/mqttx-new.png';
import mqttx_publish from '@site/static/images/integrations/data-ingestion/emqx/mqttx-publish.png';
import rule_monitor from '@site/static/images/integrations/data-ingestion/emqx/rule_monitor.png';
import clickhouse_result from '@site/static/images/integrations/data-ingestion/emqx/clickhouse_result.png';
import Image from '@theme/IdealImage';



# EMQX と ClickHouse の統合

## EMQX の接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) は、高性能なリアルタイムメッセージ処理エンジンを持つオープンソースの MQTT ブローカーであり、大規模な IoT デバイス向けのイベントストリーミングを支えています。最もスケーラブルな MQTT ブローカーとして、EMQX はあらゆる規模のデバイスを接続するのに役立ちます。あなたの IoT データをどこでも移動させ、処理します。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) は、[EMQ](https://www.emqx.com/en) によってホストされる IoT ドメイン向けの MQTT メッセージングミドルウェア製品です。世界初の完全管理された MQTT 5.0 クラウドメッセージングサービスである EMQX Cloud は、MQTT メッセージングサービスのための一元的な運用・管理およびユニークな隔離環境を提供します。あらゆるモノのインターネットの時代において、EMQX Cloud は IoT ドメイン向けの産業アプリケーションを迅速に構築し、IoT データを容易に収集、送信、計算、保存することができます。

クラウドプロバイダーによって提供されるインフラストラクチャにより、EMQX Cloud は世界中の数十の国と地域にサービスを提供し、5G およびあらゆるモノのインターネットアプリケーション向けに低コスト、高セキュリティ、信頼性のあるクラウドサービスを提供します。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud Architecture diagram showing cloud infrastructure components" />

### 前提条件 {#assumptions}

* あなたは、軽量な pub/sub メッセージトランスポートプロトコルとして設計された [MQTT プロトコル](https://mqtt.org/) に精通しています。
* あなたは、リアルタイムメッセージ処理エンジンとして EMQX または EMQX Cloud を使用しており、大規模な IoT デバイス向けのイベントストリーミングを支えています。
* あなたは、デバイスデータを永続化するための Clickhouse Cloud インスタンスを用意しています。
* 私たちは、MQTT データをパブリッシュするために EMQX Cloud のデプロイメントに接続するための MQTT クライアントテストツールとして [MQTT X](https://mqttx.app/) を使用しています。他の方法で MQTT ブローカーに接続することも可能です。


## ClickHouse Cloud サービスを取得する {#get-your-clickhouse-cloudservice}

この設定中に、私たちは AWS のバージニア州北部 (us-east-1) に ClickHouse インスタンスをデプロイし、同じ地域に EMQX Cloud インスタンスもデプロイしました。

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud Service Deployment interface showing AWS region selection" />

セットアッププロセス中に、接続設定にも注意を払う必要があります。このチュートリアルでは「Anywhere」を選択しますが、特定の場所を要求する場合、EMQX Cloud デプロイメントから取得した [NAT ゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) の IP アドレスをホワイトリストに追加する必要があります。

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud Connection Settings showing IP access configuration" />

次に、今後の使用のためにユーザー名とパスワードを保存する必要があります。

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud Credentials screen showing username and password" />

その後、稼働中の Clickhouse インスタンスが得られます。「接続」をクリックして Clickhouse Cloud のインスタンス接続アドレスを取得してください。

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud Running Instance dashboard with connection options" />

「SQL コンソールに接続」をクリックして、EMQX Cloud との統合のためのデータベースとテーブルを作成します。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL Console interface" />

次の SQL 文を参照するか、実際の状況に応じて SQL を修正できます。

```sql
CREATE TABLE emqx.temp_hum
(
   client_id String,
   timestamp DateTime,
   topic String,
   temp Float32,
   hum Float32
)
ENGINE = MergeTree()
PRIMARY KEY (client_id, timestamp)
```

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud Create Database and Table SQL query execution" />

## EMQX Cloud 上に MQTT サービスを作成する {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud 上に専用の MQTT ブローカーを作成するのは簡単で、数回のクリックで完了します。

### アカウントを取得する {#get-an-account}

EMQX Cloud は、すべてのアカウントに対して標準デプロイメントとプロフェッショナルデプロイメントの両方で 14 日間の無料トライアルを提供しています。

新たに EMQX Cloud を使用する場合は、[EMQX Cloud サインアップ](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) ページから「無料で始める」をクリックしてアカウントに登録します。

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud Signup Page with registration form" />

### MQTT クラスターを作成する {#create-an-mqtt-cluster}

ログイン後、アカウントメニューの「Cloud Console」をクリックすると、新しいデプロイメントを作成するための緑のボタンを見ることができます。

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud Create Deployment Step 1 showing deployment options" />

このチュートリアルでは、データ統合機能が Pro バージョンのみで提供されるため、プロフェッショナルデプロイメントを使用します。この機能を利用すると、1行のコードも書かずに MQTT データを直接 ClickHouse に送信できます。

Pro バージョンを選択し、`N.Virginial` 地域を選んで「今すぐ作成」をクリックしてください。数分以内に完全管理された MQTT ブローカーが得られます。

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud Create Deployment Step 2 showing region selection" />

今、パネルをクリックしてクラスターのビューに進みます。このダッシュボードでは、あなたの MQTT ブローカーの概要を見ることができます。

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud Overview Dashboard showing broker metrics" />

### クライアント認証情報を追加する {#add-client-credential}

EMQX Cloud は、デフォルトで匿名接続を許可していないため、MQTT クライアントツールを使用してこのブローカーにデータを送信するために、クライアント認証情報を追加する必要があります。

左メニューの「認証 & ACL」をクリックし、サブメニューの「認証」をクリックします。右の「追加」ボタンをクリックし、後で MQTT 接続に使用するユーザー名とパスワードを設定します。ここでは `emqx` と `xxxxxx` をユーザー名とパスワードとして使用します。

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud Authentication Setup interface for adding credentials" />

「確認」をクリックすると、完全管理された MQTT ブローカーが準備完了になります。

### NAT ゲートウェイを有効化する {#enable-nat-gateway}

ClickHouse 統合の設定を開始する前に、まず NAT ゲートウェイを有効にする必要があります。デフォルトでは、MQTT ブローカーはプライベート VPC にデプロイされており、公共ネットワークを介してサードパーティのシステムにデータを送信することはできません。

概観ページに戻り、ページの下部までスクロールすると NAT ゲートウェイウィジェットを見ることができます。「購読」ボタンをクリックし、指示に従います。NAT ゲートウェイは付加価値サービスであることに注意してください。ただし、14 日間の無料トライアルも提供しています。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT Gateway Configuration panel" />

作成が完了すると、ウィジェットにパブリック IP アドレスが表示されます。ClickHouse Cloud セットアップ中に「特定の場所から接続」を選択した場合、この IP アドレスをホワイトリストに追加する必要があることに注意してください。


## EMQX Cloud と ClickHouse Cloud の統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) は、EMQX メッセージフローおよびデバイスイベントの処理と応答のためのルールを構成するために使用されます。データ統合は、明確で柔軟な「構成可能」なアーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザーの使いやすさを向上させ、ビジネスシステムと EMQX Cloud との結合度を下げます。また、EMQX Cloud の独自機能のカスタマイズのための優れたインフラストラクチャも提供します。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud Data Integration Options showing available connectors" />

EMQX Cloud は、人気のあるデータシステムとの 30 以上のネイティブ統合を提供しています。ClickHouse もその一つです。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration connector details" />

### ClickHouse リソースを作成する {#create-clickhouse-resource}

左メニューの「データ統合」をクリックし、「すべてのリソースを見る」をクリックします。データ永続化セクションに ClickHouse が見つかるか、ClickHouse を検索することができます。

ClickHouse カードをクリックして新しいリソースを作成します。

- 注：このリソースにメモを追加します。
- サーバーアドレス：これはあなたの ClickHouse Cloud サービスのアドレスであり、ポートを忘れずに記録してください。
- データベース名：上記のステップで作成した `emqx`。
- ユーザー：あなたの ClickHouse Cloud サービスに接続するためのユーザー名。
- キー：接続用のパスワード。

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse Resource Setup form with connection details" />

### 新しいルールを作成する {#create-a-new-rule}

リソースの作成中にポップアップが表示され、「新規」をクリックするとルール作成ページに進みます。

EMQX には、サードパーティのシステムに送信する前に生の MQTT メッセージを変換および強化できる強力な [ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html) が用意されています。

このチュートリアルで使用するルールは以下の通りです：

```sql
SELECT
   clientid as client_id,
   (timestamp div 1000) as timestamp,
   topic as topic,
   payload.temp as temp,
   payload.hum as hum
FROM
"temp_hum/emqx"
```

これは、`temp_hum/emqx` トピックからメッセージを読み取り、client_id、topic、および timestamp 情報を追加して JSON オブジェクトを強化します。

したがって、トピックに送信する生の JSON は以下のようになります：

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 1 showing SQL query" />

SQL テストを使用してテストし、結果を確認できます。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 2 showing test results" />

今、「NEXT」ボタンをクリックします。このステップでは、EMQX Cloud に対して精練されたデータを ClickHouse データベースに挿入する方法を指示します。

### 応答アクションを追加する {#add-a-response-action}

リソースが 1 つだけの場合、「リソース」と「アクションタイプ」を修正する必要はありません。
SQL テンプレートだけを設定するだけです。ここでは、このチュートリアルで使用する例を示します：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud Data Integration Rule Action Setup with SQL template" />

これは Clickhouse にデータを挿入するためのテンプレートで、ここで変数が使用されることがわかります。

### ルールの詳細を表示する {#view-rules-details}

「確認」と「詳細を表示」をクリックします。これで、すべてが適切に設定されているはずです。ルールの詳細ページからデータ統合が機能していることを確認できます。

<Image img={data_integration_details} size="md" border alt="EMQX Cloud Data Integration Rule Details showing configuration summary" />

`temp_hum/emqx` トピックに送信されたすべての MQTT メッセージは、あなたの ClickHouse Cloud データベースに永続化されます。

## ClickHouse へのデータ保存 {#saving-data-into-clickhouse}

温度と湿度データをシミュレーションし、これらのデータを MQTT X を通じて EMQX Cloud に報告し、その後 EMQX Cloud データ統合を使用して ClickHouse Cloud に保存します。

<Image img={work_flow} size="lg" border alt="EMQX Cloud to ClickHouse Workflow diagram showing data flow" />

### EMQX Cloud に MQTT メッセージを公開する {#publish-mqtt-messages-to-emqx-cloud}

任意の MQTT クライアントまたは SDK を使用してメッセージを公開できます。このチュートリアルでは、EMQ によって提供されるユーザーフレンドリーな MQTT クライアントアプリケーション [MQTT X](https://mqttx.app/) を使用します。

<Image img={mqttx_overview} size="lg" border alt="MQTTX Overview showing the client interface" />

MQTTX で「新しい接続」をクリックし、接続フォームを入力します：

- 名前：接続名。任意の名前を使用できます。
- ホスト：MQTT ブローカー接続アドレス。EMQX Cloud 概要ページから取得できます。
- ポート：MQTT ブローカー接続ポート。EMQX Cloud 概要ページから取得できます。
- ユーザー名/パスワード：上で作成した資格情報を使用します。このチュートリアルでは `emqx` と `xxxxxx` です。

<Image img={mqttx_new} size="lg" border alt="MQTTX New Connection Setup form with connection details" />

右上にある「接続」ボタンをクリックすると接続が確立されます。

これで、このツールを使って MQTT ブローカーにメッセージを送信できます。
入力:
1. ペイロード形式を「JSON」に設定します。
2. トピックを `temp_hum/emqx`（ルールで設定したトピック）に設定します。
3. JSON 本体：

```bash
{"temp": 23.1, "hum": 0.68}
```

右の送信ボタンをクリックします。温度値を変更し、MQTT ブローカーにより多くのデータを送信できます。

EMQX Cloud に送信されたデータは、ルールエンジンによって処理され、クリックハウスクラウドに自動的に挿入されるはずです。

<Image img={mqttx_publish} size="lg" border alt="MQTTX Publish MQTT Messages interface showing message composition" />

### ルールのモニタリングを表示する {#view-rules-monitoring}

ルールモニタリングをチェックし、成功回数を追加します。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud Rule Monitoring dashboard showing message processing metrics" />

### 永続化されたデータを確認する {#check-the-data-persisted}

さあ、ClickHouse Cloud のデータを見てみましょう。理想的には、MQTTX を使用して送信したデータが EMQX Cloud に届き、ネイティブなデータ統合の助けを借りて ClickHouse Cloud のデータベースに永続化されるはずです。

ClickHouse の SQL コンソールに接続するか、任意のクライアントツールを使用してデータを取得します。このチュートリアルでは SQL コンソールを使用しました。
SQL を実行することによって：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse Query Results showing persisted IoT data" />

### まとめ {#summary}

あなたは一行のコードも書かず、EMQX Cloud から ClickHouse Cloud に MQTT データを移動させることができました。EMQX Cloud と ClickHouse Cloud を使用すれば、インフラを管理する必要がなく、データが ClickHouse Cloud に安全に保存される IoT アプリケーションの記述に集中することができます。
