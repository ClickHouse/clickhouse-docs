---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['ClickHouse', 'Deepnote', '接続', '統合', 'ノートブック']
description: '使い慣れたノートブック環境で、非常に大規模なデータセットを効率的にクエリし、分析やモデリングを行えます。'
title: 'ClickHouse を Deepnote に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームでインサイトを見つけて共有するためのコラボレーション型データノートブックです。Jupyter と互換性があるだけでなく、Cloud 上で動作し、データサイエンスプロジェクトで効率的に共同作業を進めるための一元的な作業環境を提供します。

このガイドでは、Deepnote アカウントをすでに所有しており、稼働中の ClickHouse インスタンスがあることを前提としています。

## インタラクティブな例 \{#interactive-example\}

Deepnote のデータノートブックから ClickHouse にクエリを実行するインタラクティブな例を試すには、以下のボタンをクリックして、[ClickHouse Playground](../../../getting-started/playground.md) に接続されたテンプレートプロジェクトを起動してください。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnote で起動" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouse に接続する \{#connect-to-clickhouse\}

1. Deepnote で「Integrations」の概要ページを開き、ClickHouse のタイルをクリックします。

<Image size="lg" img={deepnote_01} alt="ClickHouse 連携タイル" border />

2. ClickHouse インスタンスの接続情報を入力します。

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="ClickHouse 詳細ダイアログ" border />

***注:*** ClickHouse への接続が IP Access List で保護されている場合は、Deepnote の IP アドレスを許可する必要があることがあります。詳細は [Deepnote のドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)を参照してください。

3. これで、ClickHouse と Deepnote の連携は完了です。

## ClickHouse 連携を使用する \{#using-clickhouse-integration\}

1. まず、ノートブックの右側にある ClickHouse 連携に接続します。

   <Image size="lg" img={deepnote_03} alt="ClickHouse の詳細ダイアログ" border />

2. 次に、新しい ClickHouse クエリブロックを作成し、データベースに対してクエリを実行します。クエリ結果は DataFrame として保存され、SQL ブロックで指定した変数に格納されます。

3. 既存の [SQL ブロック](https://docs.deepnote.com/features/sql-cells)を ClickHouse ブロックに変換することもできます。