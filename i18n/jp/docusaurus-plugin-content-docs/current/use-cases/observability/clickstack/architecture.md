---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack のアーキテクチャ - ClickHouse オブザーバビリティスタック'
title: 'アーキテクチャ'
doc_type: 'reference'
keywords: ['ClickStack アーキテクチャ', 'オブザーバビリティ アーキテクチャ', 'HyperDX', 'OpenTelemetry Collector', 'MongoDB', 'システム設計']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack のアーキテクチャは、**ClickHouse**、**HyperDX**、および **OpenTelemetry (OTel) コレクター** という 3 つの中核コンポーネントを中心に構成されています。アプリケーション状態を保存するために **MongoDB** インスタンスが使用されます。これらを組み合わせることで、ログ、メトリクス、トレースに最適化された高性能なオープンソースのオブザーバビリティスタックを提供します。


## アーキテクチャの概要 {#architecture-overview}

<Image img={architecture} alt="アーキテクチャ" size="lg"/>



## ClickHouse: データベースエンジン {#clickhouse}

ClickStack の中核となるのが ClickHouse です。ClickHouse は、大規模なリアルタイム分析向けに設計されたカラム指向データベースであり、オブザーバビリティデータのインジェストおよびクエリ処理を担います。これにより、次のことが可能になります:

- テラバイト規模のイベントに対する 1 秒未満の検索
- 1 日あたり数十億件の高カーディナリティレコードのインジェスト
- オブザーバビリティデータに対する少なくとも 10 倍の高い圧縮率
- 動的なスキーマ進化を可能にする、半構造化 JSON データのネイティブサポート
- 何百ものビルトイン分析関数を備えた強力な SQL エンジン

ClickHouse はオブザーバビリティデータをワイドなイベントとして扱い、ログ、メトリクス、トレース間の深い相関付けを、単一かつ統一された構造の中で実現します。



## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStack には、オープンで標準化された方法でテレメトリをインジェストするための、事前設定済みの OpenTelemetry (OTel) コレクターが含まれています。ユーザーは OTLP プロトコルを使用して、次のいずれかのプロトコルでデータを送信できます：

- gRPC (ポート `4317`)
- HTTP (ポート `4318`)

コレクターはテレメトリを効率的なバッチ処理で ClickHouse にエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、あらゆるシグナル種別に対してスケーラブルなパフォーマンスを実現します。



## HyperDX：インターフェース {#hyperdx}

HyperDX は ClickStack のユーザーインターフェースです。次の機能を提供します。

- 自然言語および Lucene 形式の検索
- リアルタイムデバッグのためのライブテーリング
- ログ・メトリクス・トレースの統合ビュー
- フロントエンドのオブザーバビリティ向けセッションリプレイ
- ダッシュボード作成とアラート設定
- 高度な分析のための SQL クエリインターフェース

ClickHouse 向けに専用設計された HyperDX は、強力な検索機能と直感的なワークフローを組み合わせることで、ユーザーが異常を迅速に検知し、問題を調査して洞察を得られるようにします。 



## MongoDB: アプリケーション状態 {#mongo}

ClickStack は、アプリケーションレベルの状態を保存するために MongoDB を使用します。これには次のものが含まれます:

- ダッシュボード
- アラート
- ユーザー プロファイル
- 保存済みの可視化

イベントデータとは別に状態を分離することで、バックアップと設定を簡素化しつつ、パフォーマンスとスケーラビリティを確保できます。

このモジュール型アーキテクチャにより、ClickStack は、高速で柔軟性が高くオープンソースな、すぐに使えるオブザーバビリティプラットフォームを提供できます。
