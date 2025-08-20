---
description: 'Keeps tables in RAM only `expiration_time_in_seconds` seconds after
  last access. Can be used only with Log type tables.'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: '/engines/database-engines/lazy'
title: 'Lazy'
---




# Lazy

テーブルは最終アクセス後 `expiration_time_in_seconds` 秒間のみ RAM に保持されます。これは \*Log テーブルでのみ使用できます。

多くの小さな \*Log テーブルを保存するために最適化されており、アクセス間の時間間隔が長いです。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
