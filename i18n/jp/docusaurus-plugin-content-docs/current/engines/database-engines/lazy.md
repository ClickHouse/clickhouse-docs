---
description: '最後のアクセスから `expiration_time_in_seconds` 秒間だけテーブルをメモリ内に保持します。Log テーブルエンジンでのみ使用できます。'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
doc_type: 'reference'
---



# Lazy

テーブルを最後のアクセスから `expiration_time_in_seconds` 秒間だけ RAM 内に保持します。 \*Log テーブルでのみ使用できます。

アクセス間隔が長い多数の小さな \*Log テーブルを格納する用途に最適化されています。



## データベースを作成する

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
