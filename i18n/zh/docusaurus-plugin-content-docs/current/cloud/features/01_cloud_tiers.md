---
sidebar_label: 'ClickHouse Cloud 层级'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud 层级'
description: 'ClickHouse Cloud 中可用的云服务层级'
keywords: ['云服务层级', '服务方案', '云定价层级', '云服务级别']
doc_type: 'reference'
---



# ClickHouse Cloud 服务层级

ClickHouse Cloud 提供多个不同的服务层级。
服务层级可以分配给组织内的任意层级，因此，一个组织内的所有服务都属于同一服务层级。
本页将讨论针对您的特定使用场景，哪些服务层级最为合适。

**云服务层级概览：**



<table>
  <thead>
    <tr>
      <th />

      <th>[基础](#basic)</th>
      <th>[扩展（推荐）](#scale)</th>
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
      <td>✓ 每个服务最大 1 TB</td>
      <td>✓ 不限</td>
      <td>✓ 不限</td>
    </tr>

    <tr>
      <td>内存</td>
      <td>✓ 总内存 8–12 GiB</td>
      <td>✓ 可配置</td>
      <td>✓ 可配置</td>
    </tr>

    <tr>
      <td>可用性</td>
      <td>✓ 1 个可用区</td>
      <td>✓ 至少 2 个可用区</td>
      <td>✓ 至少 2 个可用区</td>
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
      <td>✓ 标准配置自动扩展，自定义配置手动扩展</td>
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
      <td>计算与计算解耦</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>将备份导出到您自己的云账户</td>

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
      <td>自定义硬件配置</td>

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
      <td>基于 S3 角色的访问控制</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>透明数据加密（TDE，支持 CMEK）</td>

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

- 成本效益高的选项，支持单副本部署。
- 适用于部门级、数据量较小且无需严格可靠性保证的用例。

:::note
基础版中的服务规模是固定的，不支持自动或手动扩缩容。
可以将服务升级到 Scale 或 Enterprise 层级以实现扩缩容。
:::



## Scale {#scale}

专为需要更高 SLA 保证（2 个及以上副本部署）、可伸缩性和高级安全性的工作负载而设计。

- 支持以下特性：
  - [私有网络支持](/cloud/security/connectivity/private-networking)。
  - [计算-计算分离（Compute-compute separation）](../reference/warehouses#what-is-compute-compute-separation)。
  - [灵活伸缩](/manage/scaling) 选项（纵向扩容/缩容、横向扩容/缩容）。
  - [可配置备份](/cloud/manage/backups/configurable-backups)。



## 企业版 {#enterprise}

面向大规模、关键业务部署，满足严苛的安全与合规要求。

- 包含 Scale 中的所有内容，**另外还提供：**
- 灵活伸缩：标准规格（`1:4 vCPU:memory ratio`），以及 `HighMemory (1:8 ratio)` 和 `HighCPU (1:2 ratio)` 自定义规格。
- 提供最高级别的性能与可靠性保障。
- 支持企业级安全：
  - 单点登录（SSO）
  - 增强加密：适用于 AWS 和 GCP 服务。服务默认使用我们的密钥进行加密，并可切换为用户自己的密钥，从而启用客户管理的加密密钥（CMEK）。
- 支持计划内升级：您可以为数据库和云版本升级选择一周中的特定日期和时间窗口。  
- 符合 [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) 和 PCI 合规要求。
- 支持将备份导出到用户自己的账户。

:::note 
在所有三个层级中，单副本服务均被设计为固定规格（`8 GiB`、`12 GiB`）
:::



## 升级到不同的层级 {#upgrading-to-a-different-tier}

您可以随时从 Basic 升级到 Scale，或从 Scale 升级到 Enterprise。降级层级则需要先停用高级功能。

---

如果您对服务类型有任何疑问，请参阅[定价页面](https://clickhouse.com/pricing)或联系 support@clickhouse.com。
