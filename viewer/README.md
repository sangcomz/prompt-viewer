# AI Prompt Viewer

Next.js 기반의 AI 어시스턴트 대화 로그 뷰어입니다. JSONL 형식의 대화 로그를 정적 파일 방식으로 서빙하며, DB 없이 URL을 통해 대화를 공유할 수 있습니다.

## 주요 기능

- 📁 **정적 파일 기반**: DB 없이 JSONL 파일을 직접 서빙
- 🔗 **URL 공유**: `/view/[conversation-id]` 형태의 공유 가능한 URL
- 🎨 **마크다운 렌더링**: 코드 블록 syntax highlighting 포함
- 🌙 **다크 모드**: 시스템 설정에 따른 자동 다크 모드
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- ⚡ **빠른 성능**: Next.js 15 + Turbopack

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Markdown**: react-markdown + remark-gfm
- **Syntax Highlighting**: rehype-highlight + highlight.js

## 프로젝트 구조

```
viewer/
├── app/
│   ├── components/
│   │   ├── BackToTop.tsx          # 맨 위로 버튼
│   │   ├── ConversationCard.tsx   # 대화 카드 컴포넌트
│   │   └── MessageBubble.tsx      # 메시지 버블 컴포넌트
│   ├── lib/
│   │   ├── parser.ts              # JSONL 파싱 로직
│   │   └── types.ts               # TypeScript 타입 정의
│   ├── view/[id]/
│   │   └── page.tsx               # 대화 뷰어 페이지
│   ├── globals.css                # 전역 스타일
│   └── page.tsx                   # 홈 페이지 (대화 목록)
├── public/
│   └── conversations/             # JSONL 파일 저장 위치
│       ├── *.jsonl                # 대화 로그 파일들
│       └── index.json             # 대화 인덱스 (자동 생성)
└── scripts/
    └── generate-index.ts          # 인덱스 생성 스크립트
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. JSONL 파일 추가

AI 어시스턴트 대화 로그 파일(`.jsonl`)을 `public/conversations/` 디렉토리에 복사합니다.

```bash
cp /path/to/your/*.jsonl public/conversations/
```

**파일명 규칙 (선택사항):**

AI 이름을 파일명 앞에 프리픽스로 추가하면 대화 카드에 표시됩니다:

- `claude_code_abc123.jsonl` → "Claude Code" 배지 표시
- `chatgpt_xyz789.jsonl` → "Chatgpt" 배지 표시
- `gemini_test.jsonl` → "Gemini" 배지 표시
- `abc123.jsonl` → AI 이름 표시 안됨

형식: `{ai_name}_{conversation_id}.jsonl`

### 3. 인덱스 생성

대화 목록 인덱스를 생성합니다.

```bash
npm run generate-index
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 사용 방법

### 새로운 대화 추가하기

1. JSONL 파일을 `public/conversations/`에 추가
2. `npm run generate-index` 실행
3. 개발 서버 재시작 (또는 페이지 새로고침)

### 대화 공유하기

각 대화는 고유한 URL을 가집니다:

```
https://your-domain.com/view/7a464110-a1eb-4f2b-a1ee-9cc9d3c405c7
```

이 URL을 복사해서 다른 사람과 공유할 수 있습니다.

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행
- `npm run generate-index` - 대화 인덱스 생성

## 배포

### Vercel (추천)

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 자동 배포 완료

### 기타 플랫폼

정적 파일을 서빙할 수 있는 모든 플랫폼에서 사용 가능합니다:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages (정적 export 설정 필요)

## 데이터 형식

JSONL 파일은 AI 어시스턴트 대화 로그 형식을 따릅니다. 각 줄은 다음과 같은 JSON 객체입니다:

```json
{
  "type": "user" | "assistant",
  "message": {
    "content": "메시지 내용"
  },
  "timestamp": "2025-11-23T01:24:49.000Z",
  "cwd": "/path/to/project",
  "gitBranch": "main"
}
```

**지원되는 형식:**
- Claude Code 대화 로그
- 기타 JSONL 형식의 AI 어시스턴트 대화 로그

## 커스터마이징

### 색상 변경

`app/globals.css`에서 CSS 변수를 수정하세요.

### 컴포넌트 수정

- 메시지 스타일: `app/components/MessageBubble.tsx`
- 카드 레이아웃: `app/components/ConversationCard.tsx`
- 페이지 레이아웃: `app/page.tsx`, `app/view/[id]/page.tsx`

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
