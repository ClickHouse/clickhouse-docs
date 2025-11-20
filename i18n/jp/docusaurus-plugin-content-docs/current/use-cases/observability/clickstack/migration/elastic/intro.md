---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: 'ElasticからClickStackへの移行'
pagination_prev: null
pagination_next: null
sidebar_label: '概要'
sidebar_position: 0
description: 'ElasticからClickHouse Observability Stackへ移行する際の概要'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'guide'
---



## ElasticからClickStackへの移行 {#migrating-to-clickstack-from-elastic}

本ガイドは、Elastic Stackから移行するユーザー、特にElastic Agent経由で収集しElasticsearchに保存されたログ、トレース、メトリクスを監視するためにKibanaを使用しているユーザーを対象としています。ClickStackにおける同等の概念とデータ型を概説し、KibanaのLuceneベースのクエリをHyperDXの構文に変換する方法を説明し、スムーズな移行のためのデータとエージェントの両方の移行に関するガイダンスを提供します。

移行を開始する前に、ClickStackとElastic Stackのトレードオフを理解することが重要です。

以下の場合、ClickStackへの移行を検討すべきです:

- 大量のオブザーバビリティデータを取り込んでおり、非効率的な圧縮とリソース利用率の低さによりElasticのコストが高すぎると感じている場合。ClickStackはストレージとコンピュートコストを大幅に削減でき、生データに対して少なくとも10倍の圧縮率を実現します。
- 大規模環境での検索パフォーマンスが低い、または取り込みのボトルネックに直面している場合。
- SQLを使用してオブザーバビリティシグナルとビジネスデータを関連付け、オブザーバビリティと分析ワークフローを統合したい場合。
- OpenTelemetryにコミットしており、ベンダーロックインを回避したい場合。
- ClickHouse Cloudのストレージとコンピュートの分離を活用し、事実上無制限のスケールを実現したい場合。アイドル期間中は取り込みコンピュートとオブジェクトストレージのみに課金されます。

ただし、以下の場合、ClickStackは適していない可能性があります:

- オブザーバビリティデータを主にセキュリティユースケースに使用しており、SIEM重視の製品が必要な場合。
- ユニバーサルプロファイリングがワークフローの重要な部分である場合。
- ビジネスインテリジェンス(BI)ダッシュボードプラットフォームが必要な場合。ClickStackは意図的にSREと開発者向けの独自のビジュアルワークフローを持っており、ビジネスインテリジェンス(BI)ツールとして設計されていません。同等の機能については、[ClickHouseプラグインを使用したGrafana](/integrations/grafana)または[Superset](/integrations/superset)の使用を推奨します。
