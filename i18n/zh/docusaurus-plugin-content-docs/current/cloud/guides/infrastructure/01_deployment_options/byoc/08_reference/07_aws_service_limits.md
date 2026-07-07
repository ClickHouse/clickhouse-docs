---
title: '管理 AWS 服务限制和配额'
slug: /cloud/reference/byoc/aws-service-limits
sidebar_label: 'AWS 服务限制和配额'
keywords: ['BYOC', '自带云', 'AWS', '服务配额', '服务限制', 'EC2', 'EKS', 'VPC', 'EBS']
description: 'BYOC onboarding 前需要核查的 AWS 服务配额、如何申请提高配额，以及随着服务扩展需要监控的内容'
doc_type: 'reference'
---

成功的 BYOC 部署取决于您的 AWS 账户中是否具有充足的 AWS 服务配额 (此前称为 *服务限制*) 。AWS 对大多数服务按每个 区域 应用默认配额。许多默认配额都低于生产环境 BYOC 部署所需的水平，尤其是在新创建或使用较少的 AWS 账户中。

本页提供了一份部署前配额核对清单。请监控您的使用情况，并直接与云服务提供商沟通申请提高配额。

## 部署前配额检查清单 \{#pre-deployment-quota-checklist\}

在开始 BYOC 引导流程之前，请确认计划部署所在 AWS 区域中的以下配额。配额按区域和账户分别设置。

### 所需配额 \{#required-quotas\}

| 服务                         | 配额名称                             | BYOC 要求                                                                             | 默认值                | 操作                                  |
| -------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| **EC2**                    | 正在运行的按需标准实例 (A、C、D、H、I、M、R、T、Z)  | ≥ 你的服务层级峰值 vCPU × 1.5 (为 autoscaling 和 MBB 升级预留余量) + 100 个 vCPU 核心用于系统和 Keeper 工作负载 | 新账户通常为 32–256 vCPU | **申请提升配额** 以满足 BYOC 要求              |
| **EC2 (VPC)**              | 每个区域的 VPC 数量                     | ≥ 1 (BYOC 会创建 1 个专用 VPC)                                                            | 5                  | 确认有可用配额                             |
| **EC2 (VPC)**              | 每个区域的 Elastic IP 数量              | ≥ 3 (每个 AZ 1 个，用于 NAT Gateway)                                                      | 5                  | 确认可用配额。如果在同一区域运行多个 BYOC 部署，请申请提升配额。 |
| **EC2 (VPC)**              | 每个 AZ 的 NAT Gateway 数量           | ≥ 1                                                                                 | 5                  | 确认有可用配额                             |
| **EC2 (VPC)**              | 每个区域的 Internet Gateway 数量        | ≥ 1                                                                                 | 5                  | 确认有可用配额                             |
| **EC2 (VPC)**              | 每个 VPC 的子网数量                     | ≥ 6 (3 个公有 + 3 个私有)                                                                 | 200                | 无需操作                                |
| **EC2 (VPC)**              | 每个 VPC 的安全组数量                    | ≥ 10                                                                                | 2,500              | 无需操作                                |
| **EKS**                    | 每个区域的集群数量                        | ≥ 1                                                                                 | 100                | 无需操作                                |
| **EKS**                    | 每个集群的托管节点组数量                     | ≥ 4                                                                                 | 30                 | 无需操作                                |
| **EKS**                    | 每个托管节点组的节点数                      | ≥ 你的服务层级峰值节点数                                                                       | 450                | 无需操作                                |
| **S3**                     | 每个账户的存储桶数量                       | ≥ 4 (数据、备份、计费、监控)                                                                   | 100 (支持提升至 1,000)  | 确认为其他工作负载预留了足够余量                    |
| **EBS**                    | 通用型 SSD (gp3) 存储容量               | ≥ ClickHouse 日志峰值 + OS 卷 × 节点数                                                      | 50 TiB             | 确认有可用配额                             |
| **Elastic Load Balancing** | 每个区域的网络负载均衡器数量                   | ≥ 每个 ClickHouse 服务 1 个                                                              | 50                 | 确认有可用配额                             |
| **CloudWatch Logs**        | 每个区域的日志组数量                       | ≥ 5                                                                                 | 1,000,000          | 无需操作                                |

### 用于验证是否已启用可选功能的配额 \{#optional-feature-quotas\}

| 已启用功能           | 服务        | 配额                                                              |
| --------------- | --------- | --------------------------------------------------------------- |
| AWS PrivateLink | EC2 (VPC) | 每个区域的 VPC 端点服务数 (默认 20) ——每增加一个同时启用 PrivateLink 的服务，都需要申请提高此限制。 |
| VPC Peering     | EC2 (VPC) | 每个 VPC 的活动 VPC 对等连接数 (默认 50) 。                                  |

## 相关内容 \{#related\}

* [AWS 计费服务](/cloud/reference/byoc/billable-aws-services) — BYOC 预配的 AWS 服务完整清单
* [BYOC 成本模型 (AWS) ](/cloud/reference/byoc/cost-model-aws) — ClickHouse Cloud 与 AWS 的费用如何合并
* [BYOC 架构](/cloud/reference/byoc/architecture) — ClickHouse Cloud 在您的账户中部署的组件