'use client';

import React, { useState } from 'react';

interface InsightCardProps {
    question: string;
    type?: 'choice' | 'multi_select' | 'text';
    options?: string[];
    onRelease: (answer: string) => Promise<void>;
}

export default function InsightCard({ question, type = 'text', options = [], onRelease }: InsightCardProps) {
    const [answer, setAnswer] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRelease = async () => {
        let finalAnswer = answer;
        if (type === 'multi_select') {
            finalAnswer = selectedOptions.join(', ');
        }

        if (!finalAnswer.trim()) return;

        setIsSubmitting(true);
        await onRelease(finalAnswer);
        setIsSubmitting(false);
    };

    const toggleOption = (option: string) => {
        if (type === 'choice') {
            setAnswer(option);
            // Auto-submit for single choice? Maybe better to let them confirm.
            // For now let's require clicking Release or just setting it as answer.
            // Actually for choice, usually clicking IS the action. 
            // But to keep it consistent with "Release" animation/flow, let's just select it.
        } else if (type === 'multi_select') {
            setSelectedOptions(prev =>
                prev.includes(option)
                    ? prev.filter(o => o !== option)
                    : [...prev, option]
            );
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-8 animate-in fade-in duration-700">
            <h2 className="text-2xl md:text-3xl font-serif text-foreground text-center leading-relaxed">
                {question}
            </h2>

            <div className="relative">
                {type === 'text' ? (
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your thoughts here..."
                        className="
                            w-full min-h-[200px] p-6 rounded-3xl
                            bg-secondary/50 backdrop-blur-sm
                            border-none focus:ring-2 focus:ring-ring/50
                            text-foreground placeholder:text-muted-foreground
                            text-lg leading-relaxed resize-none
                            shadow-sm transition-all duration-300
                        "
                        autoFocus
                    />
                ) : (
                    <div className="flex flex-col gap-3">
                        {options.map((option) => {
                            const isSelected = type === 'choice'
                                ? answer === option
                                : selectedOptions.includes(option);

                            return (
                                <button
                                    key={option}
                                    onClick={() => toggleOption(option)}
                                    className={`
                                        w-full p-4 rounded-2xl text-left text-lg transition-all duration-200
                                        border border-border/50
                                        ${isSelected
                                            ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                                            : 'bg-secondary/30 text-foreground hover:bg-secondary/60 hover:scale-[1.01]'
                                        }
                                    `}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={handleRelease}
                    disabled={(!answer.trim() && selectedOptions.length === 0) || isSubmitting}
                    className="
                        px-10 py-3 rounded-full
                        bg-primary text-primary-foreground font-medium tracking-wide
                        shadow-sm hover:shadow-md
                        transition-all duration-300 hover:-translate-y-0.5
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {isSubmitting ? 'Releasing...' : 'Release'}
                </button>
            </div>
        </div>
    );
}
