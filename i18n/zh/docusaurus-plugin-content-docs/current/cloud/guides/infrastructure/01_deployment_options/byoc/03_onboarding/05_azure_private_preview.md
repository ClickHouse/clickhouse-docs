---
title: 'Azure 私有预览'
slug: /cloud/reference/byoc/onboarding/azure-private-preview
sidebar_label: 'Azure（私有预览）'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'azure']
description: '通过 Terraform 模块和跨租户身份验证在 Azure 上接入 ClickHouse BYOC'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

:::note
Azure 上的 BYOC 目前正处于 **私有预览** 阶段。若要参与，请[联系 ClickHouse 团队](https://clickhouse.com/cloud/bring-your-own-cloud)。
:::


## 概览 \{#overview\}

Azure 上的 BYOC 允许你在自己的 Azure 订阅中运行 ClickHouse。接入过程使用一个 Terraform 模块，预配 ClickHouse Cloud 的 provisioner 在你的租户和订阅中创建和管理 Azure 资源所需的跨租户身份验证。

部署的其他方面——例如[架构](/cloud/reference/byoc/architecture)、[网络安全](/cloud/reference/byoc/reference/network_security)、[功能](/cloud/reference/byoc/overview#features)和[连接方式](/cloud/reference/byoc/connect)——在总体上与 AWS 和 GCP 的 BYOC 方案类似；更多细节请参阅这些页面。

## 前提条件 \{#prerequisites\}

- 一个用于托管 BYOC 部署的 Azure **订阅** 和 **租户**
- 用于与 ClickHouse 团队共享的 **订阅 ID** 和 **租户 ID**

## Onboarding \{#onboarding\}

<VerticalStepper headerLevel="h3">

### 1. 应用 Terraform 模块 \{#apply-terraform-module\}

要开始 BYOC Azure 入驻流程，请在你的 **目标租户和订阅** 中应用 ClickHouse 提供的 [Azure Terraform 模块](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/azure)。

参考该模块的文档获取必填变量和执行步骤。应用完成后，该模块会在你的 Azure 环境中配置所需的身份和权限。

### 2. 将 ID 提供给 ClickHouse \{#provide-ids\}

将以下信息分享给 ClickHouse 团队：

- **目标订阅 ID** — 创建 BYOC 资源所用的 Azure 订阅
- **目标租户 ID** — 拥有该订阅的 Azure AD（Entra）租户
- **区域（Region）** — 你希望部署 ClickHouse 服务的 Azure 区域
- **VNet CIDR 范围** — 你希望用于 BYOC VNet 的 IP 地址范围

ClickHouse 团队将使用这些信息创建 BYOC 基础设施并完成入驻流程。

</VerticalStepper>

### 跨租户身份验证的工作原理 \{#cross-tenant-auth\}

根据 [Azure 关于跨租户身份验证的指南](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)，该 Terraform 模块会执行以下操作：

1. **预配一个多租户应用程序**，并在你的目标租户中将其创建为一个 **Enterprise Application**（企业应用 / 服务主体）
2. **为该应用程序分配所需权限**，并将其作用域限定在你的目标订阅中

这使得 ClickHouse Cloud 控制平面能够在你的订阅内创建和管理 Azure 资源（例如资源组、AKS、存储和网络），而无需在 ClickHouse 中存储你的 Azure 凭据。

有关 Azure 中多租户应用程序和跨租户场景的更多详细说明，请参阅：

- [Microsoft Entra ID 中的单租户和多租户应用程序](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)
- [授权跨租户访问（Azure SignalR 示例）](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-authorize-cross-tenant)