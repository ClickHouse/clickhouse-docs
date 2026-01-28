---
title: 'BYOC 运维与维护'
slug: /cloud/reference/byoc/operations
sidebar_label: '运维与维护'
keywords: ['BYOC', '云', '自带 Cloud', '运维', '维护']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

## 概述 \{#overview\}

ClickHouse Cloud 会为您的 BYOC 部署负责升级和维护，确保您的服务安全、高性能并保持最新状态。本文介绍 BYOC 基础设施中各组件的升级流程，以及维护窗口的运作方式。

## ClickHouse 服务升级流程 \{#clickhouse-upgrade-process\}

我们会定期升级 ClickHouse 数据库，包括版本升级、缺陷修复和性能改进。ClickHouse Cloud 在执行升级时采用 ["make before break" (MBB)](https://clickhouse.com/docs/cloud/features/mbb) 策略，即先添加更新后的副本，再移除旧副本，从而在尽量减少对运行中工作负载影响的情况下，更加平滑地完成升级。

BYOC 中的 ClickHouse 服务升级流程和模式与标准 ClickHouse Cloud 服务保持一致，包括对发布通道（Fast、Regular 和 Slow）以及计划维护时间窗口的支持。所有 Scale 和 Enterprise 等级的功能在 BYOC 部署中均可用。关于升级时间安排、发布通道和维护时间窗口的详细信息，请参阅 [升级文档](/manage/updates)。

## Cloud 服务和资源升级流程 \{#cloud-upgrade-process\}

ClickHouse Cloud 会定期升级运行在 Kubernetes 上的支持服务以及你在 BYOC 部署中的基础设施组件，以确保安全性、可靠性以及对新功能的使用。这些 Cloud 服务升级在后台执行，并与我们标准的 Cloud 发布节奏保持一致。所有支持服务都通过 ArgoCD 进行管理，升级过程被设计为对服务无中断影响。预计在这些更新期间不会发生服务中断。

会被升级的 Cloud 服务示例包括：

- **ClickHouse Operator**：管理 ClickHouse 集群的 Kubernetes Operator
- **Istio Services**：入口和代理组件
- **Monitoring Stack**：Prometheus、Grafana、AlertManager 和 Thanos 组件

## Kubernetes 集群升级流程 \{#k8s-upgrade-process\}

承载 ClickHouse 服务的 Kubernetes 集群（AWS 上的 EKS、GCP 上的 GKE）需要定期升级，以维护安全性、兼容性，并获取新功能。对于 BYOC 部署，ClickHouse Cloud 会负责所有 Kubernetes 集群的升级，确保集群始终运行在受支持的最新版本上。

### 集群升级类型 \{#cluster-upgrade-types\}

**控制平面升级（Control Plane Upgrades）**：Kubernetes 控制平面组件（API server、etcd、controller manager）由 ClickHouse Cloud 负责升级。这些升级通常对您的工作负载是透明的，并且不需要重启 Pod（容器组）。

**节点组升级（Node Group Upgrades）**：工作节点升级需要进行节点替换，这可能会影响正在运行的 Pod（容器组）。ClickHouse Cloud 使用“先建后拆”（make-before-break）的方法来协调这些升级，以最大限度减少中断：

- 在移除旧节点之前，预先创建运行更新后 Kubernetes 版本的新节点
- 以优雅方式驱逐并将 Pod（容器组）迁移到新节点上
- 仅在 Pod（容器组）已成功迁移之后才终止旧节点

:::note
Kubernetes 节点升级可能会在迁移过程中导致短暂的 Pod（容器组）重启。ClickHouse Cloud 使用 Pod 中断预算（pod disruption budgets）和优雅关闭来将对您的工作负载的影响降到最低。
:::

### 升级计划 \{#upgrade-schedule\}

Kubernetes 集群升级将由 ClickHouse 支持团队与您协同安排。我们会提前告知升级计划，并与您一起确定合适的维护窗口，将对运维的影响降至最低。

### 版本支持 \{#version-support\}

ClickHouse Cloud 会在云服务提供商（AWS EKS 或 Google GKE）规定的受支持版本范围内维护 Kubernetes 集群。我们确保您的集群在保持与提供商要求兼容的同时，持续获得最新的安全补丁和功能更新。