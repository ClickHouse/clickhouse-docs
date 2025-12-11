---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI チャットボット | Dot は、ClickHouse を活用して、ビジネスデータに関する質問に答え、定義や関連するデータ資産を取得し、さらにはデータモデリングも支援できるインテリジェントな仮想データアシスタントです。'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot {#dot}

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) は、あなたの **AI データアナリスト** です。
ClickHouse に直接接続し、自然言語でデータに関する質問をしたり、データを探索したり、仮説を検証したり、「なぜ」に関する問いに答えたりできます。これらはすべて、Slack、Microsoft Teams、ChatGPT、あるいはネイティブな Web UI 上からそのまま実行できます。

## 前提条件 {#pre-requisites}

- セルフホスト型、または [ClickHouse Cloud](https://clickhouse.com/cloud) 上の ClickHouse データベース  
- [Dot](https://www.getdot.ai/) のアカウント  
- [Hashboard](https://www.hashboard.com/) のアカウントとプロジェクト

## Dot を ClickHouse に接続する {#connecting-dot-to-clickhouse}

<Image size="md" img={dot_01} alt="Dot での ClickHouse 接続設定（ライトモード）" border />
<br/>

1. Dot の UI で **Settings → Connections** を開きます。  
2. **Add new connection** をクリックし、**ClickHouse** を選択します。  
3. 接続情報を入力します：  
   - **Host**: ClickHouse サーバーのホスト名、または ClickHouse Cloud のエンドポイント  
   - **Port**: `9440`（セキュアなネイティブインターフェイス）または `9000`（デフォルトの TCP）  
   - **Username / Password**: 読み取り権限を持つユーザー  
   - **Database**: 必要に応じてデフォルトのスキーマを指定  
4. **Connect** をクリックします。

<Image img={dot_02} alt="ClickHouse への接続" size="sm"/>

Dot は **query-pushdown** を利用します。ClickHouse がスケール可能な大規模な数値処理を担当し、Dot はその結果に基づいて正確で信頼性の高い回答を提供します。

## ハイライト {#highlights}

Dot は、会話を通じてデータを活用できるようにします：

- **自然言語で質問**：SQL を書かずに回答を得られます。  
- **Why 分析**：傾向や異常を理解するために、追加の質問を重ねて行えます。  
- **普段使っている環境で利用可能**：Slack、Microsoft Teams、ChatGPT、または Web アプリで利用できます。  
- **信頼できる結果**：Dot がクエリをスキーマや定義と照合して検証し、エラーを最小限に抑えます。  
- **スケーラブル**：query-pushdown を基盤とし、Dot のインテリジェンスと ClickHouse の高速性を組み合わせています。

## セキュリティとガバナンス {#security}

Dot はエンタープライズ対応です。

- **権限とロール**: ClickHouse のユーザーアクセス制御を継承  
- **行レベルセキュリティ**: ClickHouse 側で設定されている場合にサポート  
- **TLS / SSL**: ClickHouse Cloud ではデフォルトで有効化。セルフホスト環境では手動で設定  
- **ガバナンスと検証**: トレーニング／検証用スペースにより、誤回答（ハルシネーション）の発生を抑制  
- **コンプライアンス**: SOC 2 Type I 認証取得済み

## 追加リソース {#additional-resources}

- Dot ウェブサイト: [https://www.getdot.ai/](https://www.getdot.ai/)  
- ドキュメント: [https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Dot アプリ: [https://app.getdot.ai/](https://app.getdot.ai/)  

これで **ClickHouse + Dot** を使って、対話的にデータを分析できます。Dot の AI アシスタントと ClickHouse の高速かつスケーラブルな分析エンジンを組み合わせて活用しましょう。
