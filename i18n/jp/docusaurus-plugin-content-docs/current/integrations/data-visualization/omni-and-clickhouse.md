---
sidebar_label: 'Omni'
slug: '/integrations/omni'
keywords:
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
description: 'Omniは、BI、データアプリケーション、組み込みアナリティクス向けのエンタープライズプラットフォームであり、リアルタイムで洞察を探索し共有するのに役立ちます。'
title: 'Omni'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omniは、公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続情報を集める {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

「Admin」->「Connections」に移動し、右上隅の「Add Connection」ボタンをクリックします。

<Image size="lg" img={omni_01} alt="Omniの管理インターフェースで、ConnectionsセクションのAdd Connectionボタンを表示" border />
<br/>

`ClickHouse`を選択します。フォームに認証情報を入力します。

<Image size="lg" img={omni_02} alt="ClickHouse用のOmni接続設定インターフェースで、認証情報フォームフィールドを表示" border />
<br/>

これで、OmniでClickHouseからデータをクエリおよび視覚化できるようになります。
