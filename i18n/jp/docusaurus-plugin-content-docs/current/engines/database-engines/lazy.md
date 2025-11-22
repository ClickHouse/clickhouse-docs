---
description: '最後のアクセスから `expiration_time_in_seconds` 秒間だけテーブルを RAM 内に保持します。Log タイプのテーブルでのみ使用できます。'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
doc_type: 'reference'
---



# Lazy

最後のアクセスから `expiration_time_in_seconds` 秒間だけテーブルを RAM 上に保持します。`*Log` テーブルでのみ使用できます。

アクセス間隔が長い多数の小さな `*Log` テーブルを保存する用途に最適化されています。



## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy
ENGINE = Lazy(expiration_time_in_seconds);
```
