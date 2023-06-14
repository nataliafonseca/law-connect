"use client";
import { Input, Skeleton } from "antd";
import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../../components/button";
import { Answer, Question, Tag, User } from "@prisma/client";

async function fetchQuestion({ questionId }: { questionId: string }) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/question/${questionId}`
  );
  return res.json();
}

export default function QuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(
    {} as Question & { answers: Answer[]; tags: Tag[]; author: User }
  );

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/question/${params.questionId}`
    );
    const data: Question & { answers: Answer[]; tags: Tag[]; author: User } =
      await res.json();

    setQuestion(data);
    setLoading(false);
  }, [params.questionId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const answers = question?.answers;

  const { data: session } = useSession();
  const user = session?.user;

  const [content, setContent] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/answer`, {
      method: "POST",
      body: JSON.stringify({
        content,
        authorId: user?.id,
        questionId: params.questionId,
      }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    setContent("");
    await fetchQuestions();
  }

  return (
    <>
      {loading ? (
        <>
          <>
            <div className="p-4 border border-neutral-300 flex justify-between gap-2 bg-neutral-100 rounded-t-sm">
              <Skeleton.Input active />
            </div>
            <div className="py-6 px-10 border-b border-x border-neutral-300 bg-neutral-100 rounded-b-sm">
              <Skeleton active />
            </div>
          </>
          <ul className="min-h-screen pb-10">
            {[1, 2, 3, 4, 5].map((value: number) => (
              <div
                key={value}
                className="py-6 px-10 border-b border-neutral-300"
              >
                <Skeleton active />
              </div>
            ))}
          </ul>
        </>
      ) : (
        <>
          {question && (
            <>
              <div className="p-4 border border-neutral-300 flex justify-between gap-2 bg-neutral-100 rounded-t-sm">
                <h1 className="text-3xl bold">{question.title}</h1>
              </div>
              <div className="py-6 px-10 border-b border-x border-neutral-300 bg-neutral-100 rounded-b-sm">
                <div className="flex gap-2 mb-6">
                  {question.tags.map((tag: any) => (
                    <button
                      key={tag.tagId}
                      className="bg-brand-shadow text-brand-primary px-2 rounded-sm"
                    >
                      {tag.tagId}
                    </button>
                  ))}
                </div>
                <p className="pb-6">{question.content}</p>
                <div className="flex gap-2 justify-end mt-3">
                  <div className="flex gap-1 items-center">
                    <span className="text-brand-primary">
                      {question.author.firstName} {question.author.lastName}
                    </span>
                    <span> · </span>
                    {formatRelative(new Date(question.createdAt), new Date(), {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
          {answers && (
            <ul>
              {answers.map((answer: any) => (
                <li
                  key={answer.id}
                  className="py-6 px-10 border-b border-neutral-300"
                >
                  <p className="pb-6">{answer.content}</p>
                  <div className="flex gap-2 justify-end mt-3">
                    <div className="flex gap-1">
                      <span className="text-brand-primary">
                        {answer.author.firstName} {answer.author.lastName}
                      </span>
                      <span> · </span>
                      {formatRelative(new Date(answer.createdAt), new Date(), {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSubmit} className="mt-20 grid">
            <h2 className="p-4 mb-4 text-3xl bold">Responder</h2>
            <Input.TextArea
              id="answer"
              name="question"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button type="submit" className="mt-8 ml-auto">
              Enviar Resposta
            </Button>
          </form>
        </>
      )}
    </>
  );
}
