---
title: '概览'
slug: /cloud/reference/byoc/overview
sidebar_label: '概览'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '在您自有的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---



## 概述 {#overview}

BYOC(自带云)允许您在自己的云基础设施上部署 ClickHouse Cloud。如果您有特定的需求或限制条件,无法使用 ClickHouse Cloud 托管服务,BYOC 将是理想的解决方案。

> **如需获取访问权限,请[联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 更多信息请参阅我们的[服务条款](https://clickhouse.com/legal/agreements/terms-of-service)。

BYOC 目前仅支持 AWS。您可以在[此处](https://clickhouse.com/cloud/bring-your-own-cloud)加入 GCP 和 Azure 的候补名单。

:::note
BYOC 专为大规模部署设计,需要客户签署承诺合同。
:::


## 术语表 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloud 所拥有的 VPC。
- **Customer BYOC VPC:** 客户云账户所拥有的 VPC,由 ClickHouse Cloud 进行配置和管理,专门用于 ClickHouse Cloud BYOC 部署。
- **Customer VPC:** 客户云账户所拥有的其他 VPC,用于需要连接到 Customer BYOC VPC 的应用程序。


## 功能特性 {#features}

### 支持的功能 {#supported-features}

- **SharedMergeTree**:ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此,ClickHouse 核心的所有功能在 BYOC 中均受支持,例如 SharedMergeTree。
- **控制台访问以管理服务状态**:
  - 支持启动、停止和终止等操作。
  - 查看服务和状态。
- **备份和恢复。**
- **手动垂直和水平扩展。**
- **空闲模式。**
- **Warehouses**:计算-计算分离
- **通过 Tailscale 实现零信任网络。**
- **监控**:
  - Cloud 控制台包含用于监控服务健康状况的内置健康仪表板。
  - Prometheus 抓取功能,用于通过 Prometheus、Grafana 和 Datadog 进行集中监控。有关设置说明,请参阅 [Prometheus 文档](/integrations/prometheus)。
- **VPC 对等连接。**
- **集成**:请参阅[此页面](/integrations)上的完整列表。
- **安全 S3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 计划中的功能(当前不支持){#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/),即 CMEK(客户管理的加密密钥)
- 用于数据摄取的 ClickPipes
- 自动扩展
- MySQL 接口
