---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'AI 聊天'
title: '在 ClickHouse Cloud 中使用 AI 聊天'
pagination_prev: null
pagination_next: null
description: '在 ClickHouse Cloud 控制台中启用和使用 AI 聊天功能的指南'
keywords: ['AI', 'ClickHouse Cloud', 'Chat', 'SQL Console', 'Agent', 'Docs AI']
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


# 在 ClickHouse Cloud 中使用 AI Chat

> 本指南介绍如何在 ClickHouse Cloud 控制台中启用并使用 AI Chat 功能。

<VerticalStepper headerLevel="h2">


## 前提条件 {#prerequisites}

1. 您必须具备访问已启用 AI 功能的 ClickHouse Cloud 组织的权限（如果尚未开通，请联系您所在组织的管理员或支持团队）。



## 打开 AI Chat 面板 {#open-panel}

1. 进入某个 ClickHouse Cloud 服务。
2. 在左侧边栏中，点击带有 “Ask AI” 标签的火花图标。
3. （快捷键）在 <kbd>macOS</kbd> 上按 <kbd>⌘</kbd> + <kbd>'</kbd>，或在 <kbd>Linux/Windows</kbd> 上按 <kbd>Ctrl</kbd> + <kbd>'</kbd> 以打开或关闭面板。

<Image img={img_open} alt="打开 AI Chat 弹出面板" size="md"/>



## 接受数据使用授权（首次运行） {#consent}

1. 首次使用时，会弹出一个同意对话框，说明数据处理方式以及第三方 LLM 子处理方。
2. 请阅读并接受后继续。如选择拒绝，面板将不会打开。

<Image img={img_consent} alt="同意对话框" size="md"/>



## 选择聊天模式 {#modes}

AI Chat 当前支持：

- **Agent**：基于 schema 和元数据的多步推理（服务必须处于激活状态）。
- **Docs AI (Ask)**：基于官方 ClickHouse 文档和最佳实践参考的针对性问答。

在弹出面板左下角使用模式选择器进行切换。

<Image img={img_modes} alt="模式选择" size="sm"/>



## 撰写并发送消息 {#compose}

1. 输入你的问题（例如：“创建一个物化视图，用于按用户聚合每日事件”）。  
2. 按下 <kbd>Enter</kbd> 键发送（使用 <kbd>Shift</kbd> + <kbd>Enter</kbd> 键换行）。  
3. 在模型处理过程中，你可以点击“Stop”来中断。



## 了解 Agent 的思考步骤 {#thinking-steps}

在 Agent 模式下，你可能会看到可展开的中间“思考”或规划步骤。这些步骤可以帮助你了解助手是如何生成回答的。你可以根据需要将它们折叠或展开。

<Image img={img_thinking} alt="思考步骤" size="md"/>



## 开始新的对话 {#new-chats}

点击 “New Chat” 按钮以清除现有上下文并开始新的会话。



## 查看聊天历史记录 {#history}

1. 下方区域会列出您最近的聊天记录。
2. 选择一条之前的会话以加载其消息。
3. 使用垃圾桶图标删除会话。

<Image img={img_history} alt="聊天历史列表" size="md"/>



## 使用生成的 SQL {#sql-actions}

当助手返回 SQL 时：

- 检查其是否正确。
- 点击“Open in editor”，将查询加载到新的 SQL 标签页中。
- 在 Console 中修改并执行。

<Image img={img_result_actions} alt="结果操作" size="md"/>

<Image img={img_new_tab} alt="在编辑器中打开生成的查询" size="md"/>



## 停止或中断回复 {#interrupt}

如果回复耗时过长或开始偏离预期：

1. 点击“停止”按钮（在生成过程中可见）。
2. 消息会被标记为已中断；你可以调整提示后重新发送。



## 键盘快捷键 {#shortcuts}

| 操作         | 快捷键               |
| ------------ | -------------------- |
| 打开 AI 对话 | `⌘ + '` / `Ctrl + '` |
| 发送消息     | `Enter`              |
| 换行         | `Shift + Enter`      |

</VerticalStepper>
