---
sidebar_label: 'ClickHouse Cloud 分层'
slug: /cloud/manage/cloud-tiers
title: '服务类型'
---


# ClickHouse Cloud 分层

在 ClickHouse Cloud 中，有几种可用的分层。
分层是在任何组织级别分配的。因此，组织内的服务属于同一分层。
本页面讨论哪个分层适合您的特定用例。

**云分层摘要：**

<table><thead>
  <tr>
    <th></th>
    <th>[基础](#basic)</th>
    <th>[扩展（推荐）](#scale)</th>
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
    <td>✓ 每个服务最大 1 TB</td>
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
    <td>纵向扩展</td>
    <td></td>
    <td>✓ 自动扩展</td>
    <td>✓ 标准配置自动，定制配置手动</td>
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
    <td>计算和计算分离</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>将备份导出到自己的云帐户</td>
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

- 成本效益高，支持单副本部署。
- 适用于没有严格可靠性保证的小型数据量的部门用例。

:::note
基础分层中的服务旨在固定大小，并不允许自动和手动扩展。
用户可以升级到扩展或企业分层以扩展其服务。
:::

## 扩展 {#scale}

为需要增强的服务水平协议（2+ 副本部署）、可扩展性和高级安全性的工作负载而设计。

- 支持以下特性：
  - [私有网络支持](../security/private-link-overview.md)。
  - [计算和计算分离](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活的扩展](../manage/scaling.md)选项（向上/向下、向内/向外）。

## 企业 {#enterprise}

满足大规模、关键任务部署的要求，这些部署具有严格的安全和合规需求。

- 包含扩展中的所有内容，**加上**
- 灵活扩展：标准配置（`1:4 vCPU:内存比例`），以及 `HighMemory (1:8 比例)` 和 `HighCPU (1:2 比例)` 自定义配置。
- 提供最高级别的性能和可靠性保证。
- 支持企业级安全性：
  - 单点登录（SSO）
  - 提高的加密：针对 AWS 和 GCP 服务。服务默认情况下由我们的密钥加密，并可以轮换至其密钥以启用客户管理的加密密钥（CMEK）。
- 允许定期升级：用户可以选择升级的周几/时间窗口，包括数据库和云发布。
- 提供 [HIPAA](../security/compliance-overview.md/#hipaa-since-2024) 合规性。
- 将备份导出到用户帐户。

:::note 
所有三个分层中的单副本服务旨在固定大小（`8 GiB`，`12 GiB`）
:::

## 升级到不同的分层 {#upgrading-to-a-different-tier}

您可以随时从基础升级到扩展或从扩展升级到企业。

:::note
不允许降级分层。
:::

如果您对服务类型有任何疑问，请参阅 [定价页面](https://clickhouse.com/pricing) 或联系 support@clickhouse.com。

