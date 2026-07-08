---
sidebar_label: 'コードインタープリター'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/builder/code-interpreter
title: 'コードインタープリター'
description: 'ClickHouse Agentsにおけるサンドボックス化されたコード実行'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'コードインタープリター', 'サンドボックス', 'python']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import runCode from '@site/static/images/cloud/agent-builder/run-code/run-code.png';

<BetaBadge />

コードインタープリターを使うと、エージェントは管理されたサンドボックス環境でコードを実行できます。計算、データ変換、フォーマット変換、プロットの作成など、自然言語よりもコードで処理するほうが適した作業に使用してください。

## コードインタープリターを有効にする \{#enable-it\}

Agent Builder の **Capabilities** セクションで **Run Code** を有効にし、保存します。コードを実行するタイミングは、ユーザーのリクエストとエージェントへの指示に基づいてエージェントが判断します。

<Image img={runCode} alt="Run Code チェックボックスが有効になり、Upload to Code Environment ボタンが表示された Capabilities パネルの Run Code セクション" size="sm" />

## サポートされている言語 \{#supported-languages\}

サンドボックスは、2 つの汎用ランタイムといくつかのシェルユーティリティを備えた Unix 環境です。

* **Python 3** - データ処理ではこれがデフォルトです。
* **Node.js (JavaScript)** - エージェントが作業に JS を使いたい場合に使用します。
* **Bash** と **sh** - コマンドの連結や簡単な I/O に使うシェルスクリプトです。
* **AWK** と **sed** - 行指向のテキスト処理向けです。
* **bc** - 任意精度の計算に使用します。

データのパース、変換、計算を伴う処理では、まず Python を使ってください。

:::tip
シェルツールは、ワンライナーで明確な利点がある作業に限って使用してください。
:::

## ファイル \{#files\}

ユーザーは会話にファイルをアップロードできます。コードインタープリターは、サンドボックスの作業ディレクトリ内にあるそれらのファイルにアクセスできます。コードは出力ファイル (CSV、プロット、アーカイブ) を書き出すこともでき、それらはダウンロード可能な添付ファイルとして会話に表示されます。

## サンドボックスの分離 \{#sandbox-isolation\}

各実行は、ネットワークアクセスも永続ストレージもない、一時的なサンドボックスで実行されます。セッション間で状態は共有されません。つまり、エージェントが明示的に再読み込みしない限り、ある実行で使用した変数やファイルは次の実行には引き継がれません。

プランごとのリソース制限 (メモリ、実行あたりのファイル数、月間リクエスト quotas) が適用されます。error と stderr は、stdout とあわせて会話内に表示されます。

## 使用するタイミング \{#when-to-use-it\}

推論だけでは言語モデルが確実に処理できない、決定的な計算が必要な場合は、コードインタープリターを使用します。
代表的なケースは次のとおりです。

* ユーザーがアップロードしたCSVファイルまたはJSONファイルをパースする。
* 要約統計量を計算したり、簡単なシミュレーションを実行したりする。
* フォーマット間で変換する (Parquet、JSON、CSV) 。
* クエリ結果からプロットを生成する。

:::tip
モデルが文脈だけで回答できるタスクには使用しないでください。
コード実行はレイテンシを増やし、クォータを消費します。
:::