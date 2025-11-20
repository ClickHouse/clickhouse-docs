---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI 聊天机器人 | Dot 是一款智能虚拟数据助手，能够回答业务数据问题、检索术语定义和相关数据资产，并在 ClickHouse 的支持下为数据建模提供帮助。'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) 是你的 **AI 数据分析师**。
它可以直接连接到 ClickHouse，你可以用自然语言提出与数据相关的问题、探索数据、验证假设，并解答“为什么”的问题——且这一切都可以直接在 Slack、Microsoft Teams、ChatGPT 或原生 Web UI 中完成。



## 前置条件 {#pre-requisites}

- 一个 ClickHouse 数据库,可以是自托管或 [ClickHouse Cloud](https://clickhouse.com/cloud)
- 一个 [Dot](https://www.getdot.ai/) 账号
- 一个 [Hashboard](https://www.hashboard.com/) 账号和项目。


## 将 Dot 连接到 ClickHouse {#connecting-dot-to-clickhouse}

<Image
  size='md'
  img={dot_01}
  alt='在 Dot 中配置 ClickHouse 连接(浅色模式)'
  border
/>
<br />

1. 在 Dot 用户界面中,转到 **设置 → 连接**。
2. 点击 **添加新连接** 并选择 **ClickHouse**。
3. 提供您的连接详细信息:
   - **主机**: ClickHouse 服务器主机名或 ClickHouse Cloud 端点
   - **端口**: `9440`(安全原生接口)或 `9000`(默认 TCP)
   - **用户名 / 密码**: 具有读取权限的用户
   - **数据库**: 可选设置默认架构
4. 点击 **连接**。

<Image img={dot_02} alt='连接 ClickHouse' size='sm' />

Dot 使用 **查询下推**:ClickHouse 处理大规模的繁重数值计算,而 Dot 确保提供正确且可信的答案。


## 亮点 {#highlights}

Dot 通过对话让数据触手可及:

- **自然语言提问**: 无需编写 SQL 即可获得答案。
- **深入分析**: 通过追问了解趋势和异常。
- **随处可用**: 支持 Slack、Microsoft Teams、ChatGPT 或 Web 应用。
- **结果可靠**: Dot 会根据您的模式和定义验证查询,最大限度减少错误。
- **高度可扩展**: 基于查询下推构建,结合 Dot 的智能与 ClickHouse 的速度优势。


## 安全性与治理 {#security}

Dot 已为企业级应用做好准备：

- **权限与角色**：继承 ClickHouse 用户访问控制
- **行级安全**：在 ClickHouse 中配置后即可支持
- **TLS / SSL**：ClickHouse Cloud 默认启用；自托管部署需手动配置
- **治理与验证**：训练/验证空间有助于防止产生幻觉
- **合规性**：已通过 SOC 2 Type I 认证


## 其他资源 {#additional-resources}

- Dot 网站：[https://www.getdot.ai/](https://www.getdot.ai/)
- 文档：[https://docs.getdot.ai/](https://docs.getdot.ai/)
- Dot 应用：[https://app.getdot.ai/](https://app.getdot.ai/)

现在，您可以使用 **ClickHouse + Dot** 通过对话方式分析数据——结合 Dot 的 AI 助手与 ClickHouse 快速、可扩展的分析引擎。
