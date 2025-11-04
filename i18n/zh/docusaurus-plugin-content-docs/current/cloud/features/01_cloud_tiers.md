---
'sidebar_label': 'ClickHouse Cloud 层级'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud 层级'
'description': 'ClickHouse Cloud 中可用的云层级'
'doc_type': 'reference'
---


# ClickHouse Cloud 级别

在 ClickHouse Cloud 中有几个可用的级别。 
级别在任何组织级别上分配。因此，组织内的服务属于同一级别。
本页面讨论哪些级别适合您的特定用例。

**云级别摘要：**

<table><thead>
  <tr>
    <th></th>
    <th>[基本](#basic)</th>
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
    <td>✓ 1 区域</td>
    <td>✓ 2+ 区域</td>
    <td>✓ 2+ 区域</td>
  </tr>
  <tr>
    <td>备份</td>
    <td>✓ 每 24 小时 1 次备份，保留 1 天</td>
    <td>✓ 可配置</td>
    <td>✓ 可配置</td>
  </tr>
  <tr>
    <td>垂直扩展</td>
    <td></td>
    <td>✓ 自动扩展</td>
    <td>✓ 标准配置自动，定制配置手动</td>
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
    <td>导出备份到您自己的云账户</td>
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
    <td>SOC 2 类型 II</td>
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
    <td>S3 角色基础访问</td>
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

## 基本 {#basic}

- 成本效益高的选项，支持单副本部署。
- 适用于数据量较小、没有严格可靠性保证的部门用例。

:::note
基本级别的服务旨在保持固定大小，不允许自动和手动缩放。 
您可以升级到扩展或企业级别以扩展其服务。
:::

## 扩展 {#scale}

专为需要增强服务水平协议（2+ 副本部署）、可扩展性和高级安全性的工作负载设计。

- 提供对以下功能的支持： 
  - [私有网络支持](/cloud/security/private-link-overview).
  - [计算-计算分离](../reference/warehouses#what-is-compute-compute-separation).
  - [灵活扩展](/manage/scaling) 选项（向上/向下，内置/扩展）。
  - [可配置的备份](/cloud/manage/backups/configurable-backups)

## 企业 {#enterprise}

适用于大规模、关键任务的部署，具有严格的安全性和合规性需求。

- 包括扩展中的所有内容，**加上**
- 灵活的扩展：标准配置（`1:4 vCPU:内存比例`），以及 `HighMemory (1:8 比例)` 和 `HighCPU (1:2 比例)` 自定义配置。
- 提供最高水平的性能和可靠性保证。
- 支持企业级安全：
  - 单点登录 (SSO)
  - 增强加密：对于 AWS 和 GCP 服务，服务默认由我们的密钥加密，并可以旋转到它们的密钥以启用客户管理加密密钥（CMEK）。
- 允许定期升级：您可以选择升级的星期几/时间窗口，涵盖数据库和云发布。  
- 提供 [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) 和 PCI 合规性。
- 导出备份到用户的账户。

:::note 
三个级别中的单副本服务旨在保持固定大小 (`8 GiB`, `12 GiB`)
:::

## 升级到不同级别 {#upgrading-to-a-different-tier}

您可以随时从基本级别升级到扩展级别或从扩展级别升级到企业级别。 降级级别将需要禁用高级功能。

---

如果您对服务类型有任何问题，请查看 [定价页面](https://clickhouse.com/pricing) 或联系 support@clickhouse.com。
