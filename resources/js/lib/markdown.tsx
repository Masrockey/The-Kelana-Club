import React from 'react';

/**
 * Parses markdown inline text supporting bold (**text**), italic (*text*), links ([label](url)), and inline code (`code`).
 */
export function renderInlineMarkdown(text?: string | null): React.ReactNode {
    if (!text) return null;

    // Regex to match inline markdown elements:
    // 1: Markdown link: [label](url)
    // 2: Bold with optional link inside: **...** or __...__
    // 3: Inline code: `...`
    // 4: Italic: *...* or _..._
    const regex = /(\[[^\]]+\]\([^\)]+\))|(\*\*[^*]+?\*\*)|(__[^_]+?__)|(`[^`]+?`)|((?<!\*)\*[^*]+?\*(?!\*))|((?<!_)_[^_]+?_(?!_))/g;

    const parts = text.split(regex).filter((p) => p !== undefined && p !== '');

    return parts.map((part, index) => {
        // 1. Link: [label](url)
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
            let labelText: React.ReactNode = linkMatch[1];
            const url = linkMatch[2];
            const isExternal = /^https?:\/\//i.test(url);

            // If label inside link has **bold**
            if (typeof labelText === 'string' && labelText.includes('**')) {
                labelText = labelText.split(/(\*\*[^*]+?\*\*)/g).map((sub, sIdx) => {
                    if (sub.startsWith('**') && sub.endsWith('**')) {
                        return <strong key={sIdx} className="font-bold">{sub.slice(2, -2)}</strong>;
                    }
                    return sub;
                });
            }

            return (
                <a
                    key={index}
                    href={url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="text-[#C2410C] underline decoration-[#C2410C]/40 hover:decoration-[#C2410C] underline-offset-4 transition-colors font-medium hover:text-[#9A3412]"
                >
                    {labelText}
                </a>
            );
        }

        // 2. Bold: **text** or __text__
        if (
            (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
            (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
        ) {
            const inner = part.slice(2, -2);
            // Check if inner content is a link: **[text](url)**
            const innerLink = inner.match(/^\[(.*?)\]\((.*?)\)$/);
            if (innerLink) {
                const label = innerLink[1];
                const url = innerLink[2];
                const isExternal = /^https?:\/\//i.test(url);
                return (
                    <strong key={index} className="font-bold text-[#1C1917] dark:text-white">
                        <a
                            href={url}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="text-[#C2410C] underline decoration-[#C2410C]/40 hover:decoration-[#C2410C] underline-offset-4 transition-colors font-bold"
                        >
                            {label}
                        </a>
                    </strong>
                );
            }
            return (
                <strong key={index} className="font-bold text-[#1C1917] dark:text-white">
                    {inner}
                </strong>
            );
        }

        // 3. Inline Code: `code`
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
            return (
                <code
                    key={index}
                    className="px-1.5 py-0.5 rounded bg-muted/80 font-mono text-[0.9em] text-[#C2410C]"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        // 4. Italic: *text* or _text_
        if (
            (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) ||
            (part.startsWith('_') && part.endsWith('_') && part.length >= 2 && !part.startsWith('__'))
        ) {
            return (
                <em key={index} className="italic">
                    {part.slice(1, -1)}
                </em>
            );
        }

        return part;
    });
}
