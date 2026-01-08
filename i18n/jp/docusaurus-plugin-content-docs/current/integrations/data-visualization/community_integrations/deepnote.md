---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: '慣れ親しんだノートブック環境のまま、非常に大きなデータセットを効率的にクエリし、分析とモデリングを行えます。'
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

# ClickHouse を Deepnote に接続する {#connect-clickhouse-to-deepnote}

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> は、チームがインサイトを発見・共有するために構築された、チーム向けのコラボレーション型データノートブックです。Jupyter 互換であることに加えて、クラウド上で動作し、データサイエンスプロジェクトに効率的に共同で取り組むための一元的なコラボレーション環境を提供します。

このガイドでは、Deepnote のアカウントと稼働中の ClickHouse インスタンスが既に用意されていることを前提とします。

## インタラクティブな例 {#interactive-example}

Deepnote のデータノートブックから ClickHouse に対してクエリを実行するインタラクティブな例を試したい場合は、下のボタンをクリックして、[ClickHouse playground](../../../getting-started/playground.md) と接続されたテンプレートプロジェクトを起動してください。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnote で起動" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouse に接続する {#connect-to-clickhouse}

1. Deepnote 内で「Integrations」画面を開き、ClickHouse のタイルをクリックします。

<Image size="lg" img={deepnote_01} alt="ClickHouse インテグレーションのタイル" border />

2. ClickHouse インスタンスへの接続情報を入力します。

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="ClickHouse 接続詳細ダイアログ" border />

**_NOTE:_** ClickHouse への接続が IP アクセスリストで保護されている場合、Deepnote の IP アドレスを許可する必要があります。詳細は [Deepnote のドキュメント](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses) を参照してください。

3. 以上で、ClickHouse と Deepnote の連携が完了しました。

## ClickHouse 連携を使用する {#using-clickhouse-integration}

1. まず、ノートブック右側の ClickHouse 連携に接続します。

   <Image size="lg" img={deepnote_03} alt="ClickHouse の詳細ダイアログ" border />

2. 次に、新しい ClickHouse クエリブロックを作成してデータベースにクエリを実行します。クエリ結果は DataFrame として保存され、SQL ブロック内で指定した変数に格納されます。
3. 既存の [SQL ブロック](https://docs.deepnote.com/features/sql-cells) を ClickHouse ブロックに変換することもできます。