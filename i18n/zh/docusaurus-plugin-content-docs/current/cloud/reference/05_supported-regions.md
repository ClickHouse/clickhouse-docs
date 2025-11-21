---
title: '支持的云区域'
sidebar_label: '支持的云区域'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'ClickHouse Cloud 支持的区域'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 支持的云区域



## AWS 区域 {#aws-regions}

- ap-northeast-1 (东京)
- ap-northeast-2 (韩国首尔)
- ap-south-1 (孟买)
- ap-southeast-1 (新加坡)
- ap-southeast-2 (悉尼)
- eu-central-1 (法兰克福)
- eu-west-1 (爱尔兰)
- eu-west-2 (伦敦)
- me-central-1 (阿联酋)
- us-east-1 (美国弗吉尼亚北部)
- us-east-2 (美国俄亥俄)
- us-west-2 (美国俄勒冈)
- il-central-1 (以色列特拉维夫)

**专用区域:**

- ca-central-1 (加拿大)
- af-south-1 (南非)
- eu-north-1 (斯德哥尔摩)
- sa-east-1 (南美洲)


## Google Cloud 区域 {#google-cloud-regions}

- asia-southeast1（新加坡）
- asia-northeast1（东京）
- europe-west4（荷兰）
- us-central1（爱荷华州）
- us-east1（南卡罗来纳州）

**专用区域：**

- us-west1（俄勒冈州）
- australia-southeast1（悉尼）
- europe-west3（法兰克福）
- europe-west6（苏黎世）
- northamerica-northeast1（蒙特利尔）


## Azure 区域 {#azure-regions}

- 美国西部 3（亚利桑那州）
- 美国东部 2（弗吉尼亚州）
- 德国中西部（法兰克福）

**私有区域：**

- 日本东部

:::note
需要部署到当前未列出的区域？[提交请求](https://clickhouse.com/pricing?modal=open)。
:::


## 私有区域 {#private-regions}

<EnterprisePlanFeatureBadge feature='Private regions feature' />

我们为企业级服务提供私有区域。如需申请私有区域,请[联系我们](https://clickhouse.com/company/contact)。

私有区域的关键注意事项:

- 服务不支持自动扩缩容;但支持手动垂直和水平扩缩容。
- 服务无法设置为空闲状态。
- 私有区域不提供状态页面。

HIPAA 合规可能需要满足额外要求(包括签署 BAA)。请注意,HIPAA 目前仅适用于企业级服务


## HIPAA 合规区域 {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature='HIPAA' support='true' />

客户必须签署业务合作协议 (BAA) 并通过销售或支持团队申请开通,才能在 HIPAA 合规区域中设置服务。以下区域支持 HIPAA 合规:

- AWS af-south-1 (南非) **私有区域**
- AWS ca-central-1 (加拿大) **私有区域**
- AWS eu-central-1 (法兰克福)
- AWS eu-north-1 (斯德哥尔摩) **私有区域**
- AWS eu-west-1 (爱尔兰)
- AWS eu-west-2 (伦敦)
- AWS sa-east-1 (南美洲) **私有区域**
- AWS us-east-1 (北弗吉尼亚)
- AWS us-east-2 (俄亥俄)
- AWS us-west-2 (俄勒冈)
- GCP europe-west4 (荷兰)
- GCP us-central1 (爱荷华)
- GCP us-east1 (南卡罗来纳)


## PCI 合规区域 {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature='PCI' support='true' />

客户必须通过销售或支持团队申请接入，以便在 PCI 合规区域中设置服务。以下区域支持 PCI 合规：

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
