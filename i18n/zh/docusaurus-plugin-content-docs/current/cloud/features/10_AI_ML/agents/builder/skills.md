---
sidebar_label: '技能'
sidebar_position: 9
slug: /cloud/features/ai-ml/agents/builder/skills
title: '技能'
description: '适用于 ClickHouse agent 的可复用指令包'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'skills', 'SKILL.md']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

技能是 agent 可按需调用的可复用指令包。对于会在多个 agent 之间反复使用的内容——例如品牌风格指南、代码审查清单、特定工作流的运行手册——应使用技能，而不是将这些说明重复写入每个 agent 的系统提示。

## 技能的构成 \{#anatomy-of-a-skill\}

技能是一个 Markdown 文件，带有一个简短的 frontmatter 头信息：

```markdown
---
name: revenue-report
description: Generates the weekly revenue report using our standard segments
always-apply: false
user-invocable: true
---

When asked to generate a revenue report:
1. Filter to the requested period.
2. Apply the standard MRR formula:
     SUM(CASE
       WHEN billing_cycle = 'monthly' THEN amount
       WHEN billing_cycle = 'yearly'  THEN amount / 12
       ELSE 0
     END)
3. Break down by segment: Enterprise, Mid-Market, SMB.
4. Render the result as a Markdown table.
```

最重要的 frontmatter 配置项：

* **`name`** — kebab-case 标识符。
* **`description`** — 模型用来判断何时应使用该技能的简短说明。将其视为最重要的字段。请务必写得具体；描述含糊会导致调用错误的技能。
* **`always-apply`** — 当为 `true` 时，该技能会在每一轮对话中预先注入，而不是按需选择。请谨慎使用；always-apply 技能会在每条消息中消耗上下文。
* **`user-invocable`** — 当为 `true` (默认值) 时，该技能会显示在 `$` 弹出菜单中，供手动选择。

你可以将支持文件与该技能一并打包——如参考文档、样本查询和小型脚本——方法是上传一个包含 `SKILL.md` 及其资源文件的 `.zip`。

## 使用技能 \{#use-a-skill\}

agent 在对话中使用技能有三种方式：

* **用户调用** — 在输入框中按 `$`，然后从弹出菜单中选择相应技能。该技能的内容会为下一轮对话预先注入。
* **模型自动选择** — agent 会根据技能的 `description` 自行决定何时应用该技能。
* **始终应用** — 对于这样配置的技能，每一轮对话都会预先注入。

## 管理技能 \{#manage-skills\}

Cloud Console 中的 Skills 面板可让您直接创建技能、上传 `.md` 或 `.zip` 文件，并管理哪些技能对您的账户处于启用状态。您拥有的技能默认会启用；停用某项技能后，它会从弹出菜单和模型目录中移除，但不会被删除。

技能可以与其他用户共享 (请参见[共享与访问](/cloud/features/ai-ml/agents/sharing-and-access)) 。

## 技能与说明的区别 \{#skills-vs-instructions\}

* **agent 说明**定义了 agent 的角色及其整体行为方式。对该 agent 始终生效。
* **技能**是按场景使用的——仅在相关时应用，并限定于特定工作流。

当同一组分步说明反复出现在多个 agent 中时，或者当你希望它只在特定用户请求下被触发、而不是每一轮对话都生效时，就应使用技能。