---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['政府', 'fips', 'fedramp', '政府云']
description: 'ClickHouse Government 方案概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概述 \{#overview\}

ClickHouse Government 是一个自托管的软件包，由运行于 ClickHouse Cloud 上的同一专有版本 ClickHouse 以及我们的 ClickHouse Operator 组成，配置为计算与存储分离，并经过强化以满足政府机构和公共部门组织的严苛要求。 

:::note 注意
ClickHouse Government 专为政府机构、公共部门组织，或向这些机构和组织销售产品的云软件公司而设计，为其专用基础设施提供全面的控制和管理能力。最小部署规模为 2 TB。此选项仅可通过[联系我们](https://clickhouse.com/government)获取。
:::

## 相较于开源的优势 \{#benefits-over-os\}

以下特性使 ClickHouse Government 有别于自管理开源部署：

* 原生支持计算与存储分离
* 专有云特性，例如 [shared merge tree](/cloud/reference/shared-merge-tree) 和 [warehouse](/cloud/reference/warehouses) 功能
* ClickHouse 数据库和 operator 版本已在 ClickHouse Cloud 中经过全面测试与验证
* 提供 [NIST 风险管理框架 (Risk Management Framework，RMF) ](https://csrc.nist.gov/projects/risk-management/about-rmf) 相关文档，有助于加速您获得运行授权 (Authorization to Operate，ATO) 的进程
* 用于以编程方式执行操作的 API，包括备份和扩缩容操作

## 架构 \{#architecture\}

ClickHouse Government 完全包含在您的部署环境中，提供我们云原生的计算与存储分离。 

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government Architecture" background='black'/>

<br />

## 支持的配置 \{#supported-configurations\}

ClickHouse Government 目前支持以下配置：

| 环境  | 编排                               | 存储                          | 状态 |
| :-- | :------------------------------- | :-------------------------- | :- |
| AWS | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 可用 |
| GCP | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | 预览 |

## 开通流程 \{#onboarding-process\}

客户可[联系我们](https://clickhouse.com/company/contact?loc=nav)预约沟通，以评估 ClickHouse Government 是否适合其使用场景。对于满足最低规模要求且部署在受支持配置上的使用场景，我们将予以评估。开通名额有限。安装过程包括按照相应环境的安装指南，使用从 AWS ECR 下载的镜像和 Helm 图表部署 ClickHouse。