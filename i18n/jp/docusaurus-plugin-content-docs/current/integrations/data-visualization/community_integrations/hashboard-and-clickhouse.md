---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard は、ClickHouse と容易に統合でき、リアルタイムでのデータ分析を行える堅牢なアナリティクスプラットフォームです。'
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

# ClickHouse を Hashboard に接続する \{#connecting-clickhouse-to-hashboard\}

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) は、組織内の誰でもメトリクスを追跡し、実行可能なインサイトを発見できるインタラクティブなデータ探索ツールです。Hashboard は ClickHouse データベースに対してライブの SQL クエリを発行し、セルフサービス型のアドホックなデータ探索に特に役立ちます。

<Image size="md" img={hashboard_01} alt="インタラクティブなクエリビルダーと可視化を表示している Hashboard のデータエクスプローラーインターフェース" border />

<br/>

このガイドでは、Hashboard を ClickHouse インスタンスに接続する手順を順を追って説明します。この情報は Hashboard の [ClickHouse 連携ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse) にも掲載されています。

## 前提条件 \\{#pre-requisites\\}

- 自前のインフラストラクチャ上、または [ClickHouse Cloud](https://clickhouse.com/) 上でホストされている ClickHouse データベース。
- [Hashboard のアカウント](https://hashboard.com/getAccess)とプロジェクト。

## Hashboard を ClickHouse に接続する手順 \\{#steps-to-connect-hashboard-to-clickhouse\\}

### 1. 接続情報を収集する \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

### 2. Hashboard に新しいデータベース接続を追加する \\{#2-add-a-new-database-connection-in-hashboard\\}

1. [Hashboard プロジェクト](https://hashboard.com/app) に移動します。
2. サイドナビゲーションバーの歯車アイコンをクリックして、Settings ページを開きます。
3. `+ New Database Connection` をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 先ほど収集した情報を使って、**Connection Name**、**Host**、**Port**、**Username**、**Password**、**Database** フィールドを入力します。
6. `Test` をクリックして、接続が正しく構成されていることを確認します。
7. `Add` をクリックします。

これで ClickHouse データベースが Hashboard に接続され、[Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations)、[Metrics](https://docs.hashboard.com/docs/metrics)、[Dashboards](https://docs.hashboard.com/docs/dashboards) の作成に進むことができます。これらの機能の詳細については、対応する Hashboard ドキュメントを参照してください。

## 詳細情報 \\{#learn-more\\}

高度な機能やトラブルシューティングの詳細については、[Hashboard のドキュメント](https://docs.hashboard.com/)を参照してください。