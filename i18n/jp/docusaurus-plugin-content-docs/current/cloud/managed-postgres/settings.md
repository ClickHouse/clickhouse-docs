---
slug: /cloud/managed-postgres/settings
sidebar_label: '設定'
title: '設定'
description: 'PostgreSQL および PgBouncer のパラメータを構成し、Managed Postgres インスタンスの設定を管理する'
keywords: ['postgres 設定', 'postgresql 設定', 'pgbouncer']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.settings-beta" />

サイドバーの **Settings** タブから、Managed Postgres インスタンスの構成パラメータを変更したり、インスタンス設定を管理したりできます。

## サービスアクションとスケーリング \{#service-actions\}

<Image img={serviceActions} alt="サービスアクションとスケーリング" size="md" border />

**Service actions** ツールバーを使用して、Managed Postgres インスタンスを管理できます。

* **Reset password**: スーパーユーザーのパスワードを更新します (インスタンスが `Running` の場合のみ)
* **Restart**: データベースインスタンスを再起動します (インスタンスが `Running` の場合のみ)
* **Delete**: インスタンスを削除します

**Scaling** セクションでは、プライマリおよびスタンバイのインスタンスタイプを変更して、コンピュートリソースおよびストレージ容量を増減できます。
詳細については、[scaling page](/cloud/managed-postgres/scaling) を参照してください。

## 構成パラメータの変更 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres パラメータ構成" size="md" border />

パラメータを変更するには、**Edit parameters** ボタンをクリックします。変更したいパラメータを選択し、それぞれの値を必要に応じて更新します。変更内容に問題がなければ、**Save Changes** ボタンをクリックします。

構成パラメータに対して行ったすべての変更は、通常 1 分以内にインスタンスに反映されます。パラメータによっては、反映にデータベースの再起動が必要なものもあります。これらの変更は、次回の再起動後に適用されます。再起動は、**Service actions** ツールバーから手動で実行できます。

構成パラメータの詳細については、公式[ドキュメント](https://www.postgresql.org/docs/current/runtime-config.html)を参照してください。設定可能なパラメータの一覧は、まもなく拡張される予定です。それまでの間、現在サポートされていないパラメータを希望する場合は、[support](https://clickhouse.com/support/program) までお問い合わせください。