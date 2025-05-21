---
description: '設定の目次ページ'
sidebar_position: 1
slug: /operations/settings/
title: '設定'
---

<!-- このページの目次テーブルは、 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
からYAMLフロントマターのフィールド：slug、description、titleに基づいて自動生成されます。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Composable Protocols](/operations/settings/composable-protocols) | Composable protocolsにより、ClickHouseサーバーへのTCPアクセスの柔軟な設定が可能になります。 |
| [Settings Profiles](/operations/settings/settings-profiles) | 同じ名前でグループ化された設定のコレクションです。 |
| [Session Settings](/operations/settings/settings) | ``system.settings`` テーブルに存在する設定です。 |
| [Settings Overview](/operations/settings/overview) | 設定の概要ページです。 |
| [Users and Roles Settings](/operations/settings/settings-users) | ユーザーとロールの設定を構成するための設定です。 |
| [Query-level Session Settings](/operations/settings/query-level) | クエリレベルでの設定です。 |
| [Format Settings](/operations/settings/formats) | 入力と出力のフォーマットを制御するための設定です。 |
| [Restrictions on Query Complexity](/operations/settings/query-complexity) | クエリの複雑さを制限するための設定です。 |
| [MergeTree tables settings](/operations/settings/merge-tree-settings) | `system.merge_tree_settings` にあるMergeTreeの設定です。 |
| [Constraints on Settings](/operations/settings/constraints-on-settings) | 設定に対する制約は、`user.xml` 設定ファイルの `profiles` セクションで定義され、ユーザーが `SET` クエリでいくつかの設定を変更することを禁止します。 |
| [Memory overcommit](/operations/settings/memory-overcommit) | クエリのためにより柔軟なメモリ制限を設定することを目的とした実験的な手法です。 |
| [Permissions for Queries](/operations/settings/permissions-for-queries) | クエリ権限の設定です。 |
