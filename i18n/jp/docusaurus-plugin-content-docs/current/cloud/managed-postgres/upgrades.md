---
slug: /cloud/managed-postgres/upgrades
sidebar_label: 'アップグレード'
title: 'アップグレード'
description: 'ClickHouse Managed Postgres における PostgreSQL バージョンアップの仕組み'
keywords: ['Managed Postgres アップグレード', 'Postgres バージョン', 'マイナーアップグレード', 'メジャーアップグレード', 'メンテナンスウィンドウ']
doc_type: 'ガイド'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.upgrades-beta" />

Managed Postgres では、PostgreSQL のバージョンアップグレードを実行し、インスタンスを安全かつ最新の状態に保ちます。マイナーバージョンとメジャーバージョンの両方のアップグレードが、影響を最小限に抑えて行われます。

## メンテナンスアップデート \{#maintenance-updates\}

PostgreSQL インスタンスの定期メンテナンスには、次の内容が含まれます。

* マイナーバージョンアップグレード (例: 17.4 から 17.5) には、バグ修正および PostgreSQL エンジンのセキュリティパッチが含まれます。
* Managed Service の機能。native CDC、オブザーバビリティ、pg&#95;clickhouse、およびその他の拡張機能の改善。
* オペレーティングシステムおよびシステムコンポーネントのパッチ。セキュリティ修正、効率化、その他の改善を含みます。

これらはフェイルオーバー方式で実行され、通常は数秒程度のごく短時間の切断が発生するだけです。

[standbys](/cloud/managed-postgres/high-availability) が有効になっているインスタンスでは、まずスタンバイ側にアップグレードを適用し、その後にフェイルオーバーを行うことで、ダウンタイムを最小限に抑えます。

## メンテナンスウィンドウ \{#maintenance-windows\}

デフォルトのメンテナンスウィンドウは、日曜日の 14:00 から 16:00 UTC です。
想定されるダウンタイムは、このウィンドウ内で 1 分未満です。

Enterprise Tier の組織では、Managed Postgres でメンテナンスウィンドウ機能をサポートしており、アップグレードやその他のメンテナンス作業を、ワークロードへの影響が最小となる時間帯にスケジュールできます。メンテナンスウィンドウを設定するための UI および API のサポートは近日中に提供予定です。それまでは、インスタンスのメンテナンスウィンドウを設定するために [support](https://clickhouse.com/support/program) までお問い合わせください。

## メジャーバージョンアップグレード \{#major-version-upgrades\}

UI および API によるメジャーバージョンアップグレード (例: 17.x から 18.x へのアップグレード) は近日中に提供予定です。
それまでは、Managed Postgres インスタンスをアップグレードするために [support](https://clickhouse.com/support/program) までお問い合わせください。