---
'sidebar_label': 'Hashboard'
'sidebar_position': 132
'slug': '/integrations/hashboard'
'keywords':
- 'clickhouse'
- 'Hashboard'
- 'connect'
- 'integrate'
- 'ui'
- 'analytics'
'description': 'Hashboard is a robust analytics platform that can be easily integrated
  with ClickHouse for real-time data analysis.'
'title': 'Connecting ClickHouse to Hashboard'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouseをHashboardに接続する

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) は、組織内の誰もがメトリクスを追跡し、実用的な洞察を発見できるインタラクティブなデータ探索ツールです。Hashboardは、ClickHouseデータベースに対してリアルタイムSQLクエリを発行し、自己サービスのadhocデータ探索に特に役立ちます。

<Image size="md" img={hashboard_01} alt="インタラクティブなクエリビルダーと視覚化を表示するHashboardデータエクスプローラーインターフェース" border />

<br/>

このガイドでは、HashboardをClickHouseインスタンスに接続する手順を説明します。この情報は、Hashboardの[ClickHouse統合ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse)にも掲載されています。

## 前提条件 {#pre-requisites}

- 自身のインフラ上にホストされたClickHouseデータベース、または[ClickHouse Cloud](https://clickhouse.com/)。
- [Hashboardアカウント](https://hashboard.com/getAccess)およびプロジェクト。

## HashboardをClickHouseに接続する手順 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 接続詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Hashboardに新しいデータベース接続を追加する {#2-add-a-new-database-connection-in-hashboard}

1. [Hashboardプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーのギアアイコンをクリックして設定ページを開きます。
3. `+ 新しいデータベース接続`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 収集した情報を基に**接続名**、**ホスト**、**ポート**、**ユーザー名**、**パスワード**、**データベース**フィールドを入力します。
6. 「テスト」をクリックして接続が正しく設定されていることを確認します。
7. 「追加」をクリックします。

これで、ClickHouseデータベースがHashboardに接続され、[データモデル](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[メトリクス](https://docs.hashboard.com/docs/metrics)、および[ダッシュボード](https://docs.hashboard.com/docs/dashboards)を構築することができます。これらの機能に関する詳細は、対応するHashboardのドキュメントを参照してください。

## 詳細を学ぶ {#learn-more}

より高度な機能やトラブルシューティングについては、[Hashboardのドキュメント](https://docs.hashboard.com/)を訪れてください。
