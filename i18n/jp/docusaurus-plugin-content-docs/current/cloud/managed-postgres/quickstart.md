---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'クイックスタート'
title: 'クイックスタート'
description: '初めての Managed Postgres データベースを作成し、インスタンス ダッシュボードを確認します'
keywords: ['managed postgres', 'クイックスタート', 'はじめに', 'データベースの作成']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />


## データベースを作成する \{#create-database\}

新しい Managed Postgres データベースを作成するには、Cloud Console のサイドバーで PostgreSQL オプションを選択します。

{/* TODO(kaushik-ubi): Cloud Console サイドバーで PostgreSQL オプションがハイライトされたスクリーンショット
    Path: /static/images/cloud/managed-postgres/console-sidebar.png */}

**New PostgreSQL database** をクリックして設定ページを開きます。データベースサーバーの名前を入力し、ワークロード要件に応じてインスタンスタイプを選択します。安全なパスワードが自動的に生成されます。

{/* TODO(kaushik-ubi): データベース作成フォームのスクリーンショット
    Path: /static/images/cloud/managed-postgres/create-database.png */}

インスタンスタイプを選択したら、**Create** をクリックします。数分ほどで Managed Postgres インスタンスのプロビジョニングが完了し、使用可能になります。


## インスタンス概要 \{#instance-overview\}

インスタンス概要ページでは、PostgreSQL インスタンスの現在の状態を包括的に確認できます。ステータスと健全性指標、インスタンスタイプとリソース構成、ロケーションおよびアベイラビリティゾーンの詳細、高可用性構成、リアルタイムの CPU およびディスク使用率メトリクスなどの情報を確認できます。

{/* TODO(kaushik-ubi): インスタンス概要ダッシュボードのスクリーンショット
    パス: /static/images/cloud/managed-postgres/instance-overview.png */}

このページから、[接続情報](/cloud/managed-postgres/connection)にアクセスし、[高可用性](/cloud/managed-postgres/high-availability)オプションを設定し、[読み取りレプリカ](/cloud/managed-postgres/read-replicas)を管理し、時間の経過とともにデータベースのパフォーマンスを監視できます。


## 提供状況 \{#availability\}

Managed Postgres は現在、AWS の 10 リージョンで利用可能で、50 を超える NVMe 搭載構成を提供しています。構成は、2 vCPU・8 GB RAM・118 GB ストレージから、96 vCPU・768 GB RAM・60 TB ストレージまで幅広くカバーしています。GCP および Azure への対応も計画されています。

このサービスには、接続プーリング用の組み込み [PgBouncer](/cloud/managed-postgres/connection#pgbouncer)、メジャーバージョンアップグレード、および標準的なマネージドサービス機能がすべて含まれています。