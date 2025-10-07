---
'sidebar_label': 'EMQX'
'sidebar_position': 1
'slug': '/integrations/emqx'
'description': 'ClickHouseとのEMQXの紹介'
'title': 'EMQXとClickHouseの統合'
'doc_type': 'guide'
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



# EMQXとClickHouseの統合

## EMQXへの接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) は、高性能なリアルタイムメッセージ処理エンジンを備えたオープンソースのMQTTブローカーで、IoTデバイス向けに大規模なイベントストリーミングを提供します。最もスケーラブルなMQTTブローカーとして、EMQXはあらゆる規模で任意のデバイスを接続するのを助けます。IoTデータをどこにでも移動し、処理します。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) は、 [EMQ](https://www.emqx.com/en) がホストするIoTドメイン向けのMQTTメッセージングミドルウェア製品です。EMQX Cloudは、世界初の完全に管理されたMQTT 5.0クラウドメッセージングサービスであり、MQTTメッセージングサービス用のワンストップO&Mコロケーションと独自の隔離された環境を提供します。あらゆるモノがインターネットで接続される時代に、EMQX CloudはIoTドメインの業界アプリケーションを迅速に構築し、IoTデータの収集、伝送、計算、および永続化を容易にします。

クラウドプロバイダーが提供するインフラストラクチャを使用することで、EMQX Cloudは世界中の数十の国と地域にサービスを提供し、5Gおよびあらゆるモノがインターネットで接続されるアプリケーション向けに、低コストで安全かつ信頼性のあるクラウドサービスを提供します。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloud Architecture diagram showing cloud infrastructure components" />

### 前提条件 {#assumptions}

* あなたは、非常に軽量なパブリッシュ/サブスクライブメッセージ輸送プロトコルとして設計された[MQTTプロトコル](https://mqtt.org/)に精通しています。
* あなたは、リアルタイムメッセージ処理エンジンとしてEMQXまたはEMQX Cloudを使用し、IoTデバイス向けに大規模なイベントストリーミングを実現しています。
* デバイスデータを永続化するためのClickhouse Cloudインスタンスを準備済みです。
* 私たちは、EMQX CloudにMQTTデータを公開するために、MQTTクライアントテストツールとして[MQTT X](https://mqttx.app/)を使用します。他の方法でMQTTブローカーに接続することも可能です。

## ClickHouse Cloudサービスの取得 {#get-your-clickhouse-cloudservice}

この設定中に、AWSのN.バージニア（us-east-1）にClickHouseインスタンスを展開し、同じ地域にEMQX Cloudインスタンスも展開しました。

<Image img={clickhouse_cloud_1} size="sm" border alt="ClickHouse Cloud Service Deployment interface showing AWS region selection" />

設定プロセス中に接続設定にも注意を払う必要があります。このチュートリアルでは「Anywhere」を選択しましたが、特定の場所を申し込む場合は、EMQX Cloudデプロイメントから取得した[NATゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html)のIPアドレスをホワイトリストに追加する必要があります。

<Image img={clickhouse_cloud_2} size="sm" border alt="ClickHouse Cloud Connection Settings showing IP access configuration" />

次に、将来使用するためにユーザー名とパスワードを保存する必要があります。

<Image img={clickhouse_cloud_3} size="sm" border alt="ClickHouse Cloud Credentials screen showing username and password" />

その後、稼働中のClickhouseインスタンスが取得できます。「接続」をクリックしてClickhouse Cloudのインスタンス接続アドレスを取得します。

<Image img={clickhouse_cloud_4} size="lg" border alt="ClickHouse Cloud Running Instance dashboard with connection options" />

「SQLコンソールに接続」をクリックして、EMQX Cloudとの統合のためにデータベースとテーブルを作成します。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQL Console interface" />

以下のSQLステートメントを参照するか、実際の状況に応じてSQLを修正できます。

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

## EMQX Cloud上にMQTTサービスを作成 {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud上に専用のMQTTブローカーを作成するのは、数クリックで簡単です。

### アカウントを取得 {#get-an-account}

EMQX Cloudは、標準デプロイメントとプロフェッショナルデプロイメントの両方に対して、すべてのアカウントに14日間の無料トライアルを提供しています。

[EMQX Cloud signup](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) ページから始めて、新しいユーザーの場合は無料登録をクリックしてアカウントを登録します。

<Image img={emqx_cloud_sign_up} size="lg" border alt="EMQX Cloud Signup Page with registration form" />

### MQTTクラスターの作成 {#create-an-mqtt-cluster}

ログインしたら、アカウントメニューの「Cloud console」をクリックし、新しいデプロイメントを作成するための緑色のボタンを見ることができます。

<Image img={emqx_cloud_create_1} size="lg" border alt="EMQX Cloud Create Deployment Step 1 showing deployment options" />

このチュートリアルでは、Professionalデプロイメントを使用します。プロ版のみがデータ統合機能を提供し、単一行のコードを書くことなくMQTTデータをClickHouseに直接送ることができます。

プロ版を選択し、`N.Virginial`地域を選択して「今すぐ作成」をクリックします。数分で完全に管理されたMQTTブローカーを取得できます：

<Image img={emqx_cloud_create_2} size="lg" border alt="EMQX Cloud Create Deployment Step 2 showing region selection" />

今、パネルをクリックしてクラスターのビューに移動します。このダッシュボードでは、MQTTブローカーの概要を見ることができます。

<Image img={emqx_cloud_overview} size="lg" border alt="EMQX Cloud Overview Dashboard showing broker metrics" />

### クライアント認証情報の追加 {#add-client-credential}

EMQX Cloudはデフォルトで匿名接続を許可していないため、MQTTクライアントツールでこのブローカーにデータを送信できるように、クライアント認証情報を追加する必要があります。

左メニューの「Authentication & ACL」をクリックし、サブメニューで「Authentication」をクリックします。右側の「追加」ボタンをクリックし、後でMQTT接続用のユーザー名とパスワードを入力します。ここでは、ユーザー名として`emqx`、パスワードとして`xxxxxx`を使用します。

<Image img={emqx_cloud_auth} size="lg" border alt="EMQX Cloud Authentication Setup interface for adding credentials" />

「確認」をクリックすると、完全に管理されたMQTTブローカーが準備されます。

### NATゲートウェイの有効化 {#enable-nat-gateway}

ClickHouse統合の設定を開始する前に、最初にNATゲートウェイを有効にする必要があります。デフォルトではMQTTブローカーはプライベートVPC内に展開されており、公開ネットワーク経由でサードパーティシステムにデータを送信することができません。

概要ページに戻り、ページの下部にスクロールするとNATゲートウェイウィジェットを見ることができます。購読ボタンをクリックし、指示に従ってください。NATゲートウェイは付加価値サービスですが、14日間の無料トライアルも提供しています。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT Gateway Configuration panel" />

作成が完了すると、ウィジェットに公開IPアドレスが表示されます。ClickHouse Cloudの設定中に「特定の場所から接続する」を選択した場合は、このIPアドレスをホワイトリストに追加する必要があることに注意してください。

## EMQX CloudとClickHouse Cloudの統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloudデータ統合](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)は、EMQXメッセージフローおよびデバイスイベントの処理と応答のためのルールを構成するために使用されます。データ統合は、明確で柔軟な「構成可能」アーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザーの使いやすさを向上させ、ビジネスシステムとEMQX Cloud間の結合度を低下させます。また、EMQX Cloudの独自機能のカスタマイズに優れたインフラストラクチャを提供します。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud Data Integration Options showing available connectors" />

EMQX Cloudは、人気のデータシステムと30以上のネイティブ統合を提供しています。ClickHouseもその一つです。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration connector details" />

### ClickHouseリソースの作成 {#create-clickhouse-resource}

左メニューの「データ統合」をクリックし、「すべてのリソースを表示」をクリックします。データ永続性セクションでClickHouseを見つけるか、ClickHouseを検索します。

ClickHouseカードをクリックして、新しいリソースを作成します。

- 注：このリソース用のメモを追加します。
- サーバーアドレス：これはClickHouse Cloudサービスのアドレスです。ポートを忘れないようにしてください。
- データベース名：上記の手順で作成した`emqx`。
- ユーザー：ClickHouse Cloudサービスへの接続用のユーザー名。
- キー：接続用のパスワード。

<Image img={data_integration_resource} size="lg" border alt="EMQX Cloud ClickHouse Resource Setup form with connection details" />

### 新しいルールの作成 {#create-a-new-rule}

リソースの作成中にポップアップが表示され、「新規」をクリックするとルール作成ページに移動します。

EMQXは、サードパーティシステムに送信する前に、生のMQTTメッセージを変換して強化する強力な[ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)を提供します。

このチュートリアルで使用されるルールは以下の通りです：

```sql
SELECT
   clientid AS client_id,
   (timestamp div 1000) AS timestamp,
   topic AS topic,
   payload.temp AS temp,
   payload.hum AS hum
FROM
"temp_hum/emqx"
```

これは、`temp_hum/emqx`トピックからメッセージを読み取り、クライアントID、トピック、タイムスタンプ情報を追加してJSONオブジェクトを強化します。

したがって、トピックに送信する生のJSONは：

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 1 showing SQL query" />

SQLテストを使用して結果をテストすることができます。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud Data Integration Rule Creation Step 2 showing test results" />

「次へ」ボタンをクリックします。このステップでは、EMQX Cloudに対して、どのように洗練されたデータをClickHouseデータベースに挿入するかを指示します。

### 応答アクションの追加 {#add-a-response-action}

リソースが1つだけの場合、'Resource' と 'Action Type' を変更する必要はありません。
SQLテンプレートを設定するだけです。ここで使用する例は次の通りです：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="EMQX Cloud Data Integration Rule Action Setup with SQL template" />

これは、Clickhouseにデータを挿入するためのテンプレートであり、ここで変数が使用されていることがわかります。

### ルールの詳細を表示 {#view-rules-details}

「確認」をクリックし、「詳細を表示」をクリックします。今、すべては正しく設定されているはずです。ルールの詳細ページからデータ統合が機能しているのを確認できます。

<Image img={data_integration_details} size="md" border alt="EMQX Cloud Data Integration Rule Details showing configuration summary" />

`temp_hum/emqx`トピックに送信されたすべてのMQTTメッセージは、ClickHouse Cloudデータベースに永続化されます。

## ClickHouseへのデータの保存 {#saving-data-into-clickhouse}

私たちは温度と湿度のデータをシミュレーションし、MQTT Xを介してこれらのデータをEMQX Cloudに報告し、その後、EMQX Cloudデータ統合を使用してClickHouse Cloudにデータを保存します。

<Image img={work_flow} size="lg" border alt="EMQX Cloud to ClickHouse Workflow diagram showing data flow" />

### EMQX CloudにMQTTメッセージを公開 {#publish-mqtt-messages-to-emqx-cloud}

任意のMQTTクライアントまたはSDKを使用してメッセージを公開できます。このチュートリアルでは、[MQTT X](https://mqttx.app/) を使用し、EMQが提供するユーザーフレンドリーなMQTTクライアントアプリケーションです。

<Image img={mqttx_overview} size="lg" border alt="MQTTX Overview showing the client interface" />

MQTTXで「新規接続」をクリックし、接続フォームを埋めます：

- 名前：接続名。任意の名前を使用してください。
- ホスト：MQTTブローカー接続アドレス。EMQX Cloudの概要ページから取得できます。
- ポート：MQTTブローカー接続ポート。EMQX Cloudの概要ページから取得できます。
- ユーザー名/パスワード：上で作成した認証情報を使用します。このチュートリアルでは`emqx`と`xxxxxx`です。

<Image img={mqttx_new} size="lg" border alt="MQTTX New Connection Setup form with connection details" />

右上の「接続」ボタンをクリックすると、接続が確立されるはずです。

これで、このツールを使用してMQTTブローカーにメッセージを送信できます。
入力：
1. ペイロード形式を「JSON」に設定します。
2. トピックを設定：`temp_hum/emqx`（ルールで設定したトピック）
3. JSONボディ：

```bash
{"temp": 23.1, "hum": 0.68}
```

右の送信ボタンをクリックします。温度値を変更してMQTTブローカーにさらに多くのデータを送信することができます。

EMQX Cloudに送信されたデータは、ルールエンジンによって処理され、ClickHouse Cloudに自動的に挿入されるはずです。

<Image img={mqttx_publish} size="lg" border alt="MQTTX Publish MQTT Messages interface showing message composition" />

### ルールモニタリングの表示 {#view-rules-monitoring}

ルールモニタリングを確認し、成功数を1つ追加します。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud Rule Monitoring dashboard showing message processing metrics" />

### 永続化されたデータの確認 {#check-the-data-persisted}

今、ClickHouse Cloudでのデータを確認する時です。理想的には、MQTTXを使用して送信されたデータはEMQX Cloudに渡り、ネイティブデータ統合の助けを借りてClickHouse Cloudのデータベースに永続化されます。

ClickHouse CloudパネルのSQLコンソールに接続するか、任意のクライアントツールを使用してClickHouseからデータを取得します。このチュートリアルではSQLコンソールを使用しました。
次のSQLを実行します：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse Query Results showing persisted IoT data" />

### まとめ {#summary}

コードを書かずに、EMQX CloudからClickHouse CloudにMQTTデータを移動しました。EMQX CloudとClickHouse Cloudを使用すると、インフラ管理は必要なく、データがClickHouse Cloudに安全に保存されたIoTアプリケーションの作成に集中できます。
