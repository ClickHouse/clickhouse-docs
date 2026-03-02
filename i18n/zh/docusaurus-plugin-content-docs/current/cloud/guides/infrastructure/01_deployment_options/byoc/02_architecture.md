---
title: '架构'
slug: /cloud/reference/byoc/architecture
sidebar_label: '架构'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 术语表 \{#glossary\}

- **ClickHouse VPC：**  由 ClickHouse Cloud 拥有的 VPC。
- **Customer BYOC VPC：**  由客户的云账户拥有，但由 ClickHouse Cloud 进行创建和管理，并专用于某个 ClickHouse Cloud BYOC 部署的 VPC。
- **Customer VPC：**  客户云账户下的其他 VPC，用于承载需要连接到 Customer BYOC VPC 的应用程序。

## 架构 \{#architecture\}

BYOC 将运行在 ClickHouse VPC 中的 **ClickHouse 控制平面（control plane）** 与完全在你自己的云账号中运行的 **数据平面（data plane）** 分离开来。ClickHouse VPC 承载 ClickHouse Cloud Console、认证与用户管理、API、计费，以及诸如 BYOC controller 和告警/事件处理工具等基础设施管理组件。这些服务用于编排和监控你的部署，但不会存储你的数据。

在你的 **Customer BYOC VPC** 中，ClickHouse 会预配一个 Kubernetes 集群（例如 Amazon EKS）来运行 ClickHouse 数据平面。如图所示，其中包括 ClickHouse 集群本身、ClickHouse operator，以及入口、DNS、证书管理、状态导出器和抓取器等支撑服务。一个专用监控栈（Prometheus、Grafana、Alertmanager 和 Thanos）也会在你的 VPC 内运行，确保指标与告警产生于并始终保留在你的环境中。

<br />

<Image img={byoc1} size="lg" alt="BYOC 架构" background='black'/>

<br />

ClickHouse Cloud 会在你的账号中部署的主要云资源包括：

* **VPC：** 一个专用于你 ClickHouse 部署的 Virtual Private Cloud。它可以由 ClickHouse 管理，也可以由你（客户）自行管理，并通常与你的应用 VPC 进行 VPC 对等连接（VPC Peering）。
* **IAM 角色和策略：** Kubernetes、ClickHouse 服务以及监控栈所需的角色与权限。这些既可以由 ClickHouse 预配，也可以由客户提供。
* **存储桶：** 用于存储数据分区片段、备份，以及（可选的）长期指标和日志归档。
* **Kubernetes 集群：** 可以是 Amazon EKS、Google GKE 或 Azure AKS，具体取决于你的云服务商，用于承载架构图中所示的 ClickHouse 服务器及支撑服务。

默认情况下，ClickHouse Cloud 会预配一个新的专用 VPC，并设置所需的 IAM 角色，以确保 Kubernetes 服务的安全运行。对于具有高级网络或安全需求的组织，还可以选择自行管理 VPC 和 IAM 角色。这种方式允许对网络配置进行更大程度的自定义，并对权限进行更精细的控制。但如果选择自管这些资源，你需要承担更多的运维责任。

### 数据存储 \{#data-storage\}

所有 ClickHouse 数据、备份和可观测性数据都会保留在你的云账户内。分区片段和备份存储在你的对象存储中（例如 Amazon S3），而日志则存储在附加到 ClickHouse 节点的存储卷上。在后续版本中，日志将会写入 LogHouse，这是一个同样运行在你的 BYOC VPC 内、基于 ClickHouse 的日志服务。指标可以本地存储，或者存储在 BYOC VPC 中的独立 bucket 中以实现长期保留。ClickHouse VPC 与 BYOC VPC 之间的控制平面连接通过安全且作用范围严格限定的通道提供（例如，通过图中所示的 Tailscale）；此通道仅用于管理操作，而不用于查询流量。

### 控制平面通信 \{#control-plane-communication\}

ClickHouse VPC 通过 HTTPS（443 端口）与您的 BYOC VPC 通信，用于执行服务管理操作，如配置变更、健康检查和部署命令。这些流量仅承载用于编排的控制平面数据。关键遥测数据和告警则从您的 BYOC VPC 流向 ClickHouse VPC，用于资源使用情况和健康状况监控。

## BYOC 的关键要求 \{#key-requirements\}

BYOC 部署模型需要两个核心组件，以确保运行可靠、维护简便并具备安全性：

### 跨账户 IAM 权限 \{#cross-account-iam-permissions\}

ClickHouse Cloud 需要跨账户 IAM 权限，才能在你的云账户中创建和管理资源，以便 ClickHouse 能够：

- **供应基础设施**：创建和配置 VPC、子网、安全组以及其他网络组件
- **管理 Kubernetes 集群**：部署和维护 EKS/GKE 集群、节点组和集群组件
- **创建存储资源**：为数据和备份供应 S3 存储桶或等价的对象存储
- **管理 IAM 角色**：为 Kubernetes 服务账号和支持性服务创建和配置 IAM 角色
- **运行支持性服务**：部署和管理监控栈、入口控制器以及其他基础设施组件

这些权限通过你在初始接入流程中创建的跨账户 IAM 角色（AWS）或 service account（GCP）授予。该角色遵循最小权限原则，权限范围仅限于 BYOC 运行所必需的内容。

有关所需具体权限的详细信息，请参阅 [BYOC 权限参考](/cloud/reference/byoc/reference/privilege)。

### Tailscale 私有网络连接 \{#tailscale-private-network\}

Tailscale 在 ClickHouse Cloud 管理服务与你的 BYOC 部署之间提供安全的零信任私有网络连接。该连接支持：

- **持续监控**：ClickHouse 工程师可以访问部署在你 BYOC VPC 中的 Prometheus 监控栈，以监控服务健康状况和性能
- **主动维护**：工程师可以执行常规维护、升级和故障排查操作
- **紧急支持**：在出现服务问题时，工程师可以快速访问你的环境以诊断和解决问题
- **基础设施管理**：管理服务可以与你的 BYOC 基础设施协同，以执行自动化运维操作

Tailscale 连接从你的 BYOC VPC 发起，**仅出站**——不需要任何入站连接，从而降低安全暴露面。所有访问都具备以下特性：

- **审批与审计**：工程师必须通过内部审批系统申请访问
- **时间限制**：访问在设定时长后会自动失效
- **访问受限**：工程师只能访问系统表和基础设施组件，绝不会访问客户数据
- **加密保护**：所有通信均端到端加密

关于 Tailscale 在 BYOC 中的工作方式和安全控制的详细信息，请参阅[网络安全文档](/cloud/reference/byoc/reference/network_security#tailscale-private-network)。

### 为什么这些要求很重要 \{#why-requirements-matter\}

这两个组件结合在一起，使 ClickHouse Cloud 能够：

- **保障可靠性**：主动监控和维护你的部署，预防问题发生
- **确保安全性**：使用最小特权访问，并具备完整的审计能力
- **简化运维**：在你保持控制权的同时，实现基础设施管理自动化
- **提供支持**：在问题发生时快速响应并解决

所有客户数据都保留在你的云账户中，绝不会通过这些管理通道被访问或传输。

**其他建议和注意事项：**

- 确保 BYOC VPC 的网络 CIDR 范围不与任何计划建立对等连接的现有 VPC 重叠。
- 为你的资源清晰地添加标签，以简化管理和支持。
- 为高可用性规划充足的子网容量，并在可用区之间合理分布。
- 查阅[安全作战手册](https://clickhouse.com/docs/cloud/security/audit-logging/byoc-security-playbook)，了解当 ClickHouse Cloud 在你的环境中运行时的共享责任模型和最佳实践。
- 查看完整的入门指南，以获取关于初始账户设置、VPC 配置、网络连通性（例如 VPC 对等连接）以及 IAM 角色委派的分步说明。

如果你有特殊需求或限制，请联系 ClickHouse Support，以获取关于高级网络配置或自定义 IAM 策略的指导。