# PR #2 レビュー指摘対応計画

## 概要
PR #2 で指摘されたセキュリティ脆弱性（Decompression Bomb対策）、デプロイスクリプトの不足、および不要因コードへの対応を行います。

## ユーザーレビューが必要な事項
- 入力画像の最大サイズ制限（`16384px`）の導入による影響

## 変更内容

### [Security & Logic]
#### [MODIFY] [src/lib/converter.ts](file:///Users/yokoyama/git/webp-converter-web/src/lib/converter.ts)
- `convertImage` 関数の冒頭に、`createImageBitmap` を使用した画像サイズ（幅・高さ）の事前チェックを追加します。
- 制限値として `MAX_INPUT_DIMENSION = 16384` を定義し、これを超える場合はエラーをスローして処理を中断します。
- これにより、Wasmデコーダーでの大量メモリ消費（Decompression Bomb）を防ぎます。

### [Cleanup]
#### [MODIFY] [src/hooks/useConverter.ts](file:///Users/yokoyama/git/webp-converter-web/src/hooks/useConverter.ts)
- `convert` 関数内の `try...catch` ブロックから、到達不能な `AbortError` のハンドリング処理を削除します。

### [Configuration]
#### [MODIFY] [package.json](file:///Users/yokoyama/git/webp-converter-web/package.json)
- `scripts` に `deploy` コマンドを追加します。
  - `"deploy": "wrangler pages deploy dist"`

#### [MODIFY] [README.md](file:///Users/yokoyama/git/webp-converter-web/README.md)
- デプロイコマンドの説明は `npm run deploy` のままで整合性が取れるようになります（変更不要、または微修正）。

## 検証計画
### 自動テスト
- `npm run test` を実行し、既存の機能が壊れていないことを確認します。
- 必要であれば、巨大な画像の拒否ロジックに対するテストケースを追加します（今回はモックが必要なため、手動検証またはコードレビューで担保）。

### 手動検証
- 通常サイズの画像が正常に変換できることを確認します。
- ローカルで `npm run deploy` が実行可能か確認します（ドライラン）。
