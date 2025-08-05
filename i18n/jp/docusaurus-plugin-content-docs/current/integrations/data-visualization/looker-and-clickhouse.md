---
sidebar_label: 'Looker'
slug: '/integrations/looker'
keywords:
- 'clickhouse'
- 'looker'
- 'connect'
- 'integrate'
- 'ui'
description: 'Looker is an enterprise platform for BI, data applications, and embedded
  analytics that helps you explore and share insights in real time.'
title: 'Looker'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker

<CommunityMaintainedBadge/>

Lookerは、公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミスの展開に接続できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

管理者 -> データベース -> 接続に移動し、右上の「接続を追加」ボタンをクリックします。

<Image size="md" img={looker_01} alt="Lookerのデータベース管理インターフェースに新しい接続を追加" border />
<br/>

データソースの名前を選択し、ダイアレクトのドロップダウンから`ClickHouse`を選択します。フォームに資格情報を入力します。

<Image size="md" img={looker_02} alt="Looker接続フォームにClickHouseの資格情報を指定" border />
<br/>

ClickHouse Cloudを使用している場合や、デプロイがSSLを必要とする場合は、追加設定でSSLがオンになっていることを確認してください。

<Image size="md" img={looker_03} alt="Looker設定でClickHouse接続のためにSSLを有効にする" border />
<br/>

まず接続をテストし、完了したら新しいClickHouseデータソースに接続します。

<Image size="md" img={looker_04} alt="ClickHouseデータソースをテストして接続" border />
<br/>

これで、ClickHouseデータソースをLookerプロジェクトに接続できるようになるはずです。

## 3. 既知の制限 {#3-known-limitations}

1. 次のデータ型はデフォルトで文字列として扱われます：
   * Array - JDBCドライバの制限により、シリアル化が期待通りに機能しません
   * Decimal* - モデル内で数値に変更可能です
   * LowCardinality(...) - モデル内で適切な型に変更可能です
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geoタイプ
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [対称集約機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)はサポートされていません
3. [フル外部結合](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)はまだドライバに実装されていません
