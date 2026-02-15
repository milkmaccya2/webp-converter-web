# クライアントサイド処理への移行計画

Honoサーバーで行っていた画像処理ロジックをすべてクライアント（ブラウザ）側に移行します。これには `@jsquash` ライブラリ（WebAssembly）を使用します。これによりバックエンドサーバーが不要になり、アプリケーションを静的サイトとしてデプロイできるようになります。
また、Cloudflare (Pages) へのデプロイ設定と、クライアントサイドのテスト環境(Vitest)の構築も行います。

## ユーザー確認事項
> [!IMPORTANT]
> この変更により、バックエンドサーバーは完全に削除されます。アプリケーションは静的サイトになります。
> サーバー側のテスト(`server/__tests__`)も削除されるため、クライアント側で新たにテストを構築します。

## 変更内容

### Client (`client/`)
追加する依存関係:
- `@jsquash/avif`
- `@jsquash/jpeg`
- `@jsquash/png`
- `@jsquash/resize`
- `@jsquash/webp`
- `vitest` (Dev)
- `@testing-library/react` (Dev)
- `jsdom` (Dev)

#### [NEW] [converter.ts](file:///Users/yokoyama/git/webp-converter-web/client/src/lib/converter.ts)
- Wasmバイナリをロードする `initModules()` を実装します。
- `server/src/routes/convert.ts` のロジックを模倣した `convertImage()` 関数を実装します。

#### [NEW] [converter.test.ts](file:///Users/yokoyama/git/webp-converter-web/client/src/lib/converter.test.ts)
- `convertImage()` 関数の単体テストを実装します。

#### [MODIFY] [App.tsx](file:///Users/yokoyama/git/webp-converter-web/client/src/App.tsx)
- `fetch('/api/convert', ...)` の呼び出しを、新しいクライアント側の `convertImage()` 関数の呼び出しに置き換えます。

#### [MODIFY] [vite.config.ts](file:///Users/yokoyama/git/webp-converter-web/client/vite.config.ts)
- 必要に応じてWasmファイルを正しく処理できるように設定を調整します。
- APIプロキシ設定を削除します。
- Vitest用の設定を追加します。

### Deployment
#### [NEW] [wrangler.jsonc](file:///Users/yokoyama/git/webp-converter-web/wrangler.jsonc)
- Cloudflare Pages (Static Assets) 用の設定ファイルを作成します。
- 静的サイトホスティングとして構成します。

### Server (`server/`)
- 移行と検証が完了した後、`server` ディレクトリ全体（テストコード含む）を削除します。

### Root
#### [MODIFY] [package.json](file:///Users/yokoyama/git/webp-converter-web/package.json)
- サーバー関連のスクリプトとワークスペース設定を削除します。
- `dev` スクリプトをクライアントのみ実行するように更新します。
- `deploy` スクリプトを追加します (`wrangler pages deploy dist` 等)。
- `test` スクリプトをクライアントのテストを実行するように更新します。

## 検証計画

### 自動テスト
- `npm run test` を実行し、クライアント側の単体テストが通過することを確認します。

### 手動検証
- 開発サーバーを起動します (`npm run dev`)。
- サポートされている画像（JPEG, PNG, WebP）をアップロードし、ブラウザ上で正しくWebPに変換されることを確認します。
- ブラウザのコンソールでWasmの読み込みエラーがないか確認します。
- ダウンロード機能が正常に動作することを確認します。
- Cloudflareへのデプロイコマンドが成功することを確認します (ドライラン等)。
