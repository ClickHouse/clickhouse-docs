---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: '/integrations/deepnote'
keywords:
- 'clickhouse'
- 'Deepnote'
- 'connect'
- 'integrate'
- 'notebook'
description: 'Efficiently query very large datasets, analyzing and modeling in the
  comfort of known notebook environment.'
title: 'Connect ClickHouse to Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Connect ClickHouse to Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームが洞察を発見し共有するために構築された共同作業型データノートブックです。Jupyter互換であるだけでなく、クラウド上で動作し、データサイエンスプロジェクトに効率的に取り組むための中央の作業スペースを提供します。

このガイドは、すでにDeepnoteアカウントをお持ちで、稼働中のClickHouseインスタンスがあることを前提としています。

## Interactive example {#interactive-example}
DeepnoteのデータノートブックからClickHouseをクエリするインタラクティブな例を探索したい場合は、以下のボタンをクリックして、[ClickHouse playground](../../getting-started/playground.md)に接続されたテンプレートプロジェクトを起動してください。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Launch in Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Connect to ClickHouse {#connect-to-clickhouse}

1. Deepnote内で、「Integrations」概要を選択し、ClickHouseタイルをクリックします。

<Image size="lg" img={deepnote_01} alt="ClickHouse integration tile" border />

2. ClickHouseインスタンスの接続詳細を提供します：
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse details dialog" border />

   **_注意:_** ClickHouseへの接続がIPアクセスリストで保護されている場合、DeepnoteのIPアドレスを許可する必要があります。詳細は[Deepnoteのドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)をお読みください。

3. おめでとうございます！これでClickHouseがDeepnoteに統合されました。

## Using ClickHouse integration. {#using-clickhouse-integration}

1. まず、ノートブックの右側でClickHouse統合に接続します。

   <Image size="lg" img={deepnote_03} alt="ClickHouse details dialog" border />

2. 次に、新しいClickHouseクエリブロックを作成し、データベースをクエリします。クエリ結果はDataFrameとして保存され、SQLブロックで指定された変数に格納されます。
3. 既存の[SQLブロック](https://docs.deepnote.com/features/sql-cells)をClickHouseブロックに変換することもできます。
