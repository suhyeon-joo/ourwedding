import nmapIcon from "../../icons/nmap-icon.png"
import knaviIcon from "../../icons/knavi-icon.png"
import tmapIcon from "../../icons/tmap-icon.png"
import { LOCATION } from "../../const"

/**
 * 길찾기 앱(네이버 지도, 카카오맵, 티맵) 연동 버튼 모음입니다.
 * 별도의 API 키 없이 장소명 검색으로 앱(모바일) 또는 웹(PC)을 엽니다.
 *
 * @returns {JSX.Element} 지도 앱 연결 버튼
 */
export const Map = () => {
  const query = encodeURIComponent(LOCATION)

  const checkDevice = () => {
    const userAgent = window.navigator.userAgent
    if (/(iPhone|iPod|iPad)/.test(userAgent)) return "ios"
    if (/(Android)/.test(userAgent)) return "android"
    return "other"
  }
  const isMobile = () => checkDevice() !== "other"

  return (
    <div className="navigation">
      <button
        onClick={() => {
          if (isMobile()) {
            window.open(
              `nmap://search?query=${query}&appname=${encodeURIComponent(window.location.hostname)}`,
              "_self",
            )
          } else {
            window.open(`https://map.naver.com/p/search/${query}`, "_blank")
          }
        }}
      >
        <img src={nmapIcon} alt="naver-map-icon" />
        네이버 지도
      </button>

      <button
        onClick={() => {
          if (isMobile()) {
            window.open(`kakaomap://search?q=${query}`, "_self")
          } else {
            window.open(`https://map.kakao.com/?q=${query}`, "_blank")
          }
        }}
      >
        <img src={knaviIcon} alt="kakao-map-icon" />
        카카오맵
      </button>

      <button
        onClick={() => {
          if (isMobile()) {
            window.open(`tmap://search?name=${query}`, "_self")
          } else {
            alert("모바일에서 확인하실 수 있습니다.")
          }
        }}
      >
        <img src={tmapIcon} alt="t-map-icon" />
        티맵
      </button>
    </div>
  )
}
