---
sidebar_label: 概要
sidebar_position: 10
title: JSONの操作
slug: /integrations/data-formats/json/overview
description: ClickHouseにおけるJSONの操作
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

ClickHouseはJSONを扱うためのいくつかのアプローチを提供しており、それぞれに利点と欠点、用途があります。このガイドでは、JSONの読み込みとスキーマの最適な設計方法について説明します。このガイドは以下のセクションで構成されています。

- [JSONの読み込み](/integrations/data-formats/json/loading) - 簡単なスキーマを使用したClickHouseでのJSON（特に、[NDJSON](https://github.com/ndjson/ndjson-spec)）の読み込みとクエリ。
- [JSONスキーマ推論](/integrations/data-formats/json/inference) - JSONスキーマ推論を使用してJSONをクエリし、テーブルスキーマを作成します。
- [JSONスキーマの設計](/integrations/data-formats/json/schema) - JSONスキーマの設計と最適化の手順。
- [JSONのエクスポート](/integrations/data-formats/json/exporting) - JSONをエクスポートする方法。
- [他のJSONフォーマットの扱い](/integrations/data-formats/json/other-formats) - NDJSON以外のJSONフォーマットの扱いに関するいくつかのヒント。
- [JSONのモデリングに関する他のアプローチ](/integrations/data-formats/json/other-approaches) - JSONのモデリングに関する高度なアプローチ。**推奨されません。**

:::note 重要: 新しいJSONタイプがベータ版で利用可能
このガイドでは、JSONを扱うための既存の技術を考慮しています。新しいJSONタイプがベータ版で利用可能です。詳細は[こちら](/sql-reference/data-types/newjson)を参照してください。
:::
