---
'title': 'サポートされているクラウドリージョン'
'sidebar_label': 'サポートされているクラウドリージョン'
'keywords':
- 'aws'
- 'gcp'
- 'google cloud'
- 'azure'
- 'cloud'
- 'regions'
'description': 'ClickHouse Cloudのサポートされているリージョン'
'slug': '/cloud/reference/supported-regions'
'doc_type': 'reference'
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
- us-east-1 (N. バージニア)
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)

**プライベートリージョン:**
- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南アメリカ)
- ap-northeast-2 (南韓、ソウル)

## Google Cloudリージョン {#google-cloud-regions}

- asia-southeast1 (シンガポール)
- europe-west4 (オランダ)
- us-central1 (アイオワ)
- us-east1 (サウスカロライナ)

**プライベートリージョン:**

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

**プライベートリージョン:**

- JapanEast

:::note 
現在リストに載っていないリージョンにデプロイする必要がありますか？ [リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

エンタープライズプランのサービスではプライベートリージョンを提供しています。プライベートリージョンのリクエストについては、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンに関する重要な考慮事項:
- サービスは自動スケールしません。
- サービスは停止またはアイドル状態にできません。
- サポートチケットを使用して手動スケーリング（垂直および水平の両方）が可能です。
- サービスの立ち上げ時にCMEKでの構成が必要な場合、顧客はAWS KMSキーを提供しなければなりません。
- 新しい追加のサービスを立ち上げるには、サポートチケットによるリクエストが必要です。

HIPAAコンプライアンスに関しては、追加の要件が適用される場合があります（BAAへの署名を含む）。HIPAAは現在、エンタープライズプランのサービスにのみ利用可能であることに注意してください。

## HIPAA準拠のリージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、HIPAA準拠のリージョンでサービスを設定するために営業部門またはサポートにオンボーディングをリクエストする必要があります。以下のリージョンはHIPAAコンプライアンスをサポートしています：
- AWS eu-central-1 (フランクフルト)
- AWS eu-west-2 (ロンドン)
- AWS us-east-1 (N. バージニア)
- AWS us-east-2 (オハイオ)
- AWS us-west-2 (オレゴン)
- GCP europe-west4 (オランダ)
- GCP us-central1 (アイオワ)
- GCP us-east1 (サウスカロライナ)

## PCI準拠のリージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

顧客はPCI準拠のリージョンでサービスを設定するために営業部門またはサポートにオンボーディングをリクエストする必要があります。以下のリージョンはPCIコンプライアンスをサポートしています：
- AWS eu-central-1 (フランクフルト)
- AWS eu-west-2 (ロンドン)
- AWS us-east-1 (N. バージニア)
- AWS us-east-2 (オハイオ)
- AWS us-west-2 (オレゴン)
