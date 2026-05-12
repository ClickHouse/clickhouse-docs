---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: '概要'
title: 'Managed Postgres の監視'
description: 'ClickHouse Managed Postgres の監視とオブザーバビリティのオプションの概要'
keywords: ['managed postgres', '監視', 'オブザーバビリティ', 'メトリクス', 'ダッシュボード', 'prometheus']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres の監視 \{#managed-postgres-monitoring\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-overview" />

Managed Postgres サービスは、以下の
方法で監視できます。

| セクション                                                               | 説明                                                                    | 必要な設定                   |
| ------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| [ダッシュボード](/cloud/managed-postgres/monitoring/dashboard)             | リソース使用量とデータベースアクティビティを確認できる Cloud Console の組み込みチャート                   | なし                      |
| [Prometheus エンドポイント](/cloud/managed-postgres/monitoring/prometheus) | Prometheus、Grafana、Datadog、または OpenMetrics 互換の collector でメトリクスをスクレイプ | API キー + scraper config |
| [メトリクスリファレンス](/cloud/managed-postgres/monitoring/metrics)           | Prometheus エンドポイントで公開されるメトリクスの完全な一覧。型、ラベル、意味を含みます                     | N/A                     |

## クイックスタート \{#quick-start\}

Cloud Console を開き、任意の
Managed Postgres インスタンスの **Monitoring** タブに移動すると、CPU、メモリ、IOPS、
接続数、トランザクション数、キャッシュヒット率、デッドロックのライブチャートを確認できます。設定は不要です。

同じメトリクスを独自の
オブザーバビリティスタックに取り込むには、
[Prometheus エンドポイント](/cloud/managed-postgres/monitoring/prometheus)を使用します。