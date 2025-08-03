---
title: 'Supported Cloud Regions'
sidebar_label: 'Supported Cloud Regions'
keywords:
- 'aws'
- 'gcp'
- 'google cloud'
- 'azure'
- 'cloud'
- 'regions'
description: 'Supported regions for ClickHouse Cloud'
slug: '/cloud/reference/supported-regions'
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
- us-east-1 (バージニア州北部)
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)

**検討中:**
- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南アメリカ)
- ap-northeast-2 (韓国、ソウル)

## Google Cloudリージョン {#google-cloud-regions}

- asia-southeast1 (シンガポール)
- europe-west4 (オランダ)
- us-central1 (アイオワ)
- us-east1 (サウスカロライナ)

**検討中:**

- us-west1 (オレゴン)
- australia-southeast1 (シドニー)
- asia-northeast1 (東京)
- europe-west3 (フランクフルト)
- europe-west6 (チューリッヒ)
- northamerica-northeast1 (モントリオール)

## Azureリージョン {#azure-regions}

- West US 3 (アリゾナ)
- East US 2 (バージニア)
- Germany West Central (フランクフルト)

**検討中:**

JapanEast
:::note 
現在リストにないリージョンにデプロイが必要ですか？ [リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

企業向けプランサービスにはプライベートリージョンをご利用いただけます。プライベートリージョンのリクエストについては、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンに関する重要な考慮事項:
- サービスは自動スケールしません。
- サービスは停止またはアイドル状態にできません。
- マニュアルスケーリング（垂直および水平の両方）はサポートチケットで有効にできます。
- サービスがCMEKでの設定を必要とする場合、顧客はサービス開始時にAWS KMSキーを提供する必要があります。
- 新たなサービスを起動するためには、リクエストをサポートチケットを通じて行う必要があります。

HIPAAコンプライアンスに関しては追加の要件がある場合があります（BAAへの署名を含む）。HIPAAは現在、企業向けプランサービスのみで利用可能です。

## HIPAA準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、営業またはサポートを通じてオンボーディングをリクエストする必要があります。HIPAA準拠リージョンは以下の通りです:
- AWS eu-central-1 (フランクフルト)
- AWS eu-west-2 (ロンドン)
- AWS us-east-1 (バージニア州北部)
- AWS us-east-2 (オハイオ)
- AWS us-west-2 (オレゴン)
- GCP us-central1 (アイオワ)
- GCP us-east1 (サウスカロライナ)

## PCI準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

顧客はPCI準拠リージョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。PCI準拠をサポートするリージョンは以下の通りです:
- AWS eu-central-1 (フランクフルト)
- AWS eu-west-2 (ロンドン)
- AWS us-east-1 (バージニア州北部)
- AWS us-east-2 (オハイオ)
- AWS us-west-2 (オレゴン)
