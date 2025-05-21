---
description: 'ClickHouseを用いたハードウェア性能のテストとベンチマーキングに関するガイド'
sidebar_label: 'ハードウェアのテスト'
sidebar_position: 54
slug: /operations/performance-test
title: 'ClickHouseでハードウェアをテストする方法'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseパッケージのインストールなしで、任意のサーバーで基本的なClickHouseパフォーマンステストを実行できます。


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

3. 出力をコピーして、 feedback@clickhouse.com に送信してください。

すべての結果はここで公開されています: https://clickhouse.com/benchmark/hardware/
