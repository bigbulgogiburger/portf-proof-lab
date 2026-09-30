# portf-proof-lab — public misjudgment test kit

This repository is a public clone of [bigbulgogiburger/portf](https://github.com/bigbulgogiburger/portf).
It tested whether a PR evidence source judges seeded pull requests correctly (2026-09-30):

- **PRTruth 0.1.26** (report-only JSON receipt), run by `.github/workflows/prtruth.yml`
- **Checks only**: required `typecheck` and `test` check runs on the latest head

Scope: this is a GitHub evidence-source selection test only. It is not a claim about any other host.

## Cases

Issues and PRs labeled `rehearsal` or `meta` are not cases. Case PRs were closed without merging after measurement.

| id | kind | seeded change | issue | PR | PRTruth | Checks only |
|---|---|---|---|---|---|---|
| E1 | error | every chat test turned into `test.skip` (0 tests run) | #1 | #10 | wrong | wrong |
| E2 | error | real type error hidden by `continue-on-error: true` | #2 | #11 | wrong | wrong |
| E3 | error | head B test job waiting on a required-reviewer environment | #3 | #12 | correct | correct |
| E4 | error | small UI change with an unsupported Safari/Firefox/WCAG AA claim | #4 | #13 | correct | wrong |
| E5 | error | one chat assertion actually fails | #5 | #14 | correct | correct |
| C1 | control | chat empty-state copy + new test | #6 | #15 | correct | correct |
| C2 | control | project detail metadata + new test | #7 | #16 | correct | correct |

**Result: PRTruth 5/7, Checks only 4/7. Neither passed** (pass = all 5 error cases and both controls correct).

- E1: a green `test` check with `# tests 6 # pass 0 # skipped 6` was read as proven by both.
- E2: `tsc` exited 2, but the GitHub jobs API reports the `continue-on-error` step as `success`, so API-only readers cannot see it.
- E4: PRTruth marked the unsupported browser/accessibility claim UNPROVEN; required checks alone approved it.

## Protocol

1. Base `main` holds `ci.yml` (typecheck -> test, inline commands) and `prtruth.yml`; a ruleset requires a PR and the `typecheck`/`test` checks (GitHub Actions).
2. The answer key (expected PRTruth rows and verdict per case, expected Checks-only decision) was sealed and its sha256 posted before the first case PR. A case is correct only if every specified requirement row, claim row and the overall verdict match.
3. For each PR, `prtruth.yml` waits for `typecheck` completed and `test` completed or waiting, records the head SHA before and after, runs PRTruth pinned to upstream `eissasoubhi/PRTruth@fc8155f7` (npm 0.1.26, `--format json --policy report-only --output`), and uploads the receipt plus check-runs/jobs snapshots as an artifact.
4. A run is invalid if the `prtruth.yml` hash differs from the sealed value or the head moved during the run. No run was invalid.

## Reproduce

- Rehearsal: issue #8 / PR #9. Cases: issues #1–#7, PRs #10–#16 (branches `change/1` to `change/7`).
- Each case PR has a `prtruth` workflow run with an artifact `prtruth-pr<N>-attempt<k>` containing `prtruth.json`, `checks.json`, `jobs.json` and `meta.json`.

## Limits

- n=7 qualification test, not an accuracy estimate. One test file, one operator, not blinded.
- The seal comment lives in a private repository, so readers of this repo cannot verify the seal order themselves.
- PRTruth matching is English-only; non-English issues are a separate gap, not scored here.

---

<details><summary>Original project README (portf)</summary>

# 편도훈 · Portfolio

Next.js App Router, React, TypeScript 기반의 한국어 포트폴리오입니다. Vercel에 배포하며 데이터베이스를 사용하지 않습니다.

## 실행

Node.js 22 LTS를 사용합니다.

```sh
npm ci
npm run dev -- --port 3100
```

[로컬 사이트](http://localhost:3100)

## 콘텐츠와 공개 범위

- `src/data/portfolio.ts`: 메인·상세·인쇄 페이지·AI가 공유하는 검토된 공개 콘텐츠.
- 2026-09-08 내용·디자인 개정. A/S 업무 설계, 현재 jira-harness, CS Agent, 수리엔 운영, 결제, 회원·배치의 6개 사례.
- 기존 제출 포트폴리오에 수록된 Stanley CS·수리엔·스카이탭·링커 이미지를 사용합니다. 원본 이미지의 화면 수치를 프로젝트 성과로 인용하지 않습니다.
- CS Agent는 조회와 신규 접수 초안·사용자 등록 범위입니다. 상태 변경·완료 처리 기능이나 미측정 자동화율을 주장하지 않습니다.
- 현행 jira-harness에 구버전의 적용 제품 수를 승계하지 않습니다. Stanley 기간·테스트 수, 충돌하는 Geocoding 처리 시간도 제외했습니다.
- 링커 → 플랫비 → 교육지대는 법인 합병으로 소속이 변경됐으며 서비스 담당은 이어졌습니다. 회사별 재직 기간과 프로젝트 기간을 구분합니다.

## 디자인

이전 버전의 올리브·라임 팔레트와 입자 Orbit을 발전시킨 모션 디자인입니다. Pretendard Variable은 로컬 호스팅하며 라이선스는 `public/fonts/`에 포함합니다. 영문 디스플레이에는 DM Sans를 사용합니다. 비대칭 프로젝트 배치, 스크롤 등장, 카드 확대, 포인터에 반응하는 Orbit을 적용했습니다. Orbit은 화면 밖에서 멈추며 사용자가 일시 정지할 수 있습니다. `prefers-reduced-motion`에서는 회전과 전환 효과를 줄입니다.

## PDF

`public/dohoon-portfolio.pdf`는 편도훈 위키에서 관리하는 2026-09-27 범용판 v8(17페이지)입니다. 원본은 위키의 `커리어/포트폴리오/2026/편도훈_포트폴리오_2026-09-27_범용_v8.pdf`이며, 웹 공개용이라 전화번호를 제외했습니다. 웹의 다운로드 링크는 이 파일을 사용합니다.

개발 서버 실행 후 `npm run pdf`를 실행하면 `/print`에서 별도의 7페이지 텍스트 인쇄본을 `output/pdf/portfolio-web-print.pdf`에 생성합니다. 제출용 PDF를 덮어쓰지 않습니다. 다른 포트는 `PORTFOLIO_BASE_URL`로 지정합니다.

## AI 어시스턴트

`.env.example`을 참고해 로컬 `.env.local` 또는 Vercel 환경변수를 설정합니다. 키를 저장소에 커밋하지 않습니다.

| 환경변수               | 용도                               |
| ---------------------- | ---------------------------------- |
| `OPENAI_API_KEY`       | 서버 전용 OpenAI API 키            |
| `OPENAI_MODEL`         | 기본값 `gpt-6-luna`              |
| `CHAT_RATE_LIMIT_ENABLED` | 아래 Vercel WAF 규칙 적용 후 `true` |
| `NEXT_PUBLIC_SITE_URL` | 확정된 HTTPS 대표 URL, 끝에 / 제외 |

[공식 Luna 모델 문서](https://developers.openai.com/api/docs/models/gpt-6-luna)의 Responses API를 사용합니다. 실제 키의 모델 접근권한은 연결 후 확인해야 합니다. 키 미설정 시 HTTP 503과 준비 중 안내를 반환하며 가짜 생성 답변을 표시하지 않습니다.

- 공개된 코퍼스 전체를 서버 instructions에 넣습니다. 벡터 DB나 외부 검색은 사용하지 않습니다.
- Structured Outputs로 답변과 근거 프로젝트 ID를 받고 허용된 ID만 링크합니다.
- 사용자 메시지 800자, 최대 15개 메시지(8번째 질문까지), 입력 총 16,000자, 본문 최대 64KB, 출력 최대 1,100 토큰.
- 출력은 텍스트로 렌더링하며 임의 HTML·링크를 실행하지 않습니다.
- `store:false`, 브라우저 메모리에만 대화 유지. 앱은 질문과 응답을 로그에 남기지 않습니다.
- localhost에서는 메모리 기반 분당 10회 제한(개발용). Vercel에서는 WAF가 서버 함수 진입 전에 제한합니다. 적용 확인 환경변수가 `true`가 아니면 AI 호출을 차단합니다. 이 변수 자체가 제한을 설정하는 것은 아니므로 WAF 규칙을 유지해야 합니다.
- Vercel Firewall에서 `path equals /api/chat` AND `method equals POST` 규칙을 활성화하고 IP당 10회/60초 fixed window, 초과 시 HTTP 429로 설정합니다. 설정 후 `CHAT_RATE_LIMIT_ENABLED=true`로 배포합니다. 지역별 제한 특성은 [Vercel 문서](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)를 참고합니다.
- 공개 운영 전 OpenAI 프로젝트 예산 알림·사용량을 설정하고 Vercel Firewall 차단과 실제 모델 응답을 확인합니다.
- 챗봇 중단: Vercel의 `OPENAI_API_KEY`를 제거하고 재배포. 사이트와 이메일 링크는 계속 사용할 수 있습니다.

## 검증

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

브라우저 검수: 데스크톱/모바일, 프로젝트 상세 6개, 메뉴·키보드 포커스, 챗봇 연결 전 상태와 mocked API 정상 응답, PDF 다운로드, 가로 넘침, 접근성.

## Vercel 배포

1. GitHub `bigbulgogiburger/portf`를 Vercel에서 Import, Framework: Next.js, Node.js: 22.x.
2. 환경변수를 설정하고 Firewall 제한 규칙을 게시합니다. AI 키가 없어도 사이트 배포는 가능합니다.
3. 배포된 HTTPS URL을 `NEXT_PUBLIC_SITE_URL`에 넣고 재배포해 sitemap을 활성화합니다.
4. AI 실제 응답·근거 링크·요청 제한을 배포 환경에서 확인합니다.

토큰은 로컬 환경이나 Vercel에서 설정합니다. 인증 정보는 문서·소스·Git에 넣지 않습니다.

</details>
