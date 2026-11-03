import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

// dayjs 설정: UTC 및 타임존 플러그인 확장, 한국어 로캘 설정
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export { dayjs }

/**
 * 예식 일시 설정
 * Asia/Seoul 타임존 기준으로 설정합니다.
 */
export const WEDDING_DATE = dayjs.tz("2027-03-01 12:30", "Asia/Seoul")

/**
 * 예식 일시 포맷
 * 분이 0이면 분을 생략하고, 그 외에는 표시합니다.
 * 예: 2027년 3월 1일 월요일 오후 12시 30분
 */
export const WEDDING_DATE_FORMAT = `YYYY년 MMMM D일 dddd A h시${WEDDING_DATE.minute() === 0 ? "" : " m분"}`

/**
 * 예식 당월 휴무일 (달력 표시용)
 * 3월 1일 삼일절
 */
export const HOLIDAYS = [1]

/**
 * 예식 장소 명칭 (지도 앱 검색어로도 사용됩니다)
 */
export const LOCATION = "선릉 르비르모어"

/**
 * 예식 장소 상세 (홀 이름 / 주소)
 * 정확한 주소를 알면 "클리타 홀, 서울시 ..." 처럼 추가하세요.
 */
export const LOCATION_ADDRESS = "클리타 홀"

/**
 * 카카오톡 공유 시 사용할 위치 정보 주소
 */
export const SHARE_ADDRESS = LOCATION

/**
 * 카카오톡 공유 시 표시될 위치 제목
 */
export const SHARE_ADDRESS_TITLE = LOCATION

// 신부 정보 설정
export const BRIDE_FULLNAME = "주수현"
export const BRIDE_FIRSTNAME = "수현"
export const BRIDE_TITLE = "딸"
export const BRIDE_FATHER = "주광운"
export const BRIDE_MOTHER = "김경미"

/**
 * 신부측 연락처 및 계좌 정보
 * phone, account 를 비워두면 화면에 표시되지 않습니다.
 */
export const BRIDE_INFO = [
  {
    relation: "신부",
    name: BRIDE_FULLNAME,
    phone: "",
    account: "새마을금고 9003 2173 4726 8",
  },
  {
    relation: "신부 아버지",
    name: BRIDE_FATHER,
    phone: "",
    account: "",
  },
  {
    relation: "신부 어머니",
    name: BRIDE_MOTHER,
    phone: "",
    account: "",
  },
]

// 신랑 정보 설정
export const GROOM_FULLNAME = "이상엽"
export const GROOM_FIRSTNAME = "상엽"
export const GROOM_TITLE = "아들"
export const GROOM_FATHER = "이구영"
export const GROOM_MOTHER = "한미경"

/**
 * 신랑측 연락처 및 계좌 정보
 * phone, account 를 비워두면 화면에 표시되지 않습니다.
 * 예: account: "우리은행 1002-000-000000"
 */
export const GROOM_INFO = [
  {
    relation: "신랑",
    name: GROOM_FULLNAME,
    phone: "",
    account: "",
  },
  {
    relation: "신랑 아버지",
    name: GROOM_FATHER,
    phone: "",
    account: "",
  },
  {
    relation: "신랑 어머니",
    name: GROOM_MOTHER,
    phone: "",
    account: "",
  },
]
