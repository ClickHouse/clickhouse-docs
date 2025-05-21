---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'ClickHouseとのEMQXの統合について'
title: 'ClickHouseとのEMQXの統合'
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


# ClickHouseとのEMQXの統合

## EMQXの接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise)は、高性能のリアルタイムメッセージ処理エンジンを備えたオープンソースのMQTTブローカーであり、大規模のIoTデバイス向けのイベントストリーミングを提供します。最もスケーラブルなMQTTブローカーとして、EMQXはあらゆる規模のデバイスを接続するのに役立ちます。IoTデータをどこにでも移動させて処理します。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)は、[EMQ](https://www.emqx.com/en)によってホストされるIoTドメイン向けのMQTTメッセージングミドルウェア製品です。世界初の完全管理型MQTT 5.0クラウドメッセージングサービスとして、EMQX Cloudは一元的な運用管理およびMQTTメッセージングサービスのためのユニークな隔離環境を提供します。すべてのものがインターネットに接続される時代において、EMQX Cloudは、IoTドメイン向けの産業アプリケーションを迅速に構築し、IoTデータの収集、送信、計算、および永続化を容易に行えるようにします。

クラウドプロバイダーが提供するインフラストラクチャを活用して、EMQX Cloudは世界中の数十カ国と地域でサービスを提供し、5Gおよびすべてのものがインターネットに接続されるアプリケーションに対して、低コストで安全、かつ信頼性の高いクラウドサービスを提供しています。

<Image img={emqx_cloud_artitecture} size="lg" border alt="EMQX Cloudアーキテクチャ図でクラウドインフラストラクチャのコンポーネントを表示" />

### 前提条件 {#assumptions}

* あなたは非常に軽量なパブリッシュ/サブスクライブメッセージングトランスポートプロトコルとして設計された[MQTTプロトコル](https://mqtt.org/)に精通しています。
* あなたはリアルタイムメッセージ処理エンジンとしてEMQXまたはEMQX Cloudを使用しており、大規模のIoTデバイス向けのイベントストリーミングを支えています。
* デバイスデータを永続化するためにClickhouse Cloudインスタンスを準備しています。
* MQTTデータをパブリッシュするために、EMQX Cloudのデプロイメントに接続するために[MQTT X](https://mqttx.app/)をMQTTクライアントテストツールとして使用します。また、他の方法でMQTTブローカーに接続しても構いません。

## ClickHouse Cloudサービスの取得 {#get-your-clickhouse-cloudservice}

このセットアップでは、AWSのバージニア州N.（us-east -1）にClickHouseインスタンスをデプロイし、同じ地域にEMQX Cloudインスタンスをデプロイしました。

<Image img={clickhouse_cloud_1} size="sm" border alt="AWS地域選択を示すClickHouse Cloudサービスデプロイメントインターフェース" />

セットアッププロセス中に、接続設定にも注意を払う必要があります。このチュートリアルでは「Anywhere」を選択しましたが、特定の場所を申請する場合は、EMQX Cloudデプロイメントから取得した[NATゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html)のIPアドレスをホワイトリストに追加する必要があります。

<Image img={clickhouse_cloud_2} size="sm" border alt="IPアクセス設定を示すClickHouse Cloud接続設定" />

その後、今後の利用のためにユーザー名とパスワードを保存する必要があります。

<Image img={clickhouse_cloud_3} size="sm" border alt="ユーザー名とパスワードを表示するClickHouse Cloud資格情報画面" />

その後、実行中のClickhouseインスタンスを取得します。「Connect」をクリックしてClickhouse Cloudのインスタンス接続アドレスを取得します。

<Image img={clickhouse_cloud_4} size="lg" border alt="接続オプションを持つClickHouse Cloud実行中インスタンスダッシュボード" />

「SQLコンソールに接続」をクリックして、EMQX Cloudとの統合のためのデータベースとテーブルを作成します。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud SQLコンソールインターフェース" />

以下のSQL文を参照するか、実際の状況に応じてSQLを修正できます。

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

<Image img={clickhouse_cloud_6} size="lg" border alt="データベースとテーブルの作成SQLクエリー実行を示すClickHouse Cloud" />

## EMQX CloudでのMQTTサービスの作成 {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloudで専用のMQTTブローカーを作成するのは、数回のクリックで簡単に行えます。

### アカウントを取得 {#get-an-account}

EMQX Cloudは、標準デプロイメントおよびプロフェッショナルデプロイメントの各アカウントに対して14日間の無料トライアルを提供します。

初めてEMQX Cloudを使用する場合は、[EMQX Cloudのサインアップ](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud)ページで「無料を開始」でアカウントを登録してください。

<Image img={emqx_cloud_sign_up} size="lg" border alt="登録フォームを持つEMQX Cloudサインアップページ" />

### MQTTクラスタの作成 {#create-an-mqtt-cluster}

ログインしたら、アカウントメニューの「Cloud Console」をクリックすると、新しいデプロイメントを作成するための緑のボタンが見えるはずです。

<Image img={emqx_cloud_create_1} size="lg" border alt="デプロイメントオプションを示すEMQX Cloudデプロイメント作成ステップ1" />

このチュートリアルでは、データ統合機能が提供されているのはProバージョンのみのため、プロフェッショナルデプロイメントを使用します。これにより、MQTTデータをClickHouseに1行のコードも書かずに直接送信できます。

Proバージョンを選択し、`N.Virginia`地域を選択して「今すぐ作成」をクリックします。数分で完全管理されたMQTTブローカーが手に入ります。

<Image img={emqx_cloud_create_2} size="lg" border alt="地域選択を示すEMQX Cloudデプロイメント作成ステップ2" />

次にパネルをクリックしてクラスタビューに移動します。このダッシュボードでは、あなたのMQTTブローカーの概要を確認できます。

<Image img={emqx_cloud_overview} size="lg" border alt="ブローカーメトリクスを表示するEMQX Cloud概要ダッシュボード" />

### クライアント認証情報の追加 {#add-client-credential}

EMQX Cloudはデフォルトで匿名接続を許可していないため、MQTTクライアントツールを使用してこのブローカーにデータを送信できるようにクライアントの認証情報を追加する必要があります。

左のメニューで「Authentication & ACL」をクリックし、サブメニューで「Authentication」をクリックします。右の「Add」ボタンをクリックし、後でMQTT接続用のユーザー名とパスワードを設定します。ここでは、ユーザー名とパスワードとして`emqx`と`xxxxxx`を使用します。

<Image img={emqx_cloud_auth} size="lg" border alt="認証情報を追加するためのEMQX Cloud認証設定インターフェース" />

「Confirm」をクリックすると、完全に管理されたMQTTブローカーが準備完了となります。

### NATゲートウェイの有効化 {#enable-nat-gateway}

ClickHouseの統合を設定し始める前に、NATゲートウェイを先に有効にする必要があります。デフォルトでは、MQTTブローカーはプライベートVPCにデプロイされており、公衆ネットワーク経由でサードパーティシステムにデータを送信することができません。

概要ページに戻り、ページの一番下までスクロールするとNATゲートウェイウィジェットが表示されます。「Subscribe」ボタンをクリックして指示に従ってください。NATゲートウェイは付加価値サービスですが、14日間の無料トライアルも提供しています。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NATゲートウェイ設定パネル" />

作成が完了すると、ウィジェットにパブリックIPアドレスが表示されます。ClickHouse Cloudのセットアップ中に「特定の場所から接続」を選択した場合は、このIPアドレスをホワイトリストに追加する必要があります。

## EMQX CloudとClickHouse Cloudの統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)は、EMQXメッセージフローおよびデバイスイベントを処理し応答するためのルールを構成するために使用されます。データ統合は、明確で柔軟な「設定可能な」アーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザビリティを向上させ、ビジネスシステムとEMQX Cloud間のカップリング度を低減します。また、EMQX Cloud独自の機能をカスタマイズするための優れたインフラストラクチャを提供します。

<Image img={emqx_cloud_data_integration} size="lg" border alt="利用可能なコネクタを示すEMQX Cloudデータ統合オプション" />

EMQX Cloudは、人気のあるデータシステムとの30以上のネイティブ統合を提供しています。ClickHouseもその1つです。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouseデータ統合コネクタの詳細" />

### ClickHouseリソースの作成 {#create-clickhouse-resource}

左のメニューで「Data Integrations」をクリックし、「すべてのリソースを表示」をクリックします。データ永続化セクションでClickHouseを見つけるか、ClickHouseを検索します。

ClickHouseカードをクリックして新しいリソースを作成します。

- 注意: このリソースのメモを追加します。
- サーバーアドレス: これはあなたのClickHouse Cloudサービスのアドレスで、ポートを忘れないでください。
- データベース名: 上記のステップで作成した`emqx`。
- ユーザー: ClickHouse Cloudサービスに接続するためのユーザー名。
- キー: 接続用のパスワード。

<Image img={data_integration_resource} size="lg" border alt="接続詳細を示すEMQX Cloud ClickHouseリソース設定フォーム" />

### 新しいルールの作成 {#create-a-new-rule}

リソースの作成中にポップアップが表示され、「新しい」をクリックするとルール作成ページに移動します。

EMQXは、MQTTメッセージを変換し、サードパーティシステムに送信する前に生のデータを補完する強力な[ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)を提供します。

このチュートリアルで使用するルールは以下の通りです。

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

これにより、`temp_hum/emqx`トピックからメッセージを読み取り、client_id、topic、およびtimestamp情報を追加することでJSONオブジェクトを補完します。

したがって、トピックに送信する生のJSONは以下のようになります。

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloudデータ統合ルール作成ステップ1でSQLクエリを表示" />

SQLテストを使用してテストし、結果を確認できます。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloudデータ統合ルール作成ステップ2でテスト結果を表示" />

「次へ」ボタンをクリックしてください。このステップでは、EMQX Cloudに対して、精製されたデータをClickHouseデータベースに挿入する方法を知らせます。

### 応答アクションを追加 {#add-a-response-action}

リソースが1つだけの場合は、「リソース」と「アクションタイプ」を変更する必要はありません。
SQLテンプレートを設定するだけです。ここで使用される例は以下の通りです。

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="SQLテンプレートを使用したEMQX Cloudデータ統合ルールアクション設定" />

これはClickhouseにデータを挿入するためのテンプレートです。ここで変数が使われているのがわかります。

### ルールの詳細を表示 {#view-rules-details}

「Confirm」と「View Details」をクリックします。すべてが正常に設定されているはずです。ルールの詳細ページからデータ統合が正常に動作していることを確認できます。

<Image img={data_integration_details} size="md" border alt="設定サマリーを表示するEMQX Cloudデータ統合ルール詳細" />

`temp_hum/emqx`トピックに送信されたすべてのMQTTメッセージは、ClickHouse Cloudデータベースに永続化されます。

## ClickHouseへのデータ保存 {#saving-data-into-clickhouse}

温度と湿度データをシミュレートし、これらのデータをMQTT X経由でEMQX Cloudに報告し、その後EMQX Cloudデータ統合を使用してClickHouse Cloudに保存します。

<Image img={work_flow} size="lg" border alt="データフローを示すEMQX CloudからClickHouseへのワークフローダイアグラム" />

### EMQX CloudにMQTTメッセージをパブリッシュ {#publish-mqtt-messages-to-emqx-cloud}

任意のMQTTクライアントまたはSDKを使用してメッセージをパブリッシュできます。このチュートリアルでは、EMQによって提供されるユーザーフレンドリーなMQTTクライアントアプリケーションである[MQTT X](https://mqttx.app/)を使用します。

<Image img={mqttx_overview} size="lg" border alt="クライアントインターフェースを表示するMQTTX概要" />

MQTTXで「New Connection」をクリックし、接続フォームに入力します。

- 名称: 接続名。好きな名前を使用してください。
- ホスト: MQTTブローカー接続アドレス。EMQX Cloudの概要ページから取得できます。
- ポート: MQTTブローカー接続ポート。EMQX Cloudの概要ページから取得できます。
- ユーザー名/パスワード: 上記で作成した認証情報を使用します。このチュートリアルでは`emqx`と`xxxxxx`となります。

<Image img={mqttx_new} size="lg" border alt="接続詳細を持つMQTTX新規接続設定フォーム" />

右上の「Connect」ボタンをクリックすると、接続が確立されます。

これで、このツールを使用してMQTTブローカーにメッセージを送信できます。
入力：
1. ペイロード形式を「JSON」に設定します。
2. トピックを`temp_hum/emqx`に設定します（ルールで設定したトピック）。
3. JSON本体：

```bash
{"temp": 23.1, "hum": 0.68}
```

右の送信ボタンをクリックします。温度値を変更し、MQTTブローカーにさらにデータを送信できます。

EMQX Cloudに送信されたデータは、ルールエンジンによって処理され、ClickHouse Cloudに自動的に挿入されるはずです。

<Image img={mqttx_publish} size="lg" border alt="メッセージ構成を表示するMQTTXのMQTTメッセージパブリッシュインターフェース" />

### ルールの監視を表示 {#view-rules-monitoring}

ルールの監視を確認し、成功数を追加します。

<Image img={rule_monitor} size="lg" border alt="メッセージ処理メトリクスを表示するEMQX Cloudルール監視ダッシュボード" />

### 永続化されたデータの確認 {#check-the-data-persisted}

今、ClickHouse Cloudのデータを確認する時が来ました。理想的には、MQTTXを使用して送信したデータがEMQX Cloudに入り、ネイティブデータ統合の助けを借りてClickHouse Cloudのデータベースに永続化されるはずです。

ClickHouseのSQLコンソールに接続するか、任意のクライアントツールを使用してClickHouseからデータを取得できます。このチュートリアルではSQLコンソールを使用しました。
SQLを実行することで:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="永続化されたIoTデータを表示するClickHouseクエリ結果" />

### まとめ {#summary}

コードを1行も書かずに、EMQX CloudからClickHouse CloudへMQTTデータを移動させることができました。EMQX CloudとClickHouse Cloudを利用すれば、インフラを管理せず、データがClickHouse Cloudに安全に保存されるIoTアプリケーションの作成に集中できます。
