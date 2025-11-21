---
sidebar_label: '概要'
sidebar_position: 10
title: 'JSON の利用'
slug: /integrations/data-formats/json/overview
description: 'ClickHouse における JSON の利用'
keywords: ['json', 'clickhouse']
score: 10
doc_type: 'guide'
---

# JSON の概要

<iframe src="//www.youtube.com/embed/gCg5ISOujtc"
frameborder="0"
allow="autoplay;
fullscreen;
picture-in-picture"
allowfullscreen>
</iframe>

<br/>

ClickHouse は JSON を扱うために複数のアプローチを提供しており、それぞれに利点と欠点、適したユースケースがあります。このガイドでは、JSON の読み込み方法と最適なスキーマ設計について説明します。このガイドは次のセクションで構成されています:

- [JSON の読み込み](/integrations/data-formats/json/loading) - シンプルなスキーマを用いて、構造化および半構造化 JSON を ClickHouse に読み込み、クエリする方法。
- [JSON スキーマ推論](/integrations/data-formats/json/inference) - JSON スキーマ推論を用いて JSON をクエリし、テーブルスキーマを作成する方法。
- [JSON スキーマ設計](/integrations/data-formats/json/schema) - JSON スキーマを設計および最適化するための手順。
- [JSON のエクスポート](/integrations/data-formats/json/exporting) - JSON をエクスポートする方法。
- [その他の JSON 形式の扱い](/integrations/data-formats/json/other-formats) - 改行区切り（NDJSON）以外の JSON 形式を扱う際のヒント。
- [JSON モデリングのその他のアプローチ](/integrations/data-formats/json/other-approaches) - JSON をモデリングするレガシーなアプローチ。**推奨されません。**