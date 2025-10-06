---
'sidebar_label': 'Timescale'
'description': 'PostgresをTimescaleDB拡張機能を使用して、ClickPipesのソースとして設定します'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'PostgresとTimescaleDBソース設定ガイド'
'keywords':
- 'TimescaleDB'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres with TimescaleDB ソース設定ガイド

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) は、Timescale Inc によって開発されたオープンソースの Postgres 拡張機能であり、Postgres を離れることなく分析クエリのパフォーマンスを向上させることを目的としています。これは、拡張機能によって管理され、「チャンク」への自動パーティショニングをサポートする「ハイパーテーブル」を作成することによって実現されます。ハイパーテーブルは、透過的な圧縮とハイブリッド行列ストレージ（「ハイパコア」として知られる）をサポートしていますが、これらの機能には専用ライセンスのバージョンの拡張機能が必要です。

Timescale Inc は、TimescaleDB に対する二つのマネージドサービスも提供しています：
- `Managed Service for Timescale`
- `Timescale Cloud`。

サードパーティのベンダーが TimescaleDB 拡張機能を使用可能にするマネージドサービスを提供していますが、ライセンスの関係上、これらのベンダーは開放ソース版の拡張機能のみをサポートしています。

Timescale のハイパーテーブルは、様々な点で通常の Postgres テーブルとは異なる動作をします。これにより、複製プロセスにいくつかの複雑さが生じるため、Timescale のハイパーテーブルを複製する能力は **ベストエフォート** として考慮すべきです。

## サポートされる Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理複製を有効にする {#enable-logical-replication}

手順は、TimescaleDB を使用している Postgres インスタンスがどのようにデプロイされているかによって異なります。

- マネージドサービスを使用していて、プロバイダーがサイドバーに表示されている場合は、そのプロバイダーのガイドに従ってください。
- 自分で TimescaleDB をデプロイする場合は、一般的なガイドに従ってください。

他のマネージドサービスの場合、論理複製を有効にする手助けのためにプロバイダーとサポートチケットを提出してください。

:::info
Timescale Cloud では、CDC モードでの Postgres パイプに必要な論理複製を有効にすることはサポートされていません。そのため、Timescale Cloud のユーザーは、Postgres ClickPipe でデータのワンタイムロード (`Initial Load Only`) のみを実行できることに注意してください。
:::

## 設定 {#configuration}

Timescale のハイパーテーブルは、そこに挿入されたデータを保持しません。代わりに、データは `_timescaledb_internal` スキーマ内の複数の対応する「チャンク」テーブルに保存されます。ハイパーテーブルでクエリを実行することに問題はありませんが、論理複製中は、ハイパーテーブルでの変更を検出する代わりに、チャンクテーブルでの変更を検出します。Postgres ClickPipe には、チャンクテーブルから親のハイパーテーブルに自動的に変更を再マッピングするロジックがありますが、これには追加の手順が必要です。

:::info
データを一度だけロードする (`Initial Load Only`) だけを行いたい場合は、ステップ 2 以降をスキップしてください。
:::

1. パイプ用の Postgres ユーザーを作成し、複製したいテーブルに対して `SELECT` の権限を付与します。

```sql
CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- If desired, you can refine these GRANTs to individual tables alone, instead of the entire schema
-- But when adding new tables to the ClickPipe, you'll need to add them to the user as well.
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user` と `clickpipes_password` をお好みのユーザー名とパスワードに置き換えてください。
:::

2. Postgres スーパーユーザー / 管理者ユーザーとして、複製したいテーブルとハイパーテーブルがあるソースインスタンスに、**`_timescaledb_internal` スキーマ全体を含む** パブリケーションを作成します。ClickPipe を作成する際には、このパブリケーションを選択する必要があります。

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES` のパブリケーションを作成することはお勧めしません。これは、Postgres から ClickPipes へのトラフィックが増加し（パイプに含まれていない他のテーブルの変更を送信するため）、全体の効率が低下します。

手動で作成したパブリケーションに対しては、テーブルをパイプに追加する前に、そのパブリケーションに追加したいテーブルを含めてください。
:::

:::info
一部のマネージドサービスは、管理ユーザーがスキーマ全体に対してパブリケーションを作成するために必要な権限を持っていない場合があります。その場合は、プロバイダーにサポートチケットを提出してください。もしくは、このステップと次のステップをスキップしてデータのワンタイムロードを行うことができます。
:::

3. 前に作成したユーザーに複製権限を付与します。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

これらの手順を実行した後は、[ClickPipe の作成](../index.md)を続行できるはずです。

## ネットワークアクセスを設定する {#configure-network-access}

Timescale インスタンスへのトラフィックを制限したい場合は、[文書化された静的 NAT IP](../../index.md#list-of-static-ips)を許可リストに追加してください。これを行う手順はプロバイダーによって異なるため、プロバイダーがサイドバーに表示されている場合はそれを参照するか、チケットを提出してください。
