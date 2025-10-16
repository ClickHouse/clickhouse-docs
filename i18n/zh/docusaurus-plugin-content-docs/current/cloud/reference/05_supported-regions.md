---
'title': '支持的云区域'
'sidebar_label': '支持的云区域'
'keywords':
- 'aws'
- 'gcp'
- 'google cloud'
- 'azure'
- 'cloud'
- 'regions'
'description': '支持 ClickHouse Cloud 的区域'
'slug': '/cloud/reference/supported-regions'
'doc_type': 'reference'
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

**私有区域:**
- ca-central-1 (加拿大)
- af-south-1 (南非)
- eu-north-1 (斯德哥尔摩)
- sa-east-1 (南美洲)
- ap-northeast-2 (韩国，首尔)

## Google Cloud 区域 {#google-cloud-regions}

- asia-southeast1 (新加坡)
- europe-west4 (荷兰)
- us-central1 (爱荷华)
- us-east1 (南卡罗来纳)

**私有区域:**

- us-west1 (俄勒冈州)
- australia-southeast1 (悉尼)
- asia-northeast1 (东京)
- europe-west3 (法兰克福)
- europe-west6 (苏黎世)
- northamerica-northeast1 (蒙特利尔)

## Azure 区域 {#azure-regions}

- 西美国 3 (亚利桑那州)
- 东美国 2 (弗吉尼亚州)
- 德国西部中心 (法兰克福)

**私有区域:**

- 日本东部

:::note 
需要部署到当前未列出的区域吗？[提交请求](https://clickhouse.com/pricing?modal=open)。 
:::

## 私有区域 {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

我们为我们的企业级服务提供私有区域。请[联系我们](https://clickhouse.com/company/contact)以请求私有区域。

私有区域的关键考虑事项：
- 服务不会自动扩展。
- 服务不能停止或闲置。
- 可以通过支持票启用手动扩展（包括垂直和水平）。
- 如果服务需要与 CMEK 配置，则客户必须在服务启动时提供 AWS KMS 密钥。
- 对于新服务和额外服务的启动，请通过支持票提出请求。
  
可能还适用于 HIPAA 合规性（包括签署 BAA）。请注意，HIPAA 目前仅适用于企业级服务。

## HIPAA 合规区域 {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

客户必须签署商业合作协议（BAA），并通过销售或支持请求入驻，以在 HIPAA 合规区域设置服务。支持 HIPAA 合规性区域如下：
- AWS eu-central-1 (法兰克福)
- AWS eu-west-2 (伦敦)
- AWS us-east-1 (北弗吉尼亚)
- AWS us-east-2 (俄亥俄州)
- AWS us-west-2 (俄勒冈州)
- GCP europe-west4 (荷兰)
- GCP us-central1 (爱荷华)
- GCP us-east1 (南卡罗来纳)

## PCI 合规区域 {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

客户必须通过销售或支持请求入驻，以在 PCI 合规区域设置服务。支持 PCI 合规性的区域如下：
- AWS eu-central-1 (法兰克福)
- AWS eu-west-2 (伦敦)
- AWS us-east-1 (北弗吉尼亚)
- AWS us-east-2 (俄亥俄州)
- AWS us-west-2 (俄勒冈州)
