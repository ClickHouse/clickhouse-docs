---
description: '最後のアクセスから `expiration_time_in_seconds` 秒間のみテーブルをRAMに保持します。Logタイプのテーブルでのみ使用できます。'
sidebar_label: 'レイジー'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'レイジー'
---


# レイジー

最後のアクセスから `expiration_time_in_seconds` 秒間のみテーブルをRAMに保持します。*Logテーブルでのみ使用できます。

アクセスの間に長い時間間隔がある多くの小さな*Logテーブルを保存するために最適化されています。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
