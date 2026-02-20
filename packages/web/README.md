# WebP Converter Web

[webp.milkmaccya.com](https://webp.milkmaccya.com) でホストされています。

クライアントサイド（ブラウザ）で完結する画像変換アプリケーションです。
WebAssembly (`@jsquash`) を使用して、サーバーを介さずに画像を WebP 形式に変換・リサイズします。

## 機能

- 画像のドラッグ＆ドロップによる読み込み
- JPEG, PNG, AVIF などの画像を WebP に変換
- 変換後の画質設定
- 画像のリサイズ
- 変換前後のファイルサイズ比較とプレビュー

## 技術スタック

- React / Vite / TypeScript
- Tailwind CSS / shadcn/ui
- @jsquash (WebAssembly)
- Cloudflare Workers

## 開発

```bash
# 依存関係のインストール（リポジトリルートで）
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm run test

# ビルド
npm run build

# Cloudflare Workers へのデプロイ
npm run deploy
```
