---
sidebar_label: 'チャット'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/chat
title: 'チャット'
description: 'ClickHouse Agents での会話、ブックマーク、フォーク、複数会話、チャットの共有'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'チャット', '会話', 'ブックマーク', 'フォーク', '共有', '複数会話']
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

ClickHouse Agents のチャット画面では、会話、分岐、並べて比較、共有を行えます。

<Image img={chat} alt="左側のナビゲーション、エージェントの識別情報ヘッダー、メッセージコンポーザーを表示した ClickHouse Agent のチャット画面" size="lg" />

## 会話 \{#conversations\}

左側のナビゲーションにある作成アイコンをクリックして、新しい会話を開始します。
会話ウィンドウの左上にあるエージェント選択ダイアログで、使用するエージェントを選択します。既定では **ClickHouse Agent** が選択されています。
コンポーザーにメッセージを入力し、送信します。各会話はサイドバーの履歴に保存され、あとで開き直したり、名前を変更したり、削除したりできます。

<Image img={conversation} alt="左側のナビゲーションで作成アイコンが強調表示されたチャット画面、保存済みの Top 10 Tables Ranked の会話が表示された Chats 履歴のサイドバー、質問例が入力されたコンポーザー" size="lg" />

メッセージはその場で編集でき、エージェントはその時点の会話履歴から応答を再生成します。
また、メッセージを再送信しなくても、エージェントの直前の応答だけを再生成できます。

## ブックマーク \{#bookmarks\}

メッセージや会話全体をブックマークすると、すぐに見つけられるよう目印を付けられます。ブックマークは自分にのみ表示され、会話名を変更してもそのまま保持されます。

<Image img={bookmark} alt="ブックマーク アイコンが強調表示され、[Add Bookmarks] ツールチップが表示されているチャット ヘッダー" size="lg" />

## 会話をフォークする \{#forking\}

会話をフォークすると、特定のメッセージから派生した新しい会話が作成されます。元のスレッドを保ったまま、別の進め方を試す場合に使用できます。
利用可能なフォークモードは 3 つあります。

* **表示中のメッセージのみ** - フォーク先のメッセージまでの直接の経路をコピーします。
* **関連する分岐を含める** - メインの経路に加えて、既存の分岐もコピーします。
* **ここまでをすべて含める** - フォーク先のメッセージまでのすべてをコピーします。

フォークした会話は独立しているため、変更が元の会話に同期されることはありません。

<Image img={fork} alt="3 つのフォークモードのアイコン、[ここからフォークを開始] と [記憶する] のチェックボックス、および下部のメッセージアクションツールバーが表示された分岐オプションダイアログ" size="lg" />

## 複数会話 \{#multi-conversation\}

複数会話では、2つの会話を並べて表示し、同じプロンプトを両方に送信します。モデル間で応答を比較したり、異なるエージェント構成でA/Bテストを行ったりする場合に使用します。

現在の会話と並行する会話を作成するには、チャットヘッダーの **+** ボタンをクリックします。

<Image img={multiConversation} alt="複数会話を追加するボタンが強調表示されたチャットヘッダーと、コンポーザー上部の + ClickHouse Agent インジケーター" size="lg" />

その後、2つの会話が横に並び、同じプロンプトを受け取ります。

<Image img={multiConversation2} alt="2つの ClickHouse Agent の会話が横に並んで表示され、どちらも同じ run_select_query ツール呼び出しを実行している複数会話ビュー" size="lg" />

## チャットの共有 \{#sharing-chats\}

任意の会話の共有リンクを生成して、チームメイトに送信したり、参照用に保存したりできます。受信者には、成果物や表示されている分岐を含む読み取り専用ビューが表示されます。リンクはいつでも共有ダッシュボードから取り消すことができます。

既存のメッセージへの編集は共有ビューに反映されますが、リンクの生成後に追加されたメッセージは反映されません。

会話を共有するには、サイドバーで対象の会話のメニューを開き、**Share** を選択します。

<Image img={share} alt="Share、Rename、Duplicate、Archive、Delete の各オプションが表示された、サイドバー内の会話メニュー" size="lg" />

次に、共有ダイアログで **Create link** をクリックします。

<Image img={shareModal} alt="Create link ボタンと、共有後に追加されたメッセージやあなたの名前は非公開のままであるという注記が表示された、チャット共有リンクのダイアログ" size="md" />