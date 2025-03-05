---
title: サポートされているクラウドリージョン
sidebar_label: サポートされているクラウドリージョン
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: ClickHouse Cloud のサポートされているリージョン
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
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)

**検討中:**
- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南アメリカ)
- ap-northeast-2 (韓国、ソウル)

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
現在リストにないリージョンにデプロイする必要がありますか？ [リクエストを提出する](https://clickhouse.com/pricing?modal=open)。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="プライベートリージョン機能"/>

エンタープライズプランサービス向けにプライベートリージョンを提供しています。プライベートリージョンリクエストについては、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンの主な考慮事項:
- サービスは自動スケーリングされません。
- サービスは停止またはアイドル状態にできません。
- 手動スケーリング（縦方向および横方向の両方）は、サポートチケットで有効にできます。
- サービスがCMEKでの設定を必要とする場合、サービス開始時に顧客がAWS KMSキーを提供する必要があります。
- 新しい追加サービスの開始には、サポートチケットを通じてリクエストする必要があります。

HIPAAコンプライアンスに関する追加要件が適用される場合があります（BAAの署名を含む）。なお、HIPAAは現在エンタープライズプランサービスのみで利用可能です。

## HIPAA準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）に署名し、HIPAA準拠リージョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。次のリージョンはHIPAAコンプライアンスをサポートしています:
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はPCI準拠リージョンでサービスを設定するために営業またはサポートを通じてオンボーディングをリクエストする必要があります。次のリージョンはPCIコンプライアンスをサポートしています:
- AWS us-east-1
- AWS us-west-2
