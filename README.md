# 이상엽 · 주수현 모바일 청첩장

[juhonamnam/wedding-invitation](https://github.com/juhonamnam/wedding-invitation) (MIT) 템플릿을 바탕으로 만든 청첩장입니다.
서버·API 키 없이 GitHub Pages로만 운영되어 비용이 0원입니다.

배포 주소: https://suhyeon-joo.github.io/invite/

## 사진 넣기
- `src/images/cover.jpg` : 표지 사진 (세로형, 가로 800px 안팎 권장)
- `src/images/gallery/01.jpg ~ 14.jpg` : 갤러리 사진 (파일명 순서대로 표시, 장수 제한 없음)
- `public/preview_image.png` : 카톡/문자 공유 미리보기 (1200x630 권장, 현재는 문구만 있는 임시 이미지)
- 사진은 한 장에 500KB 안팎으로 줄이면 빨리 뜹니다.

## 정보 고치기
- 이름·날짜·장소·계좌·전화번호: `src/const.ts`
  - `account`, `phone` 을 채우면 자동으로 화면에 나타나고, 비워두면 숨겨집니다.
- 초대 문구: `src/component/invitation/index.tsx`
- 오시는 길 안내: `src/component/location/index.tsx`

## 배포 (GitHub Pages)
1. 이 폴더 전체를 `suhyeon-joo/invite` 저장소의 `main` 브랜치에 올립니다.
2. Settings → Pages → Build and deployment → Source 를 **GitHub Actions** 로 선택합니다.
3. Actions 탭에서 Deploy 가 끝나면 위 배포 주소로 접속됩니다. 이후 `main` 에 푸시할 때마다 자동 재배포됩니다.

로컬 확인: `npm install` → `npm run dev`
