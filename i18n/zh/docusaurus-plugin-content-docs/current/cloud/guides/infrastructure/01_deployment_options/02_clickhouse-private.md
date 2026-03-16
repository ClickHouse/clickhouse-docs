---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['私有', '本地部署']
description: 'ClickHouse Private 方案概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概览 \{#overview\}

ClickHouse Private 是一个自托管的软件包，由与 ClickHouse Cloud 上运行的相同 ClickHouse 专有版本以及我们的 ClickHouse Operator 组成，并配置为实现计算与存储分离。

:::note 注意
ClickHouse Private 专为部署 &gt; 2 TB 内存并需要对其专用基础设施进行完全控制的大型企业设计。客户需负责管理全部基础设施，并应具备大规模运行 ClickHouse 的专业知识。此选项仅可通过[联系我们](https://clickhouse.com/company/contact?loc=nav)获取。
:::

## 相较开源的优势 \{#benefits-over-os\}

以下特性使 ClickHouse Private 有别于自管型开源部署：

* 原生支持计算与存储分离
* 专有云端能力，例如 [shared merge tree](/cloud/reference/shared-merge-tree) 和 [warehouse](/cloud/reference/warehouses) 功能
* ClickHouse 数据库和 operator 版本在 ClickHouse Cloud 中经过完整测试与验证
* 用于以编程方式执行操作的 API，包括备份和扩缩容操作

## 架构 \{#architecture\}

ClickHouse Private 在您的部署环境中完全自包含，并提供我们云原生的计算与存储分离架构。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private 架构" background="black" />

<br />

## 支持的配置 \{#supported-configurations\}

ClickHouse Private 当前支持以下配置：

| 环境  | 编排平台                             | 存储                          | 状态 |
| :-- | :------------------------------- | :-------------------------- | :- |
| AWS | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 可用 |
| GCP | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | 预览 |
| 裸金属 | Kubernetes                       | AIStor (需要 NVMe)            | 预览 | 

## 接入流程 \{#onboarding-process\}

客户可[联系我们](https://clickhouse.com/company/contact?loc=nav)申请沟通，以评估 ClickHouse Private 是否适用于其使用场景。满足最低规模要求且部署在支持的配置上的使用场景将被纳入评估。接入名额有限。安装过程需要按照 ClickHouse 将使用从 AWS ECR 下载的镜像和 Helm 图表进行部署的特定环境对应的安装指南进行。