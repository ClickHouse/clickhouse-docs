---
sidebar_label: 'Easypanel'
slug: /integrations/easypanel
keywords: ['clickhouse', 'Easypanel', 'deployment', 'integrate', 'install']
description: '自身が管理するサーバーに ClickHouse をデプロイすることができます。'
title: 'Easypanel で ClickHouse をデプロイする'
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Easypanel を使った ClickHouse のデプロイ

<CommunityMaintainedBadge/>

[Easypanel](https://easypanel.io) は、モダンなサーバー管理パネルです。Easypanel を使うことで、自身のサーバー上に ClickHouse をデプロイできます。

[![Easypanel にデプロイ](https://easypanel.io/img/deploy-on-easypanel-40.svg)](https://easypanel.io/docs/templates/clickhouse)



## 手順 {#instructions}

1. クラウドプロバイダー上でUbuntuを実行する仮想マシンを作成します。
2. Webサイトの手順に従ってEasypanelをインストールします。
3. 新しいプロジェクトを作成します。
4. 専用テンプレートを使用してClickHouseをインストールします。
