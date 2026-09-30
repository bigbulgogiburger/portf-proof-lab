import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, profile, resultLabel } from "@/data/portfolio";
import { Nav } from "@/components/nav";
import { ProjectVisual } from "@/components/project-visual";
import { Chat } from "@/components/chat";
import { ArrowRight, ArrowUpRight, Github } from "@/components/icons";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.id === slug);
  return { title: p?.title, description: p?.summary };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.id === slug);
  if (!p) notFound();
  const periodLabel: number = `${p.period} · ${p.status}`;
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return (
    <>
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      <Nav />
      <main id="main" className={`case-page container accent-${p.accent}`}>
        <Link href="/#work" className="text-link back-link">
          ← 모든 프로젝트
        </Link>
        <div className="section-kicker">
          <span>
            {p.number} / {p.category}
          </span>
          <span>{periodLabel}</span>
        </div>
        <h1>{p.title}</h1>
        <p className="case-subtitle">{p.subtitle}</p>
        <p className="case-intro">{p.summary}</p>
        <div className="case-meta">
          <div>
            <span>담당 역할</span>
            <p>{p.role}</p>
          </div>
          <div>
            <span>활용 기술</span>
            <div className="tag-list">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        {p.github && (
          <a
            className="button secondary"
            href={p.github}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} /> GitHub에서 코드·검증 정책 확인{" "}
            <ArrowUpRight size={18} />
          </a>
        )}
        <ProjectVisual id={p.id} eager />
        <p className="visual-caption">
          {["harness", "service-agent"].includes(p.id) ? "핵심 동작 흐름" : "서비스 화면"}
        </p>
        <section className="case-section">
          <span className="eyebrow">01 / CHALLENGE</span>
          <h2>문제와 제약</h2>
          <p>{p.challenge}</p>
        </section>
        <section className="case-section">
          <span className="eyebrow">02 / DECISIONS</span>
          <h2>설계와 구현</h2>
          <div className="decisions">
            {p.decisions.map((d, i) => (
              <article key={d.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="case-flow" aria-label="핵심 흐름">
            {p.flow.map((s, i) => (
              <div key={s}>
                <span>{s}</span>
                {i < p.flow.length - 1 && <ArrowRight size={17} />}
              </div>
            ))}
          </div>
          <small className="muted">
            이해를 돕기 위해 단순화한 개념 흐름입니다.
          </small>
        </section>
        <section className="case-section case-result">
          <span className="eyebrow">
            03 / {resultLabel(p).en}
          </span>
          <h2>{p.metric}</h2>
          <p className="metric-label">{p.metricLabel}</p>
          <p>{p.outcome}</p>
        </section>
        <div className="case-next">
          <span className="eyebrow">다음 프로젝트</span>
          <Link href={`/projects/${next.id}`}>
            {next.title}
            <ArrowUpRight />
          </Link>
        </div>
        <Link href="/#work" className="text-link back-link">
          ← 모든 프로젝트 보기
        </Link>
        <div className="case-contact">
          <p>채용·프로젝트 문의</p>
          <a className="text-link" href={`mailto:${profile.email}`}>
            {profile.email} <ArrowUpRight size={18} />
          </a>
        </div>
      </main>
      <Chat />
    </>
  );
}
