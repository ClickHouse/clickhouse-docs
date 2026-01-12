---
sidebar_label: 'Timescale'
description: 'TimescaleDB 拡張機能付き Postgres を ClickPipes 用のソースとして設定する'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 拡張機能付き Postgres ソース設定ガイド'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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

1. ClickPipes 用の Postgres ユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるテーブルはすべて、**主キー** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定のガイダンスについては、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   * 特定のテーブル向けに publication を作成するには、次のようにします。

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
     ```

   * 特定スキーマ内のすべてのテーブル向けに publication を作成するには、次のようにします。

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
     ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込むために使用されます。

5. 先ほど作成したユーザーにレプリケーション権限を付与します。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

これらの手順が完了すると、[ClickPipe を作成](../index.md)できるようになります。


## ネットワークアクセスの構成 {#configure-network-access}

Timescale インスタンスへのトラフィックを制限したい場合は、[ドキュメントに記載されている静的 NAT IP](../../index.md#list-of-static-ips) を許可リストに登録してください。
具体的な手順はプロバイダーによって異なります。ご利用のプロバイダーがサイドバーに記載されている場合はその手順に従い、記載がない場合はプロバイダーに問い合わせチケットを送信して確認してください。