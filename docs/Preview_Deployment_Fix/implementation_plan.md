# プレビューデプロイメント修正計画（最終版）

## 概要
`feature/client-side-migration` ブランチ（非モノレポ構成）において、プレビューデプロイメントの失敗を修正します。
原因は `wrangler` のアセット設定不足と、テストコマンドのデフォルト挙動によるタイムアウトです。

## ユーザーレビューが必要な事項
- `wrangler.jsonc` への設定追加（`assets` 設定および `compatibility_date`）
- `test` コマンドの挙動変更

## 変更内容

### [Configuration]
#### [MODIFY] [wrangler.jsonc](file:///Users/yokoyama/git/webp-converter-web/wrangler.jsonc)
- `assets.directory` を `./dist` に設定します。

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webp-converter-web",
  "pages_build_output_dir": "dist",
  "compatibility_date": "2026-02-15",
  "assets": {
    "directory": "./dist"
  }
}
```

### [Client]
#### [MODIFY] [package.json](file:///Users/yokoyama/git/webp-converter-web/package.json)
- `test` を `"vitest run"` に変更します。
- `"test:watch": "vitest"` を追加します。

## 検証計画
### Cloudflare Workers デプロイ
- 修正をプッシュし、CI/CDでデプロイが成功することを確認します。
