---
'sidebar_label': '概要'
'sidebar_position': 10
'title': 'JSONを扱う'
'slug': '/integrations/data-formats/json/overview'
'description': 'ClickHouseでのJSONの取り扱い'
'keywords':
- 'json'
- 'clickhouse'
'score': 10
'doc_type': 'guide'
---


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
ClickHouseは、JSONを扱うためのいくつかのアプローチを提供しており、それぞれに長所と短所、使用方法があります。このガイドでは、JSONをロードし、スキーマを最適に設計する方法について説明します。このガイドは以下のセクションで構成されています：

- [JSONのロード](/integrations/data-formats/json/loading) - シンプルなスキーマでClickHouseに構造化されたおよび半構造化されたJSONをロードおよびクエリする方法。
- [JSONスキーマ推論](/integrations/data-formats/json/inference) - JSONスキーマ推論を使用してJSONをクエリし、テーブルスキーマを作成する方法。
- [JSONスキーマの設計](/integrations/data-formats/json/schema) - JSONスキーマを設計し、最適化するためのステップ。
- [JSONのエクスポート](/integrations/data-formats/json/exporting) - JSONをエクスポートする方法。
- [その他のJSONフォーマットの取り扱い](/integrations/data-formats/json/other-formats) - 行区切り（NDJSON）以外のJSONフォーマットを扱うためのいくつかのヒント。
- [JSONのモデリングに関する他のアプローチ](/integrations/data-formats/json/other-approaches) - JSONをモデリングするための従来のアプローチ。**推奨されません。**
