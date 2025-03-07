---
title: 'サポートされているクラウドリジョン'
sidebar_label: 'サポートされているクラウドリジョン'
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: 'ClickHouse Cloudのサポートリジョン'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# サポートされているクラウドリジョン

## AWS リジョン {#aws-regions}

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
- ap-northeast-2 (韓国、ソウル)

## Google Cloud リジョン {#google-cloud-regions}

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

## Azure リジョン {#azure-regions}

- West US 3 (アリゾナ)
- East US 2 (バージニア)
- Germany West Central (フランクフルト)

**検討中:**

JapanEast
:::note 
現在リストに載っていないリジョンにデプロイする必要がありますか？ [リクエストを送信](https://clickhouse.com/pricing?modal=open)。 
:::

## プライベートリジョン {#private-regions}

<EnterprisePlanFeatureBadge feature="プライベートリジョン機能"/>

当社はエンタープライズプランサービス向けにプライベートリジョンを提供しています。プライベートリジョンのリクエストについては、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリジョンの重要な考慮事項:
- サービスは自動スケーリングされません。
- サービスは停止またはアイドル状態にできません。
- マニュアルスケーリング（縦横両方）はサポートチケットで有効にできます。
- サービスがCMEKでの構成を必要とする場合、顧客はサービス開始時にAWS KMSキーを提供しなければなりません。
- 新しいサービスや追加のサービスを開始するには、サポートチケットを通じてリクエストを行う必要があります。

HIPAAコンプライアンスに関して追加要件が適用される場合があります（BAAへの署名を含む）。HIPAAは現在、エンタープライズプランサービスにのみ利用可能であることに留意してください。

## HIPAA準拠のリジョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、HIPAA準拠のリジョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリジョンはHIPAAコンプライアンスをサポートしています:
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI準拠のリジョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はPCI準拠のリジョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。以下のリジョンはPCIコンプライアンスをサポートしています:
- AWS us-east-1
- AWS us-west-2
