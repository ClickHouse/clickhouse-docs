---
slug: /cloud/managed-postgres/monitoring/dashboard
sidebar_label: 'ダッシュボード'
title: 'Managed Postgres の監視ダッシュボード'
description: 'Managed Postgres サービス向けの Cloud Console 組み込みダッシュボード'
keywords: ['Managed Postgres', '監視', 'ダッシュボード', 'Cloud Console', 'cpu', 'メモリ', 'iops']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import dashboard from '@site/static/images/managed-postgres/monitoring/dashboard.png';

# 監視ダッシュボード \{#monitoring-dashboard\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-dashboard" />

インスタンスの左側のサイドバーにある **監視** タブには、選択した期間の
リソース使用状況とデータベースアクティビティをリアルタイムで示すチャートが
表示されます。

<Image img={dashboard} alt="IOPS、CPU 使用率、メモリ、ディスク、ネットワークトラフィック、データベースサイズ、接続、処理量、トランザクション、キャッシュヒット率、デッドロックを表示する監視ダッシュボード" size="lg" border />

## パネル \{#panels\}

ダッシュボードでは、メトリクスは次のパネルにグループ化されています。

* **IOPS** — 1秒あたりのディスク読み取り・書き込み操作数
* **CPU usage** — `user`、`system`、`iowait`、`softirq`、
  `steal` ごとの内訳
* **Memory usage** — 使用メモリ、キャッシュ、バッファの合計が
  全体に占める割合
* **Disk usage** — サービスに割り当てられたストレージ容量に対する、
  使用済みファイルシステム領域の割合
* **Network traffic** — 受信および送信されたバイト数
* **Database size** — データベースごとのバイト数 (デフォルトの `postgres`
  およびユーザーが作成したすべてのデータベースを含む)
* **Connection count** — アクティブおよびアイドル状態の接続数
* **Operation throughput** — 1秒あたりの fetches、inserts、updates、deletes
* **Transactions** — 1秒あたりのコミットおよびロールバック数
* **Cache hit ratio** — ディスクではなくバッファキャッシュから
  提供されたブロック読み取りの割合
* **Deadlocks** — サーバーによって検出されたデッドロック

## 期間 \{#time-period\}

**期間** セレクターを使用して、過去1時間、1日、1週間、またはカスタムの期間に切り替えます。

## 関連ページ \{#related\}

* [Prometheus エンドポイント](/cloud/managed-postgres/monitoring/prometheus) — 同じメトリクスを独自のオブザーバビリティスタックにスクレイピングする方法
* [メトリクスリファレンス](/cloud/managed-postgres/monitoring/metrics) — 型とラベルを含むメトリクスの完全な一覧