---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'AI', '聊天机器人', 'mysql', '集成', '用户界面', '虚拟助手']
description: 'AI Chatbot | Dot 是一款智能虚拟数据助手，能够解答业务数据相关问题、检索定义和相关数据资产，并在 ClickHouse 的支持下协助进行数据建模。'
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
它可以直接连接到 ClickHouse，你可以用自然语言就数据提出问题、探索数据、检验假设并回答“为什么”的问题——这一切都可以直接在 Slack、Microsoft Teams、ChatGPT 或自带的 Web UI 中完成。



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

1. 在 Dot 用户界面中,转到**设置 → 连接**。
2. 点击**添加新连接**并选择 **ClickHouse**。
3. 提供您的连接详细信息:
   - **主机**: ClickHouse 服务器主机名或 ClickHouse Cloud 端点
   - **端口**: `9440`(安全原生接口)或 `9000`(默认 TCP)
   - **用户名 / 密码**: 具有读取权限的用户
   - **数据库**: 可选设置默认 schema
4. 点击**连接**。

<Image img={dot_02} alt='连接 ClickHouse' size='sm' />

Dot 使用**查询下推**机制:ClickHouse 负责大规模的密集计算处理,而 Dot 确保提供准确可信的结果。


## 亮点 {#highlights}

Dot 通过对话让数据触手可及：

- **自然语言提问**：无需编写 SQL 即可获得答案。
- **原因分析**：通过追问深入理解趋势和异常。
- **随处可用**：支持 Slack、Microsoft Teams、ChatGPT 或 Web 应用。
- **结果可信**：Dot 会根据您的架构和定义验证查询，最大限度减少错误。
- **可扩展**：基于查询下推构建，将 Dot 的智能与 ClickHouse 的速度完美结合。


## 安全性与治理 {#security}

Dot 已为企业级应用做好准备:

- **权限与角色**: 继承 ClickHouse 用户访问控制
- **行级安全**: 如在 ClickHouse 中配置则支持
- **TLS / SSL**: ClickHouse Cloud 默认启用;自托管部署需手动配置
- **治理与验证**: 训练/验证空间有助于防止产生幻觉
- **合规性**: 已通过 SOC 2 Type I 认证


## 其他资源 {#additional-resources}

- Dot 网站：[https://www.getdot.ai/](https://www.getdot.ai/)
- 文档：[https://docs.getdot.ai/](https://docs.getdot.ai/)
- Dot 应用：[https://app.getdot.ai/](https://app.getdot.ai/)

现在您可以使用 **ClickHouse + Dot** 通过对话方式分析数据——结合 Dot 的 AI 助手与 ClickHouse 快速、可扩展的分析引擎。
