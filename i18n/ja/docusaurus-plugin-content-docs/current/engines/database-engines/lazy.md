---
slug: /engines/database-engines/lazy
sidebar_label: Lazy
sidebar_position: 20
title: "Lazy"
description: "最後のアクセスから`expiration_time_in_seconds`秒だけテーブルをRAMに保持します。Logタイプのテーブルとだけ使用できます。"
---

# Lazy

最後のアクセスから`expiration_time_in_seconds`秒だけテーブルをRAMに保持します。*Logテーブルとだけ使用できます。

これは、多くの小さな*Logテーブルを保存するために最適化されており、アクセス間に長い時間間隔がある場合に使用されます。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
