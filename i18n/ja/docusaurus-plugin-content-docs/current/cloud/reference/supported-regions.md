---
title: サポートされているクラウドリージョン
sidebar_label: サポートされているクラウドリージョン
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: ClickHouse Cloudのサポートされているリージョン
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# サポートされているクラウドリージョン

## AWSリージョン {#aws-regions}

- ap-northeast-1 (東京)
- ap-south-1 (ムンバイ)
- ap-southeast-1 (シンガポール)
- ap-southeast-2 (シドニー)
- eu-central-1 (フランクフルト)
- eu-west-1 (アイルランド)
- eu-west-2 (ロンドン)
- me-central-1 (UAE)
- us-east-1 (ノースバージニア)
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)

**検討中:**
- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南アメリカ)

## Google Cloud リージョン {#google-cloud-regions}

- asia-southeast1 (シンガポール)
- europe-west4 (オランダ)
- us-central1 (アイオワ)
- us-east1 (サウスカロライナ)

**検討中:**
- australia-southeast1 (シドニー)
- us-west-1 (オレゴン)
- eu-west-1 (ベルギー)

## Azure リージョン {#azure-regions}

- West US 3 (アリゾナ)
- East US 2 (バージニア)
- Germany West Central (フランクフルト)

:::note 
現在リストにないリージョンへのデプロイが必要ですか？ [リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="プライベートリージョン機能"/>

エンタープライズ層サービス向けにプライベートリージョンを提供しています。プライベートリージョンのリクエストは[こちらからお問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンに関する重要な考慮事項:
- サービスは自動スケールしません。
- サービスを停止またはアイドル状態にすることはできません。
- マニュアルスケーリング（縦横両方）がサポートチケットで有効にすることができます。
- サービスがCMEKによる設定を必要とする場合、顧客はサービス起動時にAWS KMSキーを提供する必要があります。
- 新しいサービスや追加サービスを起動するには、サポートチケットを通じてリクエストを行う必要があります。
  
HIPAAコンプライアンスには追加の要件が適用される場合があります（BAAの署名を含む）。なお、HIPAAは現在、エンタープライズ層サービスのみで利用可能です。

## HIPAA準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、HIPAA準拠リージョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリージョンはHIPAAコンプライアンスをサポートしています：
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はPCI準拠リージョンでサービスをセットアップするために営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリージョンはPCIコンプライアンスをサポートしています：
- AWS us-east-1
- AWS us-west-2
