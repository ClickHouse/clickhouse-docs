---
sidebar_label: 'ClickHouse Cloud 层级'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud 层级'
description: 'ClickHouse Cloud 中可用的云层级'
keywords: ['cloud tiers', 'service plans', 'cloud pricing tiers', 'cloud service levels']
doc_type: 'reference'
---



# ClickHouse Cloud 等级

ClickHouse Cloud 提供了多个不同的等级。
等级可以分配到任意组织层级，因此，一个组织内的所有服务都属于同一等级。
本页将介绍在你的具体使用场景下，哪些等级是合适的选择。

**云等级概览：**



<table>
  <thead>
    <tr>
      <th />

      <th>[基础版](#basic)</th>
      <th>[扩展版（推荐）](#scale)</th>
      <th>[企业版](#enterprise)</th>
    </tr>
  </thead>

  <tbody>
    <tr className="table-category-header">
      <td>**服务功能**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>服务数量</td>
      <td>✓ 不限</td>
      <td>✓ 不限</td>
      <td>✓ 不限</td>
    </tr>

    <tr>
      <td>存储</td>
      <td>✓ 每个服务最多 1 TB</td>
      <td>✓ 不限</td>
      <td>✓ 不限</td>
    </tr>

    <tr>
      <td>内存</td>
      <td>✓ 8-12 GiB 总内存</td>
      <td>✓ 可配置</td>
      <td>✓ 可配置</td>
    </tr>

    <tr>
      <td>可用性</td>
      <td>✓ 1 个可用区</td>
      <td>✓ 2 个及以上可用区</td>
      <td>✓ 2 个及以上可用区</td>
    </tr>

    <tr>
      <td>备份</td>
      <td>✓ 每 24 小时 1 次备份，保留 1 天</td>
      <td>✓ 可配置</td>
      <td>✓ 可配置</td>
    </tr>

    <tr>
      <td>纵向扩展</td>

      <td />

      <td>✓ 自动扩展</td>
      <td>✓ 标准配置文件支持自动扩展，自定义配置文件需手动扩展</td>
    </tr>

    <tr>
      <td>横向扩展</td>

      <td />

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

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>计算与计算分离</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>将备份导出到您自己的云账号</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>计划升级</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>自定义硬件配置文件</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr className="table-category-header">
      <td>**安全**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>SAML/SSO</td>

      <td />

      <td />

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

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>S3 基于角色的访问</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>透明数据加密（用于 TDE 的 CMEK）</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>HIPAA</td>

      <td />

      <td />

      <td>✓</td>
    </tr>
  </tbody>
</table>





## 基础版 {#basic}

- 支持单副本部署的经济实惠选项。
- 适用于数据量较小、对可靠性无严格要求的部门级应用场景。

:::note
基础版服务采用固定规模,不支持自动或手动扩缩容。
如需扩缩容能力,可升级至扩展版或企业版。
:::


## Scale 层级 {#scale}

专为需要增强 SLA（2 个及以上副本部署）、可扩展性和高级安全性的工作负载而设计。

- 支持以下功能：
  - [私有网络支持](/cloud/security/connectivity/private-networking)。
  - [计算-计算分离](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活扩展](/manage/scaling)选项（纵向扩展/缩减、横向扩展/缩减）。
  - [可配置备份](/cloud/manage/backups/configurable-backups)


## 企业版 {#enterprise}

面向具有严格安全性和合规性要求的大规模关键任务部署。

- 包含扩展版的所有功能，**另外还有**
- 灵活扩展:标准配置(`1:4 vCPU:内存比`)以及 `HighMemory(1:8 比率)` 和 `HighCPU(1:2 比率)` 自定义配置。
- 提供最高级别的性能和可靠性保障。
- 支持企业级安全:
  - 单点登录(SSO)
  - 增强加密:适用于 AWS 和 GCP 服务。服务默认使用我们的密钥进行加密,可以轮换为客户的密钥以启用客户管理的加密密钥(CMEK)。
- 允许计划升级:您可以选择一周中的某天/时间窗口进行升级,包括数据库和云版本。
- 提供 [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) 和 PCI 合规性。
- 将备份导出到用户账户。

:::note
所有三个层级的单副本服务大小均为固定值(`8 GiB`、`12 GiB`)
:::


## 升级到不同的服务层级 {#upgrading-to-a-different-tier}

您可以随时从 Basic 升级到 Scale,或从 Scale 升级到 Enterprise。降级服务层级需要先禁用高级功能。

---

如果您对服务类型有任何疑问,请参阅[定价页面](https://clickhouse.com/pricing)或联系 support@clickhouse.com。
