---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI 聊天机器人 | Dot 是一款智能虚拟数据助手，能够回答业务数据问题、检索定义和相关数据资产，并且在 ClickHouse 的支持下，甚至还能协助进行数据建模。'
title: 'Dot'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot \{#dot\}

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) 是你的 **AI 数据分析师**。
它可以直接连接到 ClickHouse，让你能够使用自然语言询问数据相关问题、探索数据、验证假设，并解答「为什么」类的问题——而且这一切都可以直接在 Slack、Microsoft Teams、ChatGPT 或原生 Web UI 中完成。

## 前提条件 \{#pre-requisites\}

- 一个 ClickHouse 数据库，可以是自托管的，也可以托管在 [ClickHouse Cloud](https://clickhouse.com/cloud) 上  
- 一个 [Dot](https://www.getdot.ai/) 账户  
- 一个 [Hashboard](https://www.hashboard.com/) 账户和项目

## 将 Dot 连接到 ClickHouse \{#connecting-dot-to-clickhouse\}

<Image size="md" img={dot_01} alt="在 Dot（浅色模式）中配置 ClickHouse 连接" border />

<br/>

1. 在 Dot UI 中，进入 **Settings → Connections**。  
2. 点击 **Add new connection** 并选择 **ClickHouse**。  
3. 填写连接信息：  
   - **Host**：ClickHouse 服务器主机名或 ClickHouse Cloud 端点  
   - **Port**：`9440`（安全的原生接口）或 `9000`（默认 TCP）  
   - **Username / Password**：具有读取权限的用户  
   - **Database**：可选设置一个默认 schema  
4. 点击 **Connect**。

<Image img={dot_02} alt="连接 ClickHouse" size="sm"/>

Dot 使用 **query-pushdown**：由 ClickHouse 负责大规模的繁重计算，而 Dot 确保结果准确可信。

## 亮点 \{#highlights\}

Dot 通过对话让数据触手可及：

- **使用自然语言提问**：无需编写 SQL 即可获得答案。  
- **“为什么”分析**：通过连续追问来理解趋势和异常。  
- **融入你的日常工作环境**：Slack、Microsoft Teams、ChatGPT 或 Web 应用。  
- **结果可靠可追溯**：Dot 会根据你的模式（schema）和定义验证查询，最大限度减少错误。  
- **高扩展性**：基于查询下推（query pushdown）构建，将 Dot 的智能与 ClickHouse 的极速性能相结合。

## 安全与治理 \{#security\}

Dot 已达到企业级就绪标准：

- **权限与角色**：继承 ClickHouse 的用户访问控制  
- **行级安全**：在 ClickHouse 中配置后即可支持  
- **TLS / SSL**：在 ClickHouse Cloud 中默认启用；自托管需手动配置  
- **治理与校验**：训练/验证空间有助于减少模型幻觉  
- **合规性**：通过 SOC 2 Type I 认证

## 其他资源 \{#additional-resources\}

- Dot 网站：[https://www.getdot.ai/](https://www.getdot.ai/)  
- 文档：[https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Dot 应用：[https://app.getdot.ai/](https://app.getdot.ai/)  

现在你可以使用 **ClickHouse + Dot** 以对话方式分析你的数据——将 Dot 的 AI 助手与 ClickHouse 高速、可扩展的分析引擎相结合。