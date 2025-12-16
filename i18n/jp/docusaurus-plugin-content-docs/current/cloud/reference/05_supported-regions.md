---
title: 'サポートされている Cloud リージョン'
sidebar_label: 'サポートされている Cloud リージョン'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud がサポートするリージョン'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# サポート対象の Cloud リージョン {#supported-cloud-regions}

## AWS リージョン {#aws-regions}

- ap-northeast-1 (東京)
- ap-northeast-2 (韓国（ソウル）)
- ap-south-1 (ムンバイ)
- ap-southeast-1 (シンガポール)
- ap-southeast-2 (シドニー)
- eu-central-1 (フランクフルト)
- eu-west-1 (アイルランド)
- eu-west-2 (ロンドン)
- me-central-1 (アラブ首長国連邦)
- us-east-1 (北バージニア)
- us-east-2 (オハイオ)
- us-west-2 (オレゴン)
- il-central-1 (イスラエル（テルアビブ）)

**プライベートリージョン：**

- ca-central-1 (カナダ)
- af-south-1 (南アフリカ)
- eu-north-1 (ストックホルム)
- sa-east-1 (南米)

## Google Cloud リージョン {#google-cloud-regions}

- asia-southeast1 (Singapore)
- asia-northeast1 (Tokyo)
- europe-west4 (Netherlands)
- us-central1 (Iowa)
- us-east1 (South Carolina)

**プライベート リージョン：**

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

- Japan East (Tokyo, Saitama)
- UAE North (Dubai)

:::note 
現在リストにないリージョンにデプロイする必要がありますか？[リクエストを送信](https://clickhouse.com/pricing?modal=open)してください。 
:::

## プライベートリージョン {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

Enterprise ティアのサービス向けにプライベートリージョンを提供しています。プライベートリージョンをご希望の場合は、[Contact us](https://clickhouse.com/company/contact) からお問い合わせください。

プライベートリージョンに関する主な注意事項:

- サービスは自動スケールされませんが、手動での垂直・水平スケーリングはサポートされています。
- サービスを休止状態にすることはできません。
- プライベートリージョンではステータスページは利用できません。

HIPAA 準拠のために、追加要件（BAA の締結を含む）が適用される場合があります。なお、HIPAA は現在、Enterprise ティアのサービスでのみ利用可能です。

## HIPAA 準拠リージョン {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

お客様が HIPAA 準拠リージョンでサービスを利用するには、Business Associate Agreement (BAA) に署名し、Sales または Support を通じてオンボーディングを依頼する必要があります。以下のリージョンは HIPAA 準拠をサポートしています：

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
- GCP europe-west4 (Netherlands)
- GCP us-central1 (Iowa)
- GCP us-east1 (South Carolina)

## PCI 準拠リージョン {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

PCI 準拠リージョンでサービスをセットアップするには、Sales もしくは Support を通じてオンボーディングをリクエストする必要があります。次のリージョンが PCI 準拠に対応しています:

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