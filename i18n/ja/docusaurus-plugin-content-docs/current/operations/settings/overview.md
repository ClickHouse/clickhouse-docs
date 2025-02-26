---
title: "設定の概要"
sidebar_position: 1
slug: /ja/operations/settings/overview
description: "設定の概要ページ。"
---

# 設定の概要

:::note
XMLベースの設定プロファイルと[設定ファイル](/operations/configuration-files)は現在、ClickHouse Cloudではサポートされていません。ClickHouse Cloudサービスの設定を指定するには、[SQL駆動の設定プロファイル](/ja/operations/access-rights#settings-profiles-management)を使用する必要があります。
:::

ClickHouseの設定には2つの主要なグループがあります。

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定はClickHouseサーバー全体に適用されるのに対し、セッション設定はユーザーのセッションまたは特定のクエリに対して適用されることです。

[グローバルサーバー設定](/operations/server-configuration-parameters/settings.md)について読むことで、ClickHouseサーバーをグローバルサーバーレベルで構成する方法を学ぶことができます。

[セッション設定](/operations/settings/settings-query-level.md)について読むことで、ClickHouseサーバーをセッションレベルで構成する方法を学ぶことができます。

## 非デフォルト設定の確認 {#see-non-default-settings}

どの設定がデフォルト値から変更されたかを表示するには：

```sql
SELECT name, value FROM system.settings WHERE changed
```

デフォルト値から設定を変更していない場合、ClickHouseは何も返しません。

特定の設定の値を確認するには、クエリに設定の`name`を指定します：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

このコマンドは次のような結果を返すべきです：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 行がセットに含まれています。経過時間: 0.002 秒。
```
