---
description: 'ClickHouse を用いたハードウェア性能テストとベンチマークのガイド'
sidebar_label: 'ハードウェアのテスト'
sidebar_position: 54
slug: /operations/performance-test
title: 'ClickHouse でハードウェアをテストする方法'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse パッケージをインストールしなくても、どのサーバー上でも基本的な ClickHouse の性能テストを実行できます。


## 自動実行 {#automated-run}

単一のスクリプトでベンチマークを実行できます。

1. スクリプトをダウンロードします。

```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. スクリプトを実行します。

```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 出力結果をコピーして feedback@clickhouse.com に送信してください

すべての結果はこちらで公開されています: https://clickhouse.com/benchmark/hardware/
