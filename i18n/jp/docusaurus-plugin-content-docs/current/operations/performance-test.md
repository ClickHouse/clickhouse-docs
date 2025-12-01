---
description: 'ClickHouse を用いたハードウェア性能テストとベンチマークのガイド'
sidebar_label: 'ハードウェアテスト'
sidebar_position: 54
slug: /operations/performance-test
title: 'ClickHouse でハードウェア性能をテストする方法'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse パッケージをインストールしなくても、どのサーバー上でも ClickHouse の基本的な性能テストを実行できます。

## 自動実行 {#automated-run}

ベンチマークは 1 つのスクリプトだけで実行できます。

1. スクリプトをダウンロードします。

```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. スクリプトを実行します。

```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 出力結果をコピーして [feedback@clickhouse.com](mailto:feedback@clickhouse.com) 宛に送信してください

すべての結果は以下で公開されています: [https://clickhouse.com/benchmark/hardware/](https://clickhouse.com/benchmark/hardware/)
