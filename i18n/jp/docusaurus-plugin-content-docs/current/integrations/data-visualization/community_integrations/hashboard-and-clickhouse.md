---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard は堅牢な分析プラットフォームであり、ClickHouse と簡単に統合してリアルタイムにデータ分析を行えます。'
title: 'ClickHouse を Hashboard に接続する'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse を Hashboard と接続する

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) は、組織内の誰もがメトリクスを追跡し、行動につながるインサイトを発見できるようにするインタラクティブなデータ探索ツールです。Hashboard は ClickHouse データベースに対してリアルタイムの SQL クエリを発行し、セルフサービス型のアドホックなデータ探索に特に有用です。

<Image size="md" img={hashboard_01} alt="インタラクティブなクエリビルダーと可視化を表示している Hashboard データエクスプローラーのインターフェース" border />

<br/>

このガイドでは、Hashboard を ClickHouse インスタンスに接続する手順を説明します。この情報は Hashboard の [ClickHouse 連携ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse) にも掲載されています。



## 前提条件 {#pre-requisites}

- 自社インフラストラクチャまたは[ClickHouse Cloud](https://clickhouse.com/)上でホストされているClickHouseデータベース
- [Hashboardアカウント](https://hashboard.com/getAccess)とプロジェクト


## HashboardをClickHouseに接続する手順 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Hashboardで新しいデータベース接続を追加する {#2-add-a-new-database-connection-in-hashboard}

1. [Hashboardプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーの歯車アイコンをクリックして設定ページを開きます。
3. `+ New Database Connection`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 先ほど収集した情報を使用して、**Connection Name**、**Host**、**Port**、**Username**、**Password**、**Database**の各フィールドに入力します。
6. 「Test」をクリックして、接続が正常に構成されていることを確認します。
7. 「Add」をクリックします。

これでClickHouseデータベースがHashboardに接続されました。[Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations)、[Metrics](https://docs.hashboard.com/docs/metrics)、[Dashboards](https://docs.hashboard.com/docs/dashboards)の構築を進めることができます。これらの機能の詳細については、対応するHashboardのドキュメントを参照してください。


## さらに詳しく {#learn-more}

より高度な機能やトラブルシューティングについては、[Hashboardのドキュメント](https://docs.hashboard.com/)を参照してください。
