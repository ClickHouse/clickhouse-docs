---
'title': '新层级的描述'
'slug': '/cloud/manage/jan-2025-faq/new-tiers'
'keywords':
- 'new tiers'
- 'features'
- 'pricing'
- 'description'
'description': '新层级和功能的描述'
---

## 关键更改摘要 {#summary-of-key-changes}

### 关于功能与层级映射的关键更改期待什么？ {#what-key-changes-to-expect-with-regard-to-features-to-tier-mapping}

- **私有链接/私有服务连接：** 现在所有服务类型在 Scale 和 Enterprise 层级上均支持私有连接（包括单副本服务）。这意味着您现在可以在生产（大规模）和开发（小规模）环境中都使用私有链接。
- **备份：** 所有服务现在默认提供一次备份，额外的备份则需单独收费。用户可以利用可配置的备份控制来管理额外的备份。这意味着对备份要求较少的服务不需要支付更高的捆绑价格。有关更多详细信息，请参见备份常见问题解答。
- **增强的加密：** 此功能在 Enterprise 层服务中可用，包括对单副本服务的支持，适用于 AWS 和 GCP。服务默认会使用我们的密钥进行加密，并可以轮换为其密钥，以启用客户管理的加密密钥（CMEK）。
- **单点登录 (SSO)：** 此功能在 Enterprise 层提供，启用时需要通过支持票务申请，供一个组织使用。拥有多个组织的用户应确保他们的所有组织均为 Enterprise 层，以便为每个组织使用 SSO。

## 基础层 {#basic-tier}

### 基础层有什么考虑因素？ {#what-are-the-considerations-for-the-basic-tier}

基础层适用于小型工作负载——用户希望部署一个不需要高可用性或用于原型的小型分析应用。此层不适合需要规模、可靠性（DR/HA）和数据持久性的工作负载。该层支持固定大小的单副本服务，1x8GiB 或 1x12GiB。有关更多信息，请参考文档和 [支持政策](https://clickhouse.com/support/program)。

### 基础层用户可以访问私有链接和私有服务连接吗？ {#can-users-on-the-basic-tier-access-private-link-and-private-service-connect}

不，可以使用此功能的用户需要升级到 Scale 或 Enterprise 层。

### 基础层和 Scale 层的用户可以为组织设置 SSO 吗？ {#can-users-on-the-basic-and-scale-tiers-set-up-sso-for-the-organization}

不，用户需要升级到 Enterprise 层才能访问此功能。

### 用户可以在所有层级启动单副本服务吗？ {#can-users-launch-single-replica-services-in-all-tiers}

是的，单副本服务在所有三个层级上均受支持。用户可以进行扩展，但不允许扩展为单副本。

### 用户可以在基础层进行扩展/缩减并添加更多副本吗？ {#can-users-scale-updown-and-add-more-replicas-on-the-basic-tier}

不，此层的服务旨在支持小型和固定大小（单副本 `1x8GiB` 或 `1x12GiB`）的工作负载。如果用户需要扩展/缩减或添加副本，他们将被提示升级到 Scale 或 Enterprise 层。

## Scale 层 {#scale-tier}

### 新计划（基础/Scale/Enterprise）中哪个层级支持计算-计算分离？ {#which-tiers-on-the-new-plans-basicscaleenterprise-support-compute-compute-separation}

仅 Scale 和 Enterprise 层支持计算-计算分离。请注意，此功能需要运行至少 2+ 个副本的父服务。

### 参与旧计划（生产/开发）的用户可以访问计算-计算分离吗？ {#can-users-on-the-legacy-plans-productiondevelopment-access-compute-compute-separation}

在现有开发和生产服务中不支持计算-计算分离，除非用户已经参与了私人预览和测试版。如果您有其他问题，请联系 [支持](https://clickhouse.com/support/program)。

## Enterprise 层 {#enterprise-tier}

### Enterprise 层支持哪些不同的硬件配置？ {#what-different-hardware-profiles-are-supported-for-the-enterprise-tier}

Enterprise 层将支持标准配置（1：4 vCPU：内存比）的配置，此外还有 `highMem (1:8 ratio)` 和 `highCPU (1:2 ratio)` **自定义配置，**为用户选择最适合其需求的配置提供更多灵活性。Enterprise 层将使用与基础层和 Scale 层一起部署的共享计算资源。

### Enterprise 层提供哪些独有的功能？ {#what-are-the-features-exclusively-offered-on-the-enterprise-tier}

- **自定义配置：** 实例类型选择的选项，包括标准配置（1：4 vCPU：内存比）以及 `highMem (1:8 ratio)` 和 `highCPU (1:2 ratio)` 自定义配置。
- **企业级安全：**
    - **单点登录 (SSO)**
    - **增强的加密：** 适用于 AWS 和 GCP 服务。服务默认会使用我们的密钥进行加密，并可以轮换为其密钥，以启用客户管理的加密密钥（CMEK）。
- **定期升级：** 用户可以选择升级的星期几/时间窗口，包括数据库和云发布。
- **HIPAA 合规性：** 客户必须通过法律签署商业协作协议 (BAA)，然后我们才会为他们启用 HIPAA 合规区域。
- **私有区域：** 此功能不支持自助启用，需要用户通过销售渠道销售@clickhouse.com 路由请求。
- **导出备份**到客户的云账户。
