---
slug: /integrations/integration-development/testing-your-integration
sidebar_label: '連携のテスト'
sidebar_position: 3
title: 'ClickHouse 連携のテスト'
description: 'ClickHouse Cloud およびセルフホストのオープンソース環境向け連携の基本的な検証マトリクス。'
keywords: ['パートナー', '連携', 'テスト', '検証', 'サンプルデータセット', 'ClickHouse Cloud', 'オープンソース']
doc_type: 'guide'
---

# ClickHouse 連携のテスト \{#testing-your-clickhouse-integration\}

レビューに提出する前に、両方の ClickHouse のデプロイモードに対して連携を検証し、さらに ClickHouse の型システムを実用的な規模で適切に検証できるデータセットでも確認してください。このページでは、エントリレベルで「テスト済み」が何を意味するかを定義します。正式な検証は、より上位のパートナーシップレベルに進むパートナー向けの別プロセスです。

インジェストと利用の経路については [Building integrations](/integrations/integration-development/building-integrations) を、結果の公開方法については [Documenting your integration](/integrations/integration-development/documenting-your-integration) を参照してください。

## テストマトリクス \{#test-matrix\}

両方のデプロイモードを対象にしてください。ほとんどのユーザーはそのどちらか一方を利用しており、挙動が異なる箇所があります (認証、ネットワーク、利用可能な機能など) 。

* **ClickHouse Cloud:** [無料トライアル](https://clickhouse.com/cloud)に登録してください。Development ティアではクレジットカードは不要です
* **セルフホスト (オープンソース) :** [GitHub releases](https://github.com/ClickHouse/ClickHouse/releases) から最新の安定版リリースを使用してください。[インストールガイド](/install) を使うと、Docker でローカルインスタンスを最短で用意できます

両方に対してテストを実施し、機能差分があれば連携ページに記載してください。

## テストすべき項目 \{#what-to-test\}

**機能的な正しさ。** 連携が提供するすべてのコードパスをテストしてください。対象は、インジェスト、クエリ、スキーマ検出、エラー処理、再接続です。製品でエンドユーザーに SQL を提示する場合は、UI が生成するクエリが正しく往復できることを確認してください。

**型システムの網羅性。** ClickHouse は、Array、Tuple、Map、JSON、Nested、LowCardinality、Decimal、Date と DateTime の各種バリアント、UUID、IPv4 と IPv6、enum、aggregate-function 型をサポートしています。連携では、ネストした Array、深くネストした Tuple、JSON カラムで問題が起きがちです。クライアントライブラリと UI はこれらを適切に扱えるべきであり、少なくとも、黙って切り捨てたり誤表示したりするのではなく、理解しやすいエラーを返す必要があります。

**スケール。** 顧客が実際に扱う結果セットのサイズと行数でテストしてください。ユーザー向け BI では、多くの場合、数億〜数十億行のテーブルと、単一の集計結果から数万行規模の結果セットを想定します。無制限の読み取り (`SELECT *`) は、ハングするのではなく、予測可能な形で失敗するか、ページネーションされるべきです。

**認証。** TLS が有効な接続を少なくとも 1 つは検証してください。認証設定を公開している場合は、文書化しているすべての方式 (TLS 上のユーザー名とパスワード、mTLS、SSL クライアント証明書) をテストしてください。

**接続ライフサイクル。** 接続の切断、サーバー再起動、低速なクエリに対しても妥当な動作をすることを確認してください。エスカレーションの多くは、クエリの意味論ではなく接続処理に起因します。

## 推奨サンプルデータセット \{#recommended-example-datasets\}

全体の一覧は、[**サンプルデータセット**](/getting-started/example-datasets) セクションにあります。以下の 4 つのデータセットで、ほとんどの統合テスト要件をカバーできます。

* **[GitHub events](/getting-started/example-datasets/github-events):** ネストされたイベントペイロードを含む 31 億行。Array、Tuple、ネスト型のテストに最適です
* **[NYC taxi data](/getting-started/example-datasets/nyc-taxi):** よく知られたスキーマを持つ数十億行のデータ。スループットや読み取りパスのテストに適しています
* **[Stack Overflow](/getting-started/example-datasets/stackoverflow):** JOIN の多い BI シナリオ向けのマルチテーブルなリレーショナルデータ
* **[Hacker News](/getting-started/example-datasets/hacker-news):** 2800 万行。すばやく読み込めるため、繰り返しの検証に役立ちます

極端な大規模検証には、**[WikiStat](/getting-started/example-datasets/wikistat)** (約 5000 億レコード) を使用してください。

## テスト結果として記載すべき内容 \{#what-to-capture-from-your-testing\}

レビューに向けて 連携 を提出する際は、次の内容を共有してください。

* テストした ClickHouse のバージョン (Cloud およびオープンソース)
* データセットとおおよその規模 (行数、ディスク上のサイズ)
* 連携 が対応する型と、対応しない型 (これはドキュメントの **既知の制限事項** セクションになります)
* 結果セットのしきい値によって動作が変化する場合など、注意が必要なパフォーマンス特性

短いテストレポートがあると、レビューの手戻りを減らせます。1 段落と表 1 つで十分です。