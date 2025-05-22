---
'title': '新层次的描述'
'slug': '/cloud/manage/jan-2025-faq/new-tiers'
'keywords':
- 'new tiers'
- 'features'
- 'pricing'
- 'description'
'description': '新层次和功能的描述'
---

## 关键变更摘要 {#summary-of-key-changes}

### 关于特性与层级映射的预期关键变更是什么？ {#what-key-changes-to-expect-with-regard-to-features-to-tier-mapping}

- **Private Link/Private Service Connect：** 现在所有服务类型在 Scale 和 Enterprise 层级中均支持私有连接（包括单副本服务）。这意味着您可以为您的生产（大规模）和开发（小规模）环境设置 Private Link。
- **备份：** 所有服务默认提供一次备份，额外备份将单独收费。用户可以利用可配置的备份控制来管理额外的备份。这意味着备份需求较少的服务无需支付更高的打包价格。请查看备份 FAQ 获取更多详情。
- **增强加密：** 此功能在 Enterprise 层级的服务中可用，包括单副本服务，适用于 AWS 和 GCP。服务默认由我们的密钥加密，并可以轮换到其密钥以启用客户管理加密密钥（CMEK）。
- **单点登录 (SSO)：** 此功能在 Enterprise 层级中提供，并需要支持工单为某个组织启用。拥有多个组织的用户应确保其所有组织都在 Enterprise 层级，以便为每个组织使用 SSO。

## 基础层级 {#basic-tier}

### 基础层级需要考虑哪些事项？ {#what-are-the-considerations-for-the-basic-tier}

基础层级旨在用于小型工作负载 - 用户希望部署一个不需要高可用性或用于原型的小型分析应用。此层级不适合需要规模、可靠性（灾难恢复/高可用）和数据持久性的工作负载。该层级支持固定大小为 1x8GiB 或 1x12GiB 的单副本服务。有关更多信息，请参考文档和 [支持政策](https://clickhouse.com/support/program)。

### 基础层级的用户可以访问 Private Link 和 Private Service Connect 吗？ {#can-users-on-the-basic-tier-access-private-link-and-private-service-connect}

不可以，用户需要升级到 Scale 或 Enterprise 才能访问此功能。

### 基础层级和 Scale 层级的用户可以为组织设置 SSO 吗？ {#can-users-on-the-basic-and-scale-tiers-set-up-sso-for-the-organization}

不可以，用户需要升级到 Enterprise 层级才能访问此功能。

### 用户可以在所有层级启动单副本服务吗？ {#can-users-launch-single-replica-services-in-all-tiers}

可以，单副本服务在所有三个层级中均受支持。用户可以扩展，但不允许缩减为单副本。

### 用户可以在基础层级上向上/向下扩展并添加更多副本吗？ {#can-users-scale-updown-and-add-more-replicas-on-the-basic-tier}

不可以，此层级的服务旨在支持小型和固定大小的工作负载（单副本 `1x8GiB` 或 `1x12GiB`）。如果用户需要向上/向下扩展或添加副本，将被提示升级到 Scale 或 Enterprise 层级。

## Scale 层级 {#scale-tier}

### 新计划（基础/Scale/Enterprise）中哪些层级支持计算-计算分离？ {#which-tiers-on-the-new-plans-basicscaleenterprise-support-compute-compute-separation}

只有 Scale 和 Enterprise 层级支持计算-计算分离。请注意，此功能需要至少运行 2+ 副本的父服务。

### 现有计划（生产/开发）的用户可以访问计算-计算分离吗？ {#can-users-on-the-legacy-plans-productiondevelopment-access-compute-compute-separation}

现有的开发和生产服务不支持计算-计算分离，除非用户已经参与了私有预览和测试版。如果您有其他问题，请联系 [支持](https://clickhouse.com/support/program)。

## Enterprise 层级 {#enterprise-tier}

### Enterprise 层级支持哪些不同的硬件配置？ {#what-different-hardware-profiles-are-supported-for-the-enterprise-tier}

Enterprise 层级将支持标准配置（1:4 vCPU:内存比），以及 `highMem (1:8 比)` 和 `highCPU (1:2 比)` **自定义配置，** 为用户提供更多选择，以便选择最适合的配置。Enterprise 层级将使用与基础和 Scale 层级一起部署的共享计算资源。

### Enterprise 层级独家提供哪些功能？ {#what-are-the-features-exclusively-offered-on-the-enterprise-tier}

- **自定义配置：** 实例类型选择的选项，标准配置（1:4 vCPU:内存比）和 `highMem (1:8 比)` 和 `highCPU (1:2 比)` 自定义配置。
- **企业级安全：**
    - **单点登录 (SSO)**
    - **增强加密：** 适用于 AWS 和 GCP 服务。服务默认由我们的密钥加密，并可以轮换到其密钥以启用客户管理加密密钥（CMEK）。
- **计划升级：** 用户可以选择进行升级的星期几/时间窗口，涉及数据库和云产品的发布。
- **HIPAA 合规：** 客户必须通过法律部门签署业务伙伴协议 (BAA)，在我们为他们启用符合 HIPAA 的区域之前。
- **私人区域：** 此功能无法自助开启，需要用户通过 Sales sales@clickhouse.com 路由请求。
- **导出备份** 到客户的云账户。
