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


# 在 ClickHouse Cloud 中使用 AI 对话

> 本指南说明如何在 ClickHouse Cloud 控制台中启用和使用 AI 对话功能。

<VerticalStepper headerLevel="h2">


## 前提条件 {#prerequisites}

1. 您必须有权访问已启用 AI 功能的 ClickHouse Cloud 组织(如不可用,请联系您的组织管理员或技术支持)。


## 打开 AI Chat 面板 {#open-panel}

1. 进入 ClickHouse Cloud 服务。
2. 在左侧边栏中,点击标有"Ask AI"的星形图标。
3. (快捷键) 按 <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) 或 <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows) 切换打开。

<Image img={img_open} alt='打开 AI Chat 弹出面板' size='md' />


## 接受数据使用协议(首次运行) {#consent}

1. 首次使用时,系统会显示一个协议对话框,说明数据处理方式和第三方 LLM 子处理器的相关信息。
2. 请仔细阅读并接受协议以继续。如果拒绝,面板将无法打开。

<Image img={img_consent} alt='协议对话框' size='md' />


## 选择聊天模式 {#modes}

AI Chat 目前支持以下模式:

- **Agent**:对 schema 和元数据进行多步推理(服务必须处于活跃状态)。
- **Docs AI (Ask)**:基于 ClickHouse 官方文档和最佳实践的专业问答。

使用弹出窗口左下角的模式选择器切换模式。

<Image img={img_modes} alt='模式选择' size='sm' />


## 编写并发送消息 {#compose}

1. 输入您的问题(例如"创建一个物化视图以按用户聚合每日事件")。
2. 按 <kbd>Enter</kbd> 键发送(使用 <kbd>Shift</kbd> + <kbd>Enter</kbd> 换行)。
3. 在模型处理过程中,您可以点击"停止"来中断。


## 理解"Agent"思考步骤 {#thinking-steps}

在 Agent 模式下,您可能会看到可展开的中间"思考"或规划步骤。这些步骤展示了助手如何形成答案的过程,提供了透明度。您可以根据需要折叠或展开这些步骤。

<Image img={img_thinking} alt='思考步骤' size='md' />


## 开始新对话 {#new-chats}

点击"新建对话"按钮可清除上下文并开始新会话。


## 查看聊天历史 {#history}

1. 下方区域列出了您最近的聊天记录。
2. 选择之前的聊天记录以加载其消息内容。
3. 使用垃圾桶图标删除对话。

<Image img={img_history} alt='聊天历史记录列表' size='md' />


## 使用生成的 SQL {#sql-actions}

当助手返回 SQL 时:

- 检查正确性。
- 点击"在编辑器中打开"将查询加载到新的 SQL 标签页。
- 在控制台中修改和执行。

<Image img={img_result_actions} alt='结果操作' size='md' />

<Image img={img_new_tab} alt='在编辑器中打开生成的查询' size='md' />


## 停止或中断响应 {#interrupt}

如果响应时间过长或偏离预期：

1. 点击"停止"按钮（处理过程中可见）。
2. 消息将被标记为已中断；您可以优化提示词后重新发送。


## 键盘快捷键 {#shortcuts}

| 操作         | 快捷键               |
| ------------ | -------------------- |
| 打开 AI 对话 | `⌘ + '` / `Ctrl + '` |
| 发送消息     | `Enter`              |
| 换行         | `Shift + Enter`      |

</VerticalStepper>
