---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker は、BI、データアプリケーション、組み込みアナリティクス向けのエンタープライズプラットフォームで、リアルタイムにインサイトを探索および共有することを可能にします。'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker

<PartnerBadge/>

Looker は、公式の ClickHouse データソースを介して ClickHouse Cloud またはオンプレミスの ClickHouse 環境に接続できます。



## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouseデータソースの作成 {#2-create-a-clickhouse-data-source}

Admin -> Database -> Connectionsに移動し、右上隅の「Add Connection」ボタンをクリックします。

<Image
  size='md'
  img={looker_01}
  alt="Lookerのデータベース管理インターフェースで新しい接続を追加"
  border
/>
<br />

データソースの名前を選択し、dialectドロップダウンから`ClickHouse`を選択します。フォームに認証情報を入力します。

<Image
  size='md'
  img={looker_02}
  alt='Looker接続フォームでClickHouse認証情報を指定'
  border
/>
<br />

ClickHouse Cloudを使用している場合、またはデプロイメントでSSLが必要な場合は、追加設定でSSLが有効になっていることを確認してください。

<Image
  size='md'
  img={looker_03}
  alt='Looker設定でClickHouse接続のSSLを有効化'
  border
/>
<br />

まず接続をテストし、完了したら新しいClickHouseデータソースに接続します。

<Image
  size='md'
  img={looker_04}
  alt='ClickHouseデータソースのテストと接続'
  border
/>
<br />

これでClickHouseデータソースをLookerプロジェクトにアタッチできるようになります。


## 3. 既知の制限事項 {#3-known-limitations}

1. 以下のデータ型はデフォルトで文字列として処理されます：
   - Array - JDBCドライバの制限により、シリアライゼーションが正常に動作しません
   - Decimal\* - モデル内で数値型に変更できます
   - LowCardinality(...) - モデル内で適切な型に変更できます
   - Enum8, Enum16
   - UUID
   - Tuple
   - Map
   - JSON
   - Nested
   - FixedString
   - Geo types
     - MultiPolygon
     - Polygon
     - Point
     - Ring
2. [対称集約機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)はサポートされていません
3. [完全外部結合](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)はドライバにまだ実装されていません
