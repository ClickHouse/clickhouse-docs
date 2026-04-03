---
slug: /use-cases/observability/clickstack/notebooks
title: 'ClickStack の AI ノートブック'
sidebar_label: 'AI ノートブック'
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けの AI 活用型調査ノートブック'
doc_type: 'guide'
keywords: ['clickstack', 'AI ノートブック', '調査', 'オブザーバビリティ', 'HyperDX']
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import notebook_hero from '@site/static/images/use-cases/observability/hyperdx-notebook-hero.png';
import notebook_list from '@site/static/images/use-cases/observability/hyperdx-notebook-list.png';
import notebook_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-tiles.png';
import notebook_branching from '@site/static/images/use-cases/observability/hyperdx-notebook-branching.png';
import notebook_branch_modal from '@site/static/images/use-cases/observability/hyperdx-notebook-branch-modal.png';
import notebook_manual_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-manual-tiles.png';
import notebook_agent_context from '@site/static/images/use-cases/observability/hyperdx-notebook-agent-context.png';
import notebook_ai_consent from '@site/static/images/use-cases/observability/hyperdx-notebook-ai-consent.png';

<PrivatePreviewBadge />

AI ノートブック は、AI エージェントと手動分析を組み合わせた、ClickStack の対話型調査ツールです。自然な言葉で問題を説明すると、AI エージェントが代わりにログ、トレース、メトリクスをクエリし、関連するデータ、チャート、要約を一連のタイルとして提示します。AI が生成した出力に加えて、独自のタイル (チャート、テーブル、検索、Markdown ノート) を追加して、調査の完全な記録を作成することもできます。

<Image img={notebook_hero} alt="Visa のキャッシュフル障害を調査している AI Notebook" size="lg" />

:::note Managed ClickStack のみ
AI ノートブック は、Managed ClickStack のデプロイメントでのみ利用できます。
:::

## セットアップ \{#setup\}

AI ノートブック は現在、ClickHouse Cloud で非公開プレビューとして提供されています。AI モデルとプロバイダーは、プラットフォームによって自動的に自動管理されます。

AI ノートブック を使用する前に、次の点を確認してください。

1. **Generative AI の有効化** — チーム管理者が Generative AI の同意トグルを有効にする必要があります。詳細は [Generative AI の有効化](#enabling-generative-ai) を参照してください。
2. **Notebook へのアクセス** — お使いのロールに、Notebooks への読み取り/書き込み権限が必要です。

有効にすると、適切なロールを持つすべてのユーザーの左側のサイドバーに **Notebooks** エントリが表示されます。

## 生成AIを有効にする \{#enabling-generative-ai\}

ノートブック (およびその他のAI機能) を使用するには、事前にチーム管理者が Generative AI の同意トグルを有効にする必要があります。

1. **Team Settings &gt; Security Policies** に移動します。
2. **Generative AI** をオンにします。
3. 同意ダイアログを確認し、同意します。

<Image img={notebook_ai_consent} alt="Team Settings の Generative AI トグル" size="lg" />

## AIノートブックの使用 \{#using-notebooks\}

### ノートブックの作成 \{#creating-a-notebook\}

1. 左側のサイドバーから **Notebooks** を選択します。
2. **New Private Notebook** (自分にのみ表示される) または **New Shared Notebook** (チームに表示される) をクリックします。

ノートブック一覧ページには、アクセス可能なすべてのノートブックが表示されます。名前やタグで絞り込んだり、**My Notebooks** と **All Notebooks** を切り替えたりできます。

<Image img={notebook_list} alt="ノートブック一覧ページ" size="lg" />

### AI 調査の実行 \{#running-investigation\}

ノートブックの下部で、調査したい内容を説明するプロンプトを入力します。たとえば、*&quot;Why did error rates spike in the checkout service over the last hour?&quot;* のように入力します。

**Send** を押します (または Enter キーを押します) 。すると、AI エージェントは次の処理を行います。

1. 利用可能なデータソースを確認します。
2. ログ、トレース、メトリクスに対して検索クエリと集約クエリを実行します。
3. 思考プロセス、実行したクエリ、中間的なチャート、そして結論を含む最終サマリーを示す一連のタイルを生成します。

各ステップはノートブック内でタイルとして表示されます。**思考プロセス** タイルには各クエリの背後にある推論が表示され、**出力** タイルにはエージェントの結論と必要に応じてチャートが含まれます。通常の AI チャットとは異なり、ノートブックでは各ステップで AI がどのデータを使っているかを正確に確認できます。そのため、推論を検証したり、見落としている可能性のある有望な手がかりを見つけたり、調査を別の方向に導くために[分岐](#branching)したりできます。

調査の実行中は、**Stop** をクリックしてキャンセルできます。

<Image img={notebook_tiles} alt="AI が生成したタイルを含むノートブック" size="lg" />

### 調査を分岐する \{#branching\}

AI が調査を進める中で、途中のステップに興味深い内容が現れていても、エージェントは別の経路に進んでしまうことがあります。**分岐**を使うと、元の調査経路を保持したまま、その時点から別のプロンプトで再開できます。

分岐を作成するには、次の手順に従います。

1. 思考プロセスのタイルを展開し、**Restart from Here** をクリックします。
2. ダイアログで、調査を新しい方向に導くように修正したプロンプトを入力します。
3. **Interrupt &amp; Create Branch** をクリックします。AI はその時点から新しい調査の分岐を開始します。

<Image img={notebook_branch_modal} alt="新しい分岐を作成するダイアログ" size="md" />

1 つのタイルに複数の分岐がある場合は、タイルのヘッダーに左右の矢印ボタンと、分岐数を示すバッジ (例: **1/2**) が表示されます。矢印をクリックして分岐を切り替えます。

<Image img={notebook_branching} alt="タイル上の分岐ナビゲーション矢印と 1/2 バッジ" size="lg" />

### 手動タイルの追加 \{#manual-tiles\}

AI が生成したタイルに加えて、ノートブック下部のボタンを使って独自の分析ブロックを追加できます。

| ボタン          | ショートカット | 説明                                                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------------- |
| **Search**   | `S`     | 検索ページに相当する、ログ / トレースの検索ビューです。                                                         |
| **Chart**    | `L`     | [ダッシュボード](/use-cases/observability/clickstack/dashboards)と同じ可視化ビルダーを使用する時系列の折れ線グラフです。 |
| **Table**    | `T`     | 表形式の集計ビューです。                                                                          |
| **Markdown** | `M`     | メモ、仮説、結論を記述するための自由形式のテキストです。                                                          |

タイルを追加すると、インライン編集モードで開き、データソース、フィルター、集計を設定できます。これは[ダッシュボードの可視化](/use-cases/observability/clickstack/dashboards#creating-visualizations)を作成する際と同じインターフェースです。タイルを確定するには **Save** をクリックします。

手動タイルは、現在のブランチで最後に表示されているタイルの下に追加されます。タイルの下端をドラッグすると、縦方向にサイズを変更できます。

<Image img={notebook_manual_tiles} alt="ノートブック下部にある手動タイルのボタン" size="lg" />

:::note
AI による調査が現在実行中の場合、手動タイルを追加または編集すると、その調査はキャンセルされます。続行する前に確認ダイアログが表示されます。
:::

### 共有と整理 \{#sharing-organizing\}

* **Private vs. Shared** — ノートブックのヘッダーにあるロックアイコンを切り替えると、private (自分のみ) と shared (チームに公開) を切り替えられます。この設定を変更できるのは、ノートブックの作成者のみです。
* **Tags** — ノートブックにタグを追加すると、一覧ページで簡単に絞り込めます。
* **Naming** — ノートブックのタイトルをクリックして名前を変更します。無題のノートブックで調査を開始すると、AI が自動的に名前を提案します。

### カスタムエージェントコンテキスト \{#custom-agent-context\}

チーム管理者は、チーム内のすべての AI ノートブック調査で使用される追加コンテキストを設定できます。これは、システムアーキテクチャ、命名規則、既知の問題などの背景情報を AI に与えるのに役立ちます。

設定手順:

1. 左側のサイドバーで **Notebooks** に移動します。
2. **Agent Settings** を開きます (チーム管理者のみ利用可能) 。
3. カスタムコンテキスト (最大 50,000 文字) を入力し、保存します。

このコンテキストは、チーム全体のすべてのノートブック調査について、AI のシステムプロンプトに追加されます。

<Image img={notebook_agent_context} alt="カスタムコンテキスト用の Agent Settings パネル" size="lg" />