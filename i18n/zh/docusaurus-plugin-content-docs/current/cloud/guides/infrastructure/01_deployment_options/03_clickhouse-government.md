---
title: 'ClickHouse 政府版'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['政府', 'fips', 'fedramp', '政府云']
description: 'ClickHouse 政府版方案概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概述 {#overview}

ClickHouse Government 是一个自托管的软件包，由与 ClickHouse Cloud 相同的 ClickHouse 专有版本以及我们的 ClickHouse Operator 组成，配置为计算与存储分离的架构，并经过强化以满足政府机构和公共部门组织的严苛要求。它部署在使用 S3 兼容存储的 Kubernetes 环境中。

该软件包目前适用于 AWS，裸机部署即将推出。

:::note 注意
ClickHouse Government 专为政府机构、公共部门组织或向这些机构和组织销售产品的云软件公司设计，为其专用基础设施提供完整的控制和管理能力。此选项仅可通过[联系我们](https://clickhouse.com/government)获取。
:::



## 相较于开源的优势 {#benefits-over-os}

以下特性使 ClickHouse Government 有别于自行运维的开源部署：

<VerticalStepper headerLevel="h3">

### 更高性能 {#enhanced-performance}
- 原生支持计算与存储分离
- 专有云特性，例如 [shared merge tree](/cloud/reference/shared-merge-tree) 和 [warehouse](/cloud/reference/warehouses) 功能

### 在多种使用场景与条件下经过验证 {#tested-proven}
- 已在 ClickHouse Cloud 中经过全面测试与验证

### 合规套件 {#compliance-package}
- 提供 [NIST 风险管理框架（Risk Management Framework，RMF）](https://csrc.nist.gov/projects/risk-management/about-rmf) 相关文档，有助于加速您获得运行授权（Authorization to Operate，ATO）的进程

### 完备的产品路线图并定期加入新功能 {#full-featured-roadmap}
即将推出的其他特性包括：
- 用于以编程方式管理资源的 API
  - 自动备份
  - 自动纵向扩缩容操作
- 身份提供方（IdP）集成

</VerticalStepper>



## 架构 {#architecture}

ClickHouse Government 完全运行在您的部署环境中，由 Kubernetes 管理的计算资源以及基于兼容 S3 的存储解决方案的存储组成。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government 架构" background='black'/>

<br />



## 接入流程 {#onboarding-process}

客户可以通过[联系我们](https://clickhouse.com/government)来开始接入流程。对于符合条件的客户，我们将提供详细的环境构建指南，以及用于部署的镜像和 Helm 图表的访问权限。



## 通用要求 {#general-requirements}

本节旨在概述部署 ClickHouse Government 所需的资源。具体的部署指南将在接入（onboarding）过程中提供。实例/服务器的类型和规格取决于具体用例。

### 在 AWS 上部署 ClickHouse Government {#clickhouse-government-aws}

所需资源：
- 用于接收镜像和 Helm 图表的 [ECR](https://docs.aws.amazon.com/ecr/)
- 能够生成符合 FIPS 标准证书的证书颁发机构（Certificate Authority）
- 具有 [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、用于身份验证的 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 以及一个 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 提供程序的 [EKS](https://docs.aws.amazon.com/eks/) 集群
- 服务器节点运行 Amazon Linux
- Operator 需要一个 x86 节点组
- 一个与 EKS 集群位于同一区域的 S3 存储桶
- 如果需要入口（Ingress），还需要配置一个 NLB
- 每个 ClickHouse 集群需要一个 AWS 角色，用于执行 clickhouse-server/keeper 操作
