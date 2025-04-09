---
title: "設定の概要"
sidebar_position: 1
slug: /operations/settings/overview
description: "設定の概要ページ。"
---


# 設定の概要

:::note
XMLベースの設定プロファイルおよび [構成ファイル](/operations/configuration-files) は、現在 ClickHouse Cloud ではサポートされていません。ClickHouse Cloud サービスの設定を指定するには、[SQL駆動の設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。
:::

ClickHouse の設定には、主に2つのグループがあります：

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定は ClickHouse サーバー全体に適用されるのに対し、セッション設定はユーザーセッションや特定のクエリに適用されることです。

グローバルサーバー設定についての詳細は [グローバルサーバー設定](/operations/server-configuration-parameters/settings.md) を読んで、ClickHouse サーバーのグローバルレベルでの構成方法を学んでください。

セッション設定についての詳細は [セッション設定](/operations/settings/settings-query-level.md) を読んで、ClickHouse サーバーのセッションレベルでの構成方法を学んでください。

## 非デフォルト設定の確認 {#see-non-default-settings}

デフォルト値から変更された設定を表示するには：

```sql
SELECT name, value FROM system.settings WHERE changed
```

デフォルト値から設定を変更していない場合、ClickHouse は何も返しません。

特定の設定の値を確認するには、クエリ内で設定の `name` を指定してください：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

このコマンドは次のような結果を返すはずです：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```
