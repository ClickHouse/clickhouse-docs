---
sidebar_label: 'Estuary'
slug: /integrations/estuary
description: 'Estuary との連携を使用して、さまざまなソースから ClickHouse へストリーミングする'
title: 'Estuary と ClickHouse を接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://estuary.dev'
keywords: ['estuary', 'データインジェスト', 'ETL', 'パイプライン', 'データ連携', 'clickpipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# Estuary と ClickHouse を接続する \{#connect-estuary-with-clickhouse\}

<PartnerBadge/>

[Estuary](https://estuary.dev/) は、簡単にセットアップできる ETL パイプラインでリアルタイムデータとバッチデータを柔軟に組み合わせる「right-time」データプラットフォームです。エンタープライズグレードのセキュリティと柔軟なデプロイメントオプションにより、SaaS、データベース、ストリーミングソースから ClickHouse を含むさまざまな宛先へ、信頼性の高い継続的なデータフローを実現します。

Estuary は Kafka ClickPipe を通じて ClickHouse と接続します。この連携では、Kafka 環境を自前で構築・運用する必要はありません。

## セットアップガイド \\{#setup-guide\\}

**前提条件**

* [Estuary アカウント](https://dashboard.estuary.dev/register)
* 希望するソースからデータを取得する、Estuary 上の 1 つ以上の [**capture**](https://docs.estuary.dev/concepts/captures/)
* ClickPipe 権限を持つ ClickHouse Cloud アカウント

<VerticalStepper headerLevel="h3">

### Estuary マテリアライゼーションを作成する \\{#1-create-an-estuary-materialization\\}

Estuary のソースコレクションから ClickHouse にデータを移動するには、まず **マテリアライゼーション** を作成する必要があります。

1. Estuary のダッシュボードで、[Destinations](https://dashboard.estuary.dev/materializations) ページに移動します。

2. **+ New Materialization** をクリックします。

3. **ClickHouse** コネクタを選択します。

4. Materialization、Endpoint、Source Collections セクションの詳細を入力します:

   * **Materialization Details:** マテリアライゼーションに一意の名前を付け、データプレーン (クラウドプロバイダとリージョン) を選択します

   * **Endpoint Config:** セキュアな **Auth Token** を指定します

   * **Source Collections:** 既存の **capture** をリンクするか、ClickHouse に公開するデータコレクションを選択します

5. **Next** をクリックし、続けて **Save and Publish** をクリックします。

6. マテリアライゼーションの詳細ページで、ClickHouse 向けマテリアライゼーションのフルネームを控えておきます。これは `your-tenant/your-unique-name/dekaf-clickhouse` のような形式になります。

Estuary は、選択したコレクションを Kafka メッセージとしてストリーミングし始めます。ClickHouse は、Estuary のブローカー情報と指定した Auth Token を使用した Kafka ClickPipe 経由でこのデータにアクセスできます。

### Kafka 接続情報を入力する \\{#2-enter-kafka-connection-details\\}

ClickHouse で新しい Kafka ClickPipe をセットアップし、接続情報を入力します。

1. ClickHouse Cloud ダッシュボードで **Data sources** を選択します。

2. 新しい **ClickPipe** を作成します。

3. データソースとして **Apache Kafka** を選択します。

4. Estuary のブローカーとレジストリ情報を使用して Kafka 接続情報を入力します:

   * ClickPipe の名前を指定します
   * ブローカーには次を使用します: `dekaf.estuary-data.com:9092`
   * 認証はデフォルトの `SASL/PLAIN` オプションのままにします
   * ユーザーには、Estuary のマテリアライゼーションのフルネーム (例: `your-tenant/your-unique-name/dekaf-clickhouse`) を入力します
   * パスワードには、マテリアライゼーション用に指定した Auth Token を入力します

5. スキーマレジストリのオプションを有効にします

   * スキーマ URL には次を使用します: `https://dekaf.estuary-data.com`
   * スキーマキーはブローカーユーザー (マテリアライゼーション名) と同じ値です
   * シークレットはブローカーパスワード (Auth Token) と同じ値です

### 受信データを構成する \\{#3-configure-incoming-data\\}

1. Kafka の **トピック** の 1 つ (Estuary のデータコレクションの 1 つ) を選択します。

2. **オフセット** を選択します。

3. ClickHouse がトピック内のメッセージを検出します。テーブル情報を構成するため、**Parse information** セクションに進むことができます。

4. 新しいテーブルを作成するか、一致する既存テーブルにデータをロードするかを選択します。

5. ソースフィールドをテーブルカラムにマッピングし、カラム名、型、および Nullable かどうかを確認します。

6. 最後の **Details and settings** セクションで、専用データベースユーザーの権限を選択できます。

設定内容に満足したら、ClickPipe を作成します。

ClickHouse は新しいデータソースをプロビジョニングし、Estuary からのメッセージの取り込みを開始します。必要なだけ多くの ClickPipe を作成して、目的のすべてのデータコレクションからストリーミングできます。

</VerticalStepper>

## 追加リソース \\{#additional-resources\\}

Estuary との連携設定の詳細については、Estuary のドキュメントを参照してください。

* Estuary の [ClickHouse マテリアライゼーションに関するドキュメント](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/) を参照してください。

* Estuary は **Dekaf** を使用して、データを Kafka メッセージとして公開します。Dekaf の詳細は[こちら](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/)を参照してください。

* Estuary を使用して ClickHouse にストリーミングできるソースの一覧は、[Estuary の capture コネクタ](https://docs.estuary.dev/reference/Connectors/capture-connectors/)を確認してください。