---
sidebar_label: '概要'
sidebar_position: 10
title: 'JSONの取り扱い'
slug: /integrations/data-formats/json/overview
description: 'ClickHouseにおけるJSONの取り扱い'
keywords: ['json', 'clickhouse']
score: 10
---
```


# JSONの概要

<div style={{width:'1024px', height: '576px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="1024"
    height="576"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>
ClickHouseは、JSONを扱うためのいくつかのアプローチを提供しており、それぞれに利点と欠点、使用方法があります。このガイドでは、JSONをロードし、スキーマを最適に設計する方法について説明します。このガイドは以下のセクションで構成されています：

- [JSONのロード](/integrations/data-formats/json/loading) - ClickHouseでの構造化および半構造化JSONの簡単なスキーマを使ったロードとクエリ。
- [JSONスキーマの推論](/integrations/data-formats/json/inference) - JSONスキーマ推論を使用してJSONをクエリし、テーブルスキーマを作成します。
- [JSONスキーマの設計](/integrations/data-formats/json/schema) - JSONスキーマを設計し最適化するためのステップ。
- [JSONのエクスポート](/integrations/data-formats/json/exporting) - JSONをエクスポートする方法。
- [その他のJSONフォーマットの取り扱い](/integrations/data-formats/json/other-formats) - 改行区切り（NDJSON）以外のJSONフォーマットの取り扱いに関するいくつかのヒント。
- [JSONモデリングの他のアプローチ](/integrations/data-formats/json/other-approaches) - JSONモデリングの古いアプローチ。**推奨されません。**
