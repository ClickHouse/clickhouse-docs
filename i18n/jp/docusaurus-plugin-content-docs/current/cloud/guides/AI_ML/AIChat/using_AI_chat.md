---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'ClickHouse Cloud で Ask AI チャットを使用する'
title: 'ClickHouse Cloud で Ask AI チャットを使用する'
pagination_prev: null
pagination_next: null
description: 'ClickHouse Cloud コンソールで Ask AI チャット機能を有効化して利用するためのガイド'
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

# ClickHouse Cloud で Ask AI チャットを使う \{#use-ask-ai-chat-in-clickhouse-cloud\}

> このガイドでは、ClickHouse Cloud Console で AI Chat 機能を有効化して利用する方法を説明します。

<VerticalStepper headerLevel="h2">

## 前提条件 \{#prerequisites\}

1. AI 機能が有効になっている ClickHouse Cloud 組織へのアクセス権が必要です（利用できない場合は組織の管理者かサポートに連絡してください）。

## AI Chat パネルを開く \{#open-panel\}

1. 任意の ClickHouse Cloud サービスに移動します。
2. 左側のサイドバーで「Ask AI」と表示されたスパークルアイコンをクリックします。
3. （ショートカット）<kbd>⌘</kbd> + <kbd>'</kbd>（macOS）または <kbd>Ctrl</kbd> + <kbd>'</kbd>（Linux/Windows）を押して開閉を切り替えます。

<Image img={img_open} alt="AI Chat フライアウトを開く" size="md"/>

## データ利用に関する同意を行う（初回） \{#consent\}

1. 初回利用時には、データの取り扱いとサードパーティ LLM サブプロセッサについて説明する同意ダイアログが表示されます。
2. 内容を確認のうえ同意すると先に進めます。拒否した場合はパネルは開きません。

<Image img={img_consent} alt="同意ダイアログ" size="md"/>

## チャットモードを選択する \{#modes\}

AI Chat は現在、以下をサポートしています：

- **Agent**: スキーマおよびメタデータに対するマルチステップ推論（対象サービスが起動している必要があります）。
- **Docs AI (Ask)**: 公式 ClickHouse ドキュメントおよびベストプラクティスに基づいた Q&amp;A。

フライアウト左下のモードセレクターでモードを切り替えます。

<Image img={img_modes} alt="モード選択" size="sm"/>

## メッセージを作成して送信する \{#compose\}

1. 質問を入力します（例: 「ユーザーごとに日次イベントを集計する materialized view を作成して」）。  
2. <kbd>Enter</kbd> を押して送信します（改行する場合は <kbd>Shift</kbd> + <kbd>Enter</kbd>）。  
3. モデルが処理中は、「Stop」をクリックして中断できます。

## 「Agent」の思考ステップを理解する \{#thinking-steps\}

Agent モードでは、展開可能な中間の「思考」や計画ステップが表示される場合があります。これにより、アシスタントがどのように回答を組み立てているかを確認できます。必要に応じて展開・折りたたみを行ってください。

<Image img={img_thinking} alt="思考ステップ" size="md"/>

## 新しいチャットを開始する \{#new-chats\}

「New Chat」ボタンをクリックしてコンテキストをクリアし、新しいセッションを開始します。

## チャット履歴を表示する \{#history\}

1. 下部のセクションに最近のチャットが一覧表示されます。
2. 過去のチャットを選択すると、そのメッセージが読み込まれます。
3. ゴミ箱アイコンを使って会話を削除できます。

<Image img={img_history} alt="チャット履歴リスト" size="md"/>

## 生成された SQL を扱う \{#sql-actions\}

アシスタントが SQL を返した場合：

- 内容を確認し、正しさを検証します。
- 「Open in editor」をクリックして、そのクエリを新しい SQL タブに読み込みます。
- Console 内で修正し、実行します。

<Image img={img_result_actions} alt="結果アクション" size="md"/>

<Image img={img_new_tab} alt="エディタで生成されたクエリを開く" size="md"/>

## レスポンスを停止・中断する \{#interrupt\}

レスポンスに時間がかかりすぎる、あるいは意図とずれてきた場合:

1. 「Stop」ボタンをクリックします（処理中に表示されます）。
2. メッセージには中断されたことがマークされます。プロンプトを改善して再送信できます。

## キーボードショートカット \{#shortcuts\}

| 操作 | ショートカット |
| ------ | -------- |
| AI Chat を開く | `⌘ + '` / `Ctrl + '` |
| メッセージを送信 | `Enter` |
| 改行 | `Shift + Enter` |

</VerticalStepper>