---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'AI チャット'
title: 'ClickHouse Cloud での AI チャットの利用'
pagination_prev: null
pagination_next: null
description: 'ClickHouse Cloud コンソールで AI チャット機能を有効化して利用するためのガイド'
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


# ClickHouse CloudでAIチャットを使用する

> このガイドでは、ClickHouse Cloud ConsoleでAIチャット機能を有効化し、使用する方法について説明します。

<VerticalStepper headerLevel="h2">


## 前提条件 {#prerequisites}

1. AI機能が有効化されたClickHouse Cloud組織へのアクセス権が必要です（利用できない場合は、組織管理者またはサポートにお問い合わせください）。


## AI Chatパネルを開く {#open-panel}

1. ClickHouse Cloudサービスに移動します。
2. 左サイドバーで「Ask AI」というラベルの付いたスパークルアイコンをクリックします。
3. (ショートカット) <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) または <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows) を押すと開閉の切り替えができます。

<Image img={img_open} alt='AI Chatフライアウトを開く' size='md' />


## データ使用同意の承認（初回実行時） {#consent}

1. 初回使用時に、データの取り扱いとサードパーティのLLMサブプロセッサーに関する同意ダイアログが表示されます。
2. 内容を確認して承認すると続行できます。拒否した場合、パネルは開きません。

<Image img={img_consent} alt='同意ダイアログ' size='md' />


## チャットモードの選択 {#modes}

AI Chatは現在、以下をサポートしています：

- **Agent**: スキーマとメタデータに対するマルチステップ推論（サービスが起動している必要があります）。
- **Docs AI (Ask)**: 公式ClickHouseドキュメントとベストプラクティスリファレンスに基づいた集中的なQ&A。

モードを切り替えるには、フライアウトの左下にあるモードセレクターを使用してください。

<Image img={img_modes} alt='モード選択' size='sm' />


## メッセージの作成と送信 {#compose}

1. 質問を入力します（例：「ユーザーごとに日次イベントを集計するマテリアライズドビューを作成」）。
2. <kbd>Enter</kbd>を押して送信します（改行する場合は<kbd>Shift</kbd> + <kbd>Enter</kbd>を使用）。
3. モデルの処理中に「Stop」をクリックすると中断できます。


## 「エージェント」の思考ステップについて {#thinking-steps}

エージェントモードでは、展開可能な中間的な「思考」または計画ステップが表示されることがあります。これらは、アシスタントがどのように回答を形成しているかの透明性を提供します。必要に応じて折りたたんだり展開したりしてください。

<Image img={img_thinking} alt='思考ステップ' size='md' />


## 新しいチャットの開始 {#new-chats}

「New Chat」ボタンをクリックして、コンテキストをクリアし、新しいセッションを開始します。


## チャット履歴の表示 {#history}

1. 下部セクションに最近のチャットが一覧表示されます。
2. 過去のチャットを選択すると、そのメッセージが読み込まれます。
3. ゴミ箱アイコンで会話を削除します。

<Image img={img_history} alt='チャット履歴リスト' size='md' />


## 生成されたSQLの操作 {#sql-actions}

アシスタントがSQLを返した場合：

- 正確性を確認します。
- 「エディタで開く」をクリックして、クエリを新しいSQLタブに読み込みます。
- コンソール内で変更および実行します。

<Image img={img_result_actions} alt='結果のアクション' size='md' />

<Image img={img_new_tab} alt='生成されたクエリをエディタで開く' size='md' />


## レスポンスの停止または中断 {#interrupt}

レスポンスに時間がかかりすぎている場合や、意図しない方向に進んでいる場合:

1. 「停止」ボタンをクリックします（処理中に表示されます）。
2. メッセージは中断済みとしてマークされます。プロンプトを修正して再送信できます。


## キーボードショートカット {#shortcuts}

| 操作       | ショートカット             |
| ------------ | -------------------- |
| AIチャットを開く | `⌘ + '` / `Ctrl + '` |
| メッセージを送信 | `Enter`              |
| 改行     | `Shift + Enter`      |

</VerticalStepper>
