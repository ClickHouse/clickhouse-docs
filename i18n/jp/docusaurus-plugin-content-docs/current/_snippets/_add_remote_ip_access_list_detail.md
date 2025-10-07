

import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>IP アクセスリストの管理</summary>

ClickHouse Cloud のサービスリストから作業するサービスを選択し、**設定**に切り替えます。IP アクセスリストに、接続する必要があるリモートシステムの IP アドレスまたはアドレス範囲が含まれていない場合は、**IP を追加**することで問題を解決できます：

<Image size="md" img={ip_allow_list_check_list} alt="サービスが IP アクセスリスト内のあなたの IP アドレスからのトラフィックを許可しているかどうかを確認します" border />

接続する必要がある個々の IP アドレス、またはアドレス範囲を追加します。必要に応じてフォームを変更し、次に **保存**します。

<Image size="md" img={ip_allow_list_add_current_ip} alt="現在の IP アドレスを ClickHouse Cloud の IP アクセスリストに追加します" border />

</details>
