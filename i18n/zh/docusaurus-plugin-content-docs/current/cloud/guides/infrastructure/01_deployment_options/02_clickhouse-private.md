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

ClickHouse Private 是一个自托管的软件包，由与 ClickHouse Cloud 上运行的相同 ClickHouse 专有版本以及我们的 ClickHouse Operator 组成，并配置为实现计算与存储分离。它部署在使用 S3 兼容存储的 Kubernetes 环境中。

该软件包目前适用于 AWS 和 IBM Cloud，后续将支持裸机部署。

:::note 注意
ClickHouse Private 专为具有最严格合规要求的大型企业设计，可对其专用基础设施实现完全的控制和管理。此选项仅可通过[联系我们](https://clickhouse.com/company/contact?loc=nav)获取。
:::



## 相较开源的优势 \{#benefits-over-os\}

以下特性使 ClickHouse Private 有别于自管型开源部署：

<VerticalStepper headerLevel="h3">

### 性能优化 \{#enhanced-performance\}
- 原生支持计算与存储分离
- 专有云端能力，例如 [shared merge tree](/cloud/reference/shared-merge-tree) 和 [warehouse](/cloud/reference/warehouses) 功能

### 在多种用例和运行条件下充分验证 \{#tested-proven-through-variety-of-use-cases\}
- 在 ClickHouse Cloud 中经过完整测试与验证

### 完善的功能路线图并持续引入新特性 \{#full-featured-roadmap\}
即将推出的其他特性包括：
- 用于以编程方式管理资源的 API
  - 自动备份
  - 自动垂直扩缩容操作
- 身份提供者集成

</VerticalStepper>



## 架构 \{#architecture\}

ClickHouse Private 在您的部署环境中完全自包含，由在 Kubernetes 中管理的计算资源以及使用 S3 兼容存储方案的存储组成。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private 架构" background='black'/>

<br />



## 接入流程 \{#onboarding-process\}

客户可以通过[联系我们](https://clickhouse.com/company/contact?loc=nav)来开始接入流程。对于符合条件的客户，我们将提供详细的环境搭建指南，以及用于部署的镜像和 Helm 图表的访问权限。



## 一般要求 \{#general-requirements\}

本节旨在概述部署 ClickHouse Private 所需的资源。具体的部署指南将在接入过程中提供。实例/服务器类型和规格取决于具体使用场景。

### 在 AWS 上运行 ClickHouse Private \{#clickhouse-private-aws\}

所需资源：
- [ECR](https://docs.aws.amazon.com/ecr/) 用于接收镜像和 Helm 图表
- 配置了 [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、用于认证的 [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) 以及 [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) 提供方的 [EKS](https://docs.aws.amazon.com/eks/) 集群
- 服务器节点运行 Amazon Linux
- Operator 需要一个 x86 节点组
- 与 EKS 集群位于同一区域的一个 S3 存储桶
- 如需入口（Ingress），还需配置 NLB
- 每个 ClickHouse 集群需要一个 AWS 角色，用于 clickhouse-server/keeper 操作

### 在 IBM Cloud 上运行 ClickHouse Private \{#clickhouse-private-ibm-cloud\}

所需资源：
- [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started) 用于接收镜像和 Helm 图表
- 配置了 [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model)、[Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block)、[Cloud DNS](https://www.ibm.com/products/dns) 和 [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable) 的 [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- 服务器节点运行 Ubuntu
- Operator 需要一个 x86 节点组
- 位于与 Cloud Kubernetes Service 集群相同区域的 [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)
- 如需入口（Ingress），还需配置 NLB
- 每个 ClickHouse 集群需要一个服务账号，用于 clickhouse-server/keeper 操作
