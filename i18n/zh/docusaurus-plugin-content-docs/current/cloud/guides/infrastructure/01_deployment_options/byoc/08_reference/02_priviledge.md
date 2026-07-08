---
title: 'BYOC 特权'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: '特权'
keywords: ['BYOC', 'Cloud', 'bring your own cloud', '特权']
description: '在您自有的 Cloud 基础设施上部署 ClickHouse'
doc_type: 'reference'
---

## AWS IAM 角色 \{#aws-iam-roles\}

### 引导 IAM 角色 \{#bootstrap-iam-role\}

引导 IAM 角色具有以下权限：

- **EC2 和 VPC 操作**：是设置 VPC 和 EKS 集群所必需的。
- **S3 操作（例如，`s3:CreateBucket`）**：用于为 ClickHouse BYOC 存储创建存储桶。
- **IAM 操作（例如，`iam:CreatePolicy`）**：供控制器创建其他角色所需（详细信息见下一节）。
- **EKS 操作**：仅限于名称以 `clickhouse-cloud` 作为前缀的资源。

### 控制器创建的其他 IAM 角色 \{#additional-iam-roles-created-by-the-controller\}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole` 之外，控制器还会创建若干其他角色。

这些角色由运行在客户 EKS 集群中的应用程序通过 AssumeRole 获取：

- **State Exporter Role（状态导出角色）**
  - ClickHouse 组件，用于向 ClickHouse Cloud 上报服务健康信息。
  - 需要具有向 ClickHouse Cloud 拥有的 SQS 队列写入的权限。
- **Load-Balancer Controller（负载均衡控制器）**
  - 标准 AWS 负载均衡控制器。
  - 用于管理 ClickHouse 服务卷的 EBS CSI Controller。
- **External-DNS**
  - 将 DNS 配置同步到 Route 53。
- **Cert-Manager**
  - 为 BYOC 服务域名签发 TLS 证书。
- **Cluster Autoscaler（集群弹性伸缩器）**
  - 按需调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色是供 AWS EKS 服务来扮演（assume）的。

最后，**`data-plane-mgmt`** 允许 ClickHouse Cloud 控制平面组件对所需的自定义资源（例如 `ClickHouseCluster` 和 Istio Virtual Service/Gateway）执行 reconcile 操作。

## GCP 服务账号 \{#gcp-service-accounts\}

### 引导 服务账号 \{#bootstrap-service-account\}

引导 服务账号会被授予项目级自定义角色，这些角色包含以下权限：

* **Common**：基础读取和身份相关权限。
* **VPC**：管理承载您的 BYOC 基础设施的 VPC、子网、路由以及 Private Service Connect 附件。
* **Cluster**：管理 GKE 集群及集群内资源。
* **Storage**：用于管理 Cloud Storage 存储桶，这些存储桶用于存放 ClickHouse backups、共享状态和监控数据。
* **IAM Role**：管理项目内的服务账号和自定义角色。此角色不授予创建服务账号密钥、绑定组织策略或操作其他项目中任何资源的能力。

### 控制器创建的其他服务账号 \{#additional-service-accounts-created-by-the-controller\}

除了在 onboarding 过程中通过 Terraform 创建的 `clickhouse-management` 服务账号外，当你预配第一个 BYOC service 时，ClickHouse 的控制平面 (以 `clickhouse-management` 身份进行身份验证) 还会在你的项目中为特定的集群内工作负载创建其他服务账号。每个账号都仅授予范围严格受限的单一用途权限。

* **GKE 节点运行时身份**
  * 附加到你的 BYOC 集群中每台 GKE 节点虚拟机。
  * 供 kubelet 节点代理、节点本地 agent 和 Cloud Operations collectors 使用，以发送日志和指标；镜像拉取子系统也会使用它来下载容器镜像。
* **计费抓取器身份**
  * 由 standalone 抓取器工作负载用于收集计费 telemetry。
* **监控身份**
  * 作为在你的集群中运行的监控栈的目标身份。用于在此部署专用的 GCS bucket 中读取和写入长期指标存储。
* **ClickHouse 运行时管理身份**
  * 由 ClickHouse 的运行时数据平面管理控制器使用，用于处理第 2 天运维操作，例如 Private Service Connect 端点管理、bucket 生命周期调整以及服务账号轮换。