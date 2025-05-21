---
sidebar_label: 'ハッシュボード'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'ハッシュボード', '接続', '統合', 'ui', '分析']
description: 'ハッシュボードは、リアルタイムデータ分析のためにClickHouseと簡単に統合できる堅牢な分析プラットフォームです。'
title: 'ClickHouseをハッシュボードに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseをハッシュボードに接続する

<CommunityMaintainedBadge/>

[ハッシュボード](https://hashboard.com)は、組織内の誰もが指標を追跡し、実用的な洞察を発見することを可能にするインタラクティブなデータ探索ツールです。ハッシュボードは、あなたのClickHouseデータベースに対してライブクエリを発行し、セルフサービスのアドホックデータ探索のユースケースに特に役立ちます。

<Image size="md" img={hashboard_01} alt="ハッシュボードのデータエクスプローラーインターフェースで表示されているインタラクティブクエリビルダーとビジュアライゼーション" border />

<br/>

このガイドでは、ハッシュボードとあなたのClickHouseインスタンスを接続する手順を説明します。この情報はハッシュボードの[ClickHouse統合ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse)でも入手できます。

## 前提条件 {#pre-requisites}

- あなた自身のインフラストラクチャ上、または[ClickHouse Cloud](https://clickhouse.com/)にホストされているClickHouseデータベース。
- [ハッシュボードアカウント](https://hashboard.com/getAccess)およびプロジェクト。

## ハッシュボードをClickHouseに接続する手順 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 接続詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. ハッシュボードに新しいデータベース接続を追加する {#2-add-a-new-database-connection-in-hashboard}

1. あなたの[ハッシュボードプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーのギアアイコンをクリックして設定ページを開きます。
3. `+ 新しいデータベース接続`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 以前に収集した情報を使用して、**接続名**、**ホスト**、**ポート**、**ユーザー名**、**パスワード**、および**データベース**フィールドを入力します。
6. "テスト"をクリックして、接続が正常に構成されていることを確認します。
7. "追加"をクリックします。

あなたのClickHouseデータベースはハッシュボードに接続され、[データモデル](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[指標](https://docs.hashboard.com/docs/metrics)、および[ダッシュボード](https://docs.hashboard.com/docs/dashboards)の構築を続けることができます。これらの機能に関する詳細は対応するハッシュボードのドキュメントを参照してください。

## 詳しく学ぶ {#learn-more}

高度な機能やトラブルシューティングについては、[ハッシュボードのドキュメント](https://docs.hashboard.com/)を訪れてください。
