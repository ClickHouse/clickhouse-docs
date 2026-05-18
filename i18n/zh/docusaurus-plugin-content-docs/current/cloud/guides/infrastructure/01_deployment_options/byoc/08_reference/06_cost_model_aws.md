---
title: 'BYOC 成本模型（AWS）'
slug: /cloud/reference/byoc/cost-model-aws
sidebar_label: '成本模型（AWS）'
keywords: ['BYOC', 'bring your own cloud', 'AWS', 'cost', 'billing', 'TCO', 'pricing', 'EC2', 'S3', 'EBS']
description: 'BYOC 部署的总拥有成本由 ClickHouse Cloud 收费和 AWS 基础设施费用共同构成'
doc_type: 'reference'
---

一个 ClickHouse BYOC 部署会产生两笔相互独立的费用：

1. **ClickHouse Cloud 收费** — 由 ClickHouse 就您的 ClickHouse 服务按总内存分配量计费。
2. **AWS 基础设施费用** — 由 AWS 直接向您的 AWS 账户收取，涵盖 BYOC 部署在其中预配的每一项资源。

本页说明这两部分费用分别如何计算，以及它们如何共同构成总拥有成本 (TCO) 。

## ClickHouse Cloud 费用 \{#clickhouse-cloud-charges\}

ClickHouse Cloud 的费用按总内存分配量计费。[联系团队](https://clickhouse.com/cloud/bring-your-own-cloud)以了解这对您的部署意味着什么。

## AWS 基础设施费用 \{#aws-infrastructure-charges\}

对于 BYOC 预配的每一项资源，AWS 都会直接向你的账户计费。ClickHouse 不会对 AWS 容量加价，也不会转售。有关必选和可选服务的完整清单，请参阅 [计费 AWS 服务](/cloud/reference/byoc/billable-aws-services)。

通常情况下，对 BYOC 账单影响最大的成本项按贡献从高到低大致如下：

1. **Amazon EC2** — 为 EKS 托管节点组提供支持的工作节点实例。默认使用标准 Graviton 家族 (例如 `m7g`) 。实例家族和数量会随服务分配的内存以及节点组自动扩缩容而变化。
2. **Amazon S3** — 在你的存储桶中存储 ClickHouse 表数据和备份。按每 GB/月计费，另加请求费用和跨区域传输费用。
3. **Amazon EBS** — 附加到工作节点的 gp3 卷，用于操作系统、容器镜像和 ClickHouse 日志。
4. **NAT Gateway 和跨 AZ 数据传输** — 包括来自私有子网的出站流量，以及可用区之间的流量 (多 AZ 部署会在各个 AZ 之间复制数据) 。
5. **Amazon EKS** — 按每集群小时收取固定的控制平面费用。
6. **Elastic Load Balancing (NLB)** — 按每 LCU 小时对客户端入口流量计费。
7. **CloudWatch Logs、Route 53、KMS、VPC 端点** — 通常只占总账单中的一小部分，但会随工作负载而变化。

如需查看 AWS 当前的标价，请参阅 [aws.amazon.com](https://aws.amazon.com/pricing/) 上各项服务的定价页面。

## 相关内容 \{#related\}

* [计费 AWS 服务](/cloud/reference/byoc/billable-aws-services) — BYOC 预配的 AWS 服务完整清单
* [AWS 服务限制和配额](/cloud/reference/byoc/aws-service-limits) — 部署前需要核查的配额
* [BYOC 架构](/cloud/reference/byoc/architecture) — ClickHouse Cloud 在您的账户中部署的各个组件