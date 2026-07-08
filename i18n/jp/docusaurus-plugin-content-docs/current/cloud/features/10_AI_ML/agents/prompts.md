---
sidebar_label: 'プロンプト'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/prompts
title: 'プロンプト'
description: 'ClickHouse Agents 向けの保存済みプロンプトライブラリ'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'プロンプト', 'テンプレート']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import createPrompt from '@site/static/images/cloud/agent-builder/prompts/create-prompt.png';
import preview from '@site/static/images/cloud/agent-builder/prompts/preview.png';
import usePromptModal from '@site/static/images/cloud/agent-builder/prompts/use-prompt-modal.png';

<BetaBadge />

プロンプト ライブラリは、繰り返し入力する自然言語のプロンプトを保存して再利用できる場所です。チャット入力欄で使うスニペットのようなものと考えてください。複数の会話で同じ分析用の質問やフォーマット指示を何度も使う場合に役立ちます。

## プロンプトを作成する \{#create-a-prompt\}

左側のナビゲーションにある **プロンプト** アイコンからプロンプトパネルを開き、**+** ボタンをクリックして **Create Prompt** フォームを開きます。各フィールドに入力してください。

* **Prompt Name** (必須)  - ピッカーに表示される名前です。内容がわかる名前にしてください。たとえば、*&quot;WAU&quot;* よりも *&quot;Weekly active users by region&quot;* のほうが適切です。
* **Text** (必須)  - コンポーザーに挿入される実際のテキストです。
* **Special variables** - **Special variables** ボタンをクリックしてプレースホルダーを挿入するか、`{{name}}` 形式のマーカーを直接入力します。挿入前に、ピッカーで値の入力を求められます。
* **Category**、**Description**、**Command** (任意)  - ライブラリの整理、ピッカーに表示するプレビュー テキスト、クイック起動用のショートカットに使用します。

入力が完了したら、右下の **Create Prompt** をクリックします。

<Image img={createPrompt} alt="左側で + ボタンが強調表示されたプロンプトパネルと、右側で開かれた Create Prompt フォーム。Prompt Name、Text、Category、Special variables、Description、Command の各フィールドと Create Prompt ボタンが表示されている" size="lg" />

## プロンプトを使用する \{#use-a-prompt\}

プロンプトパネルで、プロンプトカードの **...** メニューを開き、**Preview** を選択します。

<Image img={preview} alt="プロンプト パネルでプロンプトが選択され、右側に詳細が表示され、Preview と Edit のオプションを含むコンテキストメニューが開いている" size="lg" />

プレビューには、プロンプトの本文に加えて、作成者と日付が表示されます。**Use Prompt** をクリックすると、本文がコンポーザーに挿入されます。プロンプトに変数がある場合は、先に入力してください。

<Image img={usePromptModal} alt="プロンプトのタイトル、作成者、日付、本文、Use Prompt ボタンが表示されたプロンプトのプレビューモーダル" size="md" />

## プロンプトを共有 \{#share-prompts\}

デフォルトでは、プロンプトは作成者本人だけに公開されます。所有者は、プロンプトの公開範囲を次のいずれかに変更できます。

* **特定のユーザーまたはグループ** - 指名されたユーザーであれば、そのプロンプトを見つけて使用できます。
* **組織全体** - ClickHouse Cloud 組織内の全員が、そのプロンプトを見つけて使用できます。

プロンプトの権限モデルはエージェントと共通です。ロールの完全な対応表と各ロールで実行できる操作については、[共有と
アクセス](/cloud/features/ai-ml/agents/sharing-and-access)を参照してください。

## プロンプト、スキル、指示の違い \{#prompts-vs-skills-vs-instructions\}

プロンプト、スキル、エージェント指示はいずれもモデルにテキストを追加しますが、何によってトリガーされるか、またどの程度持続するかが異なります。

* **プロンプト** - 自分でコンポーザーに入力するテキストで、ターンごとに編集します。
* **[スキル](/cloud/features/ai-ml/agents/builder/skills)** - タスクとの関連性があるとエージェントが判断したときに、自動的に読み込まれる一連の指示です。
* **エージェント指示** - エージェントの永続的なシステムプロンプトで、すべての会話に適用されます。

言い回しを再利用しつつ、その都度文面は自分で調整したい場合は、プロンプトを使います。同じ種類のタスクに対して、毎回入力しなくてもエージェントに同じガイダンスを一貫して適用させたい場合は、スキルを使います。エージェントの存続期間を通じてその振る舞いを維持したい場合は、エージェント指示を使います。