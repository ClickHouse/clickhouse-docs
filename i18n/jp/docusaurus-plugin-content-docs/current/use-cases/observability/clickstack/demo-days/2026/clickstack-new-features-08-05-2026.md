---
slug: /use-cases/observability/clickstack/demo-days/2026/05/2026-05-08
title: 'デモデイズ - 2026-05-08'
sidebar_label: '2026-05-08'
pagination_prev: null
pagination_next: null
description: 'ClickStack デモデイズ（2026-05-08）'
doc_type: 'guide'
keywords: ['ClickStack', 'デモデイズ']
sidebar_position: -20260508
---

## webhook におけるシークレットの取り扱いを改善 \{#improved-handling-of-secrets-in-webhooks\}

*デモ: [@dhable](https://github.com/dhable)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aD7sT5dc470" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Webhook URL やヘッダーには、認証情報が平文のまま含まれていることが少なくありません。Slack の webhook URL ではシークレットトークンがパスに含まれ、HTTP webhook では通常、認証のために Authorization ヘッダーが必要になります。このリリースまでは、webhook の一覧表示や編集に使われる HyperDX の内部 API が、そうした情報を毎回のリクエストでそのまま返していました。そのため、認証済みのチームメンバーであれば、API を呼び出すだけでシークレットを確認できてしまう状態でした。

この変更では、公開 API ですでに使われているものと同じマスキング方式を適用しています。Webhook URL はパス部分を `****` に置き換えた状態で返されるため、Slack トークン (またはパスに埋め込まれたその他のキー) がサーバーの外に出ることはありません。また、どのヘッダーにシークレットが含まれているかを確実に判別する方法がないため、ヘッダーもデフォルトでマスキングされます。すべての値は `****` に置き換えられ、見えるのはヘッダー名だけです。

編集フォームでは、このマスク済みの値を「変更なし」として扱います。そのままにしておけば保存済みの値は維持され、変更すれば新しい値が保存され、消去すればそのフィールドは完全に削除されます。これにより、実際のシークレットをブラウザ経由で往復させることなく、一般的な操作 (1 つのフィールドの編集) でもわかりやすいワークフローを維持できます。

**関連 PR:** [#2239](https://github.com/hyperdxio/hyperdx/pull/2239) [HDX-4173] 内部 webhook API レスポンスの機微なフィールドをマスク

## アラートの追加メタデータ \{#extra-metadata-in-alerts\}

*[@dhable](https://github.com/dhable) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/evEd7Cc9e1c" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

コミュニティ Slack から、アラートに自由記述のコンテキストを追加し、しきい値の履歴やランブックへのリンク、オンコール担当者向けのメモを書けるようにしてほしいという要望がありました。これは、AI による要約の根拠情報としても役立ちます。これにより、発報中のアラートに応答する LLM は、クエリだけから意図を推測するのではなく、運用担当者自身の判断根拠を参照できるようになります。

メモ フィールドは Markdown をレンダリングできるため、折りたたみセクション、リスト、リンクも利用できます。このフィールドはアラート設定に含まれ、アラートが表示される場所であればどこにでも表示されます。UX はまだ固まっておらず、Markdown の表示対応は出発点にすぎません。どのように表示されるべきかについてのフィードバックを歓迎します。

あわせて、この PR では保存済み検索における発報中アラートの UX も改善しています。Alerts ボタンのベル アイコンには発報中のものがあると赤い点が付き、ダイアログ ボックスではアクティブなアラートがリンクされるだけでなく強調表示されるようになり、視覚表現も同じ状態に対して dashboard タイルですでに使われているものに揃えられました。

**関連 PR:** [#2210](https://github.com/hyperdxio/hyperdx/pull/2210) [HDX-3044] アラートに任意のメモ フィールドを追加

## 候補となるテーマ \{#possible-themes\}

*[@elizabetdev](https://github.com/elizabetdev) によるデモ*

<iframe width="768" height="432" src="https://www.youtube.com/embed/JZYGz6ZOPf4" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

これはハッカソンでの試みで、ClickStack UI に IDE に着想を得た 3 つのテーマ、Nord (寒色系ブルー) 、Catppuccin (パステル調) 、One Dark (Atom 風) を導入したものです。各テーマにはライト版とダーク版がありました。元のテーマ名に基づいて生成したカラートークンを試したところ、全体としてはかなり近づけられたものの、サイドバーの色味や行のコントラストには、なお調整が必要な粗さが残っていました。

この PR は最終的にマージされず、クローズされました。チームは ClickUI への移行を進めており、現時点では単一テーマのみをサポートしています。複数のトークンセットを並行して維持すると継続的な運用負荷が発生し、特に各組み合わせでコントラストを適切に検証し始めると、その負担はさらに大きくなります。そのため、ClickUI 自体がマルチテーマに対応するまでは見送る、という判断になりました。

この実験で得られた設計上の考え方のひとつは、今後この取り組みを再開する際にも覚えておく価値があります。最初のイテレーションでは、テーマごとに HyperDX のロゴも色替えしていましたが、それではブランドらしさが損なわれてしまいます。よりすっきりした方法は、ライトテーマではダークロゴを表示し、ダークテーマではライトロゴを表示し、緑色の HyperDX ワードマーク自体はそのままにすることです。

**関連 PR:** [#2191](https://github.com/hyperdxio/hyperdx/pull/2191) feat: IDE に着想を得たテーマを追加 (Nord、Catppuccin、One Dark)