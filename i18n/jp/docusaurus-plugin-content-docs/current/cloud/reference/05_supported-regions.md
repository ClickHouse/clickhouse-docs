---
title: 'サポートされているクラウドリージョン'
sidebar_label: 'サポートされているクラウドリージョン'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud で利用可能なリージョン'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# サポート対象のクラウドリージョン {#supported-cloud-regions}



## AWS リージョン {#aws-regions}

- ap-northeast-1 (Tokyo)
- ap-northeast-2 (South Korea, Seoul)
- ap-south-1 (Mumbai)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- eu-central-1 (Frankfurt)
- eu-west-1 (Ireland)
- eu-west-2 (London)
- me-central-1 (UAE)
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-2 (Oregon)
- il-central-1 (Israel, Tel Aviv)

**プライベートリージョン:**
- ca-central-1 (Canada)
- af-south-1 (South Africa)
- eu-north-1 (Stockholm)
- sa-east-1 (South America)
 


## Google Cloud リージョン {#google-cloud-regions}

- asia-southeast1 (Singapore)
- asia-northeast1 (Tokyo)
- europe-west4 (Netherlands)
- us-central1 (Iowa)
- us-east1 (South Carolina)

**プライベートリージョン:**

- us-west1 (Oregon)
- australia-southeast1 (Sydney)
- europe-west3 (Frankfurt)
- europe-west6 (Zurich)
- northamerica-northeast1 (Montréal)



## Azure リージョン {#azure-regions}

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

**プライベート リージョン:**

- JapanEast

:::note 
現在一覧にないリージョンへのデプロイが必要な場合は、[リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。 
:::



## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

Enterprise ティアのサービス向けにプライベートリージョンを提供しています。プライベートリージョンをご希望の場合は、[お問い合わせ](https://clickhouse.com/company/contact)ください。

プライベートリージョンに関する主な留意点:
- サービスは自動スケーリングされませんが、手動での垂直・水平スケーリングはサポートされています。
- サービスをアイドル状態にすることはできません。
- プライベートリージョンではステータスページは利用できません。
  
HIPAA 準拠のために、追加要件（BAA の締結を含む）が適用される場合があります。なお、HIPAA は現在、Enterprise ティアのサービスでのみ利用可能です。



## HIPAA 準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

HIPAA 準拠リージョンでサービスを設定するには、Business Associate Agreement (BAA) に署名し、営業またはサポートを通じてオンボーディングを申請する必要があります。以下のリージョンが HIPAA 準拠をサポートしています:
- AWS af-south-1 (South Africa) **Private Region**
- AWS ca-central-1 (Canada) **Private Region**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **Private Region**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **Private Region**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
- GCP europe-west4 (Netherlands)
- GCP us-central1 (Iowa)
- GCP us-east1 (South Carolina)



## PCI 準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

PCI 準拠リージョンでサービスを利用するには、Sales または Support を通じてオンボーディングを申請する必要があります。次のリージョンが PCI 準拠に対応しています。
- AWS af-south-1 (South Africa) **プライベートリージョン**
- AWS ca-central-1 (Canada) **プライベートリージョン**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **プライベートリージョン**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **プライベートリージョン**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
