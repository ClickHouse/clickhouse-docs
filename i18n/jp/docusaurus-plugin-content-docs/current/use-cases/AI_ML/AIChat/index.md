---
'slug': '/use-cases/AI_ML/AIChat'
'sidebar_label': 'AIチャット'
'title': 'ClickHouse CloudでのAIチャットの使用'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse Cloud ConsoleでのAIチャット機能の有効化と使用に関するガイド'
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


# ClickHouse CloudでのAIチャットの利用

> このガイドでは、ClickHouse CloudコンソールでAIチャット機能を有効にし、使用する方法を説明します。

<VerticalStepper headerLevel="h2">

## 必要条件 {#prerequisites}

1. AI機能が有効なClickHouse Cloud組織へのアクセスが必要です（利用できない場合は、組織の管理者またはサポートにお問い合わせください）。

## AIチャットパネルを開く {#open-panel}

1. ClickHouse Cloudサービスに移動します。
2. 左のサイドバーで、「Ask AI」と記されたスパークルアイコンをクリックします。
3. （ショートカット） <kbd>⌘</kbd> + <kbd>'</kbd>（macOS）または <kbd>Ctrl</kbd> + <kbd>'</kbd>（Linux/Windows）を押して開閉します。

<Image img={img_open} alt="AIチャットフライアウトを開く" size="md"/>

## データ使用の同意を受け入れる（初回実行時） {#consent}

1. 初回使用時に、データ処理とサードパーティのLLMサブプロセッサについて説明する同意ダイアログが表示されます。
2. 内容を確認し、進むには受け入れます。拒否した場合、パネルは開きません。

<Image img={img_consent} alt="同意ダイアログ" size="md"/>

## チャットモードを選択する {#modes}

AIチャットは現在次のモードをサポートしています：

- **エージェント**: スキーマとメタデータに基づく複数ステップの推論（サービスは起動している必要があります）。
- **Docs AI（Ask）**: 公式のClickHouseドキュメントやベストプラクティスリファレンスに基づいた質疑応答。

フライアウトの左下にあるモードセレクターを使用して切り替えます。

<Image img={img_modes} alt="モード選択" size="sm"/>

## メッセージを作成して送信する {#compose}

1. 質問を入力します（例: “ユーザー別に日次イベントを集約するマテリアライズドビューを作成します”）。  
2. <kbd>Enter</kbd>を押して送信します（改行するには <kbd>Shift</kbd> + <kbd>Enter</kbd>を使用します）。  
3. モデルが処理している間に「停止」をクリックして中断できます。

## 「エージェント」の思考ステップを理解する {#thinking-steps}

エージェントモードでは、展開可能な中間の「思考」またはプランニングステップが表示されることがあります。これにより、アシスタントがどのように回答を形成するかが透明になります。必要に応じて折りたたむことができます。

<Image img={img_thinking} alt="思考ステップ" size="md"/>

## 新しいチャットを開始する {#new-chats}

「新しいチャット」ボタンをクリックしてコンテキストをクリアし、新しいセッションを開始します。

## チャット履歴を表示する {#history}

1. 下部セクションには最近のチャットがリストされています。
2. 前のチャットを選択してメッセージを読み込むことができます。
3. ゴミ箱アイコンを使用して会話を削除します。

<Image img={img_history} alt="チャット履歴リスト" size="md"/>

## 生成されたSQLで作業する {#sql-actions}

アシスタントがSQLを返した場合：

- 正確性を確認します。
- 「エディタで開く」をクリックして新しいSQLタブにクエリを読み込みます。
- コンソール内で修正し、実行します。

<Image img={img_result_actions} alt="結果アクション" size="md"/>

<Image img={img_new_tab} alt="エディタで生成されたクエリを開く" size="md"/>

## 応答を停止または中断する {#interrupt}

応答が遅すぎるか、逸脱している場合：

1. 「停止」ボタンをクリックします（処理中に表示されます）。
2. メッセージは中断されたとマークされ、プロンプトを洗練して再送信できます。

## キーボードショートカット {#shortcuts}

| アクション | ショートカット |
| ---------- | -------------- |
| AIチャットを開く | `⌘ + '` / `Ctrl + '` |
| メッセージを送信 | `Enter` |
| 新しい行 | `Shift + Enter` |

</VerticalStepper>
