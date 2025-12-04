---
title: '支持的 Cloud 区域'
sidebar_label: '支持的 Cloud 区域'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud 支持的区域'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 受支持的 Cloud 区域 {#supported-cloud-regions}

## AWS 区域 {#aws-regions}

- ap-northeast-1（东京）
- ap-northeast-2（韩国首尔）
- ap-south-1（孟买）
- ap-southeast-1（新加坡）
- ap-southeast-2（悉尼）
- eu-central-1（法兰克福）
- eu-west-1（爱尔兰）
- eu-west-2（伦敦）
- me-central-1（阿联酋）
- us-east-1（北弗吉尼亚）
- us-east-2（俄亥俄）
- us-west-2（俄勒冈）
- il-central-1（以色列特拉维夫）

**私有区域：**

- ca-central-1（加拿大）
- af-south-1（南非）
- eu-north-1（斯德哥尔摩）
- sa-east-1（南美洲）

## Google Cloud 区域 {#google-cloud-regions}

- asia-southeast1（新加坡）
- asia-northeast1（东京）
- europe-west4（荷兰）
- us-central1（爱荷华州）
- us-east1（南卡罗来纳州）

**私有区域：**

- us-west1（俄勒冈州）
- australia-southeast1（悉尼）
- europe-west3（法兰克福）
- europe-west6（苏黎世）
- northamerica-northeast1（蒙特利尔）

## Azure 区域 {#azure-regions}

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

**专用区域：**

- Japan East (Tokyo, Saitama)
- UAE North (Dubai)

:::note 
需要部署到目前未列出的区域？[提交申请](https://clickhouse.com/pricing?modal=open)。 
:::

## 私有区域 {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

我们为 Enterprise 企业版服务提供私有区域。若需申请私有区域，请[联系我们](https://clickhouse.com/company/contact)。

关于私有区域的主要注意事项：

- 服务不会自动扩缩容，但支持手动进行纵向和横向扩缩容。
- 服务无法进入空闲状态。
- 私有区域不提供状态页。

为满足 HIPAA 合规性要求（包括签署 BAA），可能需要额外条件。请注意，HIPAA 目前仅适用于 Enterprise 企业版服务。

## 符合 HIPAA 要求的区域 {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须签署商业伙伴协议（BAA），并通过 Sales 或 Support 团队申请开通，才能在符合 HIPAA 要求的区域中部署服务。以下区域支持 HIPAA 合规性：

- AWS af-south-1（南非）**私有区域**
- AWS ca-central-1（加拿大）**私有区域**
- AWS eu-central-1（法兰克福）
- AWS eu-north-1（斯德哥尔摩）**私有区域**
- AWS eu-west-1（爱尔兰）
- AWS eu-west-2（伦敦）
- AWS sa-east-1（南美）**私有区域**
- AWS us-east-1（北弗吉尼亚）
- AWS us-east-2（俄亥俄）
- AWS us-west-2（俄勒冈）
- GCP europe-west4（荷兰）
- GCP us-central1（爱荷华）
- GCP us-east1（南卡罗来纳）

## 符合 PCI 合规要求的区域 {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

客户必须通过销售或支持团队提交申请，才能在符合 PCI 合规要求的区域开通服务。以下区域支持 PCI 合规：

- AWS af-south-1（南非）**私有区域**
- AWS ca-central-1（加拿大）**私有区域**
- AWS eu-central-1（法兰克福）
- AWS eu-north-1（斯德哥尔摩）**私有区域**
- AWS eu-west-1（爱尔兰）
- AWS eu-west-2（伦敦）
- AWS sa-east-1（南美）**私有区域**
- AWS us-east-1（弗吉尼亚北部）
- AWS us-east-2（俄亥俄）
- AWS us-west-2（俄勒冈）