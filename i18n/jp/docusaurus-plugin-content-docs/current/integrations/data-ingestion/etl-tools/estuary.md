---
sidebar_label: 'Estuary'
slug: /integrations/estuary
description: 'Estuary 連携により多様なデータソースを ClickHouse にストリーミングする'
title: 'Estuary を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://estuary.dev'
keywords: ['estuary', 'データインジェスト', 'ETL', 'パイプライン', 'データ統合', 'ClickPipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# Estuary と ClickHouse を接続する \{#connect-estuary-with-clickhouse\}

<PartnerBadge/>

[Estuary](https://estuary.dev/) は、簡単にセットアップできる ETL パイプラインでリアルタイムデータとバッチデータを柔軟に統合する right-time データプラットフォームです。エンタープライズグレードのセキュリティとデプロイメントオプションにより、Estuary は SaaS、データベース、ストリーミングソースから、ClickHouse を含むさまざまな送信先への永続的なデータフローを実現します。

Estuary は Kafka ClickPipe を介して ClickHouse と接続します。この連携では、独自の Kafka エコシステムを運用・管理する必要はありません。

## セットアップガイド \{#setup-guide\}

**前提条件**

* [Estuary アカウント](https://dashboard.estuary.dev/register)
* 目的のソースからデータを取得する、Estuary 内の 1 つ以上の [**capture**](https://docs.estuary.dev/concepts/captures/)
* ClickPipe 権限を持つ ClickHouse Cloud アカウント

<VerticalStepper headerLevel="h3">

### Estuary の materialization を作成する \{#1-create-an-estuary-materialization\}

Estuary のソースコレクションから ClickHouse にデータを移動するには、まず **materialization** を作成する必要があります。

1. Estuary のダッシュボードで [Destinations](https://dashboard.estuary.dev/materializations) ページに移動します。

2. **+ New Materialization** をクリックします。

3. **ClickHouse** コネクタを選択します。

4. Materialization、Endpoint、Source Collections セクションの詳細を入力します:

   * **Materialization Details:** materialization の一意な名前を指定し、データプレーン（クラウドプロバイダとリージョン）を選択します

   * **Endpoint Config:** セキュアな **Auth Token** を指定します

   * **Source Collections:** 既存の **capture** をリンクするか、ClickHouse に公開するデータコレクションを選択します

5. **Next** をクリックし、続けて **Save and Publish** をクリックします。

6. Materialization の詳細ページで、ClickHouse 向け materialization のフルネームを控えておきます。これは `your-tenant/your-unique-name/dekaf-clickhouse` のような形式になります。

Estuary は、選択したコレクションを Kafka メッセージとしてストリーミングを開始します。ClickHouse は、Estuary の broker 情報と指定した auth token を用いた Kafka ClickPipe を介してこのデータにアクセスできます。

### Kafka 接続情報を入力する \{#2-enter-kafka-connection-details\}

ClickHouse で新しい Kafka ClickPipe をセットアップし、接続情報を入力します:

1. ClickHouse Cloud のダッシュボードで **Data sources** を選択します。

2. 新しい **ClickPipe** を作成します。

3. データソースとして **Apache Kafka** を選択します。

4. Estuary の broker と registry 情報を用いて Kafka 接続情報を入力します:

   * ClickPipe の名前を指定します
   * broker には次を使用します: `dekaf.estuary-data.com:9092`
   * 認証はデフォルトの `SASL/PLAIN` オプションのままにします
   * user には、Estuary の materialization のフルネーム（`your-tenant/your-unique-name/dekaf-clickhouse` など）を入力します
   * password には、materialization 用に指定した auth token を入力します

5. schema registry オプションを有効にします

   * schema URL には次を使用します: `https://dekaf.estuary-data.com`
   * schema key は broker user（materialization 名）と同じになります
   * secret は broker password（auth token）と同じになります

### 受信データを設定する \{#3-configure-incoming-data\}

1. Kafka の **topic** の 1 つ（Estuary からのデータコレクションの 1 つ）を選択します。

2. **offset** を選択します。

3. ClickHouse が topic メッセージを検出します。テーブル情報を構成するために **Parse information** セクションに進むことができます。

4. 新しいテーブルを作成するか、一致する既存テーブルにデータをロードするかを選択します。

5. ソースフィールドをテーブルのカラムにマッピングし、カラム名、型、Nullable かどうかを確認します。

6. 最後の **Details and settings** セクションで、専用データベースユーザーの権限を選択できます。

構成内容に問題がなければ、ClickPipe を作成します。

ClickHouse は新しいデータソースをプロビジョニングし、Estuary からのメッセージの取り込みを開始します。必要なだけ多くの ClickPipe を作成し、目的のすべてのデータコレクションからストリーミングできます。

</VerticalStepper>

## 追加リソース \{#additional-resources\}

Estuary との統合設定の詳細については、Estuary のドキュメントを参照してください：

* Estuary の [ClickHouse materialization に関するドキュメント](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/) を参照してください。

* Estuary は **Dekaf** を使用してデータを Kafka メッセージとして公開します。Dekaf の詳細は[こちら](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/)を参照してください。

* Estuary を使って ClickHouse にストリーミングできるソースの一覧については、[Estuary の capture コネクタ](https://docs.estuary.dev/reference/Connectors/capture-connectors/) を参照してください。