import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ExternalLink,
    MessageSquare,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';

interface CommentItem {
    id: number;
    author_name: string;
    author_email: string;
    content: string;
    status: string;
    created_at: string;
    post?: {
        id: number;
        title: string;
        slug: string;
    };
}

interface Props {
    comments: {
        data: CommentItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    currentStatus?: string;
}

export default function CommentsIndex({ comments, currentStatus }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<CommentItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    function filterStatus(status: string | null) {
        router.get('/admin/comments', { status: status || undefined }, { preserveState: true });
    }

    function updateStatus(id: number, status: string) {
        router.patch(`/admin/comments/${id}/status`, { status });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/comments/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Comments', href: '/admin/comments' },
            ]}
        >
            <Head title="Reader Comments & Moderation — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Reader Commentary & Discussion
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review and moderate commentary submitted by your readership community.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={!currentStatus ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => filterStatus(null)}
                        >
                            All ({comments.total})
                        </Button>
                        <Button
                            variant={currentStatus === 'approved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => filterStatus('approved')}
                        >
                            Approved
                        </Button>
                        <Button
                            variant={currentStatus === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => filterStatus('pending')}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={currentStatus === 'spam' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => filterStatus('spam')}
                        >
                            Spam
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                                    <tr>
                                        <th className="py-2.5 px-4">Author</th>
                                        <th className="py-2.5 px-4">Comment</th>
                                        <th className="py-2.5 px-4">Article</th>
                                        <th className="py-2.5 px-4">Status</th>
                                        <th className="py-2.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {comments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No comments found in this view.
                                            </td>
                                        </tr>
                                    ) : (
                                        comments.data.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="py-3 px-4 shrink-0">
                                                    <div className="font-semibold text-foreground">{c.author_name}</div>
                                                    <div className="text-muted-foreground font-mono text-[11px]">
                                                        {c.author_email}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 max-w-md">
                                                    <p className="text-foreground line-clamp-2 leading-relaxed">
                                                        {c.content}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-4 max-w-xs">
                                                    {c.post ? (
                                                        <Link
                                                            href={`/article/${c.post.slug}`}
                                                            target="_blank"
                                                            className="text-foreground font-medium hover:underline flex items-center gap-1 line-clamp-1"
                                                        >
                                                            {c.post.title}
                                                            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={
                                                            c.status === 'approved'
                                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                                : c.status === 'pending'
                                                                ? 'bg-amber-500/10 text-amber-600'
                                                                : 'bg-red-500/10 text-red-600'
                                                        }
                                                    >
                                                        {c.status}
                                                    </Badge>
                                                </td>

                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {c.status !== 'approved' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-emerald-600"
                                                                onClick={() => updateStatus(c.id, 'approved')}
                                                            >
                                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                                                            </Button>
                                                        )}
                                                        {c.status !== 'spam' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-amber-600"
                                                                onClick={() => updateStatus(c.id, 'spam')}
                                                            >
                                                                <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Spam
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-600"
                                                            onClick={() => setDeleteTarget(c)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete Reader Comment?"
                description={
                    deleteTarget ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to permanently delete comment from{' '}
                                <strong className="text-foreground font-semibold">"{deleteTarget.author_name}"</strong>?
                            </p>
                            <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded border">
                                "{deleteTarget.content.slice(0, 120)}..."
                            </p>
                        </div>
                    ) : null
                }
                confirmText="Delete Comment"
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
