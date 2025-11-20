---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'ClickHouse Private 产品概览'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概述 {#overview}

ClickHouse Private 是一个自部署软件包,包含与 ClickHouse Cloud 上运行的相同专有版本的 ClickHouse 以及我们的 ClickHouse Operator,配置为存算分离架构。它部署在具有 S3 兼容存储的 Kubernetes 环境中。

该软件包目前支持 AWS 和 IBM Cloud,裸机部署即将推出。

:::note 注意
ClickHouse Private 专为具有最严格合规要求的大型企业设计,提供对其专用基础设施的完全控制和管理能力。此选项仅可通过[联系我们](https://clickhouse.com/company/contact?loc=nav)获取。
:::


## 相比开源版本的优势 {#benefits-over-os}

以下特性使 ClickHouse Private 与自管理开源部署有所区别:

<VerticalStepper headerLevel="h3">

### 性能增强 {#enhanced-performance}

- 原生计算存储分离架构
- 专有云功能,如 [共享合并树](/cloud/reference/shared-merge-tree) 和 [数据仓库](/cloud/reference/warehouses) 功能

### 经多种用例和场景验证 {#tested-proven-through-variety-of-use-cases}

- 已在 ClickHouse Cloud 中经过全面测试和验证

### 功能完善的产品路线图,定期发布新功能 {#full-featured-roadmap}

即将推出的功能包括:

- 用于编程化管理资源的 API
  - 自动备份
  - 自动纵向扩展
- 身份提供商集成

</VerticalStepper>


## 架构 {#architecture}

ClickHouse Private 完全自包含于您的部署环境中,由 Kubernetes 管理的计算资源和 S3 兼容存储解决方案组成。

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='ClickHouse Private 架构'
  background='black'
/>

<br />


## 入门流程 {#onboarding-process}

客户可以通过[联系我们](https://clickhouse.com/company/contact?loc=nav)来启动入门流程。对于符合资格的客户,我们将提供详细的环境构建指南,以及部署所需的镜像和 Helm chart 的访问权限。


## 通用要求 {#general-requirements}

本节概述部署 ClickHouse Private 所需的资源。具体部署指南将在入门流程中提供。实例/服务器的类型和规格取决于具体使用场景。

### AWS 上的 ClickHouse Private {#clickhouse-private-aws}

所需资源:

- [ECR](https://docs.aws.amazon.com/ecr/) 用于接收镜像和 Helm chart
- [EKS](https://docs.aws.amazon.com/eks/) 集群,需配置 [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、用于身份验证的 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 以及 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 提供程序
- 服务器节点运行 Amazon Linux
- Operator 需要 x86 节点组
- 与 EKS 集群位于同一区域的 S3 存储桶
- 如需配置入口流量,还需配置 NLB
- 每个 ClickHouse 集群需要一个 AWS 角色,用于 clickhouse-server/keeper 操作

### IBM Cloud 上的 ClickHouse Private {#clickhouse-private-ibm-cloud}

所需资源:

- [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started) 用于接收镜像和 Helm chart
- [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started),需配置 [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model)、[Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block)、[Cloud DNS](https://www.ibm.com/products/dns) 以及 [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)
- 服务器节点运行 Ubuntu
- Operator 需要 x86 节点组
- 与 Cloud Kubernetes Service 集群位于同一区域的 [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)
- 如需配置入口流量,还需配置 NLB
- 每个 ClickHouse 集群需要一个服务账户,用于 clickhouse-server/keeper 操作
