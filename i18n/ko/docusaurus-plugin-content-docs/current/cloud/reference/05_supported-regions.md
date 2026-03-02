---
title: '지원되는 Cloud 리전'
sidebar_label: '지원되는 Cloud 리전'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud에서 지원되는 리전'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 지원 Cloud 리전 \{#supported-cloud-regions\}

## AWS 리전 \{#aws-regions\}

- ap-northeast-1 (도쿄)
- ap-northeast-2 (대한민국, 서울)
- ap-south-1 (뭄바이)
- ap-southeast-1 (싱가포르)
- ap-southeast-2 (시드니)
- eu-central-1 (프랑크푸르트)
- eu-west-1 (아일랜드)
- eu-west-2 (런던)
- me-central-1 (아랍에미리트)
- us-east-1 (버지니아 북부)
- us-east-2 (오하이오)
- us-west-2 (오리건)
- il-central-1 (이스라엘, 텔아비브)

**프라이빗 리전:**

- ca-central-1 (캐나다)
- af-south-1 (남아프리카 공화국)
- eu-north-1 (스톡홀름)
- sa-east-1 (남아메리카)
- ap-southeast-3 (자카르타)
- ap-east-1 (홍콩)

## Google Cloud 리전 \{#google-cloud-regions\}

- asia-southeast1 (싱가포르)
- asia-northeast1 (도쿄)
- europe-west4 (네덜란드)
- us-central1 (아이오와)
- us-east1 (사우스캐롤라이나)

**프라이빗 리전:**

- us-west1 (오리건)
- australia-southeast1 (시드니)
- europe-west3 (프랑크푸르트)
- europe-west6 (취리히)
- northamerica-northeast1 (몬트리올)

## Azure 리전 \{#azure-regions\}

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

**프라이빗 리전:**

- Japan East (Tokyo, Saitama)
- UAE North (Dubai)

:::note 
현재 나열되어 있지 않은 리전에 배포해야 하는 경우 [요청을 제출하십시오](https://clickhouse.com/pricing?modal=open). 
:::

## 프라이빗 리전 \{#private-regions\}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

Enterprise 등급 서비스에 대해 프라이빗 리전을 제공합니다. 프라이빗 리전을 요청하려면 [Contact us](https://clickhouse.com/company/contact) 페이지를 통해 문의해 주십시오.

프라이빗 리전에 대한 주요 고려 사항은 다음과 같습니다.

- 서비스는 자동으로 확장되지 않습니다. 다만 수직 및 수평 확장은 수동으로 가능합니다.
- 서비스를 유휴(idle) 상태로 둘 수 없습니다.
- 프라이빗 리전에 대해서는 상태(Status) 페이지를 제공하지 않습니다.

HIPAA 규정 준수(BAA 체결 포함)를 위해 추가 요구 사항이 적용될 수 있습니다. HIPAA는 현재 Enterprise 등급 서비스에만 제공됩니다.

## HIPAA 규정을 준수하는 리전 \{#hipaa-compliant-regions\}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

HIPAA 규정을 준수하는 리전에 서비스를 설정하려면 고객은 Business Associate Agreement(BAA)에 서명하고 Sales 또는 Support를 통해 온보딩을 요청해야 합니다. 다음 리전에서 HIPAA 규정 준수가 지원됩니다:

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

## PCI 규정 준수 리전 \{#pci-compliant-regions\}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

고객이 PCI 규정 준수 리전에서 서비스를 구성하려면 Sales 또는 Support를 통해 온보딩을 요청해야 합니다. 다음 리전에서 PCI 규정 준수를 지원합니다.

- AWS af-south-1 (South Africa) **프라이빗 리전**
- AWS ca-central-1 (Canada) **프라이빗 리전**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **프라이빗 리전**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **프라이빗 리전**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
- GCP europe-west4 (Netherlands)
- GCP us-central1 (Iowa)
- GCP us-east1 (South Carolina)