# クライアントサイド処理への移行 (Walkthrough)

サーバーサイド（Hono）で行っていた画像変換処理を、WebAssembly (`@jsquash`) を使用してクライアントサイド（ブラウザ）に完全に移行しました。
これにより、バックエンドサーバーが不要になり、静的サイトとしてデプロイ可能になりました。

## 主な変更点

### 1. サーバーの削除
- `server` ディレクトリを削除しました。
- `package.json` からサーバー関連のスクリプトとワークスペース設定を削除しました。

### 2. クライアントサイド実装 (`client/`)
- **WebAssembly ライブラリの導入**: `@jsquash/avif`, `@jsquash/jpeg`, `@jsquash/png`, `@jsquash/webp`, `@jsquash/resize` を追加しました。
- **変換ロジックの実装**: `client/src/lib/converter.ts` に画像変換ロジックを実装しました。
- **React フックの更新**: `useConverter` フックを更新し、API呼び出し(`fetch`)をやめ、直接 `convertImage` 関数を呼び出すようにしました。
- **Vite 設定の更新**: `.wasm` ファイルをアセットとして扱う設定と、Vitest の設定を追加しました。

### 3. テストの導入
- **Vitest**: クライアントサイドのロジックをテストするために `vitest` を導入しました。
- **単体テスト**: `client/src/lib/converter.test.ts` を作成し、変換ロジックの主要な動作（モジュールのロード、形式判定、リサイズ計算など）をテストしています。

### 4. デプロイ設定
- **Cloudflare Pages**: 静的サイトとしてデプロイするための `wrangler.jsonc` を作成しました。
- `npm run deploy` コマンドで `client/dist` ディレクトリを Cloudflare Pages にデプロイできるようにしました。

## 検証結果

### 自動テスト
- `npm run test` コマンドですべてのテストが通過することを確認しました。

### ビルド
- `npm run build` コマンドでクライアントアプリケーションが正常にビルドできることを確認しました。

## 今後の手順

- ローカルでの動作確認: `npm run dev` で起動し、実際に画像をドラッグ＆ドロップして変換できるか確認してください。
- デプロイ: `npm run deploy` を実行することで、Cloudflare Pages にデプロイできます（初回はログイン等の設定が必要な場合があります）。
