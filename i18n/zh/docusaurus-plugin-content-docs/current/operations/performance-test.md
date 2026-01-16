---
description: '使用 ClickHouse 测试和基准测试硬件性能的指南'
sidebar_label: '测试硬件'
sidebar_position: 54
slug: /operations/performance-test
title: '如何使用 ClickHouse 测试硬件性能'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

你可以在任何服务器上运行基本的 ClickHouse 性能测试，而无需安装 ClickHouse 软件包。

## 自动化运行 \\{#automated-run\\}

你只需使用一个脚本即可运行基准测试。

1. 下载脚本。

```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. 运行脚本。

```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 复制输出内容并发送到 [feedback@clickhouse.com](mailto:feedback@clickhouse.com)

所有结果均发布于此页面： [https://clickhouse.com/benchmark/hardware/](https://clickhouse.com/benchmark/hardware/)
