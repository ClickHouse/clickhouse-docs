---
slug: /use-cases/observability/clickstack/rbac
title: '基于角色的访问控制（RBAC）'
sidebar_label: '基于角色的访问控制'
toc_max_heading_level: 2
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中配置基于角色的访问控制，以管理团队对仪表板、已保存的搜索、数据源、告警等的权限。'
doc_type: 'guide'
keywords: ['clickstack', 'rbac', '角色', '权限', '访问控制', '安全']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import rbac_section from '@site/static/images/clickstack/rbac/rbac-section.png';
import add_role_modal from '@site/static/images/clickstack/rbac/add-role-modal.png';
import dashboard_fine_grained_example from '@site/static/images/clickstack/rbac/dashboard-fine-grained-example.png';
import security_policies from '@site/static/images/clickstack/rbac/security-policies.png';
import team_members from '@site/static/images/clickstack/rbac/team-members.png';
import edit_team_member from '@site/static/images/clickstack/rbac/edit-team-member.png';
import default_vs_fine_grained from '@site/static/images/clickstack/rbac/default-vs-fine-grained.png';
import condition_tip from '@site/static/images/clickstack/rbac/condition-tip.png';
import access_rules_tip from '@site/static/images/clickstack/rbac/access-rules-tip.png';
import dashboard_id_and_tag_example from '@site/static/images/clickstack/rbac/dashboard-id-and-tag-example.png';
import team_page_cloud from '@site/static/images/clickstack/rbac/team-page-cloud.png';
import team_page_clickstack from '@site/static/images/clickstack/rbac/team-page-clickstack.png';

ClickStack 包含基于角色的访问管理 (RBAC) ，因此您可以定义自定义角色，并为[仪表板](/use-cases/observability/clickstack/dashboards)、[已保存搜索](/use-cases/observability/clickstack/search)、数据源、[告警](/use-cases/observability/clickstack/alerts)、Webhook 和笔记本配置细粒度权限。权限分为两个层级：资源级访问 (针对每种资源类型可设置为无权限、读取或管理) ，以及可选的细粒度规则，用于按名称、标签或 ID 限制对单个资源的访问。ClickStack 预置了三个内置角色，您也可以创建自定义角色以满足团队需求。

:::note 仅适用于托管 ClickStack
RBAC 仅在托管 ClickStack 部署中可用。
:::

## 用户访问前提条件 \{#user-access-prerequisites\}

ClickStack 通过 ClickHouse Cloud 进行身份验证。在您为 ClickStack 分配角色之前，每位用户都必须满足以下条件：

1. **已受邀加入您的 ClickHouse Cloud 组织。** 组织管理员可通过 Cloud 控制台邀请用户。详情请参见[管理 Cloud 用户](/cloud/security/manage-cloud-users)。
2. **拥有该服务的 SQL Console 访问权限。** 前往服务的 **设置** → **SQL Console Access**，并设置相应的权限级别：

| Cloud SQL Console 访问权限          | ClickStack 访问权限                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **SQL Console Admin** (完全访问)    | 拥有 ClickStack 的完全访问权限。启用[告警](/use-cases/observability/clickstack/alerts)需要此权限。 |
| **SQL Console Read Only** (只读)  | 可查看可观测性数据并创建仪表板。                                                               |
| **无访问权限**                       | 无法访问 ClickStack。                                                               |

用户获得 Cloud 访问权限后，就会显示在 ClickStack 的 **Team Settings** 页面中，您可以在其中为其分配 ClickStack 角色。

<Tabs>
  <TabItem value="cloud" label="Cloud 用户和角色" default>
    <Image img={team_page_cloud} alt="ClickHouse Cloud 用户和角色页面" size="lg" />
  </TabItem>

  <TabItem value="clickstack" label="ClickStack Team Settings">
    <Image img={team_page_clickstack} alt="显示团队成员及其角色的 ClickStack Team Settings 页面" size="lg" />
  </TabItem>
</Tabs>

## 内置角色 \{#built-in-roles\}

ClickStack 包含三种系统角色。这些角色无法编辑或删除。默认情况下，Admin 角色会分配给团队创建者。

| 权限         | Admin | Member | ReadOnly |
| ---------- | :---: | :----: | :------: |
| 查看所有资源     |   ✓   |    ✓   |     ✓    |
| 管理仪表板      |   ✓   |    ✓   |          |
| 管理已保存的搜索   |   ✓   |    ✓   |          |
| 管理数据源      |   ✓   |    ✓   |          |
| 管理告警       |   ✓   |    ✓   |          |
| 管理 Webhook |   ✓   |    ✓   |          |
| 管理笔记本      |   ✓   |    ✓   |          |
| 更新团队设置     |   ✓   |    ✓   |          |
| 创建/删除团队    |   ✓   |        |          |
| 管理用户和邀请    |   ✓   |        |          |

## 为团队成员分配角色 \{#assigning-roles\}

**团队设置**页面会列出所有团队成员及其当前角色。要修改角色，请点击用户名旁边的 **编辑**，然后选择新角色。每个用户只能拥有一个角色。

### 新用户默认角色 \{#default-new-user-role\}

您可以在[安全策略](#security-policies)中为新用户设置默认角色。自动加入团队的新用户会自动分配为此角色。

## 创建自定义角色 \{#creating-a-role\}

<VerticalStepper headerLevel="h3">
  ### 前往 Team Settings \{#step-navigate\}

  打开 **Team Settings**，然后滚动到 **RBAC Roles**。

  <Image img={rbac_section} alt="RBAC 角色" size="lg" />

  ### 添加新角色 \{#step-add-role\}

  点击 **+ Add Role**。输入 **Role Name**，并可选择填写 **Description**。

  ### 配置权限并保存 \{#step-configure\}

  为该角色设置权限，然后点击 **Create Role**。

  <Image img={add_role_modal} alt="添加角色模态框" size="md" />
</VerticalStepper>

自定义角色会与系统角色一同显示在 **RBAC Roles** 部分，并提供 **Edit** 和 **Delete** 控件。

## 角色权限 \{#role-permissions\}

### 资源权限 \{#resource-permissions\}

每个角色对每种资源类型都有一个访问级别。共有三个级别：

| 访问级别      | 允许的操作                      |
| --------- | -------------------------- |
| **无访问权限** | 该角色完全看不到此类资源。              |
| **读取**    | 可以查看资源及其配置，但不能创建、编辑或删除。    |
| **管理**    | 拥有完全控制权限——可创建、编辑和删除该类型的资源。 |

您可以控制的资源类型包括：

* **[仪表板](/use-cases/observability/clickstack/dashboards)** — 已保存的仪表板布局和图表。
* **[已保存的搜索](/use-cases/observability/clickstack/search)** — 持久保存的日志/追踪/事件查询。
* **数据源** — 摄取源配置。
* **[告警](/use-cases/observability/clickstack/alerts)** — 告警规则及其通知设置。
* **Webhooks** — 出站通知目标 (例如 Slack、PagerDuty 和通用 HTTP 端点) ，用于接收[告警](/use-cases/observability/clickstack/alerts)发送的通知。这里指的不是 ClickStack API。
* **笔记本** — 用于协作调查的笔记本。

### 管理权限 \{#administrative-permissions\}

除资源权限外，每个角色还包含两项管理设置：

* **Users** (无权访问 · 有限访问) — 控制该角色是否可以查看团队成员及其角色。只有管理员才能邀请、移除或更新用户。
* **Team** (只读 · 管理) — 控制该角色是否可以查看或修改团队级设置，例如安全策略和 RBAC 配置。

### 细粒度访问规则 \{#fine-grained-access-rules\}

仪表板、已保存搜索、数据源和笔记本支持细粒度控制，可将访问权限限制到某个类别中的单个资源。当您需要将某个角色限制为仅访问特定资源，而不是授予其对整个资源类型的全部访问权限时，请使用这些控制。

#### 默认访问与细粒度控制 \{#access-control-modes\}

每种资源类型都有一种**访问管理模式**：

* **默认访问** — 对该类型的所有资源统一应用单一访问级别 (无权限、读取或管理) 。
* **细粒度控制** — 允许您定义基于条件匹配特定资源的访问规则。未匹配任何规则的资源默认无权限。

要切换模式，请在角色编辑器中点击展开某个资源类型旁的尖角箭头，然后切换**访问管理模式**。

<Image img={default_vs_fine_grained} alt="角色编辑器中的默认访问与细粒度控制模式" size="md" />

#### 配置访问规则 \{#configuring-access-rules\}

每条访问规则都由一个**条件**和一个**访问级别**组成。条件会根据资源属性来匹配资源：

<Image img={condition_tip} alt="条件提示：按名称或标签（显示在标题中）或按 ID（可在 URL 中找到）匹配资源" size="md" />

| 条件字段   | 运算符              | 匹配内容                                       | 示例                                                      |
| ------ | ---------------- | ------------------------------------------ | ------------------------------------------------------- |
| **名称** | `is`, `contains` | 资源的显示名称，例如仪表板标题。                           | 名称 `contains` `production` ——匹配标题中包含“production”的任意仪表板。 |
| **标签** | `is`, `contains` | 通过资源视图右上角的标签面板分配给资源的标签。仅适用于仪表板、已保存的搜索和笔记本。 | 标签 `is` `critical` ——匹配带有“critical”标签的资源。               |
| **ID** | `is`, `contains` | 资源标识符，可在打开资源时的 URL 栏中找到。                   | ID `is` `abc123` ——匹配某个特定的单一资源。                         |

下图同时显示了 URL 栏中高亮的仪表板 ID，以及标签面板 (右上角) 中可见的“TESTING”标签。

<Image img={dashboard_id_and_tag_example} alt="仪表板：URL 栏中显示资源 ID，右上角显示标签" size="lg" />

您可以为每种资源类型添加多条规则。每条规则都会独立检查，并按 OR 逻辑生效——只要资源匹配**任意**一条规则，即可访问。不匹配任何规则的资源将无法访问。

<Image img={access_rules_tip} alt="采用 OR 逻辑的访问规则提示" size="md" />

**示例**：如需为某个角色授予测试仪表板的只读访问权限，请展开“仪表板”，切换到“细粒度控制”，然后添加两条规则：

* **名称** `contains` `testing`，访问级别为 **Read**
* **标签** `is` `testing`，访问级别为 **Read**

匹配任意一条规则的仪表板都可访问。

<Image img={dashboard_fine_grained_example} alt="两条通过 OR 连接的细粒度访问规则：名称包含 testing 且访问级别为 Read，以及标签为 testing 且访问级别为 Read" size="md" />

## 安全策略 \{#security-policies\}

**团队设置**中的**安全策略**部分提供了额外的控制项。

**默认新用户角色**用于设置新加入团队的用户将被自动分配的角色。

**Generative AI** 可让你启用或禁用由 Anthropic 或 Amazon Bedrock 提供支持的 LLM 功能 (例如自然语言查询生成) 。禁用后，不会向 AI 提供商发送任何数据。

<Image img={security_policies} alt="安全策略" size="lg" />