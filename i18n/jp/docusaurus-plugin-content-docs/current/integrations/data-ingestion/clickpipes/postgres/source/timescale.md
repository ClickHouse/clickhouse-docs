---
sidebar_label: 'Timescale'
description: 'ClickPipes のソースとして TimescaleDB 拡張機能付き Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 拡張機能付き Postgres ソース設定ガイド'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';


# TimescaleDB を利用した Postgres ソースセットアップガイド \{#postgres-with-timescaledb-source-setup-guide\}

<BetaBadge/>

## 背景 \{#background\}

[TimescaleDB](https://github.com/timescale/timescaledb) は Timescale Inc によって開発されたオープンソースの Postgres 拡張機能であり、
Postgres から移行することなく分析クエリのパフォーマンスを向上させることを目的としています。これは、
拡張機能によって管理され、「chunk」への自動パーティション分割をサポートする「ハイパーテーブル (hypertables)」を作成することで実現されています。
ハイパーテーブルは、透過的な圧縮と、行と列指向を組み合わせたハイブリッドなストレージ (「hypercore」として知られています) もサポートしますが、
これらの機能を利用するにはプロプライエタリライセンス版の拡張機能が必要です。

Timescale Inc は TimescaleDB 向けに 2 つのマネージドサービスも提供しています:

- `Managed Service for Timescale`
- `Timescale Cloud`

TimescaleDB 拡張機能を利用できるマネージドサービスを提供しているサードパーティベンダーも存在しますが、
ライセンス上の理由から、これらのベンダーは拡張機能のオープンソース版のみをサポートしています。

Timescale のハイパーテーブルは、通常の Postgres テーブルとはいくつかの点で動作が異なります。そのため、
ハイパーテーブルをレプリケーションするプロセスが複雑になります。このため、Timescale のハイパーテーブルの
レプリケーションは **ベストエフォート** と考えるべきです。

## サポートされている Postgres バージョン \{#supported-postgres-versions\}

ClickPipes は Postgres 12 以降をサポートしています。

## 論理レプリケーションを有効化する \{#enable-logical-replication\}

TimescaleDB を使用した Postgres インスタンスのデプロイ方法によって、必要な手順が異なります。

- マネージドサービスを使用しており、プロバイダーがサイドバーに記載されている場合は、そのプロバイダー向けのガイドに従ってください。
- 自分で TimescaleDB をデプロイしている場合は、汎用ガイドに従ってください。

その他のマネージドサービスについては、論理レプリケーションがまだ有効化されていない場合、プロバイダーにサポートチケットを作成して、有効化の支援を依頼してください。

:::info
Timescale Cloud は、CDC モードでの Postgres パイプに必要となる論理レプリケーションの有効化をサポートしていません。
そのため、Timescale Cloud のユーザーは、Postgres ClickPipe を使用してデータを一度だけロードする（`Initial Load Only`）ことしかできません。
:::

## 設定 \{#configuration\}

Timescale のハイパーテーブル (hypertable) 自体には、挿入されたデータは格納されません。代わりに、データは `_timescaledb_internal` スキーマ内の、対応する複数の「chunk」テーブルに格納されます。ハイパーテーブルに対してクエリを実行する際には、これは問題になりません。しかし論理レプリケーションでは、ハイパーテーブルでの変更を検出するのではなく、chunk テーブルでの変更を検出します。Postgres ClickPipe には、chunk テーブルから親ハイパーテーブルへ変更を自動的にマッピングし直すロジックがありますが、そのためには追加の手順が必要です。

:::info
データの一度きりのロードのみを実行したい場合（`Initial Load Only`）は、手順 2 以降をスキップしてください。
:::

1. ClickPipes 用の専用ユーザーを作成します:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 前の手順で作成したユーザーに対して、スキーマ単位の読み取り専用アクセスを付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. レプリケーション対象としたいテーブルを含む[パブリケーション](https://www.postgresql.org/docs/current/logical-replication-publication.html)を作成します。パフォーマンス上のオーバーヘッドを避けるため、パブリケーションには必要なテーブルのみを含めることを強く推奨します。

   :::warning
   パブリケーションに含めるすべてのテーブルは、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープの決め方については、[Postgres の FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル用のパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定スキーマ内のすべてのテーブル用のパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` パブリケーションには、指定したテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込む際に使用されます。

これらの手順を完了したら、[ClickPipe の作成](../index.md)に進むことができます。

## ネットワークアクセスの設定 \{#configure-network-access\}

Timescale インスタンスへのトラフィックを制限したい場合は、[ドキュメントに記載されている静的 NAT IP アドレス](../../index.md#list-of-static-ips) を許可リストに追加してください。
この設定手順はプロバイダーごとに異なります。ご利用のプロバイダーに対応する項目がサイドバーに記載されている場合はその手順に従うか、記載がない場合はプロバイダーにサポートチケットを発行して問い合わせてください。