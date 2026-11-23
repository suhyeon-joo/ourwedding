/* =========================================================
   청첩장 응답 수집 — Google Apps Script 웹앱
   - 참석 의사(RSVP) → 시트 "참석의사"
   - 방명록        → 시트 "방명록"
   설정 순서는 같은 폴더의 README.md 참고.
   ========================================================= */

const SHEET_RSVP = '참석의사';
const SHEET_GUESTBOOK = '방명록';
const LIMIT = { name: 20, message: 200, body: 2000, guests: 4 };
const LIST_LIMIT = 200; // 목록으로 내려줄 최대 건수 (최신순)

// GET: 기본은 브라우저 확인용, ?action=list 는 공개 동의한 방명록 목록(JSON)
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  if (action === 'list') return json_(listGuestbook_());
  return json_({ ok: true, service: 'wedding-rsvp' });
}

// 공개 동의(동의)한 방명록만 최신순으로 반환. 연락처 등 다른 열은 내려주지 않음
function listGuestbook_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_GUESTBOOK);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, items: [] };
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  const items = rows
    .filter((r) => r[3] === '동의' && String(r[2]).trim() !== '')
    .slice(-LIST_LIMIT)
    .reverse()
    .map((r) => ({
      date: r[0] instanceof Date ? Utilities.formatDate(r[0], 'Asia/Seoul', 'yyyy.MM.dd') : '',
      name: unescape_(r[1]),
      message: unescape_(r[2])
    }));
  return { ok: true, items: items };
}

// 저장 시 붙인 수식 방지용 ' 접두어를 표시할 때 제거
function unescape_(v) {
  return String(v || '').replace(/^'(?=[=+\-@])/, '');
}

function doPost(e) {
  try {
    const raw = e && e.postData ? String(e.postData.contents || '') : '';
    if (!raw || raw.length > LIMIT.body) return json_({ ok: false, error: 'bad_request' });

    const data = JSON.parse(raw);
    // 숨은 입력칸이 채워진 요청은 봇으로 보고 저장하지 않음 (성공처럼 응답)
    if (data.website) return json_({ ok: true });

    const name = clean_(data.name, LIMIT.name);
    if (!name) return json_({ ok: false, error: 'name_required' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();

    if (data.type === 'rsvp') {
      const sheet = getSheet_(ss, SHEET_RSVP, ['접수 시각', '이름', '참석 여부', '동행(명)', '식사']);
      const guests = clamp_(parseInt(data.guests, 10) || 0, 0, LIMIT.guests);
      sheet.appendRow([
        now,
        name,
        data.attend === '불참' ? '불참' : '참석',
        guests,
        data.meal === '아니오' ? '아니오' : '예'
      ]);
      return json_({ ok: true });
    }

    if (data.type === 'guestbook') {
      const message = clean_(data.message, LIMIT.message);
      if (!message) return json_({ ok: false, error: 'message_required' });
      const sheet = getSheet_(ss, SHEET_GUESTBOOK, ['접수 시각', '이름', '메시지', '공개 동의']);
      sheet.appendRow([now, name, message, data.publicOk === 'yes' ? '동의' : '비공개']);
      return json_({ ok: true });
    }

    return json_({ ok: false, error: 'unknown_type' });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  }
}

// 시트 헤더가 없으면 만들고, 있으면 그대로 사용
function getSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 길이 제한 + 수식 주입 방지(=, +, -, @ 로 시작하면 앞에 ' 를 붙임)
function clean_(value, max) {
  let s = String(value || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function clamp_(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
