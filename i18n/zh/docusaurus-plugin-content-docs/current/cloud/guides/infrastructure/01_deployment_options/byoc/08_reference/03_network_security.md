---
title: 'BYOC 网络安全'
slug: /cloud/reference/byoc/reference/network_security
sidebar_label: '网络安全'
keywords: ['BYOC', '云', '自带云', '网络安全']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_tailscale from '@site/static/images/cloud/reference/byoc-tailscale-1.png';


## ClickHouse 控制平面与您的 BYOC VPC 之间的连接 \{#connection-between-clickhouse-and-byoc\}

ClickHouse Cloud 控制平面维护多种类型的连接，以运维和支持您的 BYOC 部署：

| 目的 | 连接类型 | 说明 |
|---------|-----------------|-------|
| **日常运维 — Kubernetes API server** | 通过 IP 过滤的公网（默认）或 Tailscale | 管理服务通过公网与 EKS API server 通信，并通过 IP 允许列表进行限制。在初始部署之后，您可以选择将其切换为使用 Tailscale 进行私有访问。 |
| **日常运维 — AWS APIs** | ClickHouse VPC → AWS | 管理服务从 ClickHouse Cloud 自身的 VPC 调用 AWS APIs（例如 EKS、EC2）。这不涉及您的 VPC 或 Tailscale。 |
| **故障排查 — ClickHouse service** | Tailscale | ClickHouse 工程师通过 Tailscale 访问 ClickHouse service（例如系统表）以进行诊断。 |
| **故障排查 — Kubernetes API server** | Tailscale | ClickHouse 工程师通过 Tailscale 访问 EKS API server，以进行集群诊断。 |

下一节将说明如何使用 **Tailscale** 私有网络进行故障排查以及可选的管理访问。

## Tailscale 私有网络 \{#tailscale-private-network\}

Tailscale 在 ClickHouse Cloud 的管理服务与您的 BYOC 部署之间提供零信任的私有网络连接。通过这一安全通道，ClickHouse 工程师可以在无需访问公共互联网或配置复杂 VPN 的情况下执行故障排查和管理操作。

### 概览 \{#tailscale-overview\}

Tailscale 在 ClickHouse 控制平面（位于 ClickHouse 的 VPC）与您的 BYOC 数据平面（位于您的 VPC）之间创建一个加密的私有网络隧道。此连接专门用于：

- **管理操作**：ClickHouse 管理服务与您的 BYOC 基础设施进行协调
- **故障排查访问**：ClickHouse 工程师访问 Kubernetes API 服务器和 ClickHouse 系统表以进行诊断
- **指标访问**：ClickHouse 的集中监控仪表板从部署在您 BYOC VPC 内的 Prometheus 堆栈中获取指标，为 ClickHouse 工程师提供对该环境的可观测性。

:::important
Tailscale **仅用于管理和故障排查操作**。它 **绝不会用于查询流量** 或客户数据访问。所有客户数据始终保留在您的 VPC 内，绝不会通过 Tailscale 连接传输。
:::

### Tailscale 在 BYOC 中的工作方式 \{#how-tailscale-works\}

<Image img={byoc_tailscale} size="lg" alt="BYOC Tailscale" border />

对于每个需要通过 Tailscale 访问的服务或端点，ClickHouse BYOC 会部署：

1. **Tailnet 地址注册**：每个端点会注册一个唯一的 Tailnet 地址（例如 Kubernetes API server 使用的 `k8s.xxxx.us-east-1.aws.byoc.clickhouse-prd.com`）

2. **Tailscale Agent 容器**：一个在您的 EKS 集群中运行的 Tailscale agent 容器，负责：
   - 连接到 Tailscale 协调服务器
   - 注册服务以便实现服务发现
   - 与 Nginx pod（容器组）协调网络配置

3. **Nginx Pod**：一个 Nginx pod（容器组），其职责为：
   - 终结来自 Tailscale 的 TLS 流量
   - 将流量路由到 EKS 集群内相应的 IP

### 网络连接流程 \{#tailscale-connection-process\}

Tailscale 建立连接的过程如下：

1. **初始连接**：
   - 两端的 Tailscale agent（ClickHouse 工程师的环境和你的 BYOC EKS 集群）会连接到 Tailscale 协调服务器
   - EKS 集群中的 agent 会注册 Kubernetes Service，以便其可以被发现
   - ClickHouse 工程师需要通过内部流程申请访问，以获得该服务的可见性

2. **连接模式**：
   - **Direct Mode**：agent 尝试通过 NAT 穿透隧道建立直接连接
   - **Relay Mode**：如果 Direct Mode 失败，通信将回退到通过 Tailscale DERP（Distributed Encrypted Relay Protocol）服务器的中继模式

3. **加密**：
   - 所有通信均采用端到端加密
   - 每个 Tailscale agent 都会生成自己的公私钥对（类似于 PKI）
   - 无论使用 Direct 还是 Relay 模式，流量始终保持加密状态

### 安全特性 \{#tailscale-security\}

**仅出站连接（Outbound-Only Connections）**：

- EKS 集群中的 Tailscale 代理会向 Tailscale 的协调/中继服务器发起出站连接
- **不需要任何入站连接**——安全组规则无需允许指向 Tailscale 代理的入站流量
- 这会减少攻击面并简化网络安全配置

**访问控制（Access Control）**：

- 访问通过 ClickHouse 的内部审批系统进行控制
- 工程师必须通过指定的审批流程申请访问
- 访问具有时间限制，并会自动过期
- 所有访问都会被审计并记录日志

**基于证书的认证（Certificate-Based Authentication）**：

- 对于访问 ClickHouse 系统表，工程师使用临时的、带有效期的证书
- 在 BYOC 中，所有人工访问均采用基于证书的认证方式，取代基于密码的访问方式
- 访问仅限于系统表（不包括客户数据）
- 所有访问尝试都会记录在 ClickHouse 的 `query_log` 表中

### 通过 Tailscale 进行访问的故障排查 \{#troubleshooting-access-tailscale\}

当 ClickHouse 工程师需要对 BYOC 部署中的问题进行故障排查时，他们会通过 Tailscale 访问：

- **Kubernetes API Server**：用于诊断 EBS 挂载失败、节点级网络问题以及集群健康问题
- **ClickHouse System Tables**：用于查询性能分析和诊断查询（仅对 system 表进行只读访问）

故障排查访问流程如下：

1. **访问请求**：指定组内的值班工程师会请求访问客户的 ClickHouse 实例
2. **审批**：请求会通过内部审批系统，由指定审批人进行审批
3. **证书生成**：为获批的工程师生成一份有时效性的证书
4. **ClickHouse 配置**：ClickHouse Operator 配置 ClickHouse 接受该证书
5. **连接**：工程师通过 Tailscale 使用该证书访问实例
6. **自动过期**：访问会在预设时间段后自动失效

### 管理服务访问 \{#management-services-access\}

默认情况下，ClickHouse 管理服务通过 EKS API 服务器的公网 IP 地址访问你的 BYOC Kubernetes 集群，该公网 IP 仅对 ClickHouse NAT 网关的 IP 地址开放。

**可选的私有 endpoint 配置**：

- 你可以将 EKS API 服务器配置为仅通过私有 endpoint 提供服务
- 在这种情况下，管理服务会通过 Tailscale 访问 API 服务器（类似于人工排障访问）
- 同时保留公网访问作为备用机制，以便在紧急调查和支持时使用

### 网络流量路径 \{#tailscale-traffic-flow\}

**Tailscale 连接流程**：

1. EKS 集群中的 Tailscale agent → Tailscale 协调服务器（出站）
2. 工程师本地机器上的 Tailscale agent → Tailscale 协调服务器（出站）
3. 在各 agent 之间建立直连或经中继的连接
4. 加密流量通过已建立的隧道传输
5. EKS 中的 Nginx pod（容器组）终止 TLS 并将流量路由到内部服务

**无客户数据传输**：

- Tailscale 连接仅用于管理和故障排查
- 查询流量和客户数据绝不会通过 Tailscale 传输
- 所有客户数据都会保留在您的 VPC 内部

### 监控和审计 \{#tailscale-monitoring\}

ClickHouse 和客户都可以审计 Tailscale 访问活动：

- **ClickHouse 监控**：ClickHouse 会监视访问请求并记录所有通过 Tailscale 建立的连接
- **客户审计**：客户可以在自己的系统中跟踪来自 ClickHouse 工程师的活动
- **查询日志**：通过 Tailscale 对所有系统表的访问都会记录在 ClickHouse 的 `query_log` 表中

关于在 BYOC 中如何实现 Tailscale 的更多技术细节，请参阅 [Building ClickHouse BYOC on AWS 博文](https://clickhouse.com/blog/building-clickhouse-byoc-on-aws#tailscale-connection)。

## 网络边界 \{#network-boundaries\}

本节介绍往返于客户 BYOC VPC 的不同网络流量类型：

- **入站（Inbound）**：进入客户 BYOC VPC 的流量。
- **出站（Outbound）**：从客户 BYOC VPC 发出并发送到外部目标的流量。
- **公网（Public）**：可从公共互联网访问的网络端点。
- **私网（Private）**：只能通过私有连接（例如 VPC peering、VPC Private Link 或 Tailscale）访问的网络端点。

**Istio 入口部署在 AWS NLB 之后，用于接收 ClickHouse 客户端流量。**

*入站，公网或私网*

Istio 入口网关终止 TLS。由 cert-manager 使用 Let's Encrypt 签发的证书，作为 Secret 存储在 EKS 集群中。由于 Istio 和 ClickHouse 位于同一 VPC，它们之间的流量[由 AWS 加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

默认情况下，入口在公网可访问，并通过 IP 允许列表进行过滤。客户可以配置 VPC peering 将其改为私有，并禁用公网连接。我们强烈建议配置一个 [IP 过滤器](/cloud/security/setting-ip-filters) 来限制访问。

### 访问故障排查 \{#troubleshooting-access\}

*入站，私有*

ClickHouse Cloud 工程师需要通过 Tailscale 获取访问权限以进行故障排查。在 BYOC 部署中，他们通过基于证书的即时（just‑in‑time）身份验证方式获准访问。

### Billing scraper \{#billing-scraper\}

*出站，私有*

Billing scraper 从 ClickHouse 收集计费数据，并将其发送到由 ClickHouse Cloud 所有的 S3 bucket。

它作为 sidecar（边车容器）与 ClickHouse server 容器一起运行，定期抓取 CPU 和内存指标。同一区域内的请求通过 VPC 网关服务端点进行路由。

### 警报 \{#alerts\}

*出站，公共*

AlertManager 被配置为在客户的 ClickHouse 集群处于不健康状态时，将警报发送到 ClickHouse Cloud。

指标和日志存储在客户的 BYOC VPC 中。日志当前本地存储在 EBS 中。在后续的更新中，它们将存储在 LogHouse 中，这是 BYOC VPC 内部的一个 ClickHouse 服务。指标使用 Prometheus 和 Thanos 技术栈，本地存储在 BYOC VPC 中。

### 服务状态 \{#service-state\}

*出站，公共*

State Exporter 会将 ClickHouse 服务状态信息发送到 ClickHouse Cloud 所拥有的 SQS 队列。