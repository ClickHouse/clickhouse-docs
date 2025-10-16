---
'slug': '/use-cases/observability/clickstack/migration/elastic/intro'
'title': 'ElasticからClickStackへの移行'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '概要'
'sidebar_position': 0
'description': 'ElasticからClickHouse Observability Stackへの移行の概要'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'guide'
---

## Elastic から ClickStack への移行 {#migrating-to-clickstack-from-elastic}

このガイドは、Elastic Stack から移行するユーザーを対象としており、特に Elastic Agent を介して収集され、Elasticsearch に保存されたログ、トレース、およびメトリクスを監視するために Kibana を使用している方々のためのものです。ClickStack における同等の概念とデータ型を概説し、Kibana の Lucene ベースのクエリを HyperDX の構文に変換する方法を説明し、スムーズな移行のためのデータとエージェントの移行に関するガイダンスを提供します。

移行を開始する前に、ClickStack と Elastic Stack の間のトレードオフを理解することが重要です。

次のような場合は、ClickStack への移行を検討すべきです:

- 大量の可観測データを取り込んでいて、非効率的な圧縮とリソースの利用効率の悪さにより、Elastic がコスト高であると感じている場合。ClickStack は、ストレージおよび計算コストを大幅に削減でき、未加工データで少なくとも 10 倍の圧縮を提供します。
- スケールでの検索性能が悪い、または取り込みのボトルネックに直面している場合。
- SQL を使用して可観測信号とビジネスデータを相関させ、可観測性と分析のワークフローを統合したい場合。
- OpenTelemetry にコミットしており、ベンダーロックインを避けたい場合。
- ClickHouse Cloud におけるストレージと計算の分離を利用し、ほぼ無限のスケールを実現したい場合 - アイドル期間中は取り込み計算とオブジェクトストレージにのみ支払うことになります。

しかし、次のような場合には ClickStack は適さないかもしれません:

- 可観測データを主にセキュリティユースケースに使用していて、SIEMに特化した製品が必要な場合。
- ユニバーサルプロファイリングがワークフローの重要な部分である場合。
- ビジネスインテリジェンス (BI) ダッシュボーディングプラットフォームが必要な場合。ClickStack は、意図的に SRE や開発者向けの意見をもとにした視覚的ワークフローを持ち、ビジネスインテリジェンス (BI) ツールとして設計されていません。同等の機能を求める場合は、[ClickHouse プラグインを使用した Grafana](/integrations/grafana) または [Superset](/integrations/superset) の使用をお勧めします。
