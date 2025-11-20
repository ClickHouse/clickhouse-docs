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

**ClickStack** は ClickHouse 上に構築された本番運用向けのオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションを単一の高性能なソリューションとして統合します。複雑なシステムの監視とデバッグのために設計されており、開発者と SRE はツール間を行き来したり、タイムスタンプや相関 ID を使って手動でデータを突き合わせたりすることなく、エンドツーエンドで問題をトレースできます。

ClickStack の中核にあるのは、「すべてのオブザーバビリティデータは、横方向に広く、リッチなイベントとして取り込むべきである」というシンプルながら強力なコンセプトです。これらのイベントはデータ種別ごと（ログ、トレース、メトリクス、セッション）に ClickHouse のテーブルに保存されますが、データベースレベルで完全にクエリでき、相互に相関付けることができます。

ClickStack は、ClickHouse のカラム指向アーキテクチャ、ネイティブな JSON サポート、完全に並列化された実行エンジンを活用することで、高カーディナリティなワークロードを効率的に処理できるように設計されています。これにより、巨大なデータセットに対するサブセカンドでのクエリ、広い時間範囲にわたる高速な集計、個々のトレースの詳細な解析が可能になります。JSON は圧縮されたカラムナ形式で保存されるため、事前の定義や手動の対応なしにスキーマを進化させることができます。


## 機能 {#features}

このスタックには、デバッグと根本原因分析のために設計された以下の主要機能が含まれています:

- ログ、メトリクス、セッションリプレイ、トレースを一箇所で相関分析・検索
- スキーマに依存せず、既存のClickHouseスキーマ上で動作
- ClickHouseに最適化された超高速検索と可視化
- 直感的な全文検索とプロパティ検索構文(例: `level:err`)、SQLはオプション
- イベント差分による異常傾向の分析
- 数クリックでアラートを設定
- 複雑なクエリ言語なしで高カーディナリティイベントをダッシュボード化
- ネイティブJSON文字列クエリ
- ログとトレースのライブテールで常に最新のイベントを取得
- OpenTelemetry (OTel)を標準でサポート
- HTTPリクエストからDBクエリまでの健全性とパフォーマンスを監視(APM)
- 異常とパフォーマンス劣化を特定するためのイベント差分
- ログパターン認識


## コンポーネント {#components}

ClickStackは3つの主要コンポーネントで構成されています：

1. **HyperDX UI** – オブザーバビリティデータの探索と可視化を目的として構築されたフロントエンド
2. **OpenTelemetry collector** – ログ、トレース、メトリクスに対して独自のスキーマを持つ、カスタムビルドされた事前設定済みコレクター
3. **ClickHouse** – スタックの中核となる高性能分析データベース

これらのコンポーネントは、個別または一括でデプロイできます。ブラウザホスト版のHyperDX UIも提供されており、追加のインフラストラクチャなしで既存のClickHouseデプロイメントに接続できます。

まず、[入門ガイド](/use-cases/observability/clickstack/getting-started)を参照してから、[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)を読み込んでください。また、[デプロイメントオプション](/use-cases/observability/clickstack/deployment)と[本番環境のベストプラクティス](/use-cases/observability/clickstack/production)に関するドキュメントもご参照いただけます。


## 原則 {#clickstack-principles}

ClickStackは、オブザーバビリティスタックのあらゆる層において、使いやすさ、パフォーマンス、柔軟性を優先する一連のコア原則に基づいて設計されています。

### 数分でセットアップ可能 {#clickstack-easy-to-setup}

ClickStackは、最小限の設定のみで、あらゆるClickHouseインスタンスとスキーマですぐに動作します。新規に開始する場合でも既存のセットアップと統合する場合でも、数分で稼働を開始できます。

### ユーザーフレンドリーで目的に特化 {#user-friendly-purpose-built}

HyperDX UIはSQLとLucene形式の構文の両方をサポートしており、ユーザーはワークフローに適したクエリインターフェースを選択できます。オブザーバビリティ専用に構築されたこのUIは、チームが根本原因を迅速に特定し、複雑なデータをスムーズにナビゲートできるよう最適化されています。

### エンドツーエンドのオブザーバビリティ {#end-to-end-observability}

ClickStackは、フロントエンドのユーザーセッションからバックエンドのインフラストラクチャメトリクス、アプリケーションログ、分散トレースまで、フルスタックの可視性を提供します。この統合ビューにより、システム全体にわたる深い相関分析が可能になります。

### ClickHouse向けに構築 {#built-for-clickhouse}

スタックのあらゆる層は、ClickHouseの機能を最大限に活用するよう設計されています。クエリはClickHouseの分析関数とカラム型エンジンを活用するよう最適化されており、大量のデータに対する高速な検索と集計を保証します。

### OpenTelemetryネイティブ {#open-telemetry-native}

ClickStackはOpenTelemetryとネイティブに統合されており、すべてのデータをOpenTelemetryコレクターエンドポイント経由で取り込みます。上級ユーザー向けには、ネイティブファイル形式、カスタムパイプライン、またはVectorなどのサードパーティツールを使用したClickHouseへの直接取り込みもサポートしています。

### オープンソースで完全にカスタマイズ可能 {#open-source-and-customizable}

ClickStackは完全にオープンソースであり、どこにでもデプロイできます。スキーマは柔軟でユーザーが変更可能であり、UIは変更を必要とせずにカスタムスキーマに対応できるよう設計されています。コレクター、ClickHouse、UIを含むすべてのコンポーネントは、取り込み、クエリ、ストレージの要求に応じて独立してスケール可能です。


## アーキテクチャ概要 {#architectural-overview}

<Image img={architecture} alt='Simple architecture' size='lg' />

ClickStackは3つのコアコンポーネントで構成されています:

1. **HyperDX UI**  
   オブザーバビリティ向けに構築されたユーザーフレンドリーなインターフェース。Lucene形式とSQLクエリの両方、インタラクティブなダッシュボード、アラート、トレース探索などをサポートし、すべてがバックエンドとしてClickHouseに最適化されています。

2. **OpenTelemetry collector**  
   ClickHouseへの取り込みに最適化された独自スキーマで構成されたカスタムビルドのコレクター。OpenTelemetryプロトコル経由でログ、メトリクス、トレースを受信し、効率的なバッチ挿入を使用してClickHouseに直接書き込みます。

3. **ClickHouse**  
   ワイドイベントの中央データストアとして機能する高性能分析データベース。ClickHouseはカラム型エンジンとJSONのネイティブサポートを活用し、大規模な高速検索、フィルタリング、集計を実現します。

これら3つのコンポーネントに加えて、ClickStackは**MongoDBインスタンス**を使用して、ダッシュボード、ユーザーアカウント、設定などのアプリケーション状態を保存します。

完全なアーキテクチャ図とデプロイメントの詳細については、[アーキテクチャセクション](/use-cases/observability/clickstack/architecture)を参照してください。

ClickStackを本番環境にデプロイすることに関心のあるユーザーには、["本番環境"](/use-cases/observability/clickstack/production)ガイドを読むことをお勧めします。
