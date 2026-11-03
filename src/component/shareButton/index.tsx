import {
  BRIDE_FULLNAME,
  GROOM_FULLNAME,
  LOCATION,
  SHARE_ADDRESS,
  SHARE_ADDRESS_TITLE,
  WEDDING_DATE,
  WEDDING_DATE_FORMAT,
} from "../../const"
import ktalkIcon from "../../icons/ktalk-icon.png"
import { LazyDiv } from "../lazyDiv"
import { useKakao } from "../store"

const baseUrl = import.meta.env.BASE_URL

/**
 * 카카오톡으로 초대장을 공유할 수 있는 버튼 컴포넌트입니다.
 *
 * @returns {JSX.Element} 공유 버튼 섹션
 */
export const ShareButton = () => {
  const kakao = useKakao()
  return (
    <LazyDiv className="footer share-button">
      <button
        className="ktalk-share"
        onClick={() => {
          // 카카오 SDK 키가 없으면 기기 공유 기능 또는 링크 복사로 대체
          if (!kakao) {
            const url = window.location.href
            const title = `${GROOM_FULLNAME} ❤️ ${BRIDE_FULLNAME}의 결혼식에 초대합니다.`
            if (navigator.share) {
              navigator.share({ title, url }).catch(() => {})
            } else {
              navigator.clipboard
                .writeText(url)
                .then(() => alert("링크가 복사되었습니다."))
                .catch(() => alert("주소창의 링크를 복사해 주세요."))
            }
            return
          }

          // 카카오톡 공유 전송 (위치 기반 템플릿 사용)
          kakao.Share.sendDefault({
            objectType: "location",
            address: SHARE_ADDRESS,
            addressTitle: SHARE_ADDRESS_TITLE,
            content: {
              title: `${GROOM_FULLNAME} ❤️ ${BRIDE_FULLNAME}의 결혼식에 초대합니다.`,
              description:
                WEDDING_DATE.format(WEDDING_DATE_FORMAT) + "\n" + LOCATION,
              imageUrl:
                window.location.protocol +
                "//" +
                window.location.host +
                baseUrl +
                "/preview_image.png",
              link: {
                mobileWebUrl:
                  window.location.protocol +
                  "//" +
                  window.location.host +
                  baseUrl,
                webUrl:
                  window.location.protocol +
                  "//" +
                  window.location.host +
                  baseUrl,
              },
            },
            buttons: [
              {
                title: "초대장 보기",
                link: {
                  mobileWebUrl:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    baseUrl,
                  webUrl:
                    window.location.protocol +
                    "//" +
                    window.location.host +
                    baseUrl,
                },
              },
            ],
          })
        }}
      >
        <img src={ktalkIcon} alt="ktalk-icon" /> 청첩장 공유하기
      </button>
    </LazyDiv>
  )
}
