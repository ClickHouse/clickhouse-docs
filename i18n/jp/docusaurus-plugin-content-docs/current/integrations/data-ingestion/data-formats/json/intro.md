---
sidebar_label: '概要'
sidebar_position: 10
title: 'JSON の扱い'
slug: /integrations/data-formats/json/overview
description: 'ClickHouse における JSON の扱い'
keywords: ['json', 'clickhouse']
score: 10
doc_type: 'guide'
---

# JSON の概要 {#json-overview}

<iframe
  src="//www.youtube.com/embed/gCg5ISOujtc"
  frameborder="0"
  allow="autoplay;
fullscreen;
picture-in-picture"
  allowfullscreen
/>

<br />

ClickHouse では JSON を扱うための複数のアプローチを提供しており、それぞれに長所・短所や適したユースケースがあります。このガイドでは、JSON の読み込み方法とスキーマを最適に設計する方法について説明します。このガイドは次のセクションで構成されています。

* [Loading JSON](/integrations/data-formats/json/loading) - シンプルなスキーマを用いて、ClickHouse で構造化および半構造化 JSON を読み込み、クエリする方法。
* [JSON schema inference](/integrations/data-formats/json/inference) - JSON schema inference を使用して JSON に対してクエリを実行し、テーブルスキーマを作成する方法。
* [Designing JSON schema](/integrations/data-formats/json/schema) - JSON スキーマを設計および最適化するための手順。
* [Exporting JSON](/integrations/data-formats/json/exporting) - JSON をエクスポートする方法。
* [Handling other JSON Formats](/integrations/data-formats/json/other-formats) - 改行区切り JSON (NDJSON) 以外の JSON フォーマットを扱う際のヒント。
* [Other approaches to modeling JSON](/integrations/data-formats/json/other-approaches) - JSON をモデリングする従来のアプローチ。**非推奨です。**