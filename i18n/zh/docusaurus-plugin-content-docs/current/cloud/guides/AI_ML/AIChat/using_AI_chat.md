---
slug: /use-cases/AI_ML/AIChat
sidebar_label: '在 ClickHouse Cloud 中使用 Ask AI Chat'
title: '在 ClickHouse Cloud 中使用 Ask AI Chat'
pagination_prev: null
pagination_next: null
description: '在 ClickHouse Cloud 控制台中启用和使用 AI Chat 功能的指南'
keywords: ['AI', 'ClickHouse Cloud', 'Chat', 'SQL 控制台', 'Agent', 'Docs AI']
show_related_blogs: true
sidebar_position: 2
doc_type: 'guide'
---

import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img_open from '@site/static/images/use-cases/AI_ML/AIChat/1_open_chat.png';
import img_consent from '@site/static/images/use-cases/AI_ML/AIChat/2_consent.png';
import img_modes from '@site/static/images/use-cases/AI_ML/AIChat/3_modes.png';
import img_thinking from '@site/static/images/use-cases/AI_ML/AIChat/4_thinking.png';
import img_history from '@site/static/images/use-cases/AI_ML/AIChat/5_history.png';
import img_result_actions from '@site/static/images/use-cases/AI_ML/AIChat/6_result_actions.png';
import img_new_tab from '@site/static/images/use-cases/AI_ML/AIChat/7_open_in_editor.png';

# 在 ClickHouse Cloud 中使用 Ask AI 聊天功能 \{#use-ask-ai-chat-in-clickhouse-cloud\}

> 本指南说明如何在 ClickHouse Cloud 控制台中启用并使用 AI Chat 功能。

<VerticalStepper headerLevel="h2">

## 前提条件 \\{#prerequisites\\}

1. 你必须能访问已启用 AI 功能的 ClickHouse Cloud 组织（如果不可用，请联系你的组织管理员或支持人员）。

## 打开 AI Chat 面板 \\{#open-panel\\}

1. 进入某个 ClickHouse Cloud 服务。
2. 在左侧边栏中点击标有 “Ask AI” 的闪光图标。
3. （快捷键）按下 <kbd>⌘</kbd> + <kbd>'</kbd>（macOS）或 <kbd>Ctrl</kbd> + <kbd>'</kbd>（Linux/Windows）以打开或关闭面板。

<Image img={img_open} alt="打开 AI Chat 抽屉" size="md"/>

## 接受数据使用同意（首次运行） \\{#consent\\}

1. 第一次使用时，会弹出一个同意对话框，说明数据处理方式以及第三方 LLM 子处理器。
2. 查看并接受以继续。如果你拒绝，该面板将不会打开。

<Image img={img_consent} alt="同意对话框" size="md"/>

## 选择聊天模式 \\{#modes\\}

AI Chat 当前支持：

- **Agent**：基于 schema 与元数据的多步推理（服务必须处于运行状态）。
- **Docs AI (Ask)**：基于官方 ClickHouse 文档和最佳实践参考的聚焦问答。

在抽屉左下角使用模式选择器进行切换。

<Image img={img_modes} alt="模式选择" size="sm"/>

## 编写并发送消息 \\{#compose\\}

1. 输入你的问题（例如 “Create a materialized view to aggregate daily events by user”）。  
2. 按下 <kbd>Enter</kbd> 发送（使用 <kbd>Shift</kbd> + <kbd>Enter</kbd> 换行）。  
3. 当模型正在处理时，你可以点击 “Stop” 以中断。

## 理解 “Agent” 思考步骤 \\{#thinking-steps\\}

在 Agent 模式下，你可能会看到可展开的中间“思考”或规划步骤。这些步骤用于透明展示助手如何形成答案。根据需要进行折叠或展开。

<Image img={img_thinking} alt="思考步骤" size="md"/>

## 开始新的聊天 \\{#new-chats\\}

点击 “New Chat” 按钮以清除上下文并开始一个新的会话。

## 查看聊天历史 \\{#history\\}

1. 下方区域会列出你最近的聊天。
2. 选择某个先前的聊天以加载其消息。
3. 使用垃圾桶图标删除某个会话。

<Image img={img_history} alt="聊天历史列表" size="md"/>

## 使用生成的 SQL \\{#sql-actions\\}

当助手返回 SQL 时：

- 检查其正确性。
- 点击 “Open in editor” 将该查询加载到一个新的 SQL 选项卡中。
- 在控制台中修改并执行。

<Image img={img_result_actions} alt="结果操作" size="md"/>

<Image img={img_new_tab} alt="在编辑器中打开生成的查询" size="md"/>

## 停止或中断响应 \\{#interrupt\\}

如果响应耗时过长或开始偏离主题：

1. 点击 “Stop” 按钮（处理时可见）。
2. 该消息会被标记为已中断；你可以调整提示内容后重新发送。

## 键盘快捷键 \\{#shortcuts\\}

| 操作 | 快捷键 |
| ------ | -------- |
| 打开 AI Chat | `⌘ + '` / `Ctrl + '` |
| 发送消息 | `Enter` |
| 换行 | `Shift + Enter` |

</VerticalStepper>