---
sidebar_label: 'Skills'
sidebar_position: 9
slug: /cloud/features/ai-ml/agents/builder/skills
title: 'Skills'
description: 'ClickHouse Agents 向けの再利用可能な指示パック'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'Skills', 'SKILL.md']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

スキルは、エージェントが必要に応じて適用できる、再利用可能な指示パックです。各エージェントのシステムプロンプトに同じ指示を重複して書くのではなく、ブランドスタイルガイド、コードレビューチェックリスト、特定のワークフロー向けのランブックなど、複数のエージェントで繰り返し使う手順にはスキルを使用してください。

## スキルの構成 \{#anatomy-of-a-skill\}

スキルは、小さなフロントマターを含む Markdown ファイルです。

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

最も重要なフロントマターの項目:

* **`name`** - kebab-case の識別子。
* **`description`** - このスキルがどのような場合に関連するかをモデルが判断するために使う短い要約です。最も重要なフィールドとして扱ってください。具体的に記述してください。説明が曖昧だと、誤ったスキルが呼び出される原因になります。
* **`always-apply`** - `true` の場合、スキルは選択されるのではなく、毎回のターンに常に組み込まれます。必要な場合にのみ使用してください。always-apply を有効にしたスキルは、すべてのメッセージでコンテキストを消費します。
* **`user-invocable`** - `true` の場合 (デフォルト) 、そのスキルは手動選択用の `$` ポップオーバーに表示されます。

`SKILL.md` と関連アセットを含む `.zip` をアップロードすると、補助ファイル (リファレンスドキュメント、サンプルクエリ、小さなスクリプトなど) をスキルと一緒にまとめることができます。

## スキルを使う \{#use-a-skill\}

会話の中でエージェントがスキルを利用する方法は、次の 3 つです。

* **ユーザーによる呼び出し** - コンポーザーで `$` を押し、ポップオーバーからスキルを選択します。スキルの内容は次のターンに向けて事前に読み込まれます。
* **モデルによる自動選択** - スキルの `description` に基づき、エージェントが適用すべきタイミングを自動で判断します。
* **常に適用** - そのように設定されたスキルは、すべてのターンで事前に読み込まれます。

## スキル の管理 \{#manage-skills\}

Cloud コンソールの スキル パネルでは、スキル をその場で作成したり、`.md` または `.zip` ファイルをアップロードしたり、自分のユーザーで有効にする スキル を管理したりできます。自分が所有する スキル はデフォルトで有効になっています。1 つを無効にすると、削除しなくてもポップオーバーとモデルのカタログから外せます。

スキル は他のユーザーと共有できます ([共有とアクセス](/cloud/features/ai-ml/agents/sharing-and-access)を参照) 。

## スキル と instructions の違い \{#skills-vs-instructions\}

* **Agent instructions** は、エージェントとは何か、および全体としてどのように振る舞うかを定義します。そのエージェントでは常に有効です。
* **スキル** は状況に応じて適用され、関連する場合にのみ使用される、特定のワークフロー向けのものです。

同じ一連の手順が複数のエージェントで繰り返し登場する場合や、毎回ではなく特定のユーザーリクエストでのみトリガーしたい場合は、スキル の利用を検討してください。