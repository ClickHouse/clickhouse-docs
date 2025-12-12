---
sidebar_label: 'Timescale'
description: 'TimescaleDB 拡張機能付き Postgres を ClickPipes 用のソースとして設定する'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 拡張機能付き Postgres ソース設定ガイド'
keywords: ['TimescaleDB']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# TimescaleDB 拡張付き Postgres ソースのセットアップガイド {#postgres-with-timescaledb-source-setup-guide}

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) は、Timescale Inc によって開発されたオープンソースの Postgres 拡張機能であり、
Postgres から移行することなく分析クエリのパフォーマンスを向上させることを目的としています。これは、拡張機能によって管理される
「ハイパーテーブル」を作成し、それらが自動的な「チャンク」へのパーティション化をサポートすることで実現されています。
ハイパーテーブルは透過的な圧縮やハイブリッド行・カラムナ型ストレージ（「hypercore」として知られる）もサポートしますが、
これらの機能を利用するには、プロプライエタリライセンス版の拡張機能が必要です。

Timescale Inc は TimescaleDB 向けに 2 つのマネージドサービスも提供しています：
- `Managed Service for Timescale`
- `Timescale Cloud`

TimescaleDB 拡張機能を利用できるマネージドサービスを提供するサードパーティベンダーも存在しますが、
ライセンスの関係により、これらのベンダーは拡張機能のオープンソース版のみをサポートしています。

Timescale のハイパーテーブルはいくつかの点で通常の Postgres テーブルとは異なる挙動をします。
これはレプリケーション処理を複雑にするため、Timescale のハイパーテーブルをレプリケートする機能は
**ベストエフォート**として扱うべきです。

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降に対応しています。

## 論理レプリケーションを有効化する {#enable-logical-replication}

TimescaleDB を含む Postgres インスタンスのデプロイ方法によって、実施する手順が異なります。

- マネージドサービスを利用していて、そのプロバイダーがサイドバーに記載されている場合は、そのプロバイダー向けガイドに従ってください。
- 自身で TimescaleDB をデプロイしている場合は、汎用ガイドに従ってください。

上記以外のマネージドサービスを利用していて、論理レプリケーションがまだ有効になっていない場合は、プロバイダーにサポートチケットを送信し、有効化の支援を依頼してください。

:::info
Timescale Cloud は論理レプリケーションをサポートしていません。論理レプリケーションは CDC モードの Postgres pipes に必要です。
そのため、Timescale Cloud のユーザーは Postgres ClickPipe を使用したデータの一度きりのロード（`Initial Load Only`）のみ実行できます。
:::

## 設定 {#configuration}

Timescale のハイパーテーブル自体には、挿入されたデータは保存されません。代わりに、データは `_timescaledb_internal` スキーマ内にある対応する複数の「チャンク」テーブルに保存されます。ハイパーテーブルに対してクエリを実行する場合、これは問題になりません。しかし論理レプリケーション中は、ハイパーテーブルの変更ではなく、チャンクテーブルの変更を検出します。Postgres ClickPipe には、チャンクテーブルから親ハイパーテーブルへの変更を自動的に再マッピングするロジックがありますが、これには追加の手順が必要です。

:::info
データの一度限りのロード（`Initial Load Only`）のみを行いたい場合は、手順 2 以降をスキップしてください。
:::

1. ClickPipe 用の Postgres ユーザーを作成し、レプリケーションしたいテーブルに対する `SELECT` 権限を付与します。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 必要に応じて、スキーマ全体ではなく個別のテーブルに対してのみGRANT権限を設定することもできます
  -- ただし、ClickPipeに新しいテーブルを追加する場合は、そのテーブルに対する権限もユーザーに付与する必要があります。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user` と `clickpipes_password` は、必ず任意のユーザー名とパスワードに置き換えてください。
:::

2. PostgreSQL のスーパーユーザー／管理ユーザーとして、レプリケーションしたいテーブルおよびハイパーテーブルに加え、**`_timescaledb_internal` スキーマ全体を含む** publication をソースインスタンス上に作成します。ClickPipe を作成する際には、この publication を選択する必要があります。

```sql
-- ClickPipeに新しいテーブルを追加する場合は、パブリケーションにも手動で追加する必要があります。 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES` で publication を作成することは推奨しません。その場合、Postgres から ClickPipes へのトラフィック（パイプに含まれていない他のテーブルの変更送信）が増加し、全体的な効率が低下します。

publication を手動で作成する場合は、パイプに追加する前に、対象とするテーブルをすべて publication に追加してください。
:::

:::info
一部のマネージドサービスでは、スキーマ全体に対する publication を作成するために必要な権限が管理者ユーザーに付与されていません。
この場合は、プロバイダーにサポートチケットを起票してください。あるいは、この手順と後続の手順をスキップし、一度きりのデータロードを実行することもできます。
:::

3. 先ほど作成したユーザーにレプリケーション権限を付与します。

```sql
-- ユーザーにレプリケーション権限を付与する
  ALTER USER clickpipes_user REPLICATION;
```

これらの手順が完了すると、[ClickPipe を作成](../index.md)できるようになります。

## ネットワークアクセスの構成 {#configure-network-access}

Timescale インスタンスへのトラフィックを制限したい場合は、[ドキュメントに記載されている静的 NAT IP](../../index.md#list-of-static-ips) を許可リストに登録してください。
具体的な手順はプロバイダーによって異なります。ご利用のプロバイダーがサイドバーに記載されている場合はその手順に従い、記載がない場合はプロバイダーに問い合わせチケットを送信して確認してください。
