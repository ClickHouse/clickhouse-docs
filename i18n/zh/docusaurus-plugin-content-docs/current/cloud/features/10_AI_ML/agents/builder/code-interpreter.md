---
sidebar_label: '代码解释器'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/builder/code-interpreter
title: '代码解释器'
description: 'ClickHouse agent中的沙盒代码执行'
keywords: ['AI', 'ClickHouse Cloud', 'agent', '代码解释器', '沙盒', 'python']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

代码解释器允许agent在托管沙箱中执行代码。可用于计算、数据转换、格式转换、绘图，以及其他任何更适合通过代码而非自然语言完成的任务。

## 启用此功能 \{#enable-it\}

在 Agent Builder 的“能力”部分启用 **代码解释器**，然后保存。agent会根据用户的请求和自身指令决定何时运行代码。

## 支持的语言 \{#supported-languages\}

该沙箱是一个 Unix 环境，提供两种通用运行时和若干 shell 实用工具：

* **Python 3** — 数据任务的默认选择。
* **Node.js (JavaScript)** — 当agent更倾向于使用 JS 完成任务时。
* **Bash** 和 **sh** — 用于串联命令和快速 I/O 的 shell 脚本。
* **AWK** 和 **sed** — 按行处理文本的工具。
* **bc** — 任意精度数学运算工具。

凡是涉及数据解析、转换或计算的任务，agent都应优先使用 Python。只有在确实适合用单行命令解决时，才使用 shell 工具。

## 文件 \{#files\}

用户可以将文件上传到对话中；代码解释器可在沙箱工作目录中访问这些文件。代码还可以生成输出文件 (如 CSV、图表、归档文件) ，并以可下载附件的形式显示在对话中。

## 沙箱隔离 \{#sandbox-isolation\}

每次执行都会在一个临时沙箱中运行，该沙箱没有网络访问权限，也没有持久化存储。不同 session 之间不共享状态——某次运行中的变量和文件不会延续到下一次运行，除非 agent 明确重新加载它们。

还会受到套餐对应的资源限制 (内存、每次运行的文件数、每月请求配额) 。错误和 stderr 会与 stdout 一并显示在对话中。

## 何时使用此功能 \{#when-to-use-it\}

* 解析用户上传的 CSV 或 JSON 文件。
* 计算汇总统计数据或运行快速模拟。
* 在不同格式之间转换 (Parquet、JSON、CSV) 。
* 根据查询结果生成图表。
* 任何确定性计算比 LLM 推理更合适的场景。

对于模型可以直接回答的任务，请避免使用此功能。代码执行会增加延迟并消耗配额。