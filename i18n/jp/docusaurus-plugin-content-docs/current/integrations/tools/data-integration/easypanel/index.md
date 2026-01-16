---
sidebar_label: 'Easypanel'
slug: /integrations/easypanel
keywords: ['clickhouse', 'Easypanel', 'デプロイメント', '連携', 'インストール']
description: 'Easypanel を使用して自前のサーバー上に ClickHouse をデプロイできます。'
title: 'Easypanel で ClickHouse をデプロイする'
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Easypanel への ClickHouse のデプロイ \\{#deploying-clickhouse-on-easypanel\\}

<CommunityMaintainedBadge/>

[Easypanel](https://easypanel.io) はモダンなサーバーコントロールパネルです。これを利用して自身のサーバー上に ClickHouse をデプロイできます。

[![Deploy to Easypanel](https://easypanel.io/img/deploy-on-easypanel-40.svg)](https://easypanel.io/docs/templates/clickhouse)

## 手順 \\{#instructions\\}

1. クラウドプロバイダー上で Ubuntu が動作する VM を作成します。
2. Web サイトの手順に従って Easypanel をインストールします。
3. 新しいプロジェクトを作成します。
4. 専用のテンプレートを使用して ClickHouse をインストールします。
