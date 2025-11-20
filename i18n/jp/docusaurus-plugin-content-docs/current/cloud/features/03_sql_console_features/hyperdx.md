---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'HyperDX を提供します。HyperDX は、ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用レベルのオブザーバビリティプラットフォーム「ClickStack」の UI であり、ログ、トレース、メトリクス、セッションを 1 つの高性能かつスケーラブルなソリューションとして統合します。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX は [**ClickStack**](/use-cases/observability/clickstack) のユーザーインターフェイスであり、ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用グレードのオブザーバビリティプラットフォームです。ログ、トレース、メトリクス、セッションを単一の高性能なソリューションに統合します。複雑なシステムの監視とデバッグのために設計されており、ClickStack により、開発者と SRE はツールを切り替えたり、タイムスタンプや相関 ID を使ってデータを手動でつなぎ合わせたりすることなく、エンドツーエンドで問題をトレースできます。

HyperDX は、オブザーバビリティデータの探索と可視化に特化したフロントエンドであり、Lucene 形式と SQL の両方のクエリ、インタラクティブなダッシュボード、アラート、トレース探索などをサポートし、バックエンドとしての ClickHouse 向けに最適化されています。

ClickHouse Cloud の HyperDX を利用することで、ユーザーはより「ターンキー」な ClickStack エクスペリエンスを得られます。管理すべきインフラストラクチャはなく、別途認証を設定する必要もありません。
HyperDX はワンクリックで起動してデータに接続でき、ClickHouse Cloud の認証システムと完全に統合されているため、オブザーバビリティインサイトへシームレスかつ安全にアクセスできます。


## デプロイメント {#main-concepts}

ClickHouse CloudのHyperDXは現在プライベートプレビュー段階であり、組織レベルで有効化する必要があります。有効化後、任意のサービスを選択すると、左側のメインナビゲーションメニューにHyperDXが表示されます。

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

ClickHouse CloudでHyperDXを使い始めるには、専用の[スタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)を参照することをお勧めします。

ClickStackの詳細については、[完全なドキュメント](/use-cases/observability/clickstack)を参照してください。
