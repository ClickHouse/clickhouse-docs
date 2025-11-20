---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'ClickHouse と EMQX の概要'
title: 'EMQX と ClickHouse の連携'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['EMQX ClickHouse integration', 'MQTT ClickHouse connector', 'EMQX Cloud ClickHouse', 'IoT data ClickHouse', 'MQTT broker ClickHouse']
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


# EMQX と ClickHouse の連携



## EMQX への接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise)は、高性能なリアルタイムメッセージ処理エンジンを備えたオープンソースのMQTTブローカーで、大規模なIoTデバイスのイベントストリーミングを実現します。最もスケーラブルなMQTTブローカーとして、EMQXはあらゆるデバイスを、あらゆる規模で接続できます。IoTデータをどこでも移動し、処理することが可能です。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)は、[EMQ](https://www.emqx.com/en)がホストするIoT領域向けのMQTTメッセージングミドルウェア製品です。世界初のフルマネージドMQTT 5.0クラウドメッセージングサービスとして、EMQX CloudはMQTTメッセージングサービスのためのワンストップの運用管理コロケーションと独自の分離環境を提供します。IoT時代において、EMQX CloudはIoT領域の業界アプリケーションを迅速に構築し、IoTデータの収集、転送、計算、永続化を容易に行うことができます。

クラウドプロバイダーが提供するインフラストラクチャを活用し、EMQX Cloudは世界中の数十の国と地域にサービスを提供し、5GおよびIoTアプリケーション向けに、低コストで安全かつ信頼性の高いクラウドサービスを提供しています。

<Image
  img={emqx_cloud_artitecture}
  size='lg'
  border
  alt='クラウドインフラストラクチャコンポーネントを示すEMQX Cloudアーキテクチャ図'
/>

### 前提条件 {#assumptions}

- [MQTTプロトコル](https://mqtt.org/)に精通していること。MQTTは、極めて軽量なパブリッシュ/サブスクライブ型メッセージング転送プロトコルとして設計されています。
- 大規模なIoTデバイスのイベントストリーミングを実現するリアルタイムメッセージ処理エンジンとして、EMQXまたはEMQX Cloudを使用していること。
- デバイスデータを永続化するためのClickHouse Cloudインスタンスを準備していること。
- EMQX Cloudのデプロイメントに接続してMQTTデータをパブリッシュするためのMQTTクライアントテストツールとして、[MQTT X](https://mqttx.app/)を使用します。または、MQTTブローカーに接続する他の方法でも同様に機能します。


## ClickHouse Cloudサービスの取得 {#get-your-clickhouse-cloudservice}

このセットアップでは、ClickHouseインスタンスをAWSのバージニア北部（us-east-1）にデプロイし、EMQX Cloudインスタンスも同じリージョンにデプロイしました。

<Image
  img={clickhouse_cloud_1}
  size='sm'
  border
  alt='AWSリージョン選択を表示するClickHouse Cloudサービスデプロイメントインターフェース'
/>

セットアッププロセス中は、接続設定にも注意する必要があります。このチュートリアルでは「Anywhere」を選択しますが、特定の場所を指定する場合は、EMQX Cloudデプロイメントから取得した[NATゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html)のIPアドレスをホワイトリストに追加する必要があります。

<Image
  img={clickhouse_cloud_2}
  size='sm'
  border
  alt='IPアクセス設定を表示するClickHouse Cloud接続設定'
/>

次に、今後の使用のためにユーザー名とパスワードを保存します。

<Image
  img={clickhouse_cloud_3}
  size='sm'
  border
  alt='ユーザー名とパスワードを表示するClickHouse Cloud認証情報画面'
/>

その後、実行中のClickHouseインスタンスが取得できます。「Connect」をクリックして、ClickHouse Cloudのインスタンス接続アドレスを取得します。

<Image
  img={clickhouse_cloud_4}
  size='lg'
  border
  alt='接続オプションを備えたClickHouse Cloud実行中インスタンスダッシュボード'
/>

「Connect to SQL Console」をクリックして、EMQX Cloudとの統合用のデータベースとテーブルを作成します。

<Image
  img={clickhouse_cloud_5}
  size='lg'
  border
  alt='ClickHouse Cloud SQLコンソールインターフェース'
/>

以下のSQL文を参照するか、実際の状況に応じてSQLを変更してください。

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

<Image
  img={clickhouse_cloud_6}
  size='lg'
  border
  alt='ClickHouse Cloudデータベースおよびテーブル作成SQLクエリの実行'
/>


## EMQX CloudでMQTTサービスを作成する {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud上で専用のMQTTブローカーを作成するのは、数回のクリックで簡単に行えます。

### アカウントを取得する {#get-an-account}

EMQX Cloudは、すべてのアカウントに対してスタンダードデプロイメントとプロフェッショナルデプロイメントの両方で14日間の無料トライアルを提供しています。

EMQX Cloudを初めて利用する場合は、[EMQX Cloudサインアップ](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud)ページにアクセスし、「start free」をクリックしてアカウントを登録してください。

<Image
  img={emqx_cloud_sign_up}
  size='lg'
  border
  alt='登録フォームを含むEMQX Cloudサインアップページ'
/>

### MQTTクラスタを作成する {#create-an-mqtt-cluster}

ログイン後、アカウントメニューの「Cloud console」をクリックすると、新しいデプロイメントを作成するための緑色のボタンが表示されます。

<Image
  img={emqx_cloud_create_1}
  size='lg'
  border
  alt='デプロイメントオプションを表示するEMQX Cloudデプロイメント作成ステップ1'
/>

このチュートリアルでは、Professionalデプロイメントを使用します。Pro版のみがデータ統合機能を提供しており、コードを一行も書くことなくMQTTデータを直接ClickHouseに送信できるためです。

Pro版を選択し、`N.Virginia`リージョンを選択して`Create Now`をクリックします。わずか数分で、フルマネージドのMQTTブローカーが利用可能になります。

<Image
  img={emqx_cloud_create_2}
  size='lg'
  border
  alt='リージョン選択を表示するEMQX Cloudデプロイメント作成ステップ2'
/>

次に、パネルをクリックしてクラスタビューに移動します。このダッシュボードでは、MQTTブローカーの概要が表示されます。

<Image
  img={emqx_cloud_overview}
  size='lg'
  border
  alt='ブローカーメトリクスを表示するEMQX Cloud概要ダッシュボード'
/>

### クライアント認証情報を追加する {#add-client-credential}

EMQX Cloudはデフォルトで匿名接続を許可していないため、MQTTクライアントツールを使用してこのブローカーにデータを送信できるように、クライアント認証情報を追加する必要があります。

左側のメニューで「Authentication & ACL」をクリックし、サブメニューで「Authentication」をクリックします。右側の「Add」ボタンをクリックして、後でMQTT接続に使用するユーザー名とパスワードを設定します。ここでは、ユーザー名に`emqx`、パスワードに`xxxxxx`を使用します。

<Image
  img={emqx_cloud_auth}
  size='lg'
  border
  alt='認証情報を追加するためのEMQX Cloud認証設定インターフェース'
/>

「Confirm」をクリックすると、フルマネージドのMQTTブローカーの準備が完了します。

### NATゲートウェイを有効にする {#enable-nat-gateway}

ClickHouse統合の設定を開始する前に、まずNATゲートウェイを有効にする必要があります。デフォルトでは、MQTTブローカーはプライベートVPCにデプロイされており、パブリックネットワーク経由でサードパーティシステムにデータを送信できません。

概要ページに戻り、ページの下部までスクロールすると、NATゲートウェイウィジェットが表示されます。Subscribeボタンをクリックして、指示に従ってください。NATゲートウェイは付加価値サービスですが、14日間の無料トライアルも提供されています。

<Image
  img={emqx_cloud_nat_gateway}
  size='lg'
  border
  alt='EMQX Cloud NATゲートウェイ設定パネル'
/>

作成が完了すると、ウィジェット内にパブリックIPアドレスが表示されます。ClickHouse Cloudのセットアップ時に「特定の場所から接続する」を選択した場合は、このIPアドレスをホワイトリストに追加する必要があることに注意してください。


## EMQX CloudとClickHouse Cloudの統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)は、EMQXメッセージフローとデバイスイベントを処理・応答するためのルールを設定するために使用されます。Data Integrationsは、明確で柔軟な「設定可能な」アーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザビリティを向上させ、ビジネスシステムとEMQX Cloud間の結合度を低減します。また、EMQX Cloud固有の機能をカスタマイズするための優れたインフラストラクチャも提供します。

<Image
  img={emqx_cloud_data_integration}
  size='lg'
  border
  alt='利用可能なコネクタを表示するEMQX Cloud Data Integrationオプション'
/>

EMQX Cloudは、主要なデータシステムとの30以上のネイティブ統合を提供しています。ClickHouseもその1つです。

<Image
  img={data_integration_clickhouse}
  size='lg'
  border
  alt='EMQX Cloud ClickHouse Data Integrationコネクタの詳細'
/>

### ClickHouseリソースの作成 {#create-clickhouse-resource}

左側のメニューで「Data Integrations」をクリックし、「View All Resources」をクリックします。Data PersistenceセクションでClickHouseを見つけるか、ClickHouseを検索できます。

ClickHouseカードをクリックして新しいリソースを作成します。

- Note: このリソースのメモを追加します。
- Server address: ClickHouse Cloudサービスのアドレスです。ポート番号を忘れないでください。
- Database name: 上記の手順で作成した`emqx`です。
- User: ClickHouse Cloudサービスに接続するためのユーザー名です。
- Key: 接続用のパスワードです。

<Image
  img={data_integration_resource}
  size='lg'
  border
  alt='接続詳細を含むEMQX Cloud ClickHouseリソース設定フォーム'
/>

### 新しいルールの作成 {#create-a-new-rule}

リソースの作成中にポップアップが表示され、「New」をクリックするとルール作成ページに移動します。

EMQXは、サードパーティシステムに送信する前に、生のMQTTメッセージを変換・拡張できる強力な[ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)を提供しています。

このチュートリアルで使用するルールは次のとおりです:

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

このルールは`temp_hum/emqx`トピックからメッセージを読み取り、client_id、topic、timestampの情報を追加してJSONオブジェクトを拡張します。

したがって、トピックに送信する生のJSONは次のようになります:

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image
  img={data_integration_rule_1}
  size='md'
  border
  alt='SQLクエリを表示するEMQX Cloud Data Integrationルール作成ステップ1'
/>

SQLテストを使用してテストし、結果を確認できます。

<Image
  img={data_integration_rule_2}
  size='md'
  border
  alt='テスト結果を表示するEMQX Cloud Data Integrationルール作成ステップ2'
/>

次に「NEXT」ボタンをクリックします。このステップでは、処理されたデータをClickHouseデータベースに挿入する方法をEMQX Cloudに指示します。

### レスポンスアクションの追加 {#add-a-response-action}

リソースが1つしかない場合は、「Resource」と「Action Type」を変更する必要はありません。
SQLテンプレートを設定するだけです。このチュートリアルで使用する例は次のとおりです:

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image
  img={data_integration_rule_action}
  size='md'
  border
  alt='SQLテンプレートを含むEMQX Cloud Data Integrationルールアクション設定'
/>

これはClickHouseにデータを挿入するためのテンプレートで、ここで変数が使用されていることがわかります。

### ルール詳細の表示 {#view-rules-details}

「Confirm」と「View Details」をクリックします。これですべての設定が完了しました。ルール詳細ページからデータ統合が機能していることを確認できます。

<Image
  img={data_integration_details}
  size='md'
  border
  alt='設定概要を表示するEMQX Cloud Data Integrationルール詳細'
/>

`temp_hum/emqx`トピックに送信されたすべてのMQTTメッセージは、ClickHouse Cloudデータベースに永続化されます。


## ClickHouseへのデータ保存 {#saving-data-into-clickhouse}

温度と湿度のデータをシミュレートし、MQTT Xを介してEMQX Cloudに送信した後、EMQX Cloud Data Integrationsを使用してClickHouse Cloudにデータを保存します。

<Image
  img={work_flow}
  size='lg'
  border
  alt='EMQX CloudからClickHouseへのワークフロー図（データフローを表示）'
/>

### EMQX CloudへのMQTTメッセージの送信 {#publish-mqtt-messages-to-emqx-cloud}

任意のMQTTクライアントまたはSDKを使用してメッセージを送信できます。このチュートリアルでは、EMQが提供するユーザーフレンドリーなMQTTクライアントアプリケーションである[MQTT X](https://mqttx.app/)を使用します。

<Image
  img={mqttx_overview}
  size='lg'
  border
  alt='MQTTXの概要（クライアントインターフェースを表示）'
/>

MQTTXで「New Connection」をクリックし、接続フォームに入力します：

- Name: 接続名。任意の名前を使用できます。
- Host: MQTTブローカーの接続アドレス。EMQX Cloudの概要ページから取得できます。
- Port: MQTTブローカーの接続ポート。EMQX Cloudの概要ページから取得できます。
- Username/Password: 上記で作成した認証情報を使用します。このチュートリアルでは`emqx`と`xxxxxx`になります。

<Image
  img={mqttx_new}
  size='lg'
  border
  alt='MQTTXの新規接続設定フォーム（接続詳細を含む）'
/>

右上の「Connect」ボタンをクリックすると、接続が確立されます。

これで、このツールを使用してMQTTブローカーにメッセージを送信できます。
入力項目：

1. ペイロード形式を「JSON」に設定します。
2. トピックを`temp_hum/emqx`に設定します（ルールで設定したトピック）
3. JSON本文：

```bash
{"temp": 23.1, "hum": 0.68}
```

右側の送信ボタンをクリックします。温度値を変更して、MQTTブローカーにさらにデータを送信できます。

EMQX Cloudに送信されたデータは、ルールエンジンによって処理され、ClickHouse Cloudに自動的に挿入されます。

<Image
  img={mqttx_publish}
  size='lg'
  border
  alt='MQTTX MQTTメッセージ送信インターフェース（メッセージ構成を表示）'
/>

### ルール監視の表示 {#view-rules-monitoring}

ルール監視を確認し、成功数が1つ増加していることを確認します。

<Image
  img={rule_monitor}
  size='lg'
  border
  alt='EMQX Cloudルール監視ダッシュボード（メッセージ処理メトリクスを表示）'
/>

### 永続化されたデータの確認 {#check-the-data-persisted}

次に、ClickHouse Cloud上のデータを確認します。MQTTXを使用して送信したデータは、EMQX Cloudに送られ、ネイティブデータ統合によってClickHouse Cloudのデータベースに永続化されます。

ClickHouse CloudパネルのSQLコンソールに接続するか、任意のクライアントツールを使用してClickHouseからデータを取得できます。このチュートリアルでは、SQLコンソールを使用しました。
次のSQLを実行します：

```bash
SELECT * FROM emqx.temp_hum;
```

<Image
  img={clickhouse_result}
  size='lg'
  border
  alt='ClickHouseクエリ結果（永続化されたIoTデータを表示）'
/>

### まとめ {#summary}

コードを一切記述することなく、MQTTデータをEMQX CloudからClickHouse Cloudに移動できるようになりました。EMQX CloudとClickHouse Cloudを使用することで、インフラストラクチャを管理する必要がなく、ClickHouse Cloudに安全に保存されたデータを使用してIoTアプリケーションの開発に集中できます。
