---
title: サポートされているクラウドリージョン
sidebar_label: サポートされているクラウドリージョン
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: ClickHouse Cloudのサポートされているリージョン
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# サポートされているクラウドリージョン

## AWS リージョン {#aws-regions}

- ap-northeast-1 (東京)
- ap-south-1 (ムンバイ)
- ap-southeast-1 (シンガポール)
- ap-southeast-2 (シドニー)
- eu-central-1 (フランクフルト)
- eu-west-1 (アイルランド)
- eu-west-2 (ロンドン)
- me-central-1 (UAE)
- us-east-1 (バージニア州北部)
- us-east-2 (オハイオ州)
- us-west-2 (オレゴン州)

**検討中:**
- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南アメリカ)
 

## Google Cloudリージョン {#google-cloud-regions}

- asia-southeast1 (シンガポール)
- europe-west4 (オランダ)
- us-central1 (アイオワ)
- us-east1 (サウスカロライナ)

**検討中:**
- australia-southeast1 (シドニー)
- us-west-1 (オレゴン州)
- eu-west-1 (ベルギー)

## Azureリージョン {#azure-regions}

- West US 3 (アリゾナ)
- East US 2 (バージニア)
- Germany West Central (フランクフルト)

:::note 
現在リストにないリージョンにデプロイする必要がありますか？ [リクエストを送信](https://clickhouse.com/pricing?modal=open)。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="プライベートリージョン機能"/>

エンタープライズプランのサービス向けにプライベートリージョンを提供しています。プライベートリージョンのリクエストについては、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンに関する重要事項:
- サービスは自動スケーリングされません。
- サービスを停止またはアイドル状態にはできません。
- マニュアルスケーリング（垂直と水平方向の両方）はサポートチケットで有効にできます。
- サービスがCMEKでの構成を必要とする場合、顧客はサービス開始時にAWS KMSキーを提供する必要があります。
- 新しいサービスや追加のサービスを立ち上げるには、サポートチケットを通じてリクエストが必要です。
  
HIPAAコンプライアンスに対しては追加の要件が適用される場合があります（BAAへの署名を含む）。HIPAAは現在エンタープライズプランのサービスにのみ提供されています。

## HIPAA準拠のリージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、営業またはサポートを通じてオンボーディングをリクエストする必要があります。HIPAA準拠のリージョンは以下の通りです:
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI準拠のリージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客は営業またはサポートを通じてオンボーディングをリクエストする必要があります。PCI準拠のリージョンは以下の通りです:
- AWS us-east-1
- AWS us-west-2
