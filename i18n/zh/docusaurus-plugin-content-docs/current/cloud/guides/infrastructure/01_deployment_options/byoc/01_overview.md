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

Bring Your Own Cloud（BYOC，自有云环境）使您能够在自己的云账号中直接部署 ClickHouse 服务并存储数据，而无需依赖默认的 ClickHouse Cloud 基础设施。对于那些具有严格安全策略或合规要求、必须对自身数据保持完全控制权和数据主权的组织而言，这种方式尤其适合。

从整体架构上看，BYOC 将运行在 ClickHouse VPC 中、由 ClickHouse Cloud 管理的 ClickHouse 控制平面，与完全运行在您云账号中的数据平面进行分离。数据平面中包含您的 ClickHouse 集群、数据及备份。有关各组件的详细说明以及流量在它们之间的流动方式，请参阅 [Architecture](/cloud/reference/byoc/architecture) 页面。

> **如果您希望获得使用权限，请[联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 更多信息请参阅我们的[《服务条款》](https://clickhouse.com/legal/agreements/terms-of-service)。

:::note 
BYOC 专为大规模部署设计，并要求客户签署具有使用承诺的合同。
:::

**支持的云服务提供商：**

* AWS（GA）
* GCP（Private Preview）。如果您感兴趣，请在[此处](https://clickhouse.com/cloud/bring-your-own-cloud)加入候补名单。
* Azure（Roadmap）。如果您感兴趣，请在[此处](https://clickhouse.com/cloud/bring-your-own-cloud)加入候补名单。

**支持的云区域：**
在我们的[支持的区域](https://clickhouse.com/docs/cloud/reference/supported-regions)文档中列出的所有**公共区域**均可用于 BYOC 部署。目前不支持私有区域。

## 功能 \{#features\}

### 已支持的功能 \{#supported-features\}

- **SharedMergeTree**：ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此，来自 ClickHouse 核心的所有功能（如 SharedMergeTree）在 BYOC 中均受支持。
- **Shared Catalog（共享目录）**
- **用于管理服务状态的控制台访问**：
  - 支持启动、停止和终止等操作。
  - 查看服务及其状态。
- **托管备份与恢复**
- **手动纵向和横向扩缩容。**
- **自动闲置（Auto Idling）**
- **Warehouses**：计算-计算分离（Compute-Compute Separation）
- **通过 Tailscale 实现 Zero Trust 网络。**
- **监控**：
  - Cloud 控制台包含内置健康仪表板，用于监控服务健康状况。
  - 支持 Prometheus 抓取，用于通过 Prometheus、Grafana 和 Datadog 实现集中式监控。有关设置说明，请参阅 [Prometheus 文档](/cloud/reference/byoc/observability#prometheus-access)。
- **VPC 对等连接（VPC Peering）**
- **集成**：完整列表见[此页面](/integrations)。
- **安全的 S3 访问**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**
- **[GCP Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)**

### 计划中的功能（当前不支持） \{#planned-features-currently-unsupported\}

- SQL 控制台
- ClickPipes（Kafka, S3）
- ClickPipes（CDC，变更数据捕获）
- 自动扩缩容（Autoscaling）
- MySQL 接口
- [AWS KMS](https://aws.amazon.com/kms/)，即 CMEK（客户管理的加密密钥）