---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['ClickHouse', 'Omni', '接続', '統合', 'UI']
description: 'Omni は、BI、データアプリケーション、組み込み分析のためのエンタープライズプラットフォームであり、リアルタイムでインサイトを探索・共有できます。'
title: 'Omni'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

<PartnerBadge />

Omni は、公式の ClickHouse データソースを通じて、ClickHouse Cloud またはオンプレミス環境にデプロイした ClickHouse に接続できます。

## 1. 接続情報を確認する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse データソースを作成する \{#2-create-a-clickhouse-data-source\}

Admin -&gt; Connections に移動し、右上にある「Add Connection」ボタンをクリックします。

<Image size="lg" img={omni_01} alt="Connections セクションで Add Connection ボタンを示す Omni の管理インターフェイス" border />

<br />

`ClickHouse` を選択し、フォームに認証情報を入力します。

<Image size="lg" img={omni_02} alt="認証情報の入力フィールドを表示する ClickHouse 用の Omni 接続設定インターフェイス" border />

<br />

これで、Omni から ClickHouse のデータをクエリして可視化できるようになります。