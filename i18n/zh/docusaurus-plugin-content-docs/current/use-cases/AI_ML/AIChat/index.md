---
'slug': '/use-cases/AI_ML/AIChat'
'sidebar_label': 'AI 聊天'
'title': '在 ClickHouse Cloud 中使用 AI 聊天'
'pagination_prev': null
'pagination_next': null
'description': '在 ClickHouse Cloud 控制台中启用和使用 AI Chat 功能的指南'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'Chat'
- 'SQL Console'
- 'Agent'
- 'Docs AI'
'show_related_blogs': true
'sidebar_position': 2
'doc_type': 'guide'
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


# 在 ClickHouse Cloud 中使用 AI 聊天

> 本指南解释了如何在 ClickHouse Cloud 控制台中启用和使用 AI 聊天功能。

<VerticalStepper headerLevel="h2">

## 前提条件 {#prerequisites}

1. 你必须拥有访问启用了 AI 功能的 ClickHouse Cloud 组织的权限（如果不可用，请联系你的组织管理员或支持人员）。

## 打开 AI 聊天面板 {#open-panel}

1. 导航到一个 ClickHouse Cloud 服务。
2. 在左侧边栏中，点击标记为“Ask AI”的闪光图标。
3. （快捷方式）按 <kbd>⌘</kbd> + <kbd>'</kbd> （macOS）或 <kbd>Ctrl</kbd> + <kbd>'</kbd> （Linux/Windows）来切换打开。

<Image img={img_open} alt="打开 AI 聊天弹出框" size="md"/>

## 接受数据使用声明（首次使用） {#consent}

1. 初次使用时，系统会弹出一个同意对话框，描述数据处理和第三方 LLM 子处理器。
2. 审核并接受以继续。如果拒绝，面板将不会打开。

<Image img={img_consent} alt="同意对话框" size="md"/>

## 选择聊天模式 {#modes}

AI 聊天当前支持：

- **Agent**：基于架构 + 元数据的多步骤推理（服务必须处于活动状态）。
- **Docs AI（询问）**：基于官方 ClickHouse 文档和最佳实践参考的 Q&A。

使用弹出框左下角的模式选择器进行切换。

<Image img={img_modes} alt="模式选择" size="sm"/>

## 撰写并发送消息 {#compose}

1. 输入你的问题（例如：“创建一个物化视图以按用户聚合每日事件”）。  
2. 按 <kbd>Enter</kbd> 发送消息（使用 <kbd>Shift</kbd> + <kbd>Enter</kbd> 可插入换行）。  
3. 当模型正在处理时，你可以点击“停止”来中断。

## 理解 “Agent” 思考步骤 {#thinking-steps}

在 Agent 模式下，你可能会看到可展开的中间“思考”或计划步骤。这些步骤提供了助手形成答案的透明度。根据需要折叠或展开。

<Image img={img_thinking} alt="思考步骤" size="md"/>

## 开始新聊天 {#new-chats}

点击“新聊天”按钮以清除上下文并开始一个新会话。

## 查看聊天记录 {#history}

1. 下方部分列出了你最近的聊天记录。
2. 选择先前的聊天以加载其消息。
3. 使用垃圾桶图标删除对话。

<Image img={img_history} alt="聊天记录列表" size="md"/>

## 使用生成的 SQL {#sql-actions}

当助手返回 SQL 时：

- 检查其正确性。
- 点击“在编辑器中打开”将查询加载到新的 SQL 标签页中。
- 在控制台内修改并执行。

<Image img={img_result_actions} alt="结果操作" size="md"/>

<Image img={img_new_tab} alt="在编辑器中打开生成的查询" size="md"/>

## 停止或中断响应 {#interrupt}

如果响应时间过长或偏离主题：

1. 点击“停止”按钮（处理时可见）。
2. 该消息将标记为中断；你可以完善你的提示并重新发送。

## 键盘快捷键 {#shortcuts}

| 操作 | 快捷键 |
| ------ | -------- |
| 打开 AI 聊天 | `⌘ + '` / `Ctrl + '` |
| 发送消息 | `Enter` |
| 新行 | `Shift + Enter` |

</VerticalStepper>
