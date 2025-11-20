---
sidebar_label: '概要'
sidebar_position: 10
title: 'JSON の操作'
slug: /integrations/data-formats/json/overview
description: 'ClickHouse における JSON の操作'
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

ClickHouse には JSON を扱うためのいくつかのアプローチがあり、それぞれに長所・短所や使用シーンがあります。このガイドでは、JSON の読み込み方法とスキーマを最適に設計する方法を説明します。このガイドは次のセクションで構成されています。

- [JSON の読み込み](/integrations/data-formats/json/loading) - シンプルなスキーマで、ClickHouse に構造化および半構造化 JSON を読み込み・クエリする方法。
- [JSON スキーマ推論](/integrations/data-formats/json/inference) - JSON スキーマ推論を使用して JSON をクエリし、テーブルスキーマを作成する方法。
- [JSON スキーマの設計](/integrations/data-formats/json/schema) - JSON スキーマを設計・最適化するための手順。
- [JSON のエクスポート](/integrations/data-formats/json/exporting) - JSON をエクスポートする方法。
- [その他の JSON 形式の扱い](/integrations/data-formats/json/other-formats) - 改行区切り (NDJSON) 以外の JSON 形式を扱う際のヒント。
- [JSON モデリングのその他のアプローチ](/integrations/data-formats/json/other-approaches) - JSON をモデリングする従来のアプローチ。**推奨されません。**