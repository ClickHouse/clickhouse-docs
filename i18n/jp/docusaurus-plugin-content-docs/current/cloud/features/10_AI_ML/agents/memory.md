---
sidebar_label: 'メモリ'
sidebar_position: 6
slug: /cloud/features/ai-ml/agents/memory
title: 'メモリ'
description: 'ClickHouse Agents のメモリとパーソナライズ'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'メモリ', 'パーソナライズ']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import memories from '@site/static/images/cloud/agent-builder/memory/memories.png';
import create from '@site/static/images/cloud/agent-builder/memory/create.png';
import edit from '@site/static/images/cloud/agent-builder/memory/edit.png';
import deleteMemory from '@site/static/images/cloud/agent-builder/memory/delete.png';
import filter from '@site/static/images/cloud/agent-builder/memory/filter.png';
import toggle from '@site/static/images/cloud/agent-builder/memory/toggle.png';

<BetaBadge />

会話をまたいでエージェントが参照できる、ユーザーごとの保存領域です。これは複数のエントリで構成されており、それぞれがキー・バリューのペアになっています。たとえば、希望する
日付フォーマット、普段クエリするデータベース、応答をどの程度簡潔にしたいかといった情報です。必要に応じて、エージェントはこれらをコンテキストに取り込みます。

## メモリの仕組み \{#how-it-works\}

小さなメモリエージェントが、メインの会話と並行して動作します。直近のメッセージを読み取り、記憶しておく価値がある内容を判断して、ユーザーごとの保存領域にエントリを書き込みます。次の会話では、それらのエントリをコンテキストとして利用できるため、同じことを繰り返して伝えなくても、メインエージェントが参照できます。

これにより、会話に一貫性が生まれます。たとえば、SQL の出力は小文字がよいことや、会計年度が 3 月に終わることを一度エージェントに伝えておけば、その後の会話でもそれに沿った応答をするようになります。

## メモリを管理する \{#manage-your-memories\}

左側のナビゲーションにある **Memories** (脳の形の) アイコンからメモリパネルを開きます。このパネルには保存済みのメモリが一覧表示され、エントリの作成、編集、削除、絞り込みを行うためのコントロールが用意されています。

<Image img={memories} alt="左側のナビゲーションで脳のアイコンが強調表示され、絞り込み入力欄、Add ボタン、Use memory チェックボックス、編集および削除コントロール付きのメモリエントリ、Admin Settings ボタンが表示された Memories パネル" size="sm" />

メモリはユーザーごとに非公開です。ほかのユーザーのエージェントがあなたのエントリを見ることはなく、あなたのエージェントがほかのユーザーのエントリを見ることもありません。

### メモリ を作成する \{#create-memory\}

パネル上部の **+** ボタンをクリックして、**Create メモリ** ダイアログを開きます。**秘密鍵** (小文字の英字とアンダースコアのみ) と **値** を入力し、**Create** をクリックします。

<Image img={create} alt="Create メモリ の + ボタンが強調表示された メモリ パネル" size="sm" />

### メモリを絞り込む \{#filter-memories\}

パネル上部の**メモリを絞り込む**入力欄を使用して、キーでエントリを検索できます。

<Image img={filter} alt="「メモリを絞り込む」入力欄が強調表示され、「demo」と入力されたメモリパネル" size="sm" />

### メモリを編集する \{#edit-memory\}

メモリの鉛筆アイコンをクリックして **Edit Memory** ダイアログを開きます。秘密鍵 または 値 を変更し、**Save** をクリックします。

<Image img={edit} alt="Edit Memory の鉛筆アイコンが強調表示されたメモリエントリ" size="sm" />

### メモリを削除する \{#delete-memory\}

メモリのごみ箱アイコンをクリックして削除します。

<Image img={deleteMemory} alt="Delete Memory のごみ箱アイコンが強調表示されたメモリエントリ" size="sm" />

## メモリの切り替え \{#toggle-memory\}

メモリパネルの上部にある**メモリを使用**チェックボックスで、メモリのオン／オフを切り替えます。保存したくない機密性の高い話題や、パーソナライズが不要な単発の会話では、これをオフにしてください。

メモリがオフの場合、エージェントはメモリストアの読み取りも書き込みも行いません。

<Image img={toggle} alt="上部の「メモリを使用」チェックボックスが強調表示されたメモリパネル" size="sm" />

## メモリのベストプラクティス \{#memory-best-practices\}

メモリが役立つ場面:

* 繰り返し使う慣例: 推奨の日付フォーマット、業務上の定義、命名パターン。
* プロジェクトの文脈: 普段どのサービスやデータベースをクエリするか、どのダッシュボードを重視しているか。
* コミュニケーションのスタイル: 簡潔か饒舌か、コード中心の応答か文章中心の応答か。

メモリは、データベースとして使うことを想定したものではありません。たとえば、大量の参考資料を格納する場所ではありません。
そのためには、代わりに[スキル](/cloud/features/ai-ml/agents/builder/skills)を使うか、その資料をエージェントの指示に組み込んでください。
また、過去のチャットを検索するためのものでもありません。その役割は会話履歴自体が担います。