---
title: 'ClickHouse 政府云'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['government', 'fips', 'fedramp', 'gov cloud']
description: 'ClickHouse 政府云产品概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概述 {#overview}

ClickHouse Government 是一个自部署软件包,由与 ClickHouse Cloud 上运行的相同专有版本 ClickHouse 以及我们的 ClickHouse Operator 组成,配置为计算与存储分离,并经过加固以满足政府机构和公共部门组织的严格要求。它部署在具有 S3 兼容存储的 Kubernetes 环境中。

该软件包目前支持 AWS,裸机部署即将推出。

:::note 注意
ClickHouse Government 专为政府机构、公共部门组织或向这些机构和组织销售产品的云软件公司设计,提供对其专用基础设施的完全控制和管理权限。此选项仅可通过[联系我们](https://clickhouse.com/government)获取。
:::


## 相比开源版本的优势 {#benefits-over-os}

以下特性使 ClickHouse Government 区别于自行管理的开源部署：

<VerticalStepper headerLevel="h3">

### 性能增强 {#enhanced-performance}

- 原生计算存储分离架构
- 专有云功能，如 [shared merge tree](/cloud/reference/shared-merge-tree) 和 [warehouse](/cloud/reference/warehouses) 功能

### 经过多种用例和场景的测试验证 {#tested-proven}

- 在 ClickHouse Cloud 中经过全面测试和验证

### 合规性支持包 {#compliance-package}

- [NIST 风险管理框架 (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) 文档，加速您的运营授权 (ATO) 流程

### 功能完整的产品路线图，定期发布新功能 {#full-featured-roadmap}

即将推出的其他功能包括：

- 用于编程化管理资源的 API
  - 自动备份
  - 自动垂直扩缩容
- 身份提供商集成

</VerticalStepper>


## 架构 {#architecture}

ClickHouse Government 完全自包含于您的部署环境中,由 Kubernetes 管理的计算资源和 S3 兼容存储解决方案组成。

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='ClickHouse Government 架构'
  background='black'
/>

<br />


## 入驻流程 {#onboarding-process}

客户可以通过联系[我们](https://clickhouse.com/government)来启动入驻流程。对于符合资格的客户,我们将提供详细的环境构建指南,以及部署所需的镜像和 Helm chart 的访问权限。


## 通用要求 {#general-requirements}

本节概述部署 ClickHouse Government 所需的资源。具体部署指南将在入职流程中提供。实例/服务器的类型和规模取决于使用场景。

### AWS 上的 ClickHouse Government {#clickhouse-government-aws}

所需资源:

- [ECR](https://docs.aws.amazon.com/ecr/) 用于接收镜像和 Helm chart
- 能够生成符合 FIPS 标准的证书颁发机构
- [EKS](https://docs.aws.amazon.com/eks/) 集群,需配置 [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、用于身份验证的 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 以及 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 提供程序
- 服务器节点运行 Amazon Linux
- Operator 需要 x86 节点组
- 与 EKS 集群位于同一区域的 S3 存储桶
- 如需配置入站流量,还需配置 NLB
- 每个 ClickHouse 集群需要一个 AWS 角色,用于 clickhouse-server/keeper 操作
