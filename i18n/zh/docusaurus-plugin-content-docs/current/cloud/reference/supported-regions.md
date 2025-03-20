---
title: 支持的云区域
sidebar_label: 支持的云区域
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: ClickHouse Cloud 支持的区域
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 支持的云区域

## AWS 区域 {#aws-regions}

- ap-northeast-1 (东京)
- ap-south-1 (孟买)
- ap-southeast-1 (新加坡)
- ap-southeast-2 (悉尼)
- eu-central-1 (法兰克福)
- eu-west-1 (爱尔兰)
- eu-west-2 (伦敦)
- me-central-1 (阿联酋)
- us-east-1 (北弗吉尼亚)
- us-east-2 (俄亥俄州)
- us-west-2 (俄勒冈州)

**待考虑：**
- ca-central-1 (加拿大)
- af-south-1 (南非)
- eu-north-1 (斯德哥尔摩)
- sa-east-1 (南美洲)
- ap-northeast-2 (韩国，首尔)

## Google Cloud 区域 {#google-cloud-regions}

- asia-southeast1 (新加坡)
- europe-west4 (荷兰)
- us-central1 (爱荷华州)
- us-east1 (南卡罗来纳州)

**待考虑：**

- us-west1 (俄勒冈州)
- australia-southeast1 (悉尼)
- asia-northeast1 (东京)
- europe-west3 (法兰克福)
- europe-west6 (苏黎世)
- northamerica-northeast1 (蒙特利尔)

## Azure 区域 {#azure-regions}

- 西美国 3 (亚利桑那州)
- 东美国 2 (维吉尼亚州)
- 德国西中部 (法兰克福)

**待考虑：**

日本东部
:::note 
需要将服务部署到当前未列出的区域吗？[提交请求](https://clickhouse.com/pricing?modal=open)。 
:::

## 私有区域 {#private-regions}

<EnterprisePlanFeatureBadge feature="私有区域功能"/>

我们为我们的企业套餐服务提供私有区域。请[联系我们](https://clickhouse.com/company/contact)以提出私有区域请求。

私有区域的主要考虑事项：
- 服务不会自动扩展。
- 服务无法停止或闲置。
- 可以通过支持票证启用手动扩展（包括纵向和横向扩展）。
- 如果服务需要使用 CMEK 配置，客户必须在服务启动时提供 AWS KMS 密钥。
- 要启动新的和额外的服务，请通过支持票证提出请求。

可能会有额外的 HIPAA 合规要求（包括签署 BAA）。请注意，HIPAA 目前仅适用于企业套餐服务。

## HIPAA 合规区域 {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须签署商业伙伴协议 (BAA)，并通过销售或支持请求入驻以在 HIPAA 合规区域设置服务。以下区域支持 HIPAA 合规性：
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI 合规区域 {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须通过销售或支持请求入驻以在 PCI 合规区域设置服务。以下区域支持 PCI 合规性：
- AWS us-east-1
- AWS us-west-2
