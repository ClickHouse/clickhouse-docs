---
title: 'サポート対象のクラウドリージョン'
sidebar_label: 'サポート対象の Cloud リージョン'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud のサポート対象リージョン'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# サポート対象のクラウドリージョン



## AWSリージョン {#aws-regions}

- ap-northeast-1 (東京)
- ap-northeast-2 (韓国、ソウル)
- ap-south-1 (ムンバイ)
- ap-southeast-1 (シンガポール)
- ap-southeast-2 (シドニー)
- eu-central-1 (フランクフルト)
- eu-west-1 (アイルランド)
- eu-west-2 (ロンドン)
- me-central-1 (UAE)
- us-east-1 (バージニア北部)
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)

**プライベートリージョン:**

- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南米)


## Google Cloudリージョン {#google-cloud-regions}

- asia-southeast1（シンガポール）
- asia-northeast1（東京）
- europe-west4（オランダ）
- us-central1（アイオワ）
- us-east1（サウスカロライナ）

**プライベートリージョン：**

- us-west1（オレゴン）
- australia-southeast1（シドニー）
- europe-west3（フランクフルト）
- europe-west6（チューリッヒ）
- northamerica-northeast1（モントリオール）


## Azureリージョン {#azure-regions}

- 米国西部3 (アリゾナ)
- 米国東部2 (バージニア)
- ドイツ西中部 (フランクフルト)

**プライベートリージョン:**

- 日本東部

:::note
現在リストにないリージョンへのデプロイが必要な場合は、[リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。
:::


## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature='Private regions feature' />

Enterpriseティアサービス向けにプライベートリージョンを提供しています。プライベートリージョンのご利用をご希望の場合は、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンの主な注意事項:

- サービスは自動スケーリングされませんが、手動による垂直および水平スケーリングはサポートされています。
- サービスをアイドル状態にすることはできません。
- プライベートリージョンではステータスページは利用できません。

HIPAA準拠には追加要件が適用される場合があります(BAA(事業提携契約)への署名を含む)。なお、HIPAAは現在Enterpriseティアサービスでのみ利用可能です。


## HIPAA準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature='HIPAA' support='true' />

HIPAA準拠リージョンでサービスを設定するには、お客様はBusiness Associate Agreement（BAA）に署名し、営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリージョンがHIPAAコンプライアンスをサポートしています：

- AWS af-south-1（南アフリカ）**プライベートリージョン**
- AWS ca-central-1（カナダ）**プライベートリージョン**
- AWS eu-central-1（フランクフルト）
- AWS eu-north-1（ストックホルム）**プライベートリージョン**
- AWS eu-west-1（アイルランド）
- AWS eu-west-2（ロンドン）
- AWS sa-east-1（南米）**プライベートリージョン**
- AWS us-east-1（バージニア北部）
- AWS us-east-2（オハイオ）
- AWS us-west-2（オレゴン）
- GCP europe-west4（オランダ）
- GCP us-central1（アイオワ）
- GCP us-east1（サウスカロライナ）


## PCI準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature='PCI' support='true' />

PCI準拠リージョンでサービスを設定するには、営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリージョンがPCI準拠に対応しています:

- AWS af-south-1 (南アフリカ) **プライベートリージョン**
- AWS ca-central-1 (カナダ) **プライベートリージョン**
- AWS eu-central-1 (フランクフルト)
- AWS eu-north-1 (ストックホルム) **プライベートリージョン**
- AWS eu-west-1 (アイルランド)
- AWS eu-west-2 (ロンドン)
- AWS sa-east-1 (南米) **プライベートリージョン**
- AWS us-east-1 (バージニア北部)
- AWS us-east-2 (オハイオ)
- AWS us-west-2 (オレゴン)
