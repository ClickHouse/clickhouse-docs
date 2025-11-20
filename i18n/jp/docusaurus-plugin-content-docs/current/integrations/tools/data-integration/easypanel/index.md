---
sidebar_label: 'Easypanel'
slug: /integrations/easypanel
keywords: ['clickhouse', 'Easypanel', 'deployment', 'integrate', 'install']
description: 'ClickHouse を自前のサーバーにデプロイするために使用できます。'
title: 'Easypanel での ClickHouse デプロイ'
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Easypanel への ClickHouse のデプロイ

<CommunityMaintainedBadge/>

[Easypanel](https://easypanel.io) はモダンなサーバーコントロールパネルです。これを使って自前のサーバーに ClickHouse をデプロイできます。

[![Deploy to Easypanel](https://easypanel.io/img/deploy-on-easypanel-40.svg)](https://easypanel.io/docs/templates/clickhouse)



## 手順 {#instructions}

1. クラウドプロバイダー上でUbuntuを実行する仮想マシンを作成します。
2. Webサイトの手順に従ってEasypanelをインストールします。
3. 新しいプロジェクトを作成します。
4. 専用テンプレートを使用してClickHouseをインストールします。
