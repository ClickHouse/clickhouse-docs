---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker は、BI、データアプリケーション、埋め込み分析のためのエンタープライズ向けプラットフォームであり、リアルタイムでインサイトの探索と共有を行うのに役立ちます。'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker {#looker}

<PartnerBadge/>

Looker は公式の ClickHouse データソースを通じて、ClickHouse Cloud またはオンプレミス環境の ClickHouse デプロイメントに接続できます。



## 1. 接続情報を確認する {#1-gather-your-connection-details}
<ConnectionDetails />



## 2. ClickHouse データソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Database -> Connections ページに移動し、右上の「Add Connection」ボタンをクリックします。

<Image size="md" img={looker_01} alt="Looker のデータベース管理インターフェースで新しい接続を追加する画面" border />
<br/>

データソースの名前を指定し、dialect のドロップダウンから `ClickHouse` を選択します。フォームに認証情報を入力します。

<Image size="md" img={looker_02} alt="Looker の接続フォームで ClickHouse の認証情報を指定する画面" border />
<br/>

ClickHouse Cloud を使用している場合、またはデプロイメントで SSL が必要な構成になっている場合は、追加設定で SSL が有効になっていることを確認します。

<Image size="md" img={looker_03} alt="Looker の設定で ClickHouse 接続に対して SSL を有効化する画面" border />
<br/>

最初に接続テストを行い、完了したら新しい ClickHouse データソースに接続します。

<Image size="md" img={looker_04} alt="ClickHouse データソースへの接続をテストして確立する画面" border />
<br/>

これで、Looker プロジェクトに ClickHouse データソースを関連付けられるようになります。



## 3. 既知の制限事項 {#3-known-limitations}

1. 次のデータ型は、デフォルトで文字列として扱われます:
   * Array - JDBC ドライバーの制限により、シリアル化が期待どおりに動作しません
   * Decimal* - モデル内で number 型に変更できます
   * LowCardinality(...) - モデル内で適切な型に変更できます
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo 型
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Symmetric aggregate 機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) はサポートされていません
3. [Full outer join](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) はドライバーでまだ実装されていません
