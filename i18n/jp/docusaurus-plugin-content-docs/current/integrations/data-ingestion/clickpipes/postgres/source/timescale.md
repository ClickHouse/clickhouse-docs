---
'sidebar_label': 'Timescale'
'description': 'Set up Postgres with the TimescaleDB extension as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'Postgres with TimescaleDB source setup guide'
'keywords':
- 'TimescaleDB'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres with TimescaleDB Source Setup Guide

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) は、Timescale Inc によって開発されたオープンソースの Postgres 拡張機能で、Postgres から離れることなく分析クエリのパフォーマンスを向上させることを目的としています。これは、「ハイパーテーブル」を作成することによって実現され、これらは拡張によって管理され、「チャンク」への自動パーティショニングをサポートします。ハイパーテーブルは、透過的な圧縮とハイブリッドの行列ストレージ（「ハイパコア」として知られる）もサポートしていますが、これらの機能は専有ライセンスを持つバージョンの拡張が必要です。

Timescale Inc は、TimescaleDB のために二つの管理サービスを提供しています：
- `Managed Service for Timescale`
- `Timescale Cloud`。

TimescaleDB 拡張機能を利用できる管理サービスを提供しているサードパーティのベンダーもありますが、ライセンスの関係でこれらのベンダーはオープンソースバージョンの拡張のみをサポートしています。

Timescale ハイパーテーブルは、いくつかの点で通常の Postgres テーブルとは異なる動作をします。これがレプリケーションのプロセスにいくつかの複雑さをもたらすため、Timescale ハイパーテーブルをレプリケートする能力は **最善の努力** として検討されるべきです。

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は、Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

手順は、TimescaleDB がデプロイされている Postgres インスタンスによって異なります。

- 管理サービスを使用している場合は、サイドバーにリストされているプロバイダーのガイドに従ってください。
- 自分で TimescaleDB をデプロイしている場合は、一般的なガイドに従ってください。

他の管理サービスについては、論理レプリケーションを有効にするためにプロバイダーにサポートチケットを提出してください。

:::info
Timescale Cloud は、CDC モードの Postgres パイプに必要な論理レプリケーションを有効にすることをサポートしていません。その結果、Timescale Cloud のユーザーは Postgres ClickPipe でデータの一度きりのロード（`Initial Load Only`）しか行えません。
:::

## 構成 {#configuration}

Timescale ハイパーテーブルは、そこに挿入されたデータを保存しません。代わりに、データは `_timescaledb_internal` スキーマ内の複数の対応する「チャンク」テーブルに保存されます。ハイパーテーブル上でクエリを実行することは問題ではありません。しかし、論理レプリケーション中は、ハイパーテーブルの変更を検出する代わりにチャンクテーブルで変更を検出します。Postgres ClickPipe には、チャンクテーブルの変更を親のハイパーテーブルに自動的にマッピングするロジックがありますが、追加の手順が必要です。

:::info
データの一度きりのロード（`Initial Load Only`）だけを行いたい場合は、ステップ2以降をスキップしてください。
:::

1. パイプ用の Postgres ユーザーを作成し、レプリケートしたいテーブルに対して `SELECT` 権限を付与します。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 必要に応じて、これらの GRANT をスキーマ全体ではなく個別のテーブルだけに制限できます
  -- ただし、ClickPipe に新しいテーブルを追加する際には、それらもユーザーに追加する必要があります。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えてください。
:::

2. Postgres スーパーユーザー/管理ユーザーとして、レプリケートしたいテーブルとハイパーテーブルを持つソースインスタンスにパブリケーションを作成し、**`_timescaledb_internal` スキーマ全体も含める必要があります**。ClickPipe を作成する際には、このパブリケーションを選択する必要があります。

```sql
-- ClickPipe に新しいテーブルを追加する際には、それらも手動でパブリケーションに追加する必要があります。
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES` のパブリケーションを作成することをお勧めしません。これにより、Postgres から ClickPipes へのトラフィックが増加し（パイプに含まれない他のテーブルの変更を送信するため）、全体の効率が低下します。
::: 

:::info
一部の管理サービスでは、管理ユーザーにスキーマ全体のパブリケーションを作成するための必要な権限を付与していない場合があります。この場合は、プロバイダーにサポートチケットを提出してください。あるいは、このステップと次のステップをスキップし、一度きりのデータロードを行うこともできます。
:::

3. 前に作成したユーザーにレプリケーション権限を付与します。

```sql
-- ユーザーにレプリケーション権限を付与します
  ALTER USER clickpipes_user REPLICATION;
```

これらの手順を終えたら、[ClickPipe を作成する](../index.md)ことができるはずです。

## トラブルシューティング {#troubleshooting}

テーブルの初回ロードがエラーで失敗することがあります：

```sql
ERROR: transparent decompression only supports tableoid system column (SQLSTATE 42P10)
```

これらのテーブルでは、[圧縮](https://docs.timescale.com/api/latest/compression/decompress_chunk)や[ハイパコアカラムストア](https://docs.timescale.com/api/latest/hypercore/convert_to_rowstore)を無効にする必要があるかもしれません。

## ネットワークアクセスを構成する {#configure-network-access}

Timescale インスタンスへのトラフィックを制限したい場合は、[文書化された静的 NAT IP](../../index.md#list-of-static-ips)を許可リストに追加してください。これを行うための手順はプロバイダーによって異なるため、サイドバーにリストされている場合は一覧をご覧になるか、チケットを提出してください。
