import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>IP アクセスリストを管理する</summary>

  ClickHouse Cloud のサービス一覧から対象のサービスを選択し、**Settings** に切り替えます。IP アクセスリストに、ClickHouse Cloud サービスへ接続する必要があるリモートシステムの IP アドレスまたはアドレス範囲が含まれていない場合は、**Add IPs** を使用して解決できます。

  <Image size="md" img={ip_allow_list_check_list} alt="サービスが IP アクセスリストで自分の IP アドレスからのトラフィックを許可しているかを確認する" border />

  ClickHouse Cloud サービスに接続する必要がある個々の IP アドレス、またはアドレス範囲を追加します。必要に応じてフォームを編集し、**Save** をクリックします。

  <Image size="md" img={ip_allow_list_add_current_ip} alt="自分の現在の IP アドレスを ClickHouse Cloud の IP アクセスリストに追加する" border />
</details>
