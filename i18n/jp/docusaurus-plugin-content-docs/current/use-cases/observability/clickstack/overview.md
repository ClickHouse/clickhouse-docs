---
slug: /use-cases/observability/clickstack/overview
title: 'ClickStack - ClickHouse オブザーバビリティスタック'
sidebar_label: '概要'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/getting-started
description: 'ClickStack - ClickHouse オブザーバビリティスタックの概要'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="ランディングページ" size="lg" />

**ClickStack** は ClickHouse 上に構築された本番運用レベルのオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションを単一の高性能なソリューションとして統合します。複雑なシステムの監視とデバッグのために設計されており、開発者や SRE がツール間を行き来したり、タイムスタンプや相関 ID を使って手作業でデータを突き合わせたりすることなく、エンドツーエンドで問題を追跡できるようにします。

ClickStack の中核にあるのは、「すべてのオブザーバビリティデータは、情報量の多いワイドなイベントとして取り込むべきだ」というシンプルかつ強力な考え方です。これらのイベントはログ、トレース、メトリクス、セッションといったデータ種別ごとに ClickHouse のテーブルに保存されますが、データベースレベルで完全にクエリ可能であり、相互に関連付けて分析することができます。

ClickStack は、ClickHouse のカラム指向アーキテクチャ、ネイティブな JSON サポート、完全に並列化された実行エンジンを活用することで、高カーディナリティなワークロードを効率的に処理できるように構築されています。これにより、巨大なデータセットに対するサブ秒レイテンシのクエリ、長期間にわたる高速な集計、個々のトレースの詳細な調査が可能になります。JSON は圧縮されたカラムナ形式で保存されるため、手動での対応や事前定義なしにスキーマを柔軟に進化させることができます。


## 機能 \{#features\}

このスタックには、デバッグおよび根本原因分析のために設計された、主要な機能が複数含まれています。

- ログ・メトリクス・セッションリプレイ・トレースをすべて 1 か所で相関付けて検索
- スキーマに依存せず、既存の ClickHouse スキーマ上で動作
- ClickHouse に最適化された超高速な検索と可視化
- 直感的な全文検索およびプロパティ検索構文（例: `level:err`）、SQL は必須ではない
- イベントの差分（event delta）により異常のトレンドを分析
- 数回のクリックでアラートを設定
- 複雑なクエリ言語なしで高カーディナリティなイベントをダッシュボード化
- ネイティブな JSON 文字列クエリ
- 常に最新のイベントを取得するためのログおよびトレースのライブテール表示
- OpenTelemetry (OTel) を標準でサポート
- HTTP リクエストから DB クエリ (APM) までの健全性とパフォーマンスを監視
- 異常やパフォーマンス回帰を特定するためのイベントの差分（event delta）
- ログのパターン認識

## コンポーネント \{#components\}

ClickStack は、次の3つのコアコンポーネントで構成されています。

1. **HyperDX UI** – オブザーバビリティデータを探索・可視化するための専用フロントエンド
2. **OpenTelemetry collector** – ログ、トレース、メトリクス向けに、一定の前提に基づいて設計されたスキーマを備えた、カスタムビルドかつ事前設定済みのコレクター
3. **ClickHouse** – スタックの中核となる高性能な分析データベース

これらのコンポーネントは、個別にも、スタック全体としてまとめてでもデプロイできます。ブラウザベースの HyperDX UI も利用可能で、追加のインフラを用意することなく、既存の ClickHouse デプロイメントに接続できます。

利用を開始するには、まず [Getting started guide](/use-cases/observability/clickstack/getting-started) を参照し、その後に [sample dataset](/use-cases/observability/clickstack/sample-datasets) を読み込みます。[deployment options](/use-cases/observability/clickstack/deployment) や [production best practices](/use-cases/observability/clickstack/production) に関するドキュメントもあわせて確認できます。

## 原則 \{#clickstack-principles\}

ClickStackは、オブザーバビリティスタックのあらゆるレイヤーにおいて、使いやすさ、パフォーマンス、柔軟性を優先する一連の中核となる原則に基づいて設計されています。

### 数分で簡単にセットアップ \{#clickstack-easy-to-setup\}

ClickStack は、あらゆる ClickHouse インスタンスおよびスキーマで導入直後から動作し、必要な設定は最小限です。新規導入でも既存環境との統合でも、数分で利用を開始できます。

### 使いやすく用途に特化 \{#user-friendly-purpose-built\}

HyperDX UI は SQL と Lucene スタイルの両方の構文をサポートしており、ユーザーは自分のワークフローに適したクエリインターフェースを選択できます。オブザーバビリティ向けに特別に設計されたこの UI は、チームが根本原因を迅速に特定し、複雑なデータをスムーズに探索できるよう最適化されています。

### エンドツーエンドのオブザーバビリティ \{#end-to-end-observability\}

ClickStack は、フロントエンドのユーザーセッションから、バックエンドのインフラストラクチャのメトリクス、アプリケーションログ、分散トレースまでを対象としたフルスタックの可観測性を提供します。この統合されたビューにより、システム全体にわたる詳細な相関分析とインサイトの抽出が可能になります。

### ClickHouse 向けに構築 \{#built-for-clickhouse\}

スタックの全レイヤーが、ClickHouse の機能を最大限に活用できるよう設計されています。クエリは ClickHouse の分析関数とカラム型エンジンを活用するよう最適化されており、大規模なデータに対する高速な検索と集約を実現します。

### OpenTelemetry ネイティブ \{#open-telemetry-native\}

ClickStack は OpenTelemetry にネイティブ対応しており、すべてのデータを OpenTelemetry Collector のエンドポイント経由で取り込みます。上級ユーザー向けには、ネイティブなファイルフォーマット、カスタムパイプライン、Vector のようなサードパーティーツールを利用して、ClickHouse へデータを直接インジェストすることもサポートしています。

### オープンソースで完全にカスタマイズ可能 \{#open-source-and-customizable\}

ClickStack は完全にオープンソースであり、あらゆる環境にデプロイできます。スキーマは柔軟でユーザーが変更可能であり、UI は変更を加えることなくカスタムスキーマに対応できるよう設計されています。コレクター、ClickHouse、UI を含むすべてのコンポーネントは、それぞれ独立してスケールできるため、インジェスト、クエリ、ストレージの要件に対応できます。

## アーキテクチャ概要 \{#architectural-overview\}

<Image img={architecture} alt="Simple architecture" size="lg"/>

ClickStack は 3 つの中核コンポーネントで構成されています。

1. **HyperDX UI**  
   オブザーバビリティのために構築されたユーザーフレンドリーなインターフェースです。Lucene スタイルおよび SQL クエリの両方、インタラクティブなダッシュボード、アラート、トレースの探索などをサポートしており、すべて ClickHouse をバックエンドとするよう最適化されています。

2. **OpenTelemetry collector**  
   ClickHouse へのインジェストに最適化された、設計上の意図を明確に持つスキーマで構成されたカスタムビルドのコレクターです。OpenTelemetry プロトコル経由でログ、メトリクス、トレースを受信し、効率的なバッチ挿入を用いて ClickHouse に直接書き込みます。

3. **ClickHouse**  
   ワイドイベント向けの中核データストアとして機能する高性能な分析データベースです。ClickHouse はカラムナエンジンと JSON のネイティブサポートを活用し、大規模環境での高速な検索、フィルタリング、集計を実現します。

これら 3 つのコンポーネントに加えて、ClickStack は **MongoDB インスタンス** を使用して、ダッシュボード、ユーザーアカウント、設定などのアプリケーション状態を保存します。

完全なアーキテクチャ図とデプロイ方法の詳細は、[アーキテクチャ](/use-cases/observability/clickstack/architecture) セクションを参照してください。

ClickStack を本番環境にデプロイすることを検討しているユーザーは、["本番環境"](/use-cases/observability/clickstack/production) ガイドを参照することを推奨します。