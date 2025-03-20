---
slug: /engines/database-engines/lazy
sidebar_label: Lazy
sidebar_position: 20
title: "Lazy"
description: "最終アクセスから `expiration_time_in_seconds` 秒間のみテーブルをRAMに保持します。Logタイプのテーブルでのみ使用できます。"
---


# Lazy

最終アクセスから `expiration_time_in_seconds` 秒間のみテーブルをRAMに保持します。*Logテーブルでのみ使用できます。

多くの小さな*Logテーブルを保存するために最適化されており、アクセス間の時間間隔が長い場合に適しています。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
