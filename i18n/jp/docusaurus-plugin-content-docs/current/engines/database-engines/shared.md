---
description: 'ClickHouse Cloud で利用可能な `Shared` データベースエンジンを説明するページ'
sidebar_label: 'Shared'
sidebar_position: 10
slug: /engines/database-engines/shared
title: 'Shared'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />


# Shared データベースエンジン

`Shared` データベースエンジンは、Shared Catalog と連携し、テーブルが [`SharedMergeTree`](/cloud/reference/shared-merge-tree) などのステートレスなテーブルエンジンを使用するデータベースを管理します。
これらのテーブルエンジンはディスクに永続的な状態を書き込まず、動的なコンピュート環境と互換性があります。

ClickHouse Cloud における `Shared` データベースエンジンは、ローカルディスクへの依存を排除します。
これは完全なインメモリエンジンであり、CPU とメモリのみを必要とします。



## どのように動作するのか？ {#how-it-works}

`Shared`データベースエンジンは、すべてのデータベースとテーブルの定義を、Keeperによってバックアップされた中央のShared Catalogに保存します。ローカルディスクへの書き込みを行う代わりに、すべてのコンピュートノード間で共有される単一のバージョン管理されたグローバル状態を維持します。

各ノードは最後に適用されたバージョンのみを追跡し、起動時にはローカルファイルや手動設定を必要とせず、最新の状態を取得します。


## 構文 {#syntax}

エンドユーザーにとって、Shared CatalogとSharedデータベースエンジンの使用に追加の設定は不要です。データベースの作成は従来と同様です：

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloudは自動的にSharedデータベースエンジンをデータベースに割り当てます。ステートレスエンジンを使用してこのようなデータベース内に作成されたテーブルは、Shared Catalogのレプリケーションおよびコーディネーション機能の恩恵を自動的に受けます。

:::tip
Shared Catalogとその利点の詳細については、Cloudリファレンスセクションの["Shared catalog and shared database engine"](/cloud/reference/shared-catalog)を参照してください。
:::
