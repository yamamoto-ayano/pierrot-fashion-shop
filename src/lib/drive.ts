// DriveファイルID（カンマ区切りもOK）→ 表示URL（サムネ用は先頭IDを使用）
export function firstDriveId(value: string) {
  if (!value) return ""
  const split = value.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
  return split[0] ?? ""
}

// 画像として直接返すURL（共有設定：リンクを知っている全員が閲覧可 にしておく）
export function driveImageUrl(id: string) {
  if (!id) return ""
  return `https://drive.google.com/thumbnail?id=${id}`
}

// 画像URLを生成（既存のURLかDrive IDかを判定）
export function asImageUrl(raw?: string) {
  if (!raw) return ""
  const val = raw.trim()

  // すでに http/https ならそのまま
  if (/^https?:\/\//i.test(val)) return val

  // そうでなければ Drive のIDだとみなす
  const id = firstDriveId(val)
  return id ? driveImageUrl(id) : ""
}
  