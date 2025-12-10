---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'AI チャット'
title: 'ClickHouse Cloud で AI Chat を利用する'
pagination_prev: null
pagination_next: null
description: 'ClickHouse Cloud コンソールで AI Chat 機能を有効化して利用するためのガイド'
keywords: ['AI', 'ClickHouse Cloud', 'チャット', 'SQL コンソール', 'エージェント', 'Docs AI']
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

# ClickHouse Cloud で AI チャットを使用する {#using-ai-chat-in-clickhouse-cloud}

> このガイドでは、ClickHouse Cloud コンソールで AI チャット機能を有効にして利用する方法を説明します。

<VerticalStepper headerLevel="h2">

## 前提条件 {#prerequisites}

1. AI 機能が有効になっている ClickHouse Cloud の組織へのアクセス権が必要です（利用できない場合は、組織管理者またはサポートに連絡してください）。

## AI Chat パネルを開く {#open-panel}

1. ClickHouse Cloud サービスにアクセスします。
2. 左のサイドバーで、「Ask AI」とラベル付けされた星形のアイコンをクリックします。
3. （ショートカット）<kbd>⌘</kbd> + <kbd>'</kbd>（macOS）または <kbd>Ctrl</kbd> + <kbd>'</kbd>（Linux/Windows）を押して、パネルの表示を切り替えます。

<Image img={img_open} alt="AI Chat フライアウトを開く" size="md"/>

## 初回利用時のデータ利用に関する同意 {#consent}

1. 初回利用時に、データの利用方法とサードパーティ LLM サブプロセッサーについて説明する同意ダイアログが表示されます。
2. 内容を確認して同意すると先に進めます。拒否した場合、パネルは表示されません。

<Image img={img_consent} alt="同意ダイアログ" size="md"/>

## チャットモードを選択する {#modes}

AI Chat では現在、次のモードをサポートしています:

- **Agent**: スキーマおよびメタデータに対するマルチステップ推論（サービスが起動している必要があります）。
- **Docs AI (Ask)**: 公式 ClickHouse ドキュメントおよびベストプラクティスリファレンスに基づいた、特化型の Q&amp;A。

フライアウトの左下にあるモードセレクターで切り替えます。

<Image img={img_modes} alt="モード選択" size="sm"/>

## メッセージを作成して送信する {#compose}

1. 質問を入力してください（例：「ユーザーごとの日次イベントを集計するマテリアライズドビューを作成して」）。  
2. <kbd>Enter</kbd> を押して送信します（改行する場合は <kbd>Shift</kbd> + <kbd>Enter</kbd> を押します）。  
3. モデルが処理を実行している間は、「Stop」ボタンをクリックして中断できます。

## 「Agent」の思考ステップを理解する {#thinking-steps}

Agent モードでは、展開可能な中間的な「思考」や計画のステップが表示されることがあります。これらは、アシスタントがどのように回答を生成しているかを可視化するためのものです。必要に応じて折りたたんだり展開したりしてください。

<Image img={img_thinking} alt="思考ステップ" size="md"/>

## 新しいチャットを開始する {#new-chats}

現在のコンテキストをクリアして新しいセッションを開始するには、「New Chat」ボタンをクリックします。

## チャット履歴の表示 {#history}

1. 画面下部のセクションに、最近のチャットが一覧表示されます。
2. 過去のチャットを選択すると、そのメッセージが読み込まれます。
3. ゴミ箱アイコンをクリックして会話を削除します。

<Image img={img_history} alt="チャット履歴リスト" size="md"/>

## 生成された SQL の扱い方 {#sql-actions}

アシスタントが SQL を返したら、次の手順を実行します。

- 内容が正しいか確認します。
- 「Open in editor」をクリックして、クエリを新しい SQL タブで開きます。
- Console 内で必要に応じて修正し、実行します。

<Image img={img_result_actions} alt="結果に対する操作" size="md"/>

<Image img={img_new_tab} alt="生成されたクエリをエディタで開く" size="md"/>

## 応答を停止または中断する {#interrupt}

応答に時間がかかりすぎる場合や、意図から外れてしまった場合は、次の手順を実行します。

1. 「停止」ボタンをクリックします（処理中のみ表示されます）。
2. メッセージは中断されたものとしてマークされます。その後、プロンプトを調整して再送信できます。

## キーボードショートカット {#shortcuts}

| 操作         | ショートカット        |
| ------------ | -------------------- |
| AI チャットを開く | `⌘ + '` / `Ctrl + '` |
| メッセージを送信 | `Enter`              |
| 改行         | `Shift + Enter`      |

</VerticalStepper>
