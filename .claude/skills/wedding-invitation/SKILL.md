---
name: wedding-invitation
description: 한국 모바일 웨딩 청첩장(모바일 청첩장, 디지털 청첩장, 웹 청첩장)을 처음부터 끝까지 제작·수정·재실행할 때 반드시 사용하는 오케스트레이터 스킬. "청첩장 만들어줘", "청첩장 제작", "디지털 청첩장", "모바일 청첩장", "웨딩 인비테이션", "청첩장 만들고 싶어", "청첩장 디자인", "청첩장 페이지", "청첩장 사이트", "청첩장 다시 만들어", "청첩장 수정", "청첩장 갤러리만 다시", "청첩장 컨셉 바꿔", "청첩장 인사말 다시", "청첩장 이미지 재생성", "청첩장 인터랙션 추가", "청첩장 애니메이션", "꽃잎 애니메이션", "배경 애니메이션", "BGM 추가", "음악 추가", "스와이프 갤러리", "패럴랙스", "모션 추가", "모션 다시", "결혼식 초대장 웹페이지", "신랑신부 정보 추가", "예식 정보 업데이트" 등 청첩장 관련 모든 작업(초기 생성, 부분 재실행, 컨셉/카피/이미지/모션/프론트엔드 개별 수정, 정보 변경, 인터랙션 보완, 애니메이션 보완) 시 트리거. 6명의 전문가 에이전트 팀(concept-director, copy-writer, image-artist, motion-designer, frontend-developer, invitation-qa)을 구성·조율한다.
---

# Wedding Invitation Orchestrator — 청첩장 제작 오케스트레이터

한국 모바일 웨딩 청첩장 제작의 모든 워크플로우를 조율한다. 본 스킬은 6명의 전문가 에이전트를 팀으로 구성하고, 컨셉부터 QA까지 파이프라인 + 팬아웃 패턴으로 진행한다.

## 실행 모드

- **에이전트 팀** (기본). `TeamCreate`로 팀 구성, `TaskCreate`로 작업 할당, `SendMessage`로 자체 조율. 각 Phase가 끝날 때마다 산출물 파일이 `_workspace/`에 누적되어 다음 Phase의 입력이 된다.

## Phase 0: 컨텍스트 확인 (필수 첫 단계)

워크플로우 시작 시 기존 산출물을 확인하여 실행 모드 결정:

```
A. _workspace/ 폴더 존재 + 사용자가 부분 수정 요청
   → 부분 재실행: 해당 에이전트만 재호출

B. _workspace/ 폴더 존재 + 사용자가 새 정보 제공 / 처음부터 재요청
   → 새 실행: 기존 _workspace/를 _workspace_prev_{timestamp}/로 백업 후 초기 실행

C. _workspace/ 미존재
   → 초기 실행: Phase 1부터 전체 실행
```

부분 수정 키워드 인식:
- "인사말만", "갤러리만", "컨셉만", "이미지만 다시" → 해당 단일 에이전트 재호출
- "모션만", "애니메이션 다시", "꽃잎 다시", "BGM 추가", "스와이프 추가" → motion-designer 재호출 후 frontend-developer 재호출 + QA
- "인터랙션만 더 풍성하게" → motion-designer가 motion-spec의 density·optional 항목 상향 → frontend-developer 반영
- "컨셉 바꿔" → concept-director부터 재실행 (이후 Phase 모두 영향 받으므로 cascade)
- "계좌번호 추가", "부모님 함자 수정" → copy-writer 재호출 후 frontend-developer 재호출 + QA

## Phase 1: 사용자 입력 수집 (concept-director)

**팀 구성 전 단계.** concept-director를 단독 호출하여 사용자와 직접 인터뷰.

```
Agent({
  description: "청첩장 컨셉 결정",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "당신은 .claude/agents/concept-director.md에 정의된 concept-director 에이전트입니다. 해당 정의 파일을 먼저 읽고 그 역할대로 작동하세요. 작업: .claude/skills/wedding-concept-design/SKILL.md를 참고하여 사용자 요청을 분석하고, 필수 4가지 정보(신랑신부 이름·예식 일시·장소, 분위기 키워드 3개, 양가 부모님 함자, 갤러리 사진 보유 여부)를 사용자에게 묻습니다. 부족하면 합리적 기본값으로 채우고 표시. 컨셉 시트를 _workspace/01_concept-director_concept-sheet.md로 저장하세요. 사용자 원본 요청: {USER_REQUEST}"
})
```

concept-director는 사용자와 1-2 라운드의 인터뷰를 통해 컨셉 시트를 확정한다. 컨셉 시트가 저장되면 Phase 2로 진행.

## Phase 2: 카피 + 이미지 + 모션 병렬 생성 (팀 모드)

**실행 모드: 에이전트 팀.** copy-writer, image-artist, motion-designer 셋은 컨셉 시트만을 입력으로 받아 독립적으로 작업하므로 팀으로 구성하여 병렬 실행 + 필요 시 SendMessage로 상호 참조 (예: motion-designer가 꽃잎 SVG 자산 필요 → image-artist에게 협의).

```
TeamCreate({
  team_name: "wedding-content-team",
  members: [
    { agent_type: "general-purpose", name: "copy-writer", model: "opus" },
    { agent_type: "general-purpose", name: "image-artist", model: "opus" },
    { agent_type: "general-purpose", name: "motion-designer", model: "opus" }
  ]
})

TaskCreate(작업: "_workspace/02_copy-writer_copy.md 작성", owner: "copy-writer")
TaskCreate(작업: "_workspace/03_image-artist_manifest.md 작성 + images/ 생성", owner: "image-artist")
TaskCreate(작업: "_workspace/04_motion-designer_motion-spec.md 작성", owner: "motion-designer")
```

각 에이전트에게 첫 메시지로 다음을 전달:
- copy-writer: "당신은 .claude/agents/copy-writer.md 정의에 따라 작동합니다. .claude/skills/wedding-copywriting/SKILL.md를 참고하여 _workspace/01_concept-director_concept-sheet.md를 읽고 모든 카피를 _workspace/02_copy-writer_copy.md로 작성하세요."
- image-artist: "당신은 .claude/agents/image-artist.md 정의에 따라 작동합니다. .claude/skills/wedding-imagery-gpt-image2/SKILL.md를 참고하여 _workspace/01_concept-director_concept-sheet.md를 읽고 필요한 이미지를 글로벌 gpt-image2 스킬로 생성한 후 images/에 저장하고 매니페스트를 _workspace/03_image-artist_manifest.md로 작성하세요. 모든 이미지는 일관된 스타일을 유지해야 합니다."
- motion-designer: "당신은 .claude/agents/motion-designer.md 정의에 따라 작동합니다. .claude/skills/wedding-motion-design/SKILL.md를 참고하여 _workspace/01_concept-director_concept-sheet.md의 mood_keywords에 부합하는 모션 무드를 결정하고, 애니메이션 배경 1-2종 + 인터랙션 인벤토리 + 스크롤 시퀀스를 _workspace/04_motion-designer_motion-spec.md로 작성하세요. 모든 모션은 prefers-reduced-motion 대체안을 함께 명시해야 합니다."

세 에이전트 모두 완료하면 팀 해체(`TeamDelete`) 후 Phase 3로. 도중에 motion-designer가 추가 자산이 필요하다고 판단하면 image-artist에게 SendMessage로 협의 가능.

## Phase 3: 프론트엔드 통합 (frontend-developer 단독)

```
Agent({
  description: "모바일 청첩장 HTML 구현",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "당신은 .claude/agents/frontend-developer.md에 정의된 frontend-developer입니다. .claude/skills/wedding-mobile-frontend/SKILL.md를 참고하여 다음 4개 산출물을 통합하여 단일 index.html(또는 index.html + style.css + script.js)을 구현하세요: _workspace/01_concept-director_concept-sheet.md, _workspace/02_copy-writer_copy.md, _workspace/03_image-artist_manifest.md, _workspace/04_motion-designer_motion-spec.md. 모션 명세의 Must 항목은 모두 구현하고, 모든 무한 루프 모션에 prefers-reduced-motion 대체를 함께 구현하세요. 구현 완료 후 _workspace/05_frontend-developer_summary.md에 모션 명세 매핑 표(Must/Should/Nice-to-have 어디까지 구현했는지) + placeholder 위치 + 배포 가이드를 작성하세요."
})
```

## Phase 4: QA (invitation-qa)

```
Agent({
  description: "청첩장 QA 검증",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: "당신은 .claude/agents/invitation-qa.md에 정의된 invitation-qa입니다. .claude/skills/wedding-invitation-qa/SKILL.md의 체크리스트에 따라 _workspace/01~05 산출물과 index.html(+style.css+script.js)을 경계면 교차 비교하여 검증하세요. 정보 정합성 + 모바일 반응형 + 접근성 + 인터랙션 + 모션 명세 구현도(특히 prefers-reduced-motion 분기) 5개 카테고리를 모두 점검합니다. 자동화 가능한 검증은 grep/ls 등 Bash로 직접 실행하고, 발견된 이슈는 _workspace/06_invitation-qa_report.md에 PASS/FAIL/WARNING 형식으로 기록하세요. FAIL이 있으면 구체적인 수정 제안을 포함하고, 사소한 수정은 직접 Edit으로 적용하세요."
})
```

QA 결과:
- 전체 PASS → 사용자에게 완료 보고 + 결과물 안내
- FAIL 존재 → frontend-developer 재호출하여 수정, 재 QA. 최대 2회 반복.

## Phase 5: 사용자 피드백 + 진화

QA 통과 후 사용자에게 보고:
- `index.html` 위치
- 사용자가 채워야 할 placeholder 목록 (계좌번호, 카카오 SDK 키, 외부 폼 URL, 도메인 등)
- 배포 가이드 (예: GitHub Pages, Vercel, Netlify 무료 호스팅)
- 미리보기 방법: `python3 -m http.server` 또는 브라우저로 `index.html` 직접 열기

피드백 요청: "결과에서 개선할 부분이 있으신가요? 컨셉, 인사말, 이미지, 레이아웃 중 어느 부분이라도 다시 만들어 드릴 수 있습니다."

피드백이 오면 Phase 0의 부분 수정 분기로 진입.

## 데이터 전달 프로토콜

| 흐름 | 방식 | 파일 |
|------|------|------|
| 사용자 → concept-director | 직접 메시지 | - |
| concept-director → copy-writer / image-artist / motion-designer | 파일 기반 | `_workspace/01_concept-director_concept-sheet.md` |
| copy-writer / image-artist / motion-designer → frontend-developer | 파일 기반 | `_workspace/02_copy-writer_copy.md`, `_workspace/03_image-artist_manifest.md`, `_workspace/04_motion-designer_motion-spec.md` + `images/` |
| frontend-developer → invitation-qa | 파일 기반 | `index.html`, `style.css`, `script.js`, `_workspace/05_frontend-developer_summary.md` |
| invitation-qa → 사용자 | 파일 + 직접 보고 | `_workspace/06_invitation-qa_report.md` |

`_workspace/`는 사후 검증·재실행을 위해 보존한다. 최종 산출물은 프로젝트 루트의 `index.html` + `images/`.

## 에러 핸들링

| 에러 유형 | 대응 |
|----------|------|
| concept-director가 사용자 응답 무한 대기 | 합리적 기본값으로 채우고 진행. 최종 보고 시 "기본값 적용 항목" 명시. |
| image-artist의 gpt-image2 호출 실패 | 1회 재시도. 재실패 시 해당 이미지를 placeholder 회색 박스로 대체하고 매니페스트에 표시. |
| motion-designer의 명세에 reduced-motion 누락 | 1회 재요청 후 재실패 시 본 오케스트레이터가 "all motions disabled" 기본값을 명세에 추가하여 진행. |
| frontend-developer가 모션 Must 항목을 일부 누락 | invitation-qa가 발견 → 1회 재호출. 재실패 시 누락 항목을 사용자 보고에 명시. |
| frontend-developer의 산출물 누락 | 1회 재시도. 재실패 시 누락 부분만 명시한 부분 산출물로 진행. |
| invitation-qa의 FAIL이 2회 반복 | 사용자에게 직접 보고. 자동 수정으로는 해결되지 않는 구조적 문제일 가능성. |
| 상충 데이터 (예: 컨셉 시트의 신랑이름 vs HTML의 신랑이름) | 컨셉 시트를 진실의 원천으로 채택. HTML 수정 요청. |
| 상충 데이터 (모션 명세 vs HTML 모션) | 모션 명세를 진실의 원천으로 채택. HTML 수정 요청. |

## 팀 크기 가이드

청첩장은 중규모(작업 12-18개). 팀원 6명 중 동시 활성은 최대 3명(Phase 2의 copy-writer + image-artist + motion-designer). 나머지 Phase는 단독 에이전트로 충분. 3명 동시 활성은 조율 오버헤드가 있지만, 셋의 입력이 모두 컨셉 시트로 동일하고 출력이 독립적이어서 실질적인 충돌은 없다.

## 테스트 시나리오

### 정상 흐름
1. 사용자: "5월 17일 결혼식 청첩장 만들어줘. 신랑 김민수, 신부 박지영. 화사하고 로맨틱한 느낌으로, 인터랙션도 풍성하게."
2. concept-director: 부모 함자, 일시, 장소 보충 인터뷰 → 컨셉 시트 작성 (Dusty Rose 팔레트, Nanum Myeongjo + Playfair Display)
3. Phase 2 (3명 병렬):
   - copy-writer: 로맨틱 톤 인사말
   - image-artist: 5장의 dusty-rose watercolor 이미지
   - motion-designer: motion_mood=romantic-lush, 꽃잎 파티클 32개 + 카운트업 D-day + 갤러리 스와이프 + 음악 토글 명세
4. frontend-developer: 모션 명세대로 Canvas 파티클 + 스와이프 + reduced-motion 분기 모두 포함하여 index.html 구현
5. invitation-qa: 모션 명세 매핑 표에서 모든 Must 항목 PASS, reduced-motion 분기 PASS
6. 완료 보고: placeholder 6개 안내 (계좌 4 + RSVP URL 1 + audio/bgm.mp3 1)

### 부분 재실행 흐름 (사용자가 "꽃잎 너무 많아, 좀 줄여줘")
1. Phase 0: `_workspace/` 존재 + "꽃잎 줄여" → 모션 부분 수정 분기
2. motion-designer만 재호출 (컨셉 시트 동일, motion-spec의 count만 수정)
3. frontend-developer 재호출 (script.js의 COUNT 상수 갱신)
4. invitation-qa 재실행
5. 완료 보고

### 부분 재실행 흐름 (사용자가 "BGM 추가하고 음악 토글 넣어줘")
1. motion-designer만 재호출 → motion-spec의 인터랙션 인벤토리에 음악 토글 추가
2. frontend-developer가 토글 버튼 + audio 태그 + 토글 JS 추가, audio/bgm.mp3 placeholder
3. QA 통과 후 사용자에게 "audio/bgm.mp3 파일을 본인 BGM으로 채워주세요" 안내

### 에러 흐름 (gpt-image2 일부 실패)
1. image-artist가 hero, divider 등 5장 중 4장 성공, 1장 실패
2. 1회 재시도 → 재실패
3. 매니페스트에 "실패: divider-floral-2 — placeholder 사용" 명시
4. frontend-developer는 해당 이미지를 회색 박스로 대체
5. invitation-qa가 WARNING으로 표시
6. 사용자에게 보고 시 "이미지 1장 재생성 필요" 명시 → 재요청 시 image-artist 부분 재호출

### 에러 흐름 (motion 명세에 reduced-motion 누락)
1. motion-designer가 일부 모션에 reduced-motion 대체안 누락
2. invitation-qa가 모션 명세 review 단계에서 FAIL → motion-designer 1회 재호출
3. 재실패 시 오케스트레이터가 누락된 모션을 "reduced 시 비활성화" 기본값으로 명세에 채워 frontend-developer 진행
4. 사용자 보고에 "접근성 보완: 자동 처리됨" 명시

## 사용자 보고 템플릿 (Phase 5 완료 시)

```
청첩장이 완성되었습니다.

📁 결과물
- index.html (메인 페이지)
- images/ (5장의 이미지 자산)
- _workspace/ (중간 산출물 - 수정/재실행 시 참고됨)

🔧 사용자가 채워야 할 항목
1. 신랑측 계좌: index.html:{줄번호} `[○○은행 ...]`
2. 신부측 계좌: index.html:{줄번호}
3. RSVP 외부 폼 URL: index.html:{줄번호}
4. og:image 절대 URL (배포 도메인 결정 후): index.html:{줄번호}
5. (선택) audio/bgm.mp3 파일 — BGM 사용 시
6. (선택) 카카오맵 SDK 키, 카카오톡 공유 SDK 키

🚀 미리보기
프로젝트 폴더에서:
  python3 -m http.server 8000
브라우저에서 http://localhost:8000 접속

🌐 배포
- GitHub Pages: 저장소에 push 후 Settings → Pages 활성화
- Vercel/Netlify: 폴더 드래그&드롭만으로 배포 가능

📝 컨셉 요약
- 분위기: {mood_keywords}
- 팔레트: {primary} / {accent} / {bg}
- 폰트: {korean_serif} + {english_serif}
- 모션: {motion_mood} ({density}) — 배경: {background motion}

🎬 인터랙션 / 애니메이션 구현
- 애니메이션 배경: {예: 꽃잎 파티클 32개, prefers-reduced-motion 시 정적 SVG로 대체}
- 인터랙션: {예: 갤러리 스와이프 + 핀치 줌, 음악 토글, 계좌 복사 햅틱, D-day 카운트업}
- 접근성: prefers-reduced-motion 지원, ARIA 레이블 적용

수정하고 싶은 부분이 있으시면 알려주세요.
"인사말만 다시" / "이미지 다시" / "꽃잎 줄여줘" / "음악 추가" / "컨셉 바꿔서" 등 부분 수정도 가능합니다.
```
