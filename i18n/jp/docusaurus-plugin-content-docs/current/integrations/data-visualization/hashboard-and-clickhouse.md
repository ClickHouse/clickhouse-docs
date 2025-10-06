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
'description': 'Hashboardは、リアルタイムデータ分析のためにClickHouseと簡単に統合できる堅牢な分析プラットフォームです。'
'title': 'ClickHouseをHashboardに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting ClickHouse to Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) は、組織内の誰もがメトリクスを追跡し、実用的なインサイトを発見できるインタラクティブなデータ探索ツールです。Hashboardは、あなたのClickHouseデータベースにライブSQLクエリを発行し、自己サービスでのアドホックデータ探索のユースケースに特に役立ちます。

<Image size="md" img={hashboard_01} alt="Hashboardのデータエクスプローライターフェース、インタラクティブなクエリビルダーとビジュアライゼーションを表示" border />

<br/>

このガイドでは、HashboardとあなたのClickHouseインスタンスを接続する手順を説明します。この情報は、Hashboardの[ClickHouse統合ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse)でも入手できます。

## Pre-requisites {#pre-requisites}

- 自分のインフラストラクチャ上または[ClickHouse Cloud](https://clickhouse.com/)上にホストされたClickHouseデータベース。
- [Hashboardアカウント](https://hashboard.com/getAccess)とプロジェクト。

## Steps to connect Hashboard to ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Add a new database connection in Hashboard {#2-add-a-new-database-connection-in-hashboard}

1. あなたの[Hashboardプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーの歯車アイコンをクリックして設定ページを開きます。
3. `+ New Database Connection`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 先ほど集めた情報を使用して、**Connection Name**、**Host**、**Port**、**Username**、**Password**、および**Database**フィールドに入力します。
6. 「テスト」をクリックして接続が正しく構成されていることを確認します。
7. 「追加」をクリックします。

あなたのClickHouseデータベースは現在Hashboardに接続されており、[データモデル](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[エクスプロレーション](https://docs.hashboard.com/docs/visualizing-data/explorations)、[メトリクス](https://docs.hashboard.com/docs/metrics)、および[ダッシュボード](https://docs.hashboard.com/docs/dashboards)の作成を進めることができます。これらの機能の詳細については、関連するHashboardのドキュメントをご覧ください。

## Learn more {#learn-more}

より高度な機能やトラブルシューティングについては、[Hashboardのドキュメント](https://docs.hashboard.com/)をご覧ください。
