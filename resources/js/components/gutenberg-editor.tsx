import React, { useState, useEffect, useRef, useId } from 'react';
import {
    Plus,
    Type,
    Bold,
    Italic,
    Link as LinkIcon,
    Heading2,
    Heading3,
    Heading4,
    Image as ImageIcon,
    Quote,
    List as ListIcon,
    ListOrdered,
    MapPin,
    Compass,
    AlertCircle,
    Info,
    Sparkles,
    ChevronUp,
    ChevronDown,
    Trash2,
    Copy,
    Code,
    Minus,
    MoreVertical,
    FileText,
    AlignLeft,
    Check,
    Search,
    Eye,
    Maximize2,
    Layers,
    Sliders,
    CornerDownLeft,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import MediaLibraryModal from '@/components/media-library-modal';
import { renderInlineMarkdown } from '@/lib/markdown';

export type BlockType =
    | 'paragraph'
    | 'heading'
    | 'image'
    | 'quote'
    | 'list'
    | 'callout'
    | 'route'
    | 'separator'
    | 'code';

export interface GutenbergBlock {
    id: string;
    type: BlockType;
    content?: string;
    level?: 2 | 3 | 4;
    url?: string;
    caption?: string;
    alt?: string;
    citation?: string;
    items?: string[];
    listType?: 'unordered' | 'ordered';
    calloutType?: 'info' | 'tip' | 'warning';
    calloutTitle?: string;
    // Route card specifics
    routeName?: string;
    routeDistance?: string;
    routeElevation?: string;
    routeTerrain?: string;
    routeSeason?: string;
    routeHighlights?: string;
}

interface GutenbergEditorProps {
    value: string;
    onChange: (value: string) => void;
    onWordCountChange?: (words: number) => void;
    placeholder?: string;
}

function generateId(): string {
    return 'blk_' + Math.random().toString(36).substring(2, 9);
}

// Convert Markdown text to structured Gutenberg blocks
export function markdownToBlocks(markdown: string): GutenbergBlock[] {
    if (!markdown || !markdown.trim()) {
        return [
            {
                id: generateId(),
                type: 'paragraph',
                content: '',
            },
        ];
    }

    const blocks: GutenbergBlock[] = [];
    const rawChunks = markdown.split(/\n{2,}/);

    for (let i = 0; i < rawChunks.length; i++) {
        const chunk = rawChunks[i].trim();
        if (!chunk) continue;

        // 1. Route Block: :::route ... :::
        if (chunk.startsWith(':::route') && chunk.includes(':::')) {
            const lines = chunk
                .replace(/^:::route\s*/i, '')
                .replace(/:::$/, '')
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean);

            const routeData: Partial<GutenbergBlock> = {
                id: generateId(),
                type: 'route',
                routeName: '',
                routeDistance: '',
                routeElevation: '',
                routeTerrain: '',
                routeSeason: '',
                routeHighlights: '',
            };

            for (const line of lines) {
                const [key, ...vals] = line.split(':');
                const val = vals.join(':').trim();
                const k = key.trim().toLowerCase();
                if (k === 'name' || k === 'route') routeData.routeName = val;
                else if (k === 'distance') routeData.routeDistance = val;
                else if (k === 'elevation') routeData.routeElevation = val;
                else if (k === 'terrain') routeData.routeTerrain = val;
                else if (k === 'season') routeData.routeSeason = val;
                else if (k === 'highlights') routeData.routeHighlights = val;
            }

            blocks.push(routeData as GutenbergBlock);
            continue;
        }

        // 2. Callout Block: :::callout[type]{title="..."} ... :::
        if (chunk.startsWith(':::callout') && chunk.includes(':::')) {
            const headerMatch = chunk.match(/^:::callout(?:\[(info|tip|warning)\])?(?:\s*\{title="([^"]*)"\})?/i);
            const calloutType = (headerMatch?.[1]?.toLowerCase() as 'info' | 'tip' | 'warning') || 'info';
            const calloutTitle = headerMatch?.[2] || '';
            const body = chunk
                .replace(/^:::callout[^\n]*\n?/, '')
                .replace(/:::\s*$/, '')
                .trim();

            blocks.push({
                id: generateId(),
                type: 'callout',
                calloutType,
                calloutTitle,
                content: body,
            });
            continue;
        }

        // 3. Headings: ##, ###, ####
        if (/^#{2,4}\s/.test(chunk)) {
            const levelMatch = chunk.match(/^(#{2,4})\s+(.*)$/s);
            if (levelMatch) {
                const level = levelMatch[1].length as 2 | 3 | 4;
                blocks.push({
                    id: generateId(),
                    type: 'heading',
                    level,
                    content: levelMatch[2].trim(),
                });
                continue;
            }
        }

        // 4. Separator / Horizontal rule
        if (/^(?:---|___|\*\*\*)$/.test(chunk)) {
            blocks.push({
                id: generateId(),
                type: 'separator',
            });
            continue;
        }

        // 5. Image: ![alt](url "caption") or ![alt](url)
        const imgMatch = chunk.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/s);
        if (imgMatch) {
            blocks.push({
                id: generateId(),
                type: 'image',
                alt: imgMatch[1],
                url: imgMatch[2],
                caption: imgMatch[3] || imgMatch[1] || '',
            });
            continue;
        }

        // 6. Blockquote: > text
        if (chunk.startsWith('> ')) {
            const quoteLines = chunk
                .split('\n')
                .map((l) => l.replace(/^>\s*/, '').trim())
                .filter(Boolean);

            let citation = '';
            const contentLines: string[] = [];

            for (const line of quoteLines) {
                if (line.startsWith('— ') || line.startsWith('-- ')) {
                    citation = line.replace(/^[—-]\s*/, '').trim();
                } else {
                    contentLines.push(line);
                }
            }

            blocks.push({
                id: generateId(),
                type: 'quote',
                content: contentLines.join('\n'),
                citation,
            });
            continue;
        }

        // 7. Bullet or Numbered List
        const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
        const isBulletList = lines.every((l) => /^[-*+]\s/.test(l));
        const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l));

        if (lines.length > 0 && (isBulletList || isNumberedList)) {
            blocks.push({
                id: generateId(),
                type: 'list',
                listType: isNumberedList ? 'ordered' : 'unordered',
                items: lines.map((l) => l.replace(/^([-*+]|\d+\.)\s+/, '')),
            });
            continue;
        }

        // 8. Code block: ``` ... ```
        if (chunk.startsWith('```') && chunk.endsWith('```')) {
            const codeLines = chunk.split('\n');
            const codeContent = codeLines.slice(1, -1).join('\n');
            blocks.push({
                id: generateId(),
                type: 'code',
                content: codeContent,
            });
            continue;
        }

        // Default: Paragraph block
        blocks.push({
            id: generateId(),
            type: 'paragraph',
            content: chunk,
        });
    }

    return blocks.length > 0
        ? blocks
        : [
            {
                id: generateId(),
                type: 'paragraph',
                content: '',
            },
        ];
}

// Convert Gutenberg blocks back into Markdown
export function blocksToMarkdown(blocks: GutenbergBlock[]): string {
    return blocks
        .map((block) => {
            switch (block.type) {
                case 'heading': {
                    const prefix = '#'.repeat(block.level || 2);
                    return `${prefix} ${(block.content || '').trim()}`;
                }
                case 'image': {
                    const alt = block.alt || block.caption || 'Travel Photograph';
                    const url = block.url || '';
                    if (!url) return '';
                    if (block.caption) {
                        return `![${alt}](${url} "${block.caption.replace(/"/g, "'")}")`;
                    }
                    return `![${alt}](${url})`;
                }
                case 'quote': {
                    const quoteText = (block.content || '')
                        .split('\n')
                        .map((l) => `> ${l}`)
                        .join('\n');
                    if (block.citation) {
                        return `${quoteText}\n> — ${block.citation}`;
                    }
                    return quoteText;
                }
                case 'list': {
                    const items = block.items || [];
                    if (block.listType === 'ordered') {
                        return items.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
                    }
                    return items.map((item) => `- ${item}`).join('\n');
                }
                case 'callout': {
                    const type = block.calloutType || 'info';
                    const titleAttr = block.calloutTitle ? ` {title="${block.calloutTitle.replace(/"/g, "'")}"}` : '';
                    return `:::callout[${type}]${titleAttr}\n${(block.content || '').trim()}\n:::`;
                }
                case 'route': {
                    const lines = [':::route'];
                    if (block.routeName) lines.push(`route: ${block.routeName}`);
                    if (block.routeDistance) lines.push(`distance: ${block.routeDistance}`);
                    if (block.routeElevation) lines.push(`elevation: ${block.routeElevation}`);
                    if (block.routeTerrain) lines.push(`terrain: ${block.routeTerrain}`);
                    if (block.routeSeason) lines.push(`season: ${block.routeSeason}`);
                    if (block.routeHighlights) lines.push(`highlights: ${block.routeHighlights}`);
                    lines.push(':::');
                    return lines.join('\n');
                }
                case 'separator':
                    return '---';
                case 'code':
                    return `\`\`\`\n${block.content || ''}\n\`\`\``;
                case 'paragraph':
                default:
                    return (block.content || '').trim();
            }
        })
        .filter((text) => text.trim().length > 0)
        .join('\n\n');
}

export default function GutenbergEditor({
    value,
    onChange,
    onWordCountChange,
    placeholder = 'Start writing or press "/" to insert a block...',
}: GutenbergEditorProps) {
    const [blocks, setBlocks] = useState<GutenbergBlock[]>(() => markdownToBlocks(value));
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
    const [rawCode, setRawCode] = useState<string>(value);
    const [inserterOpen, setInserterOpen] = useState(false);
    const [inserterTargetIndex, setInserterTargetIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
    const [outlineOpen, setOutlineOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [targetImageBlockId, setTargetImageBlockId] = useState<string | null>(null);

    function openMediaLibraryForBlock(blockId: string) {
        setTargetImageBlockId(blockId);
        setMediaModalOpen(true);
    }

    function handleMediaSelect(media: { url: string; alt_text?: string; caption?: string; name?: string }) {
        if (targetImageBlockId) {
            updateBlock(targetImageBlockId, {
                url: media.url,
                alt: media.alt_text || media.name || 'Travel Photograph',
                caption: media.caption || '',
            });
        } else {
            insertBlock('image', undefined, {
                url: media.url,
                alt: media.alt_text || media.name || 'Travel Photograph',
                caption: media.caption || '',
            });
        }
        setTargetImageBlockId(null);
    }

    // Track internal vs external changes
    const isInternalUpdate = useRef(false);

    // Sync from parent if value changes externally
    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        setBlocks(markdownToBlocks(value));
        setRawCode(value);
    }, [value]);

    // Calculate word count
    useEffect(() => {
        const words = value
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
        if (onWordCountChange) {
            onWordCountChange(words);
        }
    }, [value, onWordCountChange]);

    // Emit block changes to parent as markdown
    function commitBlocks(newBlocks: GutenbergBlock[]) {
        setBlocks(newBlocks);
        const md = blocksToMarkdown(newBlocks);
        setRawCode(md);
        isInternalUpdate.current = true;
        onChange(md);
    }

    // Switch to code editor
    function handleSwitchToCode() {
        const md = blocksToMarkdown(blocks);
        setRawCode(md);
        setEditorMode('code');
    }

    // Switch to visual block editor
    function handleSwitchToVisual() {
        const parsed = markdownToBlocks(rawCode);
        setBlocks(parsed);
        setEditorMode('visual');
        isInternalUpdate.current = true;
        onChange(rawCode);
    }

    // Code textarea change
    function handleRawCodeChange(val: string) {
        setRawCode(val);
        isInternalUpdate.current = true;
        onChange(val);
    }

    // Update single block
    function updateBlock(id: string, updates: Partial<GutenbergBlock>) {
        const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
        commitBlocks(updated);
    }

    // Apply inline markdown format (bold, italic, link, code) to active block
    function applyInlineFormat(blockId: string, format: 'bold' | 'italic' | 'link' | 'code') {
        const textarea = document.querySelector(`textarea[data-block-id="${blockId}"]`) as HTMLTextAreaElement | null;
        const input = document.querySelector(`input[data-block-id="${blockId}"]`) as HTMLInputElement | null;
        const el = textarea || input;

        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        if (!el) {
            let addition = '';
            if (format === 'bold') addition = ' **teks tebal** ';
            if (format === 'italic') addition = ' *teks miring* ';
            if (format === 'link') addition = ' [Teks Tautan](https://) ';
            if (format === 'code') addition = ' `kode` ';
            updateBlock(blockId, { content: (block.content || '') + addition });
            return;
        }

        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const val = el.value || '';
        const selected = val.substring(start, end);

        let replacement = '';
        let newCursorPos = start;

        if (format === 'bold') {
            replacement = selected ? `**${selected}**` : `**teks tebal**`;
            newCursorPos = selected ? end + 4 : start + 14;
        } else if (format === 'italic') {
            replacement = selected ? `*${selected}*` : `*teks miring*`;
            newCursorPos = selected ? end + 2 : start + 13;
        } else if (format === 'link') {
            const defaultUrl = 'https://';
            const url = window.prompt('Masukkan URL / link tujuan:', defaultUrl);
            if (url === null) return;
            const cleanUrl = url.trim() || 'https://';
            replacement = selected ? `[${selected}](${cleanUrl})` : `[Teks Tautan](${cleanUrl})`;
            newCursorPos = start + replacement.length;
        } else if (format === 'code') {
            replacement = selected ? `\`${selected}\`` : `\`kode\``;
            newCursorPos = selected ? end + 2 : start + 7;
        }

        const newVal = val.substring(0, start) + replacement + val.substring(end);
        updateBlock(blockId, { content: newVal });

        setTimeout(() => {
            el.focus();
            el.setSelectionRange(newCursorPos, newCursorPos);
        }, 30);
    }

    // Add new block
    function insertBlock(type: BlockType, atIndex?: number, extra?: Partial<GutenbergBlock>) {
        const newBlock: GutenbergBlock = {
            id: generateId(),
            type,
            content: '',
            level: 2,
            listType: 'unordered',
            items: [''],
            calloutType: 'info',
            ...extra,
        };

        const target = atIndex !== undefined && atIndex !== null ? atIndex : blocks.length;
        const newBlocks = [...blocks.slice(0, target), newBlock, ...blocks.slice(target)];
        commitBlocks(newBlocks);
        setActiveBlockId(newBlock.id);
        setInserterOpen(false);
        setSlashMenuIndex(null);
    }

    // Delete block
    function deleteBlock(id: string) {
        if (blocks.length <= 1) {
            // Keep at least one empty paragraph block
            commitBlocks([{ id: generateId(), type: 'paragraph', content: '' }]);
            return;
        }
        const newBlocks = blocks.filter((b) => b.id !== id);
        commitBlocks(newBlocks);
        if (activeBlockId === id) {
            setActiveBlockId(null);
        }
    }

    // Duplicate block
    function duplicateBlock(id: string) {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const source = blocks[idx];
        const clone: GutenbergBlock = {
            ...source,
            id: generateId(),
        };
        const newBlocks = [...blocks.slice(0, idx + 1), clone, ...blocks.slice(idx + 1)];
        commitBlocks(newBlocks);
        setActiveBlockId(clone.id);
    }

    // Move block up
    function moveBlockUp(index: number) {
        if (index <= 0) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index - 1];
        newBlocks[index - 1] = newBlocks[index];
        newBlocks[index] = temp;
        commitBlocks(newBlocks);
    }

    // Move block down
    function moveBlockDown(index: number) {
        if (index >= blocks.length - 1) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index + 1];
        newBlocks[index + 1] = newBlocks[index];
        newBlocks[index] = temp;
        commitBlocks(newBlocks);
    }

    // Transform block type
    function transformBlockType(id: string, newType: BlockType) {
        const block = blocks.find((b) => b.id === id);
        if (!block) return;

        const baseContent = block.content || '';
        const updates: Partial<GutenbergBlock> = { type: newType };

        if (newType === 'heading') {
            updates.level = 2;
            updates.content = baseContent;
        } else if (newType === 'list') {
            updates.listType = 'unordered';
            updates.items = baseContent ? baseContent.split('\n').filter(Boolean) : [''];
        } else if (newType === 'callout') {
            updates.calloutType = 'info';
            updates.calloutTitle = 'Field Note';
            updates.content = baseContent;
        } else if (newType === 'route') {
            updates.routeName = baseContent || 'New Overland Route';
            updates.routeDistance = '120 km';
            updates.routeElevation = '1,800 m';
            updates.routeTerrain = 'Paved & Gravel';
            updates.routeSeason = 'May - October';
            updates.routeHighlights = 'Mountain passes, glacial river valleys';
        }

        updateBlock(id, updates);
    }

    // Catalog of available Gutenberg blocks
    const blockCatalog = [
        {
            category: 'Text & Editorial',
            items: [
                {
                    type: 'paragraph' as BlockType,
                    title: 'Paragraph',
                    desc: 'Start with plain text essay, body prose, or narrative.',
                    icon: Type,
                    shortcut: '/p',
                },
                {
                    type: 'heading' as BlockType,
                    title: 'Heading (H2/H3)',
                    desc: 'Introduce new sections, geographic chapters, or waypoints.',
                    icon: Heading2,
                    shortcut: '/h2',
                    extra: { level: 2 as const },
                },
                {
                    type: 'quote' as BlockType,
                    title: 'Pullquote / Quote',
                    desc: 'Highlight an authentic traveler saying or quote.',
                    icon: Quote,
                    shortcut: '/quote',
                },
                {
                    type: 'list' as BlockType,
                    title: 'List (Bullet / Numbered)',
                    desc: 'Essential packing lists, gear notes, or checkpoints.',
                    icon: ListIcon,
                    shortcut: '/list',
                },
            ],
        },
        {
            category: 'Travel & Expeditions',
            items: [
                {
                    type: 'route' as BlockType,
                    title: 'Route Waypoint Passport',
                    desc: 'Authentic route box: Distance, Elevation, Terrain & Season.',
                    icon: Compass,
                    shortcut: '/route',
                },
                {
                    type: 'callout' as BlockType,
                    title: 'Field Notes / Dispatch Tip',
                    desc: 'Crucial insider advice, border warnings, or road tips.',
                    icon: Info,
                    shortcut: '/note',
                },
            ],
        },
        {
            category: 'Media & Structure',
            items: [
                {
                    type: 'image' as BlockType,
                    title: 'Image & Photography',
                    desc: 'Visual photography with custom captions and alt text.',
                    icon: ImageIcon,
                    shortcut: '/img',
                },
                {
                    type: 'separator' as BlockType,
                    title: 'Separator / Divider',
                    desc: 'Horizontal break line between travel diary segments.',
                    icon: Minus,
                    shortcut: '/hr',
                },
                {
                    type: 'code' as BlockType,
                    title: 'Code / Raw Snippet',
                    desc: 'GPS coordinates, raw markup, or technical notes.',
                    icon: Code,
                    shortcut: '/code',
                },
            ],
        },
    ];

    const filteredCatalog = blockCatalog
        .map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((cat) => cat.items.length > 0);

    return (
        <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all">
            {/* 1. TOP GUTENBERG MASTER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between border-b px-4 py-2.5 bg-muted/30 gap-2">
                <div className="flex items-center gap-1.5">
                    {/* + Add Block Button */}
                    <div className="relative">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-[#1C1917] hover:bg-[#292524] text-white dark:bg-white dark:text-[#1C1917] dark:hover:bg-neutral-200"
                            onClick={() => {
                                setInserterTargetIndex(blocks.length);
                                setInserterOpen(!inserterOpen);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Block</span>
                        </Button>

                        {/* Inserter Popover / Dropdown */}
                        {inserterOpen && (
                            <div className="absolute left-0 top-10 z-50 w-80 rounded-xl border bg-popover p-3 shadow-xl backdrop-blur animate-in fade-in zoom-in-95">
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Gutenberg blocks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-8 pl-8 text-xs"
                                        autoFocus
                                    />
                                </div>

                                <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs no-scrollbar">
                                    {filteredCatalog.map((category) => (
                                        <div key={category.category} className="space-y-1">
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 font-semibold">
                                                {category.category}
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {category.items.map((item) => {
                                                    const IconComponent = item.icon;
                                                    return (
                                                        <button
                                                            key={item.title}
                                                            type="button"
                                                            onClick={() => {
                                                                insertBlock(
                                                                    item.type,
                                                                    inserterTargetIndex !== null
                                                                        ? inserterTargetIndex
                                                                        : blocks.length,
                                                                    item.extra
                                                                );
                                                            }}
                                                            className="flex items-start gap-2.5 w-full p-2 rounded-lg text-left hover:bg-accent transition-colors group"
                                                        >
                                                            <div className="p-1.5 rounded-md bg-muted group-hover:bg-background border text-foreground shrink-0 mt-0.5">
                                                                <IconComponent className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-xs flex items-center justify-between">
                                                                    <span>{item.title}</span>
                                                                    <span className="font-mono text-[10px] text-muted-foreground">
                                                                        {item.shortcut}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                                    {item.desc}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Inserter Shortcut Icons */}
                    <div className="hidden sm:flex items-center border-l pl-2 ml-1 gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => insertBlock('paragraph')}
                            title="Add Paragraph"
                        >
                            <Type className="h-3.5 w-3.5 mr-1" />
                            Text
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => insertBlock('heading', undefined, { level: 2 })}
                            title="Add Heading H2"
                        >
                            <Heading2 className="h-3.5 w-3.5 mr-1" />
                            H2
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setTargetImageBlockId(null);
                                setMediaModalOpen(true);
                            }}
                            title="Add Photo from Media Library or Device"
                        >
                            <ImageIcon className="h-3.5 w-3.5 mr-1" />
                            Photo
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => insertBlock('route')}
                            title="Add Route Passport"
                        >
                            <Compass className="h-3.5 w-3.5 mr-1 text-[#C2410C]" />
                            Route
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => insertBlock('callout')}
                            title="Add Field Note"
                        >
                            <Info className="h-3.5 w-3.5 mr-1 text-sky-600" />
                            Note
                        </Button>
                    </div>
                </div>

                {/* Right Action Icons: Outline Navigator & Mode Toggle */}
                <div className="flex items-center gap-2">
                    {/* Outline / Document Structure Navigator */}
                    <Button
                        type="button"
                        variant={outlineOpen ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setOutlineOpen(!outlineOpen)}
                        title="Document Outline & Blocks Tree"
                    >
                        <Layers className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Outline ({blocks.length})</span>
                    </Button>

                    {/* Mode Toggle: Visual Gutenberg vs Code Mode */}
                    <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={handleSwitchToVisual}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${editorMode === 'visual'
                                    ? 'bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917] shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Visual Gutenberg
                        </button>
                        <button
                            type="button"
                            onClick={handleSwitchToCode}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${editorMode === 'code'
                                    ? 'bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917] shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Code (Markdown)
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. OUTLINE DRAWER (When opened) */}
            {outlineOpen && (
                <div className="border-b bg-muted/10 p-3 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b">
                        <span className="font-semibold text-xs flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[#C2410C]" />
                            Document Blocks Structure
                        </span>
                        <span className="text-[11px] text-muted-foreground">{blocks.length} blocks total</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                        {blocks.map((blk, idx) => (
                            <button
                                key={blk.id}
                                type="button"
                                onClick={() => setActiveBlockId(blk.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs whitespace-nowrap transition-all ${activeBlockId === blk.id
                                        ? 'bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917] border-transparent font-medium'
                                        : 'bg-background hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <span className="font-mono text-[10px] opacity-60">#{idx + 1}</span>
                                <span className="capitalize">{blk.type}</span>
                                {blk.type === 'heading' && <span className="text-[10px] font-bold">H{blk.level}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. EDITOR BODY */}
            {editorMode === 'code' ? (
                /* CODE / MARKDOWN MODE */
                <div className="p-4 bg-muted/10">
                    <Textarea
                        value={rawCode}
                        onChange={(e) => handleRawCodeChange(e.target.value)}
                        placeholder="Raw markdown content..."
                        className="min-h-[460px] font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 shadow-none bg-transparent"
                    />
                </div>
            ) : (
                /* VISUAL GUTENBERG BLOCKS CANVAS */
                <div className="p-4 sm:p-8 min-h-[500px] space-y-4 max-w-4xl mx-auto">
                    {blocks.map((block, index) => {
                        const isActive = activeBlockId === block.id;

                        return (
                            <div
                                key={block.id}
                                onClick={() => setActiveBlockId(block.id)}
                                className={`group relative rounded-xl transition-all duration-200 ${isActive
                                        ? 'ring-2 ring-[#C2410C]/40 bg-card p-3 shadow-sm'
                                        : 'hover:bg-muted/20 p-3'
                                    }`}
                            >
                                {/* A. GUTENBERG FLOATING BLOCK TOOLBAR */}
                                {isActive && (
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b text-xs text-muted-foreground animate-in fade-in duration-150">
                                        <div className="flex items-center gap-1">
                                            {/* Block Type Badge & Switcher */}
                                            <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[11px] font-semibold text-foreground">
                                                {block.type === 'paragraph' && <Type className="h-3 w-3" />}
                                                {block.type === 'heading' && <Heading2 className="h-3 w-3" />}
                                                {block.type === 'image' && <ImageIcon className="h-3 w-3" />}
                                                {block.type === 'quote' && <Quote className="h-3 w-3" />}
                                                {block.type === 'list' && <ListIcon className="h-3 w-3" />}
                                                {block.type === 'route' && <Compass className="h-3 w-3 text-[#C2410C]" />}
                                                {block.type === 'callout' && <Info className="h-3 w-3 text-sky-500" />}
                                                {block.type === 'separator' && <Minus className="h-3 w-3" />}
                                                {block.type === 'code' && <Code className="h-3 w-3" />}
                                                <span className="capitalize">{block.type}</span>
                                            </div>

                                            {/* Heading Level Toggles if heading */}
                                            {block.type === 'heading' && (
                                                <div className="flex items-center gap-0.5 border rounded-md p-0.5 ml-1">
                                                    {([2, 3, 4] as const).map((lvl) => (
                                                        <button
                                                            key={lvl}
                                                            type="button"
                                                            onClick={() => updateBlock(block.id, { level: lvl })}
                                                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${block.level === lvl
                                                                    ? 'bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917]'
                                                                    : 'hover:bg-muted'
                                                                }`}
                                                        >
                                                            H{lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Transform Quick Buttons */}
                                            <div className="hidden sm:flex items-center gap-1 ml-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        transformBlockType(
                                                            block.id,
                                                            block.type === 'heading' ? 'paragraph' : 'heading'
                                                        )
                                                    }
                                                    className="px-2 py-0.5 rounded hover:bg-muted text-[11px]"
                                                >
                                                    Turn to {block.type === 'heading' ? 'Paragraph' : 'Heading'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        transformBlockType(
                                                            block.id,
                                                            block.type === 'quote' ? 'paragraph' : 'quote'
                                                        )
                                                    }
                                                    className="px-2 py-0.5 rounded hover:bg-muted text-[11px]"
                                                >
                                                    Quote
                                                </button>
                                            </div>

                                            {/* Text Formatting Toolbar: Bold (**), Italic (*), Link ([text](url)), Code (`) */}
                                            {['paragraph', 'heading', 'quote', 'callout', 'list'].includes(block.type) && (
                                                <div className="flex items-center gap-0.5 border rounded-md p-0.5 ml-1 bg-background shadow-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => applyInlineFormat(block.id, 'bold')}
                                                        className="px-1.5 py-0.5 rounded hover:bg-muted text-foreground transition-colors text-xs font-bold flex items-center gap-1"
                                                        title="Bold (**teks**) — Ctrl+B"
                                                    >
                                                        <Bold className="h-3 w-3" />
                                                        <span className="hidden sm:inline text-[10px]">Bold</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyInlineFormat(block.id, 'italic')}
                                                        className="px-1.5 py-0.5 rounded hover:bg-muted text-foreground transition-colors text-xs italic flex items-center gap-1"
                                                        title="Italic (*teks*) — Ctrl+I"
                                                    >
                                                        <Italic className="h-3 w-3" />
                                                        <span className="hidden sm:inline text-[10px]">Italic</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyInlineFormat(block.id, 'link')}
                                                        className="px-1.5 py-0.5 rounded hover:bg-muted text-[#C2410C] transition-colors text-xs flex items-center gap-1 font-medium"
                                                        title="Insert Link ([teks](url)) — Ctrl+K"
                                                    >
                                                        <LinkIcon className="h-3 w-3" />
                                                        <span className="hidden sm:inline text-[10px]">Link</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => applyInlineFormat(block.id, 'code')}
                                                        className="px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
                                                        title="Inline Code (`kode`)"
                                                    >
                                                        <Code className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Block Navigation: Move Up, Move Down, Duplicate, Delete */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                disabled={index === 0}
                                                onClick={() => moveBlockUp(index)}
                                                title="Move block up"
                                            >
                                                <ChevronUp className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                disabled={index === blocks.length - 1}
                                                onClick={() => moveBlockDown(index)}
                                                title="Move block down"
                                            >
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                onClick={() => duplicateBlock(block.id)}
                                                title="Duplicate block"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                onClick={() => deleteBlock(block.id)}
                                                title="Delete block"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* B. BLOCK CONTENT RENDERERS */}
                                <div className="w-full">
                                    {/* 1. PARAGRAPH BLOCK */}
                                    {block.type === 'paragraph' && (
                                        <div className="relative">
                                            <Textarea
                                                data-block-id={block.id}
                                                value={block.content || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Trigger slash command if typed at start
                                                    if (val === '/') {
                                                        setSlashMenuIndex(index);
                                                    } else if (slashMenuIndex === index && !val.startsWith('/')) {
                                                        setSlashMenuIndex(null);
                                                    }
                                                    updateBlock(block.id, { content: val });
                                                }}
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'bold');
                                                        return;
                                                    }
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'italic');
                                                        return;
                                                    }
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'link');
                                                        return;
                                                    }
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        insertBlock('paragraph', index + 1);
                                                    }
                                                }}
                                                placeholder={placeholder}
                                                rows={Math.max(2, (block.content || '').split('\n').length)}
                                                className="w-full resize-none border-0 bg-transparent p-0 font-serif text-base leading-relaxed text-foreground focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                                            />

                                            {/* Live Formatted Markdown Preview Helper */}
                                            {block.content && (block.content.includes('**') || block.content.includes('[') || block.content.includes('`')) && (
                                                <div className="mt-1 pt-1.5 border-t border-dashed border-border/60 text-xs text-muted-foreground/80 flex items-center gap-1.5 font-sans">
                                                    <span className="font-mono text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-muted/60 text-muted-foreground font-semibold">
                                                        Preview:
                                                    </span>
                                                    <span className="font-serif text-sm text-foreground">
                                                        {renderInlineMarkdown(block.content)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quick Slash Menu Popover */}
                                            {slashMenuIndex === index && (
                                                <div className="absolute left-0 top-8 z-50 w-64 rounded-xl border bg-popover p-2 shadow-xl animate-in fade-in">
                                                    <div className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1">
                                                        Change Block To:
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            transformBlockType(block.id, 'heading');
                                                            setSlashMenuIndex(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-accent text-xs"
                                                    >
                                                        <Heading2 className="h-4 w-4" /> Heading H2
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            transformBlockType(block.id, 'image');
                                                            setSlashMenuIndex(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-accent text-xs"
                                                    >
                                                        <ImageIcon className="h-4 w-4" /> Image / Photography
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            transformBlockType(block.id, 'route');
                                                            setSlashMenuIndex(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-accent text-xs"
                                                    >
                                                        <Compass className="h-4 w-4 text-[#C2410C]" /> Travel Route Box
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            transformBlockType(block.id, 'callout');
                                                            setSlashMenuIndex(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-accent text-xs"
                                                    >
                                                        <Info className="h-4 w-4 text-sky-500" /> Field Note
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. HEADING BLOCK */}
                                    {block.type === 'heading' && (
                                        <div className="w-full">
                                            <Input
                                                data-block-id={block.id}
                                                value={block.content || ''}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'bold');
                                                        return;
                                                    }
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'link');
                                                        return;
                                                    }
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        insertBlock('paragraph', index + 1);
                                                    }
                                                }}
                                                placeholder={`Heading ${block.level || 2}...`}
                                                className={`w-full border-0 bg-transparent p-0 font-serif font-bold tracking-tight focus-visible:ring-0 shadow-none text-foreground ${block.level === 3
                                                        ? 'text-xl sm:text-2xl'
                                                        : block.level === 4
                                                            ? 'text-lg sm:text-xl'
                                                            : 'text-2xl sm:text-3xl'
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    {/* 3. IMAGE BLOCK */}
                                    {block.type === 'image' && (
                                        <div className="w-full space-y-3 rounded-xl border bg-muted/10 p-4">
                                            {block.url ? (
                                                <div className="relative rounded-lg overflow-hidden border bg-background aspect-[16/9] max-h-80 flex items-center justify-center group/img">
                                                    <img
                                                        src={block.url}
                                                        alt={block.alt || 'Travel Photography'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => openMediaLibraryForBlock(block.id)}
                                                            className="h-7 text-xs bg-background/90 backdrop-blur shadow"
                                                        >
                                                            <ImageIcon className="h-3.5 w-3.5 mr-1" />
                                                            Replace from Media Library
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => updateBlock(block.id, { url: '', caption: '', alt: '' })}
                                                            className="h-7 text-xs shadow"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E7E5E4] dark:border-[#262422] rounded-xl p-6 text-center text-muted-foreground space-y-3 bg-card/60">
                                                    <div className="p-3 rounded-full bg-muted text-[#C2410C]">
                                                        <ImageIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-semibold block text-foreground">
                                                            Add Travel Photography
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground block">
                                                            Upload image from device, choose from Media Library, or paste web image link.
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => openMediaLibraryForBlock(block.id)}
                                                            className="h-8 text-xs bg-[#1C1917] hover:bg-[#292524] text-white dark:bg-white dark:text-[#1C1917]"
                                                        >
                                                            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                                                            Media Library / Upload
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                                <div className="sm:col-span-7 flex gap-1.5">
                                                    <Input
                                                        placeholder="Image URL (https://... or /storage/...)"
                                                        value={block.url || ''}
                                                        onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                                        className="h-8 text-xs font-mono flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openMediaLibraryForBlock(block.id)}
                                                        className="h-8 text-xs px-2.5 shrink-0"
                                                        title="Choose or upload to Media Library"
                                                    >
                                                        <ImageIcon className="h-3.5 w-3.5 mr-1" />
                                                        Media
                                                    </Button>
                                                </div>
                                                <div className="sm:col-span-5">
                                                    <Input
                                                        placeholder="Caption (e.g. Morning mist over Hunza Valley...)"
                                                        value={block.caption || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, {
                                                                caption: e.target.value,
                                                                alt: e.target.value,
                                                            })
                                                        }
                                                        className="h-8 text-xs font-serif italic"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. QUOTE BLOCK */}
                                    {block.type === 'quote' && (
                                        <div className="border-l-4 border-[#C2410C] pl-4 py-2 space-y-2 bg-muted/10 rounded-r-lg">
                                            <Textarea
                                                data-block-id={block.id}
                                                value={block.content || ''}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'bold');
                                                        return;
                                                    }
                                                    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                                                        e.preventDefault();
                                                        applyInlineFormat(block.id, 'link');
                                                        return;
                                                    }
                                                }}
                                                placeholder="Write pull-quote or authentic traveler reflection..."
                                                rows={2}
                                                className="w-full resize-none border-0 bg-transparent p-0 font-serif italic text-lg leading-relaxed focus-visible:ring-0 shadow-none text-foreground"
                                            />
                                            <Input
                                                value={block.citation || ''}
                                                onChange={(e) => updateBlock(block.id, { citation: e.target.value })}
                                                placeholder="— Citation / Traveler Name"
                                                className="h-7 text-xs border-0 bg-transparent p-0 text-muted-foreground font-serif focus-visible:ring-0"
                                            />
                                        </div>
                                    )}

                                    {/* 5. LIST BLOCK */}
                                    {block.type === 'list' && (
                                        <div className="space-y-2 pl-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    variant="outline"
                                                    onClick={() =>
                                                        updateBlock(block.id, {
                                                            listType:
                                                                block.listType === 'ordered'
                                                                    ? 'unordered'
                                                                    : 'ordered',
                                                        })
                                                    }
                                                    className="cursor-pointer text-[10px]"
                                                >
                                                    {block.listType === 'ordered' ? 'Numbered (1, 2, 3)' : 'Bullet Points (•)'} (Click to switch)
                                                </Badge>
                                            </div>
                                            {(block.items || ['']).map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-muted-foreground w-4 text-right">
                                                        {block.listType === 'ordered' ? `${itemIdx + 1}.` : '•'}
                                                    </span>
                                                    <Input
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...(block.items || [''])];
                                                            newItems[itemIdx] = e.target.value;
                                                            updateBlock(block.id, { items: newItems });
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const newItems = [...(block.items || [''])];
                                                                newItems.splice(itemIdx + 1, 0, '');
                                                                updateBlock(block.id, { items: newItems });
                                                            } else if (
                                                                e.key === 'Backspace' &&
                                                                !item &&
                                                                (block.items || []).length > 1
                                                            ) {
                                                                e.preventDefault();
                                                                const newItems = [...(block.items || [''])];
                                                                newItems.splice(itemIdx, 1);
                                                                updateBlock(block.id, { items: newItems });
                                                            }
                                                        }}
                                                        placeholder="List checkpoint or gear item..."
                                                        className="h-8 border-0 bg-transparent p-0 font-serif text-sm focus-visible:ring-0 shadow-none text-foreground"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 6. CALLOUT / FIELD NOTE BLOCK */}
                                    {block.type === 'callout' && (
                                        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-sky-600" />
                                                    <Input
                                                        value={block.calloutTitle || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, { calloutTitle: e.target.value })
                                                        }
                                                        placeholder="Field Note Headline..."
                                                        className="h-7 text-xs font-bold border-0 bg-transparent p-0 text-sky-950 dark:text-sky-200 focus-visible:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {(['info', 'tip', 'warning'] as const).map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => updateBlock(block.id, { calloutType: t })}
                                                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${block.calloutType === t
                                                                    ? 'bg-sky-600 text-white'
                                                                    : 'text-muted-foreground hover:bg-muted'
                                                                }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <Textarea
                                                value={block.content || ''}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                placeholder="Crucial field advice, border permit requirement, mountain pass conditions..."
                                                rows={2}
                                                className="w-full resize-none border-0 bg-transparent p-0 font-serif text-xs leading-relaxed text-foreground focus-visible:ring-0 shadow-none"
                                            />
                                        </div>
                                    )}

                                    {/* 7. TRAVEL ROUTE WAYPOINT PASSPORT BLOCK */}
                                    {block.type === 'route' && (
                                        <div className="rounded-xl border border-[#C2410C]/30 bg-[#FAF7F2] dark:bg-[#181716] p-4 space-y-3">
                                            <div className="flex items-center gap-2 border-b border-[#C2410C]/20 pb-2">
                                                <Compass className="h-4 w-4 text-[#C2410C]" />
                                                <Input
                                                    value={block.routeName || ''}
                                                    onChange={(e) =>
                                                        updateBlock(block.id, { routeName: e.target.value })
                                                    }
                                                    placeholder="Route Name (e.g. Karakoram Highway Overland Segment 01)..."
                                                    className="h-7 font-serif font-bold text-sm border-0 bg-transparent p-0 text-[#1C1917] dark:text-white focus-visible:ring-0"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                <div className="space-y-1">
                                                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                                                        Distance
                                                    </span>
                                                    <Input
                                                        value={block.routeDistance || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, { routeDistance: e.target.value })
                                                        }
                                                        placeholder="e.g. 1,300 km"
                                                        className="h-7 text-xs font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                                                        Max Elevation
                                                    </span>
                                                    <Input
                                                        value={block.routeElevation || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, { routeElevation: e.target.value })
                                                        }
                                                        placeholder="e.g. 4,693 m"
                                                        className="h-7 text-xs font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                                                        Terrain
                                                    </span>
                                                    <Input
                                                        value={block.routeTerrain || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, { routeTerrain: e.target.value })
                                                        }
                                                        placeholder="e.g. High Asphalt / Gravel"
                                                        className="h-7 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                                                        Best Season
                                                    </span>
                                                    <Input
                                                        value={block.routeSeason || ''}
                                                        onChange={(e) =>
                                                            updateBlock(block.id, { routeSeason: e.target.value })
                                                        }
                                                        placeholder="e.g. May - October"
                                                        className="h-7 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                                                    Key Waypoints / Highlights
                                                </span>
                                                <Input
                                                    value={block.routeHighlights || ''}
                                                    onChange={(e) =>
                                                        updateBlock(block.id, { routeHighlights: e.target.value })
                                                    }
                                                    placeholder="e.g. Gilgit, Hunza Valley, Passu Cones, Khunjerab Border..."
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 8. SEPARATOR BLOCK */}
                                    {block.type === 'separator' && (
                                        <div className="py-4 flex items-center justify-center">
                                            <div className="w-24 border-t-2 border-dashed border-[#C2410C]/40" />
                                        </div>
                                    )}

                                    {/* 9. CODE BLOCK */}
                                    {block.type === 'code' && (
                                        <div className="rounded-lg border bg-muted/40 p-3">
                                            <Textarea
                                                value={block.content || ''}
                                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                                placeholder="// Raw coordinates, GPX data, or code..."
                                                rows={3}
                                                className="w-full resize-none border-0 bg-transparent p-0 font-mono text-xs text-foreground focus-visible:ring-0 shadow-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* C. INLINE + INSERTER BETWEEN BLOCKS (visible on hover) */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -mb-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            insertBlock('paragraph', index + 1);
                                        }}
                                        className="h-5 w-5 rounded-full bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917] flex items-center justify-center shadow hover:scale-110 transition-transform"
                                        title="Add block below"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Bottom Append Block Button */}
                    <div className="pt-6 border-t flex flex-col items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs rounded-full border-dashed"
                            onClick={() => insertBlock('paragraph', blocks.length)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add New Paragraph Block</span>
                        </Button>
                        <span className="text-[11px] text-muted-foreground font-serif italic">
                            Press Enter inside any block to create a new one, or type &apos;/&apos; to switch block types.
                        </span>
                    </div>
                </div>
            )}

            {/* 4. FOOTER STATUS BAR */}
            <div className="flex flex-wrap items-center justify-between border-t px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>
                        Blocks: <strong className="text-foreground">{blocks.length}</strong>
                    </span>
                    <span>
                        Words: <strong className="text-foreground">{value.trim().split(/\s+/).filter(Boolean).length}</strong>
                    </span>
                    <span>
                        Headings:{' '}
                        <strong className="text-foreground">
                            {blocks.filter((b) => b.type === 'heading').length}
                        </strong>
                    </span>
                </div>
                <div className="font-mono text-[11px]">
                    The Kelana Club Gutenberg Block Engine
                </div>
            </div>

            {/* WordPress-Grade Media Library Modal */}
            <MediaLibraryModal
                open={mediaModalOpen}
                onOpenChange={setMediaModalOpen}
                onSelect={handleMediaSelect}
                title="Select Photography for Gutenberg Block"
                selectButtonText="Insert into Post"
            />
        </div>
    );
}
