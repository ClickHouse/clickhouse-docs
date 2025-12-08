---
description: 'ClickHouse Cloud で利用可能な `Shared` データベースエンジンに関するページ'
sidebar_label: 'Shared'
sidebar_position: 10
slug: /engines/database-engines/shared
title: 'Shared'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# Shared データベースエンジン {#shared-database-engine}

`Shared` データベースエンジンは、Shared Catalog と連携して、[`SharedMergeTree`](/cloud/reference/shared-merge-tree) などのステートレスなテーブルエンジンを使用するデータベースを管理します。
これらのテーブルエンジンは永続的な状態をディスクに書き込まず、動的なコンピュート環境と互換性があります。

ClickHouse Cloud における `Shared` データベースエンジンは、ローカルディスクへの依存関係を取り除きます。
これは純粋なインメモリ エンジンであり、必要とするのは CPU とメモリだけです。

## どのように動作するのか {#how-it-works}

`Shared` データベースエンジンは、すべてのデータベースおよびテーブル定義を、Keeper をバックエンドとした中央の Shared Catalog に保存します。ローカルディスクへ書き込む代わりに、すべてのコンピュートノード間で共有される、単一のバージョン管理されたグローバルな状態を維持します。

各ノードは最後に適用したバージョンのみを追跡し、起動時にローカルファイルや手動でのセットアップを必要とせずに最新の状態を取得します。

## 構文 {#syntax}

エンドユーザーが Shared Catalog と Shared データベースエンジンを利用する際に、特別な設定は必要ありません。データベースの作成手順は従来どおりです。

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud は、データベースに Shared database engine を自動的に割り当てます。そのようなデータベース内で stateless engines を使用して作成されたテーブルは、Shared Catalog のレプリケーションおよび調整機能の恩恵を自動的に受けます。

:::tip
Shared Catalog とその利点の詳細については、Cloud リファレンス セクションの [&quot;Shared catalog and shared database engine&quot;](/cloud/reference/shared-catalog) を参照してください。
:::
