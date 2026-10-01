# Orbit(가칭) 데이터 경계표

> 한 줄로: Orbit 을 쓰면 내 코드·결정이 **누구 눈에 보이고, 어디에 남고, 열쇠는 누가 갖는지**를 적은 표다. 기능을 만들기 전에 먼저 약속하고, 약속이 바뀌면 표부터 고친다.

<!-- sec:scope -->
## 이 표는 무엇인가

- 문서 버전: v1
- 확인일: 2026-10-01
- 대상 버전: Claude Code 2.1.286 · Codex CLI 0.159.3 · GitHub REST API 2026-03-10 · GitLab API v4
- 구버전 GitLab(v4 이전 API)과의 차이는 ③절의 GitLab 행에 따로 적는다.
- 그 외 에이전트 CLI(Gemini CLI 등): 미조사. 이 표는 Claude Code 와 Codex CLI 두 가지만 자세히 본다.
- Orbit 은 아직 만들어지지 않았다. Orbit 자신의 행은 모두 "이렇게 만들 것이다"라는 설계 약속이며, 근거 칸에 `미확인 — 구현 전 설계 의도` 로 표시한다.

### 근거 칸 읽는 법

근거는 **칸 단위**다. 각 행의 `근거` 칸은 아래 둘 중 하나다.

1. **단일 근거** — 그 행의 `보이는 필드`·`저장 여부·기간`·`키 위치` 세 칸을 모두 같은 근거가 뒷받침할 때만 쓴다. 세 가지 중 하나로 시작한다.
   - `공식 문서 [제목](https://…) (YYYY-MM-DD 확인)` — 링크가 여럿이면 ` · ` 로 잇는다.
   - `실측 (YYYY-MM-DD)` — 공개해도 되는 일반 관찰만 적는다.
   - `미확인 — 사유` — 공식 문서에서 찾지 못했거나, 아직 만들지 않은 것.
2. **칸별 근거** — 세 칸의 근거가 다르면 `필드: <근거> ; 저장: <근거> ; 키: <근거>` 로 세 라벨을 모두 쓴다. 각 `<근거>` 도 위 세 가지 중 하나로 시작한다.

문서로 확인한 주장과 확인하지 못한 주장을 한 근거로 섞지 않는다. 섞이면 행을 쪼갠다. 추정은 사실처럼 쓰지 않고 `미확인` 으로 둔다.

<!-- sec:local -->
## ① 로컬 웹·CLI

Orbit 의 기본 흐름은 호스트·외부 네트워크 없이 한 대의 PC 에서 끝나도록 설계한다.

| 무엇 | 누가 보나 | 보이는 필드 | 저장 여부·기간 | 키 위치 | 근거 |
|---|---|---|---|---|---|
| 로컬 웹 화면 | 같은 PC 에서 페어링한 브라우저 세션만. 러너가 루프백(`127.0.0.1`·`::1`)에만 띄우고 Host·Origin 을 검사한다 | 작업 설명, 결정 카드, 검사 기록, AI 리뷰 제안, diff | 화면 자체는 저장하지 않고 아래 '결정·검사 기록' 을 읽는다. 외부 CDN·글꼴·분석 요청이 없다 | 실행할 때마다 새로 만드는 일회성 페어링 비밀을 CLI 로 받아 세션으로 바꾼다. 오래 쓰는 토큰을 URL·로그·정적 파일에 두지 않는다 | 미확인 — 구현 전 설계 의도 |
| CLI 출력 | 같은 PC 의 터미널 사용자 | 웹과 같은 상태(같은 ID·같은 버전) | 터미널 출력 말고 따로 남기지 않는다. 기록은 아래 행 | OS 사용자 계정 권한 | 미확인 — 구현 전 설계 의도 |
| 결정·검사 기록 | 같은 PC 의 OS 사용자. 같은 사용자 권한으로 도는 다른 프로세스까지 막는다고 주장하지 않는다 | 사람 결정(접수와 적용을 따로), 검사 명령·도구 버전·종료 코드·보고 해시·테스트 수, AI 리뷰 제안 | PC 에만 남는다. JSON 으로 내보내기·가져오기를 할 수 있다. 보관 기간은 아직 정하지 않았다 | 아직 정하지 않았다(암호화 여부와 키 위치는 설계 미정) | 미확인 — 구현 전 설계 의도 |
| 에이전트 실행 기록 | 같은 PC 의 OS 사용자 | 에이전트 CLI 의 stdout·stderr·종료 코드·시간 제한·중단 이유 | PC 에만 남는다 | 에이전트 자격 증명은 각 CLI 가 스스로 보관한다(②절). 실행 기록의 stdout·stderr 에 자격 증명이 섞이지 않게 하는 방법은 아직 정하지 않았다 | 미확인 — 구현 전 설계 의도 |
| 원격 텔레메트리 | 아무도 — 보내지 않는다 | 없음 | 없음 | 해당 없음 | 미확인 — 구현 전 설계 의도 |

<!-- sec:agent -->
## ② 에이전트 → 모델 제공자·프록시

에이전트 CLI 는 코드·프롬프트를 PC 밖의 모델 제공자(또는 조직 프록시)로 보낸다. 이 경로는 Orbit 이 아니라 각 CLI 와 제공자의 규칙을 따른다.

| 무엇 | 누가 보나 | 보이는 필드 | 저장 여부·기간 | 키 위치 | 근거 |
|---|---|---|---|---|---|
| Claude Code — 모델 요청 | 모델 제공자(직접 연결이면 Anthropic) | 모든 사용자 프롬프트와 모델 출력(TLS 1.2 이상으로 전송). 컨텍스트에는 대화 기록·읽은 파일 내용·명령 출력·CLAUDE.md 등이 들어간다 | 제공자 쪽 보관은 계정 종류에 따른다(다음 행) | `ANTHROPIC_AUTH_TOKEN`(Bearer)·`ANTHROPIC_API_KEY`(X-Api-Key)·`apiKeyHelper` 출력·`/login` 구독 로그인 등 우선순위가 정해진 자격 증명 | 필드: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) · [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) (2026-10-01 확인) ; 저장: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 키: 공식 문서 [Authentication](https://code.claude.com/docs/en/authentication) (2026-10-01 확인) |
| Claude Code — 제공자 보관·학습 | Anthropic | 위 행의 모델 요청 내용 | 개인 계정(Free·Pro·Max): 학습 사용을 허용하면 새 모델 학습에 쓰고 5년 보관, 허용하지 않으면 30일. 상용 계정(Team·Enterprise·API): 생성 모델 학습에 쓰지 않음(고객이 따로 제공을 고른 경우 제외), 표준 30일, 자격이 있으면 조직 단위 제로 데이터 보관(ZDR). Anthropic API 저장 시 AES-256 디스크 암호화 | 학습 허용 여부는 계정의 개인정보 설정, ZDR 은 조직 단위로 켠다 | 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) |
| Claude Code — 텔레메트리·오류 보고 | Anthropic 과 서드파티 로깅·오류 추적 서비스 | 메트릭: 지연·안정성·사용 패턴(코드·프롬프트·파일 경로는 넣지 않음). 오류 보고: Claude Code 내부 오류 메시지·스택 트레이스(비밀·파일 경로·이메일 등 알려진 패턴은 보내기 전에 가림). 오류 보고는 Pro·Max 로그인, v2.1.198 이상, Claude API 직접 연결이고 조직에 제로 데이터 보관(ZDR)·HIPAA 계약이 없을 때만 켜진다 | 수신 쪽 보관 기간은 문서에 없음 | 끄는 스위치: 환경변수 `DISABLE_TELEMETRY=1`·`DISABLE_ERROR_REPORTING=1`, 한 번에 끄기 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`(settings.json `env` 블록에도 넣을 수 있다). 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 저장: 미확인 — 공식 문서에 텔레메트리 수신 쪽 보관 기간이 없음 ; 키: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) — 끄는 스위치만 해당 |
| Claude Code — `/feedback`·`/bug`·`/share` | Anthropic | 코드가 포함된 대화 기록. 범위는 보낼 때 사용자가 고른다(현재 세션이 기본, 같은 프로젝트의 최근 24시간·7일 세션까지) | Google Cloud Storage 에 5년 보관. 서드파티 제공자를 쓰거나 Anthropic 자격이 없으면 `~/.claude/feedback-bundles/` 에 로컬로만 남는다 | 끄기: `DISABLE_FEEDBACK_COMMAND=1`. 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 저장: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 키: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) — 끄는 스위치만 해당 |
| Claude Code — 세션 설문 | Anthropic | 별점만 기록. 이어지는 "기록을 봐도 되나요" 에 Yes 를 눌러야 대화·서브에이전트 기록·세션 로그가 올라간다(알려진 키·토큰 패턴은 가림, 소스·파일 내용은 그대로) | 공유한 기록은 최대 6개월, 학습에 쓰지 않는다 | 끄기: `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1`. 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 저장: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 키: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) — 끄는 스위치만 해당 |
| Claude Code — WebFetch 안전 확인 | Anthropic(`api.anthropic.com`) | 가져올 주소의 호스트 이름만(전체 URL·경로·내용은 아님). 게이트웨이를 써도, 비필수 트래픽을 꺼도 계속된다 | 서버 쪽 보관은 문서에 없음. 통과한 호스트 이름은 PC 에 5분 캐시 | 끄기: 설정 `skipWebFetchPreflight: true`. 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) ; 저장: 미확인 — 공식 문서에 서버 쪽 보관 언급이 없음 ; 키: 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) (2026-10-01 확인) — 끄는 설정만 해당 |
| Claude Code — 프록시·게이트웨이(`ANTHROPIC_BASE_URL`) | 게이트웨이 운영자 | 요청 본문(시스템 프롬프트·메시지·도구 정의 — 문서는 게이트웨이에 "고치지 말고 검사하라"고 안내한다)과 헤더 `Authorization`·`x-api-key`(개발자의 게이트웨이 자격)·`anthropic-version`·`anthropic-beta`·`x-claude-code-session-id`·서브에이전트 ID. 패스트 모드 확인과 WebFetch 안전 확인은 게이트웨이를 거치지 않고 `api.anthropic.com` 으로 직접 간다 | 게이트웨이 운영자 정책에 따른다 | 게이트웨이 자격은 개발자 PC 의 `ANTHROPIC_AUTH_TOKEN`·`ANTHROPIC_API_KEY`·`apiKeyHelper` | 필드: 공식 문서 [Claude Code gateway compatibility guide](https://code.claude.com/docs/en/llm-gateway-protocol) (2026-10-01 확인) ; 저장: 미확인 — 운영자마다 다르고 공식 문서가 정하지 않음 ; 키: 공식 문서 [Authentication](https://code.claude.com/docs/en/authentication) (2026-10-01 확인) |
| Claude Code — 인증 정보 | 같은 PC 에서 그 파일·저장소에 접근할 수 있는 사용자 | 로그인 토큰·API 키 | `/logout` 할 때까지 PC 에 남는다 | macOS 는 암호화된 Keychain(쓰기가 거부되면 `~/.claude/.credentials.json`, 권한 0600). Linux 는 `~/.claude/.credentials.json`(0600). Windows 는 `%USERPROFILE%\.claude\.credentials.json`(사용자 프로필 폴더 접근 제어를 물려받음). `CLAUDE_CONFIG_DIR` 를 정하면 그 폴더 아래 | 공식 문서 [Authentication](https://code.claude.com/docs/en/authentication) (2026-10-01 확인) |
| Claude Code — 로컬 세션 기록 | 같은 PC 에서 그 파일에 접근할 수 있는 사용자 | 대화 전체(모든 메시지·도구 호출·도구 결과). 도구를 거친 파일 내용·명령 출력·붙여넣은 글이 그대로 들어간다. 입력한 프롬프트는 `~/.claude/history.jsonl` 에도 남는다 | `~/.claude/projects/` 아래 평문으로 기본 30일, `cleanupPeriodDays` 로 조정(최소 1). 예외: Claude Desktop·Cowork 에서 시작했거나 가장 최근 이어 간 세션의 기록은 나이와 상관없이 남는다(`desktopSessionCleanupPeriodDays` 로 기간 제한을 둘 수 있고, 관리 설정이 `cleanupPeriodDays` 를 정하면 그 기간 뒤 지운다. v2.1.248 이상). `history.jsonl` 은 이 자동 정리 대상이 아니라 문서가 '직접 지우기 전까지 남는 파일' 로 분류한다 | 암호화하지 않는다 — OS 파일 권한이 유일한 보호 | 공식 문서 [Data usage](https://code.claude.com/docs/en/data-usage) · [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory) (2026-10-01 확인) |
| Codex CLI — 모델 요청 | 모델 제공자(기본 OpenAI) | 미확인 — 요청 본문에 무엇이 실리는지(프롬프트·파일·도구 출력 등) 공식 문서가 적지 않는다 | ChatGPT 로그인이면 인증 문서는 ChatGPT 워크스페이스 권한·RBAC·ChatGPT Enterprise 의 보관·거주 설정을 따른다고 적는다(Enterprise 가 아닌 계정에도 같은 설정이 적용되는지는 문서에 없다). API 키면 API 조직의 보관·데이터 공유 설정을 따른다 | 로그인 자격(아래 '인증 정보' 행) | 필드: 미확인 — 공식 문서에서 요청 본문 필드나 전송 범위를 적은 문장을 찾지 못함 ; 저장: 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) ; 키: 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) |
| Codex CLI — API 키 사용 시 제공자 보관·학습 | OpenAI | OpenAI API 로 보낸 데이터 | 명시적으로 공유에 동의하지 않으면 모델 학습·개선에 쓰지 않는다. 남용 감시 로그는 기본 최대 30일(법이 더 길게 요구하거나 서비스·제삼자를 해악에서 보호하는 데 합리적으로 필요하면 예외). 제로 데이터 보관은 승인 뒤 선택 | API 조직의 키(`codex login --with-api-key`) | 필드: 공식 문서 [Data controls in the OpenAI platform](https://developers.openai.com/api/docs/guides/your-data) (2026-10-01 확인) ; 저장: 공식 문서 [Data controls in the OpenAI platform](https://developers.openai.com/api/docs/guides/your-data) (2026-10-01 확인) ; 키: 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) |
| Codex CLI — ChatGPT 개인 계정 로그인 시 학습 사용 | OpenAI | Plus·Pro 개인 계정: 도움말은 "Conversations may be used to improve models unless you turn off training in ChatGPT data controls." 라고 적는다. 학습을 끄는 곳은 ChatGPT 데이터 제어 설정이고, 그 설정이 Codex 로 처리되는 내용에도 적용된다고 적는다 | 미확인 — 개인 계정 기준 보관 기간 | ChatGPT 로그인 토큰(아래 '인증 정보' 행) | 필드: 공식 문서 [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan) (2026-10-01 확인) ; 저장: 미확인 — 공식 문서에 개인 계정 보관 기간이 없음 ; 키: 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) |
| Codex CLI — OpenTelemetry 로그 내보내기 | 사용자가 정한 OTel 수집기 운영자 | 기본 꺼짐. 켜면 실행·도구 사용의 구조화 이벤트(API 요청·스트림 이벤트·프롬프트·도구 승인 등). 원문 프롬프트는 `otel.log_user_prompt` 를 켜야만 들어간다 | 수집기 운영자 정책에 따른다 | 수집기 자격 증명은 사용자가 설정에 둔다. 문서 예시는 `headers` 에 API 키 값(`x-otlp-api-key` = `${OTLP_TOKEN}`)을 넣고, TLS 클라이언트 개인 키 파일 경로 설정(`otel.exporter.<id>.tls.client-private-key`)도 있다. `[otel]` 을 설정하지 않으면 꺼져 있다 | 필드: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) · [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) ; 저장: 미확인 — 수집기마다 다르고 공식 문서가 정하지 않음 ; 키: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) · [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) |
| Codex CLI — OpenTelemetry 메트릭 내보내기 | 사용자가 정한 OTel 수집기 운영자 | 메트릭 파이프라인을 켜면 API·스트림·도구 활동의 카운터와 지속 시간 히스토그램 | 수집기 운영자 정책에 따른다 | 미확인 — 메트릭 내보내기 전용 자격 증명 서술을 확인하지 못함 | 필드: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) (2026-10-01 확인) ; 저장: 미확인 — 수집기마다 다르고 공식 문서가 정하지 않음 ; 키: 미확인 — 공식 문서에 메트릭 내보내기 전용 자격 증명 서술이 없음 |
| Codex CLI — 기본 분석(`analytics`) | OpenAI(문서가 데이터를 OpenAI 로 보낸다고 적음) | 문서는 기본으로 익명 사용·상태 데이터를 주기적으로 보낸다고 적고, 개인 식별 정보(PII)는 담지 않는다고 한다. 모든 메트릭에 붙는 기본 필드는 `auth_mode`(`swic`·`api`·`unknown`)·`model`(모델 이름)·`app.version`(Codex 버전)이고 메트릭마다 자기 필드가 더 있다. `tool` 필드는 내부 도구 이름이며 실제 셸 명령이나 패치 내용은 담지 않는다고 적는다 | 미확인 — 수신 쪽 보관 기간 | 끄기: `[analytics] enabled = false` — 한 PC 의 ChatGPT 데스크톱 앱·Codex CLI·IDE 확장에 한꺼번에 적용된다. 설정표는 `otel.metrics_exporter` 의 기본값을 `statsig` 로 적지만 위 분석 전송과 같은 경로인지는 문서에 없다. 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) (2026-10-01 확인) ; 저장: 미확인 — 공식 문서에 수신 쪽 보관 서술이 없음 ; 키: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) · [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) — 끄는 설정과 기본값 표기만 해당 |
| Codex CLI — `/feedback` | 미확인 — 수신처를 공식 문서가 적지 않는다 | 미확인 — 제출할 때 보내는 내용 | 미확인 — 수신 쪽 보관 기간 | 끄기: `[feedback] enabled = false`(기본 켜짐). 별도 자격 증명 여부는 미확인 — 문서에 서술이 없다 | 필드: 미확인 — 공식 문서에 보내는 내용 서술이 없음 ; 저장: 미확인 — 공식 문서에 보관 서술이 없음 ; 키: 공식 문서 [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) — 끄는 설정만 해당 |
| Codex CLI — 프록시·게이트웨이(`openai_base_url`) | 프록시·라우터 운영자 | 미확인 — 운영자가 무엇을 보는지 문서가 적지 않는다. 문서는 `openai_base_url` 이 LLM 프록시·라우터·데이터 거주 프로젝트로 보낼 때 쓰는 설정이라고만 적는다 | 운영자 정책에 따른다 | 기본 제공자는 로그인 자격을 쓰고, 커스텀 제공자는 `env_key` 로 이름 붙인 환경변수의 API 키와 `http_headers`·`env_http_headers` 의 추가 헤더를 쓴다 | 필드: 미확인 — 공식 문서에 프록시 운영자가 무엇을 보는지 서술이 없음 ; 저장: 미확인 — 운영자마다 다르고 공식 문서가 정하지 않음 ; 키: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) · [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) |
| Codex CLI — 인증 정보 | 같은 PC 에서 그 파일·저장소에 접근할 수 있는 사용자 | 접근 토큰(ChatGPT 로그인) 또는 API 키. 문서는 `~/.codex/auth.json` 을 비밀번호처럼 다루라고 경고한다 | 로그아웃할 때까지 PC 에 남는다(`ephemeral` 은 현재 프로세스 메모리에만) | `cli_auth_credentials_store`: `file` 은 `CODEX_HOME`(기본 `~/.codex`)의 `auth.json`, `keyring` 은 OS 자격 저장소, `auto` 는 OS 저장소가 되면 그쪽 아니면 `auth.json`, `ephemeral` 은 메모리 | 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) |
| Codex CLI — 로컬 세션 기록 | 같은 PC 에서 그 파일에 접근할 수 있는 사용자 | 세션 기록(transcript) | 기본으로 `CODEX_HOME` 아래에 저장(예: `~/.codex/history.jsonl`). `[history] persistence = "none"` 으로 끄고 `history.max_bytes` 로 크기 상한을 둔다. 로그는 `log_dir`(기본 `$CODEX_HOME/log`) | 기록 파일의 암호화·접근 제어 | 필드: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) (2026-10-01 확인) ; 저장: 공식 문서 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) · [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) (2026-10-01 확인) ; 키: 미확인 — 공식 문서에 기록 파일 암호화 서술이 없음 |
| Codex CLI — 로컬 세션 기록의 자동 정리 | 같은 PC 사용자 | 미확인 — 세션 파일의 형식 | 미확인 — 자동 삭제 기간 | 미확인 — 평문 여부 | 미확인 — 공식 문서에 세션 파일 형식·자동 정리·평문 여부 서술이 없음 |
| Orbit — 실행 전 전송 대상 고지 | 같은 PC 의 사용자(로컬 웹·CLI) | 에이전트 CLI 가 코드·프롬프트를 보낼 곳(외부 모델 제공자·조직 프록시)과 허용 여부 진단 결과 | 진단 결과를 PC 의 기록에 남긴다 | Orbit 이 모델 API 키를 받거나 보관할지는 아직 정하지 않았다. 지금 설계는 각 CLI 의 자체 자격 저장소를 그대로 쓰는 것이다 | 미확인 — 구현 전 설계 의도 |

<!-- sec:host -->
## ③ GitHub·GitLab 투영

호스트는 선택 확장이다. 아래는 Orbit 이 어댑터로 호스트에 무언가를 올릴 때 그것이 누구에게 보이고 어디에 남는지다.

| 무엇 | 누가 보나 | 보이는 필드 | 저장 여부·기간 | 키 위치 | 근거 |
|---|---|---|---|---|---|
| GitHub — 로컬 자기 신고 commit status(선택 어댑터) | 저장소 읽기 권한자(공개 저장소면 누구나) | `state`(`error`·`failure`·`pending`·`success`)·`description`·`target_url`·`context`·`creator`·시각. 내용은 같은 사용자 권한으로 만든 자기 신고다 | 호스트가 보관한다. 같은 SHA·context 에 최대 1000개 | 만들려면 push 권한이 있는 호스트 토큰. Orbit 이 그 토큰을 어디에 둘지는 구현 전 | 필드: 공식 문서 [REST API endpoints for commit statuses](https://docs.github.com/en/rest/commits/statuses) (2026-10-01 확인) ; 저장: 공식 문서 [REST API endpoints for commit statuses](https://docs.github.com/en/rest/commits/statuses) (2026-10-01 확인) ; 키: 미확인 — 구현 전 설계 의도 |
| GitHub — PR 본문 | 저장소 읽기 권한자(공개 저장소면 누구나) | `title`·`body`·`user`·`state`·`head`·`base`·시각 | 호스트가 보관한다. `body` 는 고칠 수 있고, 첫 글(본문)은 지울 수 없다 | 호스트 토큰. Orbit 쪽 보관 위치는 구현 전 | 필드: 공식 문서 [REST API endpoints for pull requests](https://docs.github.com/en/rest/pulls/pulls) (2026-10-01 확인) ; 저장: 공식 문서 [REST API endpoints for pull requests](https://docs.github.com/en/rest/pulls/pulls) · [Managing disruptive comments](https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments) (2026-10-01 확인) ; 키: 미확인 — 구현 전 설계 의도 |
| GitHub — 코멘트 편집·삭제 이력 | 편집 이력은 저장소 읽기 권한자 누구나. 지운 사람의 사용자명은 쓰기 권한자만 | 코멘트의 이전 판. 코멘트를 지우면 타임라인 이벤트가 남는다 | 호스트가 보관한다. 작성자와 쓰기 권한자는 편집 이력에서 민감한 판을 지울 수 있다 | 별도 키 없음 — 저장소 권한으로 정해진다 | 공식 문서 [Tracking changes in a comment](https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment) · [Managing disruptive comments](https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments) (2026-10-01 확인) |
| GitHub — commit status·PR 본문의 편집 이력과 삭제 | 미확인 — PR 본문 편집 이력을 누가 보는지 | 미확인 — commit status 를 지우거나 고칠 수 있는지 | 이슈·이슈 코멘트·PR·PR 리뷰 코멘트·커밋 코멘트는 항목당 편집 최대 100개를 보관한다. 넘으면 중간의 오래된 편집부터 자동으로 지우고 원본과 최근 99개는 남긴다 | 해당 없음 | 필드: 미확인 — 공식 문서(REST·코멘트 문서)에 PR 본문 편집 이력 열람자와 commit status 삭제·수정 서술이 없음 ; 저장: 공식 문서 [Tracking changes in a comment](https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment) (2026-10-01 확인) ; 키: 미확인 — 해당 없음 |
| GitHub — 호스트 토큰 위치 | 같은 PC 사용자 | 토큰 값 | 어디에 얼마나 둘지 아직 정하지 않음 | 구현 전 설계 — 저장소·작업 폴더 밖에 두는 방향만 정했다 | 미확인 — 구현 전 설계 의도 |
| GitLab — 로컬 자기 신고 commit status(선택 어댑터) | 프로젝트 공개 수준과 구성원 역할을 따른다. 공개 수준 문서는 프로젝트를 복제할 수 있는 사람을 Public 은 누구나(로그인하지 않은 사용자 포함), Internal 은 외부 사용자를 뺀 로그인 사용자, Private 은 구성원(Guest 역할은 복제할 수 없음)으로 적는다. 권한표는 commit status 보기에 Reporter 이상 역할을 적는다 | `status`(`pending`·`running`·`success`·`failed`·`canceled`·`skipped`)·`name`·`description`·`target_url`·`ref`·`sha`·`author`·시각 | 호스트가 보관한다 | 만들거나 고치려면 Developer 이상 역할의 토큰(권한표). 권한표는 이 두 동작에 각주를 달아, Guest 역할은 Self-Managed 의 Public·Internal 프로젝트에서(GitLab.com 은 Public 에서만) 이 동작을 할 수 있다고 예외를 적고, 외부 사용자는 Internal 프로젝트에서도 Reporter 이상의 명시적 접근이 필요하다고 적는다. Orbit 이 그 토큰을 어디에 둘지는 구현 전 | 필드: 공식 문서 [Commits API](https://docs.gitlab.com/api/commits/) · [Project and group visibility](https://docs.gitlab.com/user/public_access/) · [Roles and permissions](https://docs.gitlab.com/user/permissions/) (2026-10-01 확인) — 비구성원이 commit status 를 어디까지 보는지는 문서에 명시가 없어 미확인 ; 저장: 공식 문서 [Commits API](https://docs.gitlab.com/api/commits/) (2026-10-01 확인) ; 키: 공식 문서 [Roles and permissions](https://docs.gitlab.com/user/permissions/) (2026-10-01 확인) — 만들기·고치기 최소 역할만 해당, 토큰을 어디에 둘지는 구현 전 설계 의도 |
| GitLab — MR 설명 | 프로젝트 공개 수준을 따른다. 공개되지 않은 정보는 인증이 필요하다 | `title`·`description`·`author`·`state`·`source_branch`·`target_branch`·`sha`·시각 | 호스트가 보관한다. MR 은 `PUT` 으로 고친다 | 호스트 토큰. Orbit 쪽 보관 위치는 구현 전 | 필드: 공식 문서 [Merge requests API](https://docs.gitlab.com/api/merge_requests/) (2026-10-01 확인) ; 저장: 공식 문서 [Merge requests API](https://docs.gitlab.com/api/merge_requests/) (2026-10-01 확인) ; 키: 미확인 — 구현 전 설계 의도 |
| GitLab — notes(이슈·MR 코멘트) | 프로젝트 공개 수준을 따른다. 내부 노트(`internal`)는 Reporter 이상 구성원만 | `body`·`author`(username·name·email 등)·`system`·`internal`·시각 | 호스트가 보관한다. `PUT` 으로 고치고 `DELETE` 로 지우는 엔드포인트가 있다. 자기 코멘트는 언제든 고칠 수 있고 Maintainer·Owner 는 남의 코멘트도 고친다 | 호스트 토큰. Orbit 쪽 보관 위치는 구현 전 | 필드: 공식 문서 [Notes API](https://docs.gitlab.com/api/notes/) · [Comments and threads](https://docs.gitlab.com/user/discussions/) (2026-10-01 확인) ; 저장: 공식 문서 [Notes API](https://docs.gitlab.com/api/notes/) · [Comments and threads](https://docs.gitlab.com/user/discussions/) (2026-10-01 확인) ; 키: 미확인 — 구현 전 설계 의도 |
| GitLab — 코멘트·설명 편집 이력과 삭제 권한 | 미확인 — 편집 이력을 누가 보는지 | 미확인 — 코멘트 편집 표시·이력, commit status 를 지울 수 있는지(만들기·고치기 권한은 위 commit status 행에 적었다) | 미확인 — 이력 보관과 삭제 권한 | 해당 없음 | 미확인 — 공식 문서(API·discussions·permissions)에서 해당 문장을 찾지 못함 |
| GitLab — 구버전(v4 이전 API) 차이 | 미확인 — 구버전 인스턴스의 접근 규칙 | 미확인 — 현행 v4 의 필드와 다른 점 | 미확인 — 확인하지 않음 | 미확인 — 확인하지 않음 | 미확인 — 구버전 공식 문서를 열어 대조하지 못함 |
| 공통(GitHub·GitLab) — 결정 카드 코멘트 | 호스트 저장소 읽기 권한자(공개 저장소면 누구나) | 기본 = 없음(호스트로 아무것도 안 나감). 선택 = 숨김/제목/요약 3단계(프로젝트별, 실제 카드 예시를 보고 고름) | 호스트가 보관(코멘트 편집·삭제 이력 규칙은 위 GitHub·GitLab 행을 따른다) | 호스트 토큰. Orbit 쪽 보관 위치는 구현 전 | 미확인 — 구현 전 설계 의도 |
| 공통 — 공개 실험 repo | 인터넷의 누구나 | 비밀이 없는 실험 자료만(재현 스크립트·결과 표·이 경계표) | 호스트가 보관한다. 공개 저장소를 비공개로 바꿔도 이미 만들어진 포크는 공개로 남는다 | 읽기에는 키가 필요 없다. 쓰기는 소유자 계정 권한 | 필드: 미확인 — 운영 약속이라 문서로 확인할 대상이 아님 ; 저장: 공식 문서 [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) (2026-10-01 확인) ; 키: 공식 문서 [About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) (2026-10-01 확인) |

<!-- sec:tls -->
## ④ 조직 TLS 검사 장비

| 무엇 | 누가 보나 | 보이는 필드 | 저장 여부·기간 | 키 위치 | 근거 |
|---|---|---|---|---|---|
| 조직 TLS 검사 장비(있을 때) | 장비를 운영하는 조직 | 장비가 TLS 를 풀고 조직 인증서로 재서명하면 모델 제공자 트래픽과 (나중에 생길) 중계 트래픽을 평문으로 볼 수 있다 | 조직 정책에 따른다 | PC 신뢰 저장소에 설치된 조직 루트 인증서 | 미확인 — 조직·장비마다 다른 일반 설명 |
| Claude Code — 조직 루트 인증서 신뢰 | 같은 PC 사용자 | TLS 검사 프록시의 루트 인증서가 OS 신뢰 저장소에 있고 런타임이 그것을 읽을 수 있으면 따로 설정하지 않아도 동작한다(기본 신뢰 소스 `bundled,system`). 네이티브 설치는 항상 읽을 수 있고, npm 설치는 Node 22.15 이상이 필요하다. 더 낮은 Node 에서는 번들 인증서와 `NODE_EXTRA_CA_CERTS` 만 적용된다 | 인증서는 OS 저장소나 사용자가 정한 파일에 있다 | `CLAUDE_CODE_CERT_STORE`·`NODE_EXTRA_CA_CERTS`, 클라이언트 인증서는 `CLAUDE_CODE_CLIENT_CERT`·`CLAUDE_CODE_CLIENT_KEY` | 공식 문서 [Enterprise network configuration](https://code.claude.com/docs/en/network-config) (2026-10-01 확인) |
| Codex CLI — 사용자 지정 CA | 같은 PC 사용자 | 같은 사용자 지정 CA 설정이 로그인·일반 HTTPS 요청·보안 WebSocket 에 모두 적용된다 | 인증서는 사용자가 정한 PEM 파일에 있다 | `CODEX_CA_CERTIFICATE`, 없으면 `SSL_CERT_FILE` | 공식 문서 [Authentication](https://learn.chatgpt.com/docs/auth) (2026-10-01 확인) |
| Orbit doctor — TLS 재서명 감지 | 같은 PC 의 사용자(로컬 웹·CLI) | 모델 제공자 등 연결 대상의 인증서가 조직 인증서로 재서명됐는지 표시한다. 인증서 고정(pinning)은 하지 않는다 | 진단 결과를 PC 의 기록에 남긴다 | 키 없음 — 인증서를 읽어 비교만 한다 | 미확인 — 구현 전 설계 의도 |

<!-- sec:not-yet -->
## 아직 없는 주체

- 중계 서버 — 아직 없음 — 만들기 전 이 표를 먼저 갱신
- Telegram — 아직 없음 — 만들기 전 이 표를 먼저 갱신

메신저에 무엇이 보일지(노출 수준)는 Telegram 을 만들 때 위 줄을 표로 바꾸며 정한다.

약속: Orbit 서버는 공용 GitHub App 키를 갖지 않는다.

<!-- sec:protection -->
## 1인 repo 의 '보호'

혼자 쓰는 저장소의 브랜치 보호는 실수를 막지만, 같은 소유자가 마음먹고 푸는 것은 막지 못한다.

| 무엇 | 막는가 | 근거 |
|---|---|---|
| GitHub 브랜치 보호 규칙 — 일치하는 브랜치의 강제 push 를 기본으로 끄고 삭제를 막는다 | 막는다 | 공식 문서 [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) (2026-10-01 확인) |
| GitHub ruleset — `Require a pull request before merging` 을 켜면 모든 변경이 PR 을 거쳐야 해 직접 push 를 막는다 | 막는다 | 공식 문서 [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) (2026-10-01 확인) |
| GitHub ruleset — `Block force pushes` 로 강제 push 를 막는다 | 막는다 | 공식 문서 [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) (2026-10-01 확인) |
| 히스토리 재작성(이미 올린 커밋 바꾸기) — 강제 push 차단으로 함께 막힌다 | 막는다 | 미확인 — 문서에 '히스토리 재작성' 항목은 없고 강제 push 차단에서 끌어낸 것 |
| GitLab 보호 브랜치 — 역할별로 push·merge 를 제한하고 실수로 지우는 것을 막으며, 강제 push 는 토글로 제한한다 | 막는다 | 공식 문서 [Protected branches](https://docs.gitlab.com/user/project/repository/branches/protected/) (2026-10-01 확인) |
| 이 표를 올리는 공개 실험 repo — `main` ruleset 은 PR 필수·필수 체크 두 규칙이고 우회 목록이 비어 있어 PR 없는 직접 push 를 막는다. 강제 push·삭제 차단 규칙은 따로 두지 않았다 | 막는다 | 실측 (2026-10-01) |
| GitHub — 저장소 관리자(1인 repo 의 소유자)에게는 브랜치 보호 제한이 기본으로 적용되지 않는다(`Do not allow bypassing the above settings` 를 켜야 적용) | 못 막는다 | 공식 문서 [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) (2026-10-01 확인) |
| GitHub — 브랜치 보호를 설정하고 바꾸는 권한은 저장소 admin·owner 에게 있어, 같은 소유자가 보호를 풀 수 있다 | 못 막는다 | 공식 문서 [REST API endpoints for protected branches](https://docs.github.com/en/rest/branches/branch-protection) (2026-10-01 확인) |
| GitHub ruleset — 상태를 `Disabled` 로 두거나 `Delete ruleset` 으로 지우면 규칙이 멈춘다 | 못 막는다 | 공식 문서 [Managing rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository) (2026-10-01 확인) |
| GitLab — 기본으로 Maintainer·Owner 가 보호를 해제할 수 있다 | 못 막는다 | 공식 문서 [Protected branches](https://docs.gitlab.com/user/project/repository/branches/protected/) (2026-10-01 확인) |
| 이 표를 올리는 공개 실험 repo — 소유자 계정이 admin 권한을 가져 ruleset 을 끄거나 바꿀 수 있는 구조다(실제로 해 보지는 않음). 태그 보호 규칙도 없다 | 못 막는다 | 실측 (2026-10-01) |

그래서 이 표의 고정은 보호 설정이 아니라 **태그 + 파일 sha256** 으로 한다. sha256 은 누구나 파일에서 다시 계산해 대조할 수 있다.

<!-- sec:update -->
## 갱신 규칙

1. Orbit 구현이나 에이전트 CLI·호스트 API 버전이 이 표와 달라지면 **표를 먼저** 고친다. 그 뒤에 코드를 바꾼다.
2. 고친 표는 새 태그(`data-boundary-v2`, `data-boundary-v3` …)와 새 sha256 으로 다시 고정한다. 이미 만든 태그는 옮기지 않는다.
3. 확인일이 오래된 칸은 대상 버전을 올리면서 다시 확인하고, 확인하지 못하면 `미확인` 으로 되돌린다.
4. 가칭 Orbit 의 이름이 바뀌면, 이름만 바꾼 판도 새 태그로 다시 고정한다.
5. 아직 없는 주체(중계 서버·Telegram)를 만들기 전에 그 주체의 행을 이 표에 먼저 넣고 새 태그로 고정한다.
