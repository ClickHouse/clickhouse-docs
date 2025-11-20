import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>IP アクセスリストを管理する</summary>

  ClickHouse Cloud のサービス一覧から操作するサービスを選択し、**Settings** に切り替えます。IP アクセスリストに、ClickHouse Cloud サービスへ接続する必要があるリモートシステムの IP アドレスまたはアドレス範囲が含まれていない場合は、**Add IPs** を使用して解決できます。

  <Image size="md" img={ip_allow_list_check_list} alt="IP アクセスリストで、このサービスが自分の IP アドレスからのトラフィックを許可しているか確認する" border />

  ClickHouse Cloud サービスへ接続する必要がある個々の IP アドレス、またはアドレス範囲を追加します。必要に応じてフォームを編集し、**Save** をクリックします。

  <Image size="md" img={ip_allow_list_add_current_ip} alt="ClickHouse Cloud の IP アクセスリストに現在の IP アドレスを追加する" border />
</details>
