---
sidebar_label: '聊天'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/chat
title: '聊天'
description: 'ClickHouse Agents 中的对话、书签、分支、多对话和聊天共享'
keywords: ['AI', 'ClickHouse Cloud', '智能体', '聊天', '会话', '书签', '分支', '共享', '多对话']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import chat from '@site/static/images/cloud/agent-builder/chat/chat.png';
import conversation from '@site/static/images/cloud/agent-builder/chat/conversation.png';
import bookmark from '@site/static/images/cloud/agent-builder/chat/bookmark.png';
import fork from '@site/static/images/cloud/agent-builder/chat/fork.png';
import multiConversation from '@site/static/images/cloud/agent-builder/chat/multi-conversation.png';
import multiConversation2 from '@site/static/images/cloud/agent-builder/chat/multi-conversation-2.png';
import share from '@site/static/images/cloud/agent-builder/chat/share.png';
import shareModal from '@site/static/images/cloud/agent-builder/chat/share-modal.png';

<BetaBadge />

ClickHouse Agents 中的聊天界面支持对话、分支、并排比较和共享。

<Image img={chat} alt="ClickHouse Agent 聊天界面，显示左侧导航、Agent 标识标题栏和消息输入框" size="lg" />

## 对话 \{#conversations\}

点击左侧导航中的新建图标，开始新的对话。
在对话窗口左上角的 Agent 选择对话框中，选择要使用的 agent——默认选中的是 **ClickHouse Agent**。
现在，你可以在输入框中输入消息并点击发送。每个对话都会保存到侧边栏的历史记录中，之后可重新打开、重命名或删除。

<Image img={conversation} alt="聊天界面中，左侧导航中的新建图标已高亮显示；侧边栏显示 Chats 历史记录，其中保存了一个 Top 10 Tables Ranked 对话；输入框中输入了一个示例问题" size="lg" />

你可以直接编辑任意一条消息，agent 会从对话历史中的该位置重新生成回复。
你也可以只重新生成 agent 的上一条回复，而无需重新发送消息。

## 书签 \{#bookmarks\}

你可以为某条消息或整个对话添加书签，方便日后快速找回。书签仅自己可见，并且在对话重命名后仍会保留。

<Image img={bookmark} alt="聊天顶部栏，其中书签图标已高亮显示，并且“添加书签”工具提示可见" size="lg" />

## 创建分支 \{#forking\}

创建分支会基于某条特定消息新建一个分支对话。你可以用它探索另一条路径，而不影响原始对话线程。
可用的分支模式有三种：

* **仅可见消息** - 复制通往分支消息的直接路径。
* **包含相关分支** - 复制主路径以及现有的相关分支。
* **包含截至此处的全部内容** - 复制直到该分支消息为止的所有内容。

分支后的对话彼此独立，因此所做的更改不会同步回原始对话。

<Image img={fork} alt="显示三种分支模式图标、“从此处开始创建分支”和“记住”复选框，以及下方消息操作工具栏的分支选项对话框" size="lg" />

## 多对话 \{#multi-conversation\}

多对话会并排运行两个对话，并向两边发送相同的提示词。可用它比较不同模型的回复，或对不同的agent配置进行 A/B 测试。

点击聊天顶部栏中的 **+** 按钮，即可在当前对话旁边创建一个并行对话。

<Image img={multiConversation} alt="聊天顶部栏，已高亮显示“添加多对话”按钮，且输入框上方有一个 + ClickHouse Agent 指示器" size="lg" />

随后，两个对话会并排显示，并接收相同的提示词：

<Image img={multiConversation2} alt="多对话视图，其中两个 ClickHouse Agent 对话并排运行，二者都在执行相同的 run_select_query 工具调用" size="lg" />

## 共享聊天 \{#sharing-chats\}

为任意对话生成共享链接，以便发送给团队成员或保存备查。接收者看到的是只读视图，其中包括工件和可见分支。你可以随时在共享面板中撤销链接。

对现有消息的编辑会显示在共享视图中；在生成链接后添加的消息则不会显示。

要共享对话，请在侧边栏中打开其菜单并选择 **共享**：

<Image img={share} alt="侧边栏中的对话菜单，显示“共享”“重命名”“复制”“归档”和“删除”选项" size="lg" />

然后在共享对话框中点击 **创建链接**：

<Image img={shareModal} alt="聊天共享链接对话框，其中包含“创建链接”按钮，以及说明你的姓名和共享后添加的任何消息将保持私密的提示" size="md" />