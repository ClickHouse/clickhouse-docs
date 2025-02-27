---
sidebar_label: EMQX
sidebar_position: 1
slug: /integrations/emqx
description: EMQXとClickHouseの統合についての紹介

---

# EMQXとClickHouseの統合

## EMQXへの接続 {#connecting-emqx}

[EMQX](https://www.emqx.com/en/try?product=enterprise)は、高性能なリアルタイムメッセージ処理エンジンを持つオープンソースのMQTTブローカーであり、大規模なIoTデバイス向けのイベントストリーミングを支えています。最もスケーラブルなMQTTブローカーであるEMQXは、任意のスケールで任意のデバイスを接続するのに役立ちます。IoTデータをどこでも移動し、処理します。

[EMQX Cloud](https://www.emqx.com/en/try?product=cloud)は、[EMQ](https://www.emqx.com/en)がホストするIoTドメイン向けのMQTTメッセージングミドルウェア製品です。世界初の完全管理型MQTT 5.0クラウドメッセージングサービスとして、EMQX Cloudはワンストップの運用・保守を提供し、MQTTメッセージングサービスのためのユニークな隔離環境を提供します。すべてのものがインターネットでつながる時代に、EMQX CloudはIoTドメイン向けの業界アプリケーションの迅速な構築を支援し、IoTデータの収集、伝送、計算、および保存を容易にします。

クラウドプロバイダーが提供するインフラストラクチャを活用し、EMQX Cloudは世界中の数十の国や地域で5Gおよびインターネットオブエブリシングアプリケーション向けの低コストで安全かつ信頼性の高いクラウドサービスを提供しています。

![EMQX Cloud アーキテクチャ](./images/emqx-cloud-artitecture.png)

### 前提条件 {#assumptions}

* あなたは、非常に軽量な公開/購読メッセージトランスポートプロトコルとして設計された[MQTTプロトコル](https://mqtt.org/)に精通しています。
* あなたは、リアルタイムメッセージ処理エンジンとしてEMQXまたはEMQX Cloudを使用しており、大規模なIoTデバイス向けのイベントストリーミングを支えています。
* デバイスデータを保存するためにClickhouse Cloudインスタンスを準備しています。
* 私たちは、MQTTデータを公開するためにEMQX Cloudのデプロイメントに接続するために[MQTT X](https://mqttx.app/)をMQTTクライアントテストツールとして使用しています。他の方法でMQTTブローカーに接続しても問題ありません。


## ClickHouse Cloud サービスの取得 {#get-your-clickhouse-cloudservice}

このセットアップ中に、私たちはN.バージニア（us-east-1）のAWSにClickHouseインスタンスをデプロイし、同じ地域にEMQX Cloudインスタンスもデプロイしました。

![clickhouse_cloud_1](./images/clickhouse_cloud_1.png)

セットアッププロセス中に、接続設定にも注意が必要です。このチュートリアルでは「Anywhere」を選びましたが、特定の場所を申請する場合は、EMQX Cloudデプロイメントから取得した[NATゲートウェイ](https://docs.emqx.com/en/cloud/latest/vas/nat-gateway.html)のIPアドレスをホワイトリストに追加する必要があります。

![clickhouse_cloud_2](./images/clickhouse_cloud_2.png)

その後、今後の利用のためにユーザー名とパスワードを保存する必要があります。

![clickhouse_cloud_3](./images/clickhouse_cloud_3.png)

その後、動作中のClickHouseインスタンスを取得します。Clickhouse Cloudのインスタンス接続アドレスを取得するために「接続」をクリックします。

![clickhouse_cloud_4](./images/clickhouse_cloud_4.png)

「SQLコンソールに接続」をクリックして、EMQX Cloudと統合するためのデータベースとテーブルを作成します。

![clickhouse_cloud_5](./images/clickhouse_cloud_5.png)

以下のSQL文を参照するか、実際の状況に応じてSQLを変更できます。

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

![clickhouse_cloud_6](./images/clickhouse_cloud_6.png)

## EMQX Cloud上にMQTTサービスを作成する {#create-an-mqtt-service-on-emqx-cloud}

EMQX Cloud上に専用のMQTTブローカーを作成するのは、数回のクリックで簡単です。

### アカウントを取得する {#get-an-account}

EMQX Cloudは、標準デプロイメントとプロフェッショナルデプロイメントの両方に対して、すべてのアカウントに14日間の無料トライアルを提供します。

新しくEMQX Cloudを使用する場合は、[EMQX Cloud サインアップ](https://accounts.emqx.com/signup?continue=https%3A%2F%2Fwww.emqx.com%2Fen%2Fcloud)ページにアクセスし、「無料で開始」をクリックしてアカウントを登録します。

![EMQX Cloud サインアップ](./images/emqx_cloud_sign_up.png)

### MQTTクラスターを作成する {#create-an-mqtt-cluster}

ログイン後、アカウントメニューの「Cloud Console」をクリックすると、新しいデプロイメントを作成するためのグリーンボタンが表示されます。

![EMQX Cloud 作成 1](./images/emqx_cloud_create_1.png)

このチュートリアルでは、プロフェッショナルデプロイメントを使用します。なぜなら、Proバージョンのみがデータ統合機能を提供し、MQTTデータをClickHouseに直接送信することができるからです。

Proバージョンを選択し、`N.Virginial`地域を選択して「今すぐ作成」をクリックします。数分で完全管理型のMQTTブローカーが得られます：

![EMQX Cloud 作成 2](./images/emqx_cloud_create_2.png)

今、パネルをクリックしてクラスターのビューに移動します。このダッシュボードでは、MQTTブローカーの概要を見ることができます。

![EMQX Cloud 概要](./images/emqx_cloud_overview.png)

### クライアント資格情報の追加 {#add-client-credential}

EMQX Cloudでは、デフォルトで匿名接続は許可されていないため、MQTTクライアントツールがこのブローカーにデータを送信できるように、クライアント資格情報を追加する必要があります。

左メニューで「認証とACL」をクリックし、サブメニューで「認証」をクリックします。右側の「追加」ボタンをクリックし、後でMQTT接続のためにユーザー名とパスワードを設定します。ここでは、ユーザー名に`emqx`、パスワードに`xxxxxx`を使用します。

![EMQX Cloud 認証](./images/emqx_cloud_auth.png)

「確認」をクリックすると、完全管理型のMQTTブローカーが準備完了となります。

### NATゲートウェイを有効にする {#enable-nat-gateway}

ClickHouse統合の設定を開始する前に、まずNATゲートウェイを有効にする必要があります。デフォルトでは、MQTTブローカーはプライベートVPCにデプロイされており、パブリックネットワークを介してサードパーティシステムにデータを送信することができません。

概要ページに戻り、ページの下部にスクロールすると、NATゲートウェイウィジェットが表示されます。「Subscribe」ボタンをクリックし、指示に従います。NATゲートウェイは付加価値サービスですが、14日間の無料トライアルも提供しています。

![EMQX Cloud NATゲートウェイ](./images/emqx_cloud_nat_gateway.png)

作成が完了したら、ウィジェットにパブリックIPアドレスが表示されます。ClickHouse Cloudのセットアップ中に「特定の場所から接続する」を選択した場合、このIPアドレスをホワイトリストに追加する必要があることに注意してください。


## EMQX CloudとClickHouse Cloudの統合 {#integration-emqx-cloud-with-clickhouse-cloud}

[EMQX Cloud データ統合](https://docs.emqx.com/en/cloud/latest/rule_engine/introduction.html#general-flow)は、EMQXメッセージフローとデバイスイベントを処理および応答するためのルールを構成するために使用されます。データ統合は、「構成可能」なアーキテクチャソリューションを提供するだけでなく、開発プロセスを簡素化し、ユーザビリティを向上させ、ビジネスシステムとEMQX Cloud間の結合度を低減します。また、EMQX Cloudの独自の機能のカスタマイズのための優れたインフラストラクチャも提供します。

![EMQX Cloud データ統合](./images/emqx_cloud_data_integration.png)

EMQX Cloudは、人気のあるデータシステムとの30以上のネイティブ統合を提供しています。ClickHouseはその一つです。

![データ統合 ClickHouse](./images/data_integration_clickhouse.png)

### ClickHouseリソースを作成する {#create-clickhouse-resource}

左メニューで「データ統合」をクリックし、「すべてのリソースを表示」をクリックします。データ持続性セクションでClickHouseを見つけるか、ClickHouseを検索できます。

ClickHouseカードをクリックして新しいリソースを作成します。

- ノート: このリソースにメモを追加します。
- サーバーアドレス: これはClickHouse Cloudサービスのアドレスです。ポートを忘れないでください。
- データベース名: 上記のステップで作成した`emqx`。
- ユーザー: ClickHouse Cloudサービスに接続するためのユーザー名。
- キー: 接続のためのパスワード。

![データ統合リソース](./images/data_integration_resource.png)

### 新しいルールを作成する {#create-a-new-rule}

リソース作成中にポップアップが表示され、「新規」をクリックするとルール作成ページに移動します。

EMQXは、サードパーティシステムに送信する前に生のMQTTメッセージを変換および補強する強力な[ルールエンジン](https://docs.emqx.com/en/cloud/latest/rule_engine/rules.html)を提供しています。

このチュートリアルで使用されるルールは次の通りです：

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

このクエリは、`temp_hum/emqx`トピックからメッセージを読み取り、client_id、topic、およびtimestamp情報を追加してJSONオブジェクトを補強します。

したがって、トピックに送信する生のJSONは次のようになります：

```bash
{"temp": 28.5, "hum": 0.68}
```

![データ統合ルール 1](./images/data_integration_rule_1.png)

SQLテストを使用してテストし、結果を見ることができます。

![データ統合ルール 2](./images/data_integration_rule_2.png)

今、「次へ」ボタンをクリックします。このステップでは、EMQX Cloudにどのように洗練されたデータをClickHouseデータベースに挿入するかを指示します。

### 応答アクションを追加する {#add-a-response-action}

リソースが一つだけであれば、「リソース」と「アクションタイプ」を変更する必要はありません。
SQLテンプレートを設定するだけで済みます。このチュートリアルで使用される例は次の通りです：

```bash
INSERT INTO temp_hum (client_id, timestamp, topic, temp, hum) VALUES ('${client_id}', ${timestamp}, '${topic}', ${temp}, ${hum})
```

![データ統合ルールアクション](./images/data_integration_rule_action.png)

これはClickHouseへのデータ挿入用のテンプレートで、ここで変数が使用されていることがわかります。

### ルールの詳細を見る {#view-rules-details}

「確認」をクリックし、「詳細を表示」をクリックします。これで、すべてが正しく設定されたことを確認できます。ルール詳細ページからデータ統合が正しく動作している様子が確認できます。

![データ統合詳細](./images/data_integration_details.png)

`temp_hum/emqx`トピックに送信されたすべてのMQTTメッセージは、ClickHouse Cloudデータベースに保存されます。

## ClickHouseへのデータ保存 {#saving-data-into-clickhouse}

私たちは、温度と湿度のデータをシミュレートし、これらのデータをMQTT Xを介してEMQX Cloudに報告し、その後EMQX Cloudのデータ統合を使用してデータをClickHouse Cloudに保存します。

![ワークフロー](./images/work-flow.png)

### EMQX CloudにMQTTメッセージを公開する {#publish-mqtt-messages-to-emqx-cloud}

任意のMQTTクライアントまたはSDKを使用してメッセージを公開できます。このチュートリアルでは、EMQが提供するユーザーフレンドリーなMQTTクライアントアプリケーションである[MQTT X](https://mqttx.app/)を使用します。

![MQTTX 概要](./images/mqttx-overview.png)

MQTTXで「新しい接続」をクリックし、接続フォームを入力します：

- 名前: 接続名。好きな名前を使用してください。
- ホスト: MQTTブローカー接続アドレス。EMQX Cloudの概要ページから取得できます。
- ポート: MQTTブローカー接続ポート。EMQX Cloudの概要ページから取得できます。
- ユーザー名/パスワード: 上記で作成した資格情報を使用します。このチュートリアルでは`emqx`と`xxxxxx`です。

![MQTTX 新規](./images/mqttx-new.png)

右上の「接続」ボタンをクリックすると、接続が確立されます。

これで、このツールを使用してMQTTブローカーにメッセージを送信できます。
入力内容：
1. ペイロード形式を「JSON」に設定します。
2. トピックを`temp_hum/emqx`に設定します（ルールで設定したトピック）。
3. JSON本文：

```bash
{"temp": 23.1, "hum": 0.68}
```

右側の送信ボタンをクリックします。温度値を変更し、さらにデータをMQTTブローカーに送信できます。

EMQX Cloudに送信されたデータは、ルールエンジンによって処理され、自動的にClickHouse Cloudに挿入されるはずです。

![MQTTX 公開](./images/mqttx-publish.png)

### ルールの監視を見る {#view-rules-monitoring}

ルールの監視を確認し、成功の数を1増やします。

![ルール監視](./images/rule_monitor.png)

### 保存されたデータを確認する {#check-the-data-persisted}

今、ClickHouse Cloud上のデータを確認する時が来ました。理想的には、MQTTXを使用して送信したデータがEMQX Cloudに送信され、ネイティブデータ統合の助けを借りてClickHouse Cloudのデータベースに保存されるはずです。

ClickHouse Cloudパネル上のSQLコンソールに接続するか、任意のクライアントツールを使用してClickHouseからデータを取得できます。このチュートリアルではSQLコンソールを使用しました。
SQLを実行します：

```bash
SELECT * FROM emqx.temp_hum;
```

![clickhouse_result](./images/clickhouse_result.png)

### まとめ {#summary}

あなたは一行のコードも書かずに、EMQX CloudからClickHouse CloudにMQTTデータが移動するのを実現しました。EMQX CloudとClickHouse Cloudを使えば、インフラを管理する必要はなく、データがClickHouse Cloudに安全に保存されるIoTアプリケーションの開発に集中できます。
