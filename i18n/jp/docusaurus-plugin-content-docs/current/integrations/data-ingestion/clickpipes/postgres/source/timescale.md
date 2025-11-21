---
sidebar_label: 'Timescale'
description: 'TimescaleDB 拡張機能付き Postgres を ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 拡張機能付き Postgres ソース設定ガイド'
keywords: ['TimescaleDB']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# TimescaleDB を利用した Postgres ソースセットアップガイド

<BetaBadge/>



## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb)は、Timescale Inc が開発したオープンソースのPostgres拡張機能で、Postgresから移行することなく分析クエリのパフォーマンスを向上させることを目的としています。これは、拡張機能によって管理され、「チャンク」への自動パーティショニングをサポートする「ハイパーテーブル」を作成することで実現されます。ハイパーテーブルは透過的な圧縮とハイブリッド行列ストレージ(「ハイパーコア」として知られる)もサポートしていますが、これらの機能にはプロプライエタリライセンス版の拡張機能が必要です。

Timescale Incは、TimescaleDB向けに2つのマネージドサービスも提供しています:

- `Managed Service for Timescale`
- `Timescale Cloud`

TimescaleDB拡張機能を使用できるマネージドサービスを提供するサードパーティベンダーも存在しますが、ライセンスの関係上、これらのベンダーはオープンソース版の拡張機能のみをサポートしています。

Timescaleのハイパーテーブルは、通常のPostgresテーブルといくつかの点で異なる動作をします。これにより、レプリケーションプロセスに複雑さが生じるため、Timescaleハイパーテーブルのレプリケーション機能は**ベストエフォート**として考慮すべきです。


## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesはPostgresバージョン12以降をサポートしています。


## 論理レプリケーションの有効化 {#enable-logical-replication}

実行する手順は、TimescaleDBを使用したPostgresインスタンスのデプロイ方法によって異なります。

- マネージドサービスを使用しており、プロバイダーがサイドバーに記載されている場合は、そのプロバイダー向けのガイドに従ってください。
- TimescaleDBを自身でデプロイしている場合は、汎用ガイドに従ってください。

その他のマネージドサービスについては、論理レプリケーションがまだ有効になっていない場合、プロバイダーにサポートチケットを発行して有効化の支援を依頼してください。

:::info
Timescale Cloudは、CDCモードのPostgresパイプに必要な論理レプリケーションの有効化をサポートしていません。
そのため、Timescale Cloudのユーザーは、Postgres ClickPipeを使用してデータの一回限りのロード（`Initial Load Only`）のみを実行できます。
:::


## 設定 {#configuration}

Timescaleハイパーテーブルは、挿入されたデータを自身に保存しません。代わりに、データは`_timescaledb_internal`スキーマ内の複数の対応する「チャンク」テーブルに保存されます。ハイパーテーブルに対してクエリを実行する場合、これは問題になりません。しかし、論理レプリケーション中は、ハイパーテーブルではなくチャンクテーブルの変更を検出します。Postgres ClickPipeには、チャンクテーブルからの変更を親ハイパーテーブルに自動的に再マッピングするロジックがありますが、これには追加の手順が必要です。

:::info
データの一回限りの読み込み（`Initial Load Only`）のみを実行する場合は、ステップ2以降をスキップしてください。
:::

1. パイプ用のPostgresユーザーを作成し、レプリケートするテーブルに対する`SELECT`権限を付与します。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 必要に応じて、スキーマ全体ではなく個別のテーブルのみにこれらのGRANTを限定することができます
  -- ただし、ClickPipeに新しいテーブルを追加する際は、それらをユーザーにも追加する必要があります。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user`と`clickpipes_password`を任意のユーザー名とパスワードに置き換えてください。
:::

2. Postgresスーパーユーザー/管理者ユーザーとして、レプリケートするテーブルとハイパーテーブルを含み、**`_timescaledb_internal`スキーマ全体も含む**パブリケーションをソースインスタンス上に作成します。ClickPipeを作成する際は、このパブリケーションを選択する必要があります。

```sql
-- ClickPipeに新しいテーブルを追加する際は、手動でパブリケーションにも追加する必要があります。
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES`でパブリケーションを作成することは推奨しません。これにより、PostgresからClickPipesへのトラフィックが増加し（パイプに含まれていない他のテーブルの変更も送信されるため）、全体的な効率が低下します。

手動で作成したパブリケーションの場合は、パイプに追加する前に、対象のテーブルをパブリケーションに追加してください。
:::

:::info
一部のマネージドサービスでは、管理者ユーザーにスキーマ全体のパブリケーションを作成するために必要な権限が付与されていません。
この場合は、プロバイダーにサポートチケットを提出してください。または、このステップと以降のステップをスキップして、データの一回限りの読み込みを実行することもできます。
:::

3. 先ほど作成したユーザーにレプリケーション権限を付与します。

```sql
-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;
```

これらのステップの後、[ClickPipeの作成](../index.md)に進むことができます。


## ネットワークアクセスの設定 {#configure-network-access}

Timescaleインスタンスへのトラフィックを制限したい場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)を許可リストに追加してください。

設定手順はプロバイダーによって異なります。お使いのプロバイダーがサイドバーに記載されている場合はそちらを参照するか、プロバイダーにサポートチケットを発行してください。
