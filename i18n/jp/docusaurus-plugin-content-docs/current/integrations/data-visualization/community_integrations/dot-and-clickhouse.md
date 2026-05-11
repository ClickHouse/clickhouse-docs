---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'AI', 'チャットボット', 'mysql', '統合', 'UI', '仮想アシスタント']
description: 'AI チャットボット | Dot は、ビジネスデータに関する質問に回答し、定義や関連するデータアセットを取得し、さらにはデータモデリングも支援できる、ClickHouse を活用したインテリジェントな仮想データアシスタントです。'
title: 'Dot'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot \{#dot\}

<CommunityMaintainedBadge />

[Dot](https://www.getdot.ai/) は **AIデータアナリスト** です。
ClickHouse に直接接続できるため、自然言語でデータについて質問したり、データを探索したり、仮説を検証したり、「なぜそうなったのか」に答えたりできます。これらはすべて、Slack、Microsoft Teams、ChatGPT、またはネイティブの Web UI から直接行えます。

## 前提条件 \{#pre-requisites\}

* セルフホスト版または [ClickHouse Cloud](https://clickhouse.com/cloud) の ClickHouse データベース
* [Dot](https://www.getdot.ai/) のアカウント

## Dot を ClickHouse に接続する \{#connecting-dot-to-clickhouse\}

<Image size="md" img={dot_01} alt="Dot で ClickHouse 接続を設定する（ライトモード）" border />

<br />

1. Dot の UI で、**Settings → Connections** を開きます。
2. **Add new connection** をクリックし、**ClickHouse** を選択します。
3. 接続情報を入力します。
   * **Host**: ClickHouse サーバーのホスト名、または ClickHouse Cloud のエンドポイント
   * **Port**: `8443` (ClickHouse Cloud の HTTPS) または `8123` (セルフホスト環境の HTTP)
   * **Username / Password**: 読み取り権限を持つユーザー
   * **Database**: 必要に応じてデフォルトのスキーマを設定
4. **Connect** をクリックします。

<Image img={dot_02} alt="ClickHouse への接続" size="sm" />

Dot は **クエリプッシュダウン** を使用します。大規模な計算処理は ClickHouse が担い、Dot は正確で信頼できる結果を提供します。

## 特長 \{#highlights\}

Dotを使えば、会話を通じてデータにアクセスできます。

* **自然言語で質問**: SQLを書かずに回答を得られます。
* **理由を分析**: 傾向や異常を理解するために、追加の質問で深掘りできます。
* **使い慣れた環境で利用可能**: Slack、Microsoft Teams、ChatGPT、またはWebアプリで使えます。
* **信頼できる結果**: Dotはクエリをスキーマや定義に照らして検証し、エラーを最小限に抑えます。
* **スケーラブル**: クエリプッシュダウンを基盤に、DotのインテリジェンスとClickHouseの高速性を組み合わせています。

## セキュリティとガバナンス \{#security\}

Dot はエンタープライズ利用に対応しています。

* **権限とロール**: ClickHouse のユーザーのアクセス制御を継承
* **行レベルセキュリティ**: ClickHouse で設定されていれば利用可能
* **TLS / SSL**: ClickHouse Cloud ではデフォルトで有効化。セルフホスト環境では手動で設定
* **ガバナンスと検証**: トレーニング／検証用スペースによりハルシネーションの防止を支援
* **コンプライアンス**: SOC 2 Type I 認証を取得済み

## 追加リソース \{#additional-resources\}

* Dot のWebサイト: [https://www.getdot.ai/](https://www.getdot.ai/)
* ドキュメント: [https://docs.getdot.ai/](https://docs.getdot.ai/)
* Dot アプリ: [https://app.getdot.ai/](https://app.getdot.ai/)

これで **ClickHouse + Dot** を使って、対話形式でデータを分析できるようになります。Dot の AI アシスタントと、ClickHouse の高速でスケーラブルな分析エンジンを組み合わせることで、自然な対話を通じたデータ分析が可能です。