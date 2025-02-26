---
sidebar_label: 概要
sidebar_position: 10
title: JSONの取り扱い
slug: /integrations/data-formats/json/overview
description: ClickHouseにおけるJSONの取り扱い
keywords: [json, clickhouse]
---

# 概要

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/gCg5ISOujtc"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

ClickHouseでは、JSONを扱うためのいくつかのアプローチが提供されており、それぞれに利点と欠点、使用用途があります。このガイドでは、JSONをロードし、スキーマを最適に設計する方法について説明します。このガイドは以下のセクションで構成されています：

- [JSONのロード](/integrations/data-formats/json/loading) - シンプルなスキーマでClickHouseにJSON（特に、[NDJSON](https://github.com/ndjson/ndjson-spec)）をロードし、クエリを実行する方法。
- [JSONスキーマ推論](/integrations/data-formats/json/inference) - JSONスキーマ推論を用いてJSONをクエリし、テーブルスキーマを作成する方法。
- [JSONスキーマの設計](/integrations/data-formats/json/schema) - JSONスキーマを設計し、最適化するための手順。
- [JSONのエクスポート](/integrations/data-formats/json/exporting) - JSONをエクスポートする方法。
- [その他のJSONフォーマットの取り扱い](/integrations/data-formats/json/other-formats) - NDJSON以外のJSONフォーマットを扱うためのいくつかのヒント。
- [JSONのモデル化に関する他のアプローチ](/integrations/data-formats/json/other-approaches) - JSONのモデル化に関する高度なアプローチ。**推奨されません。**

:::note 重要: 新しいJSONタイプがベータ版で利用可能
このガイドでは、JSONを扱うための既存の技術を考慮しています。新しいJSONタイプがベータ版で利用可能です。詳細は[こちら](/sql-reference/data-types/newjson)をご覧ください。
:::
