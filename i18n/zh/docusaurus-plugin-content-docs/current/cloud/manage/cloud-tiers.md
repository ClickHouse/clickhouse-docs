---
'sidebar_label': 'ClickHouse云层'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud Tiers'
'description': 'ClickHouse Cloud中提供的云层'
---




# ClickHouse Cloud 级别

在 ClickHouse Cloud 中提供几个级别。 
级别可以在任何组织级别分配。因此，组织内的服务属于同一级别。 
本页面讨论了哪些级别适合您的特定用例。

**云级别概述：**

<table><thead>
  <tr>
    <th></th>
    <th>[基础](#basic)</th>
    <th>[扩展 (推荐)](#scale)</th>
    <th>[企业](#enterprise)</th>
  </tr></thead>
<tbody>
  <tr>
    <td>**服务特性**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>服务数量</td>
    <td>✓ 无限</td>
    <td>✓ 无限</td>
    <td>✓ 无限</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>✓ 最多 1 TB / 服务</td>
    <td>✓ 无限</td>
    <td>✓ 无限</td>
  </tr>
  <tr>
    <td>内存</td>
    <td>✓ 总内存 8-12 GiB</td>
    <td>✓ 可配置</td>
    <td>✓ 可配置</td>
  </tr>
  <tr>
    <td>可用性</td>
    <td>✓ 1 区域</td>
    <td>✓ 2 个及以上区域</td>
    <td>✓ 2 个及以上区域</td>
  </tr>
  <tr>
    <td>备份</td>
    <td>✓ 每 24 小时 1 个备份，保留 1 天</td>
    <td>✓ 可配置</td>
    <td>✓ 可配置</td>
  </tr>
  <tr>
    <td>纵向扩展</td>
    <td></td>
    <td>✓ 自动扩展</td>
    <td>✓ 标准配置自动扩展，自定义配置手动扩展</td>
  </tr>
  <tr>
    <td>横向扩展</td>
    <td></td>
    <td>✓ 手动扩展</td>
    <td>✓ 手动扩展</td>
  </tr>
  <tr>
    <td>ClickPipes</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>提前升级</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>计算-计算分离</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>将备份导出到您自己的云帐户</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>计划升级</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>自定义硬件配置</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>**安全性**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>SAML/SSO</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>MFA</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>SOC 2 Type II</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>ISO 27001</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>私有网络</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>S3 基于角色的访问</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>透明数据加密 (CMEK for TDE)</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>HIPAA</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
</tbody></table>

## 基础 {#basic}

- 成本效益高，支持单副本部署。
- 适合数据量较小的部门用例，没有严格的可靠性保障。

:::note
基础级别中的服务旨在固定大小，不允许自动和手动扩展。
用户可以升级到扩展或企业级别以扩展他们的服务。
:::

## 扩展 {#scale}

专为需要增强服务水平协议 (2 个以上副本部署)、可扩展性和高级安全性的工作负载设计。

- 支持以下特性：
  - [私有网络支持](../security/private-link-overview.md)。
  - [计算-计算分离](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活的扩展](../manage/scaling.md)选项（向上/向下，向内/向外）。

## 企业 {#enterprise}

满足对大型、关键任务部署的严格安全和合规需求。

- 包含扩展中所有内容，**外加**
- 灵活的扩展：标准配置 (`1:4 vCPU:内存比`)，以及 `HighMemory (1:8比)` 和 `HighCPU (1:2比)` 自定义配置。
- 提供最高级别的性能和可靠性保障。
- 支持企业级安全性：
  - 单点登录 (SSO)
  - 增强加密：适用于 AWS 和 GCP 服务。服务默认由我们的密钥加密，并可以轮换到客户管理加密密钥 (CMEK)。
- 允许计划升级：用户可以选择升级的星期几/时间窗口，包括数据库和云发布。  
- 提供 [HIPAA](../security/compliance-overview.md/#hipaa-since-2024) 合规性。
- 将备份导出到用户的帐户。

:::note 
所有三个级别中的单副本服务旨在固定大小 (`8 GiB`, `12 GiB`)
:::

## 升级到不同级别 {#upgrading-to-a-different-tier}

您始终可以从基础升级到扩展，或从扩展升级到企业。

:::note
不支持降级级别。
:::

---

如果您对服务类型有任何疑问，请参阅 [定价页面](https://clickhouse.com/pricing) 或联系 support@clickhouse.com。
