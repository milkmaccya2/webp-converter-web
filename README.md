# WebP Converter Web

クライアントサイド（ブラウザ）で完結する画像変換アプリケーションです。
WebAssembly (`@jsquash`) を使用して、サーバーを介さずに画像を WebP 形式に変換・リサイズします。

## 機能
- 画像のドラッグ＆ドロップによる読み込み
- JPEG, PNG, AVIF などの画像を WebP に変換
- 変換後の画質設定
- 画像のリサイズ（幅・高さの指定）
- 変換前後のファイルサイズ比較とプレビュー

## 技術スタック
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- @jsquash (WebAssembly)
- Vitest

## 開発の始め方

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### テストの実行
```bash
npm run test
```

### ビルド
```bash
npm run build
```

## デプロイ
Cloudflare Workers へのデプロイ設定が含まれています。

```bash
npm run deploy
```
