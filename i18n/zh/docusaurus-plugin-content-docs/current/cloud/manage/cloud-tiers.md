---
'sidebar_label': 'ClickHouse云层'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse云层'
'description': 'ClickHouse Cloud中可用的云层'
---


# ClickHouse Cloud 层级

在 ClickHouse Cloud 中有几个可用的层级。 
层级可以在任何组织级别分配。因此，组织内的服务属于同一层级。 
本页讨论哪些层级适合您的特定用例。

**云层级总结：**

<table><thead>
  <tr>
    <th></th>
    <th>[基础](#basic)</th>
    <th>[扩展（推荐）](#scale)</th>
    <th>[企业级](#enterprise)</th>
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
    <td>✓ 最大 1 TB / 服务</td>
    <td>✓ 无限</td>
    <td>✓ 无限</td>
  </tr>
  <tr>
    <td>内存</td>
    <td>✓ 8-12 GiB 总内存</td>
    <td>✓ 可配置</td>
    <td>✓ 可配置</td>
  </tr>
  <tr>
    <td>可用性</td>
    <td>✓ 1 个区域</td>
    <td>✓ 2 个以上区域</td>
    <td>✓ 2 个以上区域</td>
  </tr>
  <tr>
    <td>备份</td>
    <td>✓ 每 24 小时 1 个备份，保留 1 天</td>
    <td>✓ 可配置</td>
    <td>✓ 可配置</td>
  </tr>
  <tr>
    <td>垂直扩展</td>
    <td></td>
    <td>✓ 自动扩展</td>
    <td>✓ 对于标准配置自动，定制配置手动</td>
  </tr>
  <tr>
    <td>水平扩展</td>
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
    <td>将备份导出到您自己的云账户</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>定期升级</td>
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
    <td>SOC 2 第 II 类</td>
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
    <td>透明数据加密（CMEK 用于 TDE）</td>
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

- 成本有效的选项，支持单副本部署。
- 适用于数据量较小且没有严格可靠性保证的部门用例。

:::note
基础层的服务旨在固定大小，且不允许进行自动或手动扩展。 
用户可以升级到扩展或企业级层来扩展其服务。
:::

## 扩展 {#scale}

专为需要增强 SLA（2 个以上副本部署）、可扩展性和高级安全性的工作负载设计。

- 提供对以下功能的支持： 
  - [私有网络支持](../security/private-link-overview.md)。
  - [计算-计算分离](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活的扩展](../manage/scaling.md)选项（向上/向下，进/出）。

## 企业级 {#enterprise}

满足大型、关键任务部署的需求，这些部署需要严格的安全性和合规性。

- 包含扩展层的所有功能，**加上**
- 灵活的扩展：标准配置（`1:4 vCPU:内存比`），以及 `HighMemory (1:8 比)` 和 `HighCPU (1:2 比)` 自定义配置。
- 提供最高水平的性能和可靠性保证。
- 支持企业级安全：
  - 单点登录（SSO）
  - 增强加密：对于 AWS 和 GCP 服务。服务默认由我们的密钥加密并可以切换到其密钥以启用客户管理加密密钥（CMEK）。
- 允许定期升级：用户可以选择升级的星期几/时间窗口，包括数据库和云发布。  
- 提供 [HIPAA](../security/compliance-overview.md/#hipaa-since-2024) 合规性。
- 将备份导出到用户账户。

:::note 
所有三个层级中的单副本服务旨在固定大小（`8 GiB`，`12 GiB`）。
:::

## 升级到不同层级 {#upgrading-to-a-different-tier}

您可以随时从基础层升级到扩展层或从扩展层升级到企业级层。

:::note
不允许降级层级。
:::

---

如果您对服务类型有任何疑问，请查看 [定价页面](https://clickhouse.com/pricing) 或联系 support@clickhouse.com。
