---
title: '产生费用的 AWS 服务'
slug: /cloud/reference/byoc/billable-aws-services
sidebar_label: '产生费用的 AWS 服务'
keywords: ['BYOC', '自带云', 'AWS', '计费', '成本', 'EKS', 'EC2', 'S3', 'NAT Gateway', 'PrivateLink']
description: '由 ClickHouse BYOC 预配的 AWS 服务，按必选和可选分类，并注明哪些服务会在您的 AWS 账单中产生费用'
doc_type: 'reference'
---

ClickHouse BYOC 会在您的 AWS 账户中预配一个独立的数据平面。本页列出了该部署使用的所有 AWS 服务，将其归类为必选或可选，并注明哪些服务会在您的 AWS 账单中产生费用。

:::note
AWS 基础设施费用由 AWS 直接向您的账户收取，与您的 ClickHouse Cloud 订阅无关。
:::

## 必需服务 \{#mandatory-services\}

这些服务会在每个 BYOC 部署中预配。

| 服务                                            | 用途                                                                                                                                                 | 是否计费？                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **Amazon EKS**                                | 运行 ClickHouse 数据平面的托管 Kubernetes 控制平面。                                                                                                             | 是 — 按每个集群小时计费            |
| **Amazon EC2** (通过 EKS 托管节点组提供工作节点实例)         | 为 ClickHouse 服务器 pod (容器组) 、ClickHouse Keeper 和平台附加组件提供计算资源。默认使用内存优化实例类型系列。                                                                        | 是 — 按每个实例小时计费            |
| **Amazon EBS** (gp3 卷)                        | 为节点操作系统、容器镜像和 ClickHouse 服务器日志提供本地存储。                                                                                                              | 是 — 按每 GB/月 + IOPS/吞吐量计费 |
| **Amazon S3**                                 | 用于 ClickHouse 表的主要存储、备份和平台遥测数据。存储桶策略会强制启用 `BucketOwnerEnforced`、阻止公共访问和 SSE。                                                                       | 是 — 按存储 + 请求 + 数据传输计费    |
| **Amazon VPC** (VPC、子网、路由表、安全组、互联网网关)         | 为数据平面提供网络隔离。跨 AZ 配置三个私有子网和三个公有子网。                                                                                                                  | 否 — VPC 资源本身免费           |
| **NAT Gateway + Elastic IP** (每个 AZ 一个)       | 为私有子网提供出站互联网访问 (控制平面连接、镜像拉取、遥测) 。                                                                                                                  | 是 — 按小时 + 数据处理量计费        |
| **VPC Endpoint for S3** (网关端点)                | 无需经过 NAT 即可私有访问 S3。                                                                                                                                | 否 — 网关端点免费               |
| **Elastic Load Balancing (NLB)**              | ClickHouse 服务的客户端流量入口。由集群内 AWS Load Balancer Controller 创建。默认：仅限内部访问。                                                                              | 是 — 按每 LCU/小时 + 已处理数据量计费 |
| **AWS IAM** (角色、策略、OIDC 提供商、Pod Identity 关联)  | 为 ClickHouse Cloud 提供跨账户访问，并为集群内控制器提供 IRSA (cert-manager、external-dns、load-balancer-controller、cluster-autoscaler、EBS CSI driver、state-exporter) 。 | 否                        |
| **Amazon CloudWatch Logs**                    | EKS 控制平面日志 (api、audit、authenticator、controllerManager、scheduler) 。                                                                                 | 是 — 按摄取 + 存储计费           |

## 可选服务 \{#optional-services\}

仅在启用相应功能时，才会预配这些服务。

| 服务                              | 启用条件                                                           | 是否计费？                          |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| **AWS PrivateLink** (VPC 端点服务)  | 您为客户端流量启用 PrivateLink 连接，以替代 NLB，或在使用 NLB 的同时额外启用 PrivateLink。 | 是 — 按每个 VPC 端点每小时费用 + 处理的数据量计费 |
| **VPC Peering Connection**      | 您请求在 BYOC VPC 与您账户中的另一个 VPC 之间建立对等连接。                          | 连接本身不收费，但跨可用区和跨区域的数据传输会产生费用。   |

## 数据传输费用 \{#data-transfer-charges\}

即使各项资源本身免费，AWS 仍会收取数据传输费用：

* 多可用区部署中，EKS 节点之间以及各副本之间的 **跨可用区流量**。
* 通过 NAT Gateway 发往互联网的 **出站流量**，用于控制平面心跳、遥测数据和镜像拉取。
* 通过加密覆盖网络 (Tailscale) 发往 **ClickHouse Cloud 控制平面** 的 **出站流量**。
* 通过 NLB 或 PrivateLink 端点发往客户端网络的 **出站流量**。

当前费率请参见 [AWS 数据传输定价](https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer)。

## 相关内容 \{#related\}

* [BYOC architecture](/cloud/reference/byoc/architecture) — ClickHouse Cloud 在您的账户中部署的各个组件
* [BYOC network security](/cloud/reference/byoc/reference/network_security) — 数据平面如何连接到 ClickHouse Cloud
* [BYOC privilege](/cloud/reference/byoc/reference/privilege) — 在 BYOC 设置过程中创建的 IAM 角色