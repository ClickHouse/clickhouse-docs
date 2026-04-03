---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', '聊天机器人', 'mysql', '集成', 'ui', '虚拟助手']
description: 'AI 聊天机器人 | Dot 是一款智能虚拟数据助手，能够回答业务数据问题、检索定义及相关数据资产，甚至还能协助进行数据建模，由 ClickHouse 驱动。'
title: 'Dot'
doc_type: '指南'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot \{#dot\}

<CommunityMaintainedBadge />

[Dot](https://www.getdot.ai/) 是您的 **AI 数据分析师**。
它可直接连接到 ClickHouse，因此您可以用自然语言提出数据问题、探索数据、验证假设，并回答“为什么”类问题——这些都可直接在 Slack、Microsoft Teams、ChatGPT 或原生 Web 界面中完成。

## 前提条件 \{#pre-requisites\}

* 一个 ClickHouse 数据库，可为自托管版本，或部署在 [ClickHouse Cloud](https://clickhouse.com/cloud) 中
* 一个 [Dot](https://www.getdot.ai/) 账户

## 将 Dot 连接到 ClickHouse \{#connecting-dot-to-clickhouse\}

<Image size="md" img={dot_01} alt="在 Dot 中配置 ClickHouse 连接（浅色模式）" border />

<br />

1. 在 Dot 界面中，进入 **Settings → Connections**。
2. 点击 **Add new connection**，然后选择 **ClickHouse**。
3. 填写连接信息：
   * **Host**：ClickHouse 服务端主机名或 ClickHouse Cloud 端点
   * **Port**：`8443` (ClickHouse Cloud HTTPS) 或 `8123` (自托管 HTTP)
   * **Username / Password**：具有读取权限的用户
   * **Database**：可选，用于设置默认 schema
4. 点击 **Connect**。

<Image img={dot_02} alt="连接 ClickHouse" size="sm" />

Dot 使用 **查询下推**：ClickHouse 负责大规模的密集计算，而 Dot 则确保结果正确且可信。

## 亮点 \{#highlights\}

Dot 通过对话让数据触手可及：

* **用自然语言提问**：无需编写 SQL，即可获得答案。
* **原因分析**：通过追问深入理解趋势和异常。
* **在你常用的工具中使用**：Slack、Microsoft Teams、ChatGPT 或 Web 应用。
* **可信结果**：Dot 会根据你的 schema 和定义验证查询，尽可能减少错误。
* **可扩展**：基于查询下推构建，将 Dot 的智能与 ClickHouse 的速度相结合。

## 安全性与治理 \{#security\}

Dot 已具备企业级就绪能力：

* **权限和角色**：继承 ClickHouse 用户访问控制
* **行级安全**：如果已在 ClickHouse 中配置，则支持该功能
* **TLS / SSL**：在 ClickHouse Cloud 中默认启用；自托管环境需手动配置
* **治理与验证**：训练/验证空间有助于降低幻觉风险
* **合规性**：已通过 SOC 2 Type I 认证

## 其他资源 \{#additional-resources\}

* Dot 网站：[https://www.getdot.ai/](https://www.getdot.ai/)
* 文档：[https://docs.getdot.ai/](https://docs.getdot.ai/)
* Dot 应用：[https://app.getdot.ai/](https://app.getdot.ai/)

现在，您可以使用 **ClickHouse + Dot** 以对话方式分析数据，将 Dot 的 AI 助手与 ClickHouse 快速且可扩展的分析引擎结合起来。