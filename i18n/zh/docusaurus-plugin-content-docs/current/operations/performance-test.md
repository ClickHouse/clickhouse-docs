---
'description': '使用 ClickHouse 测试和基准测试硬件性能的指南'
'sidebar_label': '测试硬件'
'sidebar_position': 54
'slug': '/operations/performance-test'
'title': '如何使用 ClickHouse 测试您的硬件'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

您可以在任何服务器上运行基本的 ClickHouse 性能测试，而无需安装 ClickHouse 包。

## 自动运行 {#automated-run}

您可以使用一个脚本运行基准测试。

1. 下载脚本。
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. 运行脚本。
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 复制输出并发送到 feedback@clickhouse.com

所有结果都发布在这里： https://clickhouse.com/benchmark/hardware/
