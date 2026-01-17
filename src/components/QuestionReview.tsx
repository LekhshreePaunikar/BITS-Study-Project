import { useEffect, useState } from "react";
import api from "../utils/api";
import { Button } from "./ui/button";

const COLORS = {
    cardBg: "rgba(17, 24, 39, 0.85)",      // deep slate
    border: "rgba(148, 163, 184, 0.15)",  // subtle gray
    question: "#E5E7EB",                  // soft white
    label: "#9CA3AF",                     // muted gray
    answer: "#D1D5DB",
    insight: "#CBD5F5",                   // soft AI blue
    scoreGood: "#22C55E",
    scoreMid: "#EAB308",
    scoreLow: "#EF4444",
};



interface QuestionReviewProps {
    sessionId: number;
    onBack: () => void;
}

export default function QuestionReview({
    sessionId,
    onBack,
}: QuestionReviewProps) {


    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get(`/interview/session/${sessionId}/question-review`)
            .then((res) => setQuestions(res.data))
            .finally(() => setLoading(false));
    }, [sessionId]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading question review...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111827] px-10 py-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold">Question Review</h1>

                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex items-center gap-2"
                >
                    ← Back
                </Button>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((q, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-6 space-y-4"
                        style={{
                            background: COLORS.cardBg,
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                        }}
                    >
                        {/* Question Header */}
                        <div className="flex items-center justify-between">
                            <p className="text-xs tracking-wide uppercase" style={{ color: COLORS.label }}>
                                Question {i + 1}
                            </p>

                            {/* Score */}
                            <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor:
                                        q.score >= 7
                                            ? COLORS.scoreGood
                                            : q.score >= 4
                                                ? COLORS.scoreMid
                                                : COLORS.scoreLow,
                                    color: "#fff",
                                }}
                            >
                                {q.score}/10
                            </span>
                        </div>

                        {/* Question */}
                        <p className="text-lg font-medium leading-relaxed" style={{ color: COLORS.question }}>
                            {q.questionText}
                        </p>

                        {/* Answer */}
                        <div
                            className="rounded-xl px-4 py-3 text-sm"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: COLORS.answer,
                            }}
                        >
                            <span className="block text-xs mb-1" style={{ color: COLORS.label }}>
                                Your response
                            </span>
                            {q.userAnswer || "No answer provided"}
                        </div>

                        {/* AI Feedback */}
                        {q.feedback?.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                                <p
                                    className="text-sm italic leading-relaxed"
                                    style={{ color: COLORS.insight }}
                                >
                                    “{q.feedback[0]}”
                                </p>
                            </div>
                        )}
                    </div>

                ))}
            </div>
        </div>
    );
}
