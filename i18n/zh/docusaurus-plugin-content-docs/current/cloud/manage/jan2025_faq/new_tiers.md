---
'title': '新层描述'
'slug': '/cloud/manage/jan-2025-faq/new-tiers'
'keywords':
- 'new tiers'
- 'features'
- 'pricing'
- 'description'
'description': '新层和功能描述'
---



## 关键变更摘要 {#summary-of-key-changes}

### 针对功能与服务等级映射预期的关键变更是什么？ {#what-key-changes-to-expect-with-regard-to-features-to-tier-mapping}

- **私有链接/私有服务连接：** 目前在 Scale 和 Enterprise 级别的所有服务类型上都支持私有连接（包括单副本服务）。这意味着您现在可以为生产（大规模）和开发（小规模）环境都使用私有链接。
- **备份：** 所有服务默认都提供一个备份，额外备份将单独收费。用户可以利用可配置的备份控制来管理额外备份。这意味着备份需求较少的服务无需支付更高的捆绑价格。有关更多详情，请参见备份常见问题解答。
- **增强加密：** 此功能在 Enterprise 级别的服务中可用，包括单副本服务，在 AWS 和 GCP 中。服务默认使用我们的密钥加密，并可以旋转至其密钥以启用客户管理加密密钥（CMEK）。
- **单点登录 (SSO)：** 此功能在 Enterprise 级别提供，并需要支持票证才能为组织启用。拥有多个组织的用户应确保所有组织都在 Enterprise 级别，以便为每个组织使用 SSO。

## 基础级别 {#basic-tier}

### 基础级别的考虑因素是什么？ {#what-are-the-considerations-for-the-basic-tier}

基础级别适用于小型工作负载 - 用户希望部署一个不需要高可用性或进行原型开发的小型分析应用程序。该级别不适合需要规模、可靠性（DR/HA）和数据持久性的工作负载。该级别支持固定大小为 1x8GiB 或 1x12GiB 的单副本服务。有关更多信息，请参阅文档和 [支持政策](https://clickhouse.com/support/program)。

### 基础级别的用户可以访问私有链接和私有服务连接吗？ {#can-users-on-the-basic-tier-access-private-link-and-private-service-connect}

不，用户需要升级到 Scale 或 Enterprise 级别才能访问此功能。

### 基础和 Scale 级别的用户可以为组织设置 SSO 吗？ {#can-users-on-the-basic-and-scale-tiers-set-up-sso-for-the-organization}

不，用户需要升级到 Enterprise 级别才能访问此功能。

### 用户可以在所有级别启动单副本服务吗？ {#can-users-launch-single-replica-services-in-all-tiers}

是的，单副本服务在所有三个级别中均受支持。用户可以进行横向扩展，但不允许进行单副本的纵向扩展。

### 用户可以在基础级别进行扩展/缩小和增加更多副本吗？ {#can-users-scale-updown-and-add-more-replicas-on-the-basic-tier}

不，该级别的服务旨在支持小型和固定大小的工作负载（单副本 `1x8GiB` 或 `1x12GiB`）。如果用户需要扩展/缩小或增加副本，他们将被提示升级到 Scale 或 Enterprise 级别。

## Scale 级别 {#scale-tier}

### 在新计划（基础/Scale/Enterprise）中，哪个级别支持计算-计算分离？ {#which-tiers-on-the-new-plans-basicscaleenterprise-support-compute-compute-separation}

仅 Scale 和 Enterprise 级别支持计算-计算分离。请注意，此功能需要至少运行 2+ 副本的父服务。

### 现有计划（生产/开发）中的用户可以访问计算-计算分离吗？ {#can-users-on-the-legacy-plans-productiondevelopment-access-compute-compute-separation}

现有的开发和生产服务不支持计算-计算分离，除非用户已经参与了私有预览和测试。如果您有其他问题，请联系 [支持](https://clickhouse.com/support/program)。

## Enterprise 级别 {#enterprise-tier}

### Enterprise 级别支持哪些不同的硬件配置？ {#what-different-hardware-profiles-are-supported-for-the-enterprise-tier}

Enterprise 级别将支持标准配置（1:4 vCPU:内存比），以及 `highMem (1:8 比)` 和 `highCPU (1:2 比)` **自定义配置，** 为用户提供更多灵活性，以选择最符合其需求的配置。Enterprise 级别将使用部署在基础和 Scale 级别旁边的共享计算资源。

### Enterprise 级别独家提供哪些功能？ {#what-are-the-features-exclusively-offered-on-the-enterprise-tier}

- **自定义配置：** 实例类型选择的标准配置（1:4 vCPU:内存比）以及 `highMem (1:8 比)` 和 `highCPU (1:2 比)` 自定义配置选项。
- **企业级安全：**
    - **单点登录 (SSO)**
    - **增强加密：** 适用于 AWS 和 GCP 服务。服务默认使用我们的密钥进行加密，并可以旋转至其密钥，以启用客户管理加密密钥（CMEK）。
- **计划升级：** 用户可以选择升级的星期几和时间窗口，包括数据库和云发布。
- **HIPAA 合规：** 客户必须通过法律签署商业伙伴协议 (BAA)，然后我们才能为他们启用 HIPAA 合规区域。
- **私有区域：** 此功能未启用自助服务，需要用户通过销售提供请求 sales@clickhouse.com。
- **将备份导出** 到客户的云账户。
