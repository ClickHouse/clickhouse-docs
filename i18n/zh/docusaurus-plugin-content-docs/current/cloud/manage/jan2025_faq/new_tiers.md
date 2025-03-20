---
title: 新层级的描述
slug: /cloud/manage/jan-2025-faq/new-tiers
keywords: ['new tiers', 'features', 'pricing', 'description']
description: 新层级和功能的描述
---

## 主要变化的摘要 {#summary-of-key-changes}

### 关于功能与层级映射，预计会有哪些关键变化？ {#what-key-changes-to-expect-with-regard-to-features-to-tier-mapping}

- **私有链接/私有服务连接：** 现在所有类型的服务在 Scale 和 Enterprise 层级上都支持私有连接（包括单副本服务）。这意味着您现在可以为您的生产（大规模）和开发（小规模）环境提供私有链接。
- **备份：** 所有服务默认提供一个备份，额外的备份需要单独收费。用户可以利用可配置的备份控制管理额外的备份。这意味着备份需求较少的服务不需要支付更高的捆绑价格。有关更多详细信息，请参见备份常见问题解答。
- **增强加密：** 该功能在 Enterprise 层级服务中可用，包括单副本服务，适用于 AWS 和 GCP。服务默认使用我们的密钥进行加密，并可以切换为客户的密钥以启用客户管理的加密密钥（CMEK）。
- **单点登录 (SSO)：** 此功能在 Enterprise 层级提供，需要支持票据以便为组织启用。拥有多个组织的用户应确保他们的所有组织均在 Enterprise 层级上，以便为每个组织使用 SSO。

## 基本层级 {#basic-tier}

### 基本层级有哪些考虑事项？ {#what-are-the-considerations-for-the-basic-tier}

基本层级适合小型工作负载 - 用户希望部署一个不需要高可用性的小型分析应用程序，或在一个原型上进行工作。此层级不适合需要规模、可靠性（灾难恢复/高可用性）和数据持久性的工作负载。该层级支持固定大小1x8GiB或1x12GiB的单副本服务。有关更多信息，请参阅文档和 [支持政策](https://clickhouse.com/support/program)。

### 基本层级的用户可以访问私有链接和私有服务连接吗？ {#can-users-on-the-basic-tier-access-private-link-and-private-service-connect}

不，用户需要升级到 Scale 或 Enterprise 才能访问此功能。

### 基本和 Scale 层级的用户可以为组织设置 SSO 吗？ {#can-users-on-the-basic-and-scale-tiers-set-up-sso-for-the-organization}

不，用户需要升级到 Enterprise 层级才能访问此功能。

### 用户可以在所有层级中启动单副本服务吗？ {#can-users-launch-single-replica-services-in-all-tiers}

是的，单副本服务在所有三个层级中都支持。用户可以扩展，但不允许扩展到单副本中。

### 用户可以在基本层级增加/减少副本并添加更多副本吗？ {#can-users-scale-updown-and-add-more-replicas-on-the-basic-tier}

不，此层级的服务旨在支持小型和固定大小（单副本 `1x8GiB` 或 `1x12GiB`）的工作负载。如果用户需要增加/减少副本或添加副本，将被提示升级到 Scale 或 Enterprise 层级。

## Scale 层级 {#scale-tier}

### 新计划（基本/Scale/Enterprise）中的哪些层级支持计算-计算分离？ {#which-tiers-on-the-new-plans-basicscaleenterprise-support-compute-compute-separation}

仅 Scale 和 Enterprise 层级支持计算-计算分离。请注意，此功能需要运行至少 2+ 副本的父服务。

### 现有计划（生产/开发）的用户可以访问计算-计算分离吗？ {#can-users-on-the-legacy-plans-productiondevelopment-access-compute-compute-separation}

现有的开发和生产服务不支持计算-计算分离，除非用户已参与私有预览和测试版。如果您有其他问题，请联系 [支持](https://clickhouse.com/support/program)。

## Enterprise 层级 {#enterprise-tier}

### Enterprise 层级支持哪些不同的硬件配置？ {#what-different-hardware-profiles-are-supported-for-the-enterprise-tier}

Enterprise 层级将支持标准配置（1:4 vCPU:内存比例），以及 `highMem (1:8 ratio)` 和 `highCPU (1:2 ratio)` **自定义配置，** 提供给用户更多灵活性以选择最适合他们需求的配置。Enterprise 层级将使用与基本层级和 Scale 层级一起部署的共享计算资源。

### Enterprise 层级独家提供哪些功能？ {#what-are-the-features-exclusively-offered-on-the-enterprise-tier}

- **自定义配置：** 实例类型选择的选项，标准配置（1:4 vCPU: 内存比）以及 `highMem (1:8 ratio)` 和 `highCPU (1:2 ratio)` 自定义配置。
- **企业级安全：**
    - **单点登录 (SSO)**
    - **增强加密：** 适用于 AWS 和 GCP 服务。服务默认使用我们的密钥进行加密，并可以切换为客户的密钥以启用客户管理的加密密钥（CMEK）。
- **定期升级：** 用户可以选择升级的星期几/时间窗口，包括数据库和云发布。
- **HIPAA 合规性：** 客户必须通过法律签署商业合作伙伴协议（BAA），然后我们才能为他们启用符合 HIPAA 的区域。
- **私有区域：** 不支持自助启用，需要用户通过 Sales sales@clickhouse.com 路由请求。
- **将备份导出** 到客户的云帐户。
