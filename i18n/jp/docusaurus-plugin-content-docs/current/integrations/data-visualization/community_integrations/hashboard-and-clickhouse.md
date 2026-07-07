---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', '接続', '統合', 'UI', '分析']
description: 'Hashboard は、ClickHouse と簡単に統合してリアルタイム分析を行える高機能な分析プラットフォームです。'
title: 'ClickHouse を Hashboard に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

[Hashboard](https://hashboard.com) は、組織内の誰もがメトリクスを追跡し、実用的なインサイトを得られる対話型データ探索ツールです。Hashboard は ClickHouse データベースに対してリアルタイムで SQL クエリを発行し、セルフサービスによるアドホックなデータ探索の用途に特に適しています。

<Image size="md" img={hashboard_01} alt="対話型クエリビルダーと可視化を表示する Hashboard データエクスプローラーのインターフェイス" border />

<br />

このガイドでは、Hashboard を ClickHouse インスタンスに接続する手順を説明します。これらの情報は、Hashboard の [ClickHouse 連携ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse) でも参照できます。

## 前提条件 \{#pre-requisites\}

* 自社のインフラストラクチャ上、または [ClickHouse Cloud](https://clickhouse.com/) でホストされている ClickHouse データベース。
* [Hashboard アカウント](https://hashboard.com/getAccess) とプロジェクト。

## Hashboard を ClickHouse に接続する手順 \{#steps-to-connect-hashboard-to-clickhouse\}

### 1. 接続情報を確認する \{#1-gather-your-connection-details\}

<ConnectionDetails />

### 2. Hashboard で新しいデータベース接続を追加する \{#2-add-a-new-database-connection-in-hashboard\}

1. [Hashboard プロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーの歯車アイコンをクリックして、Settings ページを開きます。
3. `+ New Database Connection` をクリックします。
4. モーダルで &quot;ClickHouse&quot; を選択します。
5. 先ほど収集した情報を使って、**Connection Name**、**Host**、**Port**、**Username**、**Password**、**Database** の各フィールドに入力します。
6. &quot;Test&quot; をクリックして、接続が正しく設定されていることを確認します。
7. &quot;Add&quot; をクリックします

これで ClickHouse データベースが Hashboard に接続され、[Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations)、[Metrics](https://docs.hashboard.com/docs/metrics)、[Dashboards](https://docs.hashboard.com/docs/dashboards) の作成に進めます。これらの機能の詳細については、該当する Hashboard のドキュメントを参照してください。

## 詳細情報 \{#learn-more\}

より高度な機能やトラブルシューティングについては、[Hashboard のドキュメント](https://docs.hashboard.com/)を参照してください。