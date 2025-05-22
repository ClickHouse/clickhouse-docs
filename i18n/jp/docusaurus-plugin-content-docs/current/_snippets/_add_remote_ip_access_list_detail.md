---
{}
---

import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>IP アクセスリストの管理</summary>

ClickHouse Cloud サービスリストから作業するサービスを選択し、**設定**に切り替えます。IP アクセスリストに ClickHouse Cloud サービスに接続する必要があるリモートシステムの IP アドレスまたは範囲が含まれていない場合、**IP の追加**で問題を解決できます：

<Image size="md" img={ip_allow_list_check_list} alt="IP アクセスリストでサービスがあなたの IP アドレスからのトラフィックを許可しているか確認する" border />

接続する必要がある個々の IP アドレスまたはアドレスの範囲を追加します。フォームを適宜修正し、次に **保存**します。

<Image size="md" img={ip_allow_list_add_current_ip} alt="ClickHouse Cloud の IP アクセスリストに現在の IP アドレスを追加" border />

</details>
