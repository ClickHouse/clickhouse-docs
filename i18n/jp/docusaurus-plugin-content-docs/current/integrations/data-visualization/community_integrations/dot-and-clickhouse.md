---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI チャットボット | Dot は、ビジネスデータに関する質問に回答し、定義や関連するデータアセットを検索し、さらにデータモデリングまで支援できる、ClickHouse を基盤としたインテリジェントな仮想データアシスタントです。'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) は、あなたの **AI データアナリスト** です。
ClickHouse に直接接続し、自然言語でデータに関する質問を行い、データ探索や仮説検証、「なぜか」を問う分析が行えます。Slack、Microsoft Teams、ChatGPT、あるいはネイティブな Web UI から直接利用できます。



## 前提条件 {#pre-requisites}

- ClickHouseデータベース（セルフホスト版または[ClickHouse Cloud](https://clickhouse.com/cloud)）
- [Dot](https://www.getdot.ai/)アカウント
- [Hashboard](https://www.hashboard.com/)アカウントおよびプロジェクト


## DotをClickHouseに接続する {#connecting-dot-to-clickhouse}

<Image
  size='md'
  img={dot_01}
  alt='DotでのClickHouse接続の設定（ライトモード）'
  border
/>
<br />

1. DotのUIで、**Settings → Connections**に移動します。
2. **Add new connection**をクリックし、**ClickHouse**を選択します。
3. 接続の詳細情報を入力します：
   - **Host**: ClickHouseサーバーのホスト名またはClickHouse Cloudエンドポイント
   - **Port**: `9440`（セキュアなネイティブインターフェース）または`9000`（デフォルトTCP）
   - **Username / Password**: 読み取りアクセス権を持つユーザー
   - **Database**: 必要に応じてデフォルトスキーマを設定
4. **Connect**をクリックします。

<Image img={dot_02} alt='ClickHouseへの接続' size='sm' />

Dotは**クエリプッシュダウン**を使用します：ClickHouseが大規模な数値計算処理を実行し、Dotが正確で信頼性の高い回答を保証します。


## ハイライト {#highlights}

Dotは会話を通じてデータにアクセスできるようにします：

- **自然言語で質問**：SQLを記述することなく回答を取得できます。
- **Why分析**：トレンドや異常を理解するためのフォローアップ質問ができます。
- **作業環境で動作**：Slack、Microsoft Teams、ChatGPT、またはWebアプリで利用できます。
- **信頼性の高い結果**：Dotはスキーマと定義に対してクエリを検証し、エラーを最小限に抑えます。
- **スケーラブル**：クエリプッシュダウン上に構築され、DotのインテリジェンスとClickHouseの速度を組み合わせています。


## セキュリティとガバナンス {#security}

Dotはエンタープライズ対応です：

- **権限とロール**: ClickHouseのユーザーアクセス制御を継承します
- **行レベルセキュリティ**: ClickHouseで設定されている場合にサポートされます
- **TLS / SSL**: ClickHouse Cloudではデフォルトで有効。セルフホスト環境では手動設定が必要です
- **ガバナンスと検証**: トレーニング/検証スペースによりハルシネーションを防止します
- **コンプライアンス**: SOC 2 Type I認証取得済み


## 追加リソース {#additional-resources}

- Dotウェブサイト: [https://www.getdot.ai/](https://www.getdot.ai/)
- ドキュメント: [https://docs.getdot.ai/](https://docs.getdot.ai/)
- Dotアプリ: [https://app.getdot.ai/](https://app.getdot.ai/)

**ClickHouse + Dot**を使用することで、会話形式でデータを分析できるようになりました。DotのAIアシスタントとClickHouseの高速でスケーラブルな分析エンジンを組み合わせて活用できます。
