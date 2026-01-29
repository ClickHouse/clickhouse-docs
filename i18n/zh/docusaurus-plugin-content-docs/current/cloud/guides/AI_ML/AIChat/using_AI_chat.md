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


# 在 ClickHouse Cloud 中使用 Ask AI 聊天 \{#use-ask-ai-chat-in-clickhouse-cloud\}

> 本指南介绍如何在 ClickHouse Cloud 控制台中启用和使用 AI Chat 功能。

<VerticalStepper headerLevel="h2">

## 前提条件 \{#prerequisites\}

1. 您必须有权访问已启用 AI 功能的 ClickHouse Cloud 组织（如果没有，请联系组织管理员或支持）。

## 打开 AI Chat 面板 \{#open-panel\}

1. 进入某个 ClickHouse Cloud 服务。
2. 在左侧边栏中，点击标有 “Ask AI” 的闪光图标。
3. （快捷键）按 <kbd>⌘</kbd> + <kbd>'</kbd>（macOS）或 <kbd>Ctrl</kbd> + <kbd>'</kbd>（Linux/Windows）来切换打开/关闭。

<Image img={img_open} alt="打开 AI Chat 抽屉" size="md"/>

## 接受数据使用同意（首次运行） \{#consent\}

1. 第一次使用时，会弹出一个同意对话框，说明数据处理方式以及第三方 LLM 子处理器。
2. 阅读并接受后即可继续。如果拒绝，面板将不会打开。

<Image img={img_consent} alt="同意对话框" size="md"/>

## 选择聊天模式 \{#modes\}

AI Chat 当前支持：

- **Agent**：针对 schema 和元数据进行多步推理（服务必须处于唤醒状态）。
- **Docs AI (Ask)**：基于官方 ClickHouse 文档和最佳实践参考进行聚焦问答。

使用抽屉左下角的模式选择器进行切换。

<Image img={img_modes} alt="模式选择" size="sm"/>

## 撰写并发送消息 \{#compose\}

1. 输入您的问题（例如 “Create a materialized view to aggregate daily events by user”）。  
2. 按 <kbd>Enter</kbd> 发送（使用 <kbd>Shift</kbd> + <kbd>Enter</kbd> 换行）。  
3. 在模型处理期间，您可以点击 “Stop” 中断生成。

## 理解 “Agent” 的思考步骤 \{#thinking-steps\}

在 Agent 模式下，您可能会看到可展开的中间“思考”或规划步骤。这些步骤用于展示助手如何形成答案。可根据需要展开或折叠。

<Image img={img_thinking} alt="思考步骤" size="md"/>

## 开始新的聊天 \{#new-chats\}

点击 “New Chat” 按钮以清除上下文并开始新的会话。

## 查看聊天历史 \{#history\}

1. 底部区域会列出您最近的聊天记录。
2. 选择某个历史聊天即可加载其消息。
3. 使用垃圾桶图标删除会话。

<Image img={img_history} alt="聊天历史列表" size="md"/>

## 使用生成的 SQL \{#sql-actions\}

当助手返回 SQL 时：

- 检查其正确性。
- 点击 “Open in editor” 将查询加载到新的 SQL 选项卡中。
- 在控制台中修改并执行。

<Image img={img_result_actions} alt="结果操作" size="md"/>

<Image img={img_new_tab} alt="在编辑器中打开生成的查询" size="md"/>

## 停止或中断响应 \{#interrupt\}

如果响应耗时过长或偏离主题：

1. 点击 “Stop” 按钮（仅在处理时可见）。
2. 该消息会被标记为已中断；您可以优化提示后重新发送。

## 键盘快捷键 \{#shortcuts\}

| 操作 | 快捷键 |
| ------ | -------- |
| 打开 AI Chat | `⌘ + '` / `Ctrl + '` |
| 发送消息 | `Enter` |
| 新建行 | `Shift + Enter` |

</VerticalStepper>