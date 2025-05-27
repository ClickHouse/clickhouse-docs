---
'sidebar_label': 'ClickHouse Cloud 层级'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud 层级'
'description': '在 ClickHouse Cloud 可用的云层级'
---


# ClickHouse Cloud Tiers

ClickHouse Cloud 提供多个层级。 
层级可以在任何组织级别分配，因此组织内部的服务属于同一个层级。 
此页面讨论哪些层级适合您的特定用例。

**云层级摘要：**

<table><thead>
  <tr>
    <th></th>
    <th>[基础](#basic)</th>
    <th>[规模（推荐）](#scale)</th>
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
    <td>✓ 每个服务最多 1 TB</td>
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
    <td>✓ 1 个区域</td>
    <td>✓ 2+ 个区域</td>
    <td>✓ 2+ 个区域</td>
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
    <td>✓ 标准配置下自动扩展，自定义配置下手动扩展</td>
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
    <td>计算与计算分离</td>
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
    <td>透明数据加密（CMEK for TDE）</td>
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

- 成本效益高的选项，支持单副本部署。 
- 适合数据量较小且没有严格可靠性保证的部门用例。

:::note
基础层级的服务旨在固定大小，不允许自动和手动扩展。
用户可以升级到规模或企业层级以扩展其服务。
:::

## 规模 {#scale}

旨在满足需要增强服务级别协议（2+ 副本部署）、可扩展性和高级安全性的工作负载。

- 支持以下功能： 
  - [私有网络支持](../security/private-link-overview.md)。
  - [计算与计算分离](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活扩展](../manage/scaling.md)选项（向上/向下、向内/向外扩展）。

## 企业 {#enterprise}

满足具有严格安全和合规需求的大规模关键任务部署。

- 包含规模的一切，**此外**
- 灵活扩展：标准配置（`1:4 vCPU:内存比例`），以及 `高内存（1:8 比例）` 和 `高 CPU（1:2 比例）` 自定义配置。 
- 提供最高级别的性能和可靠性保证。 
- 支持企业级安全：
  - 单点登录（SSO）
  - 增强加密：针对 AWS 和 GCP 服务。服务默认由我们的密钥加密，并可以旋转到他们的密钥以启用客户管理加密密钥（CMEK）。
- 允许定期升级：用户可以选择升级的周几/时间窗口，包括数据库和云版本。 
- 提供 [HIPAA](../security/compliance-overview.md/#hipaa-since-2024) 合规性。
- 将备份导出到用户的账户。

:::note 
所有三个层级的单副本服务旨在具有固定大小（`8 GiB`，`12 GiB`）。
:::

## 升级到不同层级 {#upgrading-to-a-different-tier}

您可以随时从基础升级到规模或从规模升级到企业。

:::note
不可能降级层级。
:::

---

如果您对服务类型有任何问题，请查看 [定价页面](https://clickhouse.com/pricing) 或联系 support@clickhouse.com。
