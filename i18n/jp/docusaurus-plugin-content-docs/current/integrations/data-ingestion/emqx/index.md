---
sidebar_label: EMQX
sidebar_position: 1
slug: /integrations/emqx
description: EMQXとClickHouseの導入

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


# EMQXとClickHouseの統合

## EMQXへの接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise)は、高性能のリアルタイムメッセージ処理エンジンを持つオープンソースのMQTTブローカーで、IoTデバイスの巨大なスケールでのイベントストリーミングを支えています。最もスケーラブルなMQTTブローカーであるEMQXは、あらゆるデバイスを、あらゆるスケールで接続するのに役立ちます。IoTデータをどこでも移動させ、処理できます。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)は、[EMQ](https://www.emqx.com/en)がホストするIoT領域向けのMQTTメッセージングミドルウェア製品です。世界初のフルマネージドMQTT 5.0クラウドメッセージングサービスであるEMQX Cloudは、MQTTメッセージングサービスのためのワンストップの運用管理を提供し、独自の隔離された環境を提供します。すべてのもののインターネットの時代において、EMQX CloudはIoT領域の業界アプリケーションを迅速に構築し、IoTデータを容易に収集、送信、計算、および永続化するのに役立ちます。

クラウドプロバイダーが提供するインフラストラクチャを利用して、EMQX Cloudは世界の数十の国や地域にサービスを提供し、5Gおよびすべてのもののインターネットアプリケーションに対して低コストで安全かつ信頼できるクラウドサービスを提供しています。

<img src={emqx_cloud_artitecture} alt="EMQX Cloud アーキテクチャ" />

### 前提条件 {#assumptions}

* あなたは、極めて軽量に設計されたパブリッシュ/サブスクライブメッセージングトランスポートプロトコルである[MQTTプロトコル](https://mqtt.org/)に精通しています。
* あなたはリアルタイムメッセージ処理エンジンとしてEMQXまたはEMQX Cloudを使用しており、IoTデバイスの巨大なスケールでのイベントストリーミングを支えています。
* デバイスデータを永続化するためのClickhouse Cloudインスタンスを準備しました。
* [MQTT X](https://mqttx.app/)をMQTTクライアントテストツールとして使用してEMQX Cloudのデプロイメントに接続し、MQTTデータを公開します。他の方法でMQTTブローカーに接続することも可能です。

## ClickHouse Cloud サービスの取得 {#get-your-clickhouse-cloudservice}

セットアップ中、私たちはAWSのヴァージニア州N.にClickHouseインスタンスをデプロイしました（us-east -1），同時に同じ地域にEMQX Cloudインスタンスもデプロイしました。

<img src={clickhouse_cloud_1} alt="ClickHouse Cloud サービスデプロイメント" />

セットアッププロセス中には、接続設定にも注意が必要です。このチュートリアルでは「Anywhere」を選択しますが、特定の場所を申し込む場合は、EMQX Cloudデプロイメントから取得した[NATゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html)のIPアドレスをホワイトリストに追加する必要があります。

<img src={clickhouse_cloud_2} alt="ClickHouse Cloud 接続設定" />

次に、今後の使用のためにユーザー名とパスワードを保存する必要があります。

<img src={clickhouse_cloud_3} alt="ClickHouse Cloud 認証情報" />

その後、稼動中のClickhouseインスタンスを取得します。「Connect」をクリックして、Clickhouse Cloudのインスタンス接続アドレスを取得します。

<img src={clickhouse_cloud_4} alt="ClickHouse Cloud 稼動中のインスタンス" />

「SQL Consoleに接続」をクリックして、EMQX Cloudとの統合のためにデータベースとテーブルを作成します。

<img src={clickhouse_cloud_5} alt="ClickHouse Cloud SQLコンソール" />

以下のSQL文を参照するか、実際の状況に応じてSQLを修正してください。

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

<img src={clickhouse_cloud_6} alt="ClickHouse Cloud データベースとテーブルの作成" />

## EMQX CloudでMQTTサービスを作成 {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloudで専用のMQTTブローカーを作成するのは、数回のクリックで簡単です。

### アカウントを取得 {#get-an-account}

EMQX Cloudは、すべてのアカウントに対して標準デプロイメントとプロフェッショナルデプロイメントの14日間の無料トライアルを提供します。

[EMQX Cloudサインアップ](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud)ページにアクセスし、「無料で始める」をクリックして、EMQX Cloudが初めての場合はアカウントを登録してください。

<img src={emqx_cloud_sign_up} alt="EMQX Cloudサインアップページ" />

### MQTTクラスターの作成 {#create-an-mqtt-cluster}

ログイン後、アカウントメニューの「Cloud Console」をクリックすると、新しいデプロイメントを作成するための緑のボタンが表示されます。

<img src={emqx_cloud_create_1} alt="EMQX Cloud デプロイメント作成ステップ1" />

このチュートリアルでは、データ統合機能が直接ClickHouseにMQTTデータを送信できるのはProバージョンのみであるため、プロフェッショナルデプロイメントを使用します。

Proバージョンを選択し、`N.Virginial`地域を選択し、`Create Now`をクリックします。数分で、フルマネージドのMQTTブローカーが手に入ります：

<img src={emqx_cloud_create_2} alt="EMQX Cloud デプロイメント作成ステップ2" />

次に、パネルをクリックしてクラスタービューに移動します。このダッシュボードでは、MQTTブローカーの概要が表示されます。

<img src={emqx_cloud_overview} alt="EMQX Cloud 概要ダッシュボード" />

### クライアント認証情報の追加 {#add-client-credential}

EMQX Cloudでは、デフォルトで匿名接続が許可されていないため、MQTTクライアントツールを使用してこのブローカーにデータを送信するために、クライアント認証情報を追加する必要があります。

左側のメニューで「Authentication & ACL」をクリックし、サブメニューで「Authentication」をクリックします。右側の「Add」ボタンをクリックし、後でMQTT接続用のユーザー名とパスワードを設定します。ここでは、ユーザー名とパスワードに`emqx`と`xxxxxx`を使用します。

<img src={emqx_cloud_auth} alt="EMQX Cloud 認証設定" />

「Confirm」をクリックすると、完全に管理されたMQTTブローカーが準備完了になります。

### NATゲートウェイを有効にする {#enable-nat-gateway}

ClickHouseの統合設定を開始できるように、まずNATゲートウェイを有効にする必要があります。デフォルトでは、MQTTブローカーはプライベートVPCにデプロイされており、パブリックネットワーク経由でサードパーティシステムにデータを送信できません。

概要ページに戻り、ページの最下部までスクロールすると、NATゲートウェイウィジェットが表示されます。「Subscribe」ボタンをクリックし、指示に従ってください。NATゲートウェイは付加価値サービスですが、14日間の無料トライアルも提供しています。

<img src={emqx_cloud_nat_gateway} alt="EMQX Cloud NATゲートウェイの設定" />

作成が完了すると、ウィジェットにパブリックIPアドレスが表示されます。ClickHouse Cloudのセットアップ中に「特定の場所から接続する」を選択した場合は、このIPアドレスをホワイトリストに追加する必要があります。

## EMQX CloudとClickHouse Cloudの統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloudデータ統合](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)は、EMQXメッセージフローとデバイスイベントを処理および応答するためのルールを構成するために使用されます。データ統合は、明確で柔軟な「設定可能」なアーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザーの使いやすさを向上させ、ビジネスシステムとEMQX Cloudの間の結合度を低下させます。また、EMQX Cloudの独自機能のカスタマイズのための優れたインフラストラクチャを提供します。

<img src={emqx_cloud_data_integration} alt="EMQX Cloud データ統合オプション" />

EMQX Cloudは、人気のあるデータシステムとの30以上のネイティブ統合を提供しています。ClickHouseもその一つです。

<img src={data_integration_clickhouse} alt="EMQX Cloud ClickHouseデータ統合" />

### ClickHouseリソースの作成 {#create-clickhouse-resource}

左側のメニューで「Data Integrations」をクリックし、「View All Resources」をクリックします。データ永続化セクションにClickHouseが表示されるか、ClickHouseを検索できます。

ClickHouseカードをクリックして新しいリソースを作成します。

- 注意: このリソースのためのメモを追加してください。
- サーバーアドレス: これはあなたのClickHouse Cloudサービスのアドレスです。ポートを忘れないでください。
- データベース名: 上記のステップで作成した`emqx`。
- ユーザー: ClickHouse Cloudサービスに接続するためのユーザー名。
- キー: 接続用のパスワード。

<img src={data_integration_resource} alt="EMQX Cloud ClickHouseリソース設定" />

### 新しいルールの作成 {#create-a-new-rule}

リソースを作成中にポップアップが表示され、「New」をクリックするとルール作成ページに移動します。

EMQXは、MQTTメッセージをサードパーティシステムに送信する前に変換および充実させることができる強力な[ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)を提供します。

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

これにより、`temp_hum/emqx`トピックからメッセージを読み取り、クライアントID、トピック、およびタイムスタンプ情報を追加してJSONオブジェクトを強化します。

したがって、トピックに送信される生のJSONは以下のようになります：

```bash
{"temp": 28.5, "hum": 0.68}
```

<img src={data_integration_rule_1} alt="EMQX Cloud データ統合ルール作成ステップ1" />

SQLテストを使用してテストし、結果を確認できます。

<img src={data_integration_rule_2} alt="EMQX Cloud データ統合ルール作成ステップ2" />

次に「NEXT」ボタンをクリックします。このステップは、EMQX Cloudが洗練されたデータをClickHouseデータベースに挿入する方法を教えます。

### 応答アクションの追加 {#add-a-response-action}

リソースが1つだけの場合、「Resource」および「Action Type」を変更する必要はありません。
SQLテンプレートを設定するだけです。以下はこのチュートリアルで使用する例です：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<img src={data_integration_rule_action} alt="EMQX Cloud データ統合ルールアクション設定" />

これはClickhouseへのデータ挿入のテンプレートであり、ここで変数が使用されていることがわかります。

### ルール詳細の確認 {#view-rules-details}

「Confirm」をクリックし、「View Details」をクリックします。すべてが適切に設定されているはずです。ルール詳細ページでデータ統合が機能していることを確認できます。

<img src={data_integration_details} alt="EMQX Cloud データ統合ルール詳細" />

`temp_hum/emqx`トピックに送信されたすべてのMQTTメッセージは、あなたのClickHouse Cloudデータベースに永続化されます。

## ClickHouseへのデータの保存 {#saving-data-into-clickhouse}

温度と湿度のデータをシミュレートし、これらのデータをMQTT X経由でEMQX Cloudに報告し、その後EMQX Cloudデータ統合を使用してデータをClickHouse Cloudに保存します。

<img src={work_flow} alt="EMQX CloudからClickHouseへのワークフロー" />

### MQTTメッセージをEMQX Cloudに公開 {#publish-mqtt-messages-to-emqx-cloud}

任意のMQTTクライアントやSDKを使用してメッセージを公開できます。このチュートリアルでは、EMQが提供するユーザーフレンドリーなMQTTクライアントアプリケーションである[MQTT X](https://mqttx.app/)を使用します。

<img src={mqttx_overview} alt="MQTTX 概要" />

MQTTXで「New Connection」をクリックし、接続フォームを記入します：

- 名前: 接続名。お好きな名前を使用してください。
- ホスト: MQTTブローカー接続アドレス。EMQX Cloudの概要ページから取得できます。
- ポート: MQTTブローカー接続ポート。EMQX Cloudの概要ページから取得できます。
- ユーザー名/パスワード: 上で作成した認証情報を使用します。このチュートリアルでは`emqx`と`xxxxxx`です。

<img src={mqttx_new} alt="MQTTX 新しい接続設定" />

右上の「Connect」ボタンをクリックすると、接続が確立されるはずです。

これで、このツールを使用してMQTTブローカーにメッセージを送信できます。
入力：
1. ペイロード形式を「JSON」に設定します。
2. トピックを設定します: `temp_hum/emqx`（ルールで設定したトピック）
3. JSON本文：

```bash
{"temp": 23.1, "hum": 0.68}
```

右の送信ボタンをクリックします。温度値を変更して、MQTTブローカーに追加のデータを送信できます。

EMQX Cloudに送信されたデータは、ルールエンジンによって処理され、ClickHouse Cloudに自動的に挿入されるはずです。

<img src={mqttx_publish} alt="MQTTX MQTTメッセージを公開" />

### ルール監視の確認 {#view-rules-monitoring}

ルール監視をチェックし、成功の数に1を追加します。

<img src={rule_monitor} alt="EMQX Cloud ルールモニタリング" />

### 永続化されたデータの確認 {#check-the-data-persisted}

さて、ClickHouse Cloudのデータを確認する時間です。理想的には、MQTTXを使用して送信したデータがEMQX Cloudに入り、ネイティブデータ統合の助けを借りてClickHouse Cloudのデータベースに永続化されるでしょう。

ClickHouseのSQLコンソールに接続するか、任意のクライアントツールを使用してClickHouseからデータを取得できます。このチュートリアルではSQLコンソールを使用しました。
SQLを実行することで：

```bash
SELECT * FROM emqx.temp_hum;
```

<img src={clickhouse_result} alt="ClickHouse クエリ結果" />

### まとめ {#summary}

あなたは一行のコードも書いていないのに、MQTTデータがEMQX CloudからClickHouse Cloudに移動しました。EMQX CloudとClickHouse Cloudを使用することで、インフラを管理する必要はなく、ClickHouse Cloudに安全に保存されたデータでIoTアプリケーションの作成に集中できます。
