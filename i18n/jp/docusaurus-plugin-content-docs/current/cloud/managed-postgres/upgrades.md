---
slug: /cloud/managed-postgres/upgrades
sidebar_label: 'アップグレード'
title: 'アップグレード'
description: 'ClickHouse Managed Postgres における PostgreSQL バージョンアップの仕組み'
keywords: ['Managed Postgres アップグレード', 'Postgres バージョン', 'マイナーアップグレード', 'メジャーアップグレード', 'メンテナンスウィンドウ']
doc_type: 'ガイド'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="upgrades" />

Managed Postgres では、PostgreSQL のバージョンアップグレードを実行し、インスタンスを安全かつ最新の状態に保ちます。マイナーバージョンとメジャーバージョンの両方のアップグレードが、影響を最小限に抑えて行われます。


## マイナーバージョンアップグレード \{#minor-version-upgrades\}

マイナーバージョンアップグレード（例: 16.4 から 16.5）には、バグ修正およびセキュリティパッチが含まれます。これらはフェイルオーバー方式で実行され、通常は数秒程度のごく短時間の切断が発生するだけです。

[standbys](/cloud/managed-postgres/high-availability) が有効になっているインスタンスでは、まずスタンバイ側にアップグレードを適用し、その後にフェイルオーバーを行うことで、ダウンタイムを最小限に抑えます。

## メジャーバージョンのアップグレード \{#major-version-upgrades\}

メジャーバージョンのアップグレード（例: 16.x から 17.x）でも、同様のフェイルオーバー方式により、ダウンタイムは数秒程度で済みます。

## メンテナンスウィンドウ \{#maintenance-windows\}

Managed Postgres ではメンテナンスウィンドウ機能をサポートしており、アップグレードやその他のメンテナンス作業を、ワークロードへの影響が最小となる時間帯にスケジュールできます。メンテナンスウィンドウを設定するための UI 機能は近日中に提供予定です。それまでは、インスタンスのメンテナンスウィンドウを設定するために [support](https://clickhouse.com/support/program) までお問い合わせください。