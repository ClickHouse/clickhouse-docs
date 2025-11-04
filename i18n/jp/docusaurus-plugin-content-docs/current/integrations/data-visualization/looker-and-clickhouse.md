---
'sidebar_label': 'Looker'
'slug': '/integrations/looker'
'keywords':
- 'clickhouse'
- 'looker'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Lookerは、BI、データアプリケーション、および組み込み分析のためのエンタープライズプラットフォームであり、リアルタイムで洞察を探求し共有するのに役立ちます。'
'title': 'Looker'
'doc_type': 'guide'
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

Lookerは、公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミス展開に接続できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Database -> Connectionsに移動し、右上の「Add Connection」ボタンをクリックします。

<Image size="md" img={looker_01} alt="Lookerのデータベース管理インターフェースで新しい接続を追加する" border />
<br/>

データソースの名前を選択し、ダイアレクトのドロップダウンから`ClickHouse`を選択します。フォームにあなたの資格情報を入力してください。

<Image size="md" img={looker_02} alt="Looker接続フォームでのClickHouseの資格情報の指定" border />
<br/>

ClickHouse Cloudを使用している場合や、デプロイメントでSSLが必要な場合は、追加設定でSSLをオンにしてください。

<Image size="md" img={looker_03} alt="Looker設定でのClickHouse接続のためのSSLを有効にする" border />
<br/>

最初に接続テストを行い、完了したら、新しいClickHouseデータソースに接続します。

<Image size="md" img={looker_04} alt="ClickHouseデータソースのテストと接続" border />
<br/>

これで、LookerプロジェクトにClickHouseデータソースを添付できるようになるはずです。

## 3. 既知の制限事項 {#3-known-limitations}

1. 次のデータ型はデフォルトで文字列として処理されます：
   * Array - JDBCドライバの制限によりシリアル化が期待通りに動作しません
   * Decimal* - モデル内で数値に変更できます
   * LowCardinality(...) - モデル内で適切な型に変更できます
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo types
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [対称集約機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)はサポートされていません
3. [完全外部結合](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)はまだドライバで実装されていません
