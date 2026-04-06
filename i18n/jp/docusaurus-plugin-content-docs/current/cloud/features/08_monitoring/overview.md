---
title: 'ClickHouse Cloud デプロイメントのモニタリング'
slug: /cloud/monitoring
description: 'ClickHouse Cloud のモニタリング機能とオブザーバビリティの概要'
keywords: ['クラウド', 'モニタリング', 'オブザーバビリティ', 'メトリクス']
sidebar_label: '概要'
sidebar_position: 1
doc_type: 'guide'
---

# ClickHouse Cloud デプロイメントのモニタリング \{#monitoring-your-clickhouse-cloud-deployment\}

## 概要 \{#overview\}

このガイドでは、ClickHouse Cloud の本番デプロイメントにおけるモニタリング機能とオブザーバビリティ機能について、エンタープライズチーム向けに説明します。エンタープライズ顧客からは、標準で利用できるモニタリング機能、Datadog や AWS CloudWatch などを含む既存のオブザーバビリティスタックとの連携、さらに ClickHouse のモニタリングがセルフホスト型デプロイメントと比べてどう違うのかについて、よく質問が寄せられます。

ユーザーは、次の方法で ClickHouse デプロイメントを監視できます。

| セクション                                                         | 説明                                                          | アイドル状態のサービスを起動するか | 必要なセットアップ           |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ----------------- | ------------------- |
| [Cloud コンソールのダッシュボード](/cloud/monitoring/cloud-console)        | サービスの健全性、リソース使用率、クエリパフォーマンスを確認するための組み込みダッシュボードによる日常的なモニタリング | いいえ               | なし                  |
| [通知](/cloud/notifications)                                    | スケーリングイベント、エラー、ミューテーション、請求に関するアラート                          | いいえ               | なし (カスタマイズ可能)       |
| [Prometheus エンドポイント](/integrations/prometheus)                | メトリクスを Grafana、Datadog、またはその他の Prometheus 互換ツールにエクスポート      | いいえ               | API key + スクレイパーの設定 |
| [システムテーブルのクエリ](/cloud/monitoring/system-tables)               | `system` テーブルに対する直接の SQL クエリによる詳細なデバッグとカスタム分析               | はい                | SQL クエリ             |
| [コミュニティおよびパートナー連携](/cloud/monitoring/integrations)            | Datadog agent との連携、コミュニティのモニタリングツール、Billing &amp; Usage API | 場合による             | ツール固有               |
| [高度なダッシュボードのリファレンス](/cloud/manage/monitor/advanced-dashboard) | トラブルシューティングの例を含む、各高度なダッシュボードのビジュアライゼーションに関する詳細なリファレンス       | いいえ               | なし                  |

## クイックスタート \{#quick-start\}

ClickHouse Cloud コンソールを開き、**モニタリング**タブに移動します。この[ブログ](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)では、利用開始時に注意すべき一般的なポイントを紹介しています。

ほとんどのユーザーにとって、[Cloud コンソールのダッシュボード](/cloud/monitoring/cloud-console)には、設定なしでサービスの健全性、リソース使用率、クエリのパフォーマンスをモニタリングするために必要な機能がすべて揃っています。外部のモニタリングスタックと連携する必要がある場合は、[Prometheus互換のメトリクスエンドポイント](/integrations/prometheus)から始めてください。

## システムへの影響に関する考慮事項 \{#system-impact\}

上記のアプローチでは、Prometheus エンドポイントを利用する方法、ClickHouse Cloud によって管理される方法、または[システムテーブルを直接クエリする](/cloud/monitoring/system-tables)方法を組み合わせて使用します。これらのうち最後の方法は、本番環境の ClickHouse サービスをクエリすることに依存しているため、監視対象のシステムにクエリ負荷を追加し、ClickHouse Cloud インスタンスが[アイドル状態に入る](/manage/scaling)のを妨げ、コストに影響する可能性があります。さらに、本番システムで障害が発生すると、両者が密結合しているため、モニタリングにも影響が及ぶ可能性があります。

システムテーブルを直接クエリする方法は、詳細な内部分析やデバッグには有効ですが、リアルタイムの本番モニタリングにはあまり適していません。[Cloud コンソールのダッシュボード](/cloud/monitoring/cloud-console)と[Prometheus エンドポイント](/integrations/prometheus)はいずれも、アイドル状態のサービスを起動しない、あらかじめ収集されたメトリクスを使用するため、継続的な本番モニタリングにより適しています。詳細なシステム分析機能と運用オーバーヘッドの間にある、これらのトレードオフを考慮してください。