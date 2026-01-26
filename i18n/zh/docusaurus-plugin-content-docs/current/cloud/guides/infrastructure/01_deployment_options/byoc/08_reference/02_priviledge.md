---
title: 'BYOC 权限'
slug: /cloud/reference/byoc/reference/priviledge
sidebar_label: '权限'
keywords: ['BYOC', '云', 'bring your own cloud', '权限']
description: '在您自有的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

## CloudFormation IAM 角色 \{#cloudformation-iam-roles\}

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