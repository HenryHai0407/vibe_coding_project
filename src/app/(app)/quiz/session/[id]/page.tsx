import { QuizSession } from "@/components/quiz/quiz-session";

export default function QuizSessionPage({ params }: { params: { id: string } }) {
  return <QuizSession sessionId={params.id} />;
}
