"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, ArrowUpRight } from "./icons";

type Message = { role: "user" | "assistant"; content: string };
type Source = { id: string; title: string };
const questions = [
  "백엔드 경험을 요약해 주세요",
  "AI를 실제로 어떻게 활용했나요?",
  "가장 인상적인 프로젝트는?",
];
const OPEN_EVENT = "portfolio-chat:open";
// Home section entry point: opens the single floating chat with a question.
export function ChatPrompts() {
  return (
    <div className="agent-prompts">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: q }))
          }
        >
          {q}
          <ArrowUpRight size={15} />
        </button>
      ))}
    </div>
  );
}
export function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [launcherHidden, setLauncherHidden] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const submitRef = useRef<(q: string) => Promise<void>>(async () => {});
  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      inputRef.current?.focus();
    } else dialogRef.current?.close();
  }, [open]);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: reduce.matches ? "auto" : "smooth",
    });
  }, [messages, busy, error]);
  // Hide the launcher while the home chat section or contact is on screen.
  useEffect(() => {
    const targets = ["assistant", "contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries)
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      setLauncherHidden(visible.size > 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  useEffect(() => {
    function onOpen(e: Event) {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) void submitRef.current(q);
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);
  async function submit(question = input) {
    const text = question.trim();
    if (!text || busy) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    if (next.length > 15) {
      setError("대화가 길어졌어요. 새 대화를 시작해 주세요.");
      return;
    }
    setInput("");
    setMessages(next);
    setError("");
    setBusy(true);
    setSources([]);
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });
      if (response.status === 429)
        throw new Error("잠시 쉬어갈게요. 1분 후 다시 질문해 주세요.");
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
      setMessages([...next, { role: "assistant", content: result.answer }]);
      setSources(result.sources || []);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setMessages(next.slice(0, -1));
      setInput(text);
      setError(
        e instanceof Error
          ? e.message
          : "연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
      controllerRef.current = null;
    }
  }
  useEffect(() => {
    submitRef.current = submit;
  });
  const panel = (
    <>
      <div className="chat-header">
        <div className="assistant-avatar">
          <Sparkles size={19} />
        </div>
        <div>
          <strong>도훈의 AI</strong>
          <span>PORTFOLIO ASSISTANT</span>
        </div>
        <button
          className="chat-reset"
          disabled={busy || !messages.length}
          onClick={() => {
            setMessages([]);
            setSources([]);
            setError("");
          }}
        >
          새 대화
        </button>
        <button className="icon-button" aria-label="챗봇 닫기" onClick={close}>
          <X size={20} />
        </button>
      </div>
      <div className="chat-history" ref={historyRef}>
        <div className="chat-welcome">
          <span className="eyebrow">PORTFOLIO Q&amp;A</span>
          <h3>
            안녕하세요.
            <br />
            경력과 프로젝트를 질문해 주세요.
          </h3>
          <p>공개된 포트폴리오를 바탕으로 답변합니다.</p>
        </div>
        {!messages.length && (
          <div className="suggested-questions">
            {questions.map((q) => (
              <button key={q} disabled={busy} onClick={() => submit(q)}>
                {q}
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        )}
        <div role="log" aria-label="대화 내용" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              <span>{m.role === "assistant" ? "도훈의 AI" : "나"}</span>
              <p>{m.content}</p>
            </div>
          ))}
        </div>
        {busy && (
          <div className="chat-thinking" role="status">
            <span />
            <span />
            <span /> 프로젝트를 살펴보고 있어요
          </div>
        )}
        {!!sources.length && (
          <div className="chat-sources">
            <span>관련 프로젝트</span>
            {sources.map((s) => (
              // New tab keeps this conversation, which lives only in page memory.
              <a
                key={s.id}
                href={`/projects/${s.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.title} (새 탭)`}
              >
                {s.title}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </div>
        )}
        {error && (
          <div className="chat-error" role="alert">
            {error} <a href="mailto:dohoon321@gmail.com">이메일로 연락하기 ↗</a>
          </div>
        )}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="sr-only" htmlFor="chat-floating">
          경력과 프로젝트 질문
        </label>
        <input
          ref={inputRef}
          id="chat-floating"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="경력이나 프로젝트에 대해 물어보세요"
          maxLength={800}
          disabled={busy}
          autoComplete="off"
        />
        <button
          disabled={busy || !input.trim()}
          type="submit"
          aria-label="질문 보내기"
        >
          <Send size={17} />
        </button>
      </form>
      <p className="chat-disclosure">
        AI 답변은 오류가 있을 수 있습니다.{" "}
        <a href="/privacy" target="_blank" rel="noreferrer">
          이용 안내(새 탭)
        </a>
        <br />
        질문은 OpenAI로 전송됩니다. 개인정보는 입력하지 마세요.
      </p>
    </>
  );
  return (
    <>
      <button
        ref={triggerRef}
        className={`chat-launcher${launcherHidden && !open ? " is-hidden" : ""}`}
        tabIndex={launcherHidden && !open ? -1 : undefined}
        aria-label="도훈의 AI 챗봇 열기"
        onClick={() => setOpen(true)}
      >
        <Sparkles size={19} />
        <span>도훈의 AI에게 물어보기</span>
        <i />
      </button>
      <dialog
        ref={dialogRef}
        className="chat-panel chat-dialog"
        aria-label="도훈의 AI 포트폴리오 어시스턴트"
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {panel}
      </dialog>
    </>
  );
}
