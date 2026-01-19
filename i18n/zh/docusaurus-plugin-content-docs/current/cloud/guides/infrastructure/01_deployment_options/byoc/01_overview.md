---
title: '概览'
slug: /cloud/reference/byoc/overview
sidebar_label: '概览'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 概览 \{#overview\}

BYOC（Bring Your Own Cloud，自有云环境）允许您在自己的云基础设施上部署 ClickHouse Cloud。若您有特定需求或限制，无法使用 ClickHouse Cloud 托管服务，此方式会非常有用。

> **如果您希望获得使用权限，请[联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 更多信息请参阅我们的[《服务条款》](https://clickhouse.com/legal/agreements/terms-of-service)。

:::note 
BYOC 专为大规模部署设计，并要求客户签署具有使用承诺的合同。
:::

支持的云服务提供商：

* AWS（GA）
* GCP（Private Preview）。如果您感兴趣，请在[此处](https://clickhouse.com/cloud/bring-your-own-cloud)加入候补名单。
* Azure（Roadmap）。如果您感兴趣，请在[此处](https://clickhouse.com/cloud/bring-your-own-cloud)加入候补名单。

## 术语表 \{#glossary\}

- **ClickHouse VPC：** ClickHouse Cloud 拥有的 VPC。
- **Customer BYOC VPC：** 由客户云账户拥有、由 ClickHouse Cloud 预配和管理，并专用于 ClickHouse Cloud BYOC 部署的 VPC。
- **Customer VPC：** 由客户云账户拥有、供需连接到 Customer BYOC VPC 的应用程序使用的其他 VPC。

## 架构 \{#architecture\}

指标和日志存储在客户的 BYOC VPC 中。目前日志本地存储在 EBS 上。在未来的更新中，日志将存储在 LogHouse 中，它是在客户 BYOC VPC 内运行的 ClickHouse 服务。指标通过 Prometheus 和 Thanos 技术栈实现，并本地存储在客户的 BYOC VPC 中。

<br />

<Image img={byoc1} size="lg" alt="BYOC 架构" background='black'/>

<br />

## 功能 \{#features\}

### 已支持的功能 \{#supported-features\}

- **SharedMergeTree**：ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此，来自 ClickHouse 核心的所有功能（如 SharedMergeTree）在 BYOC 中均受支持。
- **用于管理服务状态的控制台访问**：
  - 支持启动、停止和终止等操作。
  - 查看服务及其状态。
- **备份与恢复。**
- **手动纵向和横向扩缩容。**
- **自动闲置（Auto Idling）。**
- **Warehouses**：计算-计算分离（Compute-Compute Separation）
- **通过 Tailscale 实现 Zero Trust 网络。**
- **监控**：
  - Cloud 控制台包含内置健康仪表板，用于监控服务健康状况。
  - 支持 Prometheus 抓取，用于通过 Prometheus、Grafana 和 Datadog 实现集中式监控。有关设置说明，请参阅 [Prometheus 文档](/integrations/prometheus)。
- **VPC 对等连接（VPC Peering）。**
- **集成**：完整列表见[此页面](/integrations)。
- **安全的 S3 访问。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 计划中的功能（当前不支持） \{#planned-features-currently-unsupported\}

- [AWS KMS](https://aws.amazon.com/kms/)，即 CMEK（客户管理的加密密钥）
- ClickPipes
- 自动扩缩容（Autoscaling）
- MySQL 接口