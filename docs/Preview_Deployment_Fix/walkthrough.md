# プレビューデプロイメント失敗の修正

## 修正内容
プレビューデプロイメントが失敗する問題に対し、以下の修正を行い `feature/client-side-migration` ブランチにプッシュしました。

### 1. Wrangler設定の追加 (`wrangler.jsonc`)
Cloudflare Pagesへのデプロイ時に静的アセットのディレクトリ（`./dist`）が見つからないエラーが発生していたため、`wrangler.jsonc` に `assets` 設定を追加しました。また、`compatibility_date` も明示しました。

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

### 2. テストコマンドの修正 (`package.json`)
CI環境で `npm run test` が実行された際、Vitestがデフォルトのウォッチモードで起動し、プロセスが終了せずにタイムアウトする可能性がありました。これを防ぐため、`test` コマンドをシングルランモードに変更しました。

**変更前:**
```json
"test": "vitest"
```

**変更後:**
```json
"test": "vitest run",
"test:watch": "vitest"
```

## 検証結果
- ローカル環境での `npm run test` （`vitest run`）が正常に終了することを確認しました。
- 修正を含むコミットを `feature/client-side-migration` ブランチにプッシュしました。

GitHub Actions または Cloudflare Pages のダッシュボードにて、新しいデプロイが成功するかご確認ください。
