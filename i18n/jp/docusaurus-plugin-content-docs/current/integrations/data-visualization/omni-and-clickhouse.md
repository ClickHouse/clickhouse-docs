---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni は、BI、データアプリケーション、組み込みアナリティクス向けのエンタープライズ向けプラットフォームで、リアルタイムにインサイトを探索し共有することを可能にします。'
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

# Omni {#omni}

<PartnerBadge/>

Omniは、公式の ClickHouse データソースを介して ClickHouse Cloud またはオンプレミス環境に接続できます。

## 1. 接続情報を準備する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouse データソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Connections に移動し、画面右上の「Add Connection」ボタンをクリックします。

<Image size="lg" img={omni_01} alt="Connections セクションで Add Connection ボタンが表示されている Omni の管理インターフェース" border />

<br/>

`ClickHouse` を選択し、フォームに認証情報を入力します。

<Image size="lg" img={omni_02} alt="ClickHouse 用の認証情報フォームフィールドが表示されている Omni の接続設定インターフェース" border />

<br/>

これで Omni から ClickHouse のデータをクエリして可視化できるようになります。