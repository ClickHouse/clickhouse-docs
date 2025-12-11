---
sidebar_label: 'EMQX'
sidebar_position: 1
slug: /integrations/emqx
description: 'ClickHouse と統合する EMQX の概要'
title: 'EMQX と ClickHouse の統合'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
keywords: ['EMQX ClickHouse 統合', 'MQTT ClickHouse コネクタ', 'EMQX Cloud ClickHouse 統合', 'IoT データ ClickHouse 統合', 'MQTT ブローカー ClickHouse 統合']
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

# EMQX と ClickHouse の統合 {#integrating-emqx-with-clickhouse}

## EMQX への接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise) は、オープンソースの MQTT ブローカーであり、高性能なリアルタイムメッセージ処理エンジンを備え、大規模に IoT デバイス向けのイベントストリーミングを実現します。最もスケーラブルな MQTT ブローカーとして、EMQX はあらゆるデバイスを、あらゆるスケールで接続するのに役立ちます。IoT データをどこへでも移動させ、処理できます。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud) は、[EMQ](https://www.emqx.com/en) によってホストされる、IoT 分野向けの MQTT メッセージングミドルウェア製品です。世界初の完全マネージドな MQTT 5.0 クラウドメッセージングサービスとして、EMQX Cloud は運用・保守 (O&amp;M) を一括して提供し、MQTT メッセージングサービス向けに専用の分離環境を提供します。あらゆるものがインターネットにつながる時代において、EMQX Cloud は IoT 分野向けの業界アプリケーションをすばやく構築し、IoT データを容易に収集・伝送・計算・永続化することを可能にします。

クラウドプロバイダーによって提供されるインフラストラクチャを利用することで、EMQX Cloud は世界中の数十の国と地域にサービスを提供し、5G およびあらゆるもののインターネット向けアプリケーションに対して、低コストで安全かつ信頼性の高いクラウドサービスを提供します。

<Image img={emqx_cloud_artitecture} size="lg" border alt="クラウドインフラストラクチャコンポーネントを示す EMQX Cloud アーキテクチャ図" />

### 前提条件 {#assumptions}

* 非常に軽量な publish/subscribe 型のメッセージング・トランスポート・プロトコルとして設計された [MQTT プロトコル](https://mqtt.org/) に精通している。
* 大規模な IoT デバイス向けイベントストリーミングを実現するリアルタイムメッセージ処理エンジンとして、EMQX または EMQX Cloud を利用している。
* デバイスデータを永続化するための ClickHouse Cloud インスタンスを用意している。
* EMQX Cloud のデプロイに接続して MQTT データをパブリッシュするための MQTT クライアントテストツールとして、[MQTT X](https://mqttx.app/) を使用している。または、MQTT ブローカーへの接続が可能な他の方法を使用してもよい。

## ClickHouse Cloud サービスを取得する {#get-your-clickhouse-cloudservice}

このセットアップでは、ClickHouse インスタンスを N. Virginia (us-east-1) の AWS 上にデプロイし、同じリージョンに EMQX Cloud インスタンスもデプロイしました。

<Image img={clickhouse_cloud_1} size="sm" border alt="AWS リージョン選択を表示している ClickHouse Cloud サービスのデプロイインターフェース" />

セットアップの過程では、接続設定にも注意を払う必要があります。本チュートリアルでは「Anywhere」を選択していますが、特定のロケーションを指定する場合は、EMQX Cloud デプロイメントから取得した [NAT gateway](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html) の IP アドレスを許可リストに追加する必要があります。

<Image img={clickhouse_cloud_2} size="sm" border alt="IP アクセス設定を表示している ClickHouse Cloud の接続設定画面" />

続いて、今後使用するためにユーザー名とパスワードを保存しておきます。

<Image img={clickhouse_cloud_3} size="sm" border alt="ユーザー名とパスワードを表示している ClickHouse Cloud の認証情報画面" />

その後、稼働中の ClickHouse インスタンスが利用可能になります。「Connect」をクリックして、ClickHouse Cloud のインスタンス接続アドレスを取得します。

<Image img={clickhouse_cloud_4} size="lg" border alt="接続オプション付きの ClickHouse Cloud 稼働中インスタンスのダッシュボード" />

「Connect to SQL Console」をクリックして、EMQX Cloud との連携用のデータベースとテーブルを作成します。

<Image img={clickhouse_cloud_5} size="lg" border alt="ClickHouse Cloud の SQL Console インターフェース" />

以下の SQL 文を参照するか、実際の状況に応じて SQL を調整してください。

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

<Image img={clickhouse_cloud_6} size="lg" border alt="ClickHouse Cloud におけるデータベースおよびテーブル作成用 SQL クエリの実行画面" />

## EMQX Cloud 上に MQTT サービスを作成する {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud 上に専用の MQTT ブローカーを作成するのは、数回クリックするだけで済みます。

### アカウントを作成する {#get-an-account}

EMQX Cloud は、すべてのアカウントに対して Standard デプロイメントと Professional デプロイメントの両方に 14 日間の無料トライアルを提供しています。

[EMQX Cloud sign up](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud) ページにアクセスし、EMQX Cloud を初めて使用する場合は「start free」をクリックしてアカウントを登録します。

<Image img={emqx_cloud_sign_up} size="lg" border alt="登録フォームが表示された EMQX Cloud サインアップページ" />

### MQTT クラスターを作成する {#create-an-mqtt-cluster}

ログインしたら、アカウントメニューの "Cloud console" をクリックすると、新しいデプロイメントを作成するための緑色のボタンが表示されます。

<Image img={emqx_cloud_create_1} size="lg" border alt="デプロイメントオプションを表示する EMQX Cloud デプロイメント作成ステップ 1" />

このチュートリアルでは Professional デプロイメントを使用します。データ統合機能を提供しているのは Pro バージョンのみであり、これにより 1 行のコードも書かずに MQTT データを直接 ClickHouse に送信できます。

Pro バージョンを選択し、`N.Virginial` リージョンを選択して `Create Now` をクリックします。数分で、フルマネージドの MQTT ブローカーが利用できるようになります。

<Image img={emqx_cloud_create_2} size="lg" border alt="リージョン選択を表示する EMQX Cloud デプロイメント作成ステップ 2" />

次にパネルをクリックしてクラスタービューに移動します。このダッシュボードでは、MQTT ブローカーの概要を確認できます。

<Image img={emqx_cloud_overview} size="lg" border alt="ブローカーのメトリクスを表示する EMQX Cloud 概要ダッシュボード" />

### クライアント認証情報を追加する {#add-client-credential}

EMQX Cloud はデフォルトで匿名接続を許可しないため、MQTT クライアントツールを使用してこのブローカーにデータを送信できるように、クライアント認証情報を追加する必要があります。

左側のメニューで「Authentication & ACL」をクリックし、サブメニューで「Authentication」をクリックします。右側の「Add」ボタンをクリックし、後で MQTT 接続に使用するユーザー名とパスワードを設定します。ここではユーザー名とパスワードとして `emqx` と `xxxxxx` を使用します。

<Image img={emqx_cloud_auth} size="lg" border alt="認証情報を追加するための EMQX Cloud 認証設定インターフェース" />

「Confirm」をクリックすると、フルマネージドの MQTT ブローカーの準備が完了します。

### NAT ゲートウェイを有効化する {#enable-nat-gateway}

ClickHouse との連携を設定し始める前に、まず NAT ゲートウェイを有効にする必要があります。デフォルトでは、MQTT ブローカーはプライベート VPC 内にデプロイされており、インターネット経由でサードパーティシステムにデータを送信することはできません。

Overview ページに戻り、ページの一番下までスクロールすると NAT ゲートウェイのウィジェットが表示されます。「Subscribe」ボタンをクリックし、指示に従います。NAT Gateway は付加価値サービスですが、14 日間の無料トライアルも提供されています。

<Image img={emqx_cloud_nat_gateway} size="lg" border alt="EMQX Cloud NAT ゲートウェイ設定パネル" />

作成が完了すると、ウィジェット内にパブリック IP アドレスが表示されます。ClickHouse Cloud のセットアップ時に「Connect from a specific location」を選択した場合は、この IP アドレスをホワイトリストに追加する必要がある点に注意してください。

## EMQX Cloud と ClickHouse Cloud の統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud Data Integrations](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow) 機能は、EMQX のメッセージフローおよびデバイスイベントを処理し応答するためのルールを構成するために使用されます。Data Integrations は、明確かつ柔軟な「設定可能な」アーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザビリティを向上させ、業務システムと EMQX Cloud 間の結合度を低減します。また、EMQX Cloud 固有機能のカスタマイズに対して優れた基盤インフラストラクチャも提供します。

<Image img={emqx_cloud_data_integration} size="lg" border alt="EMQX Cloud Data Integration のオプションと利用可能なコネクタを表示している画面" />

EMQX Cloud は、代表的なデータシステム向けに 30 を超えるネイティブ連携機能を提供しています。ClickHouse もその 1 つです。

<Image img={data_integration_clickhouse} size="lg" border alt="EMQX Cloud ClickHouse Data Integration コネクタの詳細" />

### ClickHouse リソースの作成 {#create-clickhouse-resource}

左側メニューの「Data Integrations」をクリックし、「View All Resources」をクリックします。Data Persistence セクションで ClickHouse を見つけるか、ClickHouse を検索します。

ClickHouse カードをクリックして新しいリソースを作成します。

* Note: このリソースに関するメモを追加します。
* Server address: これは ClickHouse Cloud サービスのアドレスです。ポートを忘れないようにしてください。
* Database name: 上記の手順で作成した `emqx`。
* User: ClickHouse Cloud サービスに接続するためのユーザー名。
* Key: 接続用のパスワード。

<Image img={data_integration_resource} size="lg" border alt="接続情報を入力する EMQX Cloud ClickHouse Resource 設定フォーム" />

### 新しいルールの作成 {#create-a-new-rule}

リソース作成時にポップアップが表示され、「New」をクリックするとルール作成ページに移動します。

EMQX は強力な [rule engine](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html) を提供しており、サードパーティシステムに送信する前に、生の MQTT メッセージを変換および拡張できます。

このチュートリアルで使用するルールは次のとおりです。

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

`temp_hum/emqx` トピックからメッセージを読み取り、JSON オブジェクトに client&#95;id、topic、timestamp の情報を付与して補完します。

つまり、トピックに送信する生の JSON は次のようになります。

```bash
{"temp": 28.5, "hum": 0.68}
```

<Image img={data_integration_rule_1} size="md" border alt="EMQX Cloud データインテグレーションルール作成ステップ 1（SQL クエリを表示）" />

SQL のテスト機能を使ってテストを実行し、結果を確認できます。

<Image img={data_integration_rule_2} size="md" border alt="EMQX Cloud データインテグレーションルール作成ステップ 2（テスト結果を表示）" />

次に「NEXT」ボタンをクリックします。このステップでは、EMQX Cloud に対して、整形されたデータを ClickHouse データベースにどのように挿入するかを指定します。

### レスポンスアクションを追加する {#add-a-response-action}

リソースが 1 つだけの場合は、「Resource」と「Action Type」を変更する必要はありません。
SQL テンプレートを設定するだけで構いません。このチュートリアルで使用している例は次のとおりです。

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

<Image img={data_integration_rule_action} size="md" border alt="SQL テンプレートを使用した EMQX Cloud データ統合ルールアクションのセットアップ" />

これは ClickHouse にデータを挿入するためのテンプレートです。ここで変数がどのように利用されているか確認できます。

### ルールの詳細を表示 {#view-rules-details}

「Confirm」と「View Details」をクリックします。これで、すべての設定が完了しているはずです。ルール詳細ページから、データ統合が正しく動作していることを確認できます。

<Image img={data_integration_details} size="md" border alt="設定サマリーを表示している EMQX Cloud データ統合ルール詳細" />

`temp_hum/emqx` トピックに送信されたすべての MQTT メッセージは、ClickHouse Cloud データベースに永続化されます。

## ClickHouse へのデータ保存 {#saving-data-into-clickhouse}

温度と湿度のデータをシミュレートし、そのデータを MQTT X を介して EMQX Cloud に送信します。その後、EMQX Cloud Data Integrations を使用してデータを ClickHouse Cloud に保存します。

<Image img={work_flow} size="lg" border alt="EMQX Cloud から ClickHouse へのワークフローを示すデータフロー図" />

### MQTT メッセージを EMQX Cloud にパブリッシュする {#publish-mqtt-messages-to-emqx-cloud}

メッセージのパブリッシュには、任意の MQTT クライアントまたは SDK を使用できます。本チュートリアルでは、EMQ が提供するユーザーフレンドリーな MQTT クライアントアプリケーションである [MQTT X](https://mqttx.app/) を使用します。

<Image img={mqttx_overview} size="lg" border alt="クライアントインターフェースを表示している MQTTX の概要" />

MQTTX で &quot;New Connection&quot; をクリックし、接続フォームに入力します。

* Name: 接続名。任意の名前を使用できます。
* Host: MQTT ブローカーの接続アドレス。EMQX Cloud の概要ページから取得できます。
* Port: MQTT ブローカーの接続ポート。EMQX Cloud の概要ページから取得できます。
* Username/Password: 先ほど作成した認証情報を使用します。本チュートリアルでは `emqx` と `xxxxxx` になっているはずです。

<Image img={mqttx_new} size="lg" border alt="接続詳細を設定する MQTTX の新規接続セットアップフォーム" />

右上の &quot;Connect&quot; ボタンをクリックすると、接続が確立されます。

これで、このツールを使って MQTT ブローカーにメッセージを送信できるようになりました。
入力内容は次のとおりです。

1. payload format を &quot;JSON&quot; に設定します。
2. topic を `temp_hum/emqx` に設定します（先ほどルールで設定したトピック）。
3. JSON body:

```bash
{"temp": 23.1, "hum": 0.68}
```

右側の送信ボタンをクリックします。`temperature` の値を変更して、MQTT ブローカーにさらにデータを送信できます。

EMQX Cloud に送信されたデータは、ルールエンジンによって処理され、自動的に ClickHouse Cloud に挿入されます。

<Image img={mqttx_publish} size="lg" border alt="MQTTX Publish MQTT Messages インターフェースにおけるメッセージ作成画面" />

### ルール監視を確認する {#view-rules-monitoring}

ルール監視を開き、成功数が 1 件増えていることを確認します。

<Image img={rule_monitor} size="lg" border alt="EMQX Cloud Rule Monitoring ダッシュボードにおけるメッセージ処理メトリクス" />

### 永続化されたデータを確認する {#check-the-data-persisted}

ClickHouse Cloud 上のデータを確認します。理想的には、MQTTX を使って送信したデータは EMQX Cloud に送られ、ネイティブなデータ統合機能により ClickHouse Cloud のデータベースに永続化されます。

ClickHouse Cloud のパネルから SQL コンソールに接続するか、任意のクライアントツールを使用して ClickHouse からデータを取得できます。このチュートリアルでは SQL コンソールを使用します。
次の SQL を実行します:

```bash
SELECT * FROM emqx.temp_hum;
```

<Image img={clickhouse_result} size="lg" border alt="ClickHouse のクエリ結果で永続化された IoT データを表示している画面" />

### まとめ {#summary}

コードを一行も書くことなく、MQTT データを EMQX Cloud から ClickHouse Cloud へ送れるようになりました。EMQX Cloud と ClickHouse Cloud を使えば、インフラの運用・管理は不要になり、ClickHouse Cloud に安全に保存されたデータを活用して IoT アプリケーションの開発に専念できます。
