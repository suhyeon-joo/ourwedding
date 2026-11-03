/**
 * 이미지는 파일만 넣으면 자동으로 반영됩니다.
 *  - 표지: src/images/cover.(jpg|jpeg|png|webp)
 *  - 갤러리: src/images/gallery/ 폴더의 사진 (파일명 순서대로 표시: 01.jpg, 02.jpg ...)
 */
const covers = import.meta.glob("./cover.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>

const gallery = import.meta.glob("./gallery/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>

/**
 * 메인 커버 이미지
 */
export const COVER_IMAGE = Object.values(covers)[0] ?? ""

/**
 * 갤러리에 표시될 이미지 목록
 */
export const GALLERY_IMAGES = Object.keys(gallery)
  .sort()
  .map((key) => gallery[key])
