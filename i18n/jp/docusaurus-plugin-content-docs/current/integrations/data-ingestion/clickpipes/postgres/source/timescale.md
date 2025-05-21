---
sidebar_label: 'Timescale'
description: 'ClickPipes のソースとして TimescaleDB 拡張機能を利用するための Postgres セットアップ'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB ソースセットアップガイド'
keywords: ['TimescaleDB']
---

import BetaBadge from '@theme/badges/BetaBadge';


# TimescaleDB ソースセットアップガイド

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) は、Postgres のパフォーマンスを向上させることを目的としたオープンソースの Postgres 拡張機能であり、Timescale Inc によって開発されました。これは、拡張機能によって管理される「ハイパーテーブル」を作成し、それを「チャンク」に自動的にパーティション分割することで実現されます。ハイパーテーブルは、透過的な圧縮およびハイブリッドの行・列指向ストレージ（「ハイパコア」として知られる）をサポートしていますが、これらの機能は独自のライセンスを持つ拡張機能のバージョンが必要です。

Timescale Inc は、TimescaleDB 用の二つのセルフマネージドサービスも提供しています：
- `Managed Service for Timescale`
- `Timescale Cloud`. 

TimescaleDB 拡張機能を利用できるセルフマネージドサービスを提供しているサードパーティのベンダーもありますが、ライセンスの関係でこれらのベンダーはオープンソース版の拡張機能のみをサポートしています。

Timescale のハイパーテーブルは、通常の Postgres テーブルとはいくつかの点で異なる動作をします。このため、それらをレプリケートするプロセスにはいくつかの複雑さが生じるため、Timescale のハイパーテーブルをレプリケートできる能力は **ベストエフォート** と考えるべきです。

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

TimescaleDB を搭載した Postgres インスタンスのデプロイ方法によって、従うべき手順が異なります。

- セルフマネージドサービスを使用していて、サイドバーにプロバイダーがリストされている場合は、そのプロバイダーのガイドに従ってください。
- 自分で TimescaleDB をデプロイしている場合は、一般的なガイドに従ってください。

他のセルフマネージドサービスについては、論理レプリケーションを有効にするためにプロバイダーにサポートチケットを提出してください。

:::info
Timescale Cloud は、CDC モードの Postgres パイプに必要な論理レプリケーションの有効化をサポートしていません。
そのため、Timescale Cloud のユーザーはデータの一括ロード（`Initial Load Only`）のみをいただくことができます。
:::

## 設定 {#configuration}

Timescale のハイパーテーブルは、そこに挿入されたデータを保存しません。代わりに、データは `_timescaledb_internal` スキーマ内の複数の対応する「チャンク」テーブルに保存されます。ハイパーテーブルでクエリを実行する際には問題ありませんが、論理レプリケーション中はハイパーテーブルでの変更を検出するのではなく、チャンクテーブルで検出します。Postgres ClickPipe には、チャンクテーブルから親ハイパーテーブルに変更を自動的にリマップするロジックがありますが、これは追加の手順を必要とします。

:::info
データの一括ロード（`Initial Load Only`）のみを行いたい場合は、ステップ 2 以降をスキップしてください。
:::

1. パイプ用の Postgres ユーザーを作成し、レプリケートしたいテーブルに対する `SELECT` 権限を付与します。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 必要に応じて、これらの GRANT をスキーマ全体ではなく個々のテーブルのみに絞ることができます。
  -- ただし、ClickPipe に新しいテーブルを追加する際は、それらをユーザーに追加する必要があります。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えてください。
:::

2. Postgres のスーパーユーザー/管理ユーザーとして、レプリケートしたいテーブルとハイパーテーブルを含むソースインスタンスのパブリケーションを作成し、**`_timescaledb_internal` スキーマ全体も含めてください**。ClickPipe を作成する際にこのパブリケーションを選択する必要があります。

```sql
-- ClickPipe に新しいテーブルを追加する際は、それらをパブリケーションにも手動で追加する必要があります。
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
`FOR ALL TABLES` のパブリケーションを作成することをお勧めしません。これにより、Postgres から ClickPipes へのトラフィックが増加し（パイプに含まれない他のテーブルの変更を送信するため）、全体的な効率が低下します。
::: 

:::info
一部のセルフマネージドサービスでは、管理ユーザーにスキーマ全体のパブリケーションを作成するために必要な権限が付与されていません。
この場合は、プロバイダーにサポートチケットを提出してください。または、このステップおよび次のステップをスキップし、データの一括ロードを行ってください。
:::

3. 作成したユーザーにレプリケーション権限を付与します。

```sql
-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;
```

これらの手順を完了すれば、[ClickPipe の作成](../index.md)に進むことができるはずです。

## トラブルシューティング {#troubleshooting}

テーブルの初期ロードは、次のエラーで失敗することがあります。

```sql
ERROR: transparent decompression only supports tableoid system column (SQLSTATE 42P10)
```

これらのテーブルについては、[圧縮](https://docs.timescale.com/api/latest/compression/decompress_chunk)または [ハイパコア列ストア](https://docs.timescale.com/api/latest/hypercore/convert_to_rowstore)を無効にする必要があるかもしれません。

## ネットワークアクセスの設定 {#configure-network-access}

Timescale インスタンスへのトラフィックを制限したい場合は、[文書化された静的 NAT IP](../../index.md#list-of-static-ips)を許可リストに追加してください。
これを行う方法はプロバイダーによって異なるため、プロバイダーがサイドバーにリストされている場合はそれを確認するか、チケットを提出してください。
